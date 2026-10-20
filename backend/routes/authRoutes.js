import express from "express"
import { register, login, logout } from "../controllers/authController.js"
import { protect } from "../middleware/authMiddleware.js"
import allowRoles from "../middleware/roleMiddleware.js"
import ApiResponse from "../utils/ApiResponse.js"

const router = express.Router()

// Public routes
router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)

// Protected routes
router.get("/me", protect, (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { user: req.user }, "You are logged in!")
  )
})

// Role protected route
router.get("/farmer-only", protect, allowRoles("farmer"), (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { user: req.user }, "Welcome farmer!")
  )
})

export default router