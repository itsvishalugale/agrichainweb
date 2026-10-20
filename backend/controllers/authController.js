import User from "../models/User.js"
import generateToken from "../utils/generateToken.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"

// REGISTER
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body

  if (!name || !email || !password || !role) {
    throw new ApiError(400, "All fields are required")
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(400, "Email already registered")
  }

  const user = await User.create({ name, email, password, role })

  // pass res so generateToken can set cookie
  const token = generateToken(res, user._id, user.role)

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
        // still sending token in body too
        // useful for Postman testing ✅
      },
      "User registered successfully"
    )
  )
})

// LOGIN
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new ApiError(400, "All fields are required")
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(401, "Invalid email or password")
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password")
  }

  // pass res so generateToken can set cookie
  const token = generateToken(res, user._id, user.role)

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      "Login successful"
    )
  )
})

// LOGOUT
export const logout = asyncHandler(async (req, res) => {
  // clear the cookie
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    // new Date(0) = January 1 1970
    // setting expiry to past = delete cookie immediately
  })

  res.status(200).json(
    new ApiResponse(200, {}, "Logged out successfully")
  )
})