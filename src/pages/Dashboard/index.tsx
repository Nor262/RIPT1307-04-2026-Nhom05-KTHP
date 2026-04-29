import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import { ShoppingOutlined, DollarOutlined, SolutionOutlined, GoldOutlined } from '@ant-design/icons';
import { useModel } from 'umi';

const Dashboard: React.FC = () => {
    const { products } = useModel('product');
    const { orders } = useModel('order');

    const totalProducts = products.length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'Hoàn thành');
    const revenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const statusCounts = orders.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <PageContainer>
            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng số sản phẩm"
                            value={totalProducts}
                            prefix={<GoldOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng giá trị tồn kho"
                            value={totalInventoryValue}
                            precision={0}
                            prefix={<DollarOutlined />}
                            suffix="VND"
                            formatter={(val: any) => val.toLocaleString('vi-VN')}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng số đơn hàng"
                            value={totalOrders}
                            prefix={<SolutionOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu (Đã hoàn thành)"
                            value={revenue}
                            precision={0}
                            prefix={<ShoppingOutlined />}
                            suffix="VND"
                            formatter={(val: any) => val.toLocaleString('vi-VN')}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={12}>
                    <Card title="Trạng thái đơn hàng">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <span>Chờ xử lý ({statusCounts['Chờ xử lý'] || 0})</span>
                                <Progress percent={Math.round(((statusCounts['Chờ xử lý'] || 0) / totalOrders) * 100)} status="active" strokeColor="orange" />
                            </div>
                            <div>
                                <span>Đang giao ({statusCounts['Đang giao'] || 0})</span>
                                <Progress percent={Math.round(((statusCounts['Đang giao'] || 0) / totalOrders) * 100)} status="active" strokeColor="blue" />
                            </div>
                            <div>
                                <span>Hoàn thành ({statusCounts['Hoàn thành'] || 0})</span>
                                <Progress percent={Math.round(((statusCounts['Hoàn thành'] || 0) / totalOrders) * 100)} status="success" strokeColor="green" />
                            </div>
                            <div>
                                <span>Đã hủy ({statusCounts['Đã hủy'] || 0})</span>
                                <Progress percent={Math.round(((statusCounts['Đã hủy'] || 0) / totalOrders) * 100)} status="exception" strokeColor="red" />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </PageContainer>
    );
};

export default Dashboard;
