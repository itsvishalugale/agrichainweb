import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getMyListings, cancelListing } from "../../services/api"
import Navbar from "../../components/Navbar"
import toast from "react-hot-toast"
import {
  PlusCircle, Package, Eye, XCircle,
  TrendingUp, Clock, CheckCircle, Sprout
} from "lucide-react"

const STATUS_STYLES = {
  active:    { bg: "#dcfce7", color: "#15803d", label: "Active" },
  sold:      { bg: "#f3e8ff", color: "#7c3aed", label: "Sold Out" },
  expired:   { bg: "#fee2e2", color: "#dc2626", label: "Expired" },
  cancelled: { bg: "#f1f5f9", color: "#475569", label: "Cancelled" },
}

const FarmerListings = () => {
  const [listings, setListings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => { fetchListings() }, [])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const res = await getMyListings()
      setListings(res.data.data.listings)
    } catch (error) {
      toast.error("Failed to fetch listings")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this listing?")) return
    try {
      await cancelListing(id)
      toast.success("Listing cancelled")
      fetchListings()
    } catch (error) {
      toast.error("Failed to cancel listing")
    }
  }

  // Stats
  const stats = {
    total:    listings.length,
    active:   listings.filter(l => l.status === "active").length,
    sold:     listings.filter(l => l.status === "sold").length,
    totalViews: listings.reduce((a, l) => a + (l.views || 0), 0),
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4" }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>

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
              My Listings 🌾
            </h1>
            <p style={{
              color: "#4d7c0f", fontFamily: "Nunito, sans-serif"
            }}>
              Manage your crop listings on the marketplace
            </p>
          </div>
          <Link
            to="/farmer/create-listing"
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 20px", background: "#16a34a",
              color: "white", borderRadius: 12,
              textDecoration: "none", fontWeight: 800,
              fontFamily: "Nunito, sans-serif"
            }}
          >
            <PlusCircle size={18} /> Create New Listing
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16, marginBottom: 28
        }}>
          {[
            { icon: Package,    label: "Total Listings", value: stats.total,     color: "#16a34a", bg: "#dcfce7" },
            { icon: CheckCircle,label: "Active",          value: stats.active,    color: "#1d4ed8", bg: "#dbeafe" },
            { icon: TrendingUp, label: "Sold Out",        value: stats.sold,      color: "#7c3aed", bg: "#f3e8ff" },
            { icon: Eye,        label: "Total Views",     value: stats.totalViews,color: "#d97706", bg: "#fef3c7" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} style={{
              background: "white", borderRadius: 16,
              border: "1px solid #dcfce7", padding: "18px 20px",
              display: "flex", alignItems: "center", gap: 14
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: bg, display: "flex",
                alignItems: "center", justifyContent: "center"
              }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <p style={{
                  fontSize: "0.78rem", color: "#4d7c0f",
                  fontFamily: "Nunito, sans-serif", fontWeight: 600
                }}>
                  {label}
                </p>
                <p style={{
                  fontSize: "1.7rem", fontWeight: 900,
                  color: "#14532d", fontFamily: "Nunito, sans-serif",
                  lineHeight: 1.2
                }}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Listings */}
        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20
          }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                height: 200, background: "white",
                borderRadius: 16, border: "1px solid #dcfce7",
                animation: "pulse 1.5s ease-in-out infinite"
              }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          </div>

        ) : listings.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "4rem 2rem",
            background: "white", borderRadius: 20,
            border: "1px solid #dcfce7"
          }}>
            <div style={{
              width: 80, height: 80, background: "#dcfce7",
              borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              <Sprout size={36} color="#16a34a" />
            </div>
            <h3 style={{
              fontSize: "1.3rem", fontWeight: 900,
              color: "#14532d", fontFamily: "Nunito, sans-serif",
              marginBottom: 8
            }}>
              No listings yet!
            </h3>
            <p style={{
              color: "#4d7c0f", fontFamily: "Nunito, sans-serif",
              marginBottom: 24
            }}>
              Create your first listing to start selling directly to buyers
            </p>
            <Link
              to="/farmer/create-listing"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", background: "#16a34a",
                color: "white", borderRadius: 12,
                textDecoration: "none", fontWeight: 800,
                fontFamily: "Nunito, sans-serif"
              }}
            >
              <PlusCircle size={18} /> Create First Listing
            </Link>
          </div>

        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20
          }}>
            {listings.map(listing => {
              const statusStyle = STATUS_STYLES[listing.status] || STATUS_STYLES.active
              const soldPercent = listing.quantity > 0
                ? Math.round((listing.quantitySold / listing.quantity) * 100)
                : 0

              return (
                <div key={listing._id} style={{
                  background: "white", borderRadius: 16,
                  border: "1px solid #dcfce7", overflow: "hidden"
                }} className="fade-in">

                  {/* Card header */}
                  <div style={{
                    padding: "16px 20px",
                    background: "linear-gradient(135deg, #14532d, #16a34a)"
                  }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start"
                    }}>
                      <div>
                        <p style={{
                          color: "#86efac", fontSize: "0.72rem",
                          fontFamily: "Nunito, sans-serif", marginBottom: 2
                        }}>
                          {listing.batchId}
                        </p>
                        <h3 style={{
                          color: "white", fontSize: "1.2rem",
                          fontWeight: 900, fontFamily: "Nunito, sans-serif"
                        }}>
                          {listing.cropName}
                        </h3>
                        <p style={{
                          color: "white", fontSize: "1.4rem",
                          fontWeight: 900, fontFamily: "Nunito, sans-serif"
                        }}>
                          ₹{listing.pricePerKg}/kg
                        </p>
                      </div>
                      <span style={{
                        padding: "4px 12px", borderRadius: 999,
                        fontSize: "0.72rem", fontWeight: 700,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        fontFamily: "Nunito, sans-serif"
                      }}>
                        {statusStyle.label}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "16px 20px" }}>

                    {/* Progress bar */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        marginBottom: 6
                      }}>
                        <span style={{
                          fontSize: "0.78rem", color: "#4d7c0f",
                          fontFamily: "Nunito, sans-serif", fontWeight: 600
                        }}>
                          Sold: {listing.quantitySold || 0} {listing.quantityUnit}
                        </span>
                        <span style={{
                          fontSize: "0.78rem", color: "#4d7c0f",
                          fontFamily: "Nunito, sans-serif", fontWeight: 600
                        }}>
                          Available: {listing.availableQuantity} {listing.quantityUnit}
                        </span>
                      </div>
                      <div style={{
                        height: 8, background: "#f0fdf4",
                        borderRadius: 999, overflow: "hidden"
                      }}>
                        <div style={{
                          height: "100%",
                          width: `${soldPercent}%`,
                          background: "#16a34a",
                          borderRadius: 999,
                          transition: "width 0.5s ease"
                        }} />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr",
                      gap: 10, marginBottom: 14
                    }}>
                      <div style={{
                        padding: "8px 10px",
                        background: "#f0fdf4", borderRadius: 8
                      }}>
                        <p style={{
                          fontSize: "0.68rem", color: "#4d7c0f",
                          fontFamily: "Nunito, sans-serif", fontWeight: 600
                        }}>
                          👁️ Views
                        </p>
                        <p style={{
                          fontSize: "1rem", fontWeight: 900,
                          color: "#14532d", fontFamily: "Nunito, sans-serif"
                        }}>
                          {listing.views || 0}
                        </p>
                      </div>
                      <div style={{
                        padding: "8px 10px",
                        background: "#f0fdf4", borderRadius: 8
                      }}>
                        <p style={{
                          fontSize: "0.68rem", color: "#4d7c0f",
                          fontFamily: "Nunito, sans-serif", fontWeight: 600
                        }}>
                          <Clock size={10} style={{ display: "inline" }} /> Expires
                        </p>
                        <p style={{
                          fontSize: "0.82rem", fontWeight: 800,
                          color: "#14532d", fontFamily: "Nunito, sans-serif"
                        }}>
                          {listing.availableTill
                            ? new Date(listing.availableTill).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short"
                              })
                            : "N/A"
                          }
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 10 }}>
                      <Link
                        to={`/marketplace/${listing._id}`}
                        style={{
                          flex: 1, padding: "10px",
                          background: "#f0fdf4",
                          color: "#15803d",
                          border: "1px solid #bbf7d0",
                          borderRadius: 10,
                          textDecoration: "none",
                          fontWeight: 700, fontSize: "0.85rem",
                          fontFamily: "Nunito, sans-serif",
                          display: "flex", alignItems: "center",
                          justifyContent: "center", gap: 6
                        }}
                      >
                        <Eye size={15} /> View
                      </Link>
                      {listing.status === "active" && (
                        <button
                          onClick={() => handleCancel(listing._id)}
                          style={{
                            flex: 1, padding: "10px",
                            background: "#fef2f2",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                            borderRadius: 10, cursor: "pointer",
                            fontWeight: 700, fontSize: "0.85rem",
                            fontFamily: "Nunito, sans-serif",
                            display: "flex", alignItems: "center",
                            justifyContent: "center", gap: 6
                          }}
                        >
                          <XCircle size={15} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FarmerListings