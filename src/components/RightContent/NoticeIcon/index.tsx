import ViewThongBao from '@/pages/ThongBao/components/ViewThongBao';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useModel } from '@umijs/max';
import NoticeIcon from './NoticeIcon';
import styles from './index.less';

const NoticeIconView = () => {
	const {
		danhSach,
		getThongBaoModel,
		total,
		page,
		limit,
		setLimit,
		loading,
		record,
		setRecord,
		unread,
		readNotificationModel,
	} = useModel('thongbao.noticeicon');
	const [visibleDetail, setVisibleDetail] = useState<boolean>(false);
	const [visiblePopup, setVisiblePopup] = useState<boolean>(false);
	const [isShaking, setIsShaking] = useState<boolean>(false);	

	useEffect(() => {
		getThongBaoModel();
	}, [page, limit]);

	useEffect(() => {
    // rung lần đầu tiên khi component được mount
    // rung khi số lượng tin nhắn mới (unread) tăng lên
    if (unread >= 0) {
        setIsShaking(true);
        const timer = setTimeout(() => setIsShaking(false), 600);
        return () => clearTimeout(timer);
    }
    
}, [unread]); 

	const clearReadState = async () => {
		readNotificationModel('ALL');
		setVisiblePopup(false);
	};

	return (
		<>
			<div className={`${styles.noticeWrapper} ${isShaking ? styles.bellIconShake : ''}`}>
				<NoticeIcon
					count={unread}
					onItemClick={async (item) => {
						setRecord(item);
						setVisibleDetail(true);
						setVisiblePopup(false);
					}}
					loading={loading}
					onClear={() => clearReadState()}
					clearText='Đánh dấu tất cả là đã đọc'
					viewMoreText='Tải thêm'
					onViewMore={() => {
						if (loading) return;
						setLimit(limit + 5);
					}}
					popupVisible={visiblePopup}
					clearClose
					onPopupVisibleChange={(visible) => {
						setVisiblePopup(visible);
					}}
				>
					<NoticeIcon.Tab
						tabKey='notification'
						count={total}
						list={danhSach}
						title='Thông báo'
						emptyText='Bạn đã xem tất cả thông báo'
						showClear={!!unread}
						showViewMore={danhSach.length < total}
					/>
				</NoticeIcon>
			</div>

			<Modal
				width={800}
				bodyStyle={{ padding: 0 }}
				destroyOnClose
				onCancel={() => setVisibleDetail(false)}
				visible={visibleDetail}
				okButtonProps={{ hidden: true }}
				cancelText='Đóng'
			>
				<ViewThongBao
					record={record}
					afterViewDetail={() => {
						setVisibleDetail(false);
						setVisiblePopup(false);
					}}
				/>
			</Modal>
		</>
	);
};

export default NoticeIconView;
