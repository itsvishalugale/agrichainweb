import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Auth ───
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const logoutUser = () => api.post("/auth/logout");
export const getMe = () => api.get("/auth/me");

// ─── Batch ───
export const createBatch = (data) => api.post("/batch/create", data);
export const getMyBatches = () => api.get("/batch/my-batches");
export const getBatchById = (batchId) => api.get(`/batch/${batchId}`);
export const getAllBatches = () => api.get("/batch/admin/all");
export const updateProcessor = (batchId, data) =>
  api.put(`/batch/processor/${batchId}`, data);
export const updateWarehouse = (batchId, data) =>
  api.put(`/batch/warehouse/${batchId}`, data);
export const updateRetailer = (batchId, data) =>
  api.put(`/batch/retailer/${batchId}`, data);
export const markAsSold = (batchId) =>
  api.put(`/batch/retailer/${batchId}/sold`);

// ─── Listings ───
export const createListing = (data) => api.post("/listings/create", data);
export const getAllListings = (params) =>
  api.get("/listings", { params });
export const getListingById = (id) => api.get(`/listings/${id}`);
export const getMyListings = () => api.get("/listings/my/listings");
export const updateListingPrice = (id, data) =>
  api.put(`/listings/${id}/price`, data);
export const cancelListing = (id) => api.put(`/listings/${id}/cancel`);
export const getMandiPrices = (crop, state) =>
  api.get("/listings/mandi-prices", { params: { crop, state } });

// ─── Chat ───
export const startConversation = (data) => api.post("/chat/start", data);
export const getMyConversations = () => api.get("/chat/conversations");
export const getMessages = (conversationId) =>
  api.get(`/chat/${conversationId}/messages`);
export const sendMessage = (conversationId, data) =>
  api.post(`/chat/${conversationId}/send`, data);
export const acceptPriceOffer = (conversationId, data) =>
  api.put(`/chat/${conversationId}/accept-price`, data);

// ─── Orders ───
export const initiateOrder = (data) => api.post("/orders/initiate", data);
export const verifyPayment = (data) =>
  api.post("/orders/verify-payment", data);
export const getMyOrders = () => api.get("/orders/my-orders");
export const getFarmerOrders = () => api.get("/orders/farmer-orders");
export const updateOrderStatus = (id, data) =>
  api.put(`/orders/${id}/status`, data);
export const rateOrder = (id, data) => api.post(`/orders/${id}/rate`, data);

export default api;