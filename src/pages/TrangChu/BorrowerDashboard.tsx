import React, { useState } from 'react';
import { useRequest } from '@umijs/max';
import {
  Row,
  Col,
  Card,
  Spin,
  Tag,
  Typography,
  List,
  Result,
  Button,
  Modal,
  Form,
  DatePicker,
  Input,
  Rate,
  Upload,
  message,
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SwapOutlined,
  UserOutlined,
  CalendarOutlined,
  WarningOutlined,
  StarOutlined,
  UploadOutlined,
  ScanOutlined,
} from '@ant-design/icons';
import {
  getMyTransactions,
  extendBooking,
  rateTransaction,
  checkoutTransaction,
  checkinTransaction,
} from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const statusConfig: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
  pending: { text: 'Chờ duyệt', color: '#faad14', icon: <ClockCircleOutlined /> },
  approved: { text: 'Đã duyệt', color: '#1890ff', icon: <CheckCircleOutlined /> },
  rejected: { text: 'Từ chối', color: '#ff4d4f', icon: <ExclamationCircleOutlined /> },
  checked_out: { text: 'Đang mượn', color: '#13c2c2', icon: <SwapOutlined /> },
  completed: { text: 'Đã trả', color: '#52c41a', icon: <CheckCircleOutlined /> },
  overdue: { text: 'Quá hạn', color: '#ff4d4f', icon: <ExclamationCircleOutlined /> },
};

/** Safely extract array from API response */
const extractArray = (res: any): any[] => {
  try {
    const data = res?.data?.data;
    if (Array.isArray(data)) return data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (data?.result && Array.isArray(data.result)) return data.result;
    return [];
  } catch {
    return [];
  }
};

const BorrowerDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [form] = Form.useForm();

  // Active item to operate on
  const [activeTx, setActiveTx] = useState<any | null>(null);

  // Modals visibility
  const [checkoutVisible, setCheckoutVisible] = useState<boolean>(false);
  const [checkinVisible, setCheckinVisible] = useState<boolean>(false);
  const [extendVisible, setExtendVisible] = useState<boolean>(false);
  const [rateVisible, setRateVisible] = useState<boolean>(false);

  // Image Upload State
  const [fileList, setFileList] = useState<any[]>([]);
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  // Fetch Transactions with 10s Auto-polling
  const { data: transactions = [], loading, refresh } = useRequest(
    async () => {
      try {
        const res = await getMyTransactions();
        return extractArray(res);
      } catch {
        return [];
      }
    },
    {
      pollingInterval: 10000,
      pollingWhenHidden: false,
    }
  );

  const allItems = Array.isArray(transactions) ? transactions : [];
  const pendingCount = allItems.filter((t: any) => t.status === 'pending').length;
  const activeCount = allItems.filter((t: any) => ['approved', 'checked_out'].includes(t.status)).length;
  const overdueCount = allItems.filter((t: any) => t.status === 'overdue').length;
  const completedCount = allItems.filter((t: any) => t.status === 'completed').length;

  // Active + overdue items (priority list)
  const currentItems = allItems.filter((t: any) =>
    ['pending', 'approved', 'checked_out', 'overdue'].includes(t.status)
  );

  // Recent completed
  const recentItems = allItems
    .filter((t: any) => ['completed', 'rejected'].includes(t.status))
    .slice(0, 5);

  const handleOpenCheckout = (tx: any) => {
    setActiveTx(tx);
    setFileList([]);
    form.resetFields();
    setCheckoutVisible(true);
  };

  const handleOpenCheckin = (tx: any) => {
    setActiveTx(tx);
    setFileList([]);
    form.resetFields();
    setCheckinVisible(true);
  };

  const handleOpenExtend = (tx: any) => {
    setActiveTx(tx);
    form.resetFields();
    setExtendVisible(true);
  };

  const handleOpenRate = (tx: any) => {
    setActiveTx(tx);
    form.resetFields();
    setRateVisible(true);
  };

  const handleCheckoutSubmit = async (values: any) => {
    if (!activeTx) return;
    setSubmittingAction(true);
    try {
      const formData = new FormData();
      formData.append('qr_code_data', values.qr_code_data);
      formData.append('condition', values.condition || '');
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      await checkoutTransaction(activeTx.id, formData);
      message.success('Nhận thiết bị (Check-out) thành công!');
      setCheckoutVisible(false);
      refresh();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Check-out thất bại. Vui lòng thử lại.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCheckinSubmit = async (values: any) => {
    if (!activeTx) return;
    setSubmittingAction(true);
    try {
      const formData = new FormData();
      formData.append('qr_code_data', values.qr_code_data);
      formData.append('condition', values.condition || '');
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      await checkinTransaction(activeTx.id, formData);
      message.success('Trả thiết bị & báo cáo tình trạng thành công!');
      setCheckinVisible(false);
      refresh();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Trả thiết bị thất bại. Vui lòng thử lại.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleExtendSubmit = async (values: any) => {
    if (!activeTx) return;
    setSubmittingAction(true);
    try {
      await extendBooking(activeTx.id, {
        new_due_date: values.new_due_date.toISOString(),
      });
      message.success('Gia hạn thành công!');
      setExtendVisible(false);
      refresh();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gia hạn thất bại.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRateSubmit = async (values: any) => {
    if (!activeTx) return;
    setSubmittingAction(true);
    try {
      await rateTransaction(activeTx.id, {
        rating: values.rating,
        feedback: values.feedback,
      });
      message.success('Cảm ơn bạn đã đánh giá thiết bị!');
      setRateVisible(false);
      refresh();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Đánh giá thất bại.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file: any) => {
      setFileList([file]);
      return false; // prevent auto upload
    },
    fileList,
  };

  if (loading && allItems.length === 0) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: 960, margin: '0 auto' }}>
      {/* Welcome */}
      <Card
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: 14,
        }}
        bodyStyle={{ padding: '24px 28px' }}
      >
        <Row align="middle" gutter={16}>
          <Col>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <UserOutlined style={{ fontSize: 26, color: '#fff' }} />
            </div>
          </Col>
          <Col flex="auto">
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              Xin chào, {user?.full_name || 'Bạn'}!
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
              Quản lý thiết bị của bạn trực tiếp ngay tại Dashboard này.
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Stats Grid */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card
            bodyStyle={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
            style={{ borderRadius: 12, borderLeft: `4px solid #faad14` }}
          >
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#faad1415', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#faad14' }}>
              <ClockCircleOutlined />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Chờ duyệt</Text>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#faad14', lineHeight: 1.2 }}>{pendingCount}</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            bodyStyle={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
            style={{ borderRadius: 12, borderLeft: `4px solid #1890ff` }}
          >
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#1890ff15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#1890ff' }}>
              <SwapOutlined />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Đang mượn</Text>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1890ff', lineHeight: 1.2 }}>{activeCount}</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            bodyStyle={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
            style={{ borderRadius: 12, borderLeft: `4px solid #ff4d4f` }}
          >
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#ff4d4f15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#ff4d4f' }}>
              <ExclamationCircleOutlined />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Quá hạn</Text>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#ff4d4f', lineHeight: 1.2 }}>{overdueCount}</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            bodyStyle={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
            style={{ borderRadius: 12, borderLeft: `4px solid #52c41a` }}
          >
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#52c41a15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#52c41a' }}>
              <CheckCircleOutlined />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Hoàn tất</Text>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#52c41a', lineHeight: 1.2 }}>{completedCount}</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Current Loans */}
      <Card
        title={
          <span style={{ fontSize: 15 }}>
            <SwapOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Đơn mượn hiện tại
            {currentItems.length > 0 && (
              <Tag color="blue" style={{ marginLeft: 8 }}>{currentItems.length}</Tag>
            )}
          </span>
        }
        style={{ borderRadius: 12, marginBottom: 16 }}
        bodyStyle={{ padding: currentItems.length > 0 ? '0' : '24px' }}
      >
        {currentItems.length > 0 ? (
          <List
            dataSource={currentItems}
            renderItem={(item: any) => {
              const cfg = statusConfig[item.status] || { text: item.status, color: '#999', icon: null };
              const isOverdue = item.status === 'overdue' || (
                item.due_date && new Date(item.due_date) < new Date() &&
                !['completed', 'rejected'].includes(item.status)
              );
              return (
                <List.Item
                  style={{ padding: '14px 20px' }}
                  actions={[
                    // Quick Action: Check-out physically
                    item.status === 'approved' && (
                      <Button
                        key="checkout"
                        type="primary"
                        danger
                        size="small"
                        icon={<ScanOutlined />}
                        style={{ borderRadius: 6 }}
                        onClick={() => handleOpenCheckout(item)}
                      >
                        Nhận thiết bị
                      </Button>
                    ),
                    // Quick Action: Return / Report Damage
                    (item.status === 'checked_out' || item.status === 'overdue') && (
                      <Button
                        key="checkin"
                        type="primary"
                        ghost
                        size="small"
                        icon={<WarningOutlined />}
                        style={{ borderRadius: 6 }}
                        onClick={() => handleOpenCheckin(item)}
                      >
                        Trả đồ / Báo lỗi
                      </Button>
                    ),
                    // Quick Action: Extend
                    (item.status === 'checked_out' || item.status === 'overdue') && !item.is_extended && (
                      <Button
                        key="extend"
                        size="small"
                        icon={<CalendarOutlined />}
                        style={{ borderRadius: 6 }}
                        onClick={() => handleOpenExtend(item)}
                      >
                        Gia hạn
                      </Button>
                    ),
                  ].filter(Boolean)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {item.equipment?.name || 'Thiết bị'}
                      </Text>
                      <Tag
                        color={cfg.color}
                        icon={cfg.icon}
                        style={{ borderRadius: 10, fontSize: 11, lineHeight: '18px' }}
                      >
                        {cfg.text}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        SN: {item.equipment?.serial_number || '—'}
                      </Text>
                      <Text type={isOverdue ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        Hạn trả: {item.due_date ? new Date(item.due_date).toLocaleDateString('vi-VN') : '—'}
                        {isOverdue && ' ⚠ Quá hạn'}
                      </Text>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Không có đơn mượn đang hoạt động"
            subTitle="Bạn hiện không giữ thiết bị nào."
            style={{ padding: '24px 0' }}
          />
        )}
      </Card>

      {/* Recent History */}
      {recentItems.length > 0 && (
        <Card
          title={
            <span style={{ fontSize: 15 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              Lịch sử gần đây
            </span>
          }
          style={{ borderRadius: 12 }}
          bodyStyle={{ padding: 0 }}
        >
          <List
            dataSource={recentItems}
            renderItem={(item: any) => {
              const isCompleted = item.status === 'completed';
              return (
                <List.Item
                  style={{ padding: '12px 20px' }}
                  actions={[
                    isCompleted && !item.rating && (
                      <Button
                        key="rate"
                        type="link"
                        size="small"
                        icon={<StarOutlined />}
                        onClick={() => handleOpenRate(item)}
                      >
                        Đánh giá
                      </Button>
                    ),
                    item.rating && (
                      <Rate disabled defaultValue={item.rating} style={{ fontSize: 13 }} />
                    )
                  ].filter(Boolean)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 13 }}>{item.equipment?.name || 'Thiết bị'}</Text>
                      <Tag
                        color={isCompleted ? 'green' : 'red'}
                        style={{ borderRadius: 10, fontSize: 11 }}
                      >
                        {isCompleted ? 'Đã trả' : 'Bị từ chối'}
                      </Tag>
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(item.actual_check_in || item.approval_date || item.request_date).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                    </Text>
                  </div>
                </List.Item>
              );
            }}
          />
        </Card>
      )}

      {/* Check-out Modal */}
      <Modal
        title={
          <span style={{ fontWeight: 600 }}>
            <ScanOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Xác nhận Nhận thiết bị (Check-out)
          </span>
        }
        visible={checkoutVisible}
        onCancel={() => setCheckoutVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={submittingAction}
        okText="Xác nhận nhận đồ"
        cancelText="Hủy"
        centered
        destroyOnClose
      >
        {activeTx && (
          <Form form={form} layout="vertical" onFinish={handleCheckoutSubmit} style={{ marginTop: 16 }}>
            <Form.Item label="Thiết bị bàn giao">
              <Input value={activeTx.equipment?.name} disabled />
            </Form.Item>
            <Form.Item
              name="qr_code_data"
              label="Mã QR thiết bị / Số Sê-ri"
              rules={[{ required: true, message: 'Vui lòng nhập hoặc quét mã thiết bị!' }]}
              extra="Vui lòng nhập chính xác số Serial (ví dụ: MBP-2023-001) dán trên thiết bị để khớp bàn giao."
            >
              <Input placeholder="Nhập mã serial dán trên thiết bị..." prefix={<ScanOutlined />} />
            </Form.Item>
            <Form.Item name="condition" label="Ghi chú tình trạng ban đầu">
              <Input.TextArea placeholder="Tình trạng lúc nhận thiết bị (tốt, có trầy xước nhẹ...)" rows={2} />
            </Form.Item>
            <Form.Item label="Tải lên ảnh trước khi nhận (BOK-06)">
              <Upload {...uploadProps} maxCount={1} listType="picture">
                <Button icon={<UploadOutlined />}>Chọn file ảnh chụp</Button>
              </Upload>
              <span style={{ fontSize: 11, color: '#8c8c8c', display: 'block', marginTop: 4 }}>
                Chụp ảnh rõ nét hiện trạng của thiết bị trước khi bắt đầu sử dụng.
              </span>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Check-in / Damage report Modal */}
      <Modal
        title={
          <span style={{ fontWeight: 600 }}>
            <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
            Trả đồ & Báo cáo sự cố (BOK-06)
          </span>
        }
        visible={checkinVisible}
        onCancel={() => setCheckinVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={submittingAction}
        okText="Xác nhận trả đồ"
        cancelText="Hủy"
        centered
        destroyOnClose
      >
        {activeTx && (
          <Form form={form} layout="vertical" onFinish={handleCheckinSubmit} style={{ marginTop: 16 }}>
            <Form.Item label="Thiết bị trả">
              <Input value={activeTx.equipment?.name} disabled />
            </Form.Item>
            <Form.Item
              name="qr_code_data"
              label="Mã QR thiết bị / Số Sê-ri"
              rules={[{ required: true, message: 'Vui lòng nhập hoặc quét mã để trả!' }]}
            >
              <Input placeholder="Nhập mã serial để trả đồ..." prefix={<ScanOutlined />} />
            </Form.Item>
            <Form.Item
              name="condition"
              label="Mô tả tình trạng hiện tại"
              rules={[{ required: true, message: 'Vui lòng mô tả tình trạng trả đồ!' }]}
              extra="Nếu thiết bị có sự cố/lỗi, hãy viết mô tả chứa các từ khóa như 'hỏng', 'lỗi', 'broken'..."
            >
              <Input.TextArea placeholder="Nhập mô tả tình trạng thực tế của thiết bị lúc trả..." rows={2} />
            </Form.Item>
            <Form.Item label="Tải lên ảnh sau khi dùng (BOK-06)">
              <Upload {...uploadProps} maxCount={1} listType="picture">
                <Button icon={<UploadOutlined />}>Chọn file ảnh chụp</Button>
              </Upload>
              <span style={{ fontSize: 11, color: '#8c8c8c', display: 'block', marginTop: 4 }}>
                Chụp ảnh rõ nét hiện trạng của thiết bị lúc trả để lưu vết sự cố (nếu có).
              </span>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Extend Modal */}
      <Modal
        title={
          <span style={{ fontWeight: 600 }}>
            <CalendarOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Gia hạn mượn thiết bị (BOK-07)
          </span>
        }
        visible={extendVisible}
        onCancel={() => setExtendVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={submittingAction}
        okText="Gia hạn ngay"
        cancelText="Hủy"
        centered
        destroyOnClose
      >
        {activeTx && (
          <Form form={form} layout="vertical" onFinish={handleExtendSubmit} style={{ marginTop: 16 }}>
            <Form.Item label="Thời hạn trả hiện tại">
              <Input value={activeTx.due_date ? new Date(activeTx.due_date).toLocaleString('vi-VN') : '—'} disabled />
            </Form.Item>
            <Form.Item
              name="new_due_date"
              label="Thời hạn trả mới"
              rules={[{ required: true, message: 'Vui lòng chọn thời hạn trả mới!' }]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: '100%' }}
                disabledDate={(current) =>
                  current && (current < dayjs(activeTx.due_date) || current > dayjs(activeTx.due_date).add(1, 'day'))
                }
              />
            </Form.Item>
            <span style={{ fontSize: 12, color: '#faad14' }}>
              💡 Lưu ý: Hệ thống chỉ hỗ trợ gia hạn tối đa **1 ngày** từ hạn cũ, với điều kiện lịch ngày kế tiếp trống.
            </span>
          </Form>
        )}
      </Modal>

      {/* Rate Modal */}
      <Modal
        title={
          <span style={{ fontWeight: 600 }}>
            <StarOutlined style={{ color: '#faad14', marginRight: 8 }} />
            Đánh giá thiết bị đã dùng (BOK-08)
          </span>
        }
        visible={rateVisible}
        onCancel={() => setRateVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={submittingAction}
        okText="Gửi đánh giá"
        cancelText="Hủy"
        centered
        destroyOnClose
      >
        {activeTx && (
          <Form form={form} layout="vertical" onFinish={handleRateSubmit} style={{ marginTop: 16 }}>
            <Form.Item label="Thiết bị">
              <Input value={activeTx.equipment?.name} disabled />
            </Form.Item>
            <Form.Item
              name="rating"
              label="Mức độ hài lòng"
              rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
            >
              <Rate style={{ fontSize: 24 }} />
            </Form.Item>
            <Form.Item name="feedback" label="Phản hồi lỗi ẩn / Nhận xét thêm">
              <Input.TextArea placeholder="Hãy nhận xét thêm về trải nghiệm sử dụng hoặc phát hiện lỗi ẩn..." rows={3} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default BorrowerDashboard;
