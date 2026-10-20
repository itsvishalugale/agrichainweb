import { Server } from "socket.io"

// -----------------------------------------------
// Socket.io enables REAL TIME communication
// Without it chat would need page refresh
// With it messages appear instantly like WhatsApp ✅
// -----------------------------------------------

let io

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin:      process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
    pingTimeout:  60000,
    // If no message for 60 seconds → check connection
    pingInterval: 25000,
    // Check connection every 25 seconds
  })

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`)

    // ─── User joins their personal room ───
    socket.on("setup", (userId) => {
      socket.join(userId)
      // Every user has a "room" named after their userId
      // Like having your own mailbox
      // Messages sent to "userId" go only to that person
      socket.emit("connected")
      console.log(`✅ User ${userId} joined their room`)
    })

    // ─── User opens a conversation ───
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId)
      // Both farmer and buyer join conversation room
      // Messages here go to both ✅
      console.log(`💬 Joined conversation: ${conversationId}`)
    })

    // ─── User leaves a conversation ───
    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId)
    })

    // ─── New message sent ───
    socket.on("newMessage", (messageData) => {
      // messageData = {
      //   conversationId,
      //   receiverId,
      //   message,
      //   type,
      //   senderName
      // }

      // Send to everyone in conversation room
      // Both farmer and buyer see it instantly ✅
      io.to(messageData.conversationId).emit(
        "messageReceived",
        messageData
      )

      // Also send notification to receiver's personal room
      // Even if they're not in the conversation page
      io.to(messageData.receiverId).emit(
        "newMessageNotification",
        {
          conversationId: messageData.conversationId,
          senderName:     messageData.senderName,
          preview:        messageData.message.substring(0, 50),
          // First 50 chars as preview
        }
      )
    })

    // ─── Typing indicator ───
    socket.on("typing", (data) => {
      // data = { conversationId, senderName }
      socket.to(data.conversationId).emit("typing", {
        senderName: data.senderName
      })
      // "to" sends to everyone EXCEPT sender
      // Farmer sees "Buyer is typing..."
      // But buyer doesn't see it for themselves ✅
    })

    socket.on("stopTyping", (conversationId) => {
      socket.to(conversationId).emit("stopTyping")
    })

    // ─── Price offer notification ───
    socket.on("priceOffer", (data) => {
      // data = { conversationId, receiverId, offeredPrice, senderName }
      io.to(data.conversationId).emit("priceOfferReceived", data)
      // Special notification for price offer
      // Frontend shows accept/reject buttons ✅
    })

    // ─── Order placed notification ───
    socket.on("orderPlaced", (data) => {
      // data = { farmerId, buyerName, orderId, amount }
      io.to(data.farmerId).emit("newOrderNotification", {
        message: `🎉 New order from ${data.buyerName}!`,
        orderId:  data.orderId,
        amount:   data.amount,
      })
    })

    // ─── Farmer confirms order ───
    socket.on("orderConfirmed", (data) => {
      // data = { buyerId, orderId, farmerName }
      io.to(data.buyerId).emit("orderConfirmedNotification", {
        message: `✅ ${data.farmerName} confirmed your order!`,
        orderId:  data.orderId,
      })
    })

    // ─── Disconnect ───
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`)
    })
  })

  return io
}

// ─── Get io instance anywhere in app ───
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!")
  return io
}