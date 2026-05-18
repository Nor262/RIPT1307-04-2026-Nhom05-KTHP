import React, { useRef, useState } from 'react';
import { Button, message, Popconfirm, Tag, Modal, Descriptions, Image, Upload } from 'antd';
import type { FormInstance } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined, EyeOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormSelect, ProFormTextArea, ProFormDatePicker } from '@ant-design/pro-components';
import { 
  getEquipment, createEquipment, updateEquipment, deleteEquipment, 
  getCategories, getSuppliers, getLocations, importBulkEquipment, exportEquipmentExcel,
  resolveMaintenanceEquipment
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

const statusMap: Record<string, { text: string; color: string }> = {
  available: { text: 'Sẵn sàng', color: 'success' },
  in_use: { text: 'Đang mượn', color: 'processing' },
  broken: { text: 'Hỏng', color: 'error' },
  maintenance: { text: 'Bảo trì', color: 'warning' },
};

const EquipmentList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const searchTimeoutRef = useRef<any>();
  const [currentRow, setCurrentRow] = useState<EquipmentItem | undefined>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [qrData, setQrData] = useState<string>('');

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
        const s = statusMap[record.status] || { text: record.status, color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
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
      render: (_, record) => [
        <a key="detail" onClick={() => { setCurrentRow(record); setDetailVisible(true); }}>
          <EyeOutlined /> Xem
        </a>,
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            handleModalVisible(true);
          }}
        >
          <EditOutlined /> Sửa
        </a>,
        <a
          key="qr"
          onClick={() => {
            setQrData(record.qr_code_data || record.serial_number);
            setQrModalVisible(true);
          }}
        >
          <QrcodeOutlined /> QR
        </a>,
        record.status === 'maintenance' && (
          <Popconfirm
            key="resolve"
            title="Xác nhận thiết bị đã sửa xong và sẵn sàng cho mượn?"
            onConfirm={async () => {
              await resolveMaintenanceEquipment(record.id);
              message.success('Thiết bị đã sẵn sàng');
              actionRef.current?.reload();
            }}
          >
            <a style={{ color: '#52c41a' }}>Xử lý xong</a>
          </Popconfirm>
        ),
        <Popconfirm
          key="delete"
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={async () => {
            await deleteEquipment(record.id);
            message.success('Xóa thành công');
            actionRef.current?.reload();
          }}
        >
          <a style={{ color: '#ff4d4f' }}><DeleteOutlined /> Xóa</a>
        </Popconfirm>,
      ],
    },
  ];

  const handleExport = async () => {
    try {
      const res = await exportEquipmentExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'equipment_report.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      message.error('Lỗi khi tải báo cáo Excel');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <ProTable<EquipmentItem>
        headerTitle="Danh sách thiết bị"
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
          labelWidth: 120,
          // fix style mở rộng
          collapseRender: (collapsed, showCollapseButton) => {
            if (!showCollapseButton) return null;
            return (
              <span style={{ color: '#c00c0c', cursor: 'pointer' }}>
                {collapsed ? (
                  <><PlusOutlined style={{ fontSize: 12 }} /> Mở rộng </>
                ) : (
                  <> <PlusOutlined style={{ transform: 'rotate(45deg)', fontSize: 12 }} /> Thu gọn</>
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
          <Button key="export" onClick={handleExport} icon={<DownloadOutlined />}>
            Xuất Excel
          </Button>,
          <Upload
            key="import"
            showUploadList={false}
            customRequest={async (options) => {
              const { file, onSuccess, onError } = options;
              const formData = new FormData();
              formData.append('file', file as Blob);
              try {
                const res = await importBulkEquipment(formData);
                message.success(res.data.message || 'Import thành công');
                onSuccess?.(res.data);
                actionRef.current?.reload();
              } catch (error) {
                message.error('Lỗi khi import file Excel');
                onError?.(error as any);
              }
            }}
          >
            <Button icon={<UploadOutlined />}>Nhập Excel</Button>
          </Upload>,
          <Button
            type="primary"
            key="primary"
            style={{ backgroundColor: '#c00c0c', borderColor: '#c00c0c' }}
            onClick={() => {
              setCurrentRow(undefined);
              handleModalVisible(true);
            }}
          >
            <PlusOutlined /> Thêm mới
          </Button>,
        ]}
        request={async (params) => {
          const res = await getEquipment(params);
          const data = res.data?.data;
          const list = data?.items || data?.result || data || [];
          
          const filteredList = list.filter((item: EquipmentItem) => {
            if (params.name && !item.name.toLowerCase().includes(params.name.toLowerCase())) {
              return false;
            }
            if (params.serial_number && !item.serial_number.toLowerCase().includes(params.serial_number.toLowerCase())) {
              return false;
            }
            if (params.status && item.status !== params.status) {
              return false;
            }
            if (params.category) {
              const itemCatName = item.category?.name?.toLowerCase();
              const paramCat = typeof params.category === 'object' ? params.category.name : params.category;
              if (paramCat && !itemCatName?.includes(paramCat.toLowerCase())) {
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
          transform={(val: any) => {
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  {(() => {
                    let specs: Record<string, any> = {};
                    try {
                      specs = typeof currentRow.specifications === 'string'
                        ? JSON.parse(currentRow.specifications)
                        : currentRow.specifications;
                    } catch (e) {
                      return <span style={{ color: '#ff4d4f' }}>Lỗi định dạng thông số</span>;
                    }
                    if (!specs || Object.keys(specs).length === 0) {
                      return <span>Không có thông số kỹ thuật</span>;
                    }
                    return Object.entries(specs).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', paddingBottom: '4px' }}>
                        <span style={{ fontWeight: 600, width: '150px', color: '#555', flexShrink: 0 }}>{key}:</span>
                        <span style={{ color: '#222', wordBreak: 'break-all' }}>{String(val)}</span>
                      </div>
                    ));
                  })()}
                </div>
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
