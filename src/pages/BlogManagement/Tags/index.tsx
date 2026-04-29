import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useModel } from 'umi';

const TagManagement: React.FC = () => {
  const { tags, addTag, updateTag, deleteTag } = useModel('tag');
  const { posts } = useModel('blog');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<{ id: string, name: string } | null>(null);
  const [form] = Form.useForm();

  const showModal = (tag?: { id: string, name: string }) => {
    if (tag) {
      setEditingTag(tag);
      form.setFieldsValue(tag);
    } else {
      setEditingTag(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingTag) {
        updateTag(editingTag.id, values.name);
        message.success('Cập nhật thẻ thành công');
      } else {
        addTag(values.name);
        message.success('Thêm thẻ mới thành công');
      }
      setIsModalVisible(false);
    });
  };

  const columns = [
    { title: 'Tên thẻ', dataIndex: 'name', key: 'name' },
    { 
      title: 'Số bài viết', 
      key: 'usageCount',
      render: (_: any, record: any) => posts.filter(p => p.tags.includes(record.name)).length,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm title="Bạn có chắc chắn muốn xóa thẻ này?" onConfirm={() => deleteTag(record.id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Thêm thẻ mới
        </Button>
      </div>

      <Table columns={columns} dataSource={tags} rowKey="id" />

      <Modal
        title={editingTag ? 'Sửa thẻ' : 'Thêm thẻ mới'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên thẻ" rules={[{ required: true, message: 'Vui lòng nhập tên thẻ' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default TagManagement;
