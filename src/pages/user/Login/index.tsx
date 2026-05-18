import React, { useState } from 'react';
import { Button, Form, Input, message, Modal } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { history, useIntl, Link, useModel } from '@umijs/max';
import { useAuthStore } from '@/stores/useAuthStore';
import axios from '@/utils/axios';
import Footer from '@/components/Footer';
import OtpInput from '@/components/OtpInput';
import styles from './index.less';

const Login: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const intl = useIntl();
  const [form] = Form.useForm();
  const loginAction = useAuthStore((state) => state.login);
  const { setInitialState } = useModel('@@initialState');

  // Forgot password modal state
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!forgotEmail.trim()) {
      message.error('Vui lòng nhập Email!');
      return;
    }
    setForgotLoading(true);
    try {
      await axios.post('/auth/forgot-password', { email: forgotEmail });
      message.success('Mã OTP đã được gửi về Email của bạn!');
      setForgotStep(2);
    } catch (err) {
      // Axios interceptor handles showing standard error notification
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotOtp.trim() || forgotOtp.length < 6) {
      message.error('Vui lòng nhập đủ mã OTP 6 số!');
      return;
    }
    if (!forgotPassword.trim()) {
      message.error('Vui lòng nhập mật khẩu mới!');
      return;
    }
    setForgotLoading(true);
    try {
      await axios.post('/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        new_password: forgotPassword,
      });
      message.success('Đặt lại mật khẩu thành công! Hãy đăng nhập lại.');
      setForgotPasswordVisible(false);
      setForgotStep(1);
      setForgotEmail('');
      setForgotOtp('');
      setForgotPassword('');
    } catch (err) {
      // Handled by Axios interceptor
    } finally {
      setForgotLoading(false);
    }
  };

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

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <Link to="/user/register" style={{ color: '#c00c0c', fontWeight: 600 }}>Đăng ký tài khoản</Link>
              <a onClick={() => setForgotPasswordVisible(true)} style={{ color: '#c00c0c', fontWeight: 600 }}>Quên mật khẩu?</a>
            </div>

            <Form.Item style={{ marginBottom: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                style={{ borderRadius: 8, height: 46, fontSize: '16px', fontWeight: 600, background: 'linear-gradient(135deg, #c00c0c 0%, #8b0000 100%)', border: 'none' }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <Modal
            title={
              <div style={{ textAlign: 'center', width: '100%', borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
                <span style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>
                  Khôi phục mật khẩu
                </span>
              </div>
            }
            open={forgotPasswordVisible}
            onCancel={() => {
              setForgotPasswordVisible(false);
              setForgotStep(1);
              setForgotEmail('');
              setForgotOtp('');
              setForgotPassword('');
            }}
            footer={null}
            destroyOnClose
            centered
            width={420}
            bodyStyle={{ padding: '24px 8px 12px 8px' }}
          >
            <div>
              {forgotStep === 1 ? (
                <div>
                  <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: 24, textAlign: 'center' }}>
                    Vui lòng nhập địa chỉ email của bạn. Chúng tôi sẽ gửi mã OTP xác minh gồm 6 số để bạn thiết lập lại mật khẩu.
                  </p>
                  <div style={{ marginBottom: 24 }}>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: '13px', color: '#475569', marginBottom: 8 }}>
                      Email tài khoản
                    </span>
                    <Input
                      size="large"
                      placeholder="username@student.ptit.edu.vn"
                      prefix={<UserOutlined style={{ color: '#94a3b8', marginRight: 4 }} />}
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      style={{ borderRadius: 8, height: 46 }}
                      autoComplete="off"
                    />
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    block
                    loading={forgotLoading}
                    onClick={handleSendOtp}
                    style={{ borderRadius: 8, height: 46, fontSize: '15px', fontWeight: 600, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', border: 'none' }}
                  >
                    Gửi mã xác nhận
                  </Button>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: 20, textAlign: 'center' }}>
                    Mã xác nhận đã được gửi về <strong style={{ color: '#0f172a' }}>{forgotEmail}</strong>. Vui lòng nhập mã OTP để tiếp tục.
                  </p>
                  <div style={{ marginBottom: 24, textAlign: 'center' }}>
                    <span style={{ display: 'block', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#475569', marginBottom: 8 }}>
                      Mã xác nhận (OTP)
                    </span>
                    <OtpInput
                      length={6}
                      value={forgotOtp}
                      onChange={setForgotOtp}
                    />
                  </div>
                  <div style={{ marginBottom: 28 }}>
                    <span style={{ display: 'block', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#475569', marginBottom: 8 }}>
                      Mật khẩu mới
                    </span>
                    <Input.Password
                      size="large"
                      placeholder="••••••••"
                      prefix={<LockOutlined style={{ color: '#94a3b8', marginRight: 4 }} />}
                      value={forgotPassword}
                      onChange={(e) => setForgotPassword(e.target.value)}
                      style={{ borderRadius: 8, height: 46 }}
                      autoComplete="new-password"
                    />
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    block
                    loading={forgotLoading}
                    onClick={handleResetPassword}
                    style={{ borderRadius: 8, height: 46, fontSize: '15px', fontWeight: 600, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', border: 'none', marginBottom: 12 }}
                  >
                    Đặt lại mật khẩu
                  </Button>
                  <Button
                    type="link"
                    block
                    onClick={() => setForgotStep(1)}
                    style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}
                  >
                    Quay lại nhập Email
                  </Button>
                </div>
              )}
            </div>
          </Modal>
        </div>
      </div>
      <div className="login-footer">
        <Footer />
      </div>
    </div>
  );
};

export default Login;
