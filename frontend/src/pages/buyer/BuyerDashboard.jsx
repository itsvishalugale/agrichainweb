import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useSocket } from "../../context/SocketContext"
import { getMyOrders, rateOrder } from "../../services/api"
import Navbar from "../../components/Navbar"
import toast from "react-hot-toast"
import {
  ShoppingBag, Clock, CheckCircle,
  Truck, Star, Package, ArrowRight,
  ChevronDown, ChevronUp
} from "lucide-react"

const STATUS_STYLES = {
  pending:    { label: "⏳ Pending Confirmation", color: "#d97706", bg: "#fef3c7" },
  confirmed:  { label: "✅ Confirmed",             color: "#1d4ed8", bg: "#dbeafe" },
  processing: { label: "📦 Being Prepared",        color: "#7c3aed", bg: "#f3e8ff" },
  shipped:    { label: "🚚 On The Way",            color: "#0891b2", bg: "#e0f2fe" },
  delivered:  { label: "✅ Delivered",             color: "#16a34a", bg: "#dcfce7" },
  cancelled:  { label: "❌ Cancelled",             color: "#dc2626", bg: "#fee2e2" },
}

// Rating component
const RatingStars = ({ orderId, onRate }) => {
  const [rating,  setRating]  = useState(0)
  const [hovered, setHovered] = useState(0)
  const [review,  setReview]  = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select a rating")
      return
    }
    try {
      setLoading(true)
      await onRate(orderId, { rating, review })
      toast.success("Rating submitted! ⭐")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      padding: 16, background: "#fef3c7",
      borderRadius: 12, border: "1px solid #fde68a",
      marginTop: 14
    }}>
      <p style={{
        fontWeight: 800, color: "#92400e",
        fontFamily: "Nunito, sans-serif",
        marginBottom: 10, fontSize: "0.9rem"
      }}>
        ⭐ Rate this farmer
      </p>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[1,2,3,4,5].map(star => (
          <Star
            key={star}
            size={28}
            color="#f59e0b"
            fill={star <= (hovered || rating) ? "#f59e0b" : "none"}
            style={{ cursor: "pointer" }}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
          />
        ))}
      </div>
      <textarea
        value={review}
        onChange={e => setReview(e.target.value)}
        placeholder="Write a review (optional)..."
        rows={2}
        style={{
          width: "100%", padding: "8px 12px",
          border: "2px solid #fde68a",
          borderRadius: 10, background: "white",
          fontFamily: "Nunito, sans-serif",
          fontWeight: 600, outline: "none",
          resize: "none", boxSizing: "border-box",
          marginBottom: 10
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !rating}
        style={{
          padding: "8px 20px",
          background: loading ? "#86efac" : "#16a34a",
          color: "white", border: "none",
          borderRadius: 10, cursor: "pointer",
          fontWeight: 700, fontFamily: "Nunito, sans-serif"
        }}
      >
        {loading ? "Submitting..." : "Submit Rating"}
      </button>
    </div>
  )
}

