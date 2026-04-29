import React, { useRef, useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Popconfirm, Image, Card, Statistic, Row, Col, Form, Modal, Input, InputNumber, Select } from 'antd';
import Chart from 'react-apexcharts';
import { Destination } from '../data';
import { getDestinations, addDestination, updateDestination, removeDestination, getItineraries } from '../../../services/Travel/service';
import { PlusOutlined } from '@ant-design/icons';

const AdminDestinations: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [form] = Form.useForm();
  
  const [stats, setStats] = useState({ totalDestinations: 0, totalItineraries: 0, totalBudget: 0 });

  const [popularDestLocations, setPopularDestLocations] = useState<any>({ labels: [], series: [] });
  const [budgetByCategory, setBudgetByCategory] = useState<any>({ series: [] });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const dest = await getDestinations();
    const itins = await getItineraries();
    
    let budget = 0;
    let food = 0, acc = 0, trans = 0;
    const destCounts: Record<string, number> = {};

    itins.data.forEach(i => {
      budget += (i.budget || 0);
      i.days.forEach(day => {
        day.destinations.forEach(dest => {
           food += dest.costs?.food || 0;
           acc += dest.costs?.accommodation || 0;
           trans += dest.costs?.transport || 0;
           destCounts[dest.name] = (destCounts[dest.name] || 0) + 1;
        });
      });
    });

    const sortedDests = Object.keys(destCounts).sort((a, b) => destCounts[b] - destCounts[a]).slice(0, 5);
    const popularLabels = sortedDests;
    const popularSeries = sortedDests.map(k => destCounts[k]);

    setPopularDestLocations({ labels: popularLabels, series: popularSeries });
    setBudgetByCategory({ series: [food, acc, trans] });

    setStats({
      totalDestinations: dest.total,
      totalItineraries: itins.total,
      totalBudget: budget,
    });
  };

  const loadData = async (params: any) => {
    const result = await getDestinations();
    let data = result.data;
    
    if (params.name) {
      data = data.filter(item => item.name.toLowerCase().includes(params.name.toLowerCase()));
    }
    if (params.type) {
      data = data.filter(item => item.type === params.type);
    }
    
    return {
      data: data,
      success: true,
      total: data.length,
    };
  };

  const handleDelete = async (id: string) => {
    const res = await removeDestination(id);
    if (res.success) {
      actionRef.current?.reload();
      loadStats();
    }
  };

  const columns: ProColumns<Destination>[] = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      hideInSearch: true,
      render: (_, record) => (
        <Image src={record.image} width={60} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />
      ),
    },
    {
      title: 'Tên Điểm Đến',
      dataIndex: 'name',
    },
    {
      title: 'Khu vực',
      dataIndex: 'location',
      hideInSearch: true,
    },
    {
      title: 'Loại hình',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: {
        beach: { text: 'Biển' },
        mountain: { text: 'Núi' },
        city: { text: 'Thành phố' },
      },
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      hideInSearch: true,
    },
    {
      title: 'Chi phí cơ bản (VNĐ)',
      hideInSearch: true,
      render: (_, record) => {
        const total = (record.costs?.food || 0) + (record.costs?.accommodation || 0) + (record.costs?.transport || 0);
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
      }
    },
    {
      title: 'Hành động',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          onClick={() => {
            setEditingDestination(record);
            form.setFieldsValue({
              ...record,
              food: record.costs?.food,
              accommodation: record.costs?.accommodation,
              transport: record.costs?.transport,
            });
            setModalVisible(true);
          }}
        >
          Sửa
        </Button>,
        <Popconfirm
          key="delete"
          title="Bạn có chắc chắn muốn xóa điểm đến này?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="link" danger>Xóa</Button>
        </Popconfirm>,
      ],
    },
  ];

  const handleFinish = async (values: any) => {
    const formattedData = {
      name: values.name,
      location: values.location,
      image: values.image,
      type: values.type,
      rating: values.rating,
      timeToVisit: values.timeToVisit,
      description: values.description,
      costs: {
        food: values.food || 0,
        accommodation: values.accommodation || 0,
        transport: values.transport || 0,
      }
    };

    let res;
    if (editingDestination) {
      res = await updateDestination(editingDestination.id, formattedData);
    } else {
      res = await addDestination(formattedData as Destination);
    }

    if (res.success) {
      setModalVisible(false);
      actionRef.current?.reload();
      loadStats();
    }
  };

  return (
    <PageContainer>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng Số Điểm Đến" value={stats.totalDestinations} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Số Lịch Trình Đã Tạo" value={stats.totalItineraries} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng Mức Ngân Sách Ước Tính" value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalBudget)} />
          </Card>
        </Col>
      </Row>

      <Card title="Thống Kê Tổng Quan" style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 16 }}>Nhóm Chi Phí Ước Tính</div>
            <Chart
                options={{
                  labels: ['Ăn Uống', 'Lưu Trú', 'Di Chuyển'],
                  colors: ['#1890ff', '#52c41a', '#faad14'],
                  legend: { position: 'bottom' }
                }}
                series={budgetByCategory.series.length ? budgetByCategory.series : [0,0,0]}
                type="pie"
                width="100%"
                height="300"
              />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 16 }}>Top Địa Điểm Được Thêm Vào Lịch Trình</div>
            <Chart
                options={{
                  labels: popularDestLocations.labels,
                  legend: { position: 'bottom' }
                }}
                series={popularDestLocations.series.length ? popularDestLocations.series : [0]}
                type="donut"
                width="100%"
                height="300"
              />
          </Col>
        </Row>
      </Card>

      <ProTable<Destination>
        headerTitle="Danh sách Điểm Đến"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingDestination(null);
              form.resetFields();
              setModalVisible(true);
            }}
            type="primary"
          >
            Thêm mới
          </Button>,
        ]}
        request={loadData}
        columns={columns}
      />

      <Modal
        title={editingDestination ? 'Sửa Điểm Đến' : 'Thêm Điểm Đến'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Tên Địa Điểm" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="location" label="Khu Vực (Vị trí)" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Loại Địa Hình" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="beach">Biển</Select.Option>
                  <Select.Option value="mountain">Núi</Select.Option>
                  <Select.Option value="city">Thành Phố</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="rating" label="Đánh Giá (1-5 sao)" rules={[{ required: true }]}>
                <InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="image" label="Link Hình Ảnh (URL)" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="timeToVisit" label="Thời gian tham quan (Giờ)" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="food" label="Chi phí Ăn Uống (VNĐ)" rules={[{ required: true }]}>
                <InputNumber min={0} step={50000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="accommodation" label="Chi phí Lưu Trú (VNĐ)" rules={[{ required: true }]}>
                <InputNumber min={0} step={50000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="transport" label="Chi phí Di Chuyển (VNĐ)" rules={[{ required: true }]}>
                <InputNumber min={0} step={50000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Mô Tả" rules={[{ required: true }]}>
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu Thành Phố
            </Button>
          </div>
        </Form>
      </Modal>

    </PageContainer>
  );
};

export default AdminDestinations;
