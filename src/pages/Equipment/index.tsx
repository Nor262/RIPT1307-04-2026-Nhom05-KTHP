import React, { useRef, useState } from 'react';
import { Button, message, Popconfirm, Tag, Modal, Space, Descriptions, Image, Upload, Tooltip, Input, Form, QRCode } from 'antd';
import type { FormInstance } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined, EyeOutlined, UploadOutlined, DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormSelect, ProFormTextArea, ProFormDatePicker } from '@ant-design/pro-components';
import {
  getEquipment, createEquipment, updateEquipment, deleteEquipment,
  getCategories, getSuppliers, getLocations, importBulkEquipment, exportEquipmentExcel,
  resolveMaintenanceEquipment, uploadEquipmentImage
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

const EquipmentImageUpload = ({ value, onChange }: { value?: string; onChange?: (val: string) => void }) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: any) => {
    setLoading(true);
    try {
      const res = await uploadEquipmentImage(file);
      const url = res.data?.data?.url || res.data?.url;
      if (url) {
        onChange?.(url);
        message.success('Tải ảnh lên thành công');
      } else {
        message.error('Tải ảnh thất bại: URL không tồn tại');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Tải ảnh thất bại');
    } finally {
      setLoading(false);
    }
    return false; // prevent default upload behavior
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Input
          placeholder="Nhập link ảnh hoặc bấm nút Tải ảnh lên"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          style={{ flex: 1 }}
        />
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleUpload}
          disabled={loading}
        >
          <Button icon={<UploadOutlined />} loading={loading} disabled={loading}>
            Tải ảnh lên
          </Button>
        </Upload>
        {value && (
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onChange?.('')}
          />
        )}
      </div>
      {value && (
        <div style={{ marginTop: '8px' }}>
          <img src={value} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px', border: '1px solid #d9d9d9', padding: '4px' }} />
        </div>
      )}
    </div>
  );
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
          <Tooltip title="Chỉnh sửa">
            <Button type="text" shape="circle" icon={<EditOutlined style={{ color: '#1677ff' }} />} onClick={() => { setCurrentRow(record); handleModalVisible(true); }} style={{ background: '#f0f5ff' }} />
          </Tooltip>
          <Tooltip title="Mã QR">
            <Button type="text" shape="circle" icon={<QrcodeOutlined style={{ color: '#8b5cf6' }} />} onClick={() => { setQrData(record.qr_code_data || record.serial_number); setQrModalVisible(true); }} style={{ background: '#f5f3ff' }} />
          </Tooltip>
          {record.status === 'maintenance' && (
            <Popconfirm
              title="Xác nhận thiết bị đã sửa xong và sẵn sàng cho mượn?"
              onConfirm={async () => {
                await resolveMaintenanceEquipment(record.id);
                message.success('Thiết bị đã sẵn sàng');
                actionRef.current?.reload();
              }}
            >
              <Tooltip title="Xử lý xong bảo trì">
                <Button type="text" shape="circle" icon={<CheckCircleOutlined style={{ color: '#10b981' }} />} style={{ background: '#ecfdf5' }} />
              </Tooltip>
            </Popconfirm>
          )}
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
        </Space>
      ),
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
        scroll={{ x: 'max-content' }}
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
              <span style={{ color: '#C00C0C', cursor: 'pointer' }}>
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
              style={{ color: '#C00C0C', borderColor: '#C00C0C' }}
            >
              Tải lại
            </Button>,
            <Button
              key="search"
              type="primary"
              onClick={() => formProps.form?.submit()}
              style={{ backgroundColor: '#C00C0C', borderColor: '#C00C0C', color: '#fff' }}
            >
              Tìm ngay
            </Button>,
          ],
        }}
        toolBarRender={() => [
          <Button
            key="export"
            type="primary"
            onClick={handleExport}
            icon={<DownloadOutlined />}
            style={{ backgroundColor: '#C00C0C', borderColor: '#C00C0C', color: '#fff', fontWeight: 500 }}
          >
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
            style={{ backgroundColor: '#C00C0C', borderColor: '#C00C0C' }}
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
            const searchCat =
              typeof params.category === 'string' ? params.category :
                (params.category as any)?.name ||
                (params as any)['category.name'] ||
                (params as any)['category,name'] ||
                '';

            if (searchCat) {
              const itemCatName = item.category?.name?.toLowerCase();
              if (!itemCatName?.includes(searchCat.toLowerCase())) {
                return false;
              }
            }
            return true;
          });

          // Local pagination
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

      {/* Create/Edit Modal */}
      <ModalForm
        key={currentRow?.id || 'new'}
        title={currentRow ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        initialValues={currentRow ? {
          ...currentRow,
          category_id: currentRow.category?.id,
          specifications: (() => {
            if (!currentRow?.specifications) return [];
            let specs = currentRow.specifications;
            if (typeof specs === 'string') {
              try { specs = JSON.parse(specs); } catch { return []; }
            }
            if (typeof specs === 'object' && specs !== null) {
              return Object.entries(specs).map(([key, value]) => ({
                key,
                value: typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)
              }));
            }
            return [];
          })()
        } : {
          specifications: []
        }}
        modalProps={{ destroyOnHidden: true }}
        onFinish={async (value) => {
          const specsObject: Record<string, any> = {};
          if (Array.isArray(value.specifications)) {
            value.specifications.forEach((item: any) => {
              if (item && item.key) {
                specsObject[item.key] = item.value || '';
              }
            });
          }
          const submitValue = {
            ...value,
            specifications: specsObject,
          };
          if (currentRow) {
            await updateEquipment(currentRow.id, submitValue);
            message.success('Cập nhật thành công');
          } else {
            await createEquipment(submitValue);
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
        <Form.Item name="image_url" label="Ảnh thiết bị">
          <EquipmentImageUpload />
        </Form.Item>
        <ProFormDatePicker name="purchase_date" label="Ngày mua" />
        
        <Form.List name="specifications">
          {(fields, { add, remove }) => (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 500, fontSize: '14px', color: '#1f2937' }}>
                  Thông số kỹ thuật
                </span>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  size="small"
                  style={{
                    color: '#C00C0C',
                    borderColor: '#C00C0C',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Thêm thông số
                </Button>
              </div>

              {fields.length === 0 ? (
                <div style={{
                  padding: '24px',
                  background: '#f9fafb',
                  border: '1px dashed #e5e7eb',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '13px',
                }}>
                  Không có thông số kỹ thuật nào. Bấm "Thêm thông số" để thiết lập.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        background: '#f9fafb',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #f3f4f6',
                      }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'key']}
                        rules={[{ required: true, message: 'Nhập tên thông số!' }]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Input placeholder="Tên thông số (VD: RAM, CPU)" />
                      </Form.Item>
                      
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        rules={[{ required: true, message: 'Nhập giá trị!' }]}
                        style={{ marginBottom: 0, flex: 2 }}
                      >
                        <Input placeholder="Giá trị (VD: 16GB, Core i7)" />
                      </Form.Item>

                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px 8px',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Form.List>
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
        <div style={{ textAlign: 'center', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <QRCode
            value={qrData || ''}
            size={250}
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
                      return <span style={{ color: '#A85448' }}>Lỗi định dạng thông số</span>;
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
              <QRCode
                value={currentRow.qr_code_data || currentRow.serial_number || ''}
                size={100}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default EquipmentList;