const BuyerDashboard = () => {
  const { user }             = useAuth()
  const { socket }           = useSocket()
  const [orders,  setOrders] = useState([])
  const [loading, setLoading]= useState(true)
  const [filter,  setFilter] = useState("all")
  const [expanded,setExpanded]=useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  // Real time order updates
  useEffect(() => {
    if (!socket) return
    socket.on("orderConfirmedNotification", () => {
      fetchOrders()
      toast.success("🎉 Your order was confirmed by the farmer!")
    })
    socket.on("orderStatusUpdate", (data) => {
      fetchOrders()
      toast.success(data.message)
    })
    return () => {
      socket.off("orderConfirmedNotification")
      socket.off("orderStatusUpdate")
    }
  }, [socket])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await getMyOrders()
      setOrders(res.data.data.orders)
    } catch (error) {
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  const handleRate = async (orderId, ratingData) => {
    await rateOrder(orderId, ratingData)
    fetchOrders()
  }

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(o => o.status === filter)

  const stats = {
    total:     orders.length,
    active:    orders.filter(o => !["delivered","cancelled"].includes(o.status)).length,
    delivered: orders.filter(o => o.status === "delivered").length,
    spent:     orders.filter(o => o.payment?.status === "paid")
                     .reduce((a,o) => a + (o.totalAmount || 0), 0),
  }

  const FILTERS = [
    { key: "all",       label: "All" },
    { key: "pending",   label: "⏳ Pending" },
    { key: "confirmed", label: "✅ Confirmed" },
    { key: "shipped",   label: "🚚 Shipped" },
    { key: "delivered", label: "✅ Delivered" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4" }}>
      <Navbar />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 28,
          flexWrap: "wrap", gap: 16
        }} className="fade-in">
          <div>
            <h1 style={{
              fontSize: "1.9rem", fontWeight: 900,
              color: "#14532d", fontFamily: "Nunito, sans-serif",
              marginBottom: 6
            }}>
              Welcome, {user?.name}! 🛒
            </h1>
            <p style={{
              color: "#4d7c0f", fontFamily: "Nunito, sans-serif"
            }}>
              Track your orders and find fresh verified crops
            </p>
          </div>
          <Link
            to="/marketplace"
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 20px", background: "#16a34a",
              color: "white", borderRadius: 12,
              textDecoration: "none", fontWeight: 800,
              fontFamily: "Nunito, sans-serif"
            }}
          >
            <ShoppingBag size={18} /> Browse Marketplace
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 16, marginBottom: 28
        }}>
          {[
            { icon: ShoppingBag, label: "Total Orders",   value: stats.total,    color: "#16a34a", bg: "#dcfce7" },
            { icon: Clock,       label: "Active Orders",  value: stats.active,   color: "#d97706", bg: "#fef3c7" },
            { icon: CheckCircle, label: "Delivered",      value: stats.delivered,color: "#7c3aed", bg: "#f3e8ff" },
            { icon: Star,        label: "Total Spent (₹)",value: `${(stats.spent/1000).toFixed(1)}k`, color: "#0891b2", bg: "#e0f2fe" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} style={{
              background: "white", borderRadius: 16,
              border: "1px solid #dcfce7", padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 12
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: bg, display: "flex",
                alignItems: "center", justifyContent: "center"
              }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <p style={{
                  fontSize: "0.75rem", color: "#4d7c0f",
                  fontFamily: "Nunito, sans-serif", fontWeight: 600
                }}>
                  {label}
                </p>
                <p style={{
                  fontSize: "1.5rem", fontWeight: 900,
                  color: "#14532d", fontFamily: "Nunito, sans-serif",
                  lineHeight: 1.2
                }}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{
          display: "flex", gap: 8,
          marginBottom: 20, flexWrap: "wrap"
        }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "7px 14px", borderRadius: 10,
                border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: "0.82rem",
                fontFamily: "Nunito, sans-serif",
                background: filter === f.key ? "#14532d" : "#f0fdf4",
                color:      filter === f.key ? "white"   : "#4d7c0f",
                transition: "all 0.2s"
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div>
            {[1,2,3].map(i => (
              <div key={i} style={{
                height: 80, background: "white",
                borderRadius: 16, marginBottom: 14,
                animation: "pulse 1.5s ease-in-out infinite"
              }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "3rem",
            background: "white", borderRadius: 20,
            border: "1px solid #dcfce7"
          }}>
            <ShoppingBag size={48} color="#bbf7d0"
              style={{ margin: "0 auto 14px", display: "block" }} />
            <h3 style={{
              fontWeight: 900, color: "#14532d",
              fontFamily: "Nunito, sans-serif", marginBottom: 8
            }}>
              No orders yet!
            </h3>
            <p style={{
              color: "#4d7c0f", fontFamily: "Nunito, sans-serif",
              marginBottom: 20
            }}>
              Browse the marketplace and buy directly from verified farmers
            </p>
            <Link
              to="/marketplace"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", background: "#16a34a",
                color: "white", borderRadius: 12,
                textDecoration: "none", fontWeight: 800,
                fontFamily: "Nunito, sans-serif"
              }}
            >
              Browse Marketplace <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          filteredOrders.map(order => {
            const statusInfo = STATUS_STYLES[order.status] || STATUS_STYLES.pending
            const isExpanded = expanded === order._id

            return (
              <div key={order._id} style={{
                background: "white", borderRadius: 16,
                border: "1px solid #dcfce7",
                marginBottom: 14, overflow: "hidden"
              }} className="fade-in">

                {/* Order row */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : order._id)}
                  style={{
                    padding: "16px 20px", cursor: "pointer",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 12
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f9fefb"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "#f0fdf4", display: "flex",
                      alignItems: "center", justifyContent: "center"
                    }}>
                      <Package size={22} color="#16a34a" />
                    </div>
                    <div>
                      <p style={{
                        fontWeight: 900, color: "#14532d",
                        fontFamily: "Nunito, sans-serif"
                      }}>
                        {order.cropName} — {order.quantity}kg
                      </p>
                      <p style={{
                        fontSize: "0.78rem", color: "#4d7c0f",
                        fontFamily: "Nunito, sans-serif", fontWeight: 600
                      }}>
                        👨‍🌾 {order.farmerName} •
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: "flex", alignItems: "center", gap: 12
                  }}>
                    <div style={{ textAlign: "right" }}>
                      <p style={{
                        fontWeight: 900, color: "#16a34a",
                        fontFamily: "Nunito, sans-serif", fontSize: "1.1rem"
                      }}>
                        ₹{order.totalAmount?.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <span style={{
                      padding: "4px 10px", borderRadius: 999,
                      fontSize: "0.7rem", fontWeight: 700,
                      background: statusInfo.bg, color: statusInfo.color,
                      fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap"
                    }}>
                      {statusInfo.label}
                    </span>
                    {isExpanded
                      ? <ChevronUp size={18} color="#16a34a" />
                      : <ChevronDown size={18} color="#86efac" />
                    }
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #f0fdf4",
                    background: "#f9fefb"
                  }}>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 10, marginBottom: 14
                    }}>
                      {[
                        { label: "Farmer",     value: order.farmerName },
                        { label: "Price/kg",   value: `₹${order.pricePerKg}` },
                        { label: "Payment",    value: order.payment?.status === "paid" ? "✅ Paid" : "⏳ Pending" },
                        { label: "Delivery To",value: order.deliveryAddress },
                      ].map(({ label, value }) => (
                        <div key={label} style={{
                          padding: "10px 14px",
                          background: "white", borderRadius: 10,
                          border: "1px solid #dcfce7"
                        }}>
                          <p style={{
                            fontSize: "0.7rem", color: "#4d7c0f",
                            fontFamily: "Nunito, sans-serif",
                            fontWeight: 600, marginBottom: 2
                          }}>
                            {label}
                          </p>
                          <p style={{
                            fontSize: "0.85rem", color: "#14532d",
                            fontFamily: "Nunito, sans-serif", fontWeight: 800
                          }}>
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Rate farmer after delivery */}
                    {order.status === "delivered" && !order.farmerRating?.rating && (
                      <RatingStars
                        orderId={order._id}
                        onRate={handleRate}
                      />
                    )}

                    {/* Already rated */}
                    {order.farmerRating?.rating && (
                      <div style={{
                        padding: "12px 16px", background: "#dcfce7",
                        borderRadius: 12, marginTop: 14
                      }}>
                        <p style={{
                          fontWeight: 700, color: "#15803d",
                          fontFamily: "Nunito, sans-serif", fontSize: "0.85rem"
                        }}>
                          ✅ You rated this farmer: {order.farmerRating.rating}/5
                        </p>
                      </div>
                    )}

                    {/* View in marketplace */}
                    <Link
                      to="/marketplace"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        marginTop: 14, color: "#16a34a",
                        fontFamily: "Nunito, sans-serif", fontWeight: 700,
                        textDecoration: "none", fontSize: "0.85rem"
                      }}
                    >
                      Browse More Crops <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default BuyerDashboard