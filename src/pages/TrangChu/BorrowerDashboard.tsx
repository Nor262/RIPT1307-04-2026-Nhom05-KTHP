import React from 'react';
import { useRequest } from '@umijs/max';
import { Row, Col, Card, Spin, Tag, Typography, List, Result } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SwapOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { getMyTransactions } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';

const { Text, Title } = Typography;

const statusConfig: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
  pending: { text: 'Chờ duyệt', color: '#faad14', icon: <ClockCircleOutlined /> },
  approved: { text: 'Đã duyệt', color: '#1890ff', icon: <CheckCircleOutlined /> },
  rejected: { text: 'Từ chối', color: '#ff4d4f', icon: <ExclamationCircleOutlined /> },
  checked_out: { text: 'Đang mượn', color: '#13c2c2', icon: <SwapOutlined /> },
  completed: { text: 'Đã trả', color: '#52c41a', icon: <CheckCircleOutlined /> },
  overdue: { text: 'Quá hạn', color: '#ff4d4f', icon: <ExclamationCircleOutlined /> },
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

const BorrowerDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const { data: transactions = [], loading } = useRequest(
    async () => {
      try {
        const res = await getMyTransactions();
        return extractArray(res);
      } catch { return []; }
    },
    { pollingInterval: 20000 }
  );

  const allItems = Array.isArray(transactions) ? transactions : [];
  const pendingCount = allItems.filter((t: any) => t.status === 'pending').length;
  const activeCount = allItems.filter((t: any) => ['approved', 'checked_out'].includes(t.status)).length;
  const overdueCount = allItems.filter((t: any) => t.status === 'overdue').length;
  const completedCount = allItems.filter((t: any) => t.status === 'completed').length;

  // Active + overdue items (priority list)
  const currentItems = allItems.filter((t: any) =>
    ['pending', 'approved', 'checked_out', 'overdue'].includes(t.status)
  );

  // Recent completed
  const recentItems = allItems
    .filter((t: any) => ['completed', 'rejected'].includes(t.status))
    .slice(0, 5);

  if (loading && allItems.length === 0) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <Spin size="large" />
    </div>
  );

  // Stat card component
  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <Card
      bodyStyle={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
      style={{ borderRadius: 12, borderLeft: `4px solid ${color}` }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        background: `${color}15`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 20, color,
      }}>
        {icon}
      </div>
      <div>
        <Text type="secondary" style={{ fontSize: 12 }}>{title}</Text>
        <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '24px', maxWidth: 960, margin: '0 auto' }}>
      {/* Welcome */}
      <Card
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: 14,
        }}
        bodyStyle={{ padding: '24px 28px' }}
      >
        <Row align="middle" gutter={16}>
          <Col>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <UserOutlined style={{ fontSize: 26, color: '#fff' }} />
            </div>
          </Col>
          <Col flex="auto">
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              Xin chào, {user?.full_name || 'Bạn'}!
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
              Theo dõi các đơn mượn thiết bị của bạn tại đây.
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Stats Grid */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <StatCard title="Chờ duyệt" value={pendingCount} icon={<ClockCircleOutlined />} color="#faad14" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Đang mượn" value={activeCount} icon={<SwapOutlined />} color="#1890ff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Quá hạn" value={overdueCount} icon={<ExclamationCircleOutlined />} color="#ff4d4f" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Hoàn tất" value={completedCount} icon={<CheckCircleOutlined />} color="#52c41a" />
        </Col>
      </Row>

      {/* Current Loans */}
      <Card
        title={
          <span style={{ fontSize: 15 }}>
            <SwapOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Đơn mượn hiện tại
            {currentItems.length > 0 && (
              <Tag color="blue" style={{ marginLeft: 8 }}>{currentItems.length}</Tag>
            )}
          </span>
        }
        style={{ borderRadius: 12, marginBottom: 16 }}
        bodyStyle={{ padding: currentItems.length > 0 ? '0' : '24px' }}
      >
        {currentItems.length > 0 ? (
          <List
            dataSource={currentItems}
            renderItem={(item: any) => {
              const cfg = statusConfig[item.status] || { text: item.status, color: '#999', icon: null };
              const isOverdue = item.status === 'overdue' || (
                item.due_date && new Date(item.due_date) < new Date() &&
                !['completed', 'rejected'].includes(item.status)
              );
              return (
                <List.Item style={{ padding: '14px 20px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {item.equipment?.name || 'Thiết bị'}
                      </Text>
                      <Tag
                        color={cfg.color}
                        icon={cfg.icon}
                        style={{ borderRadius: 10, fontSize: 11, lineHeight: '18px' }}
                      >
                        {cfg.text}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        SN: {item.equipment?.serial_number || '—'}
                      </Text>
                      <Text type={isOverdue ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        Hạn trả: {item.due_date ? new Date(item.due_date).toLocaleDateString('vi-VN') : '—'}
                        {isOverdue && ' ⚠ Quá hạn'}
                      </Text>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Không có đơn mượn đang hoạt động"
            subTitle="Bạn hiện không giữ thiết bị nào."
            style={{ padding: '24px 0' }}
          />
        )}
      </Card>

      {/* Recent History */}
      {recentItems.length > 0 && (
        <Card
          title={
            <span style={{ fontSize: 15 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              Lịch sử gần đây
            </span>
          }
          style={{ borderRadius: 12 }}
          bodyStyle={{ padding: 0 }}
        >
          <List
            dataSource={recentItems}
            renderItem={(item: any) => {
              const isCompleted = item.status === 'completed';
              return (
                <List.Item style={{ padding: '12px 20px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 13 }}>{item.equipment?.name || 'Thiết bị'}</Text>
                      <Tag
                        color={isCompleted ? 'green' : 'red'}
                        style={{ borderRadius: 10, fontSize: 11 }}
                      >
                        {isCompleted ? 'Đã trả' : 'Bị từ chối'}
                      </Tag>
                    </div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(item.actual_check_in || item.approval_date || item.request_date).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                    </Text>
                  </div>
                </List.Item>
              );
            }}
          />
        </Card>
      )}
    </div>
  );
};

export default BorrowerDashboard;
