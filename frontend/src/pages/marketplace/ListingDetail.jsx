import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useSocket } from "../../context/SocketContext"
import {
  getListingById,
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  acceptPriceOffer,
  initiateOrder,
  verifyPayment,
} from "../../services/api"
import Navbar from "../../components/Navbar"
import toast from "react-hot-toast"
import {
  Shield, MapPin, TrendingUp, ArrowLeft,
  ExternalLink, ShoppingCart, MessageCircle,
  Loader2, Send, IndianRupee, Star,
  CheckCircle, Package
} from "lucide-react"

// ─── Mandi Price Widget ───
const MandiPriceWidget = ({ prices, stats, listingPrice }) => {
  if (!prices || prices.length === 0) return null

  return (
    <div style={{
      background: "white", borderRadius: 16,
      border: "1px solid #dcfce7", padding: 20,
      marginBottom: 20
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        gap: 8, marginBottom: 16
      }}>
        <TrendingUp size={18} color="#16a34a" />
        <h3 style={{
          fontWeight: 900, color: "#14532d",
          fontFamily: "Nunito, sans-serif", fontSize: "1rem"
        }}>
          Live Mandi Prices
        </h3>
        <span style={{
          fontSize: "0.7rem", color: "#4d7c0f",
          fontFamily: "Nunito, sans-serif",
          background: "#dcfce7", padding: "2px 8px",
          borderRadius: 999
        }}>
          Updated today
        </span>
      </div>

      {stats && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10, marginBottom: 16
        }}>
          {[
            { label: "Avg Price", value: `₹${stats.average}/kg`, color: "#16a34a" },
            { label: "Highest",   value: `₹${stats.highest}/kg`, color: "#d97706" },
            { label: "Lowest",    value: `₹${stats.lowest}/kg`,  color: "#3b82f6" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              padding: "10px", background: "#f0fdf4",
              borderRadius: 10, textAlign: "center"
            }}>
              <p style={{
                fontSize: "0.68rem", color: "#4d7c0f",
                fontFamily: "Nunito, sans-serif", fontWeight: 600
              }}>
                {label}
              </p>
              <p style={{
                fontSize: "0.95rem", fontWeight: 900,
                color, fontFamily: "Nunito, sans-serif"
              }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div style={{
          padding: "10px 14px", borderRadius: 10,
          background: listingPrice <= stats.average ? "#dcfce7" : "#fef3c7",
          border: `1px solid ${listingPrice <= stats.average ? "#bbf7d0" : "#fde68a"}`,
          marginBottom: 16
        }}>
          <p style={{
            fontSize: "0.82rem", fontWeight: 700,
            fontFamily: "Nunito, sans-serif",
            color: listingPrice <= stats.average ? "#15803d" : "#d97706"
          }}>
            {listingPrice <= stats.average
              ? `✅ Below mandi average (₹${stats.average}/kg) — Great deal!`
              : `ℹ️ Above mandi average (₹${stats.average}/kg) — Direct farm premium`
            }
          </p>
        </div>
      )}

      <div style={{ maxHeight: 180, overflowY: "auto" }}>
        {prices.slice(0, 6).map((p, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "8px 0",
            borderBottom: "1px solid #f0fdf4"
          }}>
            <div>
              <p style={{
                fontSize: "0.82rem", fontWeight: 700,
                color: "#14532d", fontFamily: "Nunito, sans-serif"
              }}>
                {p.market}
              </p>
              <p style={{
                fontSize: "0.72rem", color: "#86efac",
                fontFamily: "Nunito, sans-serif"
              }}>
                {p.district}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{
                fontSize: "0.95rem", fontWeight: 900,
                color: "#16a34a", fontFamily: "Nunito, sans-serif"
              }}>
                ₹{p.modalPrice}/kg
              </p>
              <p style={{
                fontSize: "0.68rem", color: "#86efac",
                fontFamily: "Nunito, sans-serif"
              }}>
                ₹{p.minPrice} — ₹{p.maxPrice}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Chat Window ───
const ChatWindow = ({
  conversation,
  messages,
  onSendMessage,
  onSendPriceOffer,
  onAcceptPrice,
  currentUser,
  listing,
  sending
}) => {
  const [text,       setText]       = useState("")
  const [offerPrice, setOfferPrice] = useState("")
  const [showOffer,  setShowOffer]  = useState(false)
  const messagesEndRef               = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!text.trim()) return
    onSendMessage(text)
    setText("")
  }

  const handleOffer = () => {
    if (!offerPrice || Number(offerPrice) <= 0) {
      toast.error("Enter valid price")
      return
    }
    onSendPriceOffer(Number(offerPrice))
    setOfferPrice("")
    setShowOffer(false)
  }

  const isFarmer = currentUser?.role === "farmer"

  // Normalize IDs because auth/API responses may use different ID shapes.
  const getUserId = (value) => {
    if (!value) return ""
    if (typeof value === "object") {
      return String(value._id || value.id || value.userId || "")
    }
    return String(value)
  }

  // AuthContext can expose the logged-in user's ID as _id or id.
  const currentUserId = getUserId(
    currentUser?._id || currentUser?.id || currentUser?.userId
  )

  return (
    <div style={{
      background: "white", borderRadius: 16,
      border: "1px solid #dcfce7",
      display: "flex", flexDirection: "column",
      height: 500
    }}>
      {/* Chat header */}
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid #dcfce7",
        background: "#f0fdf4",
        borderRadius: "16px 16px 0 0",
        display: "flex", alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#16a34a", display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ fontSize: 16 }}>
              {isFarmer ? "🛒" : "👨‍🌾"}
            </span>
          </div>
          <div>
            <p style={{
              fontWeight: 800, color: "#14532d",
              fontFamily: "Nunito, sans-serif", fontSize: "0.9rem"
            }}>
              {isFarmer
                ? conversation?.buyerId?.name || "Buyer"
                : listing.farmerName
              }
            </p>
            <p style={{
              fontSize: "0.72rem", color: "#4d7c0f",
              fontFamily: "Nunito, sans-serif"
            }}>
              About: {listing.cropName} @ ₹{listing.pricePerKg}/kg
            </p>
          </div>
        </div>
        {conversation?.isAgreed && (
          <span style={{
            padding: "4px 10px",
            background: "#dcfce7", color: "#15803d",
            borderRadius: 999, fontSize: "0.72rem",
            fontWeight: 700, fontFamily: "Nunito, sans-serif"
          }}>
            ✅ Agreed: ₹{conversation.agreedPrice}/kg
          </span>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "16px", display: "flex",
        flexDirection: "column", gap: 10
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "2rem",
            color: "#86efac"
          }}>
            <MessageCircle size={40}
              style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{
              fontFamily: "Nunito, sans-serif", fontWeight: 600
            }}>
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const senderId = getUserId(
              msg.senderId || msg.sender || msg.userId
            )
            // Prefer IDs; use senderName only when the API did not return an ID.
            const isMe = currentUserId && senderId
              ? senderId === currentUserId
              : Boolean(
                  currentUser?.name &&
                  msg.senderName &&
                  msg.senderName === currentUser.name
                )

            // System messages
            if (msg.type === "order_placed" || msg.type === "system") {
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "6px 14px",
                    background: "#dbeafe", color: "#1d4ed8",
                    borderRadius: 999, fontSize: "0.78rem",
                    fontWeight: 700, fontFamily: "Nunito, sans-serif"
                  }}>
                    {msg.message}
                  </span>
                </div>
              )
            }

            // Price offer message
            if (msg.type === "price_offer") {
              return (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start"
                }}>
                  <div style={{
                    maxWidth: "75%",
                    background: "#fef3c7",
                    border: "1px solid #fde68a",
                    borderRadius: 12, padding: 12
                  }}>
                    <p style={{
                      fontSize: "0.72rem", color: "#d97706",
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 700, marginBottom: 4
                    }}>
                      💰 Price Offer
                    </p>
                    <p style={{
                      fontSize: "1.2rem", fontWeight: 900,
                      color: "#92400e",
                      fontFamily: "Nunito, sans-serif"
                    }}>
                      ₹{msg.offeredPrice}/kg
                    </p>
                    <p style={{
                      fontSize: "0.78rem", color: "#78350f",
                      fontFamily: "Nunito, sans-serif"
                    }}>
                      {msg.message}
                    </p>
                    {!isMe && isFarmer && !conversation?.isAgreed && (
                      <button
                        onClick={() => onAcceptPrice(msg.offeredPrice)}
                        style={{
                          marginTop: 8, padding: "6px 16px",
                          background: "#16a34a", color: "white",
                          border: "none", borderRadius: 8,
                          cursor: "pointer", fontWeight: 700,
                          fontSize: "0.82rem",
                          fontFamily: "Nunito, sans-serif"
                        }}
                      >
                        ✅ Accept ₹{msg.offeredPrice}/kg
                      </button>
                    )}
                    <p style={{
                      fontSize: "0.65rem", color: "#86efac",
                      fontFamily: "Nunito, sans-serif",
                      marginTop: 4,
                      textAlign: isMe ? "right" : "left"
                    }}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              )
            }

            // Price accepted message
            if (msg.type === "price_accepted") {
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    background: "#dcfce7", color: "#15803d",
                    borderRadius: 12, fontSize: "0.85rem",
                    fontWeight: 700, fontFamily: "Nunito, sans-serif"
                  }}>
                    {msg.message}
                  </span>
                </div>
              )
            }

            // Normal text message
            return (
              <div key={i} style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start"
              }}>
                <div style={{ maxWidth: "75%" }}>
                  {!isMe && (
                    <p style={{
                      fontSize: "0.68rem", color: "#86efac",
                      fontFamily: "Nunito, sans-serif",
                      marginBottom: 3, marginLeft: 4
                    }}>
                      {msg.senderName}
                    </p>
                  )}
                  <div style={{
                    padding: "10px 14px",
                    background: isMe ? "#16a34a" : "#f0fdf4",
                    borderRadius: isMe
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  }}>
                    <p style={{
                      fontSize: "0.88rem",
                      color: isMe ? "white" : "#14532d",
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 600
                    }}>
                      {msg.message}
                    </p>
                  </div>
                  <p style={{
                    fontSize: "0.65rem", color: "#86efac",
                    fontFamily: "Nunito, sans-serif",
                    marginTop: 3,
                    textAlign: isMe ? "right" : "left"
                  }}>
                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Price offer input */}
      {showOffer && (
        <div style={{
          padding: "12px 16px",
          background: "#fef3c7",
          borderTop: "1px solid #fde68a",
          display: "flex", gap: 10, alignItems: "center"
        }}>
          <IndianRupee size={16} color="#d97706" />
          <input
            type="number"
            value={offerPrice}
            onChange={e => setOfferPrice(e.target.value)}
            placeholder="Enter your offer price/kg"
            style={{
              flex: 1, padding: "8px 12px",
              border: "2px solid #fde68a",
              borderRadius: 10, background: "white",
              color: "#14532d",
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600, outline: "none"
            }}
          />
          <button
            onClick={handleOffer}
            style={{
              padding: "8px 16px", background: "#d97706",
              color: "white", border: "none",
              borderRadius: 10, cursor: "pointer",
              fontWeight: 700, fontFamily: "Nunito, sans-serif"
            }}
          >
            Send Offer
          </button>
          <button
            onClick={() => setShowOffer(false)}
            style={{
              padding: "8px 12px", background: "transparent",
              color: "#d97706", border: "1px solid #fde68a",
              borderRadius: 10, cursor: "pointer",
              fontFamily: "Nunito, sans-serif"
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Message input */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #dcfce7",
        display: "flex", gap: 10, alignItems: "center",
        borderRadius: "0 0 16px 16px"
      }}>
        {!isFarmer && !showOffer && (
          <button
            onClick={() => setShowOffer(true)}
            style={{
              padding: "8px 12px",
              background: "#fef3c7",
              color: "#d97706",
              border: "1px solid #fde68a",
              borderRadius: 10, cursor: "pointer",
              fontWeight: 700, fontSize: "0.8rem",
              fontFamily: "Nunito, sans-serif",
              whiteSpace: "nowrap"
            }}
          >
            💰 Offer Price
          </button>
        )}
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: "10px 14px",
            border: "2px solid #bbf7d0",
            borderRadius: 12, background: "white",
            color: "#14532d",
            fontFamily: "Nunito, sans-serif",
            fontWeight: 600, outline: "none"
          }}
          onFocus={e => e.target.style.borderColor = "#16a34a"}
          onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          style={{
            width: 42, height: 42,
            background: sending || !text.trim()
              ? "#bbf7d0" : "#16a34a",
            color: "white", border: "none",
            borderRadius: 12,
            cursor: sending || !text.trim()
              ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center",
            justifyContent: "center"
          }}
        >
          {sending
            ? <Loader2 size={18}
                style={{ animation: "spin 1s linear infinite" }} />
            : <Send size={18} />
          }
        </button>
      </div>
    </div>
  )
}

