import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { getFormConfigFields, addFormConfigField, updateFormConfigField, deleteFormConfigField, FormConfigField } from '@/services/ManageDiploma/formConfig';
import { Button, message, Modal, Form, Input, Select, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const FormConfigPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FormConfigField | null>(null);
  const [form] = Form.useForm();

  const handleOpenModal = (record?: FormConfigField) => {
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue(record);
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
      if (editingRecord) {
        await updateFormConfigField(editingRecord.id, values);
        message.success('Cập nhật thành công');
      } else {
        await addFormConfigField(values);
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
      title: 'Xóa trường thông tin?',
      content: 'Bạn có chắc muốn xóa không?',
      onOk: async () => {
        try {
          await deleteFormConfigField(id);
          message.success('Xóa thành công');
          actionRef.current?.reload();
        } catch (error: any) {
          message.error('Có lỗi xảy ra');
        }
      },
    });
  };

  const columns: ProColumns<FormConfigField>[] = [
    {
      title: 'Mã trường',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên trường',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Kiểu dữ liệu',
      dataIndex: 'dataType',
      key: 'dataType',
      valueEnum: {
        String: { text: 'Văn bản (String)' },
        Number: { text: 'Số (Number)' },
        Date: { text: 'Ngày tháng (Date)' },
      },
    },
    {
      title: 'Bắt buộc',
      dataIndex: 'required',
      key: 'required',
      render: (_, record) => (record.required ? 'Có' : 'Không'),
      valueType: 'select',
      valueEnum: {
        true: { text: 'Có' },
        false: { text: 'Không' },
      },
      hideInSearch: true,
    },
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
      <ProTable<FormConfigField>
        headerTitle="Cấu hình trường thông tin văn bằng"
        actionRef={actionRef}
        rowKey="id"
        toolBarRender={() => [
          <Button type="primary" key="add" onClick={() => handleOpenModal()} icon={<PlusOutlined />}>
            Thêm mới
          </Button>,
        ]}
        request={async (params) => {
          const res = await getFormConfigFields(params);
          return {
            data: res.data,
            success: res.success,
            total: res.total,
          };
        }}
        columns={columns}
      />

      <Modal
        title={editingRecord ? 'Cập nhật trường' : 'Thêm mới trường'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={handleCloseModal}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ required: false }}>
          {!editingRecord && (
            <Form.Item
              name="id"
              label="Mã trường (Ví dụ: dan_toc)"
              rules={[{ required: true, message: 'Vui lòng nhập mã trường' }]}
            >
              <Input placeholder="Nhập mã trường" />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="Tên trường hiển thị"
            rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
          >
            <Input placeholder="Ví dụ: Dân tộc" />
          </Form.Item>
          <Form.Item
            name="dataType"
            label="Kiểu dữ liệu"
            rules={[{ required: true, message: 'Vui lòng chọn kiểu' }]}
          >
            <Select placeholder="Chọn kiểu dữ liệu">
              <Select.Option value="String">Văn bản (String)</Select.Option>
              <Select.Option value="Number">Số (Number)</Select.Option>
              <Select.Option value="Date">Ngày tháng (Date)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="required"
            label="Bắt buộc nhập"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default FormConfigPage;
