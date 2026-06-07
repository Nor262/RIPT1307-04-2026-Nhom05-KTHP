import React, { useState } from 'react';
import { useRequest } from '@umijs/max';
import { Badge, Tooltip, Popover, List, Typography, Button, Spin, Tag } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import axios from '@/utils/axios';
import styles from '../index.less';

const { Text } = Typography;

const typeStyleMap: Record<string, { bg: string; color: string; border: string }> = {
  borrow: { bg: 'rgba(192, 12, 12, 0.06)', color: '#C00C0C', border: 'rgba(192, 12, 12, 0.15)' },
  return: { bg: 'rgba(192, 12, 12, 0.04)', color: '#C00C0C', border: 'rgba(192, 12, 12, 0.1)' },
  overdue: { bg: 'rgba(192, 12, 12, 0.08)', color: '#C00C0C', border: 'rgba(192, 12, 12, 0.2)' },
  reminder: { bg: 'rgba(192, 12, 12, 0.06)', color: '#C00C0C', border: 'rgba(192, 12, 12, 0.15)' },
  system: { bg: 'rgba(107, 107, 96, 0.06)', color: '#6B6B6B', border: 'rgba(107, 107, 96, 0.15)' },
};

const typeLabelMap: Record<string, string> = {
  borrow: 'Mượn',
  return: 'Trả',
  overdue: 'Quá hạn',
  reminder: 'Nhắc nhở',
  system: 'Hệ thống',
};

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);

  // Fetch unread count
  const { data: unreadData, refresh: refreshCount } = useRequest(
    async () => {
      try {
        const res = await axios.get('/notifications/unread-count');
        return res.data?.data || { count: 0 };
      } catch { return { count: 0 }; }
    },
    {}
  );

  const unreadCount = unreadData?.count || 0;

  // Fetch notifications list
  const { data: notifications = [], loading, refresh: refreshList } = useRequest(
    async () => {
      try {
        const res = await axios.get('/notifications');
        return res.data?.data || [];
      } catch { return []; }
    },
    {}
  );

  const handleMarkAllRead = async () => {
    try {
      await axios.patch('/notifications/read-all');
      refreshCount();
      refreshList();
    } catch { /* ignore */ }
  };

  const handleMarkOneRead = async (id: number) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      refreshCount();
      refreshList();
    } catch { /* ignore */ }
  };

  const content = (
    <div style={{ width: 380, maxHeight: 460, overflowY: 'auto', backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px', borderBottom: '1px solid #E8E4DF',
        position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 1,
        borderRadius: '8px 8px 0 0'
      }}>
        <Text strong style={{ fontSize: 15, fontFamily: 'Playfair Display, Georgia, serif', color: '#1A1A1A' }}>
          Thông báo {unreadCount > 0 && (
            <span style={{ 
              marginLeft: 6, 
              backgroundColor: '#C00C0C', 
              color: '#fff', 
              fontSize: 11, 
              padding: '2px 8px', 
              borderRadius: 10,
              fontWeight: 600,
              display: 'inline-block',
              lineHeight: 1.3
            }}>
              {unreadCount}
            </span>
          )}
        </Text>
        {unreadCount > 0 && (
          <Button 
            type="link" 
            size="small" 
            onClick={handleMarkAllRead} 
            icon={<CheckOutlined />}
            style={{ color: '#C00C0C', fontWeight: 600 }}
          >
            Đọc tất cả
          </Button>
        )}
      </div>

      {/* List */}
      {loading && notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Spin size="small" />
        </div>
      ) : notifications.length > 0 ? (
        <List
          size="small"
          dataSource={notifications.slice(0, 20)}
          renderItem={(item: any) => {
            const tagStyle = typeStyleMap[item.type] || typeStyleMap.system;
            return (
              <List.Item
                style={{
                  padding: '14px 18px',
                  cursor: 'pointer',
                  background: item.is_read ? '#FFFFFF' : '#FEFEFA',
                  borderLeft: item.is_read ? '4px solid transparent' : '4px solid #C00C0C',
                  borderBottom: '1px solid #E8E4DF',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = item.is_read ? '#FAFAF8' : 'rgba(192, 12, 12, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = item.is_read ? '#FFFFFF' : '#FEFEFA';
                }}
                onClick={() => {
                  if (!item.is_read) handleMarkOneRead(item.id);
                }}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Text strong={!item.is_read} style={{ fontSize: 13, flex: 1, paddingRight: 8, color: '#1A1A1A' }}>
                        {item.title}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap', color: '#6B6B6B' }}>
                        {new Date(item.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </Text>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6, color: '#6B6B6B' }}>
                        {item.message}
                      </Text>
                      <Tag style={{ 
                        fontSize: 10, 
                        borderRadius: 4, 
                        backgroundColor: tagStyle.bg, 
                        color: tagStyle.color, 
                        borderColor: tagStyle.border,
                        fontWeight: 600,
                        padding: '1px 6px'
                      }}>
                        {typeLabelMap[item.type] || item.type}
                      </Tag>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          textAlign: 'center',
          background: '#FFFFFF',
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '6px',
            background: 'rgba(192, 12, 12, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            border: '1px dashed rgba(192, 12, 12, 0.2)',
          }}>
            <BellOutlined style={{ fontSize: 36, color: '#C00C0C', opacity: 0.8 }} />
          </div>
          <Text strong style={{ fontSize: 16, color: '#1A1A1A', display: 'block', marginBottom: 4, fontFamily: 'Playfair Display, Georgia, serif' }}>
            Không có thông báo
          </Text>
          <Text type="secondary" style={{ fontSize: 13, color: '#6B6B6B', maxWidth: 240, lineHeight: 1.4 }}>
            Hộp thư của bạn hiện tại đang trống. Chúng tôi sẽ cập nhật khi có thông tin mới.
          </Text>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
      overlayInnerStyle={{ padding: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid #E8E4DF' }}
    >
      <div style={{ display: 'inline-flex', height: '100%', alignItems: 'center' }}>
        <Tooltip title="Thông báo" placement="bottom">
          <span className={styles.action} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', height: '100%', padding: '0 12px' }}>
            <Badge count={unreadCount} size="small" offset={[2, -2]}>
              <BellOutlined style={{ fontSize: 18 }} />
            </Badge>
          </span>
        </Tooltip>
      </div>
    </Popover>
  );
};

export default NotificationBell;
