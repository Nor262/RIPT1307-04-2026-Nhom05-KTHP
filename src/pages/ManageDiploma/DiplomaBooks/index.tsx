import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { getDiplomaBooks, addDiplomaBook, updateDiplomaBook, deleteDiplomaBook, DiplomaBook } from '@/services/ManageDiploma/diplomaBook';
import { Button, message, Modal, Form, Input, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const DiplomaBooksPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<DiplomaBook | null>(null);
  const [form] = Form.useForm();

  const handleOpenModal = (record?: DiplomaBook) => {
    if (record) {
      setEditingBook(record);
      form.setFieldsValue(record);
    } else {
      setEditingBook(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingBook(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingBook) {
        await updateDiplomaBook(editingBook.id, values);
        message.success('Cập nhật thành công');
      } else {
        await addDiplomaBook({ ...values, year: Number(values.year) });
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
      title: 'Xóa sổ văn bằng?',
      content: 'Bạn có chắc muốn xóa sổ này không?',
      onOk: async () => {
        try {
          await deleteDiplomaBook(id);
          message.success('Xóa thành công');
          actionRef.current?.reload();
        } catch (error: any) {
          message.error('Có lỗi xảy ra');
        }
      },
    });
  };

  const columns: ProColumns<DiplomaBook>[] = [
    {
      title: 'Mã số sổ',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Năm cấp',
      dataIndex: 'year',
      key: 'year',
      valueType: 'digit',
    },
    {
      title: 'Số vào sổ hiện tại',
      dataIndex: 'currentEntryNumber',
      key: 'currentEntryNumber',
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
      <ProTable<DiplomaBook>
        headerTitle="Danh sách sổ văn bằng"
        actionRef={actionRef}
        rowKey="id"
        toolBarRender={() => [
          <Button type="primary" key="add" onClick={() => handleOpenModal()} icon={<PlusOutlined />}>
            Thêm mới
          </Button>,
        ]}
        request={async (params) => {
          const res = await getDiplomaBooks(params);
          return {
            data: res.data,
            success: res.success,
            total: res.total,
          };
        }}
        columns={columns}
      />

      <Modal
        title={editingBook ? 'Cập nhật sổ văn bằng' : 'Thêm mới sổ văn bằng'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={handleCloseModal}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingBook && (
            <Form.Item
              name="id"
              label="Mã số sổ (Tùy chọn)"
              tooltip="Nếu để trống sẽ tự động lấy theo năm"
            >
              <Input placeholder="Nhập mã sổ" />
            </Form.Item>
          )}
          <Form.Item
            name="year"
            label="Năm cấp"
            rules={[{ required: true, message: 'Vui lòng nhập năm' }]}
          >
            <InputNumber placeholder="Ví dụ: 2026" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DiplomaBooksPage;
