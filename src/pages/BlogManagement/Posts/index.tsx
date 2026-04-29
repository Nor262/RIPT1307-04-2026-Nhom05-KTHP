import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { BlogPost } from '@/models/blog';

const { Option } = Select;

const PostManagement: React.FC = () => {
  const { posts, addPost, updatePost, deletePost } = useModel('blog');
  const { tags } = useModel('tag');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const showModal = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      form.setFieldsValue(post);
    } else {
      setEditingPost(null);
      form.resetFields();
      form.setFieldsValue({ status: 'Nháp' });
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingPost) {
        updatePost({ ...editingPost, ...values });
        message.success('Cập nhật bài viết thành công');
      } else {
        addPost({ ...values, author: 'Admin' });
        message.success('Thêm bài viết mới thành công');
      }
      setIsModalVisible(false);
    });
  };

  const columns = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Đã đăng' ? 'green' : 'orange'}>{status}</Tag>
      ),
    },
    {
      title: 'Thẻ',
      dataIndex: 'tags',
      key: 'tags',
      render: (tagsList: string[]) => (
        <>
          {tagsList.map(tag => <Tag key={tag}>{tag}</Tag>)}
        </>
      ),
    },
    { title: 'Lượt xem', dataIndex: 'views', key: 'views', sorter: (a: any, b: any) => a.views - b.views },
    { title: 'Ngày tạo', dataIndex: 'date', key: 'date', sorter: (a: any, b: any) => a.date.localeCompare(b.date) },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: BlogPost) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm title="Bạn có chắc chắn muốn xóa bài viết này?" onConfirm={() => deletePost(record.id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchText.toLowerCase()) && 
    (!filterStatus || p.status === filterStatus)
  );

  return (
    <PageContainer>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Input 
          placeholder="Tìm kiếm theo tiêu đề..." 
          style={{ width: 250 }} 
          onChange={e => setSearchText(e.target.value)}
        />
        <Select 
          placeholder="Lọc theo trạng thái" 
          style={{ width: 150 }} 
          allowClear 
          onChange={setFilterStatus}
        >
          <Option value="Nháp">Nháp</Option>
          <Option value="Đã đăng">Đã đăng</Option>
        </Select>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Thêm bài viết
        </Button>
      </div>

      <Table columns={columns} dataSource={filteredPosts} rowKey="id" />

      <Modal
        title={editingPost ? 'Sửa bài viết' : 'Thêm bài viết mới'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true, message: 'Vui lòng nhập slug' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="summary" label="Tóm tắt" rules={[{ required: true, message: 'Vui lòng nhập tóm tắt' }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="content" label="Nội dung (Markdown)" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
            <Input.TextArea rows={10} />
          </Form.Item>
          <Form.Item name="coverImage" label="Ảnh đại diện (URL)" rules={[{ required: true, message: 'Vui lòng nhập URL ảnh' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tags" label="Thẻ" rules={[{ required: true, message: 'Vui lòng chọn ít nhất một thẻ' }]}>
            <Select mode="multiple">
              {tags.map(t => <Option key={t.name} value={t.name}>{t.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="Nháp">Nháp</Option>
              <Option value="Đã đăng">Đã đăng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default PostManagement;
