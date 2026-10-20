import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { getAllBatches } from "../../services/api"
import Navbar from "../../components/Navbar"
import StepTimeline from "../../components/StepTimeline"
import {
  Package, CheckCircle, Clock,
  TrendingUp, Search, Filter,
  Eye, Sprout, Users, BarChart3,
  ChevronDown, ChevronUp
} from "lucide-react"

// Stat card
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="card" style={{
    display: "flex", alignItems: "center", gap: 16
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: bg, display: "flex",
      alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>
      <Icon size={26} color={color} />
    </div>
    <div>
      <p style={{
        fontSize: "0.8rem", fontWeight: 700,
        color: "#4d7c0f", fontFamily: "Nunito, sans-serif"
      }}>
        {label}
      </p>
      <p style={{
        fontSize: "2rem", fontWeight: 900,
        color: "#14532d", fontFamily: "Nunito, sans-serif",
        lineHeight: 1.1
      }}>
        {value}
      </p>
    </div>
  </div>
)

// Expandable batch row
const BatchRow = ({ batch }) => {
  const [expanded, setExpanded] = useState(false)

  const STAGE_STYLES = {
    farmer:    { bg: "#dcfce7", color: "#15803d" },
    processor: { bg: "#dbeafe", color: "#1d4ed8" },
    warehouse: { bg: "#fef3c7", color: "#d97706" },
    retailer:  { bg: "#f3e8ff", color: "#7c3aed" },
    completed: { bg: "#f1f5f9", color: "#475569" },
  }

  const style = STAGE_STYLES[batch.currentStage] || STAGE_STYLES.farmer

  return (
    <div style={{
      border: "1px solid #dcfce7",
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 10,
      transition: "all 0.2s"
    }}>
      {/* Row header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          background: "white",
          cursor: "pointer",
          gap: 12
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
        onMouseLeave={e => e.currentTarget.style.background = "white"}
      >
        {/* Left — batch info */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "#f0fdf4", display: "flex",
            alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}>
            <Sprout size={20} color="#16a34a" />
          </div>
          <div>
            <p style={{
              fontWeight: 900, color: "#14532d",
              fontFamily: "Nunito, sans-serif", fontSize: "0.95rem"
            }}>
              {batch.farmer?.cropName || "Unknown"}
            </p>
            <p style={{
              color: "#86efac", fontSize: "0.78rem",
              fontFamily: "Nunito, sans-serif", fontWeight: 600
            }}>
              {batch.batchId}
            </p>
          </div>
        </div>

        {/* Middle — farmer name */}
        <div style={{ flex: 1 }} className="hide-mobile">
          <p style={{
            fontSize: "0.82rem", color: "#4d7c0f",
            fontFamily: "Nunito, sans-serif", fontWeight: 600
          }}>
            👨‍🌾 {batch.farmer?.farmerName || "N/A"}
          </p>
          <p style={{
            fontSize: "0.78rem", color: "#86efac",
            fontFamily: "Nunito, sans-serif"
          }}>
            📍 {batch.farmer?.location || "N/A"}
          </p>
        </div>

        {/* Right — stage + expand */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10
        }}>
          <span style={{
            padding: "4px 12px",
            borderRadius: 9999,
            fontSize: "0.72rem",
            fontWeight: 700,
            background: style.bg,
            color: style.color,
            fontFamily: "Nunito, sans-serif",
            textTransform: "capitalize",
            whiteSpace: "nowrap"
          }}>
            {batch.currentStage}
          </span>

          <p style={{
            fontSize: "0.75rem", color: "#86efac",
            fontFamily: "Nunito, sans-serif",
            whiteSpace: "nowrap"
          }} className="hide-mobile">
            {new Date(batch.createdAt).toLocaleDateString("en-IN")}
          </p>

          {expanded
            ? <ChevronUp size={18} color="#16a34a" />
            : <ChevronDown size={18} color="#86efac" />
          }
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          padding: "16px 18px",
          background: "#f9fefb",
          borderTop: "1px solid #dcfce7"
        }}
          className="fade-in"
        >
          {/* Timeline */}
          <StepTimeline currentStage={batch.currentStage} />

          {/* Stage details grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12, marginTop: 16
          }}>

            {/* Farmer */}
            {batch.farmer?.cropName && (
              <div style={{
                padding: 14, background: "#dcfce7",
                borderRadius: 12
              }}>
                <p style={{
                  fontWeight: 800, color: "#15803d",
                  fontFamily: "Nunito, sans-serif",
                  fontSize: "0.85rem", marginBottom: 8
                }}>
                  🌾 Farmer Stage
                </p>
                {[
                  { k: "Crop",     v: batch.farmer?.cropName },
                  { k: "Quantity", v: `${batch.farmer?.quantity} ${batch.farmer?.quantityUnit}` },
                  { k: "Location", v: batch.farmer?.location },
                ].map(({ k, v }) => (
                  <p key={k} style={{
                    fontSize: "0.78rem",
                    fontFamily: "Nunito, sans-serif",
                    color: "#14532d", marginBottom: 3
                  }}>
                    <strong>{k}:</strong> {v || "N/A"}
                  </p>
                ))}
              </div>
            )}

            {/* Processor */}
            {batch.processor?.facilityName && (
              <div style={{
                padding: 14, background: "#dbeafe",
                borderRadius: 12
              }}>
                <p style={{
                  fontWeight: 800, color: "#1d4ed8",
                  fontFamily: "Nunito, sans-serif",
                  fontSize: "0.85rem", marginBottom: 8
                }}>
                  🏭 Processor Stage
                </p>
                {[
                  { k: "Facility", v: batch.processor?.facilityName },
                  { k: "Grade",    v: `Grade ${batch.processor?.qualityGrade}` },
                  { k: "Packaging",v: batch.processor?.packagingType },
                ].map(({ k, v }) => (
                  <p key={k} style={{
                    fontSize: "0.78rem",
                    fontFamily: "Nunito, sans-serif",
                    color: "#1e3a8a", marginBottom: 3
                  }}>
                    <strong>{k}:</strong> {v || "N/A"}
                  </p>
                ))}
              </div>
            )}

            {/* Warehouse */}
            {batch.warehouse?.warehouseName && (
              <div style={{
                padding: 14, background: "#fef3c7",
                borderRadius: 12
              }}>
                <p style={{
                  fontWeight: 800, color: "#d97706",
                  fontFamily: "Nunito, sans-serif",
                  fontSize: "0.85rem", marginBottom: 8
                }}>
                  🏢 Warehouse Stage
                </p>
                {[
                  { k: "Warehouse", v: batch.warehouse?.warehouseName },
                  { k: "Storage",   v: batch.warehouse?.storageType },
                  { k: "Temp",      v: batch.warehouse?.temperature },
                ].map(({ k, v }) => (
                  <p key={k} style={{
                    fontSize: "0.78rem",
                    fontFamily: "Nunito, sans-serif",
                    color: "#92400e", marginBottom: 3
                  }}>
                    <strong>{k}:</strong> {v || "N/A"}
                  </p>
                ))}
              </div>
            )}

            {/* Retailer */}
            {batch.retailer?.storeName && (
              <div style={{
                padding: 14, background: "#f3e8ff",
                borderRadius: 12
              }}>
                <p style={{
                  fontWeight: 800, color: "#7c3aed",
                  fontFamily: "Nunito, sans-serif",
                  fontSize: "0.85rem", marginBottom: 8
                }}>
                  🏪 Retailer Stage
                </p>
                {[
                  { k: "Store",  v: batch.retailer?.storeName },
                  { k: "Price",  v: `₹${batch.retailer?.retailPrice}/kg` },
                  { k: "Status", v: batch.retailer?.isSold ? "Sold ✅" : "Available" },
                ].map(({ k, v }) => (
                  <p key={k} style={{
                    fontSize: "0.78rem",
                    fontFamily: "Nunito, sans-serif",
                    color: "#4c1d95", marginBottom: 3
                  }}>
                    <strong>{k}:</strong> {v || "N/A"}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Timeline log */}
          {batch.timeline?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{
                fontWeight: 800, color: "#14532d",
                fontFamily: "Nunito, sans-serif",
                fontSize: "0.85rem", marginBottom: 10
              }}>
                📋 Activity Log
              </p>
              <div style={{
                display: "flex", flexDirection: "column", gap: 6
              }}>
                {batch.timeline.map((entry, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center",
                    gap: 10, padding: "8px 12px",
                    background: "white", borderRadius: 8,
                    border: "1px solid #dcfce7"
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#16a34a", flexShrink: 0
                    }} />
                    <p style={{
                      fontSize: "0.78rem", color: "#14532d",
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 600, flex: 1
                    }}>
                      {entry.message}
                    </p>
                    <p style={{
                      fontSize: "0.72rem", color: "#86efac",
                      fontFamily: "Nunito, sans-serif",
                      whiteSpace: "nowrap"
                    }}>
                      {new Date(entry.timestamp).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const AdminDashboard = () => {
  const { user }                  = useAuth()
  const [batches,  setBatches]    = useState([])
  const [loading,  setLoading]    = useState(true)
  const [search,   setSearch]     = useState("")
  const [filter,   setFilter]     = useState("all")
  const [sortBy,   setSortBy]     = useState("newest")

  useEffect(() => { fetchAllBatches() }, [])

  const fetchAllBatches = async () => {
    try {
      setLoading(true)
      const res = await getAllBatches()
      setBatches(res.data.data.batches)
    } catch (error) {
      console.error("Failed to fetch batches:", error)
    } finally {
      setLoading(false)
    }
  }

  // Stats
  const stats = {
    total:     batches.length,
    active:    batches.filter(b => b.currentStage !== "completed").length,
    completed: batches.filter(b => b.currentStage === "completed").length,
    farmers:   [...new Set(batches.map(b => b.farmer?.farmerId))].length,
    // new Set removes duplicates
    // counts unique farmers ✅
  }

  // Stage distribution for mini chart
  const stageCount = {
    farmer:    batches.filter(b => b.currentStage === "farmer").length,
    processor: batches.filter(b => b.currentStage === "processor").length,
    warehouse: batches.filter(b => b.currentStage === "warehouse").length,
    retailer:  batches.filter(b => b.currentStage === "retailer").length,
    completed: batches.filter(b => b.currentStage === "completed").length,
  }

  // Filter + search + sort
  const filteredBatches = batches
    .filter(b => filter === "all" || b.currentStage === filter)
    .filter(b =>
      search === "" ||
      b.batchId?.toLowerCase().includes(search.toLowerCase()) ||
      b.farmer?.cropName?.toLowerCase().includes(search.toLowerCase()) ||
      b.farmer?.farmerName?.toLowerCase().includes(search.toLowerCase()) ||
      b.farmer?.location?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === "crop")   return a.farmer?.cropName?.localeCompare(b.farmer?.cropName)
      return 0
    })

  const FILTERS = [
    { key: "all",       label: "All" },
    { key: "farmer",    label: "🌾 Farm" },
    { key: "processor", label: "🏭 Processing" },
    { key: "warehouse", label: "🏢 Stored" },
    { key: "retailer",  label: "🏪 Retail" },
    { key: "completed", label: "✅ Sold" },
  ]

  const STAGE_COLORS = {
    farmer:    "#16a34a",
    processor: "#1d4ed8",
    warehouse: "#d97706",
    retailer:  "#7c3aed",
    completed: "#475569",
  }

  const inputStyle = {
    padding: "10px 16px",
    border: "2px solid #bbf7d0",
    borderRadius: 12,
    background: "white",
    color: "#14532d",
    fontFamily: "Nunito, sans-serif",
    fontWeight: 600,
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s",
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="page-content">

        {/* Header */}
        <div style={{ marginBottom: 28 }} className="fade-in">
          <h1 style={{
            fontSize: "1.9rem", fontWeight: 900,
            color: "#14532d", fontFamily: "Nunito, sans-serif",
            marginBottom: 6
          }}>
            Admin Dashboard 👑
          </h1>
          <p style={{
            color: "#4d7c0f", fontFamily: "Nunito, sans-serif"
          }}>
            Welcome {user?.name}! Full overview of all supply chain batches.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16, marginBottom: 28
        }}>
          <StatCard icon={Package}    label="Total Batches"    value={stats.total}     color="#16a34a" bg="#dcfce7" />
          <StatCard icon={Clock}      label="Active Batches"   value={stats.active}    color="#d97706" bg="#fef3c7" />
          <StatCard icon={CheckCircle}label="Completed"        value={stats.completed} color="#7c3aed" bg="#f3e8ff" />
          <StatCard icon={Users}      label="Unique Farmers"   value={stats.farmers}   color="#0891b2" bg="#e0f2fe" />
        </div>

        {/* Stage distribution mini chart */}
        <div className="card fade-in" style={{ marginBottom: 24 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 16
          }}>
            <BarChart3 size={18} color="#16a34a" />
            <p style={{
              fontWeight: 800, color: "#14532d",
              fontFamily: "Nunito, sans-serif"
            }}>
              Stage Distribution
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(stageCount).map(([stage, count]) => (
              <div key={stage} style={{
                display: "flex", alignItems: "center", gap: 12
              }}>
                <p style={{
                  fontSize: "0.8rem", fontWeight: 700,
                  color: "#4d7c0f", fontFamily: "Nunito, sans-serif",
                  width: 80, textTransform: "capitalize"
                }}>
                  {stage}
                </p>

                {/* Progress bar */}
                <div style={{
                  flex: 1, height: 10,
                  background: "#f0fdf4", borderRadius: 999,
                  overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%",
                    width: stats.total > 0
                      ? `${(count / stats.total) * 100}%`
                      : "0%",
                    background: STAGE_COLORS[stage],
                    borderRadius: 999,
                    transition: "width 0.6s ease"
                  }} />
                </div>

                <p style={{
                  fontSize: "0.82rem", fontWeight: 800,
                  color: "#14532d", fontFamily: "Nunito, sans-serif",
                  width: 24, textAlign: "right"
                }}>
                  {count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Search + Filter + Sort */}
        <div style={{
          display: "flex", gap: 12, marginBottom: 20,
          flexWrap: "wrap", alignItems: "center"
        }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={16} color="#86efac" style={{
              position: "absolute", left: 12,
              top: "50%", transform: "translateY(-50%)"
            }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by batch ID, crop, farmer..."
              style={{ ...inputStyle, paddingLeft: 36, width: "100%", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#16a34a"}
              onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
            />
          </div>

          {/* Sort */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Filter size={16} color="#4d7c0f" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="crop">Crop Name</option>
            </select>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: "flex", gap: 8,
          marginBottom: 20, flexWrap: "wrap"
        }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "7px 14px",
                borderRadius: 10, border: "none",
                cursor: "pointer", fontWeight: 700,
                fontSize: "0.82rem",
                fontFamily: "Nunito, sans-serif",
                transition: "all 0.2s",
                background: filter === f.key ? "#14532d" : "#f0fdf4",
                color:      filter === f.key ? "white"   : "#4d7c0f",
                boxShadow:  filter === f.key
                  ? "0 4px 12px rgba(20,83,45,0.25)"
                  : "none"
              }}
            >
              {f.label}
              <span style={{
                marginLeft: 6,
                background: filter === f.key
                  ? "rgba(255,255,255,0.2)"
                  : "#dcfce7",
                color: filter === f.key ? "white" : "#15803d",
                padding: "1px 7px",
                borderRadius: 999,
                fontSize: "0.72rem"
              }}>
                {f.key === "all"
                  ? batches.length
                  : batches.filter(b => b.currentStage === f.key).length
                }
              </span>
            </button>
          ))}
        </div>

        {/* Batches list */}
        {loading ? (
          // Skeleton
          <div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                height: 68, background: "white",
                borderRadius: 14, marginBottom: 10,
                border: "1px solid #dcfce7",
                animation: "pulse 1.5s ease-in-out infinite"
              }} />
            ))}
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1 }
                50% { opacity: 0.4 }
              }
            `}</style>
          </div>

        ) : filteredBatches.length === 0 ? (
          // Empty state
          <div className="card" style={{
            textAlign: "center", padding: "3rem"
          }}>
            <Eye size={48} color="#bbf7d0"
              style={{ margin: "0 auto 14px", display: "block" }} />
            <h3 style={{
              fontWeight: 900, color: "#14532d",
              fontFamily: "Nunito, sans-serif", marginBottom: 8
            }}>
              No batches found
            </h3>
            <p style={{
              color: "#4d7c0f", fontFamily: "Nunito, sans-serif"
            }}>
              {search
                ? `No results for "${search}"`
                : "No batches in this stage yet"
              }
            </p>
          </div>

        ) : (
          <>
            {/* Results count */}
            <p style={{
              fontSize: "0.82rem", color: "#4d7c0f",
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600, marginBottom: 12
            }}>
              Showing {filteredBatches.length} of {batches.length} batches
            </p>

            {/* Batch rows */}
            {filteredBatches.map((batch) => (
              <BatchRow key={batch._id} batch={batch} />
            ))}
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard