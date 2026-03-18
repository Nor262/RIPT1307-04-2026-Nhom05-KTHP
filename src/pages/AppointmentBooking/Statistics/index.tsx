import React, { useMemo, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card, Row, Col, Statistic, Table, Select, Space,
  Tag, Progress, Typography, Tabs,
} from 'antd';
import {
  CalendarOutlined, DollarOutlined, TeamOutlined,
  BarChartOutlined, TrophyOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

type GroupBy = 'day' | 'month';

const StatisticsPage: React.FC = () => {
  const { appointments, services, staffList, reviews } = useModel('appointment');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [activeTab, setActiveTab] = useState('overview');

  const completed = appointments.filter(a => a.status === 'Hoàn thành');

  const getServicePrice = (serviceId: number) =>
    services.find(s => s.id === serviceId)?.price ?? 0;

  const totalRevenue = completed.reduce((s, a) => s + getServicePrice(a.serviceId), 0);
  const totalAppointments = appointments.length;
  const completionRate = totalAppointments
    ? Math.round((completed.length / totalAppointments) * 100)
    : 0;
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const groupedAppointments = useMemo(() => {
    const map: Record<string, { label: string; total: number; completed: number; revenue: number }> = {};
    appointments.forEach(a => {
      const key = groupBy === 'day'
        ? a.date
        : a.date.substring(0, 7);
      const label = groupBy === 'day'
        ? dayjs(a.date).format('DD/MM/YYYY')
        : dayjs(a.date).format('MM/YYYY');
      if (!map[key]) map[key] = { label, total: 0, completed: 0, revenue: 0 };
      map[key].total += 1;
      if (a.status === 'Hoàn thành') {
        map[key].completed += 1;
        map[key].revenue += getServicePrice(a.serviceId);
      }
    });
    return Object.entries(map)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, v]) => ({ key, ...v }));
  }, [appointments, groupBy]);

  const maxRevenue = Math.max(...groupedAppointments.map(g => g.revenue), 1);
  const maxAppointments = Math.max(...groupedAppointments.map(g => g.total), 1);

  const serviceStats = useMemo(() => {
    const map: Record<number, { name: string; count: number; revenue: number }> = {};
    completed.forEach(a => {
      if (!map[a.serviceId]) map[a.serviceId] = { name: a.serviceName, count: 0, revenue: 0 };
      map[a.serviceId].count += 1;
      map[a.serviceId].revenue += getServicePrice(a.serviceId);
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [completed]);

  const maxServiceRevenue = Math.max(...serviceStats.map(s => s.revenue), 1);

  const staffStats = useMemo(() => {
    return staffList.map(staff => {
      const staffCompleted = completed.filter(a => a.staffId === staff.id);
      const revenue = staffCompleted.reduce((s, a) => s + getServicePrice(a.serviceId), 0);
      const staffReviews = reviews.filter(r => r.staffId === staff.id);
      const avgStaffRating = staffReviews.length
        ? staffReviews.reduce((s, r) => s + r.rating, 0) / staffReviews.length
        : 0;
      return {
        id: staff.id,
        name: staff.name,
        specialty: staff.specialty,
        completedCount: staffCompleted.length,
        totalCount: appointments.filter(a => a.staffId === staff.id).length,
        revenue,
        avgRating: avgStaffRating,
        reviewCount: staffReviews.length,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [staffList, completed, reviews, appointments]);

  const maxStaffRevenue = Math.max(...staffStats.map(s => s.revenue), 1);

  const timeColumns = [
    {
      title: groupBy === 'day' ? 'Ngày' : 'Tháng',
      dataIndex: 'label',
      key: 'label',
      render: (label: string) => <Text strong>{label}</Text>,
    },
    {
      title: 'Số lịch hẹn',
      key: 'total',
      render: (_: any, r: (typeof groupedAppointments)[0]) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Text>{r.total} (hoàn thành: {r.completed})</Text>
          <Progress percent={Math.round((r.total / maxAppointments) * 100)} showInfo={false} size="small" />
        </Space>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (rev: number, r: (typeof groupedAppointments)[0]) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Text strong style={{ color: '#52c41a' }}>{rev.toLocaleString('vi-VN')}đ</Text>
          <Progress percent={Math.round((rev / maxRevenue) * 100)} showInfo={false} strokeColor="#52c41a" size="small" />
        </Space>
      ),
    },
  ];

  const serviceColumns = [
    { title: '#', key: 'idx', render: (_: any, __: any, i: number) => i + 1, width: 40 },
    { title: 'Dịch vụ', dataIndex: 'name', key: 'name', render: (n: string) => <Tag color="geekblue">{n}</Tag> },
    { title: 'Lượt đặt', dataIndex: 'count', key: 'count', align: 'center' as const },
    {
      title: 'Doanh thu',
      key: 'revenue',
      render: (_: any, r: (typeof serviceStats)[0]) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Text strong style={{ color: '#52c41a' }}>{r.revenue.toLocaleString('vi-VN')}đ</Text>
          <Progress percent={Math.round((r.revenue / maxServiceRevenue) * 100)} showInfo={false} strokeColor="#52c41a" size="small" />
        </Space>
      ),
    },
  ];

  const staffColumns = [
    { title: '#', key: 'idx', render: (_: any, __: any, i: number) => i + 1, width: 40 },
    {
      title: 'Nhân viên',
      key: 'name',
      render: (_: any, r: (typeof staffStats)[0]) => (
        <div>
          <Text strong>{r.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>{r.specialty}</Text>
        </div>
      ),
    },
    {
      title: 'Lịch hẹn',
      key: 'count',
      align: 'center' as const,
      render: (_: any, r: (typeof staffStats)[0]) => (
        <Text>{r.completedCount}/{r.totalCount}</Text>
      ),
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      align: 'center' as const,
      render: (_: any, r: (typeof staffStats)[0]) => r.reviewCount > 0
        ? <Text>⭐ {r.avgRating.toFixed(1)} ({r.reviewCount})</Text>
        : <Text type="secondary">-</Text>,
    },
    {
      title: 'Doanh thu',
      key: 'revenue',
      render: (_: any, r: (typeof staffStats)[0]) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Text strong style={{ color: '#52c41a' }}>{r.revenue.toLocaleString('vi-VN')}đ</Text>
          <Progress percent={Math.round((r.revenue / maxStaffRevenue) * 100)} showInfo={false} strokeColor="#722ed1" size="small" />
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Thống kê & Báo cáo">
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          { title: 'Tổng lịch hẹn', value: totalAppointments, icon: <CalendarOutlined />, color: '#1890ff' },
          { title: 'Hoàn thành', value: completed.length, icon: <BarChartOutlined />, color: '#52c41a' },
          { title: 'Tổng doanh thu', value: totalRevenue.toLocaleString('vi-VN') + 'đ', icon: <DollarOutlined />, color: '#52c41a', raw: true },
          { title: 'Tổng đánh giá', value: reviews.length, icon: <TrophyOutlined />, color: '#faad14' },
        ].map(item => (
          <Col xs={12} sm={6} key={item.title}>
            <Card size="small">
              <Statistic
                title={item.title}
                value={item.raw ? undefined : item.value}
                prefix={item.icon}
                valueStyle={{ color: item.color }}
                formatter={item.raw ? () => item.value : undefined}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary">Tỷ lệ hoàn thành</Text>
              <Text strong style={{ color: '#52c41a' }}>{completionRate}%</Text>
            </div>
            <Progress percent={completionRate} strokeColor="#52c41a" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary">Rating trung bình</Text>
              <Text strong style={{ color: '#faad14' }}>⭐ {avgRating.toFixed(1)}/5</Text>
            </div>
            <Progress percent={Math.round(avgRating * 20)} strokeColor="#faad14" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary">Tỷ lệ được đánh giá</Text>
              <Text strong style={{ color: '#1890ff' }}>
                {completed.length ? Math.round((reviews.length / completed.length) * 100) : 0}%
              </Text>
            </div>
            <Progress
              percent={completed.length ? Math.round((reviews.length / completed.length) * 100) : 0}
              strokeColor="#1890ff"
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          key="overview"
          tab={<Space><CalendarOutlined />Theo thời gian</Space>}
        >
          <Card
            title="Số lịch hẹn & Doanh thu"
            extra={
              <Select value={groupBy} onChange={setGroupBy} style={{ width: 120 }}>
                <Option value="day">Theo ngày</Option>
                <Option value="month">Theo tháng</Option>
              </Select>
            }
          >
            <Table
              columns={timeColumns}
              dataSource={groupedAppointments}
              rowKey="key"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane
          key="service"
          tab={<Space><BarChartOutlined />Theo dịch vụ</Space>}
        >
          <Card title="Doanh thu theo dịch vụ">
            <Table
              columns={serviceColumns}
              dataSource={serviceStats}
              rowKey="name"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane
          key="staff"
          tab={<Space><TeamOutlined />Theo nhân viên</Space>}
        >
          <Card title="Thống kê nhân viên">
            <Table
              columns={staffColumns}
              dataSource={staffStats}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </PageContainer>
  );
};

export default StatisticsPage;
