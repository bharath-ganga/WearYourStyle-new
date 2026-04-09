import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

const generateAccessAndRefreshToken = async (user) => {
  try {
    const accessToken = User.generateAccessToken(user);
    const refreshToken = User.generateRefreshToken(user);

    // Save refreshToken to Firestore
    await User.update(user.id, { refreshToken });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
};

const validatePassword = (password) => {
  const minLength = 8;
  const maxLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[@#$%^&+=!]/.test(password);
  const noSpaces = !/\s/.test(password);
  const notCommon = !["password", "123456", "qwerty"].includes(password.toLowerCase());

  if (password.length < minLength || password.length > maxLength) return "Password must be 8-12 characters.";
  if (!hasUpperCase) return "Password must have at least one uppercase letter.";
  if (!hasLowerCase) return "Password must have at least one lowercase letter.";
  if (!hasNumber) return "Password must have at least one number.";
  if (!hasSpecialChar) return "Password must have at least one special character (@, #, $, %, etc.).";
  if (!noSpaces) return "Password should not contain spaces.";
  if (!notCommon) return "Password is too common.";

  return null;
};

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, password, email, phoneNumber, address, role } = req.body;

  if (!firstName || !lastName || !email || !password || !phoneNumber) {
    throw new ApiError(400, "All fields (First Name, Last Name, Email, Password, and Phone) are mandatory");
  }

  if (!email.includes("@")) {
    throw new ApiError(400, "Invalid Email address");
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    throw new ApiError(400, passwordError);
  }

  const existedUser = await User.findByEmail(email);
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    firstName,
    lastName,
    password,
    email,
    phoneNumber,
    address: address || "",
    role: role || "customer",
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  const createdUser = User.sanitizeUser(user);

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findByEmail(email);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await User.isPasswordCorrect(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);

  const loggedInUser = User.sanitizeUser(user);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      token: accessToken,
      data: {
        user: loggedInUser,
      },
      message: "User Logged In successfully"
    });
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.update(req.user.id, { refreshToken: null });

  const options = { httpOnly: true, secure: true };

  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);

  return res.status(200).json(new ApiResponse(200, {}, "User Logged Out"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.getAll();
  const safeUsers = users.map(User.sanitizeUser);
  res.json(new ApiResponse(200, safeUsers, "Users fetched successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = User.sanitizeUser(req.user);
  // Ensure we have an addresses array for the frontend
  user.addresses = user.addresses || [];
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User profile fetched successfully"));
});

export { registerUser, loginUser, logoutUser, getAllUsers, getCurrentUser };
