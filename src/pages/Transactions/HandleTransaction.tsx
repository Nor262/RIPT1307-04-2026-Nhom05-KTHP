import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Row,
  Col,
  Table,
  Tag,
  message,
  Upload,
  Space,
  Typography,
  Alert,
  Radio,
  Divider,
  ConfigProvider,
} from 'antd';
import {
  SearchOutlined,
  InboxOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  MobileOutlined,
  SwapOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { verifyItem, syncTransactionStatus } from '@/services/api';
import jsQR from 'jsqr';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const HandleTransaction: React.FC = () => {
  const { pendingItems, addPendingItem, removePendingItem, updateItemStatus, clearAll, isSyncing, setSyncing } = useTransactionStore();
  const [searchValue, setSearchValue] = useState('');
  const [mode, setMode] = useState<'checkout' | 'checkin'>('checkout');

  // Polling check status từ Backend cho Mobile-to-Web Sync
  useRequest(
    async () => {
      if (!isSyncing || pendingItems.length === 0) return;

      const pendingIds = pendingItems
        .filter(i => i.status === 'pending' || i.status === 'verifying')
        .map(i => i.transaction_id);

      if (pendingIds.length === 0) return;

      try {
        const response = await syncTransactionStatus({ transaction_ids: pendingIds });
        const updatedItems = response.data?.data || [];

        updatedItems.forEach((item: any) => {
          updateItemStatus(item.serial_number, item.status);
        });
      } catch (err) {
        console.error('Sync failed', err);
      }
    },
    {
      pollingInterval: 3000,
      pollingWhenHidden: false,
    }
  );

  const handleVerify = async (serial: string) => {
    if (!serial.trim()) return;
    try {
      const response = await verifyItem({ serial_number: serial.trim() });
      if (response.data?.status === 'success') {
        addPendingItem(response.data.data);
        setSearchValue('');
        message.success(`Đã thêm thiết bị: ${response.data.data.name}`);
      }
    } catch (err) {
      // Axios interceptor handles error display
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(image, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            handleVerify(code.data);
          } else {
            message.error('Không tìm thấy mã QR trong ảnh');
          }
        }
      };
      image.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    return false;
  };

  const columns = [
    {
      title: 'Thiết bị',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>SN: {record.serial_number}</Text>
        </Space>
      ),
    },
    {
      title: 'Mã giao dịch',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      render: (id: number) => <Tag>#{id}</Tag>,
    },
    {
      title: 'Trạng thái xử lý',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        switch (status) {
          case 'success': return <Tag color="success" icon={<CheckCircleOutlined />}>Thành công</Tag>;
          case 'verifying': return <Tag color="processing" icon={<SyncOutlined spin />}>Đang xác thực</Tag>;
          case 'failed': return <Tag color="error">Thất bại</Tag>;
          default: return <Tag color="default">Chờ tín hiệu...</Tag>;
        }
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removePendingItem(record.serial_number)}
          disabled={record.status === 'success'}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '32px 24px', backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 64px)' }}>
      <style>
        {`
          @keyframes syncPulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          .sync-active-icon {
            animation: syncPulse 2s infinite ease-in-out;
            color: #52c41a;
            filter: drop-shadow(0 0 8px rgba(82, 196, 26, 0.4));
          }
          .custom-dragger .ant-upload-drag {
            background-color: #ffffff !important;
            border: 2px dashed #d9d9d9 !important;
            border-radius: 12px !important;
            transition: all 0.3s;
          }
          .custom-dragger .ant-upload-drag:hover {
            border-color: #1677ff !important;
            background-color: #f0f5ff !important;
          }
        `}
      </style>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Space style={{ marginBottom: 20 }}>
            <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1f2937' }}>
              <SwapOutlined /> Xử lý Bàn giao / Thu hồi thiết bị
            </Title>
            <ConfigProvider
              theme={{
                components: {
                  Radio: {
                    colorPrimary: '#c00c0c',
                    colorPrimaryHover: '#ff7875',
                    colorPrimaryActive: '#d9363e',
                  },
                },
              }}
            >
              <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)} buttonStyle="solid" size="large" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 8, marginLeft: 16 }}>
                <Radio.Button value="checkout" style={{ borderRadius: '8px 0 0 8px', padding: '0 24px' }}><LogoutOutlined /> Bàn giao (Check-out)</Radio.Button>
                <Radio.Button value="checkin" style={{ borderRadius: '0 8px 8px 0', padding: '0 24px' }}><LoginOutlined /> Thu hồi (Check-in)</Radio.Button>
              </Radio.Group>
            </ConfigProvider>
          </Space>
          <Alert
            message={<Text strong style={{ fontSize: 15 }}>Chế độ Hybrid — Không cần máy quét chuyên dụng</Text>}
            description={<Text type="secondary">Nhập mã Serial Number thủ công, tải ảnh QR hoặc dùng Mobile App quét mã để đồng bộ trạng thái lên đây.</Text>}
            type="info"
            showIcon
            style={{ marginBottom: 24, borderRadius: 12, border: 'none', backgroundColor: '#e6f4ff', padding: '16px 24px' }}
          />
        </Col>

        {/* Input Panel */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card 
              title={<Text strong style={{ fontSize: 16 }}>1. Nhập mã thủ công</Text>} 
              bordered={false} 
              style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
            >
              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: '#c00c0c',
                  },
                  components: {
                    Input: {
                      colorPrimaryHover: '#ff7875',
                      controlOutline: 'rgba(255, 77, 79, 0.1)',
                    },
                    Button: {
                      colorPrimaryHover: '#ff7875',
                    }
                  },
                }}
              >
                <Input.Search
                  placeholder="Nhập Serial Number / SKU..."
                  allowClear
                  enterButton={<><SearchOutlined /> Xác thực</>}
                  size="large"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onSearch={handleVerify}
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.02))' }}
                />
              </ConfigProvider>
            </Card>

            <Card 
              title={<Text strong style={{ fontSize: 16 }}>2. Tải ảnh QR (File-to-Scan)</Text>} 
              bordered={false} 
              style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
            >
              <Dragger
                beforeUpload={handleFileUpload}
                showUploadList={false}
                accept="image/*"
                className="custom-dragger"
                style={{ padding: '20px 0' }}
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">Kéo thả hoặc Click để chọn ảnh QR</p>
                <p className="ant-upload-hint">Hỗ trợ JPG, PNG. Ảnh phải chứa mã QR rõ ràng</p>
              </Dragger>
            </Card>

            <Card 
              title={<Text strong style={{ fontSize: 16 }}>3. Mobile-to-Web Sync</Text>} 
              bordered={false} 
              style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
            >
              <div style={{ textAlign: 'center', padding: '16px 10px' }}>
                <MobileOutlined 
                  className={isSyncing ? 'sync-active-icon' : ''}
                  style={{ 
                    fontSize: 48, 
                    color: isSyncing ? '#52c41a' : '#d9d9d9', 
                    marginBottom: 16,
                    transition: 'all 0.3s ease'
                  }} 
                />
                <div style={{ marginBottom: 20 }}>
                  <Text strong style={{ display: 'block', fontSize: 15 }}>Tự động nhận tín hiệu từ Mobile App</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>Hệ thống tự động polling mỗi 3 giây</Text>
                </div>
                <Button
                  type={isSyncing ? 'primary' : 'default'}
                  danger={isSyncing}
                  onClick={() => setSyncing(!isSyncing)}
                  block
                  size="large"
                  icon={<SyncOutlined spin={isSyncing} />}
                >
                  {isSyncing ? 'Dừng đồng bộ' : 'Bắt đầu đồng bộ'}
                </Button>
              </div>
            </Card>
          </Space>
        </Col>

        {/* Status Board */}
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', height: '100%' }}
            headStyle={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}
            bodyStyle={{ padding: '24px' }}
            title={
              <Space size="middle">
                <Text strong style={{ fontSize: 18 }}>Bảng trạng thái Real-time</Text>
                <Tag color={mode === 'checkout' ? 'blue-inverse' : 'green-inverse'} style={{ borderRadius: 4, padding: '2px 8px' }}>
                  {mode === 'checkout' ? 'CHẾ ĐỘ BÀN GIAO' : 'CHẾ ĐỘ THU HỒI'}
                </Tag>
              </Space>
            }
            extra={
              <Space>
                {isSyncing && <Tag color="success" icon={<SyncOutlined spin />} style={{ border: 'none', background: '#f6ffed', padding: '4px 8px' }}>Đang lắng nghe...</Tag>}
                <Button type="text" danger onClick={clearAll} disabled={pendingItems.length === 0} icon={<DeleteOutlined />}>
                  Xóa danh sách
                </Button>
              </Space>
            }
          >
            <Table
              dataSource={pendingItems}
              columns={columns}
              rowKey="serial_number"
              pagination={false}
              locale={{ 
                emptyText: (
                  <div style={{ padding: '60px 0' }}>
                    <InboxOutlined style={{ fontSize: 56, color: '#e6e6e6', marginBottom: 16 }} />
                    <p style={{ fontSize: 16, color: '#8c8c8c', margin: 0, fontWeight: 500 }}>Chưa có thiết bị nào trong hàng đợi</p>
                    <p style={{ fontSize: 14, color: '#bfbfbf', marginTop: 8 }}>Vui lòng nhập mã thủ công, tải ảnh QR hoặc dùng Mobile App để bắt đầu.</p>
                  </div>
                ) 
              }}
            />

            {pendingItems.length > 0 && (
              <>
                <Divider />
                <div style={{ textAlign: 'right' }}>
                  <Space>
                    <Text type="secondary">
                      {pendingItems.filter(i => i.status === 'success').length}/{pendingItems.length} thành công
                    </Text>
                    <Button
                      type="primary"
                      size="large"
                      disabled={!pendingItems.some(i => i.status === 'success')}
                      onClick={() => {
                        message.success('Đã hoàn tất phiên làm việc!');
                        clearAll();
                      }}
                    >
                      Hoàn tất và Đóng phiên
                    </Button>
                  </Space>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HandleTransaction;
