import React, { useState, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card, Table, Button, Space, Modal, Form, Input, Select, Tag, Tooltip,
  Popconfirm, Row, Col, Typography, DatePicker, TimePicker,
  Alert, Badge, Statistic, Divider, message,
} from 'antd';
import {
  PlusOutlined, CalendarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, UserOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import type { Appointment, AppointmentStatus } from '@/models/appointment';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const STATUS_CONFIG: Record<AppointmentStatus, { color: string; label: string }> = {
  'Chờ duyệt': { color: 'gold', label: 'Chờ duyệt' },
  'Xác nhận': { color: 'blue', label: 'Xác nhận' },
  'Hoàn thành': { color: 'success', label: 'Hoàn thành' },
  'Hủy': { color: 'error', label: 'Đã hủy' },
};

const STATUS_FLOW: Record<AppointmentStatus, AppointmentStatus[]> = {
  'Chờ duyệt': ['Xác nhận', 'Hủy'],
  'Xác nhận': ['Hoàn thành', 'Hủy'],
  'Hoàn thành': [],
  'Hủy': [],
};

const AppointmentsPage: React.FC = () => {
  const { appointments, services, staffList, addAppointment, updateAppointmentStatus, deleteAppointment } =
    useModel('appointment');

  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all');

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedStaff = staffList.find(s => s.id === selectedStaffId);

  const computedEndTime = useMemo(() => {
    if (!selectedStart || !selectedService) return null;
    const [h, m] = selectedStart.split(':').map(Number);
    const totalMin = h * 60 + m + selectedService.durationMinutes;
    return `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
  }, [selectedStart, selectedService]);

  const hasConflict = useMemo(() => {
    if (!selectedStaffId || !selectedDate || !selectedStart || !computedEndTime) return false;
    return appointments.some(apt => {
      if (apt.staffId !== selectedStaffId) return false;
      if (apt.date !== selectedDate) return false;
      if (apt.status === 'Hủy') return false;
      return selectedStart < apt.endTime && computedEndTime > apt.startTime;
    });
  }, [appointments, selectedStaffId, selectedDate, selectedStart, computedEndTime]);

  const isAtLimit = useMemo(() => {
    if (!selectedStaffId || !selectedDate || !selectedStaff) return false;
    const count = appointments.filter(
      a => a.staffId === selectedStaffId && a.date === selectedDate && a.status !== 'Hủy',
    ).length;
    return count >= selectedStaff.maxClientsPerDay;
  }, [appointments, selectedStaffId, selectedDate, selectedStaff]);

  const staffWorkHours = useMemo(() => {
    if (!selectedStaff || !selectedDate) return null;
    const dow = dayjs(selectedDate).day();
    return selectedStaff.workSchedules.find(s => s.dayOfWeek === dow) || null;
  }, [selectedStaff, selectedDate]);

  const openBook = () => {
    form.resetFields();
    setSelectedServiceId(null);
    setSelectedStaffId(null);
    setSelectedDate(null);
    setSelectedStart(null);
    setModalVisible(true);
  };

  const handleBook = () => {
    form.validateFields().then(values => {
      if (hasConflict) {
        message.error('Nhân viên đã có lịch trong khoảng thời gian này!');
        return;
      }
      if (isAtLimit) {
        message.error('Nhân viên đã đạt giới hạn khách trong ngày!');
        return;
      }
      if (!computedEndTime) return;

      const service = services.find(s => s.id === values.serviceId)!;
      const staff = staffList.find(s => s.id === values.staffId)!;

      const result = addAppointment({
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        serviceId: service.id,
        serviceName: service.name,
        staffId: staff.id,
        staffName: staff.name,
        date: selectedDate!,
        startTime: selectedStart!,
        endTime: computedEndTime,
        note: values.note,
      });

      if (result.success) {
        message.success(result.message);
        setModalVisible(false);
      } else {
        message.error(result.message);
      }
    });
  };

  const filteredAppointments = appointments.filter(
    a => filterStatus === 'all' || a.status === filterStatus,
  );

  const total = appointments.length;
  const pending = appointments.filter(a => a.status === 'Chờ duyệt').length;
  const confirmed = appointments.filter(a => a.status === 'Xác nhận').length;
  const completed = appointments.filter(a => a.status === 'Hoàn thành').length;

  const columns = [
    {
      title: 'Mã LH',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id: string) => <Text code style={{ fontSize: 12 }}>{id}</Text>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: any, r: Appointment) => (
        <div>
          <Text strong>{r.customerName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{r.customerPhone}</Text>
        </div>
      ),
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (name: string) => <Tag color="geekblue">{name}</Tag>,
    },
    {
      title: 'Nhân viên',
      dataIndex: 'staffName',
      key: 'staffName',
      render: (name: string) => (
        <Space>
          <UserOutlined />
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Ngày & Giờ',
      key: 'datetime',
      render: (_: any, r: Appointment) => (
        <div>
          <Space>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <Text strong>{dayjs(r.date).format('DD/MM/YYYY')}</Text>
          </Space>
          <br />
          <Space>
            <ClockCircleOutlined style={{ color: '#52c41a' }} />
            <Text type="secondary">{r.startTime} - {r.endTime}</Text>
          </Space>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: AppointmentStatus) => (
        <Tag color={STATUS_CONFIG[status].color}>{STATUS_CONFIG[status].label}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Appointment) => (
        <Space wrap>
          {STATUS_FLOW[record.status].map(nextStatus => (
            <Tooltip key={nextStatus} title={nextStatus}>
              <Button
                size="small"
                type={nextStatus === 'Hủy' ? 'default' : 'primary'}
                danger={nextStatus === 'Hủy'}
                icon={nextStatus === 'Hủy' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                onClick={() => updateAppointmentStatus(record.id, nextStatus)}
              >
                {nextStatus}
              </Button>
            </Tooltip>
          ))}
          {record.status === 'Hủy' && (
            <Popconfirm
              title="Xóa lịch hẹn này?"
              onConfirm={() => deleteAppointment(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button size="small" danger>Xóa</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Quản lý Lịch hẹn"
      extra={[
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openBook}>
          Đặt lịch hẹn
        </Button>,
      ]}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          { label: 'Tổng lịch hẹn', value: total, color: '#1890ff' },
          { label: 'Chờ duyệt', value: pending, color: '#faad14' },
          { label: 'Xác nhận', value: confirmed, color: '#1890ff' },
          { label: 'Hoàn thành', value: completed, color: '#52c41a' },
        ].map(item => (
          <Col xs={12} sm={6} key={item.label}>
            <Card size="small">
              <Statistic title={item.label} value={item.value} valueStyle={{ color: item.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Text strong>Lọc:</Text>
          {(['all', 'Chờ duyệt', 'Xác nhận', 'Hoàn thành', 'Hủy'] as const).map(s => (
            <Button
              key={s}
              type={filterStatus === s ? 'primary' : 'default'}
              size="small"
              onClick={() => setFilterStatus(s)}
            >
              {s === 'all' ? 'Tất cả' : s}
              {s !== 'all' && (
                <Badge
                  count={appointments.filter(a => a.status === s).length}
                  style={{ marginLeft: 4, backgroundColor: 'transparent', color: 'inherit', boxShadow: 'none' }}
                />
              )}
            </Button>
          ))}
        </Space>

        <Table
          columns={columns}
          dataSource={filteredAppointments}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          rowClassName={(record) => record.status === 'Hủy' ? 'ant-table-row-disabled' : ''}
        />
      </Card>

      <Modal
        title={<Title level={4} style={{ margin: 0 }}>📅 Đặt lịch hẹn mới</Title>}
        visible={modalVisible}
        onOk={handleBook}
        onCancel={() => setModalVisible(false)}
        okText="Xác nhận đặt lịch"
        cancelText="Hủy"
        width={640}
        okButtonProps={{ disabled: hasConflict || isAtLimit }}
      >
        <Form form={form} layout="vertical">
          <Divider orientation="left">Thông tin khách hàng</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customerName" label="Họ tên khách hàng" rules={[{ required: true }]}>
                <Input placeholder="Nguyễn Thị A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerPhone" label="Số điện thoại" rules={[{ required: true }]}>
                <Input placeholder="09xxxxxxxx" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Dịch vụ & Nhân viên</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="serviceId" label="Dịch vụ" rules={[{ required: true, message: 'Chọn dịch vụ!' }]}>
                <Select
                  placeholder="Chọn dịch vụ"
                  onChange={(v: number) => {
                    setSelectedServiceId(v);
                    setSelectedStart(null);
                  }}
                  showSearch
                  optionFilterProp="children"
                >
                  {services.map(svc => (
                    <Option key={svc.id} value={svc.id}>
                      {svc.name} — {svc.price.toLocaleString('vi-VN')}đ ({svc.durationMinutes}p)
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="staffId" label="Nhân viên" rules={[{ required: true, message: 'Chọn nhân viên!' }]}>
                <Select
                  placeholder="Chọn nhân viên"
                  onChange={(v: number) => {
                    setSelectedStaffId(v);
                    setSelectedDate(null);
                    setSelectedStart(null);
                    form.setFieldsValue({ date: null, startTime: null });
                  }}
                  showSearch
                  optionFilterProp="children"
                >
                  {staffList.map(staff => (
                    <Option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.specialty})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Ngày & Giờ</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="Ngày hẹn" rules={[{ required: true, message: 'Chọn ngày!' }]}>
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={d => d && d.valueOf() < Date.now() - 86400000}
                  onChange={(_, dateStr) => {
                    setSelectedDate(dateStr as string);
                    setSelectedStart(null);
                    form.setFieldsValue({ startTime: null });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="startTime" label="Giờ bắt đầu" rules={[{ required: true, message: 'Chọn giờ!' }]}>
                <TimePicker
                  style={{ width: '100%' }}
                  format="HH:mm"
                  minuteStep={15}
                  onChange={(_, timeStr) => setSelectedStart(timeStr as string)}
                  disabled={!selectedDate || !selectedStaffId}
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedService && selectedStart && computedEndTime && (
            <Alert
              type="info"
              message={
                <Space>
                  <ClockCircleOutlined />
                  <Text>Dịch vụ <strong>{selectedService.name}</strong> — {selectedStart} đến {computedEndTime} ({selectedService.durationMinutes} phút)</Text>
                </Space>
              }
              style={{ marginBottom: 12 }}
            />
          )}

          {staffWorkHours && (
            <Alert
              type="success"
              message={
                <Text>
                  ✅ Nhân viên làm việc: <strong>{staffWorkHours.startTime} – {staffWorkHours.endTime}</strong> ngày này
                </Text>
              }
              style={{ marginBottom: 12 }}
            />
          )}

          {selectedDate && selectedStaffId && !staffWorkHours && (
            <Alert
              type="warning"
              message="⚠️ Nhân viên không làm việc vào ngày này!"
              style={{ marginBottom: 12 }}
            />
          )}

          {hasConflict && (
            <Alert
              type="error"
              message="❌ Trùng lịch! Nhân viên đã có lịch hẹn trong khoảng thời gian này."
              style={{ marginBottom: 12 }}
            />
          )}

          {isAtLimit && !hasConflict && (
            <Alert
              type="error"
              message={`❌ Nhân viên đã đạt giới hạn ${selectedStaff?.maxClientsPerDay} khách/ngày!`}
              style={{ marginBottom: 12 }}
            />
          )}

          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={2} placeholder="Ghi chú thêm..." />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AppointmentsPage;
