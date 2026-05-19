import React, { useRef } from 'react';
import { Tag, Typography, Space, Button, message } from 'antd';
import { WarningOutlined, BellOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { getOverdueTransactions } from '@/services/api';

const { Text } = Typography;

type OverdueItem = {
  id: number;
  equipment: { id: number; name: string; serial_number: string };
  borrower: { id: number; full_name: string; email: string };
  due_date: string;
  request_date: string;
  actual_check_out?: string;
  notes?: string;
};

const OverdueReport: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const calcOverdueDays = (dueDate: string) => {
    const diff = new Date().getTime() - new Date(dueDate).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const columns: ProColumns<OverdueItem>[] = [
    {
      title: 'STT',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: 'Thiết bị',
      dataIndex: ['equipment', 'name'],
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.equipment?.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>SN: {record.equipment?.serial_number}</Text>
        </Space>
      ),
    },
    {
      title: 'Người mượn',
      dataIndex: ['borrower', 'full_name'],
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.borrower?.full_name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.borrower?.email}</Text>
        </Space>
      ),
    },
    {
      title: 'Hạn trả',
      dataIndex: 'due_date',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (_, record) => (
        <Text type="danger" strong>
          {new Date(record.due_date).toLocaleDateString('vi-VN')}
        </Text>
      ),
    },
    {
      title: 'Số ngày quá hạn',
      hideInSearch: true,
      render: (_, record) => {
        const days = calcOverdueDays(record.due_date);
        let color = 'orange';
        if (days > 7) color = 'red';
        if (days > 14) color = 'magenta';
        return (
          <Tag color={color} icon={<WarningOutlined />}>
            {days} ngày
          </Tag>
        );
      },
      sorter: (a, b) => calcOverdueDays(a.due_date) - calcOverdueDays(b.due_date),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="remind"
          type="link"
          icon={<BellOutlined />}
          onClick={() => {
            message.info(`Đã gửi nhắc nhở đến ${record.borrower?.full_name}`);
          }}
        >
          Nhắc nhở
        </Button>,
      ],
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <ProTable<OverdueItem>
        headerTitle={
          <Space>
            <WarningOutlined style={{ color: '#c00c0c', fontSize: 20 }} />
            <span>Báo cáo Thiết bị quá hạn</span>
          </Space>
        }
        actionRef={actionRef}
        rowKey="id"
        search={false}
        request={async (params) => {
          const res = await getOverdueTransactions(params);
          const data = res.data?.data;
          return {
            data: data?.items || data?.result || data || [],
            success: true,
            total: data?.meta?.totalItems || data?.total || 0,
          };
        }}
        columns={columns}
        rowClassName={(record) => {
          const days = calcOverdueDays(record.due_date);
          if (days > 14) return 'row-critical';
          if (days > 7) return 'row-warning';
          return '';
        }}
      />
      <style>{`
        .row-critical { background-color: #fff1f0 !important; }
        .row-warning { background-color: #fffbe6 !important; }
      `}</style>
    </div>
  );
};

export default OverdueReport;
