import axios from '@/utils/axios';
import { ipNotif } from '@/utils/ip';
import { buildFormData } from '@/utils/utils';

export async function postReceiver(payload: any, params: { page: number; limit: number }) {
	return axios.post(`/notifications/receiver/page`, payload, { params });
}

export async function readNotification(payload: { type: 'ONE' | 'ALL'; notificationId?: any }) {
	const { type, notificationId } = payload;

	if (type === 'ONE') {
		if (!notificationId) {
			return;
		}
		const response = axios.patch(`/notifications/${notificationId}/read`);
		// console.log("Dữ liệu từ API trả về:", (await response).data?.data?.message);
		return axios.patch(`/notifications/${notificationId}/read`);
	}
	if (type === 'ALL') {
		return axios.patch(`/notifications/read-all`);
	}
}

export async function thongKeNotification() {
	return axios.get(`/notifications/thong-ke`);
}
export async function deleteThongBao(id: string) {
	return axios.delete(`/notifications/${id}`);
}
export async function thongKeNotificationNguoiNhan(id: string) {
	return axios.get(`/notifications/${id}/receiver/thong-ke`);
}
export async function importNguoiNhanThongBao(payload: any, role: any) {
	const formData = buildFormData(payload);
	return axios.post(`/notifications/receiver/many/import/${role}`, formData);
}
export async function dowLoadBieuMauNguoiNhan() {
	return axios.get(`/notifications/import/template/xlsx`, { responseType: 'arraybuffer' });
}

export async function guiThongBaoDanhSach(payload: {
	file: string | Blob;
	loai: string;
	title: string;
	content: string;
	senderName: string;
	vaiTroNguoiNhan: string;
	gui: string;
}) {
	const form = new FormData();
	form.append('file', payload?.file);
	form.append('loai', payload?.loai);
	form.append('title', payload?.title);
	form.append('content', payload?.content);
	form.append('senderName', payload?.senderName);
	form.append('vaiTroNguoiNhan', payload?.vaiTroNguoiNhan);
	form.append('gui', payload?.gui);

	return axios.post(`/notification/send`, form);
}

export async function getThongBao(payload: {
	page: number;
	limit: number;
	condition: any;
	sort: { createdAt: 1 | -1 };
}) {
	return axios.get(`/notifications`, { params: payload });
}

export async function getReceiver(
	notificationId: string,
	payload: {
		page: number;
		limit: number;
		condition?: any;
		sort?: { createdAt: 1 | -1 };
	},
) {
	return axios.get(`/notification/${notificationId}/receiver/page`, { params: payload });
}

//debug