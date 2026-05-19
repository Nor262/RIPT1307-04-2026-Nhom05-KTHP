import React, { useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Tag, Modal, Space, Input, Typography, Descriptions, Timeline, Badge, Tooltip } from 'antd';
import type { FormInstance } from 'antd';
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
  rating?: number;
  feedback?: string;
};

const statusMap: Record<string, { text: string; color: string; bg: string; border: string }> = {
  pending: { text: 'Chờ duyệt', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  approved: { text: 'Đã duyệt', color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe' },
  rejected: { text: 'Từ chối', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  checked_out: { text: 'Đang mượn', color: '#0891b2', bg: '#cffafe', border: '#a5f3fc' },
  completed: { text: 'Đã trả', color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
  overdue: { text: 'Quá hạn', color: '#c026d3', bg: '#fae8ff', border: '#f5d0fe' },
};

const BookingApproval: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const searchTimeoutRef = useRef<any>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<TransactionItem | undefined>();
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

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
        const s = statusMap[record.status] || { text: record.status, color: '#4b5563', bg: '#f3f4f6', border: '#e5e7eb' };
        return (
          <span style={{ 
            padding: '4px 12px', 
            borderRadius: '999px', 
            backgroundColor: s.bg, 
            color: s.color, 
            border: `1px solid ${s.border}`,
            fontWeight: 500,
            fontSize: '13px',
            whiteSpace: 'nowrap'
          }}>
            {s.text}
          </span>
        );
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
        return (
          <Space size="middle">
            <Tooltip title="Chi tiết">
              <Button type="text" shape="circle" icon={<EyeOutlined />} onClick={() => { setCurrentRow(record); setDetailVisible(true); }} style={{ background: '#f3f4f6' }} />
            </Tooltip>
            {record.status === 'pending' && (
              <>
                <Tooltip title="Phê duyệt">
                  <Button type="text" shape="circle" icon={<CheckCircleOutlined style={{ color: '#10b981' }} />} onClick={() => handleApprove(record)} style={{ background: '#ecfdf5' }} />
                </Tooltip>
                <Tooltip title="Từ chối">
                  <Button type="text" danger shape="circle" icon={<CloseCircleOutlined />} onClick={() => { setCurrentRow(record); setRejectReason(''); setRejectVisible(true); }} style={{ background: '#fef2f2' }} />
                </Tooltip>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <ProTable<TransactionItem>
        headerTitle="Danh sách Đơn mượn thiết bị"
        actionRef={actionRef}
        formRef={formRef}
        form={{
          onValuesChange: (changedValues) => {
            if (changedValues.status !== undefined) {
              setActiveTab(changedValues.status || 'all');
            }
            if (searchTimeoutRef.current) {
              clearTimeout(searchTimeoutRef.current);
            }
            searchTimeoutRef.current = setTimeout(() => {
              formRef.current?.submit();
            }, 100);
          },
        }}
        rowKey="id"
        search={{
          labelWidth: 120,
          collapseRender: (collapsed, showCollapseButton) => {
            if (!showCollapseButton) return null;
            return (
              <span style={{ color: '#c00c0c', cursor: 'pointer' }}>
                {collapsed ? (
                  <>Mở rộng <PlusOutlined style={{ fontSize: 12 }} /></>
                ) : (
                  <>Thu gọn <PlusOutlined style={{ transform: 'rotate(45deg)', fontSize: 12 }} /></>
                )}
              </span>
            );
          },
          optionRender: (searchConfig, formProps, dom) => [
            <Button
              key="reset"
              onClick={() => {
                formProps.form?.resetFields();
                setActiveTab('all');
                formProps.form?.submit();
              }}
              style={{ color: '#c00c0c', borderColor: '#c00c0c' }}
            >
              Làm lại
            </Button>,
            <Button
              key="search"
              type="primary"
              onClick={() => formProps.form?.submit()}
              style={{ backgroundColor: '#c00c0c', borderColor: '#c00c0c', color: '#fff' }}
            >
              Tìm ngay
            </Button>,
          ],
        }}
        request={async (params, sorter) => {
          const res = await getTransactions({ ...params, sorter });
          const data = res.data?.data;
          const list = data?.items || data?.result || data || [];

          const filteredList = list.filter((item: TransactionItem) => {
            // Extract search terms safely from all possible naming conventions
            const searchEquip = 
              typeof params.equipment === 'string' ? params.equipment :
              (params.equipment as any)?.name || 
              (params as any)['equipment.name'] || 
              (params as any)['equipment,name'] ||
              '';

            const searchBorrower = 
              typeof params.borrower === 'string' ? params.borrower :
              (params.borrower as any)?.full_name || 
              (params as any)['borrower.full_name'] || 
              (params as any)['borrower,full_name'] ||
              '';

            if (searchEquip) {
              const itemEquipName = item.equipment?.name?.toLowerCase();
              if (!itemEquipName?.includes(searchEquip.toLowerCase())) {
                return false;
              }
            }

            if (searchBorrower) {
              const itemBorrName = item.borrower?.full_name?.toLowerCase();
              if (!itemBorrName?.includes(searchBorrower.toLowerCase())) {
                return false;
              }
            }

            // Status filter logic (use activeTab first, fallback to form field status)
            const statusFilter = activeTab !== 'all' ? activeTab : params.status;
            if (statusFilter && statusFilter !== 'all' && item.status !== statusFilter) {
              return false;
            }

            return true;
          });

          return {
            data: filteredList,
            success: true,
            total: filteredList.length,
          };
        }}
        columns={columns}
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeTab,
            items: [
              { key: 'all', label: 'Tất cả' },
              { key: 'pending', label: <Badge count="!" size="small" offset={[8, 0]}>Chờ duyệt</Badge> },
              { key: 'approved', label: 'Đã duyệt' },
              { key: 'checked_out', label: 'Đang mượn' },
              { key: 'completed', label: 'Đã trả' },
              { key: 'overdue', label: <Text type="danger">Quá hạn</Text> },
            ],
            onChange: (key) => {
              setActiveTab(key as string);
              formRef.current?.setFieldsValue({ status: key === 'all' ? undefined : key });
              actionRef.current?.reload();
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
            {currentRow.rating && (
              <Descriptions.Item label="Đánh giá">
                <Text type="warning" strong>{currentRow.rating} / 5 ⭐</Text>
              </Descriptions.Item>
            )}
            {currentRow.feedback && <Descriptions.Item label="Phản hồi">{currentRow.feedback}</Descriptions.Item>}
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
