import { getThongBao, readNotification } from '@/services/ThongBao';
import { type ThongBao } from '@/services/ThongBao/typing';
import { message } from 'antd';
import { useState, useEffect } from 'react';

export default () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [record, setRecord] = useState<ThongBao.IRecord>();
	const [danhSach, setDanhSach] = useState<ThongBao.IRecord[]>([]);
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(20);
	const [total, setTotal] = useState<number>(0);
	const [unread, setUnread] = useState<number>(0);

	const getThongBaoModel = async (): Promise<ThongBao.IRecord[]> => {
		setLoading(true);
		try {
			const response = await getThongBao({
				page,
				limit,
				condition: undefined,
				sort: { createdAt: -1 },
			});
			// console.log("Full Response:", response);


			const rawData = response?.data?.data;

			const list = (Array.isArray(rawData) ? rawData : []).map((item: any) => ({
				...item,
				read: item.is_read ?? item.read,
				createdAt: item.created_at ?? item.createdAt,
				description: item.description ?? item.message,
				content: item.content ?? item.message,
				senderName: item.senderName ?? 'Hệ thống',
			}));

			setDanhSach(list);
			setUnread(list.filter((item: any) => !item.read).length);
			setTotal(list.length);

			return list;
		} catch (er) {
			return Promise.reject(er);
		} finally {
			setLoading(false);
		}
	};

	const readNotificationModel = async (type: 'ALL' | 'ONE', notificationId?: string): Promise<any> => {
		setLoading(true);
		try {
			const response = await readNotification({ type, notificationId });

			await getThongBaoModel(); // Load lại danh sách sau khi đọc

			if (type === 'ALL') message.success('Đã đọc tất cả thông báo');
			return response;
		} catch (er) {
			console.error("Lỗi khi đọc thông báo:", er);
			return Promise.reject(er);
		} finally {
			setLoading(false);
		}
	};


	return {
		unread,
		total,
		danhSach,
		setDanhSach,
		page,
		setPage,
		limit,
		setLimit,
		record,
		setRecord,
		loading,
		setLoading,
		getThongBaoModel,
		readNotificationModel,
	};
};
