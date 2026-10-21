import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://agrichainweb.vercel.app",
  ];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on("setup", (userId) => {
      if (!userId) return;

      socket.join(String(userId));
      socket.emit("connected");

      console.log(`✅ User ${userId} joined their room`);
    });

    socket.on("joinConversation", (conversationId) => {
      if (!conversationId) return;

      socket.join(String(conversationId));
      console.log(`💬 Joined conversation: ${conversationId}`);
    });

    socket.on("leaveConversation", (conversationId) => {
      if (!conversationId) return;
      socket.leave(String(conversationId));
    });

    socket.on("newMessage", (messageData) => {
      if (
        !messageData?.conversationId ||
        !messageData?.receiverId ||
        typeof messageData?.message !== "string"
      ) {
        return;
      }

      io.to(String(messageData.conversationId)).emit(
        "messageReceived",
        messageData
      );

      io.to(String(messageData.receiverId)).emit(
        "newMessageNotification",
        {
          conversationId: messageData.conversationId,
          senderName: messageData.senderName,
          preview: messageData.message.substring(0, 50),
        }
      );
    });

    socket.on("typing", (data) => {
      if (!data?.conversationId) return;

      socket.to(String(data.conversationId)).emit("typing", {
        senderName: data.senderName,
      });
    });

    socket.on("stopTyping", (conversationId) => {
      if (!conversationId) return;
      socket.to(String(conversationId)).emit("stopTyping");
    });

    socket.on("priceOffer", (data) => {
      if (!data?.conversationId) return;

      io.to(String(data.conversationId)).emit(
        "priceOfferReceived",
        data
      );
    });

    socket.on("orderPlaced", (data) => {
      if (!data?.farmerId || !data?.orderId) return;

      io.to(String(data.farmerId)).emit(
        "newOrderNotification",
        {
          message: `🎉 New order from ${data.buyerName}!`,
          orderId: data.orderId,
          amount: data.amount,
        }
      );
    });

    socket.on("orderConfirmed", (data) => {
      if (!data?.buyerId || !data?.orderId) return;

      io.to(String(data.buyerId)).emit(
        "orderConfirmedNotification",
        {
          message: `✅ ${data.farmerName} confirmed your order!`,
          orderId: data.orderId,
        }
      );
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }

  return io;
};