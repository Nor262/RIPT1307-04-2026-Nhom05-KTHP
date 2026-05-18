import React from 'react';
import { useRequest } from '@umijs/max';
import { Row, Col, Card, Statistic, Spin, Badge, Typography, Space } from 'antd';
import {
  DatabaseOutlined,
  SwapOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import { getDashboardStats } from '@/services/api';
import { ProCard } from '@ant-design/pro-components';

const { Text, Title } = Typography;

const AdminDashboard: React.FC = () => {
  const { data: stats, loading } = useRequest(
    async () => {
      try {
        const res = await getDashboardStats();
        return res.data.data;
      } catch (err) {
        return {
          summary: {
            total_equipment: 0,
            available_count: 0,
            in_use_count: 0,
            maintenance_count: 0,
          },
          alerts: { pending_requests: 0, overdue_transactions: 0 },
          charts: { top_borrowed: [], borrow_frequency_by_month: [] },
        };
      }
    }
  );

  const summary = stats?.summary || {};
  const alerts = stats?.alerts || {};
  const charts = stats?.charts || {};

  // Pie Chart - Trạng thái thiết bị
  const pieOptions: any = {
    labels: ['Sẵn sàng', 'Đang mượn', 'Bảo trì'],
    colors: ['#52c41a', '#1890ff', '#faad14'],
    legend: { position: 'bottom' },
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 } } }],
  };
  const pieSeries = [
    summary.available_count || 0,
    summary.in_use_count || 0,
    summary.maintenance_count || 0,
  ];

  // Bar Chart - Thiết bị mượn nhiều nhất
  const barOptions: any = {
    chart: { id: 'top-borrowed' },
    xaxis: {
      categories: charts.top_borrowed?.map((i: any) => i.name) || [],
    },
    colors: ['#722ed1'],
    plotOptions: { bar: { borderRadius: 4, horizontal: true } },
  };
  const barSeries = [
    {
      name: 'Số lần mượn',
      data: charts.top_borrowed?.map((i: any) => i.borrow_count) || [],
    },
  ];

  // Line Chart - Tần suất mượn theo tháng
  const lineOptions: any = {
    chart: { id: 'monthly-frequency', toolbar: { show: false } },
    xaxis: {
      categories: charts.borrow_frequency_by_month?.map((i: any) => i.month) || [],
    },
    colors: ['#1890ff'],
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 5 },
  };
  const lineSeries = [
    {
      name: 'Giao dịch',
      data: charts.borrow_frequency_by_month?.map((i: any) => i.count) || [],
    },
  ];

  if (loading && !stats)
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div style={{ padding: '24px' }}>
      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <ProCard ghost style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '20px' }}>
            <Statistic
              title="Tổng thiết bị"
              value={summary.total_equipment || 0}
              prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard ghost style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '20px' }}>
            <Statistic
              title="Sẵn sàng"
              value={summary.available_count || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard ghost style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '20px' }}>
            <Statistic
              title="Đang cho mượn"
              value={summary.in_use_count || 0}
              prefix={<SwapOutlined style={{ color: '#1890ff' }} />}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard ghost style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '20px' }}>
            <Statistic
              title="Đang bảo trì"
              value={summary.maintenance_count || 0}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </ProCard>
        </Col>
      </Row>

      {/* Alert Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12}>
          <Card size="small" style={{ borderLeft: '4px solid #faad14' }}>
            <Space>
              <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />
              <div>
                <Text type="secondary">Đơn chờ duyệt</Text>
                <Title level={3} style={{ margin: 0 }}>
                  <Badge count={alerts.pending_requests || 0} overflowCount={99} showZero />
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card size="small" style={{ borderLeft: '4px solid #c00c0c' }}>
            <Space>
              <ExclamationCircleOutlined style={{ fontSize: 24, color: '#c00c0c' }} />
              <div>
                <Text type="secondary">Quá hạn trả</Text>
                <Title level={3} style={{ margin: 0, color: '#c00c0c' }}>
                  <Badge count={alerts.overdue_transactions || 0} overflowCount={99} showZero style={{ backgroundColor: '#c00c0c' }} />
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
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

      {/* Monthly Trend */}
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

export default AdminDashboard;
