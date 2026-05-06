import React, { useRef, useState } from 'react';
import { Button, message, Tag, Modal, Space, Input, Typography, Descriptions, Timeline, Badge } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { getTransactions, reviewTransaction } from '@/services/api';

const { TextArea } = Input;
const { Text } = Typography;

type TransactionItem = {
  id: number;
  equipment: { id: number; name: string; serial_number: string };
  borrower: { id: number; full_name: string; email: string };
  approver?: { id: number; full_name: string };
  storekeeper?: { id: number; full_name: string };
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'overdue' | 'checked_out';
  request_date: string;
  approval_date?: string;
  due_date: string;
  actual_check_out?: string;
  actual_check_in?: string;
  notes?: string;
};

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: 'Chờ duyệt', color: 'gold' },
  approved: { text: 'Đã duyệt', color: 'blue' },
  rejected: { text: 'Từ chối', color: 'red' },
  checked_out: { text: 'Đang mượn', color: 'cyan' },
  completed: { text: 'Đã trả', color: 'green' },
  overdue: { text: 'Quá hạn', color: 'magenta' },
};

const BookingApproval: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<TransactionItem | undefined>();
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async (record: TransactionItem) => {
    Modal.confirm({
      title: 'Xác nhận phê duyệt',
      content: `Duyệt đơn mượn "${record.equipment?.name}" cho "${record.borrower?.full_name}"?`,
      okText: 'Phê duyệt',
      okType: 'primary',
      onOk: async () => {
        await reviewTransaction(record.id, { action: 'approve' });
        message.success('Đã phê duyệt yêu cầu mượn');
        actionRef.current?.reload();
      },
    });
  };

  const handleReject = async () => {
    if (!currentRow) return;
    if (!rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối');
      return;
    }
    await reviewTransaction(currentRow.id, { action: 'reject', reason: rejectReason });
    message.success('Đã từ chối yêu cầu');
    setRejectVisible(false);
    setRejectReason('');
    actionRef.current?.reload();
  };

  const columns: ProColumns<TransactionItem>[] = [
    {
      title: 'STT',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: 'Thiết bị',
      dataIndex: ['equipment', 'name'],
      ellipsis: true,
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
      ellipsis: true,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.borrower?.full_name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.borrower?.email}</Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: Object.fromEntries(
        Object.entries(statusMap).map(([k, v]) => [k, { text: v.text }])
      ),
      render: (_, record) => {
        const s = statusMap[record.status] || { text: record.status, color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: 'Ngày gửi đơn',
      dataIndex: 'request_date',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: 'Hạn trả',
      dataIndex: 'due_date',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (_, record) => {
        const isOverdue = new Date(record.due_date) < new Date() && !['completed', 'rejected'].includes(record.status);
        return (
          <Text type={isOverdue ? 'danger' : undefined} strong={isOverdue}>
            {new Date(record.due_date).toLocaleDateString('vi-VN')}
            {isOverdue && ' ⚠️'}
          </Text>
        );
      },
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 260,
      render: (_, record) => {
        const actions = [
          <a key="detail" onClick={() => { setCurrentRow(record); setDetailVisible(true); }}>
            <EyeOutlined /> Chi tiết
          </a>,
        ];
        if (record.status === 'pending') {
          actions.push(
            <a key="approve" style={{ color: '#52c41a' }} onClick={() => handleApprove(record)}>
              <CheckCircleOutlined /> Duyệt
            </a>,
            <a
              key="reject"
              style={{ color: '#ff4d4f' }}
              onClick={() => {
                setCurrentRow(record);
                setRejectReason('');
                setRejectVisible(true);
              }}
            >
              <CloseCircleOutlined /> Từ chối
            </a>,
          );
        }
        return actions;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <ProTable<TransactionItem>
        headerTitle="Danh sách Đơn mượn thiết bị"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 120 }}
        request={async (params, sorter) => {
          const res = await getTransactions({ ...params, sorter });
          const data = res.data?.data;
          return {
            data: data?.items || data?.result || data || [],
            success: true,
            total: data?.meta?.totalItems || data?.total || 0,
          };
        }}
        columns={columns}
        toolbar={{
          menu: {
            type: 'tab',
            items: [
              { key: 'all', label: 'Tất cả' },
              { key: 'pending', label: <Badge count="!" size="small" offset={[8, 0]}>Chờ duyệt</Badge> },
              { key: 'approved', label: 'Đã duyệt' },
              { key: 'checked_out', label: 'Đang mượn' },
              { key: 'completed', label: 'Đã trả' },
              { key: 'overdue', label: <Text type="danger">Quá hạn</Text> },
            ],
            onChange: (key) => {
              if (key === 'all') {
                actionRef.current?.setPageInfo?.({ current: 1 });
                actionRef.current?.reload();
              } else {
                // Filter by status tab
                actionRef.current?.reload();
              }
            },
          },
        }}
      />

      {/* Detail Modal */}
      <Modal
        title="Chi tiết Đơn mượn"
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={
          currentRow?.status === 'pending' ? [
            <Button key="reject" danger onClick={() => { setDetailVisible(false); setRejectVisible(true); }}>
              <CloseCircleOutlined /> Từ chối
            </Button>,
            <Button key="approve" type="primary" onClick={() => { setDetailVisible(false); handleApprove(currentRow); }}>
              <CheckCircleOutlined /> Phê duyệt
            </Button>,
          ] : null
        }
        width={640}
      >
        {currentRow && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Thiết bị">{currentRow.equipment?.name}</Descriptions.Item>
            <Descriptions.Item label="Serial Number">{currentRow.equipment?.serial_number}</Descriptions.Item>
            <Descriptions.Item label="Người mượn">{currentRow.borrower?.full_name} ({currentRow.borrower?.email})</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusMap[currentRow.status]?.color}>{statusMap[currentRow.status]?.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày gửi đơn">{new Date(currentRow.request_date).toLocaleString('vi-VN')}</Descriptions.Item>
            <Descriptions.Item label="Hạn trả">{new Date(currentRow.due_date).toLocaleString('vi-VN')}</Descriptions.Item>
            {currentRow.approval_date && (
              <Descriptions.Item label="Ngày duyệt">{new Date(currentRow.approval_date).toLocaleString('vi-VN')}</Descriptions.Item>
            )}
            {currentRow.actual_check_out && (
              <Descriptions.Item label="Check-out">{new Date(currentRow.actual_check_out).toLocaleString('vi-VN')}</Descriptions.Item>
            )}
            {currentRow.actual_check_in && (
              <Descriptions.Item label="Check-in">{new Date(currentRow.actual_check_in).toLocaleString('vi-VN')}</Descriptions.Item>
            )}
            {currentRow.notes && <Descriptions.Item label="Ghi chú">{currentRow.notes}</Descriptions.Item>}
            {currentRow.approver && <Descriptions.Item label="Người duyệt">{currentRow.approver.full_name}</Descriptions.Item>}
          </Descriptions>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={<><ExclamationCircleOutlined style={{ color: '#faad14' }} /> Từ chối yêu cầu mượn</>}
        visible={rejectVisible}
        onCancel={() => setRejectVisible(false)}
        onOk={handleReject}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true }}
      >
        <p>
          Từ chối đơn mượn <strong>{currentRow?.equipment?.name}</strong> của <strong>{currentRow?.borrower?.full_name}</strong>?
        </p>
        <TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối (bắt buộc)..."
        />
      </Modal>
    </div>
  );
};

export default BookingApproval;
