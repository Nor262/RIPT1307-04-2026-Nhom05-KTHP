import React, { useRef, useState } from 'react';
import { Button, message, Space, Card, Statistic, Row, Col } from 'antd';
import type { FormInstance } from 'antd';
import { PlusOutlined, HistoryOutlined, ToolOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormSelect, ProFormDatePicker, ProFormTextArea, ProFormDigit } from '@ant-design/pro-components';
import { getMaintenance, createMaintenance, getEquipment } from '@/services/api';



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
  const formRef = useRef<FormInstance>();
  const searchTimeoutRef = useRef<any>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
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
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card bordered={false} bodyStyle={{ padding: '16px' }}>
            <Statistic title="Đang bảo trì" value={pendingCount} prefix={<ToolOutlined />} valueStyle={{
              backgroundImage: 'url("/background_card3.svg")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center',
              backgroundSize: 'contain',
              borderLeft: '4px solid #faad14'
            }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} bodyStyle={{ padding: '16px' }}>
            <Statistic title="Tổng chi phí" value={totalCost.toLocaleString('vi-VN')} suffix="VNĐ" prefix={<HistoryOutlined />} valueStyle={{
              backgroundImage: 'url("/background_card4.svg")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center',
              backgroundSize: 'contain',
              borderLeft: '4px solid #faad14'
            }} />
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
          optionRender: (searchConfig, formProps, dom) => [
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
          
          // Tính thống kê từ toàn bộ dữ liệu
          const pending = list.filter((item: MaintenanceItem) => item.status === 'pending').length;
          const cost = list.reduce((sum: number, item: MaintenanceItem) => sum + Number(item.cost || 0), 0);
          setPendingCount(pending);
          setTotalCost(cost);
          
          const filteredList = list.filter((item: MaintenanceItem) => {
            if (params.performed_by && !item.performed_by?.toLowerCase().includes(params.performed_by.toLowerCase())) {
              return false;
            }
            if (params.status && item.status !== params.status) {
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
          
          return {
            data: filteredList,
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
        <ProFormDigit name="cost" label="Chi phí (VNĐ)" min={0} fieldProps={{ precision: 0 }} rules={[{ required: true, message: 'Vui lòng nhập chi phí' }]} />
        <ProFormDatePicker name="next_maintenance_date" label="Ngày bảo trì định kỳ tiếp theo" />
      </ModalForm>
    </div>
  );
};

export default MaintenanceList;
