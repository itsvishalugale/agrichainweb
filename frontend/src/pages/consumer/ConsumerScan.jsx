import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getBatchById } from "../../services/api"
import {
  Leaf, Search, CheckCircle, Clock,
  MapPin, Calendar, Package, Factory,
  Warehouse, Store, ShoppingBag,
  AlertCircle, ExternalLink, Shield
} from "lucide-react"

// Each stage has its own card config
const STAGE_CONFIG = {
  farmer: {
    label:   "Farmer",
    emoji:   "🌾",
    color:   "#16a34a",
    bg:      "#dcfce7",
    border:  "#bbf7d0",
    icon:    Leaf,
  },
  processor: {
    label:   "Processor",
    emoji:   "🏭",
    color:   "#1d4ed8",
    bg:      "#dbeafe",
    border:  "#bfdbfe",
    icon:    Factory,
  },
  warehouse: {
    label:   "Warehouse",
    emoji:   "🏢",
    color:   "#d97706",
    bg:      "#fef3c7",
    border:  "#fde68a",
    icon:    Warehouse,
  },
  retailer: {
    label:   "Retailer",
    emoji:   "🏪",
    color:   "#7c3aed",
    bg:      "#f3e8ff",
    border:  "#ddd6fe",
    icon:    Store,
  },
}

