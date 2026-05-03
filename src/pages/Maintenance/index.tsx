import React, { useRef, useState } from 'react';
import { Button, message, Tag, Space, Typography, Card, Statistic, Row, Col } from 'antd';
import { PlusOutlined, CheckCircleOutlined, HistoryOutlined, ToolOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText, ProFormSelect, ProFormDatePicker, ProFormTextArea, ProFormDigit } from '@ant-design/pro-form';
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
      valueEnum: {
        pending: { text: 'Đang bảo trì', status: 'Processing' },
        completed: { text: 'Đã hoàn thành', status: 'Success' },
      },
    },
    {
      title: 'Thao tác',
      dataIndex: 'option',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        record.status === 'pending' && (
          <a
            key="complete"
            onClick={async () => {
              if (record.equipment?.id) {
                await completeMaintenance(record.equipment.id);
                message.success('Đã hoàn tất bảo trì, thiết bị đã sẵn sàng');
                actionRef.current?.reload();
              }
            }}
          >
            <CheckCircleOutlined /> Hoàn tất
          </a>
        ),
      ],
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card bordered={false} bodyStyle={{ padding: '16px' }}>
            <Statistic title="Đang bảo trì" value={3} prefix={<ToolOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} bodyStyle={{ padding: '16px' }}>
            <Statistic title="Tổng chi phí tháng này" value={1500000} suffix="VNĐ" prefix={<HistoryOutlined />} />
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
