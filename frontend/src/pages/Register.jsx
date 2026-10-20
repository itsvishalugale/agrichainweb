import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"
import { Leaf, Mail, Lock, User, Eye, EyeOff } from "lucide-react"

const ROLES = [
  { value: "farmer",    emoji: "🌾", label: "Farmer",    desc: "Add and manage crop batches" },
  { value: "processor", emoji: "🏭", label: "Processor", desc: "Process and package batches" },
  { value: "warehouse", emoji: "🏢", label: "Warehouse", desc: "Manage batch storage" },
  { value: "retailer",  emoji: "🏪", label: "Retailer",  desc: "Receive and sell batches" },
  { value: "buyer",     emoji: "🛒", label: "Buyer",     desc: "Buy directly from farmers" },
]

const Register = () => {
  const [formData,     setFormData]     = useState({ name: "", email: "", password: "", role: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const { register }                    = useAuth()
  const navigate                        = useNavigate()

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast.error("Please fill all fields and select a role")
      return
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    try {
      setLoading(true)
      const user = await register(formData.name, formData.email, formData.password, formData.role)
      navigate(`/${user.role}/dashboard`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed!")
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
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "3rem", position: "relative", overflow: "hidden"
      }} className="hide-mobile-panel">

        <div style={{
          position: "absolute", top: -80, left: -80,
          width: 300, height: 300,
          borderRadius: "50%", background: "rgba(255,255,255,0.05)"
        }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }} className="fade-in">
          <div style={{
            width: 90, height: 90,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 22,
            display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 1.5rem"
          }}>
            <Leaf size={46} color="white" />
          </div>

          <h1 style={{
            fontSize: "3rem", fontWeight: 900,
            color: "white", fontFamily: "Nunito, sans-serif",
            marginBottom: "0.5rem"
          }}>
            Agri<span style={{ color: "#86efac" }}>Chain</span>
          </h1>

          <p style={{
            color: "#bbf7d0", fontFamily: "Nunito, sans-serif",
            marginBottom: "2rem", fontSize: "1rem"
          }}>
            Join the transparent supply chain
          </p>

          {ROLES.map((role, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center",
              gap: 14, marginBottom: 18, textAlign: "left"
            }}>
              <span style={{ fontSize: "2rem" }}>{role.emoji}</span>
              <div>
                <p style={{
                  fontWeight: 800, color: "white",
                  fontFamily: "Nunito, sans-serif", fontSize: "0.95rem"
                }}>
                  {role.label}
                </p>
                <p style={{
                  color: "#86efac", fontSize: "0.8rem",
                  fontFamily: "Nunito, sans-serif"
                }}>
                  {role.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "2rem",
        background: "#f0fdf4", overflowY: "auto"
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
            Create Account 🌱
          </h2>
          <p style={{
            color: "#4d7c0f", fontWeight: 500,
            marginBottom: "2rem", fontFamily: "Nunito, sans-serif"
          }}>
            Join AgriChain and start tracking
          </p>

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: "block", fontSize: "0.85rem",
                fontWeight: 700, color: "#14532d",
                marginBottom: 8, fontFamily: "Nunito, sans-serif"
              }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <User size={18} color="#86efac" style={{
                  position: "absolute", left: 12,
                  top: "50%", transform: "translateY(-50%)"
                }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Farmer"
                  className="input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
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
                  placeholder="john@example.com"
                  className="input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
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
                  placeholder="Min 6 characters"
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

            {/* Role selection */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "block", fontSize: "0.85rem",
                fontWeight: 700, color: "#14532d",
                marginBottom: 10, fontFamily: "Nunito, sans-serif"
              }}>
                Select Your Role
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value })}
                    style={{
                      padding: "14px 12px",
                      borderRadius: 12,
                      border: `2px solid ${formData.role === role.value ? "#16a34a" : "#bbf7d0"}`,
                      background: formData.role === role.value ? "#f0fdf4" : "white",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      transform: formData.role === role.value ? "scale(1.03)" : "scale(1)",
                      boxShadow: formData.role === role.value ? "0 4px 12px rgba(22,163,74,0.15)" : "none"
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>{role.emoji}</span>
                    <p style={{
                      fontWeight: 800, color: "#14532d",
                      fontSize: "0.85rem", marginTop: 6,
                      fontFamily: "Nunito, sans-serif"
                    }}>
                      {role.label}
                    </p>
                    <p style={{
                      color: "#4d7c0f", fontSize: "0.72rem",
                      fontFamily: "Nunito, sans-serif"
                    }}>
                      {role.desc}
                    </p>
                  </button>
                ))}
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
                  Creating account...
                </>
              ) : "Create Account →"}
            </button>

            <p style={{
              textAlign: "center", marginTop: 20,
              color: "#4d7c0f", fontFamily: "Nunito, sans-serif",
              fontWeight: 500
            }}>
              Already have an account?{" "}
              <Link to="/login" style={{
                color: "#15803d", fontWeight: 700,
                textDecoration: "none"
              }}>
                Sign in here
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 768px) {
          .hide-mobile-panel { display: none !important; }
          .show-mobile-logo  { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

export default Register