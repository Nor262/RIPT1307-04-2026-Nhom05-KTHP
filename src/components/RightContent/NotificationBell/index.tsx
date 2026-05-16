import React, { useState } from 'react';
import { useRequest } from '@umijs/max';
import { Badge, Tooltip, Popover, List, Typography, Button, Empty, Spin, Tag } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import axios from '@/utils/axios';
import styles from '../index.less';

const { Text } = Typography;

const typeColorMap: Record<string, string> = {
  borrow: 'blue',
  return: 'green',
  overdue: 'red',
  reminder: 'orange',
  system: 'default',
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
    <div style={{ width: 360, maxHeight: 420, overflow: 'auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
        position: 'sticky', top: 0, background: '#fff', zIndex: 1
      }}>
        <Text strong style={{ fontSize: 14 }}>
          Thông báo {unreadCount > 0 && <Tag color="red" style={{ marginLeft: 4 }}>{unreadCount}</Tag>}
        </Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllRead} icon={<CheckOutlined />}>
            Đọc tất cả
          </Button>
        )}
      </div>

      {/* List */}
      {loading && notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin size="small" />
        </div>
      ) : notifications.length > 0 ? (
        <List
          size="small"
          dataSource={notifications.slice(0, 20)}
          renderItem={(item: any) => (
            <List.Item
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: item.is_read ? 'transparent' : '#f0f7ff',
                borderLeft: item.is_read ? '3px solid transparent' : '3px solid #1890ff',
                transition: 'background 0.2s',
              }}
              onClick={() => {
                if (!item.is_read) handleMarkOneRead(item.id);
              }}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Text strong={!item.is_read} style={{ fontSize: 13, flex: 1, paddingRight: 8 }}>
                      {item.title}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                      {new Date(item.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </Text>
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                      {item.message}
                    </Text>
                    <Tag color={typeColorMap[item.type] || 'default'} style={{ fontSize: 10, borderRadius: 4 }}>
                      {typeLabelMap[item.type] || item.type}
                    </Tag>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description="Không có thông báo"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '32px 0' }}
        />
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
      overlayInnerStyle={{ padding: 0 }}
    >
      <Tooltip title="Thông báo" placement="bottom">
        <span className={styles.action} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', height: '100%', padding: '0 12px' }}>
          <Badge count={unreadCount} size="small" offset={[2, -2]}>
            <BellOutlined style={{ fontSize: 18 }} />
          </Badge>
        </span>
      </Tooltip>
    </Popover>
  );
};

export default NotificationBell;
