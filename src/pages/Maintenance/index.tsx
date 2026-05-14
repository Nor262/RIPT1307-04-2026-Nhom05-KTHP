import React, { useRef, useState } from 'react';
import { Button, message, Tag, Space, Typography, Card, Statistic, Row, Col, Tooltip } from 'antd';
import { PlusOutlined, CheckCircleOutlined, HistoryOutlined, ToolOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormSelect, ProFormDatePicker, ProFormTextArea, ProFormDigit } from '@ant-design/pro-components';
import { getMaintenance, createMaintenance, completeMaintenance, getEquipment } from '@/services/api';

const { Title } = Typography;

export type MaintenanceItem = {
  id: number;
  equipment?: { id: number; name: string; serial_number: string };
  maintenance_date: string;
  performed_by: string;
  details: string;
  cost: number;
  next_maintenance_date?: string;
  status: 'pending' | 'completed';
};

const statusMap: Record<string, { text: string; color: string; bg: string; border: string }> = {
  pending: { text: 'Đang bảo trì', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  completed: { text: 'Đã hoàn thành', color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
};

const MaintenanceList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  const columns: ProColumns<MaintenanceItem>[] = [
    {
      title: 'Thiết bị',
      dataIndex: ['equipment', 'name'],
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 'bold' }}>{record.equipment?.name}</span>
          <span style={{ fontSize: '12px', color: '#888' }}>SN: {record.equipment?.serial_number}</span>
        </Space>
      ),
    },
    {
      title: 'Ngày thực hiện',
      dataIndex: 'maintenance_date',
      valueType: 'date',
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'performed_by',
    },
    {
      title: 'Nội dung',
      dataIndex: 'details',
      ellipsis: true,
    },
    {
      title: 'Chi phí',
      dataIndex: 'cost',
      valueType: 'money',
      render: (val) => `${Number(val).toLocaleString()} VNĐ`,
    },
    {
      title: 'Hẹn ngày tới',
      dataIndex: 'next_maintenance_date',
      valueType: 'date',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
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
      title: 'Thao tác',
      dataIndex: 'option',
      valueType: 'option',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <Tooltip title="Hoàn tất bảo trì">
              <Button
                type="text"
                shape="circle"
                icon={<CheckCircleOutlined style={{ color: '#10b981' }} />}
                onClick={async () => {
                  if (record.equipment?.id) {
                    await completeMaintenance(record.equipment.id);
                    message.success('Đã hoàn tất bảo trì, thiết bị đã sẵn sàng');
                    actionRef.current?.reload();
                  }
                }}
                style={{ background: '#ecfdf5' }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card bordered={false} className="stat-card-premium" bodyStyle={{ padding: '24px' }}>
            <Statistic 
              title="Đang bảo trì" 
              value={3} 
              prefix={<div style={{ padding: '12px', borderRadius: '12px', background: '#fffbeb', display: 'flex', marginRight: 12 }}><ToolOutlined style={{ color: '#f59e0b' }} /></div>} 
              valueStyle={{ color: '#f59e0b' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false} className="stat-card-premium" bodyStyle={{ padding: '24px' }}>
            <Statistic 
              title="Tổng chi phí tháng này" 
              value={1500000} 
              suffix="VNĐ" 
              prefix={<div style={{ padding: '12px', borderRadius: '12px', background: '#eff6ff', display: 'flex', marginRight: 12 }}><HistoryOutlined style={{ color: '#3b82f6' }} /></div>} 
            />
          </Card>
        </Col>
      </Row>

      <ProTable<MaintenanceItem>
        headerTitle="Nhật ký bảo trì thiết bị"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 120 }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => handleModalVisible(true)}
          >
            <PlusOutlined /> Tạo bản ghi mới
          </Button>,
        ]}
        request={async (params) => {
          const res = await getMaintenance(params);
          return {
            data: res.data?.data || [],
            success: true,
          };
        }}
        columns={columns}
      />

      <ModalForm
        title="Tạo bản ghi bảo trì mới"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (value) => {
          await createMaintenance(value);
          message.success('Đã tạo bản ghi bảo trì. Trạng thái thiết bị đã chuyển sang [Bảo trì]');
          handleModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormSelect
          name="equipment_id"
          label="Thiết bị bảo trì"
          rules={[{ required: true }]}
          request={async () => {
            const res = await getEquipment();
            const items = res.data?.data?.items || res.data?.data || [];
            return items.map((i: any) => ({ label: `${i.name} (${i.serial_number})`, value: i.id }));
          }}
        />
        <ProFormDatePicker name="maintenance_date" label="Ngày thực hiện" rules={[{ required: true }]} />
        <ProFormText name="performed_by" label="Người thực hiện" rules={[{ required: true }]} />
        <ProFormTextArea name="details" label="Nội dung bảo trì" rules={[{ required: true }]} />
        <ProFormDigit name="cost" label="Chi phí (VNĐ)" min={0} fieldProps={{ precision: 0 }} />
        <ProFormDatePicker name="next_maintenance_date" label="Ngày bảo trì định kỳ tiếp theo" />
      </ModalForm>
    </div>
  );
};

export default MaintenanceList;
