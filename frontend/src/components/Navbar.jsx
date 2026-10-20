import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../context/SocketContext"
import {
  Leaf, LogOut, Menu, X,
  LayoutDashboard, PlusCircle,
  ShoppingBag, MessageCircle,
  Store, Package, Bell
} from "lucide-react"

const NAV_LINKS = {
  farmer: [
    { to: "/farmer/dashboard",       label: "Dashboard",  icon: LayoutDashboard },
    { to: "/farmer/add-batch",        label: "Add Batch",  icon: PlusCircle },
    { to: "/farmer/listings",         label: "My Listings",icon: Store },
    { to: "/farmer/orders",           label: "Orders",     icon: Package },
    { to: "/marketplace",             label: "Marketplace",icon: ShoppingBag },
  ],
  processor: [
    { to: "/processor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ],
  warehouse: [
    { to: "/warehouse/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ],
  retailer: [
    { to: "/retailer/dashboard",  label: "Dashboard", icon: LayoutDashboard },
  ],
  buyer: [
    { to: "/buyer/dashboard",     label: "Dashboard",  icon: LayoutDashboard },
    { to: "/marketplace",         label: "Marketplace",icon: ShoppingBag },
  ],
  admin: [
    { to: "/admin/dashboard",     label: "Dashboard", icon: LayoutDashboard },
    { to: "/marketplace",         label: "Marketplace",icon: ShoppingBag },
  ],
}

const ROLE_COLORS = {
  farmer:    { bg: "#dcfce7", color: "#15803d" },
  processor: { bg: "#dbeafe", color: "#1d4ed8" },
  warehouse: { bg: "#fef3c7", color: "#d97706" },
  retailer:  { bg: "#f3e8ff", color: "#7c3aed" },
  buyer:     { bg: "#fce7f3", color: "#be185d" },
  admin:     { bg: "#fee2e2", color: "#dc2626" },
}

const Navbar = () => {
  const { user, logout }          = useAuth()
  const { notifications }         = useSocket()
  const navigate                  = useNavigate()
  const location                  = useLocation()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [showNotif, setShowNotif] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const links     = NAV_LINKS[user?.role] || []
  const roleColor = ROLE_COLORS[user?.role] || {}
  const isActive  = (path) => location.pathname === path

  return (
    <nav style={{
      background: "white",
      borderBottom: "2px solid #dcfce7",
      position: "sticky", top: 0, zIndex: 50,
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)"
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 1.5rem", height: 64,
        display: "flex", alignItems: "center",
        justifyContent: "space-between"
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{
            width: 36, height: 36, background: "#16a34a",
            borderRadius: 10, display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>
            <Leaf size={20} color="white" />
          </div>
          <span style={{ fontSize: "1.3rem", fontWeight: 900, color: "#14532d", fontFamily: "Nunito, sans-serif" }}>
            Agri<span style={{ color: "#16a34a" }}>Chain</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="desktop-nav">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 10,
                textDecoration: "none", fontWeight: 700,
                fontSize: "0.88rem", fontFamily: "Nunito, sans-serif",
                background: isActive(link.to) ? "#dcfce7" : "transparent",
                color: isActive(link.to) ? "#15803d" : "#166534",
                transition: "all 0.2s"
              }}
            >
              <link.icon size={15} />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* Notification bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotif(!showNotif)}
              style={{
                position: "relative", background: "#f0fdf4",
                border: "none", borderRadius: 10,
                padding: "8px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <Bell size={18} color="#16a34a" />
              {notifications.length > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 2,
                  background: "#dc2626", color: "white",
                  borderRadius: "50%", width: 16, height: 16,
                  fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {showNotif && (
              <div style={{
                position: "absolute", right: 0, top: 44,
                width: 300, background: "white",
                borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                border: "1px solid #dcfce7", zIndex: 100,
                overflow: "hidden"
              }}>
                <div style={{
                  padding: "12px 16px", borderBottom: "1px solid #f0fdf4",
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <p style={{ fontWeight: 800, color: "#14532d", fontFamily: "Nunito, sans-serif" }}>
                    Notifications
                  </p>
                  <span style={{ fontSize: 12, color: "#16a34a", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}
                    onClick={() => setShowNotif(false)}>
                    Close
                  </span>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", color: "#86efac", fontFamily: "Nunito, sans-serif" }}>
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #f0fdf4",
                      background: "#fafffe"
                    }}>
                      <p style={{
                        fontSize: "0.85rem", fontWeight: 600,
                        color: "#14532d", fontFamily: "Nunito, sans-serif"
                      }}>
                        {notif.type === "order"    ? "🎉" :
                         notif.type === "message"  ? "💬" :
                         notif.type === "status"   ? "📦" : "✅"} {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Role badge */}
          <span style={{
            padding: "4px 12px", borderRadius: 9999,
            fontSize: "0.75rem", fontWeight: 700,
            background: roleColor.bg, color: roleColor.color,
            fontFamily: "Nunito, sans-serif"
          }}>
            {user?.role?.toUpperCase()}
          </span>

          {/* Username */}
          <span style={{
            fontSize: "0.9rem", fontWeight: 700,
            color: "#14532d", fontFamily: "Nunito, sans-serif"
          }} className="hide-mobile">
            {user?.name}
          </span>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", background: "#fef2f2",
              color: "#dc2626", border: "none", borderRadius: 10,
              cursor: "pointer", fontWeight: 700,
              fontSize: "0.9rem", fontFamily: "Nunito, sans-serif"
            }}
          >
            <LogOut size={16} />
            <span className="hide-mobile">Logout</span>
          </button>

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "none", padding: 8,
              background: "#f0fdf4", border: "none",
              borderRadius: 8, cursor: "pointer", color: "#16a34a"
            }}
            className="mobile-menu-btn"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: "white", borderTop: "1px solid #dcfce7",
          padding: "12px 16px", display: "flex",
          flexDirection: "column", gap: 8
        }}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", borderRadius: 10,
                textDecoration: "none", fontWeight: 700,
                color: "#166534",
                background: isActive(link.to) ? "#dcfce7" : "#f0fdf4",
                fontFamily: "Nunito, sans-serif"
              }}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 16px", background: "#fef2f2",
            color: "#dc2626", border: "none", borderRadius: 10,
            cursor: "pointer", fontWeight: 700,
            fontFamily: "Nunito, sans-serif"
          }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hide-mobile { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}

export default Navbar