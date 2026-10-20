import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"
import { Leaf, Mail, Lock, Eye, EyeOff } from "lucide-react"

const DEMO_USERS = [
  { role: "🌾 Farmer",    email: "farmer@test.com" },
  { role: "🏭 Processor", email: "processor@test.com" },
  { role: "🏢 Warehouse", email: "warehouse@test.com" },
  { role: "🏪 Retailer",  email: "retailer@test.com" },
  { role: "🛒 Buyer",     email: "buyer@test.com" },
  { role: "👑 Admin",     email: "admin@agrichain.com" },
]

const Login = () => {
  const [formData,     setFormData]     = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const { login }                        = useAuth()
  const navigate                         = useNavigate()

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields")
      return
    }
    try {
      setLoading(true)
      const user = await login(formData.email, formData.password)
      navigate(`/${user.role}/dashboard`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>

      {/* Left panel */}
      <div style={{
        width: "45%",
        background: "linear-gradient(135deg, #14532d 0%, #15803d 50%, #22c55e 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        position: "relative",
        overflow: "hidden"
      }} className="hide-mobile-panel">

        {/* Decorative circles */}
        {[
          { top: -80, left: -80, size: 300 },
          { bottom: -60, right: -60, size: 350 },
          { top: "40%", left: "20%", size: 150 },
        ].map((s, i) => (
          <div key={i} style={{
            position: "absolute",
            width: s.size, height: s.size,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            top: s.top, left: s.left,
            bottom: s.bottom, right: s.right
          }} />
        ))}

        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }} className="fade-in">
          <div className="bounce-soft" style={{
            width: 100, height: 100,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 24,
            display: "flex", alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 2rem",
            backdropFilter: "blur(10px)"
          }}>
            <Leaf size={52} color="white" />
          </div>

          <h1 style={{
            fontSize: "3.5rem", fontWeight: 900,
            color: "white", fontFamily: "Nunito, sans-serif",
            marginBottom: "0.5rem"
          }}>
            Agri<span style={{ color: "#86efac" }}>Chain</span>
          </h1>

          <p style={{
            color: "#bbf7d0", fontSize: "1.1rem",
            fontWeight: 500, marginBottom: "2.5rem",
            fontFamily: "Nunito, sans-serif",
            maxWidth: 300, margin: "0 auto 2rem"
          }}>
            Farm to consumer transparency powered by blockchain
          </p>

          {[
            "🌾 Track crops from farm to shelf",
            "🔗 Blockchain verified at every step",
            "📱 QR code for instant verification",
            "👥 Role based secure access",
          ].map((text, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center",
              gap: 10, marginBottom: 14, textAlign: "left"
            }}>
              <div style={{
                width: 8, height: 8,
                background: "#86efac",
                borderRadius: "50%", flexShrink: 0
              }} />
              <span style={{
                color: "#dcfce7", fontWeight: 600,
                fontFamily: "Nunito, sans-serif"
              }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#f0fdf4",
        overflowY: "auto"
      }}>
        <div style={{ width: "100%", maxWidth: 420 }} className="fade-in">

          {/* Mobile logo */}
          <div style={{
            display: "none", alignItems: "center",
            gap: 8, marginBottom: "2rem"
          }} className="show-mobile-logo">
            <div style={{
              width: 36, height: 36, background: "#16a34a",
              borderRadius: 10, display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              <Leaf size={20} color="white" />
            </div>
            <span style={{
              fontSize: "1.4rem", fontWeight: 900,
              color: "#14532d", fontFamily: "Nunito, sans-serif"
            }}>
              AgriChain
            </span>
          </div>

          <h2 style={{
            fontSize: "2.2rem", fontWeight: 900,
            color: "#14532d", fontFamily: "Nunito, sans-serif",
            marginBottom: 8
          }}>
            Welcome back! 👋
          </h2>
          <p style={{
            color: "#4d7c0f", fontWeight: 500,
            marginBottom: "2rem", fontFamily: "Nunito, sans-serif"
          }}>
            Sign in to your AgriChain account
          </p>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block", fontSize: "0.85rem",
                fontWeight: 700, color: "#14532d",
                marginBottom: 8, fontFamily: "Nunito, sans-serif"
              }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={18} color="#86efac" style={{
                  position: "absolute", left: 12,
                  top: "50%", transform: "translateY(-50%)"
                }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="farmer@example.com"
                  className="input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "block", fontSize: "0.85rem",
                fontWeight: 700, color: "#14532d",
                marginBottom: 8, fontFamily: "Nunito, sans-serif"
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} color="#86efac" style={{
                  position: "absolute", left: 12,
                  top: "50%", transform: "translateY(-50%)"
                }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12,
                    top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none",
                    cursor: "pointer", color: "#86efac"
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", fontSize: "1.05rem", padding: "14px" }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 18, height: 18,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                  }} />
                  Signing in...
                </>
              ) : "Sign In →"}
            </button>

            <p style={{
              textAlign: "center", marginTop: 20,
              color: "#4d7c0f", fontFamily: "Nunito, sans-serif",
              fontWeight: 500
            }}>
              Don't have an account?{" "}
              <Link to="/register" style={{
                color: "#15803d", fontWeight: 700,
                textDecoration: "none"
              }}>
                Register here
              </Link>
            </p>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: 28, padding: 16,
            background: "#dcfce7",
            borderRadius: 14,
            border: "1px solid #bbf7d0"
          }}>
            <p style={{
              fontSize: "0.78rem", fontWeight: 800,
              color: "#15803d", marginBottom: 10,
              fontFamily: "Nunito, sans-serif"
            }}>
              🧪 Quick Login (password: 123456)
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {DEMO_USERS.map((u) => (
                <button
                  key={u.role}
                  onClick={() => setFormData({ email: u.email, password: "123456" })}
                  style={{
                    padding: "8px 10px",
                    background: "white",
                    border: "1px solid #bbf7d0",
                    borderRadius: 10,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#16a34a"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#bbf7d0"}
                >
                  <p style={{
                    fontSize: "0.78rem", fontWeight: 700,
                    color: "#14532d", fontFamily: "Nunito, sans-serif"
                  }}>
                    {u.role}
                  </p>
                  <p style={{
                    fontSize: "0.7rem", color: "#4d7c0f",
                    fontFamily: "Nunito, sans-serif",
                    overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {u.email}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 768px) {
          .hide-mobile-panel  { display: none !important; }
          .show-mobile-logo   { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

export default Login