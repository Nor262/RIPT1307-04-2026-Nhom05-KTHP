import axios from '@/utils/axios';

export async function getEquipment(params: any) {
  return axios.get('/equipment', { params });
}

export async function addEquipment(data: any) {
  return axios.post('/equipment', data);
}

export async function updateEquipment(id: number, data: any) {
  return axios.put(`/equipment/${id}`, data);
}

export async function deleteEquipment(id: number) {
  return axios.delete(`/equipment/${id}`);
}

export async function getCategories() {
  return axios.get('/categories');
}
