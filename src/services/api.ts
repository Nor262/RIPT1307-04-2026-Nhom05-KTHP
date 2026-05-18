import axios from '@/utils/axios';

// ==================== Authentication ====================
export async function login(data: any) {
  return axios.post('/auth/login', data);
}

export async function getProfile() {
  return axios.get('/auth/profile');
}

export async function logout() {
  return axios.post('/auth/logout');
}

// ==================== Users ====================
export async function getUsers(params?: any) {
  return axios.get('/users', { params });
}

export async function getUserById(id: number) {
  return axios.get(`/users/${id}`);
}

export async function createUser(data: any) {
  return axios.post('/users', data);
}

export async function updateUser(id: number, data: any) {
  return axios.put(`/users/${id}`, data);
}

export async function toggleUserStatus(id: number, isActive: boolean) {
  return axios.put(`/users/${id}`, { is_active: isActive });
}

// ==================== Categories ====================
export async function getCategories(params?: any) {
  return axios.get('/categories', { params });
}

export async function createCategory(data: any) {
  return axios.post('/categories', data);
}

export async function updateCategory(id: number, data: any) {
  return axios.put(`/categories/${id}`, data);
}

export async function deleteCategory(id: number) {
  return axios.delete(`/categories/${id}`);
}

// ==================== Equipment ====================
export async function getEquipment(params?: any) {
  return axios.get('/equipment', { params });
}

export async function getEquipmentById(id: number) {
  return axios.get(`/equipment/${id}`);
}

export async function createEquipment(data: any) {
  return axios.post('/equipment', data);
}

export async function updateEquipment(id: number, data: any) {
  return axios.put(`/equipment/${id}`, data);
}

export async function deleteEquipment(id: number) {
  return axios.delete(`/equipment/${id}`);
}

export async function importBulkEquipment(formData: FormData) {
  return axios.post('/equipment/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function exportEquipmentExcel() {
  return axios.get('/reports/excel', { responseType: 'blob' });
}

export async function resolveMaintenanceEquipment(id: number) {
  return axios.patch(`/equipment/${id}/resolve-maintenance`);
}

// ==================== Transactions ====================
export async function getTransactions(params?: any) {
  return axios.get('/transactions', { params });
}

export async function createBorrowRequest(data: any) {
  return axios.post('/transactions/borrow', data);
}

export async function reviewTransaction(id: number, data: { action: string; reason?: string }) {
  return axios.put(`/transactions/${id}/review`, data);
}

export async function checkoutTransaction(id: number, data: any) {
  return axios.put(`/transactions/${id}/checkout`, data);
}

export async function checkinTransaction(id: number, data: any) {
  return axios.put(`/transactions/${id}/checkin`, data);
}

export async function verifyItem(data: { serial_number: string }) {
  return axios.post('/transactions/verify-item', data);
}

export async function syncTransactionStatus(data: { transaction_ids: number[] }) {
  return axios.post('/transactions/sync-status', data);
}

export async function extendBooking(id: number, data: { new_due_date: string }) {
  return axios.patch(`/transactions/${id}/extend`, data);
}

export async function rateTransaction(id: number, data: { rating: number; feedback?: string }) {
  return axios.patch(`/transactions/${id}/rate`, data);
}


// ==================== Analytics ====================
export async function getDashboardStats() {
  return axios.get('/reports/dashboard');
}

export async function getOverdueTransactions(params?: any) {
  return axios.get('/transactions', { params: { ...params, status: 'overdue' } });
}

// ==================== My Transactions (Borrower) ====================
export async function getMyTransactions(params?: any) {
  return axios.get('/transactions/my', { params });
}

// ==================== Suppliers ====================
export async function getSuppliers(params?: any) {
  return axios.get('/suppliers', { params });
}

export async function createSupplier(data: any) {
  return axios.post('/suppliers', data);
}

export async function updateSupplier(id: number, data: any) {
  return axios.put(`/suppliers/${id}`, data);
}

export async function deleteSupplier(id: number) {
  return axios.delete(`/suppliers/${id}`);
}

// ==================== Locations ====================
export async function getLocations(params?: any) {
  return axios.get('/locations', { params });
}

export async function createLocation(data: any) {
  return axios.post('/locations', data);
}

export async function updateLocation(id: number, data: any) {
  return axios.put(`/locations/${id}`, data);
}

export async function deleteLocation(id: number) {
  return axios.delete(`/locations/${id}`);
}

// ==================== Maintenance ====================
export async function getMaintenance(params?: any) {
  return axios.get('/maintenance', { params });
}

export async function getMaintenanceByEquipment(equipmentId: number) {
  return axios.get(`/maintenance/equipment/${equipmentId}`);
}

export async function createMaintenance(data: any) {
  return axios.post('/maintenance', data);
}

export async function completeMaintenance(equipmentId: number) {
  return axios.put(`/maintenance/complete/${equipmentId}`);
}

