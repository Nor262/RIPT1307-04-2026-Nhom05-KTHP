import React from 'react';
import { useRequest, history } from '@umijs/max';
import { Row, Col, Card, Statistic, Spin, Badge, Typography, Space, Button } from 'antd';
import {
  DatabaseOutlined,
  SwapOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  TeamOutlined,
  BarChartOutlined,
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
        // console.log("data:", res);
        return res.data || res; 
      } catch (err) {
        console.error("Lỗi khi fetch stats:", err);
        return {
          summary: { total_equipment: 0, available_count: 0, in_use_count: 0, maintenance_count: 0 },
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
          <ProCard style={{ border: '0.2px solid #c2bebe', background: '#e6f7ff', borderRadius: 8, padding: '20px' }}>
            <Statistic
              title="Tổng thiết bị"
              value={summary.total_equipment || 0}
              prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#0050b3' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard style={{ border: '0.2px solid #c2bebe', background: '#e3fce7', borderRadius: 8, padding: '20px' }}>
            <Statistic
              title="Sẵn sàng"
              value={summary.available_count || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#389e0d' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard style={{ border: '0.2px solid #c2bebe', background: '#efc9c973', borderRadius: 8, padding: '20px' }}>
            <Statistic
              title="Đang cho mượn"
              value={summary.in_use_count || 0}
              prefix={<SwapOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#0050b3' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard style={{ border: '0.2px solid #c2bebe', background: '#fffbe6', borderRadius: 8, padding: '20px' }}>
            <Statistic
              title="Đang bảo trì"
              value={summary.maintenance_count || 0}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#d46b08' }}
            />
          </ProCard>
        </Col>
      </Row>

      {/* Alert Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12}>
          <Card size="small" style={{
            backgroundImage: "url('./background_card1.svg')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right center',
            borderLeft: '4px solid #faad14',
            borderRadius: '0 8px 8px 0',
            padding: '20px'
          }}>
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
          <Card size="small" style={{
            backgroundImage: "url('./background_card2.svg')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right center',
            borderLeft: '4px solid #C00C0C',
            borderRadius: '0 8px 8px 0',
            padding: '20px'
          }}>
            <Space>
              <ExclamationCircleOutlined style={{ fontSize: 24, color: '#C00C0C' }} />
              <div>
                <Text type="secondary">Quá hạn trả</Text>
                <Title level={3} style={{ margin: 0, color: '#C00C0C' }}>
                  <Badge count={alerts.overdue_transactions || 0} overflowCount={99} showZero style={{ backgroundColor: '#C00C0C' }} />
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row >

      {/* Lối tắt quản trị */}
      <Card title="Lối tắt quản trị" style={{ marginTop: 16, borderRadius: 8 }} bordered={false}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="default"
              icon={<TeamOutlined style={{ color: '#1890ff' }} />}
              onClick={() => history.push('/system/users')}
              block
              style={{
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Quản lý Người dùng
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="default"
              icon={<SwapOutlined style={{ color: '#52c41a' }} />}
              onClick={() => history.push('/booking/list')}
              block
              style={{
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Phê duyệt Mượn/Trả
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="default"
              icon={<DatabaseOutlined style={{ color: '#faad14' }} />}
              onClick={() => history.push('/asset/equipment')}
              block
              style={{
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Quản lý Thiết bị
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="default"
              icon={<BarChartOutlined style={{ color: '#722ed1' }} />}
              onClick={() => history.push('/reports/export')}
              block
              style={{
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Xuất Báo cáo
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={10}>
          <Card title="Trạng thái thiết bị" bordered={false}
            style={{
              backgroundImage: "url('./assignment_background.svg')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right center',
              borderLeft: '4px solid #faad14',
              borderRadius: '0 8px 8px 0',
              padding: '20px'
            }}
          >
            <ReactApexChart options={pieOptions} series={pieSeries} type="pie" height={320} />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Thiết bị mượn nhiều nhất" bordered={false}>
            <ReactApexChart options={barOptions} series={barSeries} type="bar" height={320} />
          </Card>
        </Col>
      </Row >

      {/* Monthly Trend */}
      {
        charts.borrow_frequency_by_month?.length > 0 && (
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card title="Tần suất mượn theo tháng" bordered={false}>
                <ReactApexChart options={lineOptions} series={lineSeries} type="line" height={300} />
              </Card>
            </Col>
          </Row>
        )
      }
    </div >
  );
};

export default AdminDashboard;
