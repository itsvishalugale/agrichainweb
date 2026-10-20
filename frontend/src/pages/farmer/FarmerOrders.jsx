import { useState, useEffect } from "react"
import { getFarmerOrders, updateOrderStatus } from "../../services/api"
import { useSocket } from "../../context/SocketContext"
import Navbar from "../../components/Navbar"
import toast from "react-hot-toast"
import {
  Package, Clock, CheckCircle,
  Truck, Star, ChevronDown, ChevronUp
} from "lucide-react"

const STATUS_FLOW = {
  pending:    { label: "⏳ Pending",    color: "#d97706", bg: "#fef3c7", next: "confirmed" },
  confirmed:  { label: "✅ Confirmed",  color: "#1d4ed8", bg: "#dbeafe", next: "processing" },
  processing: { label: "📦 Processing", color: "#7c3aed", bg: "#f3e8ff", next: "shipped" },
  shipped:    { label: "🚚 Shipped",    color: "#0891b2", bg: "#e0f2fe", next: "delivered" },
  delivered:  { label: "✅ Delivered",  color: "#16a34a", bg: "#dcfce7", next: null },
  cancelled:  { label: "❌ Cancelled",  color: "#dc2626", bg: "#fee2e2", next: null },
}

const OrderCard = ({ order, onUpdateStatus }) => {
  const [expanded,  setExpanded]  = useState(false)
  const [updating,  setUpdating]  = useState(false)
  const statusInfo = STATUS_FLOW[order.status] || STATUS_FLOW.pending

  const handleUpdate = async (newStatus) => {
    try {
      setUpdating(true)
      await onUpdateStatus(order._id, newStatus)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div style={{
      background: "white", borderRadius: 16,
      border: "1px solid #dcfce7", overflow: "hidden",
      marginBottom: 14
    }} className="fade-in">

      {/* Order header */}
      <div
        onClick={() => setExpanded(!expanded)}
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
              👤 {order.buyerName} • {order.buyerType || "buyer"}
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
            <p style={{
              fontSize: "0.72rem", color: "#4d7c0f",
              fontFamily: "Nunito, sans-serif"
            }}>
              ₹{order.pricePerKg}/kg
            </p>
          </div>
          <span style={{
            padding: "4px 12px", borderRadius: 999,
            fontSize: "0.72rem", fontWeight: 700,
            background: statusInfo.bg, color: statusInfo.color,
            fontFamily: "Nunito, sans-serif", whiteSpace: "nowrap"
          }}>
            {statusInfo.label}
          </span>
          {expanded
            ? <ChevronUp size={18} color="#16a34a" />
            : <ChevronDown size={18} color="#86efac" />
          }
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid #f0fdf4",
          background: "#f9fefb"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12, marginBottom: 16
          }}>
            {[
              { label: "Payment",    value: order.payment?.status === "paid" ? "✅ Paid" : "⏳ Pending" },
              { label: "Delivery To",value: order.deliveryAddress || "N/A" },
              { label: "Ordered On", value: new Date(order.createdAt).toLocaleDateString("en-IN") },
              { label: "Negotiated", value: order.negotiatedInChat ? "Yes (via chat)" : "No (listed price)" },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: "10px 14px",
                background: "white", borderRadius: 10,
                border: "1px solid #dcfce7"
              }}>
                <p style={{
                  fontSize: "0.72rem", color: "#4d7c0f",
                  fontFamily: "Nunito, sans-serif", fontWeight: 600,
                  marginBottom: 2
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

          {/* Status update buttons */}
          {statusInfo.next && order.payment?.status === "paid" && (
            <div>
              <p style={{
                fontWeight: 700, color: "#14532d",
                fontFamily: "Nunito, sans-serif",
                fontSize: "0.85rem", marginBottom: 10
              }}>
                Update Order Status:
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => handleUpdate(statusInfo.next)}
                  disabled={updating}
                  style={{
                    padding: "10px 20px",
                    background: updating ? "#86efac" : "#16a34a",
                    color: "white", border: "none",
                    borderRadius: 10, cursor: "pointer",
                    fontWeight: 700, fontFamily: "Nunito, sans-serif",
                    display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  {updating ? "Updating..." : (
                    <>
                      {statusInfo.next === "processing" && <><Package size={15} /> Mark Processing</>}
                      {statusInfo.next === "shipped"    && <><Truck size={15} />   Mark Shipped</>}
                      {statusInfo.next === "delivered"  && <><CheckCircle size={15} /> Mark Delivered</>}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Rating received */}
          {order.buyerRating?.rating && (
            <div style={{
              marginTop: 14, padding: "12px 16px",
              background: "#fef3c7", borderRadius: 12,
              border: "1px solid #fde68a"
            }}>
              <p style={{
                fontWeight: 700, color: "#92400e",
                fontFamily: "Nunito, sans-serif", fontSize: "0.85rem"
              }}>
                ⭐ Buyer rated you: {order.buyerRating.rating}/5
              </p>
              {order.buyerRating.review && (
                <p style={{
                  color: "#78350f", fontSize: "0.82rem",
                  fontFamily: "Nunito, sans-serif", marginTop: 4
                }}>
                  "{order.buyerRating.review}"
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const FarmerOrders = () => {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState("all")
  const { socket }             = useSocket()

  useEffect(() => {
    fetchOrders()
  }, [])

  // Real time new order notification
  useEffect(() => {
    if (!socket) return
    socket.on("newOrderNotification", () => {
      fetchOrders()
      // Refresh orders when new one arrives
    })
    return () => socket.off("newOrderNotification")
  }, [socket])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await getFarmerOrders()
      setOrders(res.data.data.orders)
    } catch (error) {
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus })
      toast.success(`Order marked as ${newStatus}! 📦`)
      fetchOrders()
    } catch (error) {
      toast.error("Failed to update order")
    }
  }

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(o => o.status === filter)

  const stats = {
    total:    orders.length,
    pending:  orders.filter(o => o.status === "pending").length,
    active:   orders.filter(o => ["confirmed", "processing", "shipped"].includes(o.status)).length,
    revenue:  orders.filter(o => o.payment?.status === "paid")
                    .reduce((a, o) => a + (o.totalAmount || 0), 0),
  }

  const FILTERS = [
    { key: "all",       label: "All" },
    { key: "pending",   label: "⏳ Pending" },
    { key: "confirmed", label: "✅ Confirmed" },
    { key: "processing",label: "📦 Processing" },
    { key: "shipped",   label: "🚚 Shipped" },
    { key: "delivered", label: "✅ Delivered" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4" }}>
      <Navbar />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }} className="fade-in">
          <h1 style={{
            fontSize: "1.9rem", fontWeight: 900,
            color: "#14532d", fontFamily: "Nunito, sans-serif",
            marginBottom: 6
          }}>
            My Orders 📦
          </h1>
          <p style={{
            color: "#4d7c0f", fontFamily: "Nunito, sans-serif"
          }}>
            Manage orders from direct buyers
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 16, marginBottom: 24
        }}>
          {[
            { icon: Package,    label: "Total Orders",   value: stats.total,   color: "#16a34a", bg: "#dcfce7" },
            { icon: Clock,      label: "Pending",         value: stats.pending, color: "#d97706", bg: "#fef3c7" },
            { icon: Truck,      label: "In Progress",     value: stats.active,  color: "#1d4ed8", bg: "#dbeafe" },
            { icon: Star,       label: "Revenue (₹)",     value: `${(stats.revenue/1000).toFixed(1)}k`, color: "#7c3aed", bg: "#f3e8ff" },
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
              <span style={{
                marginLeft: 6,
                background: filter === f.key ? "rgba(255,255,255,0.2)" : "#dcfce7",
                color: filter === f.key ? "white" : "#15803d",
                padding: "1px 7px", borderRadius: 999,
                fontSize: "0.72rem"
              }}>
                {f.key === "all"
                  ? orders.length
                  : orders.filter(o => o.status === f.key).length
                }
              </span>
            </button>
          ))}
        </div>

        {/* Orders list */}
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
            <Package size={48} color="#bbf7d0"
              style={{ margin: "0 auto 14px", display: "block" }} />
            <h3 style={{
              fontWeight: 900, color: "#14532d",
              fontFamily: "Nunito, sans-serif", marginBottom: 8
            }}>
              No orders yet
            </h3>
            <p style={{
              color: "#4d7c0f", fontFamily: "Nunito, sans-serif"
            }}>
              Create listings on the marketplace to start receiving orders!
            </p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <OrderCard
              key={order._id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default FarmerOrders