import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?._id) {
      setSocket(null);
      return;
    }

    // Use the deployed Render backend in production.
    // Set VITE_API_URL in your Vercel environment variables.
    const SOCKET_URL =
      import.meta.env.VITE_API_URL || "http://localhost:5000";

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    newSocket.on("connect", () => {
      console.log("🔌 Socket connected:", newSocket.id);
      newSocket.emit("setup", user._id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    newSocket.on("newMessageNotification", (data) => {
      setNotifications((prev) => [
        ...prev,
        {
          type: "message",
          message: `New message from ${data.senderName}`,
          data,
          id: Date.now() + Math.random(),
        },
      ]);
    });

    newSocket.on("newOrderNotification", (data) => {
      setNotifications((prev) => [
        ...prev,
        {
          type: "order",
          message: data.message,
          data,
          id: Date.now() + Math.random(),
        },
      ]);
    });

    newSocket.on("orderStatusUpdate", (data) => {
      setNotifications((prev) => [
        ...prev,
        {
          type: "status",
          message: data.message,
          data,
          id: Date.now() + Math.random(),
        },
      ]);
    });

    newSocket.on("orderConfirmedNotification", (data) => {
      setNotifications((prev) => [
        ...prev,
        {
          type: "confirmed",
          message: data.message,
          data,
          id: Date.now() + Math.random(),
        },
      ]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket((current) =>
        current === newSocket ? null : current
      );
      console.log("🔌 Socket disconnected");
    };
  }, [user?._id]);

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        clearNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);