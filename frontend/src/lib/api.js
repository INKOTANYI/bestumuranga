import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

export async function csrf() {
  // Required before any auth POST to set the CSRF cookie
  await api.get('/sanctum/csrf-cookie');
}

export async function register(payload) {
  await csrf();
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function login(email, password) {
  await csrf();
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function checkEmailAvailable(email) {
  const { data } = await api.get('/api/auth/check-email', { params: { email } });
  return data;
}

export async function checkPhoneAvailable(phone) {
  const { data } = await api.get('/api/auth/check-phone', { params: { phone } });
  return data;
}

export async function me() {
  const { data } = await api.get('/api/auth/me');
  return data;
}

export async function logout() {
  await csrf();
  const { data } = await api.post('/auth/logout');
  return data;
}

// Categories
export async function getCategories() {
  const { data } = await api.get('/api/categories');
  return data;
}

// Public listings
export async function getListingsPublic(params = {}) {
  const { data } = await api.get('/api/listings', { params });
  return data;
}

export async function getListing(id) {
  const { data } = await api.get(`/api/listings/${id}`);
  return data;
}

// Inquiries
export async function createInquiry(payload) {
  await csrf();
  const { data } = await api.post('/api/inquiries', payload);
  return data;
}

// Broker request
export async function requestBroker() {
  await csrf();
  const { data } = await api.post('/api/auth/request-broker');
  return data;
}

// Broker listings (auth)
export async function brokerList() {
  const { data } = await api.get('/api/broker/listings');
  return data;
}

export async function brokerCreate(formData) {
  await csrf();
  const { data } = await api.post('/api/broker/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function brokerUpdate(id, formData) {
  await csrf();
  const { data } = await api.put(`/api/broker/listings/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function brokerDelete(id) {
  await csrf();
  const { data } = await api.delete(`/api/broker/listings/${id}`);
  return data;
}

// Broker inquiries
export async function brokerInquiriesList() {
  const { data } = await api.get('/api/broker/inquiries');
  return data; // { data: [] }
}

export async function brokerInquiryRespond(id) {
  const { data } = await api.post(`/api/broker/inquiries/${id}/respond`);
  return data; // { data: { ...inquiry } }
}

// Admin brokers
export async function adminPendingBrokers() {
  const { data } = await api.get('/api/admin/brokers/pending');
  return data;
}

export async function adminApproveBroker(id) {
  await csrf();
  const { data } = await api.post(`/api/admin/brokers/${id}/approve`);
  return data;
}

export async function adminRejectBroker(id) {
  await csrf();
  const { data } = await api.post(`/api/admin/brokers/${id}/reject`);
  return data;
}

export async function adminUpdateQuota(id, quota) {
  await csrf();
  const { data } = await api.post(`/api/admin/brokers/${id}/quota`, quota);
  return data;
}

// AI: Listing description generator (auth: broker/admin)
export async function generateListingDescription(payload) {
  const { data } = await api.post('/api/v1/ai/listing-descriptions', payload, { withCredentials: false });
  return data; // { description }
}

// Metrics (broker/admin): listings per day (last 7 days)
export async function getListings7d() {
  const { data } = await api.get('/api/metrics/listings-7d');
  return data; // { days:[], counts:[], total }
}

// Admin placeholder data (requires role:admin)
export async function adminSupportInbox() {
  const { data } = await api.get('/api/admin/support/inbox');
  return data; // { open, items: [] }
}

export async function adminProjectsList() {
  const { data } = await api.get('/api/admin/projects');
  return data; // { pending, items: [] }
}

export async function adminPropertiesPending() {
  const { data } = await api.get('/api/admin/properties/pending');
  return data; // { pending, items: [] }
}

// Admin: category metrics and listings
export async function adminCategoryCounts() {
  const { data } = await api.get('/api/admin/categories/counts');
  return data; // { houses, plots, cars }
}

export async function adminListingsByCategory({ categoryKey, categoryId, page = 1, perPage = 10 } = {}) {
  const params = { page, per_page: perPage };
  if (categoryId) params.category_id = categoryId;
  if (categoryKey) params.category = categoryKey;
  const { data } = await api.get('/api/admin/categories/listings', { params });
  return data; // Laravel paginator payload
}

// Admin: brokers counts
export async function adminBrokersCounts() {
  const { data } = await api.get('/api/admin/brokers/counts');
  return data; // { total, pending }
}

export async function adminBrokersList({ status, page = 1, perPage = 20 } = {}) {
  const params = { page, per_page: perPage };
  if (status) params.status = status;
  const { data } = await api.get('/api/admin/brokers', { params });
  return data; // paginator payload
}

export async function adminUsersList({ role, search, page = 1, perPage = 20 } = {}) {
  const params = { page, per_page: perPage };
  if (role) params.role = role;
  if (search) params.search = search;
  const { data } = await api.get('/api/admin/users', { params });
  return data; // paginator payload
}

export async function adminCreateListing(formData) {
  // formData must be FormData; includes broker_id for admin
  await csrf();
  const { data } = await api.post('/api/broker/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// Locations (public). Provinces can be filtered by country: 'RW' | 'DRC'.
export async function getProvinces(country) {
  const params = country ? { country } : undefined;
  const { data } = await api.get('/api/locations/provinces', { params });
  return data; // { data: [{id,name}] }
}

// Rwanda helpers
export async function getDistricts(provinceId) {
  const { data } = await api.get('/api/locations/districts', { params: { province_id: provinceId } });
  return data; // { data: [{id,name}] }
}
export async function getSectors(districtId) {
  const { data } = await api.get('/api/locations/sectors', { params: { district_id: districtId } });
  return data; // { data: [{id,name}] }
}

// DRC helpers
export async function getCities(provinceId) {
  const { data } = await api.get('/api/locations/cities', { params: { province_id: provinceId } });
  return data; // { data: [{id,name}] }
}

export async function getTerritories(provinceId) {
  const { data } = await api.get('/api/locations/territories', { params: { province_id: provinceId } });
  return data; // { data: [{id,name}] }
}

export default api;