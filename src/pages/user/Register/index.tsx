import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { history, Link } from '@umijs/max';
import axios from '@/utils/axios';
import Footer from '@/components/Footer';
import styles from '../Login/index.less';

const Register: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      const response = await axios.post('/auth/register', {
        username: values.username,
        email: values.email,
        password: values.password,
        full_name: values.full_name,
      });

      if (response?.data?.status === 'success') {
        message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        history.push('/user/login');
      }
    } catch (error) {
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
              <span className={styles.title}>Đăng ký</span>
            </div>
          </div>
          <div className={styles.desc}>Tạo tài khoản mới để sử dụng hệ thống</div>
        </div>

        <div className={styles.main}>
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
             <Form.Item
              name="full_name"
              rules={[{ required: true, message: 'Vui lòng nhập Họ và tên!' }]}
            >
              <Input
                placeholder="Họ và tên"
                prefix={<IdcardOutlined className={styles.prefixIcon} />}
                style={{ borderRadius: 8, height: 46 }}
              />
            </Form.Item>

            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập Tên đăng nhập!' }]}
            >
              <Input
                placeholder="Tên đăng nhập"
                prefix={<UserOutlined className={styles.prefixIcon} />}
                style={{ borderRadius: 8, height: 46 }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập Email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input
                placeholder="Email"
                prefix={<MailOutlined className={styles.prefixIcon} />}
                style={{ borderRadius: 8, height: 46 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập Mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password
                placeholder="Mật khẩu"
                prefix={<LockOutlined className={styles.prefixIcon} />}
                style={{ borderRadius: 8, height: 46 }}
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Xác nhận mật khẩu"
                prefix={<LockOutlined className={styles.prefixIcon} />}
                style={{ borderRadius: 8, height: 46 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                style={{ borderRadius: 8, height: 46, fontSize: '16px', fontWeight: 600, background: 'linear-gradient(135deg, #c00c0c 0%, #8b0000 100%)', border: 'none' }}
              >
                Đăng ký ngay
              </Button>
              <div style={{ marginTop: 16, textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                Đã có tài khoản? <Link to="/user/login" style={{ color: '#c00c0c', fontWeight: 600 }}>Đăng nhập ngay</Link>
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

export default Register;
