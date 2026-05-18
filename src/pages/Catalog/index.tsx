import React, { useState } from 'react';
import { useRequest } from '@umijs/max';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Tag,
  Button,
  Modal,
  Form,
  DatePicker,
  Timeline,
  Descriptions,
  message,
  Empty,
  Spin,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  FormOutlined,
} from '@ant-design/icons';
import {
  getEquipment,
  getCategories,
  createBorrowRequest,
  findByEquipment,
} from '@/services/api';
import dayjs from 'dayjs';

const { Search } = Input;
const { RangePicker } = DatePicker;

type EquipmentItem = {
  id: number;
  name: string;
  category?: { id: number; name: string };
  serial_number: string;
  status: 'available' | 'in_use' | 'broken' | 'maintenance';
  description?: string;
  specifications?: Record<string, any>;
  image_url?: string;
};

const statusConfig: Record<string, { text: string; color: string }> = {
  available: { text: 'Sẵn sàng', color: 'success' },
  in_use: { text: 'Đang bận', color: 'processing' },
  broken: { text: 'Đang hỏng', color: 'error' },
  maintenance: { text: 'Bảo trì', color: 'warning' },
};

const Catalog: React.FC = () => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Detail Modal State
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);

  // Booking Modal State
  const [bookingVisible, setBookingVisible] = useState<boolean>(false);
  const [submittingBooking, setSubmittingBooking] = useState<boolean>(false);

  // Fetch Categories
  const { data: categories = [] } = useRequest(async () => {
    try {
      const res = await getCategories();
      const data = res.data?.data;
      return Array.isArray(data) ? data : data?.items || data?.result || [];
    } catch {
      return [];
    }
  });

  // Fetch Equipment list
  const { data: equipmentList = [], loading, refresh } = useRequest(async () => {
    try {
      const res = await getEquipment();
      const data = res.data?.data;
      return Array.isArray(data) ? data : data?.items || data?.result || [];
    } catch {
      return [];
    }
  });

  // Fetch Booking Schedule for selected equipment
  const { data: schedule = [], loading: loadingSchedule, refresh: refreshSchedule } = useRequest(
    async () => {
      if (!selectedItem) return [];
      try {
        const res = await findByEquipment(selectedItem.id);
        return res.data || [];
      } catch {
        return [];
      }
    },
    {
      ready: !!selectedItem,
      refreshDeps: [selectedItem],
    }
  );

  // Filter list locally
  const filteredList = equipmentList.filter((item: EquipmentItem) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.serial_number.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory =
      selectedCategory === 'all' || item.category?.name === selectedCategory;
    const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const handleOpenDetail = (item: EquipmentItem) => {
    setSelectedItem(item);
    setDetailVisible(true);
  };

  const handleOpenBooking = () => {
    setBookingVisible(true);
  };

  const handleBookingSubmit = async (values: any) => {
    if (!selectedItem) return;
    setSubmittingBooking(true);
    try {
      const [start, due] = values.dates;
      await createBorrowRequest({
        equipment_id: selectedItem.id,
        start_date: start.toISOString(),
        due_date: due.toISOString(),
        notes: values.notes,
      });
      message.success('Đăng ký mượn thiết bị thành công! Vui lòng chờ phê duyệt.');
      setBookingVisible(false);
      setDetailVisible(false);
      form.resetFields();
      refresh();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi đăng ký mượn thiết bị.'
      );
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header section */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1f1f1f' }}>
          Danh mục & Đặt mượn Thiết bị
        </h2>
        <p style={{ color: '#8c8c8c', margin: '4px 0 0 0' }}>
          Tìm kiếm và đăng ký lịch mượn thiết bị nhanh chóng cho các hoạt động của bạn.
        </p>
      </div>

      {/* Filter controls */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }} bodyStyle={{ padding: '16px 24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={10}>
            <Input
              placeholder="Tìm theo tên thiết bị hoặc số Sê-ri..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={12} md={7}>
            <Select
              placeholder="Chọn danh mục"
              size="large"
              style={{ width: '100%', borderRadius: 8 }}
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              <Select.Option value="all">Tất cả danh mục</Select.Option>
              {categories.map((c: any) => (
                <Select.Option key={c.id} value={c.name}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={7}>
            <Select
              placeholder="Chọn trạng thái"
              size="large"
              style={{ width: '100%', borderRadius: 8 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="available">Sẵn sàng</Select.Option>
              <Select.Option value="in_use">Đang bận</Select.Option>
              <Select.Option value="broken">Đang hỏng</Select.Option>
              <Select.Option value="maintenance">Bảo trì</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Cards list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : filteredList.length > 0 ? (
        <Row gutter={[20, 20]}>
          {filteredList.map((item: EquipmentItem) => {
            const cfg = statusConfig[item.status] || { text: item.status, color: 'default' };
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  bodyStyle={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}
                  cover={
                    <div
                      style={{
                        height: 160,
                        background: item.image_url
                          ? `url(${item.image_url}) center/cover no-repeat`
                          : 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      {!item.image_url && (
                        <AppstoreOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.7)' }} />
                      )}
                      <Tag
                        color={cfg.color}
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          borderRadius: 10,
                          fontWeight: 500,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      >
                        {cfg.text}
                      </Tag>
                    </div>
                  }
                >
                  <div style={{ flex: 1, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4 }}>
                      {item.category?.name || 'Chưa phân loại'}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        marginBottom: 8,
                        color: '#262626',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: 42,
                      }}
                    >
                      {item.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#bfbfbf' }}>SN: {item.serial_number}</div>
                  </div>
                  <Button
                    type="primary"
                    block
                    ghost
                    style={{ borderRadius: 8, fontWeight: 500 }}
                    onClick={() => handleOpenDetail(item)}
                  >
                    Xem chi tiết & Đặt
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không tìm thấy thiết bị nào phù hợp."
          style={{ padding: 64 }}
        />
      )}

      {/* Detail Modal */}
      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Chi tiết & Đặt lịch Thiết bị
          </span>
        }
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={720}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Đóng
          </Button>,
          selectedItem && !['broken', 'maintenance'].includes(selectedItem.status) && (
            <Button key="book" type="primary" icon={<FormOutlined />} onClick={handleOpenBooking}>
              Đặt mượn ngay
            </Button>
          ),
        ]}
        centered
        destroyOnClose
      >
        {selectedItem && (
          <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <div
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: selectedItem.image_url
                    ? `url(${selectedItem.image_url}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                {!selectedItem.image_url && (
                  <AppstoreOutlined style={{ fontSize: 64, color: 'rgba(255,255,255,0.7)' }} />
                )}
              </div>
              <Descriptions title="Thông tin cơ bản" column={1} size="small" bordered>
                <Descriptions.Item label="Tên">{selectedItem.name}</Descriptions.Item>
                <Descriptions.Item label="Danh mục">
                  {selectedItem.category?.name || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Số Sê-ri">{selectedItem.serial_number}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={statusConfig[selectedItem.status]?.color}>
                    {statusConfig[selectedItem.status]?.text}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
              {selectedItem.description && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Mô tả:</div>
                  <div style={{ color: '#595959', fontSize: 13 }}>{selectedItem.description}</div>
                </div>
              )}
            </Col>

            {/* Calendar / Timeline view (BOK-01) */}
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  <CalendarOutlined style={{ color: '#52c41a', marginRight: 6 }} />
                  Lịch đặt sắp tới (Calendar Timeline)
                </span>
              </div>
              <Card
                bodyStyle={{ padding: 16, maxHeight: 300, overflowY: 'auto' }}
                style={{ borderRadius: 8, background: '#fafafa' }}
              >
                {loadingSchedule ? (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <Spin size="small" />
                  </div>
                ) : schedule.length > 0 ? (
                  <Timeline mode="left">
                    {schedule
                      .filter((s: any) => ['pending', 'approved', 'active'].includes(s.status))
                      .map((s: any) => (
                        <Timeline.Item
                          key={s.id}
                          color={
                            s.status === 'active'
                              ? 'green'
                              : s.status === 'approved'
                              ? 'blue'
                              : 'orange'
                          }
                          label={
                            <span style={{ fontSize: 11, color: '#8c8c8c' }}>
                              {s.borrower?.full_name || 'Người mượn'}
                            </span>
                          }
                        >
                          <div style={{ fontSize: 12 }}>
                            <strong>
                              {s.status === 'active'
                                ? 'Đang dùng'
                                : s.status === 'approved'
                                ? 'Đã duyệt'
                                : 'Chờ duyệt'}
                            </strong>
                            <div style={{ color: '#595959', marginTop: 2 }}>
                              {dayjs(s.request_date).format('DD/MM')} -{' '}
                              {s.actual_check_in
                                ? dayjs(s.actual_check_in).format('DD/MM')
                                : 'Chưa trả'}
                            </div>
                          </div>
                        </Timeline.Item>
                      ))}
                  </Timeline>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Hiện chưa có lịch đặt nào. Thiết bị hoàn toàn trống!"
                  />
                )}
              </Card>
            </Col>
          </Row>
        )}
      </Modal>

      {/* Booking Form Modal */}
      <Modal
        title={
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            <FormOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Đăng ký mượn thiết bị
          </span>
        }
        visible={bookingVisible}
        onCancel={() => setBookingVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={submittingBooking}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        centered
        destroyOnClose
      >
        {selectedItem && (
          <Form form={form} layout="vertical" onFinish={handleBookingSubmit} style={{ marginTop: 16 }}>
            <Form.Item label="Thiết bị đăng ký">
              <Input value={selectedItem.name} disabled />
            </Form.Item>
            <Form.Item
              name="dates"
              label="Thời gian mượn - trả"
              rules={[{ required: true, message: 'Vui lòng chọn thời gian mượn trả!' }]}
            >
              <RangePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
            <Form.Item name="notes" label="Lý do mượn / Ghi chú">
              <Input.TextArea rows={3} placeholder="Mô tả chi tiết mục đích sử dụng..." />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Catalog;
