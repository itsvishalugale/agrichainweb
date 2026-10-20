import express from "express"
import {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  acceptPriceOffer,
} from "../controllers/chatController.js"
import { protect } from "../middleware/authMiddleware.js"
import allowRoles from "../middleware/roleMiddleware.js"

const router = express.Router()

// Start conversation (buyer only)
router.post(
  "/start",
  protect,
  allowRoles("buyer"),
  startConversation
)

// Get all my conversations (farmer + buyer)
router.get(
  "/conversations",
  protect,
  allowRoles("farmer", "buyer"),
  getMyConversations
)

// Get messages in a conversation
router.get(
  "/:conversationId/messages",
  protect,
  allowRoles("farmer", "buyer"),
  getMessages
)

// Send message
router.post(
  "/:conversationId/send",
  protect,
  allowRoles("farmer", "buyer"),
  sendMessage
)

// Accept price offer (farmer only)
router.put(
  "/:conversationId/accept-price",
  protect,
  allowRoles("farmer"),
  acceptPriceOffer
)

export default router