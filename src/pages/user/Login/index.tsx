import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { history, useIntl, Link, useModel } from '@umijs/max';
import { useAuthStore } from '@/stores/useAuthStore';
import axios from '@/utils/axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Footer from '@/components/Footer';
import styles from './index.less';

const Login: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const intl = useIntl();
  const [form] = Form.useForm();
  const loginAction = useAuthStore((state) => state.login);
  const { setInitialState } = useModel('@@initialState');

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      const response = await axios.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      if (response?.data?.status === 'success' && response?.data?.data) {
        const { user, accessToken, refreshToken } = response.data.data;

        // Cập nhật Zustand store
        loginAction({ user, accessToken, refreshToken });

        // Cập nhật initialState của UmiJS để access plugin nhận biết role ngay lập tức
        await setInitialState((prevState: any) => ({
          ...prevState,
          currentUser: user,
        }));

        message.success('Đăng nhập thành công');
        history.replace('/dashboard');
      }
    } catch (error) {
      // Axios interceptor đã handle message lỗi 400/401/500
      setSubmitting(false);
    }
  };

  // Hàm xử lý khi đăng nhập Google thành công và gửi token lên Backend NestJS
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setSubmitting(true);
      const response = await axios.post('/auth/google', {
        token: credentialResponse.credential,
      });

      if (response?.data?.status === 'success' && response?.data?.data) {
        const { user, access_token } = response.data.data;

        // THÊM: Đồng bộ thông tin user và token vào Zustand Store của hệ thống
        loginAction({
          user,
          accessToken: access_token,
          refreshToken: access_token
        });

        message.success('Đăng nhập bằng Google thành công!');
        history.replace('/dashboard');
      }
    } catch (error) {
      setSubmitting(false);
    }
  };

  return (
    // clientId sẽ gắn vào link id của google cloud console của người dev hoặc công ty
    <GoogleOAuthProvider clientId="612309700754-ib1shrs5nn00cgesh8coto8ba00856iv.apps.googleusercontent.com">
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
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập Email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input
                  placeholder="Email đăng nhập"
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

                {/*Khối hiển thị nút bấm đăng nhập Google chuẩn của thư viện */}
                <div style={{ marginTop: "12px" }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => message.error('Đăng nhập bằng Google thất bại')}
                    useOneTap
                  />
                </div>

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
    </GoogleOAuthProvider>
  );
};

export default Login;
