
import { ApiError } from "../utils/ApiError.js";

import User from "../models/user.models.js";



import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
   try {
       const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
       if (!token) {
           throw new ApiError("Invalid Access Token", 401);
       }
       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
       const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
       if (!user) {
           throw new ApiError("Invalid Access Token", 401);
       }
       req.user = user;
       next();
   } catch (error) {
       throw new ApiError("Invalid Access Token", 401);
   }
});