import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { getAllListings, getMandiPrices } from "../../services/api"
import Navbar from "../../components/Navbar"
import {
  Search, Filter, MapPin, Star,
  Package, Shield, TrendingUp,
  ChevronDown, Sprout, ArrowRight
} from "lucide-react"

// ─── Listing Card Component ───
const ListingCard = ({ listing }) => {
  const GRADE_COLORS = {
    A: { bg: "#dcfce7", color: "#15803d", label: "Grade A — Premium" },
    B: { bg: "#dbeafe", color: "#1d4ed8", label: "Grade B — Standard" },
    C: { bg: "#fef3c7", color: "#d97706", label: "Grade C — Economy" },
  }
  const grade = GRADE_COLORS[listing.qualityGrade] || GRADE_COLORS.A

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid #dcfce7",
        overflow: "hidden",
        transition: "all 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(22,163,74,0.12)"
        e.currentTarget.style.transform = "translateY(-2px)"
        e.currentTarget.style.borderColor = "#86efac"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none"
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.borderColor = "#dcfce7"
      }}
    >
      {/* Card header */}
      <div style={{
        background: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
        padding: "20px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background decoration */}
        <div style={{
          position: "absolute", top: -20, right: -20,
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)"
        }} />

        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start"
        }}>
          <div>
            <p style={{
              color: "#86efac", fontSize: "0.75rem",
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600, marginBottom: 4
            }}>
              {listing.village || listing.location}
            </p>
            <h3 style={{
              fontSize: "1.4rem", fontWeight: 900,
              color: "white", fontFamily: "Nunito, sans-serif"
            }}>
              {listing.cropName}
            </h3>
          </div>

          {/* Blockchain verified badge */}
          {listing.blockchainVerified && (
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(255,255,255,0.15)",
              padding: "4px 10px", borderRadius: 999,
              backdropFilter: "blur(4px)"
            }}>
              <Shield size={12} color="#86efac" />
              <span style={{
                fontSize: "0.7rem", color: "#86efac",
                fontFamily: "Nunito, sans-serif", fontWeight: 700
              }}>
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div style={{ marginTop: 16 }}>
          <span style={{
            fontSize: "2rem", fontWeight: 900,
            color: "white", fontFamily: "Nunito, sans-serif"
          }}>
            ₹{listing.pricePerKg}
          </span>
          <span style={{
            fontSize: "0.85rem", color: "#86efac",
            fontFamily: "Nunito, sans-serif", marginLeft: 4
          }}>
            /kg
          </span>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px" }}>

        {/* Quality grade */}
        {listing.qualityGrade && (
          <span style={{
            display: "inline-block",
            padding: "3px 10px", borderRadius: 999,
            fontSize: "0.72rem", fontWeight: 700,
            background: grade.bg, color: grade.color,
            fontFamily: "Nunito, sans-serif",
            marginBottom: 12
          }}>
            ⭐ {grade.label}
          </span>
        )}

        {/* Details grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 8, marginBottom: 14
        }}>
          {[
            { icon: "📦", label: "Available", value: `${listing.availableQuantity} ${listing.quantityUnit}` },
            { icon: "📍", label: "Location",  value: listing.location },
            { icon: "🌱", label: "Min Order", value: `${listing.minOrderKg} kg` },
            { icon: "📅", label: "Harvested", value: listing.harvestDate
                ? new Date(listing.harvestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                : "Fresh"
            },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              padding: "8px 10px",
              background: "#f0fdf4", borderRadius: 8
            }}>
              <p style={{
                fontSize: "0.68rem", color: "#4d7c0f",
                fontFamily: "Nunito, sans-serif", fontWeight: 600
              }}>
                {icon} {label}
              </p>
              <p style={{
                fontSize: "0.8rem", color: "#14532d",
                fontFamily: "Nunito, sans-serif", fontWeight: 800,
                overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Farmer info */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "#f9fefb", borderRadius: 10,
          border: "1px solid #dcfce7",
          marginBottom: 14
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#16a34a", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontSize: 14 }}>👨‍🌾</span>
            </div>
            <div>
              <p style={{
                fontSize: "0.8rem", fontWeight: 800,
                color: "#14532d", fontFamily: "Nunito, sans-serif"
              }}>
                {listing.farmerName}
              </p>
              {listing.farmerRating > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Star size={10} color="#f59e0b" fill="#f59e0b" />
                  <span style={{
                    fontSize: "0.7rem", color: "#4d7c0f",
                    fontFamily: "Nunito, sans-serif"
                  }}>
                    {listing.farmerRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <span style={{
            fontSize: "0.7rem", color: "#86efac",
            fontFamily: "Nunito, sans-serif"
          }}>
            👁️ {listing.views} views
          </span>
        </div>

        {/* View button */}
        <Link
          to={`/marketplace/${listing._id}`}
          style={{
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
            padding: "11px", borderRadius: 12,
            background: "#16a34a", color: "white",
            textDecoration: "none", fontWeight: 800,
            fontSize: "0.9rem", fontFamily: "Nunito, sans-serif",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#15803d"}
          onMouseLeave={e => e.currentTarget.style.background = "#16a34a"}
        >
          View & Negotiate <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}

// ─── Mandi Price Ticker ───
const MandiTicker = ({ prices }) => {
  if (!prices || prices.length === 0) return null

  return (
    <div style={{
      background: "#14532d",
      padding: "8px 0",
      overflow: "hidden",
      position: "relative"
    }}>
      <div style={{
        display: "flex", gap: 40,
        animation: "ticker 20s linear infinite",
        whiteSpace: "nowrap"
      }}>
        {[...prices, ...prices].map((p, i) => (
          <span key={i} style={{
            color: "#86efac", fontSize: "0.8rem",
            fontFamily: "Nunito, sans-serif", fontWeight: 600
          }}>
            📊 {p.market}: ₹{p.modalPrice}/kg
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

// ─── Main Marketplace Component ───
const Marketplace = () => {
  const { user }                    = useAuth()
  const [listings,  setListings]    = useState([])
  const [loading,   setLoading]     = useState(true)
  const [search,    setSearch]      = useState("")
  const [filters,   setFilters]     = useState({
    grade:    "",
    minPrice: "",
    maxPrice: "",
    sortBy:   "newest"
  })
  const [mandiPrices, setMandiPrices] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchListings()
    fetchMandiPrices()
  }, [])

  const fetchListings = async (params = {}) => {
    try {
      setLoading(true)
      const res = await getAllListings(params)
      setListings(res.data.data.listings)
    } catch (error) {
      console.error("Failed to fetch listings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMandiPrices = async () => {
    try {
      const res = await getMandiPrices("Mango", "Maharashtra")
      setMandiPrices(res.data.data.prices || [])
    } catch (error) {
      console.error("Mandi prices error:", error)
    }
  }

  const handleSearch = () => {
    fetchListings({
      crop:     search,
      grade:    filters.grade,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sortBy:   filters.sortBy,
    })
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const inputStyle = {
    padding: "10px 16px",
    border: "2px solid #bbf7d0",
    borderRadius: 12, background: "white",
    color: "#14532d", fontFamily: "Nunito, sans-serif",
    fontWeight: 600, fontSize: "0.9rem",
    outline: "none", transition: "border-color 0.2s",
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4" }}>
      <Navbar />

      {/* Mandi price ticker */}
      <MandiTicker prices={mandiPrices} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }} className="fade-in">
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", flexWrap: "wrap", gap: 16
          }}>
            <div>
              <h1 style={{
                fontSize: "2rem", fontWeight: 900,
                color: "#14532d", fontFamily: "Nunito, sans-serif",
                marginBottom: 6
              }}>
                🛒 Farm Marketplace
              </h1>
              <p style={{
                color: "#4d7c0f", fontFamily: "Nunito, sans-serif"
              }}>
                Buy directly from verified farmers — no middlemen, blockchain guaranteed
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { label: "Active Listings", value: listings.length, icon: "🌾" },
                { label: "Verified",        value: listings.filter(l => l.blockchainVerified).length, icon: "🔗" },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{
                  padding: "12px 20px", background: "white",
                  borderRadius: 14, border: "1px solid #dcfce7",
                  textAlign: "center"
                }}>
                  <p style={{
                    fontSize: "1.5rem", fontWeight: 900,
                    color: "#16a34a", fontFamily: "Nunito, sans-serif"
                  }}>
                    {icon} {value}
                  </p>
                  <p style={{
                    fontSize: "0.75rem", color: "#4d7c0f",
                    fontFamily: "Nunito, sans-serif", fontWeight: 600
                  }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search and filter bar */}
        <div style={{
          background: "white", borderRadius: 16,
          padding: 20, marginBottom: 24,
          border: "1px solid #dcfce7",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
        }}>
          {/* Search row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={18} color="#86efac" style={{
                position: "absolute", left: 12,
                top: "50%", transform: "translateY(-50%)"
              }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search crops — Mango, Rice, Wheat..."
                style={{ ...inputStyle, paddingLeft: 40, width: "100%", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#16a34a"}
                onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
              />
            </div>
            <button
              onClick={handleSearch}
              style={{
                padding: "10px 24px", background: "#16a34a",
                color: "white", border: "none", borderRadius: 12,
                cursor: "pointer", fontWeight: 800,
                fontSize: "0.95rem", fontFamily: "Nunito, sans-serif",
                display: "flex", alignItems: "center", gap: 8
              }}
            >
              <Search size={16} /> Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: "10px 16px", background: showFilters ? "#dcfce7" : "#f0fdf4",
                color: "#16a34a", border: "2px solid #bbf7d0",
                borderRadius: 12, cursor: "pointer", fontWeight: 700,
                fontFamily: "Nunito, sans-serif",
                display: "flex", alignItems: "center", gap: 6
              }}
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={14} style={{
                transform: showFilters ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s"
              }} />
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12, paddingTop: 12,
              borderTop: "1px solid #f0fdf4"
            }} className="fade-in">

              {/* Grade filter */}
              <div>
                <label style={{
                  display: "block", fontSize: "0.78rem",
                  fontWeight: 700, color: "#14532d",
                  marginBottom: 6, fontFamily: "Nunito, sans-serif"
                }}>
                  Quality Grade
                </label>
                <select
                  value={filters.grade}
                  onChange={e => handleFilterChange("grade", e.target.value)}
                  style={{ ...inputStyle, width: "100%", cursor: "pointer" }}
                >
                  <option value="">All Grades</option>
                  <option value="A">⭐ Grade A — Premium</option>
                  <option value="B">👍 Grade B — Standard</option>
                  <option value="C">✔️ Grade C — Economy</option>
                </select>
              </div>

              {/* Min price */}
              <div>
                <label style={{
                  display: "block", fontSize: "0.78rem",
                  fontWeight: 700, color: "#14532d",
                  marginBottom: 6, fontFamily: "Nunito, sans-serif"
                }}>
                  Min Price (₹/kg)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={e => handleFilterChange("minPrice", e.target.value)}
                  placeholder="0"
                  style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#16a34a"}
                  onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                />
              </div>

              {/* Max price */}
              <div>
                <label style={{
                  display: "block", fontSize: "0.78rem",
                  fontWeight: 700, color: "#14532d",
                  marginBottom: 6, fontFamily: "Nunito, sans-serif"
                }}>
                  Max Price (₹/kg)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={e => handleFilterChange("maxPrice", e.target.value)}
                  placeholder="1000"
                  style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#16a34a"}
                  onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                />
              </div>

              {/* Sort */}
              <div>
                <label style={{
                  display: "block", fontSize: "0.78rem",
                  fontWeight: 700, color: "#14532d",
                  marginBottom: 6, fontFamily: "Nunito, sans-serif"
                }}>
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={e => handleFilterChange("sortBy", e.target.value)}
                  style={{ ...inputStyle, width: "100%", cursor: "pointer" }}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Best Rated</option>
                </select>
              </div>

              {/* Apply button */}
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  onClick={handleSearch}
                  style={{
                    width: "100%", padding: "10px",
                    background: "#16a34a", color: "white",
                    border: "none", borderRadius: 12,
                    cursor: "pointer", fontWeight: 800,
                    fontFamily: "Nunito, sans-serif"
                  }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Listings grid */}
        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20
          }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{
                height: 380, background: "white",
                borderRadius: 16, border: "1px solid #dcfce7",
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
              fontSize: "1.4rem", fontWeight: 900,
              color: "#14532d", fontFamily: "Nunito, sans-serif",
              marginBottom: 8
            }}>
              No listings found
            </h3>
            <p style={{
              color: "#4d7c0f", fontFamily: "Nunito, sans-serif"
            }}>
              {search
                ? `No crops matching "${search}" found`
                : "No active listings right now. Check back soon!"
              }
            </p>
          </div>

        ) : (
          <>
            <p style={{
              fontSize: "0.85rem", color: "#4d7c0f",
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600, marginBottom: 16
            }}>
              Showing {listings.length} verified listings
            </p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20
            }}>
              {listings.map(listing => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Marketplace