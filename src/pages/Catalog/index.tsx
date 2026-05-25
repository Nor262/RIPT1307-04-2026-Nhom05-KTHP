import React, { useState, useEffect } from 'react';
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
} from 'antd';
import {
  SearchOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  FormOutlined,
} from '@ant-design/icons';
import {
  getEquipment,
  getCategories,
  createBorrowRequest,
  findByEquipment,
} from '@/services/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

type EquipmentItem = {
  id: number;
  name: string;
  category_id?: number;
  category?: { id: number; name: string; description?: string }; 
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
  
  // States lưu trữ dữ liệu từ API
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // State quản lý bộ lọc
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal States
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [bookingVisible, setBookingVisible] = useState<boolean>(false);
  const [submittingBooking, setSubmittingBooking] = useState<boolean>(false);
  
  // State quản lý lịch đặt thiết bị
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(false);

  // HÀM FETCH DATA 
  const loadData = async () => {
    setLoading(true);
    try {
      // Gọi API Categories
      const resCat = await getCategories();
      if (resCat?.data?.data && Array.isArray(resCat.data.data)) {
        setCategories(resCat.data.data);
      } else if (Array.isArray(resCat?.data)) {
        setCategories(resCat.data);
      }

      // Gọi API Equipment
      const resEquip = await getEquipment();
      if (resEquip?.data?.data && Array.isArray(resEquip.data.data)) {
        setEquipmentList(resEquip.data.data);
      } else if (Array.isArray(resEquip?.data)) {
        setEquipmentList(resEquip.data);
      }
    } catch (error) {
      console.error('❌ Lỗi tải dữ liệu hệ thống:', error);
      message.error('Không thể kết nối tới máy chủ dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Gọi API lấy lịch đặt khi nhấn xem chi tiết thiết bị
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedItem?.id) {
        setSchedule([]);
        return;
      }
      setLoadingSchedule(true);
      try {
        const res = await findByEquipment(selectedItem.id);
        const data = res?.data?.data !== undefined ? res.data.data : res?.data;
        setSchedule(Array.isArray(data) ? data : []);
      } catch {
        setSchedule([]);
      } finally {
        setLoadingSchedule(false);
      }
    };
    fetchSchedule();
  }, [selectedItem?.id]);

  // BỘ LỌC 
  const filteredList = equipmentList.filter((item: EquipmentItem) => {
    if (!item) return false;

    // Tìm kiếm theo từ khóa nhập vào
    const searchLower = searchText ? searchText.trim().toLowerCase() : '';
    if (searchLower) {
      const nameMatch = item.name?.toLowerCase().includes(searchLower) || false;
      const serialMatch = item.serial_number?.toLowerCase().includes(searchLower) || false;
      const catNameMatch = item.category?.name?.toLowerCase().includes(searchLower) || false;
      if (!nameMatch && !serialMatch && !catNameMatch) return false;
    }

    // Lọc theo danh mục chọn từ Select
    if (selectedCategory && selectedCategory !== 'all' && selectedCategory !== '') {
      if (Number(item.category_id) !== Number(selectedCategory)) return false;
    }

    // Lọc theo trạng thái thiết bị
    if (selectedStatus && selectedStatus !== 'all' && selectedStatus !== '') {
      const itemStatus = String(item.status || '').toLowerCase();
      const selectedStat = String(selectedStatus).toLowerCase();
      if (itemStatus !== selectedStat) return false;
    }

    return true;
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
      loadData(); 
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
      <Card style={{ marginBottom: 24, borderRadius: 12 }} styles={{ body: { padding: '16px 24px' } }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={10}>
            <Input
              placeholder="Tìm theo tên thiết bị, số Sê-ri hoặc danh mục..."
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
              {Array.isArray(categories) && categories.map((c: any) => (
                <Select.Option key={c.id} value={c.id}>
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
            const cfg = statusConfig[item.status] || { text: item.status || 'Chưa rõ', color: 'default' };
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
                  styles={{ body: { padding: 16, flex: 1, display: 'flex', flexDirection: 'column' } }}
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
                    <div style={{ fontSize: 12, color: '#bfbfbf' }}>
                      {item.serial_number ? `SN: ${item.serial_number}` : ''}
                    </div>
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
        open={detailVisible}
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
                <Descriptions.Item label="Số Sê-ri">{selectedItem.serial_number || '—'}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={statusConfig[selectedItem.status]?.color || 'default'}>
                    {statusConfig[selectedItem.status]?.text || selectedItem.status}
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

            {/* Calendar / Timeline view */}
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  <CalendarOutlined style={{ color: '#52c41a', marginRight: 6 }} />
                  Lịch đặt sắp tới (Calendar Timeline)
                </span>
              </div>
              <Card
                styles={{ body: { padding: 16, maxHeight: 300, overflowY: 'auto' } }}
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
                              {dayjs(s.start_date).format('DD/MM HH:mm')} -{' '}
                              {dayjs(s.due_date).format('DD/MM HH:mm')}
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
        open={bookingVisible}
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