import axios from "axios";

// Create a reusable Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ========================
// Fixtures CRUD
// ========================
export const getFixtures = () => API.get("/fixtures");
export const getFixtureById = (id) => API.get(`/fixtures/${id}`);
export const createFixture = (data) => API.post("/fixtures", data);
export const updateFixture = (id, data) => API.put(`/fixtures/${id}`, data);
export const deleteFixture = (id) => API.delete(`/fixtures/${id}`);
export const getBTesters = () => API.get("/fixtures/btesters");
export const getEligibleBTesters = (slotType) => API.get(`/fixtures/btesters/eligible?slot=${slotType}`);


// ========================
// Users CRUD
// ========================
export const getUsers = () => API.get("/users");
export const getUserById = (id) => API.get(`/users/${id}`);
export const createUser = (data) => API.post("/users", data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// ========================
// Health CRUD
// ========================
export const getHealth = () => API.get("/health");
export const getHealthById = (id) => API.get(`/health/${id}`);
export const createHealth = (data) => API.post("/health", data);
export const updateHealth = (id, data) => API.put(`/health/${id}`, data);
export const deleteHealth = (id) => API.delete(`/health/${id}`);

// ========================
// Fixture Maintenance CRUD
// ========================
export const getMaintenance = () => API.get("/fixture-maintenance");
export const getMaintenanceById = (id) => API.get(`/fixture-maintenance/${id}`);
export const createMaintenance = (data) => API.post("/fixture-maintenance", data);
export const updateMaintenance = (id, data) => API.put(`/fixture-maintenance/${id}`, data);
export const deleteMaintenance = (id) => API.delete(`/fixture-maintenance/${id}`);

// ========================
// Usage CRUD
// ========================
export const getUsage = () => API.get("/usage");
export const getUsageById = (id) => API.get(`/usage/${id}`);
export const createUsage = (data) => API.post("/usage", data);
export const updateUsage = (id, data) => API.put(`/usage/${id}`, data);
export const deleteUsage = (id) => API.delete(`/usage/${id}`);

// ========================
// Export Axios instance
// ========================
export default API;
