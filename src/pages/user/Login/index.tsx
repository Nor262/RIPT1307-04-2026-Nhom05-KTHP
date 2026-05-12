import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { history, useIntl, Link, useModel } from '@umijs/max';
import { useAuthStore } from '@/stores/useAuthStore';
import axios from '@/utils/axios';
import Footer from '@/components/Footer';
import styles from './index.less';

const Login: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const intl = useIntl();
  const [form] = Form.useForm();
  const loginAction = useAuthStore((state) => state.login);
  const { setInitialState } = useModel('@@initialState');

  const handleSubmit = async (values: any) => {
    console.log('Login values:', values);
    try {
      setSubmitting(true);
      const response = await axios.post('/auth/login', {
        identifier: values.identifier || values.email,
        password: values.password,
      });

      if (response?.data?.status === 'success' && response?.data?.data) {
        const { user, accessToken, refreshToken } = response.data.data;

        // 1. Lưu vào Zustand store (persist to localStorage)
        loginAction({ user, accessToken, refreshToken });

        // 2. Cập nhật trực tiếp initialState cho UmiJS access plugin
        //    Không cần gọi API lại, dùng user data đã có từ login response
        await setInitialState((prev: any) => ({
          ...prev,
          currentUser: user,
        }));

        message.success('Đăng nhập thành công');

        // 3. Dùng window.location để force full page reload
        //    Đảm bảo UmiJS re-evaluate tất cả access rules
        window.location.href = '/dashboard';
      }
    } catch (error) {
      // Axios interceptor đã handle message lỗi 400/401/500
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img alt="logo" className={styles.logo} src="/logo-full.svg" style={{ height: 44 }} />
              <span className={styles.title}>Quản lý Thiết bị</span>
            </div>
          </div>
          <div className={styles.desc}>Hệ thống Quản lý Mượn/Trả Thiết bị</div>
        </div>

        <div className={styles.main}>
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="identifier"
              rules={[
                { required: true, message: 'Vui lòng nhập Email hoặc Tên đăng nhập!' },
              ]}
            >
              <Input
                placeholder="Email hoặc Tên đăng nhập"
                prefix={<UserOutlined className={styles.prefixIcon} />}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
            >
              <Input.Password
                placeholder="Mật khẩu"
                prefix={<LockOutlined className={styles.prefixIcon} />}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={submitting}>
                Đăng nhập
              </Button>
            </Form.Item>
            <Form.Item>
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                Chưa có tài khoản? <Link to="/user/register">Đăng ký ngay</Link>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
      <div className="login-footer">
        <Footer />
      </div>
    </div>
  );
};

export default Login;
