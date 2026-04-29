import React, { useRef, useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { getDiplomaInfos, addDiplomaInfo, updateDiplomaInfo, deleteDiplomaInfo, DiplomaInfo } from '@/services/ManageDiploma/diplomaInfo';
import { getDecisions, Decision } from '@/services/ManageDiploma/decision';
import { getFormConfigFields, FormConfigField } from '@/services/ManageDiploma/formConfig';
import { Button, message, Modal, Form, Input, DatePicker, Select, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

const DiplomaInfoPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DiplomaInfo | null>(null);
  const [form] = Form.useForm();
  
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [configFields, setConfigFields] = useState<FormConfigField[]>([]);

  useEffect(() => {
    getDecisions().then(res => setDecisions(res.data || []));
    getFormConfigFields().then(res => setConfigFields(res.data || []));
  }, []);

  const handleOpenModal = (record?: DiplomaInfo) => {
    if (record) {
      setEditingRecord(record);
      
      // Parse dates map them into moment for Form
      const dynamicFields: Record<string, any> = { ...record.dynamicFields };
      configFields.forEach(f => {
        if (f.dataType === 'Date' && dynamicFields[f.id]) {
          dynamicFields[f.id] = moment(dynamicFields[f.id]);
        }
      });
      
      form.setFieldsValue({
        ...record,
        dateOfBirth: moment(record.dateOfBirth),
        dynamicFields,
      });
    } else {
      setEditingRecord(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingRecord(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      // Process date fields
      const processedDynamicFields: Record<string, any> = {};
      if (values.dynamicFields) {
        Object.keys(values.dynamicFields).forEach(key => {
          const val = values.dynamicFields[key];
          const fieldDef = configFields.find(f => f.id === key);
          if (fieldDef?.dataType === 'Date' && val) {
            processedDynamicFields[key] = val.format('YYYY-MM-DD');
          } else {
            processedDynamicFields[key] = val;
          }
        });
      }

      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        dynamicFields: processedDynamicFields,
      };
      
      if (editingRecord) {
        await updateDiplomaInfo(editingRecord.id, payload);
        message.success('Cập nhật thành công');
      } else {
        await addDiplomaInfo(payload);
        message.success('Thêm mới thành công');
      }
      handleCloseModal();
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Xóa thông tin văn bằng?',
      content: 'Lưu ý: Bạn chỉ có thể xóa, không thể hoàn tác.',
      onOk: async () => {
        try {
          await deleteDiplomaInfo(id);
          message.success('Xóa thành công');
          actionRef.current?.reload();
        } catch (error: any) {
          message.error('Có lỗi xảy ra');
        }
      },
    });
  };

  const columns: ProColumns<DiplomaInfo>[] = [
    {
      title: 'Số hiệu văn bằng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Số vào sổ',
      dataIndex: 'entryNumber',
      key: 'entryNumber',
      hideInSearch: true,
    },
    {
      title: 'Mã SV',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: 'Quyết định',
      dataIndex: 'decisionId',
      key: 'decisionId',
      render: (_, record) => {
        const dec = decisions.find(d => d.id === record.decisionId);
        return dec ? dec.id : record.decisionId;
      },
      renderFormItem: () => (
        <Select placeholder="Chọn Quyết định">
          {decisions.map(d => (
            <Select.Option key={d.id} value={d.id}>{d.id}</Select.Option>
          ))}
        </Select>
      )
    },
    // We can add dynamic columns here, but usually a table doesn't fit all. We will just let them hide.
    {
      title: 'Hành động',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <>
          <a onClick={() => handleOpenModal(record)} style={{ marginRight: 8 }}>Sửa</a>
          <a onClick={() => handleDelete(record.id)} style={{ color: 'red' }}>Xóa</a>
        </>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<DiplomaInfo>
        headerTitle="Danh sách Thông tin văn bằng"
        actionRef={actionRef}
        rowKey="id"
        toolBarRender={() => [
          <Button type="primary" key="add" onClick={() => handleOpenModal()} icon={<PlusOutlined />}>
            Thêm mới
          </Button>,
        ]}
        request={async (params) => {
          const res = await getDiplomaInfos(params);
          return {
            data: res.data,
            success: res.success,
            total: res.total,
          };
        }}
        columns={columns}
      />

      <Modal
        title={editingRecord ? 'Cập nhật Văn Bằng' : 'Thêm mới Văn Bằng'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={handleCloseModal}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 16px' }}>
            <div style={{ flex: '1 1 45%' }}>
              {!editingRecord && (
                <Form.Item
                  name="id"
                  label="Số hiệu văn bằng"
                  rules={[{ required: true, message: 'Vui lòng nhập' }]}
                >
                  <Input placeholder="Nhập số hiệu văn bằng" />
                </Form.Item>
              )}
              {editingRecord && (
                <Form.Item label="Số hiệu văn bằng">
                  <Input value={editingRecord.id} disabled />
                </Form.Item>
              )}
            </div>
            {editingRecord && (
              <div style={{ flex: '1 1 45%' }}>
                <Form.Item label="Số vào sổ">
                  <Input value={editingRecord.entryNumber} disabled />
                </Form.Item>
              </div>
            )}
            <div style={{ flex: '1 1 45%' }}>
              <Form.Item
                name="decisionId"
                label="Quyết định tốt nghiệp"
                rules={[{ required: true, message: 'Vui lòng chọn' }]}
              >
                <Select placeholder="Chọn quyết định" disabled={!!editingRecord}>
                  {decisions.map(d => (
                    <Select.Option key={d.id} value={d.id}>{d.id}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div style={{ flex: '1 1 45%' }}>
              <Form.Item
                name="studentId"
                label="Mã sinh viên"
                rules={[{ required: true, message: 'Vui lòng nhập' }]}
              >
                <Input placeholder="Mã SV" />
              </Form.Item>
            </div>
            <div style={{ flex: '1 1 45%' }}>
              <Form.Item
                name="fullName"
                label="Họ tên"
                rules={[{ required: true, message: 'Vui lòng nhập' }]}
              >
                <Input placeholder="Họ tên sinh viên" />
              </Form.Item>
            </div>
            <div style={{ flex: '1 1 45%' }}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[{ required: true, message: 'Vui lòng chọn' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </div>
          </div>

          <h3 style={{ marginTop: 16 }}>Thông tin bổ sung (Cấu hình động)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 16px' }}>
            {configFields.map(field => {
              let FieldComponent: any = <Input placeholder={`Nhập ${field.name}`} />;
              if (field.dataType === 'Number') {
                FieldComponent = <InputNumber style={{ width: '100%' }} placeholder={`Nhập ${field.name}`} />;
              } else if (field.dataType === 'Date') {
                FieldComponent = <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder={`Chọn ${field.name}`} />;
              }

              return (
                <div style={{ flex: '1 1 45%' }} key={field.id}>
                  <Form.Item
                    name={['dynamicFields', field.id]}
                    label={field.name}
                    rules={[{ required: field.required, message: `Vui lòng nhập ${field.name}` }]}
                  >
                    {FieldComponent}
                  </Form.Item>
                </div>
              );
            })}
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DiplomaInfoPage;
