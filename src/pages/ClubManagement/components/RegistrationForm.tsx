import React from 'react';
import { Form, Input, Select, Radio } from 'antd';
import { Club } from '../data.d';

interface RegistrationFormProps {
  form: any;
  clubs: Club[];
  initialValues?: any;
  disabledClub?: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ form, clubs, initialValues, disabledClub }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues || { gender: 'Male' }}
    >
      <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
        <Radio.Group>
          <Radio value="Male">Nam</Radio>
          <Radio value="Female">Nữ</Radio>
          <Radio value="Other">Khác</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item name="talents" label="Sở trường">
        <Input />
      </Form.Item>
      <Form.Item name="clubId" label="Câu lạc bộ" rules={[{ required: true, message: 'Vui lòng chọn câu lạc bộ' }]}>
        <Select disabled={disabledClub}>
          {clubs.map(club => (
            <Select.Option key={club.id} value={club.id}>{club.name}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="reason" label="Lý do đăng ký" rules={[{ required: true, message: 'Vui lòng nhập lý do đăng ký' }]}>
        <Input.TextArea rows={3} />
      </Form.Item>
    </Form>
  );
};

export default RegistrationForm;
