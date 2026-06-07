import { EModuleKey } from '@/services/base/constant';
import { type ESourceTypeNotification, mapModuleKey } from '@/services/ThongBao/constant';
import { type ThongBao } from '@/services/ThongBao/typing';
import { currentRole } from '@/utils/ip';
import { getNameFile } from '@/utils/utils';
import { CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Divider, Row } from 'antd';
import moment from 'moment';
import { history } from '@umijs/max';
import './style.less';

const ViewThongBao = (props: { record?: ThongBao.IRecord; afterViewDetail?: () => void; hideCard?: boolean }) => {
	const { record, afterViewDetail, hideCard } = props;

	const redirectNotif = () => {
		const urlMap: Record<EModuleKey, string> = {
			[EModuleKey.CONNECT]: APP_CONFIG_URL_CONNECT,
			[EModuleKey.CONG_CAN_BO]: APP_CONFIG_URL_CAN_BO,
			[EModuleKey.QLDT]: APP_CONFIG_URL_DAO_TAO,
			[EModuleKey.CORE]: APP_CONFIG_URL_CORE,
			[EModuleKey.TCNS]: APP_CONFIG_URL_NHAN_SU,
			[EModuleKey.CTSV]: APP_CONFIG_URL_CTSV,
			[EModuleKey.VPS]: APP_CONFIG_URL_VPS,
			[EModuleKey.TC]: APP_CONFIG_URL_TAI_CHINH,
			[EModuleKey.QLKH]: APP_CONFIG_URL_QLKH,
			[EModuleKey.KT]: APP_CONFIG_URL_KHAO_THI,
			[EModuleKey.CSVC]: APP_CONFIG_URL_CSVC,
		};

		const sourceType = mapModuleKey[record?.sourceType as ESourceTypeNotification];
		const sourceModule = mapModuleKey[record?.metadata?.phanHe as ESourceTypeNotification];

		if (sourceType === currentRole) {
			if (afterViewDetail) afterViewDetail();
			history.push(`/${record?.metadata?.pathWeb}`);
		} else {
			const baseUrl = urlMap[sourceModule as EModuleKey];
			if (baseUrl && record?.metadata?.pathWeb) {
				const pathWeb = record.metadata.pathWeb.replace(/^\/+/, ''); // Loại bỏ dấu '/' ở đầu chuỗi pathWeb nếu có
				window.open(baseUrl + pathWeb, '_blank');
			}
		}
	};

	const displayDescription = record?.description || record?.message;
	const displayCreatedAt = record?.createdAt || record?.created_at;
	const displaySenderName = record?.senderName || 'Hệ thống';
	const displayContent = record?.content || record?.message || '';

	const typeStyleMap: Record<string, { bg: string; color: string; border: string; label: string }> = {
		borrow: { bg: 'rgba(192, 12, 12, 0.08)', color: '#C00C0C', border: 'rgba(192, 12, 12, 0.2)', label: 'Mượn thiết bị' },
		return: { bg: 'rgba(192, 12, 12, 0.06)', color: '#C00C0C', border: 'rgba(192, 12, 12, 0.15)', label: 'Trả thiết bị' },
		overdue: { bg: 'rgba(168, 84, 72, 0.08)', color: '#A85448', border: 'rgba(168, 84, 72, 0.2)', label: 'Quá hạn' },
		reminder: { bg: 'rgba(179, 143, 77, 0.08)', color: '#B38F4D', border: 'rgba(179, 143, 77, 0.2)', label: 'Nhắc nhở' },
		system: { bg: 'rgba(107, 107, 96, 0.08)', color: '#6B6B6B', border: 'rgba(107, 107, 96, 0.2)', label: 'Hệ thống' },
	};

	const typeStyle = typeStyleMap[record?.type || ''] || typeStyleMap.system;

	const content = (
		<div style={{ padding: hideCard ? '8px 4px' : '20px', fontFamily: 'inherit' }}>
			{/* Meta header info */}
			<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
				{record?.type && (
					<span style={{
						fontSize: '12px',
						fontWeight: 600,
						padding: '4px 10px',
						borderRadius: '4px',
						backgroundColor: typeStyle.bg,
						color: typeStyle.color,
						border: `1px solid ${typeStyle.border}`
					}}>
						{typeStyle.label}
					</span>
				)}
				<span style={{ color: '#6B6B6B', display: 'inline-flex', alignItems: 'center', fontSize: '13px' }}>
					<UserOutlined style={{ marginRight: '4px' }} /> {displaySenderName}
				</span>
				<Divider type='vertical' style={{ borderColor: '#E8E4DF' }} />
				<span style={{ color: '#6B6B6B', display: 'inline-flex', alignItems: 'center', fontSize: '13px' }}>
					<CalendarOutlined style={{ marginRight: '4px' }} /> {displayCreatedAt ? moment(displayCreatedAt).format('HH:mm DD/MM/YYYY') : ''}
				</span>
			</div>

			{/* Description / Summary block */}
			{displayDescription && displayDescription !== displayContent && (
				<div style={{
					padding: '12px 16px',
					backgroundColor: '#FAFAF8',
					borderRadius: '6px',
					borderLeft: '4px solid #C00C0C',
					color: '#6B6B6B',
					fontSize: '14px',
					marginBottom: '18px',
					lineHeight: '1.5'
				}}>
					{displayDescription}
				</div>
			)}

			{/* Content block */}
			<div 
				style={{ 
					fontSize: '15px', 
					color: '#1A1A1A', 
					lineHeight: '1.6', 
					minHeight: '80px',
					whiteSpace: 'pre-wrap',
					wordBreak: 'break-word'
				}}
				dangerouslySetInnerHTML={{ __html: displayContent }} 
			/>

			{/* Footers / Attachments */}
			{(record?.taiLieuDinhKem?.length || record?.thoiGianHieuLuc || (record?.metadata?.pathWeb && record?.metadata?.phanHe)) && (
				<div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E8E4DF' }}>
					<Row gutter={[16, 16]}>
						{record?.taiLieuDinhKem?.length ? (
							<Col span={24}>
								<div style={{ fontWeight: 600, marginBottom: '8px', color: '#1A1A1A', fontSize: '14px' }}>Tài liệu đính kèm:</div>
								<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
									{record?.taiLieuDinhKem?.map((item) => (
										<a 
											href={item} 
											target='_blank' 
											rel='noreferrer' 
											key={item}
											style={{
												display: 'inline-flex',
												alignItems: 'center',
												padding: '6px 12px',
												borderRadius: '6px',
												backgroundColor: 'rgba(192, 12, 12, 0.05)',
												color: '#C00C0C',
												border: '1px solid rgba(192, 12, 12, 0.1)',
												fontSize: '13px',
												transition: 'all 0.2s'
											}}
										>
											{getNameFile(item)}
										</a>
									))}
								</div>
							</Col>
						) : null}

						{record?.thoiGianHieuLuc ? (
							<Col span={24}>
								<span style={{ fontSize: '13px', color: '#6B6B6B' }}>
									Hiệu lực thông báo: <b style={{ color: '#A85448' }}>{moment(record?.thoiGianHieuLuc).format('DD/MM/YYYY')}</b>
								</span>
							</Col>
						) : null}

						{record?.metadata?.pathWeb && record?.metadata?.phanHe ? (
							<Col span={24}>
								<Button type='primary' onClick={() => redirectNotif()} style={{ borderRadius: '6px' }}>
									Xem chi tiết trên hệ thống
								</Button>
							</Col>
						) : null}
					</Row>
				</div>
			)}
		</div>
	);

	if (hideCard) return content;
	return <Card title={record?.title || 'Chi tiết thông báo'}>{content}</Card>;
};

export default ViewThongBao;
