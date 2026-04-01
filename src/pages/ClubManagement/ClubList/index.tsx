import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Modal, Form, Input, DatePicker, Switch, message, Avatar, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { Club, Registration } from '../data.d';
import { getClubs, addClub, updateClub, deleteClub, getRegistrations, addRegistration } from '../service';
import TinyEditor from '@/components/TinyEditor';
import RegistrationForm from '../components/RegistrationForm';
import moment from 'moment';

const ClubList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [isRegModalVisible, setIsRegModalVisible] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [clubMembers, setClubMembers] = useState<Registration[]>([]);
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [regForm] = Form.useForm();

  const handleOpenModal = (club?: Club) => {
    if (club) {
      setEditingClub(club);
      form.setFieldsValue({
        ...club,
        foundedDate: club.foundedDate ? moment(club.foundedDate) : null,
      });
    } else {
      setEditingClub(null);
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const clubData = {
        ...values,
        foundedDate: values.foundedDate ? values.foundedDate.toISOString() : null,
      };

      if (editingClub) {
        await updateClub(editingClub.id, clubData);
        message.success('Cập nhật câu lạc bộ thành công');
      } else {
        await addClub(clubData);
        message.success('Thêm mới câu lạc bộ thành công');
      }
      setIsModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa câu lạc bộ này không?',
      onOk: async () => {
        await deleteClub(id);
        message.success('Xóa câu lạc bộ thành công');
        actionRef.current?.reload();
      },
    });
  };

  const handleViewMembers = async (club: Club) => {
    const regs = await getRegistrations();
    const members = regs.filter((r) => r.clubId === club.id && r.status === 'Approved');
    setClubMembers(members);
    setSelectedClub(club);
    setIsMemberModalVisible(true);
  };

  const handleAddRegistration = async () => {
    try {
      const values = await regForm.validateFields();
      await addRegistration(values);
      message.success('Gửi đơn đăng ký thành công');
      setIsRegModalVisible(false);
      regForm.resetFields();
      if (selectedClub) handleViewMembers(selectedClub); // Refresh member list
    } catch (error) {
      console.error(error);
    }
  };

  const columns: ProColumns<Club>[] = [
    {
      title: 'Ảnh đại diện',
      dataIndex: 'avatar',
      hideInSearch: true,
      render: (text) => <Avatar src={text as string} shape="square" size={64} icon={<TeamOutlined />} />,
    },
    {
      title: 'Tên câu lạc bộ',
      dataIndex: 'name',
      copyable: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Ngày thành lập',
      dataIndex: 'foundedDate',
      valueType: 'date',
      sorter: (a, b) => moment(a.foundedDate).unix() - moment(b.foundedDate).unix(),
    },
    {
      title: 'Chủ nhiệm CLB',
      dataIndex: 'chairman',
    },
    {
      title: 'Hoạt động',
      dataIndex: 'isActive',
      valueEnum: {
        true: { text: 'Có', status: 'Success' },
        false: { text: 'Không', status: 'Error' },
      },
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 250,
      render: (_, record) => [
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>
          Chỉnh sửa
        </Button>,
        <Button key="members" type="link" icon={<TeamOutlined />} onClick={() => handleViewMembers(record)}>
          Thành viên
        </Button>,
        <Button key="delete" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
          Xóa
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer title="Danh sách Câu lạc bộ">
      <ProTable<Club>
        headerTitle="Danh sách câu lạc bộ"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} type="primary" onClick={() => handleOpenModal()}>
            Thêm mới
          </Button>,
        ]}
        request={async (params) => {
          const clubs = await getClubs();
          let filtered = clubs;
          if (params.name) {
            filtered = filtered.filter((c) => c.name.toLowerCase().includes(params.name.toLowerCase()));
          }
          if (params.chairman) {
            filtered = filtered.filter((c) => c.chairman.toLowerCase().includes(params.chairman.toLowerCase()));
          }
          return {
            data: filtered,
            success: true,
          };
        }}
        columns={columns}
      />

      <Modal
        title={editingClub ? 'Chỉnh sửa Câu lạc bộ' : 'Thêm mới Câu lạc bộ'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên câu lạc bộ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="avatar" label="URL Ảnh đại diện">
            <Input placeholder="Nhập URL ảnh" />
          </Form.Item>
          <Form.Item name="foundedDate" label="Ngày thành lập" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="chairman" label="Chủ nhiệm CLB" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Hoạt động" valuePropName="checked">
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TinyEditor height={300} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Danh sách thành viên - ${selectedClub?.name}`}
        width={900}
        onCancel={() => setIsMemberModalVisible(false)}
        visible={isMemberModalVisible}
        footer={[
          <Button key="close" onClick={() => setIsMemberModalVisible(false)}>Đóng</Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => {
            regForm.setFieldsValue({ clubId: selectedClub?.id });
            setIsRegModalVisible(true);
          }}>
            Thêm đơn đăng ký
          </Button>
        ]}
      >
        <ProTable<Registration>
          dataSource={clubMembers}
          rowKey="id"
          search={false}
          toolBarRender={false}
          columns={[
            { title: 'Họ tên', dataIndex: 'fullName' },
            { title: 'Email', dataIndex: 'email' },
            { title: 'SĐT', dataIndex: 'phone' },
            { title: 'Địa chỉ', dataIndex: 'address' },
          ]}
        />
      </Modal>

      <Modal
        title="Thêm đơn đăng ký mới"
        visible={isRegModalVisible}
        onOk={handleAddRegistration}
        onCancel={() => setIsRegModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <RegistrationForm 
          form={regForm} 
          clubs={selectedClub ? [selectedClub] : []} 
          disabledClub={true}
        />
      </Modal>
    </PageContainer>
  );
};

export default ClubList;
