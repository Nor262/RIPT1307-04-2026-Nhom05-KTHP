import React, { useState, useEffect } from 'react';
import { history } from '@umijs/max';
import { Row, Col, Card, Statistic, Spin, Tag, Typography, Space, List, Button, Empty } from 'antd';
import {
  SwapOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  ScanOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { getTransactions, getEquipment } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';

const { Text, Title } = Typography;

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: 'Chờ duyệt', color: 'gold' },
  approved: { text: 'Chờ bàn giao', color: 'blue' },
  active: { text: 'Đang mượn', color: 'cyan' },
  checked_out: { text: 'Đang mượn', color: 'cyan' },
  completed: { text: 'Đã trả', color: 'green' },
  overdue: { text: 'Quá hạn', color: 'magenta' },
};

/** Safely extract array from API response */
const extractArray = (res: any): any[] => {
  try {
    if (Array.isArray(res?.data)) return res.data;
    const data = res?.data?.data;
    if (Array.isArray(data)) return data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (data?.result && Array.isArray(data.result)) return data.result;
    return [];
  } catch {
    return [];
  }
};

const StorekeeperDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const [pendingHandovers, setPendingHandovers] = useState<any[]>([]);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [overdueItems, setOverdueItems] = useState<any[]>([]);
  const [maintenanceItems, setMaintenanceItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [txRes, eqRes] = await Promise.all([
        getTransactions(),
        getEquipment(),
      ]);

      const txData = extractArray(txRes);
      const eqData = extractArray(eqRes);

      setPendingHandovers(txData.filter((t: any) => t.status === 'approved'));
      setActiveLoans(txData.filter((t: any) => t.status === 'active' || t.status === 'checked_out'));
      setOverdueItems(txData.filter((t: any) => t.status === 'overdue'));
      setMaintenanceItems(eqData.filter((e: any) => e.status === 'maintenance'));
    } catch (err) {
      console.error('Error loading storekeeper dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const safeHandovers = Array.isArray(pendingHandovers) ? pendingHandovers : [];
  const safeActiveLoans = Array.isArray(activeLoans) ? activeLoans : [];
  const safeOverdue = Array.isArray(overdueItems) ? overdueItems : [];
  const safeMaintenance = Array.isArray(maintenanceItems) ? maintenanceItems : [];

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <Spin size="large" tip="Đang tải dữ liệu..." />
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      {/* Welcome Banner */}
      <Card
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, #C00C0C 0%, #800808 100%)',
          border: 'none',
          borderRadius: 12,
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Row align="middle" gutter={16}>
          <Col>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <ToolOutlined style={{ fontSize: 24, color: '#fff' }} />
            </div>
          </Col>
          <Col flex="auto">
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              Xin chào, {user?.full_name || 'Quản lý kho'}!
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
              Quản lý bàn giao, kiểm kê thiết bị và theo dõi kho hàng.
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: 10 }}>
            <Statistic
              title="Chờ bàn giao"
              value={safeHandovers.length}
              prefix={<InboxOutlined style={{ color: '#C00C0C' }} />}
              valueStyle={{ color: '#C00C0C' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: 10 }}>
            <Statistic
              title="Đang cho mượn"
              value={safeActiveLoans.length}
              prefix={<SwapOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: 10 }}>
            <Statistic
              title="Quá hạn trả"
              value={safeOverdue.length}
              prefix={<ClockCircleOutlined style={{ color: '#C00C0C' }} />}
              valueStyle={{ color: safeOverdue.length > 0 ? '#C00C0C' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: 10 }}>
            <Statistic
              title="Đang bảo trì"
              value={safeMaintenance.length}
              prefix={<ToolOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Action Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        {/* Pending Handovers */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <InboxOutlined style={{ color: '#C00C0C' }} />
                <span>Đơn chờ bàn giao</span>
                <Tag color="error">{safeHandovers.length}</Tag>
              </Space>
            }
            extra={
              <Button type="link" size="small" onClick={() => history.push('/booking/handle')}>
                <ScanOutlined /> Bàn giao
              </Button>
            }
            style={{ borderRadius: 10 }}
            bodyStyle={{ maxHeight: 360, overflow: 'auto' }}
          >
            {safeHandovers.length > 0 ? (
              <List
                size="small"
                dataSource={safeHandovers.slice(0, 8)}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text strong>{item.equipment?.name || 'N/A'}</Text>}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">SN: {item.equipment?.serial_number || '—'}</Text>
                          <Text type="secondary">Người mượn: {item.borrower?.full_name || '—'}</Text>
                        </Space>
                      }
                    />
                    <Tag color={statusMap[item.status]?.color || 'default'}>
                      {statusMap[item.status]?.text || item.status}
                    </Tag>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có đơn chờ bàn giao" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        {/* Overdue Items */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#C00C0C' }} />
                <span>Thiết bị quá hạn</span>
                {safeOverdue.length > 0 && <Tag color="red">{safeOverdue.length}</Tag>}
              </Space>
            }
            extra={
              <Button type="link" size="small" onClick={() => history.push('/booking/list')}>
                Xem tất cả
              </Button>
            }
            style={{ borderRadius: 10 }}
            bodyStyle={{ maxHeight: 360, overflow: 'auto' }}
          >
            {safeOverdue.length > 0 ? (
              <List
                size="small"
                dataSource={safeOverdue.slice(0, 8)}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text strong type="danger">{item.equipment?.name || 'N/A'}</Text>}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">Người mượn: {item.borrower?.full_name || '—'}</Text>
                          <Text type="danger" style={{ fontSize: 12 }}>
                            Hạn trả: {item.due_date ? new Date(item.due_date).toLocaleDateString('vi-VN') : '—'}
                          </Text>
                        </Space>
                      }
                    />
                    <Tag color="magenta">Quá hạn</Tag>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có thiết bị quá hạn" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{ textAlign: 'center', cursor: 'pointer', borderRadius: 10 }}
            onClick={() => history.push('/booking/handle')}
          >
            <ScanOutlined style={{ fontSize: 32, color: '#C00C0C', marginBottom: 8 }} />
            <div><Text strong>Bàn giao / Thu hồi</Text></div>
            <Text type="secondary" style={{ fontSize: 12 }}>Check-in / Check-out thiết bị</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{ textAlign: 'center', cursor: 'pointer', borderRadius: 10 }}
            onClick={() => history.push('/asset/equipment')}
          >
            <ToolOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <div><Text strong>Kiểm kê thiết bị</Text></div>
            <Text type="secondary" style={{ fontSize: 12 }}>Xem danh sách và trạng thái kho</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{ textAlign: 'center', cursor: 'pointer', borderRadius: 10 }}
            onClick={() => history.push('/booking/list')}
          >
            <CheckCircleOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <div><Text strong>Danh sách đơn mượn</Text></div>
            <Text type="secondary" style={{ fontSize: 12 }}>Theo dõi tất cả giao dịch</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StorekeeperDashboard;
