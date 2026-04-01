import React, { useState, useRef, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Modal, Input, message, Space, Tag, Drawer, List, Typography, Form } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, HistoryOutlined, PlusOutlined } from '@ant-design/icons';
import { Registration, RegistrationStatus, Club } from '../data.d';
import { getRegistrations, updateRegistrationStatus, getClubs, addRegistration } from '../service';
import RegistrationForm from '../components/RegistrationForm';
import moment from 'moment';

const { Paragraph, Text } = Typography;

const RegistrationList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'Approve' | 'Reject'>('Approve');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [viewingReg, setViewingReg] = useState<Registration | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const actionRef = useRef<ActionType>();
  const [addForm] = Form.useForm();

  useEffect(() => {
    getClubs().then(setClubs);
  }, []);

  const handleStatusChange = async (ids: string[], status: RegistrationStatus, note?: string) => {
    if (status === 'Rejected' && !note) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }
    await updateRegistrationStatus(ids, status, note);
    message.success(`${status === 'Approved' ? 'Duyệt' : 'Từ chối'} thành công`);
    setIsModalVisible(false);
    setSelectedRowKeys([]);
    setRejectionReason('');
    actionRef.current?.reload();
  };

  const handleOpenModal = (type: 'Approve' | 'Reject') => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một đơn');
      return;
    }
    setModalType(type);
    setIsModalVisible(true);
  };

  const handleAddRegistration = async () => {
    try {
      const values = await addForm.validateFields();
      await addRegistration(values);
      message.success('Thêm đơn đăng ký mới thành công');
      setIsAddModalVisible(false);
      addForm.resetFields();
      actionRef.current?.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const columns: ProColumns<Registration>[] = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      copyable: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
    },
    {
      title: 'Câu lạc bộ',
      dataIndex: 'clubId',
      valueType: 'select',
      valueEnum: clubs.reduce((acc, club) => {
        acc[club.id] = { text: club.name };
        return acc;
      }, {} as any),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      valueEnum: {
        Pending: { text: 'Chờ duyệt', status: 'Processing' },
        Approved: { text: 'Đã duyệt', status: 'Success' },
        Rejected: { text: 'Từ chối', status: 'Error' },
      },
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 250,
      render: (_, record) => [
        <Button key="view" type="link" icon={<EyeOutlined />} onClick={() => { setViewingReg(record); setIsHistoryVisible(true); }}>
          Chi tiết
        </Button>,
        record.status === 'Pending' && (
          <Button key="approve" type="link" icon={<CheckOutlined />} onClick={() => { setSelectedRowKeys([record.id]); handleOpenModal('Approve'); }}>
            Duyệt
          </Button>
        ),
        record.status === 'Pending' && (
          <Button key="reject" type="link" danger icon={<CloseOutlined />} onClick={() => { setSelectedRowKeys([record.id]); handleOpenModal('Reject'); }}>
            Từ chối
          </Button>
        ),
      ],
    },
  ];

  return (
    <PageContainer title="Quản lý đơn đăng ký">
      <ProTable<Registration>
        headerTitle="Danh sách đơn đăng ký"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>
            Thêm mới
          </Button>,
        ]}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
          <Space size={24}>
            <span>
              Đã chọn {selectedRowKeys.length} đơn
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                Bỏ chọn
              </a>
            </span>
          </Space>
        )}
        tableAlertOptionRender={() => (
          <Space size={16}>
            <Button type="primary" onClick={() => handleOpenModal('Approve')}>Duyệt các đơn đã chọn</Button>
            <Button type="primary" danger onClick={() => handleOpenModal('Reject')}>Từ chối các đơn đã chọn</Button>
          </Space>
        )}
        request={async (params) => {
          const regs = await getRegistrations();
          let filtered = regs;
          if (params.fullName) {
            filtered = filtered.filter((r) => r.fullName.toLowerCase().includes(params.fullName.toLowerCase()));
          }
          if (params.status) {
            filtered = filtered.filter((r) => r.status === params.status);
          }
          if (params.clubId) {
            filtered = filtered.filter((r) => r.clubId === params.clubId);
          }
          return {
            data: filtered,
            success: true,
          };
        }}
        columns={columns}
      />

      <Modal
        title={modalType === 'Approve' ? 'Xác nhận Duyệt' : 'Xác nhận Từ chối'}
        visible={isModalVisible}
        onOk={() => handleStatusChange(selectedRowKeys as string[], modalType === 'Approve' ? 'Approved' : 'Rejected', rejectionReason)}
        onCancel={() => setIsModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn {modalType === 'Approve' ? 'duyệt' : 'từ chối'} {selectedRowKeys.length} đơn đã chọn không?</p>
        {modalType === 'Reject' && (
          <Input.TextArea
            rows={4}
            placeholder="Nhập lý do từ chối (bắt buộc)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        )}
      </Modal>

      <Modal
        title="Thêm mới đơn đăng ký"
        visible={isAddModalVisible}
        onOk={handleAddRegistration}
        onCancel={() => setIsAddModalVisible(false)}
        width={700}
        destroyOnClose
      >
        <RegistrationForm form={addForm} clubs={clubs} />
      </Modal>

      <Drawer
        title="Chi tiết đơn đăng ký & Lịch sử"
        width={600}
        onClose={() => setIsHistoryVisible(false)}
        visible={isHistoryVisible}
      >
        {viewingReg && (
          <>
            <Paragraph>
              <Text strong>Họ tên:</Text> {viewingReg.fullName}
            </Paragraph>
            <Paragraph>
              <Text strong>Email:</Text> {viewingReg.email}
            </Paragraph>
            <Paragraph>
              <Text strong>SĐT:</Text> {viewingReg.phone}
            </Paragraph>
            <Paragraph>
              <Text strong>Giới tính:</Text> {viewingReg.gender}
            </Paragraph>
            <Paragraph>
              <Text strong>Địa chỉ:</Text> {viewingReg.address}
            </Paragraph>
            <Paragraph>
              <Text strong>Sở trường:</Text> {viewingReg.talents}
            </Paragraph>
            <Paragraph>
              <Text strong>Lý do đăng ký:</Text> {viewingReg.reason}
            </Paragraph>
            <Paragraph>
              <Text strong>Trạng thái:</Text> <Tag color={viewingReg.status === 'Approved' ? 'green' : viewingReg.status === 'Rejected' ? 'red' : 'blue'}>{viewingReg.status}</Tag>
            </Paragraph>

            <div style={{ marginTop: 24 }}>
              <Typography.Title level={5}><HistoryOutlined /> Lịch sử thao tác</Typography.Title>
              <List
                itemLayout="horizontal"
                dataSource={viewingReg.history}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${item.operator} - ${item.action}`}
                      description={
                        <>
                          <div>{moment(item.timestamp).format('HH:mm DD/MM/YYYY')}</div>
                          {item.note && <div style={{ color: 'red' }}>Lý do: {item.note}</div>}
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default RegistrationList;
