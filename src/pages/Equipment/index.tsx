import React, { useRef, useState } from 'react';
import { Button, message, Popconfirm, Tag, Modal, Space, Descriptions, Image, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined, EyeOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormSelect, ProFormTextArea, ProFormDatePicker } from '@ant-design/pro-components';
import { useAccess, Access } from '@umijs/max';
import {
  getEquipment, createEquipment, updateEquipment, deleteEquipment,
  getCategories, getSuppliers, getLocations
} from '@/services/api';

export type EquipmentItem = {
  id: number;
  name: string;
  category?: { id: number; name: string };
  serial_number: string;
  sku?: string;
  status: 'available' | 'in_use' | 'broken' | 'maintenance';
  description?: string;
  specifications?: Record<string, any>;
  qr_code_data?: string;
  image_url?: string;
  purchase_date?: string;
  current_condition?: string;
  location?: { id: number; name: string };
  supplier?: { id: number; name: string };
};

const statusMap: Record<string, { text: string; color: string; bg: string; border: string }> = {
  available: { text: 'Sẵn sàng', color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
  in_use: { text: 'Đang mượn', color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe' },
  broken: { text: 'Hỏng', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  maintenance: { text: 'Bảo trì', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
};

const EquipmentList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<EquipmentItem | undefined>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [qrData, setQrData] = useState<string>('');
  const access = useAccess();

  const columns: ProColumns<EquipmentItem>[] = [
    {
      title: 'STT',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'Danh mục',
      dataIndex: ['category', 'name'],
      hideInForm: true,
      valueType: 'select',
      request: async () => {
        try {
          const res = await getCategories();
          const data = res.data?.data;
          const list = Array.isArray(data) ? data : (data?.items || data?.result || []);
          return list.map((c: any) => ({ label: c.name, value: c.name }));
        } catch { return []; }
      },
    },
    {
      title: 'Số Sê-ri',
      dataIndex: 'serial_number',
      copyable: true,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      hideInSearch: true,
      hideInTable: true,
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
      title: 'Vị trí kho',
      dataIndex: ['location', 'name'],
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      dataIndex: 'option',
      valueType: 'option',
      width: 220,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button type="text" shape="circle" icon={<EyeOutlined />} onClick={() => { setCurrentRow(record); setDetailVisible(true); }} style={{ background: '#f9fafb' }} />
          </Tooltip>
          <Access accessible={access.canAdmin}>
            <Tooltip title="Chỉnh sửa">
              <Button type="text" shape="circle" icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => { setCurrentRow(record); handleModalVisible(true); }} style={{ background: '#f0f5ff' }} />
            </Tooltip>
          </Access>
          <Tooltip title="Mã QR">
            <Button type="text" shape="circle" icon={<QrcodeOutlined style={{ color: '#8b5cf6' }} />} onClick={() => { setQrData(record.qr_code_data || record.serial_number); setQrModalVisible(true); }} style={{ background: '#f5f3ff' }} />
          </Tooltip>
          <Access accessible={access.canAdmin}>
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa thiết bị này?"
              onConfirm={async () => {
                await deleteEquipment(record.id);
                message.success('Xóa thành công');
                actionRef.current?.reload();
              }}
            >
              <Tooltip title="Xóa">
                <Button type="text" danger shape="circle" icon={<DeleteOutlined />} style={{ background: '#fef2f2' }} />
              </Tooltip>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <ProTable<EquipmentItem>
        headerTitle="Danh sách thiết bị"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
          // fix style mở rộng
          collapseRender: (collapsed, showCollapseButton) => {
            if (!showCollapseButton) return null;
            return (
              <span style={{ color: '#ff4d4f', cursor: 'pointer' }}>
                {collapsed ? (
                  <><PlusOutlined style={{ fontSize: 12 }} /> Mở rộng </>
                ) : (
                  <> <PlusOutlined style={{ transform: 'rotate(45deg)', fontSize: 12 }} /> Thu gọn</>
                )}
              </span>
            );
          },
          optionRender: (searchConfig, formProps, dom) => [
            // dom[0] là nút Làm lại, dom[1] là nút Tìm kiếm
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
          <Access accessible={access.canAdmin} key="primary">
            <Button
              type="primary"
              danger
              onClick={() => {
                setCurrentRow(undefined);
                handleModalVisible(true);
              }}
            >
              <PlusOutlined /> Thêm mới
            </Button>
          </Access>,
        ]}
        request={async (params) => {
          const res = await getEquipment(params);
          const data = res.data?.data;
          return {
            data: data?.items || data?.result || data || [],
            success: true,
            total: data?.meta?.totalItems || data?.total || 0,
          };
        }}
        columns={columns}
      />

      {/* Create/Edit Modal */}
      <ModalForm
        title={currentRow ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        initialValues={currentRow ? { ...currentRow, category_id: currentRow.category?.id } : undefined}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (value) => {
          if (currentRow) {
            await updateEquipment(currentRow.id, value);
            message.success('Cập nhật thành công');
          } else {
            await createEquipment(value);
            message.success('Thêm mới thành công');
          }
          handleModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name="name" label="Tên thiết bị" rules={[{ required: true }]} />
        <ProFormSelect
          name="category_id"
          label="Danh mục"
          request={async () => {
            const res = await getCategories();
            const data = res.data?.data;
            const list = Array.isArray(data) ? data : (data?.items || data?.result || []);
            return list.map((c: any) => ({ label: c.name, value: c.id }));
          }}
          rules={[{ required: true }]}
        />
        <ProFormText name="serial_number" label="Số Sê-ri" rules={[{ required: true }]} />
        <ProFormText name="sku" label="Mã SKU" />
        <ProFormSelect
          name="status"
          label="Trạng thái"
          valueEnum={Object.fromEntries(
            Object.entries(statusMap).map(([k, v]) => [k, { text: v.text }])
          )}
          initialValue="available"
        />
        <ProFormSelect
          name="location_id"
          label="Vị trí kho"
          request={async () => {
            const res = await getLocations();
            return (res.data?.data || []).map((l: any) => ({ label: l.name, value: l.id }));
          }}
        />
        <ProFormSelect
          name="supplier_id"
          label="Nhà cung cấp"
          request={async () => {
            const res = await getSuppliers();
            return (res.data?.data || []).map((s: any) => ({ label: s.name, value: s.id }));
          }}
        />
        <ProFormTextArea name="current_condition" label="Tình trạng hiện tại" />
        <ProFormText name="image_url" label="Link ảnh thiết bị" />
        <ProFormDatePicker name="purchase_date" label="Ngày mua" />
        <ProFormTextArea
          name="specifications"
          label="Thông số kỹ thuật (JSON)"
          placeholder='{"key": "value"}'
          transform={(val) => {
            try { return typeof val === 'string' ? JSON.parse(val) : val; } catch { return val; }
          }}
        />
      </ModalForm>

      {/* QR Modal */}
      <Modal
        title="Mã QR Thiết bị"
        visible={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={[
          <Button key="print" type="primary" onClick={() => window.print()}>
            In mã QR
          </Button>,
        ]}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`}
            alt="QR Code"
            style={{ width: '250px', height: '250px' }}
          />
          <div style={{ marginTop: '16px', fontWeight: 'bold', fontSize: '18px' }}>{qrData}</div>
          <div style={{ color: '#888', marginTop: 8 }}>Dán nhãn QR lên thiết bị thực tế để phục vụ quét mã</div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết thiết bị"
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={640}
      >
        {currentRow && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Tên">{currentRow.name}</Descriptions.Item>
            <Descriptions.Item label="Danh mục">{currentRow.category?.name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Serial Number">{currentRow.serial_number}</Descriptions.Item>
            <Descriptions.Item label="SKU">{currentRow.sku || '—'}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusMap[currentRow.status]?.color}>{statusMap[currentRow.status]?.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Vị trí kho">{currentRow.location?.name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Nhà cung cấp">{currentRow.supplier?.name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Tình trạng">{currentRow.current_condition || 'Tốt'}</Descriptions.Item>
            <Descriptions.Item label="Ngày mua">{currentRow.purchase_date ? new Date(currentRow.purchase_date).toLocaleDateString('vi-VN') : '—'}</Descriptions.Item>
            {currentRow.specifications && (
              <Descriptions.Item label="Thông số kỹ thuật">
                <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(currentRow.specifications, null, 2)}</pre>
              </Descriptions.Item>
            )}
            {currentRow.image_url && (
              <Descriptions.Item label="Hình ảnh">
                <Image src={currentRow.image_url} width={200} />
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Mã QR">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(currentRow.qr_code_data || currentRow.serial_number)}`}
                alt="QR"
                style={{ width: 100 }}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default EquipmentList;
