import React, { useState, useRef, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Modal, Select, message, Space } from 'antd';
import { SwapOutlined, DeleteOutlined } from '@ant-design/icons';
import { Registration, Club } from '../data.d';
import { getRegistrations, getClubs, changeMemberClub, deleteRegistrations } from '../service';
import moment from 'moment';

const Members: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [targetClubId, setTargetClubId] = useState<string | undefined>(undefined);
  const actionRef = useRef<ActionType>();

  useEffect(() => {
    getClubs().then(setClubs);
  }, []);

  const handleTransfer = async () => {
    if (!targetClubId) {
      message.error('Vui lòng chọn câu lạc bộ muốn chuyển đến');
      return;
    }
    await changeMemberClub(selectedRowKeys as string[], targetClubId);
    message.success(`Đã chuyển ${selectedRowKeys.length} thành viên sang câu lạc bộ mới`);
    setIsTransferModalVisible(false);
    setSelectedRowKeys([]);
    setTargetClubId(undefined);
    actionRef.current?.reload();
  };

  const handleDelete = (ids: string[]) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa ${ids.length} thành viên được chọn?`,
      onOk: async () => {
        await deleteRegistrations(ids);
        message.success('Xóa thành viên thành công');
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      },
    });
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
      title: 'Ngày gia nhập',
      dataIndex: 'history',
      hideInSearch: true,
      render: (_, record) => {
        const approvedHistory = record.history.find(h => h.action === 'Approved');
        return approvedHistory ? moment(approvedHistory.timestamp).format('DD/MM/YYYY') : '-';
      }
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <Button key="transfer" type="link" icon={<SwapOutlined />} onClick={() => { setSelectedRowKeys([record.id]); setIsTransferModalVisible(true); }}>
          Đổi CLB
        </Button>,
        <Button key="delete" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete([record.id])}>
          Xóa
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer title="Quản lý thành viên Câu lạc bộ">
      <ProTable<Registration>
        headerTitle="Danh sách thành viên (Đã duyệt)"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        tableAlertOptionRender={() => (
          <Space size={16}>
            <Button type="primary" icon={<SwapOutlined />} onClick={() => setIsTransferModalVisible(true)}>Chuyển CLB cho các thành viên đã chọn</Button>
            <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDelete(selectedRowKeys as string[])}>Xóa các thành viên đã chọn</Button>
          </Space>
        )}
        request={async (params) => {
          const regs = await getRegistrations();
          let filtered = regs.filter(r => r.status === 'Approved');
          if (params.fullName) {
            filtered = filtered.filter((r) => r.fullName.toLowerCase().includes(params.fullName.toLowerCase()));
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
        title="Chuyển đổi Câu lạc bộ"
        visible={isTransferModalVisible}
        onOk={handleTransfer}
        onCancel={() => setIsTransferModalVisible(false)}
        okText="Xác nhận chuyển"
        cancelText="Hủy"
      >
        <p>Đang thực hiện chuyển đổi cho <strong>{selectedRowKeys.length}</strong> thành viên.</p>
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Chọn câu lạc bộ muốn chuyển đến:</label>
          <Select
            style={{ width: '100%' }}
            placeholder="Chọn câu lạc bộ"
            value={targetClubId}
            onChange={setTargetClubId}
          >
            {clubs.map(club => (
              <Select.Option key={club.id} value={club.id}>{club.name}</Select.Option>
            ))}
          </Select>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default Members;
