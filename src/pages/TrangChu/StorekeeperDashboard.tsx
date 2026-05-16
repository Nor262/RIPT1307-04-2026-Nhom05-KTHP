import React from 'react';
import { useRequest, history } from '@umijs/max';
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
  checked_out: { text: 'Đang mượn', color: 'cyan' },
  completed: { text: 'Đã trả', color: 'green' },
  overdue: { text: 'Quá hạn', color: 'magenta' },
};

/** Safely extract array from API response */
const extractArray = (res: any): any[] => {
  try {
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

  // Fetch pending handover transactions (approved, waiting for checkout)
  const { data: pendingHandovers = [], loading: loadingHandovers } = useRequest(
    async () => {
      try {
        const res = await getTransactions({ status: 'approved' });
        return extractArray(res);
      } catch { return []; }
    },
    {}
  );

  // Fetch active loans (checked out)
  const { data: activeLoans = [], loading: loadingLoans } = useRequest(
    async () => {
      try {
        const res = await getTransactions({ status: 'checked_out' });
        return extractArray(res);
      } catch { return []; }
    },
    {}
  );

  // Fetch overdue
  const { data: overdueItems = [] } = useRequest(
    async () => {
      try {
        const res = await getTransactions({ status: 'overdue' });
        return extractArray(res);
      } catch { return []; }
    },
    {}
  );

  // Fetch equipment needing maintenance
  const { data: maintenanceItems = [] } = useRequest(
    async () => {
      try {
        const res = await getEquipment({ status: 'maintenance' });
        return extractArray(res);
      } catch { return []; }
    },
  );

  const isLoading = loadingHandovers && loadingLoans;
  const safeHandovers = Array.isArray(pendingHandovers) ? pendingHandovers : [];
  const safeActiveLoans = Array.isArray(activeLoans) ? activeLoans : [];
  const safeOverdue = Array.isArray(overdueItems) ? overdueItems : [];
  const safeMaintenance = Array.isArray(maintenanceItems) ? maintenanceItems : [];

  if (isLoading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      {/* Welcome Banner */}
      <Card
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
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
              prefix={<InboxOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
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
              prefix={<ClockCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: safeOverdue.length > 0 ? '#ff4d4f' : undefined }}
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
                <InboxOutlined style={{ color: '#1890ff' }} />
                <span>Đơn chờ bàn giao</span>
                <Tag color="blue">{safeHandovers.length}</Tag>
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
                <ClockCircleOutlined style={{ color: '#ff4d4f' }} />
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
            <ScanOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
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
