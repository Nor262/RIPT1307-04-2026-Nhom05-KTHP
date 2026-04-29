import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { TeamOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Chart from 'react-apexcharts';
import { getClubs, getRegistrations } from '../service';

const Statistics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clubCount: 0,
    regPending: 0,
    regApproved: 0,
    regRejected: 0,
    chartData: {
      categories: [] as string[],
      series: [] as { name: string, data: number[] }[],
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      const clubs = await getClubs();
      const regs = await getRegistrations();

      const clubMap: Record<string, { pending: number, approved: number, rejected: number }> = {};
      clubs.forEach(c => {
        clubMap[c.id] = { pending: 0, approved: 0, rejected: 0 };
      });

      regs.forEach(r => {
        if (clubMap[r.clubId]) {
          if (r.status === 'Pending') clubMap[r.clubId].pending++;
          if (r.status === 'Approved') clubMap[r.clubId].approved++;
          if (r.status === 'Rejected') clubMap[r.clubId].rejected++;
        }
      });

      const categories = clubs.map(c => c.name);
      const pendingData = clubs.map(c => clubMap[c.id].pending);
      const approvedData = clubs.map(c => clubMap[c.id].approved);
      const rejectedData = clubs.map(c => clubMap[c.id].rejected);

      setStats({
        clubCount: clubs.length,
        regPending: regs.filter(r => r.status === 'Pending').length,
        regApproved: regs.filter(r => r.status === 'Approved').length,
        regRejected: regs.filter(r => r.status === 'Rejected').length,
        chartData: {
          categories,
          series: [
            { name: 'Chờ duyệt', data: pendingData },
            { name: 'Đã duyệt', data: approvedData },
            { name: 'Từ chối', data: rejectedData },
          ]
        }
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: false,
      toolbar: { show: true }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: stats.chartData.categories,
      title: { text: 'Tên Câu lạc bộ' }
    },
    yaxis: {
      title: { text: 'Số lượng đơn đăng ký' }
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} đơn`
      }
    },
    colors: ['#1890ff', '#52c41a', '#ff4d4f'],
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;

  return (
    <PageContainer title="Báo cáo và Thống kê">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Số lượng Câu lạc bộ"
              value={stats.clubCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f51b5' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn chờ duyệt"
              value={stats.regPending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn đã duyệt"
              value={stats.regApproved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn bị từ chối"
              value={stats.regRejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Thống kê đơn đăng ký theo từng Câu lạc bộ">
            <Chart
              options={chartOptions}
              series={stats.chartData.series}
              type="bar"
              height={400}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Statistics;
