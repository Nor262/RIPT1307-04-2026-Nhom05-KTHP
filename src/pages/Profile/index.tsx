import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Form, Input, Button, Upload, message, Switch, Tabs, Row, Col, Avatar, Spin } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import axios from '@/utils/axios';

import { useAuthStore } from '@/stores/useAuthStore';

const ProfilePage: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const user = initialState?.currentUser;
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar_url);

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
      const response = await axios.patch('/auth/profile', values);
      const updatedUser = response.data?.data;
      if (updatedUser) {
        message.success('Cập nhật hồ sơ thành công');
        setInitialState((s: any) => ({ ...s, currentUser: updatedUser }));
        useAuthStore.setState({ user: updatedUser });
      } else {
        message.error('Không tìm thấy dữ liệu người dùng mới');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
    setLoading(false);
  };

  const handleChangePassword = async (values: any) => {
    if (values.new_password !== values.confirm_password) {
      message.error('Mật khẩu xác nhận không khớp');
      return;
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
    action: `${axios.defaults.baseURL}/users/avatar`,
    headers: {
      Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
    },
    onChange(info: any) {
      if (info.file.status === 'uploading') {
        setUploading(true);
      }
      if (info.file.status === 'done') {
        setUploading(false);
        const res = info.file.response;
        // Backend trả: { status: 'success', data: { message, avatar_url, user } }
        const newAvatarUrl = res?.data?.avatar_url || res?.data?.user?.avatar_url || res?.avatar_url;
        const updatedUser = res?.data?.user || res?.data;

        if (newAvatarUrl) {
          // Thêm timestamp để bust cache trình duyệt
          const cacheBustedUrl = `${newAvatarUrl}?t=${Date.now()}`;
          setAvatarUrl(cacheBustedUrl);
          
          // Cập nhật cả 2 store để header avatar cũng đổi
          const currentUser = useAuthStore.getState().user;
          const merged = { ...currentUser, ...updatedUser, avatar_url: cacheBustedUrl };
          setInitialState((s: any) => ({ ...s, currentUser: merged }));
          useAuthStore.setState({ user: merged });
          
          message.success('Ảnh đại diện đã được cập nhật');
        } else {
          message.warning('Tải lên thành công nhưng không nhận được URL ảnh mới');
        }
      } else if (info.file.status === 'error') {
        setUploading(false);
        message.error('Lỗi tải ảnh lên.');
      }
    },
  };

  return (
    <PageContainer>
      <Row gutter={24}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Spin spinning={uploading}>
                <Avatar size={120} src={avatarUrl || user?.avatar_url} icon={<UserOutlined />} />
              </Spin>
              <h2 style={{ marginTop: 16 }}>{user?.full_name}</h2>
              <p>{user?.email}</p>
              <Upload {...uploadProps} showUploadList={false} disabled={uploading}>
                <Button icon={<UploadOutlined />} loading={uploading} disabled={uploading}>Đổi ảnh đại diện</Button>
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
