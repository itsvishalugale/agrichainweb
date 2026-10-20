import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { SocketProvider } from "./context/SocketContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Loader from "./components/Loader"

// Existing pages
import Login              from "./pages/Login"
import Register           from "./pages/Register"
import FarmerDashboard    from "./pages/farmer/FarmerDashboard"
import AddBatch           from "./pages/farmer/AddBatch"
import ProcessorDashboard from "./pages/processor/ProcessorDashboard"
import WarehouseDashboard from "./pages/warehouse/WarehouseDashboard"
import RetailerDashboard  from "./pages/retailer/RetailerDashboard"
import ConsumerScan       from "./pages/consumer/ConsumerScan"
import AdminDashboard     from "./pages/admin/AdminDashboard"

// New pages
import Marketplace        from "./pages/marketplace/Marketplace"
import ListingDetail      from "./pages/marketplace/ListingDetail"
import FarmerListings     from "./pages/farmer/FarmerListings"
import CreateListing      from "./pages/farmer/CreateListing"
import BuyerDashboard     from "./pages/buyer/BuyerDashboard"
import FarmerOrders       from "./pages/farmer/FarmerOrders"

const RoleRedirect = () => {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />

  // Redirect based on role
  const redirectMap = {
    farmer:    "/farmer/dashboard",
    processor: "/processor/dashboard",
    warehouse: "/warehouse/dashboard",
    retailer:  "/retailer/dashboard",
    buyer:     "/buyer/dashboard",
    admin:     "/admin/dashboard",
  }
  return <Navigate to={redirectMap[user.role] || "/login"} replace />
}

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600,
              borderRadius: 12
            },
            success: { style: { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" } },
            error:   { style: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/consumer/scan"  element={<ConsumerScan />} />
          <Route path="/batch/:batchId" element={<ConsumerScan />} />
          <Route path="/"               element={<RoleRedirect />} />

          {/* Farmer */}
          <Route path="/farmer/dashboard" element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <FarmerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/farmer/add-batch" element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <AddBatch />
            </ProtectedRoute>
          } />
          <Route path="/farmer/listings" element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <FarmerListings />
            </ProtectedRoute>
          } />
          <Route path="/farmer/create-listing" element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <CreateListing />
            </ProtectedRoute>
          } />
          <Route path="/farmer/orders" element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <FarmerOrders />
            </ProtectedRoute>
          } />

          {/* Processor */}
          <Route path="/processor/dashboard" element={
            <ProtectedRoute allowedRoles={["processor"]}>
              <ProcessorDashboard />
            </ProtectedRoute>
          } />

          {/* Warehouse */}
          <Route path="/warehouse/dashboard" element={
            <ProtectedRoute allowedRoles={["warehouse"]}>
              <WarehouseDashboard />
            </ProtectedRoute>
          } />

          {/* Retailer */}
          <Route path="/retailer/dashboard" element={
            <ProtectedRoute allowedRoles={["retailer"]}>
              <RetailerDashboard />
            </ProtectedRoute>
          } />

          {/* Buyer */}
          <Route path="/buyer/dashboard" element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <BuyerDashboard />
            </ProtectedRoute>
          } />

          {/* Marketplace — both farmer and buyer */}
          <Route path="/marketplace" element={
            <ProtectedRoute allowedRoles={["farmer", "buyer", "admin"]}>
              <Marketplace />
            </ProtectedRoute>
          } />
          <Route path="/marketplace/:id" element={
            <ProtectedRoute allowedRoles={["farmer", "buyer", "admin"]}>
              <ListingDetail />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App