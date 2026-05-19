import React, { useRef, useState } from 'react';
import { Button, message, Tag, Popconfirm } from 'antd';
import type { FormInstance } from 'antd';
import { PlusOutlined, EditOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { getUsers, createUser, updateUser, toggleUserStatus } from '@/services/api';

type UserItem = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'storekeeper' | 'borrower';
  is_active: boolean;
  created_at: string;
  penalty_points: number;
};

const roleMap = {
  admin: { text: 'Quản trị viên', color: 'red' },
  storekeeper: { text: 'Quản lý kho', color: 'blue' },
  borrower: { text: 'Người mượn', color: 'green' },
};

const UserManagement: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const searchTimeoutRef = useRef<any>();
  const [currentRow, setCurrentRow] = useState<UserItem | undefined>();
  const [modalVisible, setModalVisible] = useState(false);

  const columns: ProColumns<UserItem>[] = [
    {
      title: 'STT',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'full_name',
      ellipsis: true,
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      copyable: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      valueType: 'select',
      valueEnum: {
        admin: { text: 'Quản trị viên' },
        storekeeper: { text: 'Quản lý kho' },
        borrower: { text: 'Người mượn' },
      },
      render: (_, record) => (
        <Tag color={roleMap[record.role]?.color || 'default'}>
          {roleMap[record.role]?.text || record.role}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      valueType: 'select',
      valueEnum: {
        true: { text: 'Hoạt động', status: 'Success' },
        false: { text: 'Đã khóa', status: 'Error' },
      },
      render: (_, record) => (
        <Tag color={record.is_active ? 'success' : 'error'}>
          {record.is_active ? 'Hoạt động' : 'Đã khóa'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: 'Điểm phạt',
      dataIndex: 'penalty_points',
      hideInSearch: true,
      render: (_, record) => (
        <span style={{ color: record.penalty_points > 0 ? 'red' : 'inherit', fontWeight: record.penalty_points > 0 ? 'bold' : 'normal' }}>
          {record.penalty_points || 0}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 200,
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            setModalVisible(true);
          }}
        >
          <EditOutlined /> Sửa
        </a>,
        <Popconfirm
          key="toggle"
          title={record.is_active ? 'Khóa tài khoản này?' : 'Kích hoạt lại tài khoản?'}
          onConfirm={async () => {
            await toggleUserStatus(record.id, !record.is_active);
            message.success(record.is_active ? 'Đã khóa tài khoản' : 'Đã kích hoạt tài khoản');
            actionRef.current?.reload();
          }}
        >
          <a style={{ color: record.is_active ? '#c00c0c' : '#52c41a' }}>
            {record.is_active ? <><LockOutlined /> Khóa</> : <><UnlockOutlined /> Mở khóa</>}
          </a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <ProTable<UserItem>
        headerTitle="Quản lý Người dùng"
        actionRef={actionRef}
        formRef={formRef}
        form={{
          onValuesChange: () => {
            if (searchTimeoutRef.current) {
              clearTimeout(searchTimeoutRef.current);
            }
            searchTimeoutRef.current = setTimeout(() => {
              formRef.current?.submit();
            }, 100);
          },
        }}
        rowKey="id"
        search={{
          labelWidth: 120,
          collapseRender: (collapsed, showCollapseButton) => {
            if (!showCollapseButton) return null;
            return (
              <span style={{ color: '#c00c0c', cursor: 'pointer' }}>
                {collapsed ? (
                  <>Mở rộng <PlusOutlined style={{ fontSize: 12 }} /></>
                ) : (
                  <>Thu gọn <PlusOutlined style={{ transform: 'rotate(45deg)', fontSize: 12 }} /></>
                )}
              </span>
            );
          },
          optionRender: (searchConfig, formProps, dom) => [
            <Button
              key="reset"
              onClick={() => {
                formProps.form?.resetFields();
                formProps.form?.submit();
              }}
              style={{ color: '#c00c0c', borderColor: '#c00c0c' }}
            >
              Làm lại
            </Button>,
            <Button
              key="search"
              type="primary"
              onClick={() => formProps.form?.submit()}
              style={{ backgroundColor: '#c00c0c', borderColor: '#c00c0c', color: '#fff' }}
            >
              Tìm ngay
            </Button>,
          ],
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="create"
            style={{ backgroundColor: '#c00c0c', borderColor: '#c00c0c' }}
            onClick={() => {
              setCurrentRow(undefined);
              setModalVisible(true);
            }}
          >
            <PlusOutlined /> Thêm người dùng
          </Button>,
        ]}
        request={async (params) => {
          const res = await getUsers(params);
          const data = res.data?.data;
          const list = data?.items || data?.result || data || [];

          const filteredList = list.filter((item: UserItem) => {
            if (params.full_name && !item.full_name?.toLowerCase().includes(params.full_name.toLowerCase())) {
              return false;
            }
            if (params.username && !item.username?.toLowerCase().includes(params.username.toLowerCase())) {
              return false;
            }
            if (params.email && !item.email?.toLowerCase().includes(params.email.toLowerCase())) {
              return false;
            }
            if (params.role && item.role !== params.role) {
              return false;
            }
            if (params.is_active !== undefined) {
              const isActiveStr = String(item.is_active);
              if (isActiveStr !== String(params.is_active)) {
                return false;
              }
            }
            return true;
          });

          return {
            data: filteredList,
            success: true,
            total: filteredList.length,
          };
        }}
        columns={columns}
      />

      <ModalForm
        title={currentRow ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
        visible={modalVisible}
        onVisibleChange={setModalVisible}
        initialValues={currentRow}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (currentRow) {
            await updateUser(currentRow.id, values);
            message.success('Cập nhật thành công');
          } else {
            await createUser(values);
            message.success('Thêm mới thành công');
          }
          setModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name="full_name" label="Họ và tên" rules={[{ required: true }]} />
        <ProFormText name="username" label="Tên đăng nhập" rules={[{ required: true }]} disabled={!!currentRow} />
        <ProFormText name="email" label="Email" rules={[{ required: true, type: 'email' }]} />
        {!currentRow && (
          <ProFormText.Password name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]} />
        )}
        <ProFormSelect
          name="role"
          label="Vai trò"
          rules={[{ required: true }]}
          options={[
            { label: 'Quản trị viên', value: 'admin' },
            { label: 'Quản lý kho', value: 'storekeeper' },
            { label: 'Người mượn', value: 'borrower' },
          ]}
        />
      </ModalForm>
    </div>
  );
};

export default UserManagement;
