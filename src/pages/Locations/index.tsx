import React, { useRef, useState } from 'react';
import { Button, message, Popconfirm, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { getLocations, createLocation, updateLocation, deleteLocation, getUsers } from '@/services/api';

export type LocationItem = {
  id: number;
  name: string;
  address?: string;
  manager?: { id: number; full_name: string };
};

const LocationList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<LocationItem | undefined>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  const columns: ProColumns<LocationItem>[] = [
    {
      title: 'Tên vị trí kho',
      dataIndex: 'name',
      rules: [{ required: true }],
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
    },
    {
      title: 'Người quản lý',
      dataIndex: ['manager', 'full_name'],
      hideInForm: true,
    },
    {
      title: 'Thao tác',
      dataIndex: 'option',
      valueType: 'option',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => {
                setCurrentRow(record);
                handleModalVisible(true);
              }}
              style={{ background: '#f0f5ff' }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa vị trí này?"
            onConfirm={async () => {
              await deleteLocation(record.id);
              message.success('Đã xóa');
              actionRef.current?.reload();
            }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger shape="circle" icon={<DeleteOutlined />} style={{ background: '#fef2f2' }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <ProTable<LocationItem>
        headerTitle="Danh sách vị trí kho"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            danger
            key="primary"
            onClick={() => {
              setCurrentRow(undefined);
              handleModalVisible(true);
            }}
          >
            <PlusOutlined /> Thêm mới
          </Button>,
        ]}
        request={async (params) => {
          const res = await getLocations(params);
          return {
            data: res.data?.data || [],
            success: true,
          };
        }}
        columns={columns}
      />

      <ModalForm
        title={currentRow ? 'Cập nhật vị trí' : 'Thêm vị trí mới'}
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        initialValues={currentRow ? { ...currentRow, manager_id: currentRow.manager?.id } : undefined}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (value) => {
          if (currentRow) {
            await updateLocation(currentRow.id, value);
            message.success('Cập nhật thành công');
          } else {
            await createLocation(value);
            message.success('Thêm mới thành công');
          }
          handleModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name="name" label="Tên vị trí/kho" rules={[{ required: true }]} />
        <ProFormText name="address" label="Địa chỉ cụ thể" />
        <ProFormSelect
          name="manager_id"
          label="Người phụ trách"
          request={async () => {
            const res = await getUsers();
            const users = res.data?.data || [];
            return users.map((u: any) => ({ label: u.full_name, value: u.id }));
          }}
        />
      </ModalForm>
    </div>
  );
};

export default LocationList;
