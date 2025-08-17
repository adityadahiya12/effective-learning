import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import { User } from "../models/user.model.js"; // Assuming you have a User model defined
import {uploadOnCloudinary} from "../utils/cloudinary.js"; // Assuming you have a utility for uploading to Cloudinary
import {ApiError} from "../util/ApiError.js";

const registerUser = asyncHandler(async (req, res) => {


    // step behind the login of the user 
   
    // get user details from frontend 
    // validation - not empty 
    // check if user already exists : username , email
    // check for image and avatar
    // create user object - create entry in the db
    // remove password from user object
    // check for user creation
    // return response

    const { fullname , email , username , password } = req.body
    console.log("email: ", email);

    if ([fullname, email, username, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required", 400);
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists", 400);
    }

    const avatarLocalPath = req.files && req.files.avatar ? req.files.avatar[0]?.path : "";
    const coverImageLocalPath = req.files && req.files.coverImage ? req.files.coverImage[0]?.path : "";

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required", 400);
    }

    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!uploadedAvatar) {
        throw new ApiError(400, "Avatar image upload failed", 400);
    }
  User.create({
    fullName,
    avatar: uploadedAvatar.url,
    coverImage: coverImage.url || "",
    email,
    password ,
    username: username.toLowerCase(),
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
    if (!createdUser) {
        throw new ApiError(500, "oops! something went wrong", 500);
    }
    return res.status(201).json({
        new ApiResponse(200, createdUser, "User registered successfully")
    });
});

export { registerUser };