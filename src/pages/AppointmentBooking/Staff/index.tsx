import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card, Table, Button, Space, Modal, Form, Input, InputNumber,
  Tag, Tooltip, Popconfirm, Row, Col, Rate, Typography,
  Checkbox, TimePicker, Divider, Badge,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, StarOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import type { Staff, WorkSchedule } from '@/models/appointment';
import moment from 'moment';

const { Text } = Typography;

const DAY_LABELS: Record<number, string> = {
  0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7',
};

const DAY_COLORS: Record<number, string> = {
  0: 'red', 1: 'blue', 2: 'cyan', 3: 'green', 4: 'purple', 5: 'orange', 6: 'gold',
};

interface ScheduleRow {
  dayOfWeek: number;
  checked: boolean;
  startTime: string;
  endTime: string;
}

const defaultScheduleRows = (): ScheduleRow[] =>
  [1, 2, 3, 4, 5, 6, 0].map(d => ({
    dayOfWeek: d,
    checked: false,
    startTime: '09:00',
    endTime: '17:00',
  }));

const StaffPage: React.FC = () => {
  const { staffList, addStaff, updateStaff, deleteStaff, getStaffAverageRating, reviews } = useModel('appointment');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [form] = Form.useForm();
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>(defaultScheduleRows());

  const openAdd = () => {
    setEditingStaff(null);
    form.resetFields();
    setScheduleRows(defaultScheduleRows());
    setModalVisible(true);
  };

  const openEdit = (staff: Staff) => {
    setEditingStaff(staff);
    form.setFieldsValue({
      name: staff.name,
      specialty: staff.specialty,
      phone: staff.phone,
      email: staff.email,
      maxClientsPerDay: staff.maxClientsPerDay,
    });
    const rows = defaultScheduleRows().map(row => {
      const found = staff.workSchedules.find(s => s.dayOfWeek === row.dayOfWeek);
      return found
        ? { ...row, checked: true, startTime: found.startTime, endTime: found.endTime }
        : row;
    });
    setScheduleRows(rows);
    setModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const workSchedules: WorkSchedule[] = scheduleRows
        .filter(r => r.checked)
        .map(r => ({ dayOfWeek: r.dayOfWeek, startTime: r.startTime, endTime: r.endTime }));

      if (editingStaff) {
        updateStaff(editingStaff.id, { ...values, workSchedules });
      } else {
        addStaff({ ...values, workSchedules });
      }
      setModalVisible(false);
    });
  };

  const updateRow = (dayOfWeek: number, field: keyof ScheduleRow, value: any) => {
    setScheduleRows(prev => prev.map(r => r.dayOfWeek === dayOfWeek ? { ...r, [field]: value } : r));
  };

  const columns = [
    {
      title: 'Nhân viên',
      key: 'name',
      render: (_: any, record: Staff) => (
        <Space>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #1890ff, #722ed1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700,
          }}>
            {record.name.charAt(0)}
          </div>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.specialty}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_: any, record: Staff) => (
        <div>
          <div>{record.phone}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
        </div>
      ),
    },
    {
      title: 'Giới hạn/ngày',
      dataIndex: 'maxClientsPerDay',
      key: 'maxClientsPerDay',
      align: 'center' as const,
      render: (val: number) => <Badge count={val} style={{ backgroundColor: '#52c41a' }} />,
    },
    {
      title: 'Lịch làm việc',
      key: 'schedule',
      render: (_: any, record: Staff) => (
        <Space wrap>
          {record.workSchedules.map(s => (
            <Tooltip key={s.dayOfWeek} title={`${s.startTime} - ${s.endTime}`}>
              <Tag color={DAY_COLORS[s.dayOfWeek]}>{DAY_LABELS[s.dayOfWeek]}</Tag>
            </Tooltip>
          ))}
          {record.workSchedules.length === 0 && <Text type="secondary">Chưa có lịch</Text>}
        </Space>
      ),
    },
    {
      title: 'Đánh giá TB',
      key: 'rating',
      align: 'center' as const,
      render: (_: any, record: Staff) => {
        const avg = getStaffAverageRating(record.id);
        const count = reviews.filter(r => r.staffId === record.id).length;
        return avg > 0
          ? <Space direction="vertical" size={0} style={{ alignItems: 'center' }}>
              <Rate disabled value={avg} allowHalf style={{ fontSize: 14 }} />
              <Text type="secondary" style={{ fontSize: 11 }}>{avg.toFixed(1)} ({count} đánh giá)</Text>
            </Space>
          : <Text type="secondary">Chưa có</Text>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: Staff) => (
        <Space>
          <Tooltip title="Sửa">
            <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa nhân viên này?"
            onConfirm={() => deleteStaff(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger shape="circle" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Quản lý Nhân viên"
      extra={[
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Thêm nhân viên
        </Button>,
      ]}
    >
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card size="small" style={{ background: 'linear-gradient(135deg, #1890ff22, #1890ff11)', border: '1px solid #1890ff33' }}>
              <Space>
                <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1890ff' }}>{staffList.length}</div>
                  <Text type="secondary">Tổng nhân viên</Text>
                </div>
              </Space>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ background: 'linear-gradient(135deg, #52c41a22, #52c41a11)', border: '1px solid #52c41a33' }}>
              <Space>
                <StarOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>
                    {(staffList.reduce((s, st) => s + getStaffAverageRating(st.id), 0) / (staffList.filter(st => getStaffAverageRating(st.id) > 0).length || 1)).toFixed(1)}
                  </div>
                  <Text type="secondary">Rating trung bình</Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={staffList}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
        visible={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText={editingStaff ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={680}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="specialty" label="Chuyên môn" rules={[{ required: true, message: 'Vui lòng nhập chuyên môn!' }]}>
                <Input placeholder="Cắt tóc nam, Spa..." />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}>
                <Input placeholder="09xxxxxxxx" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="example@email.com" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="maxClientsPerDay" label="Giới hạn khách/ngày" rules={[{ required: true }]}>
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>

          <Divider>Lịch làm việc</Divider>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {scheduleRows.map(row => (
              <Row key={row.dayOfWeek} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                <Col span={5}>
                  <Checkbox
                    checked={row.checked}
                    onChange={e => updateRow(row.dayOfWeek, 'checked', e.target.checked)}
                  >
                    <Tag color={DAY_COLORS[row.dayOfWeek]}>{DAY_LABELS[row.dayOfWeek]}</Tag>
                  </Checkbox>
                </Col>
                <Col span={9}>
                  <TimePicker
                    format="HH:mm"
                    value={moment(row.startTime, 'HH:mm')}
                    onChange={(_, s) => updateRow(row.dayOfWeek, 'startTime', s as string)}
                    disabled={!row.checked}
                    style={{ width: '100%' }}
                    size="small"
                    placeholder="Từ"
                  />
                </Col>
                <Col span={1} style={{ textAlign: 'center' }}>-</Col>
                <Col span={9}>
                  <TimePicker
                    format="HH:mm"
                    value={moment(row.endTime, 'HH:mm')}
                    onChange={(_, s) => updateRow(row.dayOfWeek, 'endTime', s as string)}
                    disabled={!row.checked}
                    style={{ width: '100%' }}
                    size="small"
                    placeholder="Đến"
                  />
                </Col>
              </Row>
            ))}
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default StaffPage;
