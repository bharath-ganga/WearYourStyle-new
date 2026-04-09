import os
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import base64
import requests

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# MediaPipe Initialization
model_dir = os.path.dirname(__file__)
pose_model_path = os.path.join(model_dir, "pose_landmarker.task")
classifier_model_path = os.path.join(model_dir, "classifier.tflite")

# Download classifier model if not exists (EfficientNet Lite0)
if not os.path.exists(classifier_model_path):
    print("Downloading image classifier model...")
    url = "https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/float32/1/efficientnet_lite0.tflite"
    r = requests.get(url)
    with open(classifier_model_path, "wb") as f:
        f.write(r.content)

# Pose Detector
pose_base_options = python.BaseOptions(model_asset_path=pose_model_path)
pose_options = vision.PoseLandmarkerOptions(
    base_options=pose_base_options,
    output_segmentation_masks=False)
detector = vision.PoseLandmarker.create_from_options(pose_options)

# Image Classifier
classifier_base_options = python.BaseOptions(model_asset_path=classifier_model_path)
classifier_options = vision.ImageClassifierOptions(
    base_options=classifier_base_options,
    max_results=5)
classifier = vision.ImageClassifier.create_from_options(classifier_options)

def get_color_name(hsv_color):
    h, s, v = hsv_color
    if v < 40: return "Black"
    if v > 200 and s < 40: return "White"
    if s < 40: return "Gray"
    
    if h < 10 or h > 170: return "Red"
    if 10 <= h < 25: return "Orange"
    if 25 <= h < 35: return "Yellow"
    if 35 <= h < 85: return "Green"
    if 85 <= h < 130: return "Blue"
    if 130 <= h < 170: return "Purple"
    return "Unknown"

@app.route('/classify', methods=['POST'])
def classify_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        np_img = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({'error': 'Invalid image'}), 400

        # Create MediaPipe Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        
        # Classify
        classification_result = classifier.classify(mp_image)
        
        top_category = "Clothing"
        confidence = 0.0
        
        if classification_result.classifications:
            categories = classification_result.classifications[0].categories
            # Filtering for clothing items (simplistic mapping for demo)
            clothing_items = ["jersey", "t-shirt", "shirt", "gown", "jean", "skirt", "suit"]
            for cat in categories:
                if any(item in cat.category_name.lower() for item in clothing_items):
                    top_category = cat.category_name.split(',')[0].capitalize()
                    confidence = cat.score
                    break
            
            if top_category == "Clothing" and categories:
                top_category = categories[0].category_name.split(',')[0].capitalize()
                confidence = categories[0].score

        # Color Detection (using center of image)
        h, w, _ = img.shape
        center_roi = img[h//3:2*h//3, w//3:2*w//3]
        avg_color_bgr = np.mean(center_roi, axis=(0, 1))
        hsv_img = cv2.cvtColor(np.uint8([[avg_color_bgr]]), cv2.COLOR_BGR2HSV)[0][0]
        color_name = get_color_name(hsv_img)

        return jsonify({
            'type': top_category,
            'color': color_name,
            'confidence': float(confidence)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def overlay_png(background, overlay, position):
# ... existing code ...
    bg_h, bg_w, bg_channels = background.shape
    overlay_h, overlay_w, overlay_channels = overlay.shape

    x, y = position

    # Ensure the overlay doesn't go out of bounds
    if x < 0: x = 0
    if y < 0: y = 0
    
    # Calculate visible region of overlay
    ov_x1 = 0
    ov_y1 = 0
    ov_x2 = overlay_w
    ov_y2 = overlay_h
    
    if x + overlay_w > bg_w:
        ov_x2 = bg_w - x
    if y + overlay_h > bg_h:
        ov_y2 = bg_h - y
        
    if ov_x2 <= 0 or ov_y2 <= 0:
        return background

    # Extract regions
    overlay_visible = overlay[ov_y1:ov_y2, ov_x1:ov_x2]
    background_roi = background[y:y+ov_y2, x:x+ov_x2]

    # Handle Alpha Channel
    if overlay_visible.shape[2] == 4:
        alpha_s = overlay_visible[:, :, 3] / 255.0
        alpha_l = 1.0 - alpha_s

        for c in range(0, 3):
            background_roi[:, :, c] = (
                alpha_s * overlay_visible[:, :, c] +
                alpha_l * background_roi[:, :, c]
            )
    else:
        # If no alpha channel, just copy the RGB
        for c in range(0, 3):
            background_roi[:, :, c] = overlay_visible[:, :, c]

    background[y:y+ov_y2, x:x+ov_x2] = background_roi
    return background

@socketio.on('process_frame')
def process_frame(data):
    try:
        # Decode the frame and shirt image from base64
        frame_data = base64.b64decode(data['frame'])
        shirt_data = base64.b64decode(data['shirt'])

        # Convert to numpy arrays
        frame = cv2.imdecode(np.frombuffer(frame_data, np.uint8), cv2.IMREAD_COLOR)
        shirt = cv2.imdecode(np.frombuffer(shirt_data, np.uint8), cv2.IMREAD_UNCHANGED)

        if frame is None or shirt is None:
            emit('error', {'message': 'Invalid frame or shirt data'})
            return

        # Convert frame to MediaPipe Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        
        # Detect pose landmarks
        detection_result = detector.detect(mp_image)

        if detection_result.pose_landmarks:
            # Indices for landmarks: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
            landmarks = detection_result.pose_landmarks[0]
            
            # Index 11: Left Shoulder, Index 12: Right Shoulder
            left_shoulder = landmarks[11]
            right_shoulder = landmarks[12]

            h, w, _ = frame.shape
            left_shoulder_x = int(left_shoulder.x * w)
            left_shoulder_y = int(left_shoulder.y * h)
            right_shoulder_x = int(right_shoulder.x * w)
            right_shoulder_y = int(right_shoulder.y * h)

            shoulder_width = abs(left_shoulder_x - right_shoulder_x)

            if shoulder_width > 0:
                # Resize shirt based on shoulder width
                shirt_width = int(shoulder_width * 2.2) # Increased scale for better fit
                shirt_height = int(shirt_width * shirt.shape[0] / shirt.shape[1])
                resized_shirt = cv2.resize(shirt, (shirt_width, shirt_height))

                # Position shirt (centered between shoulders, slightly above)
                shirt_position = (
                    int(min(left_shoulder_x, right_shoulder_x) - (shirt_width - shoulder_width) / 2),
                    int(min(left_shoulder_y, right_shoulder_y) - shirt_height // 4)
                )

                frame = overlay_png(frame, resized_shirt, shirt_position)

        # Encode the processed frame back to base64
        _, buffer = cv2.imencode('.png', frame)
        processed_frame = base64.b64encode(buffer).decode('utf-8')

        # Send the processed frame back to the client
        emit('frame_processed', {'frame': processed_frame})
    except Exception as e:
        emit('error', {'message': str(e)})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"AI ML Server starting on port {port}...")
    socketio.run(app, debug=False, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)