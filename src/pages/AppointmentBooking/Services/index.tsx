import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card, Table, Button, Space, Modal, Form, Input, InputNumber,
  Select, Tag, Tooltip, Popconfirm, Row, Col, Typography, Statistic,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined,
  ClockCircleOutlined, DollarOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import type { Service } from '@/models/appointment';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CATEGORY_COLORS: Record<string, string> = {
  'Tóc': 'blue',
  'Spa': 'purple',
  'Massage': 'cyan',
  'Khám bệnh': 'red',
  'Sửa chữa': 'orange',
  'Khác': 'default',
};

const CATEGORIES = ['Tóc', 'Spa', 'Massage', 'Khám bệnh', 'Sửa chữa', 'Khác'];

const ServicesPage: React.FC = () => {
  const { services, addService, updateService, deleteService } = useModel('appointment');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();

  const openAdd = () => {
    setEditingService(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEdit = (svc: Service) => {
    setEditingService(svc);
    form.setFieldsValue(svc);
    setModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingService) {
        updateService(editingService.id, values);
      } else {
        addService(values);
      }
      setModalVisible(false);
    });
  };

  const totalServices = services.length;
  const avgPrice = services.length
    ? services.reduce((s, svc) => s + svc.price, 0) / services.length
    : 0;
  const avgDuration = services.length
    ? services.reduce((s, svc) => s + svc.durationMinutes, 0) / services.length
    : 0;
  const categories = [...new Set(services.map(s => s.category))];

  const columns = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60, render: (_: any, __: any, idx: number) => idx + 1 },
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Service) => (
        <div>
          <Text strong>{name}</Text>
          {record.description && (
            <><br /><Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text></>
          )}
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      filters: CATEGORIES.map(c => ({ text: c, value: c })),
      onFilter: (value: any, record: Service) => record.category === value,
      render: (cat: string) => <Tag color={CATEGORY_COLORS[cat] || 'default'}>{cat}</Tag>,
    },
    {
      title: 'Giá (VND)',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      sorter: (a: Service, b: Service) => a.price - b.price,
      render: (price: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {price.toLocaleString('vi-VN')}đ
        </Text>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      align: 'center' as const,
      sorter: (a: Service, b: Service) => a.durationMinutes - b.durationMinutes,
      render: (min: number) => (
        <Tag icon={<ClockCircleOutlined />} color="geekblue">
          {min >= 60 ? `${Math.floor(min / 60)}h${min % 60 > 0 ? `${min % 60}p` : ''}` : `${min} phút`}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: Service) => (
        <Space>
          <Tooltip title="Sửa">
            <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa dịch vụ này?"
            onConfirm={() => deleteService(record.id)}
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
      title="Quản lý Dịch vụ"
      extra={[
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Thêm dịch vụ
        </Button>,
      ]}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Tổng dịch vụ"
              value={totalServices}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Giá trung bình"
              value={Math.round(avgPrice)}
              prefix={<DollarOutlined />}
              suffix="đ"
              formatter={(v: any) => Number(v).toLocaleString('vi-VN')}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Thời gian TB"
              value={Math.round(avgDuration)}
              prefix={<ClockCircleOutlined />}
              suffix="phút"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 12 }}>
          <Space wrap>
            <Text type="secondary">Danh mục:</Text>
            {categories.map(cat => (
              <Tag key={cat} color={CATEGORY_COLORS[cat] || 'default'}>
                {cat} ({services.filter(s => s.category === cat).length})
              </Tag>
            ))}
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}
        visible={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText={editingService ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={540}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}>
            <Input placeholder="VD: Cắt tóc nam, Massage thư giãn..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục!' }]}>
                <Select placeholder="Chọn danh mục">
                  {CATEGORIES.map(c => (
                    <Option key={c} value={c}>{c}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="durationMinutes" label="Thời gian (phút)" rules={[{ required: true }]}>
                <InputNumber min={5} max={480} step={5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="price" label="Giá (VND)" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              step={10000}
              style={{ width: '100%' }}
              formatter={(v: any) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v: any) => v!.replace(/,/g, '')}
            />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={2} placeholder="Mô tả ngắn về dịch vụ..." />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ServicesPage;
