import React, { useRef, useState } from 'react';
import { Button, message, Tag, Space, Typography, DatePicker, Select } from 'antd';
import { DownloadOutlined, FileExcelOutlined, PlusOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { getTransactions } from '@/services/api';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;
const { Text } = Typography;

type TransactionExportItem = {
  id: number;
  equipment: { name: string; serial_number: string };
  borrower: { full_name: string; email: string };
  type: string;
  status: string;
  request_date: string;
  due_date: string;
  actual_check_out?: string;
  actual_check_in?: string;
  notes?: string;
};

const statusLabels: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  checked_out: 'Đang mượn',
  completed: 'Đã trả',
  overdue: 'Quá hạn',
};

const statusMap: Record<string, { text: string; color: string; bg: string; border: string }> = {
  pending: { text: 'Chờ duyệt', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  approved: { text: 'Đã duyệt', color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe' },
  rejected: { text: 'Từ chối', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  checked_out: { text: 'Đang mượn', color: '#0891b2', bg: '#cffafe', border: '#a5f3fc' },
  completed: { text: 'Đã trả', color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
  overdue: { text: 'Quá hạn', color: '#c026d3', bg: '#fae8ff', border: '#f5d0fe' },
};

const ExportReport: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await getTransactions({ limit: 9999 });
      const data = res.data?.data;
      const items: TransactionExportItem[] = data?.items || data?.result || data || [];

      if (items.length === 0) {
        message.warning('Không có dữ liệu để xuất');
        return;
      }

      const exportData = items.map((item, index) => ({
        'STT': index + 1,
        'Thiết bị': item.equipment?.name || '',
        'Số Sê-ri': item.equipment?.serial_number || '',
        'Người mượn': item.borrower?.full_name || '',
        'Email': item.borrower?.email || '',
        'Loại': item.type === 'borrow' ? 'Mượn' : 'Trả',
        'Trạng thái': statusLabels[item.status] || item.status,
        'Ngày gửi đơn': item.request_date ? new Date(item.request_date).toLocaleDateString('vi-VN') : '',
        'Hạn trả': item.due_date ? new Date(item.due_date).toLocaleDateString('vi-VN') : '',
        'Ngày bàn giao': item.actual_check_out ? new Date(item.actual_check_out).toLocaleDateString('vi-VN') : '',
        'Ngày trả thực tế': item.actual_check_in ? new Date(item.actual_check_in).toLocaleDateString('vi-VN') : '',
        'Ghi chú': item.notes || '',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Lịch sử mượn trả');

      // Auto-fit column widths
      const colWidths = Object.keys(exportData[0]).map((key) => ({
        wch: Math.max(key.length, ...exportData.map((row: any) => String(row[key]).length)) + 2,
      }));
      ws['!cols'] = colWidths;

      const fileName = `Bao_cao_muon_tra_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      message.success(`Đã xuất file: ${fileName}`);
    } catch (err) {
      message.error('Lỗi khi xuất báo cáo');
    } finally {
      setExporting(false);
    }
  };

  const columns: ProColumns<TransactionExportItem>[] = [
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
      title: 'Trạng thái',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: Object.fromEntries(
        Object.entries(statusLabels).map(([k, v]) => [k, { text: v }])
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
    },
    {
      title: 'Hạn trả',
      dataIndex: 'due_date',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: 'Check-out',
      dataIndex: 'actual_check_out',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: 'Check-in',
      dataIndex: 'actual_check_in',
      valueType: 'dateTime',
      hideInSearch: true,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <ProTable<TransactionExportItem>
        headerTitle="Lịch sử Mượn/Trả & Xuất Báo cáo"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120, collapseRender: (collapsed, showCollapseButton) => {
            if (!showCollapseButton) return null;
            return (
              <span style={{ color: '#ff4d4f', cursor: 'pointer' }}>
                {collapsed ? (
                  <>Mở rộng <PlusOutlined style={{ fontSize: 12 }} /></>
                ) : (
                  <>Thu gọn <PlusOutlined style={{ transform: 'rotate(45deg)', fontSize: 12 }} /></>
                )}
              </span>
            );
          },
          optionRender: (searchConfig, formProps, dom) => [
            dom[0],
            <Button
              key="search"
              type="primary"
              danger
              onClick={() => formProps.form?.submit()}
            >
              Tìm ngay
            </Button>,
          ],
        }}
        toolBarRender={() => [
          <Button
            key="export"
            danger
            type="primary"
            icon={<FileExcelOutlined />}
            loading={exporting}
            onClick={handleExport}
            style={{ backgroundColor: '#10b981', borderColor: '#10b981', borderRadius: '8px', fontWeight: 500, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
          >
            Xuất Excel
          </Button>,
        ]}
        request={async (params) => {
          const res = await getTransactions(params);
          const data = res.data?.data;
          return {
            data: data?.items || data?.result || data || [],
            success: true,
            total: data?.meta?.totalItems || data?.total || 0,
          };
        }}
        columns={columns}
      />
    </div>
  );
};

export default ExportReport;
