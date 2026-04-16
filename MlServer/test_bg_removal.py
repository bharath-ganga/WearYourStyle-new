import cv2
import numpy as np
from PIL import Image

def remove_background(image):
    if image.shape[2] == 3:
        b, g, r = cv2.split(image)
        alpha = np.ones(b.shape, dtype=b.dtype) * 255
        image = cv2.merge((b, g, r, alpha))
        
    h, w = image.shape[:2]
    mask = np.zeros((h+2, w+2), np.uint8)
    fill_img = image[:,:,:3].copy()
    
    # FloodFill tolerance
    diff = (10, 10, 10)
    
    # FloodFill from the top-left corner
    cv2.floodFill(fill_img, mask, (0,0), (255, 255, 255), diff, diff, cv2.FLOODFILL_MASK_ONLY)
    cv2.floodFill(fill_img, mask, (w-1,0), (255, 255, 255), diff, diff, cv2.FLOODFILL_MASK_ONLY)
    cv2.floodFill(fill_img, mask, (0,h-1), (255, 255, 255), diff, diff, cv2.FLOODFILL_MASK_ONLY)
    cv2.floodFill(fill_img, mask, (w-1,h-1), (255, 255, 255), diff, diff, cv2.FLOODFILL_MASK_ONLY)
    
    bg_mask = mask[1:h+1, 1:w+1]
    
    # Soften edges
    kernel = np.ones((7,7), np.uint8)
    bg_mask = cv2.dilate(bg_mask, kernel, iterations=1)
    
    image[:, :, 3] = np.where(bg_mask == 1, 0, 255).astype(np.uint8)
    
    return image

pill_img = Image.open(r'c:\Users\bhara\Desktop\WearYourStyle\Client\public\product_images\womens\6_nyrika_blue_women_floral_print_fit_&_flare_dress.avif')
cv_img = cv2.cvtColor(np.array(pill_img), cv2.COLOR_RGB2BGR)

res = remove_background(cv_img)
cv2.imwrite('test_output.png', res)
print("Finished")
