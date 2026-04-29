import React, { useRef, useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { getDecisions, addDecision, updateDecision, deleteDecision, Decision } from '@/services/ManageDiploma/decision';
import { getDiplomaBooks, DiplomaBook } from '@/services/ManageDiploma/diplomaBook';
import { Button, message, Modal, Form, Input, DatePicker, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

const DecisionsPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Decision | null>(null);
  const [form] = Form.useForm();
  
  const [books, setBooks] = useState<DiplomaBook[]>([]);

  useEffect(() => {
    getDiplomaBooks().then(res => setBooks(res.data || []));
  }, []);

  const handleOpenModal = (record?: Decision) => {
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue({
        ...record,
        issueDate: moment(record.issueDate),
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
      const payload = {
        ...values,
        issueDate: values.issueDate.format('YYYY-MM-DD'),
      };
      
      if (editingRecord) {
        await updateDecision(editingRecord.id, payload);
        message.success('Cập nhật thành công');
      } else {
        await addDecision(payload);
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
      title: 'Xóa quyết định?',
      content: 'Bạn có chắc muốn xóa không?',
      onOk: async () => {
        try {
          await deleteDecision(id);
          message.success('Xóa thành công');
          actionRef.current?.reload();
        } catch (error: any) {
          message.error('Có lỗi xảy ra');
        }
      },
    });
  };

  const columns: ProColumns<Decision>[] = [
    {
      title: 'Số QĐ',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Ngày ban hành',
      dataIndex: 'issueDate',
      key: 'issueDate',
      valueType: 'date',
    },
    {
      title: 'Trích yếu',
      dataIndex: 'summary',
      key: 'summary',
      hideInSearch: true,
    },
    {
      title: 'Thuộc sổ',
      dataIndex: 'diplomaBookId',
      key: 'diplomaBookId',
      render: (_, record) => {
        const book = books.find(b => b.id === record.diplomaBookId);
        return book ? `${book.id} (Năm ${book.year})` : record.diplomaBookId;
      },
      renderFormItem: () => (
        <Select placeholder="Chọn sổ">
          {books.map(b => (
            <Select.Option key={b.id} value={b.id}>{b.id}</Select.Option>
          ))}
        </Select>
      )
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
      <ProTable<Decision>
        headerTitle="Danh sách Quyết định tốt nghiệp"
        actionRef={actionRef}
        rowKey="id"
        toolBarRender={() => [
          <Button type="primary" key="add" onClick={() => handleOpenModal()} icon={<PlusOutlined />}>
            Thêm mới
          </Button>,
        ]}
        request={async (params) => {
          const res = await getDecisions(params);
          return {
            data: res.data,
            success: res.success,
            total: res.total,
          };
        }}
        columns={columns}
      />

      <Modal
        title={editingRecord ? 'Cập nhật QĐ' : 'Thêm mới QĐ'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={handleCloseModal}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingRecord && (
            <Form.Item
              name="id"
              label="Số Quyết Định"
              rules={[{ required: true, message: 'Vui lòng nhập Số QĐ' }]}
            >
              <Input placeholder="Nhập Số QĐ" />
            </Form.Item>
          )}
          <Form.Item
            name="issueDate"
            label="Ngày ban hành"
            rules={[{ required: true, message: 'Vui lòng chọn ngày ban hành' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            name="summary"
            label="Trích yếu"
            rules={[{ required: true, message: 'Vui lòng nhập trích yếu' }]}
          >
            <Input.TextArea rows={3} placeholder="Nội dung trích yếu" />
          </Form.Item>
          <Form.Item
            name="diplomaBookId"
            label="Thuộc Sổ Văn Bằng"
            rules={[{ required: true, message: 'Vui lòng chọn sổ văn bằng quản lý' }]}
          >
            <Select placeholder="Chọn sổ văn bằng">
              {books.map(b => (
                <Select.Option key={b.id} value={b.id}>{b.id} - Năm {b.year}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DecisionsPage;
