import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { getMyBatches, createListing, getMandiPrices } from "../../services/api"
import Navbar from "../../components/Navbar"
import toast from "react-hot-toast"
import {
  ArrowLeft, TrendingUp, Package,
  IndianRupee, Calendar, FileText,
  CheckCircle, Sprout, Info
} from "lucide-react"

const CreateListing = () => {
  const { user }    = useAuth()
  const navigate    = useNavigate()

  const [batches,     setBatches]     = useState([])
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [mandiPrices, setMandiPrices] = useState([])
  const [priceStats,  setPriceStats]  = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [batchLoading,setBatchLoading]= useState(true)

  const [formData, setFormData] = useState({
    batchId:       "",
    pricePerKg:    "",
    minOrderKg:    "10",
    maxOrderKg:    "",
    availableTill: "",
    description:   "",
  })

  // Fetch farmer's batches on load
  useEffect(() => {
    fetchBatches()
  }, [])

  // Fetch mandi prices when batch selected
  useEffect(() => {
    if (selectedBatch) {
      fetchMandiPrices(selectedBatch.farmer.cropName)
    }
  }, [selectedBatch])

  const fetchBatches = async () => {
    try {
      setBatchLoading(true)
      const res = await getMyBatches()
      // Only show batches at farmer stage
      // These are the ones that can be listed
      const eligible = res.data.data.batches.filter(
        b => b.currentStage === "farmer"
      )
      setBatches(eligible)
    } catch (error) {
      toast.error("Failed to fetch batches")
    } finally {
      setBatchLoading(false)
    }
  }

  const fetchMandiPrices = async (cropName) => {
    try {
      const res = await getMandiPrices(cropName)
      const prices = res.data.data.prices || []
      setMandiPrices(prices)

      // Calculate stats
      if (prices.length > 0) {
        const modals = prices.map(p => p.modalPrice).filter(p => p > 0)
        if (modals.length > 0) {
          setPriceStats({
            average: Math.round(modals.reduce((a, b) => a + b, 0) / modals.length),
            highest: Math.max(...modals),
            lowest:  Math.min(...modals),
          })
        }
      }
    } catch (error) {
      console.error("Mandi prices error:", error)
    }
  }

  const handleBatchSelect = (batchId) => {
    const batch = batches.find(b => b.batchId === batchId)
    setSelectedBatch(batch)
    setFormData(prev => ({
      ...prev,
      batchId,
      maxOrderKg: batch?.farmer?.quantity?.toString() || ""
    }))
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!formData.batchId) {
      toast.error("Please select a batch")
      return
    }
    if (!formData.pricePerKg || Number(formData.pricePerKg) <= 0) {
      toast.error("Please enter a valid price")
      return
    }
    if (!formData.availableTill) {
      toast.error("Please set listing expiry date")
      return
    }

    try {
      setLoading(true)
      await createListing({
        ...formData,
        pricePerKg: Number(formData.pricePerKg),
        minOrderKg: Number(formData.minOrderKg),
        maxOrderKg: formData.maxOrderKg ? Number(formData.maxOrderKg) : undefined,
      })
      toast.success("Listing created! 🌾 Buyers can now find your crop!")
      navigate("/farmer/listings")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create listing")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    border: "2px solid #bbf7d0", borderRadius: 12,
    background: "white", color: "#14532d",
    fontFamily: "Nunito, sans-serif", fontWeight: 600,
    fontSize: "0.95rem", outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box"
  }

  const labelStyle = {
    display: "block", fontSize: "0.85rem",
    fontWeight: 700, color: "#14532d",
    marginBottom: 8, fontFamily: "Nunito, sans-serif"
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4" }}>
      <Navbar />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }} className="fade-in">
          <Link
            to="/farmer/listings"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "#4d7c0f", textDecoration: "none",
              fontWeight: 700, fontFamily: "Nunito, sans-serif",
              fontSize: "0.9rem", marginBottom: 16
            }}
          >
            <ArrowLeft size={16} /> Back to My Listings
          </Link>
          <h1 style={{
            fontSize: "1.9rem", fontWeight: 900,
            color: "#14532d", fontFamily: "Nunito, sans-serif",
            marginBottom: 6
          }}>
            Create New Listing 🌾
          </h1>
          <p style={{
            color: "#4d7c0f", fontFamily: "Nunito, sans-serif"
          }}>
            List your verified crop batch on the marketplace
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 24, alignItems: "start"
        }} className="create-grid">

          {/* Left — Form */}
          <div style={{
            background: "white", borderRadius: 20,
            border: "1px solid #dcfce7", padding: 28
          }} className="fade-in">

            {/* Step 1 — Select Batch */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 20, padding: "12px 16px",
              background: "#f0fdf4", borderRadius: 12
            }}>
              <Sprout size={20} color="#16a34a" />
              <span style={{
                fontWeight: 800, color: "#14532d",
                fontFamily: "Nunito, sans-serif"
              }}>
                Step 1 — Select Your Batch
              </span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>
                Select Batch to List *
                <span style={{
                  marginLeft: 8, fontSize: "0.75rem",
                  color: "#86efac", fontWeight: 500
                }}>
                  (Only blockchain verified batches at farmer stage)
                </span>
              </label>

              {batchLoading ? (
                <div style={{
                  padding: 20, textAlign: "center",
                  color: "#86efac", fontFamily: "Nunito, sans-serif"
                }}>
                  Loading your batches...
                </div>
              ) : batches.length === 0 ? (
                <div style={{
                  padding: 20, background: "#fef3c7",
                  borderRadius: 12, border: "1px solid #fde68a"
                }}>
                  <p style={{
                    color: "#d97706", fontFamily: "Nunito, sans-serif",
                    fontWeight: 700, marginBottom: 8
                  }}>
                    ⚠️ No eligible batches found
                  </p>
                  <p style={{
                    color: "#92400e", fontSize: "0.85rem",
                    fontFamily: "Nunito, sans-serif"
                  }}>
                    You need a batch at "farmer" stage to create a listing.
                  </p>
                  <Link
                    to="/farmer/add-batch"
                    style={{
                      display: "inline-block", marginTop: 10,
                      color: "#d97706", fontWeight: 700,
                      fontFamily: "Nunito, sans-serif",
                      textDecoration: "none"
                    }}
                  >
                    + Add New Batch →
                  </Link>
                </div>
              ) : (
                <div style={{
                  display: "flex", flexDirection: "column", gap: 10
                }}>
                  {batches.map(batch => (
                    <div
                      key={batch.batchId}
                      onClick={() => handleBatchSelect(batch.batchId)}
                      style={{
                        padding: 16, borderRadius: 14,
                        border: `2px solid ${formData.batchId === batch.batchId ? "#16a34a" : "#bbf7d0"}`,
                        background: formData.batchId === batch.batchId ? "#f0fdf4" : "white",
                        cursor: "pointer", transition: "all 0.2s",
                        transform: formData.batchId === batch.batchId ? "scale(1.01)" : "scale(1)"
                      }}
                    >
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div>
                          <p style={{
                            fontWeight: 900, color: "#14532d",
                            fontFamily: "Nunito, sans-serif", fontSize: "1rem"
                          }}>
                            🌾 {batch.farmer?.cropName}
                          </p>
                          <p style={{
                            color: "#86efac", fontSize: "0.78rem",
                            fontFamily: "Nunito, sans-serif", fontWeight: 600
                          }}>
                            {batch.batchId}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{
                            fontSize: "0.85rem", color: "#14532d",
                            fontFamily: "Nunito, sans-serif", fontWeight: 700
                          }}>
                            {batch.farmer?.quantity} {batch.farmer?.quantityUnit}
                          </p>
                          <p style={{
                            fontSize: "0.75rem", color: "#4d7c0f",
                            fontFamily: "Nunito, sans-serif"
                          }}>
                            📍 {batch.farmer?.location}
                          </p>
                        </div>
                        {formData.batchId === batch.batchId && (
                          <CheckCircle size={20} color="#16a34a" style={{ marginLeft: 10 }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2 — Pricing */}
            {selectedBatch && (
              <>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  marginBottom: 20, padding: "12px 16px",
                  background: "#f0fdf4", borderRadius: 12
                }}>
                  <IndianRupee size={20} color="#16a34a" />
                  <span style={{
                    fontWeight: 800, color: "#14532d",
                    fontFamily: "Nunito, sans-serif"
                  }}>
                    Step 2 — Set Your Price
                  </span>
                </div>

                {/* Mandi price hint */}
                {priceStats && (
                  <div style={{
                    padding: "12px 16px", background: "#dcfce7",
                    borderRadius: 12, border: "1px solid #bbf7d0",
                    marginBottom: 16,
                    display: "flex", alignItems: "flex-start", gap: 10
                  }}>
                    <Info size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{
                        fontWeight: 800, color: "#15803d",
                        fontFamily: "Nunito, sans-serif",
                        fontSize: "0.85rem", marginBottom: 4
                      }}>
                        💡 Today's Mandi Prices for {selectedBatch.farmer?.cropName}
                      </p>
                      <p style={{
                        color: "#166534", fontFamily: "Nunito, sans-serif",
                        fontSize: "0.82rem"
                      }}>
                        Average: ₹{priceStats.average}/kg •
                        Highest: ₹{priceStats.highest}/kg •
                        Lowest: ₹{priceStats.lowest}/kg
                      </p>
                      <p style={{
                        color: "#166534", fontFamily: "Nunito, sans-serif",
                        fontSize: "0.78rem", marginTop: 4
                      }}>
                        Tip: Price slightly above average to earn premium for direct farm delivery ✅
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>
                    Price per kg (₹) *
                  </label>
                  <div style={{ position: "relative" }}>
                    <IndianRupee size={16} color="#86efac" style={{
                      position: "absolute", left: 12,
                      top: "50%", transform: "translateY(-50%)"
                    }} />
                    <input
                      type="number"
                      name="pricePerKg"
                      value={formData.pricePerKg}
                      onChange={handleChange}
                      placeholder={priceStats ? `Suggested: ₹${priceStats.average + 5}` : "Enter price"}
                      min="1"
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      onFocus={e => e.target.style.borderColor = "#16a34a"}
                      onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                    />
                  </div>
                  {priceStats && formData.pricePerKg && (
                    <p style={{
                      marginTop: 6, fontSize: "0.78rem",
                      fontFamily: "Nunito, sans-serif",
                      color: Number(formData.pricePerKg) >= priceStats.average
                        ? "#15803d" : "#d97706",
                      fontWeight: 600
                    }}>
                      {Number(formData.pricePerKg) >= priceStats.average
                        ? `✅ Above mandi average (₹${priceStats.average}/kg) — Good price!`
                        : `⚠️ Below mandi average (₹${priceStats.average}/kg) — Consider raising price`
                      }
                    </p>
                  )}
                </div>

                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: 14, marginBottom: 20
                }}>
                  <div>
                    <label style={labelStyle}>Min Order (kg)</label>
                    <div style={{ position: "relative" }}>
                      <Package size={16} color="#86efac" style={{
                        position: "absolute", left: 12,
                        top: "50%", transform: "translateY(-50%)"
                      }} />
                      <input
                        type="number"
                        name="minOrderKg"
                        value={formData.minOrderKg}
                        onChange={handleChange}
                        min="1"
                        style={{ ...inputStyle, paddingLeft: 36 }}
                        onFocus={e => e.target.style.borderColor = "#16a34a"}
                        onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Max Order (kg)</label>
                    <div style={{ position: "relative" }}>
                      <Package size={16} color="#86efac" style={{
                        position: "absolute", left: 12,
                        top: "50%", transform: "translateY(-50%)"
                      }} />
                      <input
                        type="number"
                        name="maxOrderKg"
                        value={formData.maxOrderKg}
                        onChange={handleChange}
                        max={selectedBatch?.farmer?.quantity}
                        style={{ ...inputStyle, paddingLeft: 36 }}
                        onFocus={e => e.target.style.borderColor = "#16a34a"}
                        onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3 — Details */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  marginBottom: 20, padding: "12px 16px",
                  background: "#f0fdf4", borderRadius: 12
                }}>
                  <FileText size={20} color="#16a34a" />
                  <span style={{
                    fontWeight: 800, color: "#14532d",
                    fontFamily: "Nunito, sans-serif"
                  }}>
                    Step 3 — Listing Details
                  </span>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>
                    Available Till *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Calendar size={16} color="#86efac" style={{
                      position: "absolute", left: 12,
                      top: "50%", transform: "translateY(-50%)"
                    }} />
                    <input
                      type="date"
                      name="availableTill"
                      value={formData.availableTill}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      onFocus={e => e.target.style.borderColor = "#16a34a"}
                      onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>
                    Description
                    <span style={{
                      marginLeft: 6, fontSize: "0.72rem",
                      color: "#86efac", fontWeight: 500
                    }}>
                      (Tell buyers about your crop — freshness, farming method etc)
                    </span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g. Freshly harvested Alphonso mangoes from my 5 acre organic farm in Devgad. No chemical pesticides used. Available for direct pickup or delivery..."
                    rows={4}
                    style={{
                      ...inputStyle,
                      resize: "vertical", minHeight: 100
                    }}
                    onFocus={e => e.target.style.borderColor = "#16a34a"}
                    onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: "100%", padding: "16px",
                    background: loading ? "#86efac" : "#16a34a",
                    color: "white", border: "none", borderRadius: 14,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: 900, fontSize: "1.05rem",
                    fontFamily: "Nunito, sans-serif",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 10
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: 20, height: 20,
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "white", borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                      }} />
                      Creating Listing...
                    </>
                  ) : (
                    <><CheckCircle size={20} /> Publish Listing on Marketplace</>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Right — Preview + Mandi */}
          <div>

            {/* Listing preview */}
            {selectedBatch && formData.pricePerKg && (
              <div style={{
                background: "white", borderRadius: 16,
                border: "2px solid #16a34a", padding: 20,
                marginBottom: 20
              }} className="fade-in">
                <p style={{
                  fontWeight: 800, color: "#14532d",
                  fontFamily: "Nunito, sans-serif",
                  marginBottom: 14
                }}>
                  👁️ Listing Preview
                </p>
                <div style={{
                  background: "linear-gradient(135deg, #14532d, #16a34a)",
                  borderRadius: 14, padding: 16, marginBottom: 14
                }}>
                  <p style={{
                    color: "#86efac", fontSize: "0.75rem",
                    fontFamily: "Nunito, sans-serif", marginBottom: 4
                  }}>
                    {selectedBatch.farmer?.location}
                  </p>
                  <p style={{
                    color: "white", fontSize: "1.3rem",
                    fontWeight: 900, fontFamily: "Nunito, sans-serif"
                  }}>
                    {selectedBatch.farmer?.cropName}
                  </p>
                  <p style={{
                    color: "white", fontSize: "1.8rem",
                    fontWeight: 900, fontFamily: "Nunito, sans-serif"
                  }}>
                    ₹{formData.pricePerKg}/kg
                  </p>
                </div>
                {[
                  { label: "Quantity",  value: `${selectedBatch.farmer?.quantity} kg available` },
                  { label: "Min Order", value: `${formData.minOrderKg} kg minimum` },
                  { label: "By",        value: user?.name },
                  { label: "Expires",   value: formData.availableTill || "Not set" },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid #f0fdf4"
                  }}>
                    <span style={{
                      fontSize: "0.82rem", color: "#4d7c0f",
                      fontFamily: "Nunito, sans-serif", fontWeight: 600
                    }}>
                      {label}
                    </span>
                    <span style={{
                      fontSize: "0.82rem", color: "#14532d",
                      fontFamily: "Nunito, sans-serif", fontWeight: 800
                    }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Mandi prices table */}
            {mandiPrices.length > 0 && (
              <div style={{
                background: "white", borderRadius: 16,
                border: "1px solid #dcfce7", padding: 20
              }} className="fade-in">
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: 8, marginBottom: 14
                }}>
                  <TrendingUp size={18} color="#16a34a" />
                  <p style={{
                    fontWeight: 800, color: "#14532d",
                    fontFamily: "Nunito, sans-serif"
                  }}>
                    Today's Mandi Prices
                  </p>
                </div>
                {mandiPrices.slice(0, 5).map((p, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #f0fdf4"
                  }}>
                    <p style={{
                      fontSize: "0.82rem", fontWeight: 700,
                      color: "#14532d", fontFamily: "Nunito, sans-serif"
                    }}>
                      {p.market}
                    </p>
                    <p style={{
                      fontSize: "0.9rem", fontWeight: 900,
                      color: "#16a34a", fontFamily: "Nunito, sans-serif"
                    }}>
                      ₹{p.modalPrice}/kg
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 768px) {
          .create-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default CreateListing