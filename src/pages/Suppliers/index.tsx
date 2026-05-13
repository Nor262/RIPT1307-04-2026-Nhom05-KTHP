import React, { useRef, useState } from 'react';
import { Button, message, Popconfirm, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/services/api';

export type SupplierItem = {
  id: number;
  name: string;
  contact_info?: string;
  address?: string;
  created_at?: string;
};

const SupplierList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<SupplierItem | undefined>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  const columns: ProColumns<SupplierItem>[] = [
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      copyable: true,
      ellipsis: true,
      formItemProps: {
        rules: [{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }],
      },
    },
    {
      title: 'Thông tin liên hệ',
      dataIndex: 'contact_info',
      ellipsis: true,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      dataIndex: 'option',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            handleModalVisible(true);
          }}
        >
          <EditOutlined /> Sửa
        </a>,
        <Popconfirm
          key="delete"
          title="Xóa nhà cung cấp này?"
          onConfirm={async () => {
            await deleteSupplier(record.id);
            message.success('Đã xóa');
            actionRef.current?.reload();
          }}
        >
          <a style={{ color: '#ff4d4f' }}><DeleteOutlined /> Xóa</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <ProTable<SupplierItem>
        headerTitle="Danh sách nhà cung cấp"
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
          const res = await getSuppliers(params);
          return {
            data: res.data?.data || [],
            success: true,
          };
        }}
        columns={columns}
      />

      <ModalForm
        title={currentRow ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'}
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        initialValues={currentRow}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (value) => {
          if (currentRow) {
            await updateSupplier(currentRow.id, value);
            message.success('Cập nhật thành công');
          } else {
            await createSupplier(value);
            message.success('Thêm mới thành công');
          }
          handleModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name="name" label="Tên nhà cung cấp" rules={[{ required: true }]} />
        <ProFormText name="contact_info" label="Thông tin liên hệ (SĐT/Email)" />
        <ProFormTextArea name="address" label="Địa chỉ" />
      </ModalForm>
    </div>
  );
};

export default SupplierList;
