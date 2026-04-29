import React, { useState, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Button, Card, Space, Tag, Modal, Select, Input, DatePicker, Row, Col, message, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { Order } from '@/models/order';
import CreateOrder from './CreateOrder';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderManagement: React.FC = () => {
    const { orders, updateOrderStatus } = useModel('order');

    const [formVisible, setFormVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
    const [filterDateRange, setFilterDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);

    const handleCancelOrder = (order: Order) => {
        if (order.status !== 'Chờ xác nhận') {
            message.error('Chỉ có thể hủy đơn hàng đang ở trạng thái Chờ xác nhận');
            return;
        }
        updateOrderStatus(order.id, 'Hủy');
        message.success(`Đã hủy đơn hàng ${order.id} thành công`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Chờ xác nhận': return 'orange';
            case 'Đang giao': return 'blue';
            case 'Hoàn thành': return 'green';
            case 'Hủy': return 'red';
            default: return 'default';
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchSearch = order.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
                order.id.toLowerCase().includes(searchText.toLowerCase());
            const matchStatus = filterStatus ? order.status === filterStatus : true;

            let matchDate = true;
            if (filterDateRange) {
                const orderDate = moment(order.createdAt);
                matchDate = orderDate.isBetween(filterDateRange[0], filterDateRange[1], 'day', '[]');
            }

            return matchSearch && matchStatus && matchDate;
        });
    }, [orders, searchText, filterStatus, filterDateRange]);

    const columns: any = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
        },
        {
            title: 'Tên khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
            align: 'center',
        },
        {
            title: 'Số sản phẩm',
            key: 'productCount',
            align: 'center',
            render: (_: any, record: Order) => record.products.reduce((sum, item) => sum + item.quantity, 0),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            align: 'center',
            render: (val: number) => val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
            sorter: (a: Order, b: Order) => a.totalAmount - b.totalAmount,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            sorter: (a: Order, b: Order) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 180,
            render: (_: any, record: Order) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedOrder(record);
                            setDetailVisible(true);
                        }}
                    />
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingOrder(record);
                            setFormVisible(true);
                        }}
                    />
                    {record.status === 'Chờ xác nhận' && (
                        <Popconfirm
                            title={<div style={{ minWidth: 250 }}>Bạn có chắc chắn muốn hủy đơn hàng này?</div>}
                            onConfirm={() => handleCancelOrder(record)}
                            okText="Đồng ý"
                            cancelText="Không"
                        >
                            <Button type="link" icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <PageContainer>
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Row gutter={[16, 16]}>
                        <Col span={6}>
                            <Input
                                placeholder="Tìm tên KH hoặc Mã ĐH"
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                            />
                        </Col>
                        <Col span={4}>
                            <Select
                                placeholder="Lọc trạng thái"
                                style={{ width: '100%' }}
                                allowClear
                                onChange={setFilterStatus}
                            >
                                <Option value="Chờ xác nhận">Chờ xác nhận</Option>
                                <Option value="Đang giao">Đang giao</Option>
                                <Option value="Hoàn thành">Hoàn thành</Option>
                                <Option value="Hủy">Hủy</Option>
                            </Select>
                        </Col>
                        <Col span={6}>
                            <RangePicker
                                style={{ width: '100%' }}
                                onChange={(dates) => setFilterDateRange(dates as any)}
                            />
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                                setEditingOrder(null);
                                setFormVisible(true);
                            }}>
                                Tạo đơn hàng
                            </Button>
                        </Col>
                    </Row>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    rowKey="id"
                />
            </Card>

            <CreateOrder
                visible={formVisible}
                onCancel={() => setFormVisible(false)}
                onSuccess={() => setFormVisible(false)}
                initialValues={editingOrder}
            />

            <Modal
                title="Chi tiết đơn hàng"
                visible={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={700}
            >
                {selectedOrder && (
                    <div>
                        <p><strong>Mã đơn hàng:</strong> {selectedOrder.id}</p>
                        <p><strong>Khách hàng:</strong> {selectedOrder.customerName} - {selectedOrder.phone}</p>
                        <p><strong>Địa chỉ:</strong> {selectedOrder.address}</p>
                        <p><strong>Ngày tạo:</strong> {selectedOrder.createdAt}</p>
                        <p><strong>Trạng thái:</strong> <Tag color={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Tag></p>

                        <Table
                            dataSource={selectedOrder.products}
                            rowKey="productId"
                            pagination={false}
                            columns={[
                                { title: 'Sản phẩm', dataIndex: 'productName', align: 'center' },
                                { title: 'Số lượng', dataIndex: 'quantity', align: 'center' },
                                { title: 'Đơn giá', dataIndex: 'price', align: 'center', render: (val: number) => val?.toLocaleString('vi-VN') },
                                { title: 'Thành tiền', align: 'center', render: (_: any, r: any) => (r.quantity * r.price)?.toLocaleString('vi-VN') },
                            ]}
                            summary={pageData => {
                                return (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={3} align="right"><strong>Tổng cộng:</strong></Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}>
                                            <strong>{selectedOrder.totalAmount?.toLocaleString('vi-VN')} VND</strong>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                );
                            }}
                        />
                    </div>
                )}
            </Modal>
        </PageContainer>
    );
};

export default OrderManagement;
