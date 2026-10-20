import { createContext, useContext, useState, useEffect } from "react"
import { getMe, loginUser, logoutUser, registerUser } from "../services/api"
import toast from "react-hot-toast"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { checkAuth() }, [])

  const checkAuth = async () => {
    try {
      const res = await getMe()
      setUser(res.data.data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await loginUser({ email, password })
    setUser(res.data.data.user)
    toast.success(`Welcome back ${res.data.data.user.name}! 👋`)
    return res.data.data.user
  }

  const register = async (name, email, password, role) => {
    const res = await registerUser({ name, email, password, role })
    setUser(res.data.data.user)
    toast.success("Registration successful! 🎉")
    return res.data.data.user
  }

  const logout = async () => {
    await logoutUser()
    setUser(null)
    toast.success("Logged out successfully!")
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)