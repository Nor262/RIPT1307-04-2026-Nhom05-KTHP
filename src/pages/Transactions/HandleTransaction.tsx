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
    <div style={{ padding: '24px' }}>
      <Row gutter={24}>
        <Col span={24}>
          <Space style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
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
              <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)} buttonStyle="solid">
                <Radio.Button value="checkout" ><LogoutOutlined /> Bàn giao (Check-out)</Radio.Button>
                <Radio.Button value="checkin"><LoginOutlined /> Thu hồi (Check-in)</Radio.Button>
              </Radio.Group>
            </ConfigProvider>
          </Space>
          <Alert
            message="Chế độ Hybrid — Không cần máy quét chuyên dụng"
            description="Nhập mã Serial Number thủ công, tải ảnh QR hoặc dùng Mobile App quét mã để đồng bộ trạng thái lên đây."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        </Col>

        {/* Input Panel */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="1. Nhập mã thủ công (Manual Entry)" size="small">
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
                />
              </ConfigProvider>
            </Card>

            <Card title="2. Tải ảnh QR (File-to-Scan)" size="small">
              <Dragger
                beforeUpload={handleFileUpload}
                showUploadList={false}
                accept="image/*"
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">Kéo thả hoặc Click để chọn ảnh QR</p>
                <p className="ant-upload-hint">Hỗ trợ JPG, PNG. Ảnh phải chứa mã QR rõ ràng</p>
              </Dragger>
            </Card>

            <Card title="3. Mobile-to-Web Sync" size="small">
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <MobileOutlined style={{ fontSize: 36, color: isSyncing ? '#52c41a' : '#bfbfbf', marginBottom: 10 }} />
                <p>Tự động nhận tín hiệu từ Mobile App</p>
                <p style={{ fontSize: 12, color: '#888' }}>Polling mỗi 3 giây khi bật</p>
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
            title={
              <Space>
                <span>Bảng trạng thái Real-time</span>
                <Tag color={mode === 'checkout' ? 'blue' : 'green'}>
                  {mode === 'checkout' ? 'CHẾ ĐỘ BÀN GIAO' : 'CHẾ ĐỘ THU HỒI'}
                </Tag>
              </Space>
            }
            extra={
              <Space>
                {isSyncing && <Tag color="processing" icon={<SyncOutlined spin />}>Đang theo dõi...</Tag>}
                <Button size="small" danger onClick={clearAll} disabled={pendingItems.length === 0}>
                  Xóa tất cả
                </Button>
              </Space>
            }
          >
            <Table
              dataSource={pendingItems}
              columns={columns}
              rowKey="serial_number"
              pagination={false}
              locale={{ emptyText: 'Chưa có thiết bị nào trong hàng đợi. Hãy nhập mã hoặc tải ảnh QR ở bên trái.' }}
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
