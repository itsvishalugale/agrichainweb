import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { getMyBatches } from "../../services/api"
import Navbar from "../../components/Navbar"
import BatchCard from "../../components/BatchCard"
import {
  PlusCircle, Package, CheckCircle,
  Clock, TrendingUp, Sprout
} from "lucide-react"

// Stat card component
// We define it here because only this page uses it
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{
      width: 52, height: 52,
      borderRadius: 14,
      background: color + "20",
      // 20 at end = 12% opacity version of color
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>
      <Icon size={24} color={color} />
    </div>
    <div>
      <p style={{
        fontSize: "0.8rem", fontWeight: 700,
        color: "#4d7c0f", fontFamily: "Nunito, sans-serif"
      }}>
        {label}
      </p>
      <p style={{
        fontSize: "1.8rem", fontWeight: 900,
        color: "#14532d", fontFamily: "Nunito, sans-serif",
        lineHeight: 1.2
      }}>
        {value}
      </p>
    </div>
  </div>
)

const FarmerDashboard = () => {
  const { user }              = useAuth()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState("all")
  // filter = which batches to show
  // "all" / "farmer" / "processor" / "warehouse" / "retailer" / "completed"

  // Fetch batches when page loads
  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      const res = await getMyBatches()
      setBatches(res.data.data.batches)
    } catch (error) {
      console.error("Failed to fetch batches:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats from batches
  // These update automatically when batches changes
  const stats = {
    total:     batches.length,
    active:    batches.filter(b => b.currentStage !== "completed").length,
    completed: batches.filter(b => b.currentStage === "completed").length,
    thisMonth: batches.filter(b => {
      const created = new Date(b.createdAt)
      const now     = new Date()
      return created.getMonth()    === now.getMonth() &&
             created.getFullYear() === now.getFullYear()
    }).length
  }

  // Filter batches based on selected filter
  const filteredBatches = filter === "all"
    ? batches
    : batches.filter(b => b.currentStage === filter)

  const FILTERS = [
    { key: "all",       label: "All",       color: "#14532d" },
    { key: "farmer",    label: "🌾 At Farm",  color: "#15803d" },
    { key: "processor", label: "🏭 Processing", color: "#1d4ed8" },
    { key: "warehouse", label: "🏢 Stored",   color: "#d97706" },
    { key: "retailer",  label: "🏪 Retail",   color: "#7c3aed" },
    { key: "completed", label: "✅ Sold",     color: "#475569" },
  ]

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="page-content">

        {/* Welcome header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 16
        }}>
          <div className="fade-in">
            <h1 style={{
              fontSize: "1.9rem", fontWeight: 900,
              color: "#14532d", fontFamily: "Nunito, sans-serif",
              marginBottom: 6
            }}>
              Welcome back, {user?.name}! 🌾
            </h1>
            <p style={{
              color: "#4d7c0f", fontWeight: 500,
              fontFamily: "Nunito, sans-serif"
            }}>
              Here's an overview of all your crop batches
            </p>
          </div>

          {/* Add batch button */}
          <Link
            to="/farmer/add-batch"
            className="btn-primary fade-in"
            style={{ textDecoration: "none", fontSize: "0.95rem" }}
          >
            <PlusCircle size={18} />
            Add New Batch
          </Link>
        </div>

        {/* Stats grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28
        }}>
          <StatCard
            icon={Package}
            label="Total Batches"
            value={stats.total}
            color="#16a34a"
          />
          <StatCard
            icon={Clock}
            label="Active Batches"
            value={stats.active}
            color="#d97706"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={stats.completed}
            color="#7c3aed"
          />
          <StatCard
            icon={TrendingUp}
            label="This Month"
            value={stats.thisMonth}
            color="#0891b2"
          />
        </div>

        {/* Filter tabs */}
        <div style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          flexWrap: "wrap"
        }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.85rem",
                fontFamily: "Nunito, sans-serif",
                transition: "all 0.2s",
                background: filter === f.key ? f.color : "#f0fdf4",
                color:      filter === f.key ? "white"  : "#4d7c0f",
                boxShadow:  filter === f.key
                  ? `0 4px 12px ${f.color}40`
                  : "none",
                transform: filter === f.key ? "scale(1.05)" : "scale(1)"
              }}
            >
              {f.label}
              {/* Show count next to filter */}
              <span style={{
                marginLeft: 6,
                background: filter === f.key
                  ? "rgba(255,255,255,0.25)"
                  : "#dcfce7",
                color: filter === f.key ? "white" : "#15803d",
                padding: "1px 7px",
                borderRadius: 999,
                fontSize: "0.75rem"
              }}>
                {f.key === "all"
                  ? batches.length
                  : batches.filter(b => b.currentStage === f.key).length
                }
              </span>
            </button>
          ))}
        </div>

        {/* Batches grid */}
        {loading ? (
          // Loading skeleton
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20
          }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="card" style={{ minHeight: 280 }}>
                {/* Skeleton animation */}
                {[80, 60, 100, 50].map((w, j) => (
                  <div key={j} style={{
                    height: 16, width: `${w}%`,
                    background: "#dcfce7",
                    borderRadius: 8,
                    marginBottom: 14,
                    animation: "pulse 1.5s ease-in-out infinite"
                  }} />
                ))}
                <style>{`
                  @keyframes pulse {
                    0%, 100% { opacity: 1 }
                    50%       { opacity: 0.4 }
                  }
                `}</style>
              </div>
            ))}
          </div>

        ) : filteredBatches.length === 0 ? (
          // Empty state
          <div className="card" style={{
            textAlign: "center",
            padding: "4rem 2rem"
          }}>
            <div style={{
              width: 80, height: 80,
              background: "#dcfce7",
              borderRadius: "50%",
              display: "flex", alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              <Sprout size={36} color="#16a34a" />
            </div>
            <h3 style={{
              fontSize: "1.3rem", fontWeight: 900,
              color: "#14532d", fontFamily: "Nunito, sans-serif",
              marginBottom: 8
            }}>
              {filter === "all"
                ? "No batches yet!"
                : `No batches in ${filter} stage`
              }
            </h3>
            <p style={{
              color: "#4d7c0f", marginBottom: 24,
              fontFamily: "Nunito, sans-serif"
            }}>
              {filter === "all"
                ? "Start by adding your first crop batch"
                : "Try selecting a different filter"
              }
            </p>
            {filter === "all" && (
              <Link
                to="/farmer/add-batch"
                className="btn-primary"
                style={{ textDecoration: "none" }}
              >
                <PlusCircle size={18} />
                Add First Batch
              </Link>
            )}
          </div>

        ) : (
          // Batches grid
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20
          }}>
            {filteredBatches.map((batch) => (
              <BatchCard key={batch._id} batch={batch} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default FarmerDashboard