// Individual stage card component
const StageCard = ({ stage, data, timelineEntry, isComplete }) => {
  const config = STAGE_CONFIG[stage]
  const Icon   = config.icon

  if (!isComplete) {
    // Stage not reached yet
    return (
      <div style={{
        padding: "20px 24px",
        borderRadius: 16,
        border: "2px dashed #dcfce7",
        background: "#f9fefb",
        display: "flex", alignItems: "center", gap: 14
      }}>
        <div style={{
          width: 48, height: 48,
          borderRadius: 12,
          background: "#f0fdf4",
          display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0
        }}>
          <Clock size={22} color="#bbf7d0" />
        </div>
        <div>
          <p style={{
            fontWeight: 800, color: "#86efac",
            fontFamily: "Nunito, sans-serif", fontSize: "1rem"
          }}>
            {config.emoji} {config.label}
          </p>
          <p style={{
            color: "#86efac", fontSize: "0.8rem",
            fontFamily: "Nunito, sans-serif"
          }}>
            Pending...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      borderRadius: 16,
      border: `2px solid ${config.border}`,
      background: "white",
      overflow: "hidden"
    }}
      className="fade-in"
    >
      {/* Stage header */}
      <div style={{
        padding: "16px 20px",
        background: config.bg,
        display: "flex", alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: 10,
            background: "white",
            display: "flex", alignItems: "center",
            justifyContent: "center"
          }}>
            <Icon size={20} color={config.color} />
          </div>
          <div>
            <p style={{
              fontWeight: 900, color: config.color,
              fontFamily: "Nunito, sans-serif", fontSize: "1rem"
            }}>
              {config.emoji} {config.label} Stage
            </p>
            {timelineEntry?.timestamp && (
              <p style={{
                fontSize: "0.75rem", color: config.color,
                fontFamily: "Nunito, sans-serif", opacity: 0.8
              }}>
                {new Date(timelineEntry.timestamp).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit"
                })}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle size={20} color={config.color} />
          <span style={{
            fontSize: "0.75rem", fontWeight: 700,
            color: config.color, fontFamily: "Nunito, sans-serif"
          }}>
            VERIFIED
          </span>
        </div>
      </div>

      {/* Stage details */}
      <div style={{ padding: "16px 20px" }}>

        {/* Farmer details */}
        {stage === "farmer" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10
          }}>
            {[
              { icon: "👨‍🌾", label: "Farmer",    value: data?.farmerName },
              { icon: "🌾", label: "Crop",      value: data?.cropName },
              { icon: "📦", label: "Quantity",  value: `${data?.quantity} ${data?.quantityUnit}` },
              { icon: "📍", label: "Location",  value: data?.location },
              { icon: "🏘️", label: "Village",   value: data?.village || "N/A" },
              { icon: "📅", label: "Harvested", value: data?.harvestDate
                  ? new Date(data.harvestDate).toLocaleDateString("en-IN")
                  : "N/A"
              },
              { icon: "🧪", label: "Pesticide", value: data?.pesticideUsed || "None" },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{
                padding: "10px 12px",
                background: "#f0fdf4",
                borderRadius: 10
              }}>
                <p style={{
                  fontSize: "0.72rem", color: "#4d7c0f",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 600, marginBottom: 2
                }}>
                  {icon} {label}
                </p>
                <p style={{
                  fontSize: "0.88rem", color: "#14532d",
                  fontFamily: "Nunito, sans-serif", fontWeight: 800
                }}>
                  {value || "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Processor details */}
        {stage === "processor" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10
          }}>
            {[
              { icon: "🏭", label: "Facility",   value: data?.facilityName },
              { icon: "👤", label: "Processor",  value: data?.processorName },
              { icon: "📅", label: "Processed",  value: data?.processingDate
                  ? new Date(data.processingDate).toLocaleDateString("en-IN")
                  : "N/A"
              },
              { icon: "📦", label: "Packaging",  value: data?.packagingType },
              { icon: "⭐", label: "Quality",    value: `Grade ${data?.qualityGrade}` },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{
                padding: "10px 12px",
                background: "#eff6ff",
                borderRadius: 10
              }}>
                <p style={{
                  fontSize: "0.72rem", color: "#1d4ed8",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 600, marginBottom: 2
                }}>
                  {icon} {label}
                </p>
                <p style={{
                  fontSize: "0.88rem", color: "#1e3a8a",
                  fontFamily: "Nunito, sans-serif", fontWeight: 800
                }}>
                  {value || "N/A"}
                </p>
              </div>
            ))}
            {data?.additionalNotes && (
              <div style={{
                gridColumn: "1 / -1",
                padding: "10px 12px",
                background: "#eff6ff", borderRadius: 10
              }}>
                <p style={{
                  fontSize: "0.72rem", color: "#1d4ed8",
                  fontFamily: "Nunito, sans-serif", fontWeight: 600, marginBottom: 2
                }}>
                  📝 Notes
                </p>
                <p style={{
                  fontSize: "0.85rem", color: "#1e3a8a",
                  fontFamily: "Nunito, sans-serif", fontWeight: 700
                }}>
                  {data.additionalNotes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Warehouse details */}
        {stage === "warehouse" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10
          }}>
            {[
              { icon: "🏢", label: "Warehouse",    value: data?.warehouseName },
              { icon: "❄️", label: "Storage Type",  value: data?.storageType },
              { icon: "🌡️", label: "Temperature",   value: data?.temperature || "Not recorded" },
              { icon: "📍", label: "Location",      value: data?.storageLocation || "N/A" },
              { icon: "📅", label: "Entry Date",    value: data?.entryDate
                  ? new Date(data.entryDate).toLocaleDateString("en-IN")
                  : "N/A"
              },
              { icon: "📤", label: "Exit Date",     value: data?.expectedExitDate
                  ? new Date(data.expectedExitDate).toLocaleDateString("en-IN")
                  : "N/A"
              },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{
                padding: "10px 12px",
                background: "#fffbeb",
                borderRadius: 10
              }}>
                <p style={{
                  fontSize: "0.72rem", color: "#d97706",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 600, marginBottom: 2
                }}>
                  {icon} {label}
                </p>
                <p style={{
                  fontSize: "0.88rem", color: "#92400e",
                  fontFamily: "Nunito, sans-serif", fontWeight: 800,
                  textTransform: "capitalize"
                }}>
                  {value || "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Retailer details */}
        {stage === "retailer" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10
          }}>
            {[
              { icon: "🏪", label: "Store",       value: data?.storeName },
              { icon: "💰", label: "Price",        value: `₹${data?.retailPrice}/kg` },
              { icon: "📍", label: "Shelf",        value: data?.shelfLocation || "N/A" },
              { icon: "📅", label: "Received",     value: data?.receivedDate
                  ? new Date(data.receivedDate).toLocaleDateString("en-IN")
                  : "N/A"
              },
              { icon: "⏳", label: "Expiry",       value: data?.expiryDate
                  ? new Date(data.expiryDate).toLocaleDateString("en-IN")
                  : "N/A"
              },
              { icon: "✅", label: "Status",       value: data?.isSold ? "Sold" : "Available" },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{
                padding: "10px 12px",
                background: "#faf5ff",
                borderRadius: 10
              }}>
                <p style={{
                  fontSize: "0.72rem", color: "#7c3aed",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 600, marginBottom: 2
                }}>
                  {icon} {label}
                </p>
                <p style={{
                  fontSize: "0.88rem", color: "#4c1d95",
                  fontFamily: "Nunito, sans-serif", fontWeight: 800
                }}>
                  {value || "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Blockchain verification link */}
        {timelineEntry?.blockchainHash && (
          <div style={{
            marginTop: 14,
            padding: "10px 14px",
            background: "#f0fdf4",
            borderRadius: 10,
            display: "flex", alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Shield size={16} color="#16a34a" />
              <span style={{
                fontSize: "0.78rem", fontWeight: 700,
                color: "#15803d", fontFamily: "Nunito, sans-serif"
              }}>
                Blockchain Verified
              </span>
            </div>
            <a
              href={`https://sepolia.etherscan.io/tx/${timelineEntry.blockchainHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 4,
                color: "#16a34a", fontSize: "0.75rem",
                fontWeight: 700, fontFamily: "Nunito, sans-serif",
                textDecoration: "none"
              }}
            >
              View on Etherscan <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

const ConsumerScan = () => {
  const { batchId: urlBatchId } = useParams()
  // useParams reads batchId from URL
  // if consumer opens /batch/BATCH-2026-0001
  // urlBatchId = "BATCH-2026-0001"

  const [batchId,  setBatchId]  = useState(urlBatchId || "")
  const [batch,    setBatch]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)

  // If URL has batchId → auto search on load
  useEffect(() => {
    if (urlBatchId) {
      handleSearch(urlBatchId)
    }
  }, [urlBatchId])

  const handleSearch = async (id) => {
    const searchId = id || batchId
    if (!searchId.trim()) {
      return
    }
    try {
      setLoading(true)
      setSearched(true)
      const res = await getBatchById(searchId.trim().toUpperCase())
      setBatch(res.data.data.batch)
    } catch {
      setBatch(null)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    border: "2px solid #bbf7d0",
    borderRadius: 12,
    background: "white",
    color: "#14532d",
    fontFamily: "Nunito, sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box"
  }

  // Figure out which stages are complete
  const completedStages = batch ? {
    farmer:    !!batch.farmer?.cropName,
    processor: !!batch.processor?.facilityName,
    warehouse: !!batch.warehouse?.warehouseName,
    retailer:  !!batch.retailer?.storeName,
  } : {}

  // Get timeline entry for each stage
  const getTimeline = (stage) =>
    batch?.timeline?.find(t => t.stage === stage)

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)"
    }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
        padding: "20px 24px",
        textAlign: "center"
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: 10,
          marginBottom: 6
        }}>
          <div style={{
            width: 36, height: 36,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Leaf size={20} color="white" />
          </div>
          <span style={{
            fontSize: "1.4rem", fontWeight: 900,
            color: "white", fontFamily: "Nunito, sans-serif"
          }}>
            Agri<span style={{ color: "#86efac" }}>Chain</span>
          </span>
        </div>
        <p style={{
          color: "#86efac", fontSize: "0.85rem",
          fontFamily: "Nunito, sans-serif", fontWeight: 500
        }}>
          Scan QR or enter Batch ID to verify your product
        </p>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>

        {/* Search box */}
        <div className="card fade-in" style={{ marginBottom: 24 }}>
          <p style={{
            fontWeight: 800, color: "#14532d",
            fontFamily: "Nunito, sans-serif",
            marginBottom: 14, fontSize: "1rem"
          }}>
            🔍 Track Your Product
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={18} color="#86efac" style={{
                position: "absolute", left: 12,
                top: "50%", transform: "translateY(-50%)"
              }} />
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter Batch ID e.g. BATCH-2026-0001"
                style={{ ...inputStyle, paddingLeft: 40 }}
                onFocus={e => e.target.style.borderColor = "#16a34a"}
                onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="btn-primary"
              style={{ whiteSpace: "nowrap", padding: "12px 20px" }}
            >
              {loading ? (
                <div style={{
                  width: 18, height: 18,
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "white", borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
              ) : (
                <><Search size={16} /> Track</>
              )}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{
              width: 56, height: 56,
              border: "4px solid #dcfce7",
              borderTopColor: "#16a34a",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px"
            }} />
            <p style={{
              fontWeight: 700, color: "#16a34a",
              fontFamily: "Nunito, sans-serif"
            }}>
              Fetching batch details...
            </p>
          </div>
        )}

        {/* Not found */}
        {searched && !loading && !batch && (
          <div className="card fade-in" style={{ textAlign: "center", padding: "3rem" }}>
            <AlertCircle size={52} color="#ef4444"
              style={{ margin: "0 auto 14px", display: "block" }} />
            <h3 style={{
              fontWeight: 900, color: "#14532d",
              fontFamily: "Nunito, sans-serif",
              fontSize: "1.3rem", marginBottom: 8
            }}>
              Product Not Found
            </h3>
            <p style={{
              color: "#4d7c0f", fontFamily: "Nunito, sans-serif",
              marginBottom: 8
            }}>
              No product found with ID "{batchId}"
            </p>
            <p style={{
              color: "#86efac", fontSize: "0.82rem",
              fontFamily: "Nunito, sans-serif"
            }}>
              Please check the Batch ID on your product label and try again
            </p>
          </div>
        )}

        {/* Batch found */}
        {batch && !loading && (
          <div className="fade-in">

            {/* Product summary hero card */}
            <div style={{
              borderRadius: 20,
              background: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
              padding: "24px",
              marginBottom: 20,
              color: "white",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Background decoration */}
              <div style={{
                position: "absolute", top: -40, right: -40,
                width: 160, height: 160,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.07)"
              }} />
              <div style={{
                position: "absolute", bottom: -30, left: -30,
                width: 120, height: 120,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.07)"
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: 16
                }}>
                  <div>
                    <p style={{
                      color: "#86efac", fontSize: "0.8rem",
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 600, marginBottom: 4
                    }}>
                      {batch.batchId}
                    </p>
                    <h2 style={{
                      fontSize: "2rem", fontWeight: 900,
                      fontFamily: "Nunito, sans-serif",
                      marginBottom: 4
                    }}>
                      {batch.farmer?.cropName}
                    </h2>
                    <p style={{
                      color: "#bbf7d0", fontSize: "0.9rem",
                      fontFamily: "Nunito, sans-serif"
                    }}>
                      {batch.farmer?.location}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    padding: "8px 16px",
                    background: batch.currentStage === "completed"
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(255,255,255,0.15)",
                    borderRadius: 9999,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    fontFamily: "Nunito, sans-serif",
                    border: "1px solid rgba(255,255,255,0.2)"
                  }}>
                    {batch.currentStage === "completed"
                      ? "✅ Journey Complete"
                      : `📍 At ${batch.currentStage}`
                    }
                  </span>
                </div>

                {/* Quick stats */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12
                }}>
                  {[
                    { label: "Quantity",  value: `${batch.farmer?.quantity} ${batch.farmer?.quantityUnit}` },
                    { label: "Harvested", value: batch.farmer?.harvestDate
                        ? new Date(batch.farmer.harvestDate).toLocaleDateString("en-IN",
                          { day: "numeric", month: "short" })
                        : "N/A"
                    },
                    { label: "Pesticide", value: batch.farmer?.pesticideUsed || "None" },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      padding: "10px 12px",
                      background: "rgba(255,255,255,0.12)",
                      borderRadius: 10
                    }}>
                      <p style={{
                        fontSize: "0.7rem", color: "#86efac",
                        fontFamily: "Nunito, sans-serif", fontWeight: 600
                      }}>
                        {label}
                      </p>
                      <p style={{
                        fontSize: "0.9rem", color: "white",
                        fontFamily: "Nunito, sans-serif", fontWeight: 800
                      }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* QR code display */}
            {batch.qrCode && (
              <div className="card" style={{
                marginBottom: 20,
                textAlign: "center"
              }}>
                <p style={{
                  fontWeight: 800, color: "#14532d",
                  fontFamily: "Nunito, sans-serif",
                  marginBottom: 14
                }}>
                  📱 Product QR Code
                </p>
                <img
                  src={batch.qrCode}
                  alt="QR Code"
                  style={{
                    width: 160, height: 160,
                    margin: "0 auto",
                    display: "block",
                    borderRadius: 12,
                    border: "3px solid #dcfce7"
                  }}
                />
                <p style={{
                  fontSize: "0.78rem", color: "#4d7c0f",
                  fontFamily: "Nunito, sans-serif",
                  marginTop: 10, fontWeight: 600
                }}>
                  Share this QR code for instant product verification
                </p>
              </div>
            )}

            {/* Journey title */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 16
            }}>
              <div style={{
                flex: 1, height: 2, background: "#dcfce7"
              }} />
              <p style={{
                fontWeight: 900, color: "#14532d",
                fontFamily: "Nunito, sans-serif",
                fontSize: "1.1rem", whiteSpace: "nowrap"
              }}>
                🗺️ Complete Journey
              </p>
              <div style={{
                flex: 1, height: 2, background: "#dcfce7"
              }} />
            </div>

            {/* Stage cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {["farmer", "processor", "warehouse", "retailer"].map((stage) => (
                <StageCard
                  key={stage}
                  stage={stage}
                  data={batch[stage]}
                  timelineEntry={getTimeline(stage)}
                  isComplete={completedStages[stage]}
                />
              ))}
            </div>

            {/* Trust badge */}
            <div style={{
              marginTop: 24,
              padding: "16px 20px",
              background: "#dcfce7",
              borderRadius: 14,
              border: "1px solid #bbf7d0",
              display: "flex", alignItems: "center", gap: 12
            }}>
              <Shield size={28} color="#16a34a" style={{ flexShrink: 0 }} />
              <div>
                <p style={{
                  fontWeight: 800, color: "#14532d",
                  fontFamily: "Nunito, sans-serif", fontSize: "0.9rem"
                }}>
                  ✅ AgriChain Verified Product
                </p>
                <p style={{
                  color: "#4d7c0f", fontSize: "0.78rem",
                  fontFamily: "Nunito, sans-serif"
                }}>
                  All data is recorded on Ethereum blockchain
                  and cannot be tampered with
                </p>
              </div>
            </div>

            {/* Footer */}
            <p style={{
              textAlign: "center", marginTop: 20,
              color: "#86efac", fontSize: "0.78rem",
              fontFamily: "Nunito, sans-serif"
            }}>
              Powered by AgriChain • Blockchain Supply Chain
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default ConsumerScan