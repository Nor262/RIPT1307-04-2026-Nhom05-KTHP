import React, { useRef, useState } from 'react';
import { Button, message, Space, Card, Statistic, Row, Col, Tooltip } from 'antd';
import type { FormInstance } from 'antd';
import { PlusOutlined, CheckCircleOutlined, HistoryOutlined, ToolOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormSelect, ProFormDatePicker, ProFormTextArea, ProFormDigit } from '@ant-design/pro-components';
import { getMaintenance, createMaintenance, getEquipment, completeMaintenance } from '@/services/api';

export type MaintenanceItem = {
  id: number;
  equipment_id: number;
  maintenance_date: string;
  performed_by: string;
  details: string;
  cost: number | string;
  next_maintenance_date?: string | null;
  equipment?: {
    id: number;
    name: string;
    serial_number: string;
    status: 'available' | 'maintenance' | string;
  };
};

const statusMap: Record<string, { text: string; color: string; bg: string; border: string }> = {
  maintenance: { text: 'Đang bảo trì', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  available: { text: 'Đã hoàn thành', color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
};

const MaintenanceList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const searchTimeoutRef = useRef<any>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [maintenanceCount, setmaintenanceCount] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);

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
      hideInSearch: true,
      render: (_, record) => `${Number(record.cost || 0).toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Hẹn ngày tới',
      dataIndex: 'next_maintenance_date',
      valueType: 'date',
    },
    {
      title: 'Trạng thái',
      dataIndex: ['equipment', 'status'],
      render: (_, record) => {
        const currentStatus = record.equipment?.status || '';
        const s = statusMap[currentStatus] || { text: currentStatus, color: '#4b5563', bg: '#f3f4f6', border: '#e5e7eb' };
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
          {record.equipment?.status === 'maintenance' && (
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
              value={maintenanceCount}
              prefix={<div style={{ padding: '12px', borderRadius: '12px', background: '#fffbeb', display: 'flex', marginRight: 12 }}><ToolOutlined style={{ color: '#f59e0b' }} /></div>}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false} className="stat-card-premium" bodyStyle={{ padding: '24px' }}>
            <Statistic
              title="Tổng chi phí"
              value={totalCost}
              suffix="VNĐ"
              prefix={<div style={{ padding: '12px', borderRadius: '12px', background: '#eff6ff', display: 'flex', marginRight: 12 }}><HistoryOutlined style={{ color: '#3b82f6' }} /></div>}
            />
          </Card>
        </Col>
      </Row>

      <ProTable<MaintenanceItem>
        headerTitle="Nhật ký bảo trì thiết bị"
        actionRef={actionRef}
        formRef={formRef}
        form={{
          onValuesChange: () => {
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
          labelWidth: 120, collapseRender: (collapsed, showCollapseButton) => {
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
          optionRender: (searchConfig, formProps) => [
            <Button
              key="reset"
              onClick={() => {
                formProps.form?.resetFields();
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
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            style={{ backgroundColor: '#c00c0c', borderColor: '#c00c0c' }}
            onClick={() => handleModalVisible(true)}
          >
            <PlusOutlined /> Tạo bản ghi mới
          </Button>,
        ]}
        request={async (params) => {
          const res = await getMaintenance(params);
          const data = res.data?.data || [];
          const list = Array.isArray(data) ? data : (data?.items || data?.result || []);
          const maintenance = list.filter((item: MaintenanceItem) => item.equipment?.status === 'maintenance').length;
          const cost = list.reduce((sum: number, item: MaintenanceItem) => sum + Number(item.cost || 0), 0);
          setmaintenanceCount(maintenance);
          setTotalCost(cost);

          const filteredList = list.filter((item: MaintenanceItem) => {
            if (params.performed_by && !item.performed_by?.toLowerCase().includes(params.performed_by.toLowerCase())) {
              return false;
            }
            if (params.status && item.equipment?.status !== params.status) {
              return false;
            }
            if (params.maintenance_date && item.maintenance_date && !item.maintenance_date.startsWith(params.maintenance_date)) {
              return false;
            }
            const searchEquip =
              typeof params.equipment === 'string' ? params.equipment :
                (params.equipment as any)?.name ||
                (params as any)['equipment.name'] ||
                (params as any)['equipment,name'] ||
                '';

            if (searchEquip) {
              const itemEquipName = item.equipment?.name?.toLowerCase();
              if (!itemEquipName?.includes(searchEquip.toLowerCase())) {
                return false;
              }
            }
            return true;
          });

          const current = params.current || 1;
          const pageSize = params.pageSize || 10;
          const startIndex = (current - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedData = filteredList.slice(startIndex, endIndex);

          return {
            data: paginatedData,
            success: true,
            total: filteredList.length,
          };
        }}
        columns={columns}
      />

      <ModalForm
        title="Tạo bản ghi bảo trì mới"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        modalProps={{ destroyOnHidden: true }}
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
        <ProFormDigit name="cost" label="Chi phí (VNĐ)" min={0} fieldProps={{ precision: 0 }} rules={[{ required: true, message: 'Vui lòng nhập chi phí' }]} />
        <ProFormDatePicker name="next_maintenance_date" label="Ngày bảo trì định kỳ tiếp theo" />
      </ModalForm>
    </div>
  );
};

export default MaintenanceList;