import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Internal server error", 500);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  console.log("email: ", email);

  if ([fullname, email, username, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required", 400);
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists", 400);
  }

  const avatarLocalPath = req.files?.avatar ? req.files.avatar[0]?.path : "";
  const coverImageLocalPath = req.files?.coverImage ? req.files.coverImage[0]?.path : "";

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required", 400);
  }

  const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!uploadedAvatar) {
    throw new ApiError(400, "Avatar image upload failed", 400);
  }

  const newUser = await User.create({
    fullname,
    avatar: uploadedAvatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "oops! something went wrong", 500);
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!email && !username) {
    throw new ApiError(400, "Email or username is required", 400);
  }

  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(404, "User not found", 404);
  }

  const isPasswordValid = await user.isPasswordMatch(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password", 401);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "user logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required", 401);
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(403, "Invalid refresh token", 403);
  }

  const user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(403, "Invalid refresh token", 403);
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token is expired", 403);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { accessToken, refreshToken }, "Tokens refreshed successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword  } = req.body;
  

const user = await User.findById(req.user._id);
const isPasswordCorrect = await user.isPasswordMatch(oldPassword);
if (!isPasswordCorrect) {
  throw new ApiError(401, "Invalid old password", 401);
}
user.password = newPassword;
await user.save({ validateBeforeSave: false });
return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
});


const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found", 404);
  }
  return res.status(200).json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email, username, fullname } = req.body;

  const user = await User.findByIdAndUpdate(req.user._id, {$set: {fullName , email: email}}, {new : true}).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found", 404);
  }

  user.email = email || user.email;
  user.username = username || user.username;
  user.fullname = fullname || user.fullname;

  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required", 400);
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if(!avatar.url) {
    throw new ApiError(400, "Failed to upload avatar", 400);
  }

  const user = await User.findByIdAndUpdate(req.user._id, { $set: { avatar: avatar.url } }, { new: true }).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found", 404);
  }

  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, user, "User avatar updated successfully"));
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is required", 400);
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!coverImage.url) {
    throw new ApiError(400, "Failed to upload cover image", 400);
  }

  const user = await User.findByIdAndUpdate(req.user._id, { $set: { coverImage: coverImage.url } }, { new: true }).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found", 404);
  }

  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, user, "User cover image updated successfully"));
});


export { registerUser, loginUser, logoutUser, refreshAccessToken , changeCurrentPassword , getCurrentUser , updateAccountDetails , updateUserAvatar , updateUserCoverImage };
