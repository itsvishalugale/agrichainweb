import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useAuth } from "./AuthContext"

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const { user }        = useAuth()
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [notifications, setNotifications] = useState([])
  // notifications = new order alerts, new messages etc

  useEffect(() => {
    if (user) {
      // Connect to socket when user logs in
      const newSocket = io("http://localhost:5000", {
        withCredentials: true,
      })

      // Join personal room
      newSocket.emit("setup", user._id)

      newSocket.on("connected", () => {
        console.log("🔌 Socket connected!")
      })

      // Listen for new message notifications
      newSocket.on("newMessageNotification", (data) => {
        setNotifications(prev => [...prev, {
          type:    "message",
          message: `New message from ${data.senderName}`,
          data,
          id:      Date.now()
        }])
      })

      // Listen for new order notifications (farmer)
      newSocket.on("newOrderNotification", (data) => {
        setNotifications(prev => [...prev, {
          type:    "order",
          message: data.message,
          data,
          id:      Date.now()
        }])
      })

      // Listen for order status updates (buyer)
      newSocket.on("orderStatusUpdate", (data) => {
        setNotifications(prev => [...prev, {
          type:    "status",
          message: data.message,
          data,
          id:      Date.now()
        }])
      })

      // Listen for order confirmed (buyer)
      newSocket.on("orderConfirmedNotification", (data) => {
        setNotifications(prev => [...prev, {
          type:    "confirmed",
          message: data.message,
          data,
          id:      Date.now()
        }])
      })

      setSocket(newSocket)

      // Cleanup on logout
      return () => {
        newSocket.disconnect()
        console.log("🔌 Socket disconnected")
      }
    }
  }, [user])
  // Runs whenever user changes (login/logout)

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return (
    <SocketContext.Provider value={{
      socket,
      notifications,
      clearNotification,
      clearAllNotifications,
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)