// ─── Order Form ───
const OrderForm = ({ listing, conversation, onOrder, loading }) => {
  const [quantity, setQuantity] = useState(listing.minOrderKg)
  const [address,  setAddress]  = useState("")

  const finalPrice = conversation?.isAgreed
    ? conversation.agreedPrice
    : listing.pricePerKg

  const total = quantity * finalPrice

  return (
    <div style={{
      background: "white", borderRadius: 16,
      border: "2px solid #16a34a", padding: 20
    }}>
      <h3 style={{
        fontWeight: 900, color: "#14532d",
        fontFamily: "Nunito, sans-serif",
        marginBottom: 16, fontSize: "1.1rem"
      }}>
        🛒 Place Order
      </h3>

      {/* Price */}
      <div style={{
        padding: 14, background: "#f0fdf4",
        borderRadius: 12, marginBottom: 16
      }}>
        {conversation?.isAgreed ? (
          <p style={{
            fontSize: "0.85rem", color: "#15803d",
            fontFamily: "Nunito, sans-serif", fontWeight: 700
          }}>
            ✅ Negotiated: ₹{conversation.agreedPrice}/kg
            <span style={{
              color: "#86efac",
              textDecoration: "line-through", marginLeft: 8
            }}>
              ₹{listing.pricePerKg}/kg
            </span>
          </p>
        ) : (
          <p style={{
            fontSize: "0.85rem", color: "#15803d",
            fontFamily: "Nunito, sans-serif", fontWeight: 700
          }}>
            Listed Price: ₹{listing.pricePerKg}/kg
          </p>
        )}
      </div>

      {/* Quantity */}
      <div style={{ marginBottom: 14 }}>
        <label style={{
          display: "block", fontSize: "0.82rem",
          fontWeight: 700, color: "#14532d",
          marginBottom: 6, fontFamily: "Nunito, sans-serif"
        }}>
          Quantity (kg) — Min: {listing.minOrderKg}kg
        </label>
        <input
          type="number"
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          min={listing.minOrderKg}
          max={listing.availableQuantity}
          style={{
            width: "100%", padding: "10px 14px",
            border: "2px solid #bbf7d0",
            borderRadius: 12, background: "white",
            color: "#14532d",
            fontFamily: "Nunito, sans-serif",
            fontWeight: 600, outline: "none",
            boxSizing: "border-box"
          }}
        />
      </div>

      {/* Address */}
      <div style={{ marginBottom: 16 }}>
        <label style={{
          display: "block", fontSize: "0.82rem",
          fontWeight: 700, color: "#14532d",
          marginBottom: 6, fontFamily: "Nunito, sans-serif"
        }}>
          Delivery Address *
        </label>
        <textarea
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Enter your full delivery address..."
          rows={3}
          style={{
            width: "100%", padding: "10px 14px",
            border: "2px solid #bbf7d0",
            borderRadius: 12, background: "white",
            color: "#14532d",
            fontFamily: "Nunito, sans-serif",
            fontWeight: 600, outline: "none",
            resize: "vertical", boxSizing: "border-box"
          }}
        />
      </div>

      {/* Total */}
      <div style={{
        padding: "14px",
        background: "#14532d",
        borderRadius: 12, marginBottom: 16,
        display: "flex", justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <p style={{
            color: "#86efac", fontSize: "0.78rem",
            fontFamily: "Nunito, sans-serif"
          }}>
            {quantity} kg × ₹{finalPrice}/kg
          </p>
          <p style={{
            color: "white", fontSize: "1.4rem",
            fontWeight: 900, fontFamily: "Nunito, sans-serif"
          }}>
            ₹{total.toLocaleString("en-IN")}
          </p>
        </div>
        <ShoppingCart size={28} color="#86efac" />
      </div>

      {/* Pay button */}
      <button
        onClick={() => onOrder({ quantity, address, finalPrice })}
        disabled={
          loading ||
          !address.trim() ||
          quantity < listing.minOrderKg
        }
        style={{
          width: "100%", padding: "14px",
          background: loading ? "#86efac" : "#16a34a",
          color: "white", border: "none",
          borderRadius: 14,
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 900, fontSize: "1rem",
          fontFamily: "Nunito, sans-serif",
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: 18, height: 18,
              border: "2px solid rgba(255,255,255,0.4)",
              borderTopColor: "white", borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            Processing...
          </>
        ) : (
          <>
            <IndianRupee size={18} />
            Pay ₹{total.toLocaleString("en-IN")} via Razorpay
          </>
        )}
      </button>

      <p style={{
        textAlign: "center", marginTop: 10,
        fontSize: "0.72rem", color: "#86efac",
        fontFamily: "Nunito, sans-serif"
      }}>
        🔒 Secure payment via Razorpay Sandbox
      </p>
    </div>
  )
}

// ─── Main ListingDetail Component ───
const ListingDetail = () => {
  const { id }     = useParams()
  const { user }   = useAuth()
  const { socket } = useSocket()
  const navigate   = useNavigate()

  const [listing,             setListing]             = useState(null)
  const [mandiPrices,         setMandiPrices]         = useState([])
  const [priceStats,          setPriceStats]          = useState(null)
  const [loading,             setLoading]             = useState(true)
  const [conversation,        setConversation]        = useState(null)
  const [farmerConversations, setFarmerConversations] = useState([])
  const [messages,            setMessages]            = useState([])
  const [chatLoading,         setChatLoading]         = useState(false)
  const [sendingMsg,          setSendingMsg]          = useState(false)
  const [orderLoading,        setOrderLoading]        = useState(false)
  const [activeTab,           setActiveTab]           = useState("details")

  const isBuyer  = user?.role === "buyer"
  const isFarmer = user?.role === "farmer"

  // ─── Fetch listing on mount ───
  useEffect(() => {
    fetchListing()
  }, [id])

  // ─── When farmer opens chat tab → load conversations ───
  useEffect(() => {
    if (activeTab === "chat" && isFarmer && listing) {
      fetchFarmerConversations()
    }
  }, [activeTab, isFarmer, listing])

  // ─── Socket listeners ───
  useEffect(() => {
    if (!socket || !conversation) return

    socket.emit("joinConversation", conversation._id)

    socket.on("messageReceived", (newMsg) => {
      // When the farmer accepts a buyer's offer, update the buyer's
      // conversation state as well as showing the acceptance message.
      if (newMsg?.type === "price_accepted") {
        const acceptedPrice = Number(newMsg.offeredPrice)
        if (acceptedPrice > 0) {
          setConversation(prev => prev ? ({
            ...prev,
            isAgreed: true,
            agreedPrice: acceptedPrice
          }) : prev)
        }
      }

      setMessages(prev => {
        // Prevent duplicate messages
        const exists = prev.some(
          m => m._id && newMsg._id && String(m._id) === String(newMsg._id)
        )
        if (exists) return prev
        return [...prev, newMsg]
      })
    })

    socket.on("priceOfferReceived", (data) => {
      setMessages(prev => [...prev, data])
    })

    return () => {
      socket.off("messageReceived")
      socket.off("priceOfferReceived")
      socket.emit("leaveConversation", conversation._id)
    }
  }, [socket, conversation])

  // ─── Refresh buyer's agreement before showing the Order tab ───
  useEffect(() => {
    if (activeTab !== "order" || !isBuyer || !conversation?._id) return

    let cancelled = false
    const refreshConversationAgreement = async () => {
      try {
        const res = await getMyConversations()
        const convs = res.data.data.conversations || []
        const latest = convs.find(c =>
          String(c._id) === String(conversation._id)
        )

        if (!cancelled && latest) {
          setConversation(prev => prev && String(prev._id) === String(latest._id)
            ? {
                ...prev,
                ...latest,
                isAgreed: latest.isAgreed ?? prev.isAgreed,
                agreedPrice: latest.agreedPrice ?? prev.agreedPrice
              }
            : prev)
        }
      } catch (error) {
        console.error("Could not refresh negotiated price:", error)
      }
    }

    refreshConversationAgreement()
    return () => { cancelled = true }
  }, [activeTab, isBuyer, conversation?._id])

  // ─── Fetch listing details ───
  const fetchListing = async () => {
    try {
      setLoading(true)
      const res = await getListingById(id)
      setListing(res.data.data.listing)
      setMandiPrices(res.data.data.mandiPrices || [])
      setPriceStats(res.data.data.priceStats)
    } catch (error) {
      toast.error("Listing not found")
      navigate("/marketplace")
    } finally {
      setLoading(false)
    }
  }

  // ─── Fetch farmer's conversations for this listing ───
  const fetchFarmerConversations = async () => {
    if (!isFarmer) return
    try {
      setChatLoading(true)
      const res   = await getMyConversations()
      const convs = res.data.data.conversations

      // Filter conversations for THIS listing only
      const listingConvs = convs.filter(c => {
        const convListingId =
          c.listingId?._id || c.listingId
        return convListingId?.toString() === id
      })

      setFarmerConversations(listingConvs)

      if (listingConvs.length > 0) {
        // Auto select first conversation
        const first = listingConvs[0]
        setConversation(first)

        // Fetch its messages
        const msgRes = await getMessages(first._id)
        setMessages(msgRes.data.data.messages)
      }
      // If no conversations → conversation stays null
      // Farmer sees "No buyer chats yet"
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    } finally {
      setChatLoading(false)
    }
  }

  // ─── Switch between buyer conversations (farmer) ───
  const switchConversation = async (conv) => {
    try {
      // Leave current room
      if (conversation?._id) {
        socket?.emit("leaveConversation", conversation._id)
      }

      setConversation(conv)
      setMessages([])

      // Fetch messages
      const msgRes = await getMessages(conv._id)
      setMessages(msgRes.data.data.messages)

      // Join new room
      socket?.emit("joinConversation", conv._id)
    } catch (error) {
      toast.error("Failed to load messages")
    }
  }

  // ─── Buyer starts chat ───
  const handleStartChat = async () => {
    try {
      setChatLoading(true)
      const res  = await startConversation({ listingId: listing._id })
      const conv = res.data.data.conversation
      setConversation(conv)

      // Fetch messages (may have existing ones)
      const msgRes = await getMessages(conv._id)
      setMessages(msgRes.data.data.messages)
      setActiveTab("chat")
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not start chat"
      )
    } finally {
      setChatLoading(false)
    }
  }

  // ─── Send text message ───
  const handleSendMessage = async (text) => {
    if (!conversation) return
    try {
      setSendingMsg(true)
      const res = await sendMessage(conversation._id, {
        message: text,
        type:    "text"
      })

      const newMsg = res.data.data.message

      // Add to local state immediately
      setMessages(prev => [...prev, newMsg])

      // Emit via socket to receiver
      socket?.emit("newMessage", {
        conversationId: conversation._id,
        receiverId:     res.data.data.receiverId,
        message:        text,
        type:           "text",
        senderName:     user.name,
        senderId:       user._id || user.id || user.userId,
        _id:            newMsg._id,
        createdAt:      new Date()
      })
    } catch (error) {
      toast.error("Message failed to send")
    } finally {
      setSendingMsg(false)
    }
  }

  // ─── Send price offer ───
  const handleSendPriceOffer = async (price) => {
    if (!conversation) return
    try {
      setSendingMsg(true)
      const message = `I offer ₹${price}/kg for ${listing.cropName}`
      const res = await sendMessage(conversation._id, {
        message,
        type:         "price_offer",
        offeredPrice: price
      })

      const newMsg = res.data.data.message
      setMessages(prev => [...prev, newMsg])

      socket?.emit("priceOffer", {
        conversationId: conversation._id,
        receiverId:     res.data.data.receiverId,
        offeredPrice:   price,
        senderName:     user.name,
        senderId:       user._id || user.id || user.userId,
        message,
        type:           "price_offer",
        _id:            newMsg._id,
        createdAt:      new Date()
      })

      toast.success(`Price offer ₹${price}/kg sent!`)
    } catch (error) {
      toast.error("Failed to send price offer")
    } finally {
      setSendingMsg(false)
    }
  }

  // ─── Accept price offer (farmer) ───
  const handleAcceptPrice = async (price) => {
    if (!conversation) return
    try {
      await acceptPriceOffer(
        conversation._id,
        { offeredPrice: price }
      )

      // Update local conversation
      setConversation(prev => ({
        ...prev,
        isAgreed:    true,
        agreedPrice: price
      }))

      // Add acceptance message locally
      const acceptMsg = {
        message:      `✅ I accept ₹${price}/kg. Please place your order!`,
        type:         "price_accepted",
        offeredPrice: price,
        senderName:   user.name,
        senderId:     user._id || user.id || user.userId,
        createdAt:    new Date()
      }
      setMessages(prev => [...prev, acceptMsg])

      // Notify via socket
      socket?.emit("newMessage", {
        conversationId: conversation._id,
        receiverId:     conversation.buyerId?._id || conversation.buyerId,
        ...acceptMsg
      })

      toast.success(`Price ₹${price}/kg accepted! 🎉`)
    } catch (error) {
      toast.error("Failed to accept price")
    }
  }

  // ─── Place order with Razorpay ───
  const handleOrder = async ({ quantity, address, finalPrice }) => {
    try {
      setOrderLoading(true)

      // Create order + Razorpay order
      const res = await initiateOrder({
        listingId:       listing._id,
        quantity,
        deliveryAddress: address,
        conversationId:  conversation?._id,
        negotiatedPrice: conversation?.isAgreed
          ? conversation.agreedPrice
          : null,
      })

      const {
        razorpayOrderId,
        razorpayKeyId,
        amount,
        orderId
      } = res.data.data

      // Open Razorpay
      const options = {
        key:      razorpayKeyId,
        amount:   amount * 100,
        currency: "INR",
        name:     "AgriChain",
        description: `${listing.cropName} — ${quantity}kg`,
        order_id: razorpayOrderId,

        handler: async (response) => {
          try {
            await verifyPayment({
              orderId,
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            toast.success("🎉 Payment successful! Order confirmed!")
            navigate("/buyer/dashboard")
          } catch {
            toast.error("Payment verification failed!")
          }
        },

        prefill: {
          name:  user.name,
          email: user.email,
        },
        theme: { color: "#16a34a" },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled")
            setOrderLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Order failed!"
      )
      setOrderLoading(false)
    }
  }

  // ─── Loading state ───
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0fdf4" }}>
        <Navbar />
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", height: "60vh"
        }}>
          <div style={{
            width: 48, height: 48,
            border: "4px solid #dcfce7",
            borderTopColor: "#16a34a",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!listing) return null

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4" }}>
      <Navbar />

      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "24px 16px"
      }}>

        {/* Back button */}
        <button
          onClick={() => navigate("/marketplace")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none",
            color: "#4d7c0f", cursor: "pointer",
            fontWeight: 700, fontFamily: "Nunito, sans-serif",
            marginBottom: 20, fontSize: "0.9rem"
          }}
        >
          <ArrowLeft size={16} /> Back to Marketplace
        </button>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 24, alignItems: "start"
        }} className="listing-grid">

          {/* ─── LEFT COLUMN ─── */}
          <div>

            {/* Hero card */}
            <div style={{
              background: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
              borderRadius: 20, padding: 28,
              marginBottom: 20, position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute", top: -40, right: -40,
                width: 160, height: 160, borderRadius: "50%",
                background: "rgba(255,255,255,0.07)"
              }} />

              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: 20
              }}>
                <div>
                  <div style={{
                    display: "flex", alignItems: "center",
                    gap: 8, marginBottom: 6
                  }}>
                    <Shield size={14} color="#86efac" />
                    <span style={{
                      color: "#86efac", fontSize: "0.78rem",
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 600
                    }}>
                      Blockchain Verified
                    </span>
                  </div>
                  <h1 style={{
                    fontSize: "2.2rem", fontWeight: 900,
                    color: "white",
                    fontFamily: "Nunito, sans-serif"
                  }}>
                    {listing.cropName}
                  </h1>
                  <p style={{
                    color: "#86efac",
                    fontFamily: "Nunito, sans-serif"
                  }}>
                    <MapPin size={13} style={{
                      display: "inline", marginRight: 4
                    }} />
                    {listing.location}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{
                    fontSize: "2.5rem", fontWeight: 900,
                    color: "white",
                    fontFamily: "Nunito, sans-serif",
                    lineHeight: 1
                  }}>
                    ₹{listing.pricePerKg}
                  </p>
                  <p style={{
                    color: "#86efac", fontSize: "0.85rem",
                    fontFamily: "Nunito, sans-serif"
                  }}>
                    per kg
                  </p>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10
              }}>
                {[
                  { icon: "📦", label: "Available", value: `${listing.availableQuantity} ${listing.quantityUnit}` },
                  { icon: "⭐", label: "Grade",     value: listing.qualityGrade ? `Grade ${listing.qualityGrade}` : "N/A" },
                  { icon: "🌱", label: "Min Order", value: `${listing.minOrderKg} kg` },
                  { icon: "🧪", label: "Pesticide", value: listing.pesticide || "None" },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{
                    padding: "10px",
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: 10, textAlign: "center"
                  }}>
                    <p style={{ fontSize: 16, marginBottom: 2 }}>
                      {icon}
                    </p>
                    <p style={{
                      fontSize: "0.65rem", color: "#86efac",
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 600
                    }}>
                      {label}
                    </p>
                    <p style={{
                      fontSize: "0.82rem", color: "white",
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 800
                    }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex", gap: 4,
              background: "white", borderRadius: 14,
              padding: 6, marginBottom: 20,
              border: "1px solid #dcfce7"
            }}>
              {[
                { key: "details", label: "📋 Details" },
                { key: "chat",    label: "💬 Chat" },
                ...(isBuyer
                  ? [{ key: "order", label: "🛒 Order" }]
                  : []
                ),
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1, padding: "10px",
                    border: "none", borderRadius: 10,
                    cursor: "pointer", fontWeight: 800,
                    fontSize: "0.9rem",
                    fontFamily: "Nunito, sans-serif",
                    transition: "all 0.2s",
                    background: activeTab === tab.key
                      ? "#16a34a" : "transparent",
                    color: activeTab === tab.key
                      ? "white" : "#4d7c0f"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ─── DETAILS TAB ─── */}
            {activeTab === "details" && (
              <div className="fade-in">

                {listing.description && (
                  <div style={{
                    background: "white", borderRadius: 16,
                    border: "1px solid #dcfce7",
                    padding: 20, marginBottom: 20
                  }}>
                    <h3 style={{
                      fontWeight: 800, color: "#14532d",
                      fontFamily: "Nunito, sans-serif",
                      marginBottom: 10
                    }}>
                      About this listing
                    </h3>
                    <p style={{
                      color: "#4d7c0f",
                      fontFamily: "Nunito, sans-serif",
                      lineHeight: 1.7
                    }}>
                      {listing.description}
                    </p>
                  </div>
                )}

                {/* Farmer info */}
                <div style={{
                  background: "white", borderRadius: 16,
                  border: "1px solid #dcfce7",
                  padding: 20, marginBottom: 20
                }}>
                  <h3 style={{
                    fontWeight: 800, color: "#14532d",
                    fontFamily: "Nunito, sans-serif",
                    marginBottom: 14
                  }}>
                    👨‍🌾 About the Farmer
                  </h3>
                  <div style={{
                    display: "flex", alignItems: "center",
                    gap: 14
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: "50%",
                      background: "#16a34a", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 24
                    }}>
                      👨‍🌾
                    </div>
                    <div>
                      <p style={{
                        fontWeight: 900, color: "#14532d",
                        fontFamily: "Nunito, sans-serif",
                        fontSize: "1.1rem"
                      }}>
                        {listing.farmerName}
                      </p>
                      <p style={{
                        color: "#4d7c0f",
                        fontFamily: "Nunito, sans-serif",
                        fontSize: "0.85rem"
                      }}>
                        📍 {listing.village || listing.location}
                      </p>
                      {listing.farmerRating > 0 && (
                        <div style={{
                          display: "flex",
                          alignItems: "center", gap: 4
                        }}>
                          {[1,2,3,4,5].map(s => (
                            <Star
                              key={s}
                              size={14}
                              color="#f59e0b"
                              fill={s <= listing.farmerRating
                                ? "#f59e0b" : "none"
                              }
                            />
                          ))}
                          <span style={{
                            fontSize: "0.8rem", color: "#4d7c0f",
                            fontFamily: "Nunito, sans-serif",
                            marginLeft: 4
                          }}>
                            {listing.farmerRating.toFixed(1)}/5
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Blockchain proof */}
                {listing.blockchainHash && (
                  <div style={{
                    background: "#f3e8ff", borderRadius: 16,
                    border: "1px solid #ddd6fe", padding: 16
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center",
                      gap: 8, marginBottom: 8
                    }}>
                      <Shield size={16} color="#7c3aed" />
                      <p style={{
                        fontWeight: 800, color: "#7c3aed",
                        fontFamily: "Nunito, sans-serif"
                      }}>
                        Blockchain Verified Batch
                      </p>
                    </div>
                    <p style={{
                      fontSize: "0.78rem", color: "#6d28d9",
                      fontFamily: "Nunito, sans-serif",
                      wordBreak: "break-all", marginBottom: 10
                    }}>
                      Tx: {listing.blockchainHash}
                    </p>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${listing.blockchainHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center", gap: 6,
                        color: "#7c3aed", fontWeight: 700,
                        fontSize: "0.82rem",
                        fontFamily: "Nunito, sans-serif",
                        textDecoration: "none"
                      }}
                    >
                      View on Etherscan <ExternalLink size={13} />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* ─── CHAT TAB ─── */}
            {activeTab === "chat" && (
              <div className="fade-in">
                {chatLoading ? (
                  <div style={{
                    textAlign: "center", padding: "3rem",
                    background: "white", borderRadius: 20,
                    border: "1px solid #dcfce7"
                  }}>
                    <div style={{
                      width: 40, height: 40,
                      border: "3px solid #dcfce7",
                      borderTopColor: "#16a34a",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto 16px"
                    }} />
                    <p style={{
                      color: "#4d7c0f",
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 600
                    }}>
                      Loading conversations...
                    </p>
                  </div>
                ) : !conversation ? (
                  // No conversation yet
                  <div style={{
                    textAlign: "center", padding: "3rem",
                    background: "white", borderRadius: 20,
                    border: "1px solid #dcfce7"
                  }}>
                    <MessageCircle size={48} color="#86efac"
                      style={{ margin: "0 auto 16px", display: "block" }} />
                    <h3 style={{
                      fontWeight: 900, color: "#14532d",
                      fontFamily: "Nunito, sans-serif", marginBottom: 8
                    }}>
                      {isBuyer
                        ? "Chat with farmer to negotiate price"
                        : "No buyer chats yet for this listing"
                      }
                    </h3>
                    <p style={{
                      color: "#4d7c0f",
                      fontFamily: "Nunito, sans-serif",
                      marginBottom: 20
                    }}>
                      {isBuyer
                        ? "Ask questions, negotiate price, then place order"
                        : "When buyers message you, they will appear here"
                      }
                    </p>
                    {isBuyer && (
                      <button
                        onClick={handleStartChat}
                        disabled={chatLoading}
                        style={{
                          padding: "12px 28px",
                          background: "#16a34a", color: "white",
                          border: "none", borderRadius: 12,
                          cursor: "pointer", fontWeight: 800,
                          fontSize: "1rem",
                          fontFamily: "Nunito, sans-serif",
                          display: "inline-flex",
                          alignItems: "center", gap: 8
                        }}
                      >
                        <MessageCircle size={18} />
                        Start Negotiation
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Farmer — conversation switcher */}
                    {isFarmer && farmerConversations.length > 1 && (
                      <div style={{
                        background: "white", borderRadius: 14,
                        border: "1px solid #dcfce7",
                        marginBottom: 16, overflow: "hidden"
                      }}>
                        <p style={{
                          padding: "12px 16px",
                          fontWeight: 800, color: "#14532d",
                          fontFamily: "Nunito, sans-serif",
                          borderBottom: "1px solid #f0fdf4",
                          fontSize: "0.9rem"
                        }}>
                          💬 All Buyers ({farmerConversations.length})
                        </p>
                        {farmerConversations.map(conv => (
                          <div
                            key={conv._id}
                            onClick={() => switchConversation(conv)}
                            style={{
                              padding: "12px 16px",
                              cursor: "pointer",
                              background: conversation._id === conv._id
                                ? "#f0fdf4" : "white",
                              borderBottom: "1px solid #f9fefb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between"
                            }}
                            onMouseEnter={e =>
                              e.currentTarget.style.background = "#f0fdf4"
                            }
                            onMouseLeave={e =>
                              e.currentTarget.style.background =
                                conversation._id === conv._id
                                  ? "#f0fdf4" : "white"
                            }
                          >
                            <div>
                              <p style={{
                                fontWeight: 700, color: "#14532d",
                                fontFamily: "Nunito, sans-serif",
                                fontSize: "0.85rem"
                              }}>
                                🛒 {conv.buyerId?.name || "Buyer"}
                              </p>
                              <p style={{
                                fontSize: "0.72rem", color: "#86efac",
                                fontFamily: "Nunito, sans-serif"
                              }}>
                                {conv.lastMessage || "No messages yet"}
                              </p>
                            </div>
                            <div style={{
                              display: "flex",
                              alignItems: "center", gap: 8
                            }}>
                              {conv.isAgreed && (
                                <span style={{
                                  fontSize: "0.7rem", color: "#15803d",
                                  fontFamily: "Nunito, sans-serif",
                                  fontWeight: 700
                                }}>
                                  ✅ ₹{conv.agreedPrice}/kg
                                </span>
                              )}
                              {conv.farmerUnread > 0 && (
                                <span style={{
                                  background: "#dc2626", color: "white",
                                  borderRadius: "50%",
                                  width: 20, height: 20,
                                  fontSize: "0.7rem", fontWeight: 700,
                                  display: "flex", alignItems: "center",
                                  justifyContent: "center"
                                }}>
                                  {conv.farmerUnread}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Chat window */}
                    <ChatWindow
                      conversation={conversation}
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      onSendPriceOffer={handleSendPriceOffer}
                      onAcceptPrice={handleAcceptPrice}
                      currentUser={user}
                      listing={listing}
                      sending={sendingMsg}
                    />
                  </>
                )}
              </div>
            )}

            {/* ─── ORDER TAB ─── */}
            {activeTab === "order" && isBuyer && (
              <div className="fade-in">
                {!conversation?.isAgreed && (
                  <div style={{
                    padding: "12px 16px", background: "#fef3c7",
                    borderRadius: 12, border: "1px solid #fde68a",
                    marginBottom: 16
                  }}>
                    <p style={{
                      fontSize: "0.85rem", color: "#d97706",
                      fontFamily: "Nunito, sans-serif", fontWeight: 700
                    }}>
                      💡 Tip: Negotiate price in Chat tab first for a better deal!
                    </p>
                  </div>
                )}
                <OrderForm
                  listing={listing}
                  conversation={conversation}
                  onOrder={handleOrder}
                  loading={orderLoading}
                />
              </div>
            )}
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div>

            {/* Quick actions for buyer */}
            {isBuyer && (
              <div style={{
                background: "white", borderRadius: 16,
                border: "1px solid #dcfce7",
                padding: 16, marginBottom: 20
              }}>
                <h3 style={{
                  fontWeight: 800, color: "#14532d",
                  fontFamily: "Nunito, sans-serif",
                  marginBottom: 12, fontSize: "0.95rem"
                }}>
                  Quick Actions
                </h3>
                <div style={{
                  display: "flex", flexDirection: "column", gap: 10
                }}>
                  <button
                    onClick={() => {
                      if (!conversation) handleStartChat()
                      else setActiveTab("chat")
                    }}
                    style={{
                      padding: "12px", background: "#f0fdf4",
                      color: "#15803d",
                      border: "2px solid #bbf7d0",
                      borderRadius: 12, cursor: "pointer",
                      fontWeight: 800,
                      fontFamily: "Nunito, sans-serif",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 8
                    }}
                  >
                    <MessageCircle size={18} />
                    {conversation
                      ? "Continue Chat"
                      : "Negotiate with Farmer"
                    }
                  </button>
                  <button
                    onClick={() => setActiveTab("order")}
                    style={{
                      padding: "12px", background: "#16a34a",
                      color: "white", border: "none",
                      borderRadius: 12, cursor: "pointer",
                      fontWeight: 800,
                      fontFamily: "Nunito, sans-serif",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 8
                    }}
                  >
                    <ShoppingCart size={18} />
                    Buy @ ₹{conversation?.isAgreed
                      ? conversation.agreedPrice
                      : listing.pricePerKg
                    }/kg
                  </button>
                </div>
              </div>
            )}

            {/* Mandi prices */}
            <MandiPriceWidget
              prices={mandiPrices}
              stats={priceStats}
              listingPrice={listing.pricePerKg}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 768px) {
          .listing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default ListingDetail