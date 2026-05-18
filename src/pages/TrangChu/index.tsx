import React from 'react';
import { useRequest, useAccess, useModel } from '@umijs/max';
import { Row, Col, Card, Statistic, Spin, Typography, Space, Button, Result } from 'antd';
import {
  DatabaseOutlined,
  SwapOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  BookOutlined,
  FileTextOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import { getDashboardStats } from '@/services/api';
import { ProCard } from '@ant-design/pro-components';
import { history } from '@umijs/max';

const { Text, Title, Paragraph } = Typography;

// Dashboard dành cho Admin & Storekeeper
const AdminDashboard: React.FC = () => {
  const { data: stats, loading } = useRequest(
    async () => {
      const res = await getDashboardStats();
      return res.data.data;
    },
    {
      pollingInterval: 5000,
      pollingWhenHidden: false,
    }
  );

  const summary = stats?.summary || {};
  const alerts = stats?.alerts || {};
  const charts = stats?.charts || {};

  const pieOptions: any = {
    labels: ['Sẵn sàng', 'Đang mượn', 'Bảo trì'],
    colors: ['#10b981', '#3b82f6', '#f59e0b'],
    legend: { position: 'bottom' },
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 } } }],
  };
  const pieSeries = [
    summary.available_count || 0,
    summary.in_use_count || 0,
    summary.maintenance_count || 0,
  ];

  const barOptions: any = {
    chart: { id: 'top-borrowed', toolbar: { show: false } },
    xaxis: { categories: charts.top_borrowed?.map((i: any) => i.name) || [] },
    colors: ['#8b5cf6'],
    plotOptions: { bar: { borderRadius: 6, horizontal: true } },
  };
  const barSeries = [{ name: 'Số lần mượn', data: charts.top_borrowed?.map((i: any) => i.borrow_count) || [] }];

  const lineOptions: any = {
    chart: { id: 'monthly-frequency', toolbar: { show: false } },
    xaxis: { categories: charts.borrow_frequency_by_month?.map((i: any) => i.month) || [] },
    colors: ['#3b82f6'],
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 5 },
  };
  const lineSeries = [{ name: 'Giao dịch', data: charts.borrow_frequency_by_month?.map((i: any) => i.count) || [] }];

  if (loading && !stats)
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <ProCard ghost className="stat-card-premium" style={{ padding: '24px' }}>
            <Statistic
              title="Tổng thiết bị"
              value={summary.total_equipment || 0}
              prefix={<div style={{ padding: '12px', borderRadius: '12px', background: '#eff6ff', display: 'flex', marginRight: 12 }}><DatabaseOutlined style={{ color: '#3b82f6' }} /></div>}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard ghost className="stat-card-premium" style={{ padding: '24px' }}>
            <Statistic
              title="Sẵn sàng"
              value={summary.available_count || 0}
              prefix={<div style={{ padding: '12px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', marginRight: 12 }}><CheckCircleOutlined style={{ color: '#10b981' }} /></div>}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard ghost className="stat-card-premium" style={{ padding: '24px' }}>
            <Statistic
              title="Đang cho mượn"
              value={summary.in_use_count || 0}
              prefix={<div style={{ padding: '12px', borderRadius: '12px', background: '#eff6ff', display: 'flex', marginRight: 12 }}><SwapOutlined style={{ color: '#3b82f6' }} /></div>}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard ghost className="stat-card-premium" style={{ padding: '24px' }}>
            <Statistic
              title="Đang bảo trì"
              value={summary.maintenance_count || 0}
              prefix={<div style={{ padding: '12px', borderRadius: '12px', background: '#fffbeb', display: 'flex', marginRight: 12 }}><WarningOutlined style={{ color: '#f59e0b' }} /></div>}
            />
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)', borderLeft: '6px solid #f59e0b' }}>
            <Space size="large">
              <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)' }}>
                <ClockCircleOutlined style={{ fontSize: 32, color: '#f59e0b' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 16, fontWeight: 500 }}>Đơn chờ duyệt</Text>
                <Title level={2} style={{ margin: 0, color: '#1f2937' }}>{alerts.pending_requests || 0}</Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)', borderLeft: '6px solid #ef4444' }}>
            <Space size="large">
              <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)' }}>
                <ExclamationCircleOutlined style={{ fontSize: 32, color: '#ef4444' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 16, fontWeight: 500 }}>Quá hạn trả</Text>
                <Title level={2} style={{ margin: 0, color: '#ef4444' }}>{alerts.overdue_transactions || 0}</Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={10}>
          <Card title="Trạng thái thiết bị" bordered={false}>
            <ReactApexChart options={pieOptions} series={pieSeries} type="pie" height={320} />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Thiết bị mượn nhiều nhất" bordered={false}>
            <ReactApexChart options={barOptions} series={barSeries} type="bar" height={320} />
          </Card>
        </Col>
      </Row>

      {charts.borrow_frequency_by_month?.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="Tần suất mượn theo tháng" bordered={false}>
              <ReactApexChart options={lineOptions} series={lineSeries} type="line" height={300} />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

// Dashboard dành riêng cho Borrower (Sinh viên) - không gọi API analytics
const BorrowerDashboard: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const userName = initialState?.currentUser?.full_name || 'Bạn';

  return (
    <div style={{ padding: '24px' }}>
      <Result
        icon={<SmileOutlined style={{ color: '#ff4d4f' }} />}
        title={`Xin chào, ${userName}!`}
        subTitle="Chào mừng bạn đến với Hệ thống Quản lý Mượn/Trả Thiết bị RIPT."
        extra={[
          <Button
            key="equipment"
            type="primary"
            icon={<DatabaseOutlined />}
            size="large"
            onClick={() => history.push('/asset/equipment')}
          >
            Xem danh sách thiết bị
          </Button>,
        ]}
      />

      <Row gutter={[24, 24]} style={{ marginTop: 8 }}>
        <Col xs={24} md={8}>
          <Card
            hoverable
            bordered={false}
            style={{ borderRadius: 16, textAlign: 'center', cursor: 'pointer', borderTop: '4px solid #3b82f6' }}
            onClick={() => history.push('/asset/equipment')}
          >
            <DatabaseOutlined style={{ fontSize: 40, color: '#3b82f6', marginBottom: 16 }} />
            <Title level={4}>Danh sách thiết bị</Title>
            <Paragraph type="secondary">Xem tất cả thiết bị hiện có trong kho và tình trạng sẵn sàng mượn.</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            hoverable
            bordered={false}
            style={{ borderRadius: 16, textAlign: 'center', cursor: 'pointer', borderTop: '4px solid #10b981' }}
            onClick={() => history.push('/my-bookings')}
          >
            <FileTextOutlined style={{ fontSize: 40, color: '#10b981', marginBottom: 16 }} />
            <Title level={4}>Đơn mượn của tôi</Title>
            <Paragraph type="secondary">Theo dõi lịch sử và trạng thái các đơn mượn thiết bị của bạn.</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            hoverable
            bordered={false}
            style={{ borderRadius: 16, textAlign: 'center', cursor: 'pointer', borderTop: '4px solid #f59e0b' }}
          >
            <BookOutlined style={{ fontSize: 40, color: '#f59e0b', marginBottom: 16 }} />
            <Title level={4}>Hướng dẫn mượn thiết bị</Title>
            <Paragraph type="secondary">Tìm hiểu quy trình đặt mượn và các quy định sử dụng thiết bị.</Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Component chính - tự động chọn Dashboard phù hợp theo role
const Dashboard: React.FC = () => {
  const access = useAccess();

  if (access.canAdminOrStorekeeper) {
    return <AdminDashboard />;
  }

  return <BorrowerDashboard />;
};

export default Dashboard;
