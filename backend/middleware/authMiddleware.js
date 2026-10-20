import jwt from "jsonwebtoken"
import User from "../models/User.js"
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"

export const protect = asyncHandler(async (req, res, next) => {
  // read token from cookie
  const token = req.cookies.token

  if (!token) {
    throw new ApiError(401, "Not authorized, no token provided")
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  const user = await User.findById(decoded.userId).select("-password")
  if (!user) {
    throw new ApiError(401, "User no longer exists")
  }

  req.user = user
  next()
})