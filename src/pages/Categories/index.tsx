import React, { useRef, useState } from 'react';
import { Button, message, Popconfirm, Space, Tooltip } from 'antd';
import type { FormInstance } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/api';

type CategoryItem = {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  _count?: { equipment: number };
};

const CategoryManagement: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const searchTimeoutRef = useRef<any>();
  const [currentRow, setCurrentRow] = useState<CategoryItem | undefined>();
  const [modalVisible, setModalVisible] = useState(false);

  const columns: ProColumns<CategoryItem>[] = [
    {
      title: 'STT',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      copyable: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'Số thiết bị',
      dataIndex: ['_count', 'equipment'],
      hideInSearch: true,
      render: (_, record) => record._count?.equipment ?? 0,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => {
                setCurrentRow(record);
                setModalVisible(true);
              }}
              style={{ background: '#f0f5ff' }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa danh mục này? (Danh mục phải không có thiết bị)"
            onConfirm={async () => {
              await deleteCategory(record.id);
              message.success('Xóa danh mục thành công');
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
    <div style={{ padding: 24 }}>
      <ProTable<CategoryItem>
        headerTitle="Quản lý Danh mục thiết bị"
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
              Tìm kiếm
            </Button>,
          ],
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            danger
            key="create"
            style={{ backgroundColor: '#c00c0c', borderColor: '#c00c0c' }}
            onClick={() => {
              setCurrentRow(undefined);
              setModalVisible(true);
            }}
          >
            <PlusOutlined /> Thêm danh mục
          </Button >,
        ]}
        request={async (params) => {
          const res = await getCategories(params);
          const data = res.data?.data;
          const list = Array.isArray(data) ? data : (data?.items || data?.result || []);

          const filteredList = list.filter((item: CategoryItem) => {
            if (params.name && !item.name?.toLowerCase().includes(params.name.toLowerCase())) {
              return false;
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
        title={currentRow ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
        visible={modalVisible}
        onVisibleChange={setModalVisible}
        initialValues={currentRow}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          if (currentRow) {
            await updateCategory(currentRow.id, values);
            message.success('Cập nhật thành công');
          } else {
            await createCategory(values);
            message.success('Thêm mới thành công');
          }
          setModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name="name" label="Tên danh mục" rules={[{ required: true }]} placeholder="VD: Laptop, Camera, Tripod..." />
        <ProFormTextArea name="description" label="Mô tả" placeholder="Mô tả chi tiết cho danh mục này" />
      </ModalForm>
    </div>
  );
};

export default CategoryManagement;
