import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Form, Input, Button, Upload, message, Switch, Tabs, Row, Col, Avatar } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import axios from '@/utils/axios';

const ProfilePage: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(false);
  const user = initialState?.currentUser;

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
      const response = await axios.patch('/auth/profile', values);
      message.success('Cập nhật hồ sơ thành công');
      setInitialState((s: any) => ({ ...s, currentUser: response.data }));
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
    setLoading(false);
  };

  const handleChangePassword = async (values: any) => {
    if (values.new_password !== values.confirm_password) {
      return message.error('Mật khẩu xác nhận không khớp');
    }
    setLoading(true);
    try {
      await axios.patch('/auth/change-password', {
        old_password: values.old_password,
        new_password: values.new_password,
      });
      message.success('Đổi mật khẩu thành công');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
    setLoading(false);
  };

  const uploadProps = {
    name: 'file',
    action: '/api/users/avatar',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    onChange(info: any) {
      if (info.file.status === 'done') {
        message.success(`Ảnh đã được tải lên thành công`);
        setInitialState((s: any) => ({ ...s, currentUser: info.file.response.user }));
      } else if (info.file.status === 'error') {
        message.error(`Lỗi tải ảnh lên.`);
      }
    },
  };

  return (
    <PageContainer>
      <Row gutter={24}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={120} src={user?.avatar_url} icon={<UserOutlined />} />
              <h2 style={{ marginTop: 16 }}>{user?.full_name}</h2>
              <p>{user?.email}</p>
              <Upload {...uploadProps} showUploadList={false}>
                <Button icon={<UploadOutlined />}>Đổi ảnh đại diện</Button>
              </Upload>
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Card>
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Thông tin cá nhân" key="1">
                <Form layout="vertical" initialValues={user} onFinish={handleUpdateProfile}>
                  <Form.Item label="Họ và tên" name="full_name">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Số điện thoại" name="phone">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Nhận thông báo qua Email" name="email_notifications_enabled" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Lưu thay đổi
                  </Button>
                </Form>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Đổi mật khẩu" key="2">
                <Form layout="vertical" onFinish={handleChangePassword}>
                  <Form.Item label="Mật khẩu hiện tại" name="old_password" rules={[{ required: true }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item label="Mật khẩu mới" name="new_password" rules={[{ required: true, min: 6 }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item label="Xác nhận mật khẩu mới" name="confirm_password" rules={[{ required: true }]}>
                    <Input.Password />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Đổi mật khẩu
                  </Button>
                </Form>
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ProfilePage;
