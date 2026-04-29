import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space, Typography, Row, Col, message, Card } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { Order } from '@/models/order';

const { Option } = Select;
const { Text } = Typography;

export const MOCK_CUSTOMERS = [
    { id: 'KH001', name: 'Nguyễn Văn A', phone: '0912345678', address: '123 Nguyễn Huệ, Q1, TP.HCM' },
    { id: 'KH002', name: 'Trần Thị B', phone: '0987654321', address: '456 Lê Lợi, Q1, TP.HCM' },
    { id: 'KH003', name: 'Lê Văn C', phone: '0909090909', address: '789 Trần Hưng Đạo, Q5, TP.HCM' },
];

interface OrderFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    initialValues?: Order | null;
}

const CreateOrder: React.FC<OrderFormProps> = ({ visible, onCancel, onSuccess, initialValues }) => {
    const [form] = Form.useForm();
    const { products, decreaseStock, returnStock } = useModel('product');
    const { orders, addOrder, updateOrder } = useModel('order');
    const [totalAmount, setTotalAmount] = useState(0);

    const isEdit = !!initialValues;

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    customerId: MOCK_CUSTOMERS.find(c => c.phone === initialValues.phone)?.id || '',
                });
                setTotalAmount(initialValues.totalAmount);
            } else {
                form.resetFields();
                form.setFieldsValue({ products: [{}], status: 'Chờ xác nhận' });
                setTotalAmount(0);
            }
        }
    }, [visible, initialValues, form]);

    const calculateTotal = (values: any) => {
        const selectedProducts = values.products || [];
        let total = 0;
        selectedProducts.forEach((item: any) => {
            if (item?.productId && item?.quantity) {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    total += product.price * item.quantity;
                }
            }
        });
        setTotalAmount(total);
    };

    const handleValuesChange = (changedValues: any, allValues: any) => {
        if (changedValues.products) {
            calculateTotal(allValues);
        }
        if (changedValues.customerId) {
            const customer = MOCK_CUSTOMERS.find(c => c.id === changedValues.customerId);
            if (customer) {
                form.setFieldsValue({
                    customerName: customer.name,
                    phone: customer.phone,
                    address: customer.address,
                });
            }
        }
    };

    const validateOrderId = (_: any, value: string) => {
        if (!value) return Promise.resolve();
        const existingOrder = orders.find(o => o.id === value);
        if (existingOrder && (!isEdit || existingOrder.id !== initialValues?.id)) {
            return Promise.reject(new Error('Mã đơn hàng đã tồn tại'));
        }
        return Promise.resolve();
    };

    const onFinish = (values: any) => {
        const orderProducts = values.products.map((item: any) => {
            const product = products.find(p => p.id === item.productId);
            return {
                productId: item.productId,
                productName: product?.name,
                quantity: item.quantity,
                price: product?.price,
            };
        });

        const orderData = {
            id: values.id,
            customerName: values.customerName,
            phone: values.phone,
            address: values.address,
            products: orderProducts,
            totalAmount: totalAmount,
            status: values.status,
        };

        if (isEdit) {
            if (values.status === 'Hoàn thành' && initialValues?.status !== 'Hoàn thành') {
                orderProducts.forEach((item: any) => {
                    decreaseStock(item.productId, item.quantity);
                });
            } else if (values.status !== 'Hoàn thành' && initialValues?.status === 'Hoàn thành') {
                orderProducts.forEach((item: any) => {
                    returnStock(item.productId, item.quantity);
                });
            }
            updateOrder({ ...initialValues, ...orderData } as Order);
            message.success('Cập nhật đơn hàng thành công');
        } else {
            if (values.status === 'Hoàn thành') {
                orderProducts.forEach((item: any) => {
                    decreaseStock(item.productId, item.quantity);
                });
            }
            addOrder(orderData as any);
            message.success('Tạo đơn hàng thành công');
        }

        form.resetFields();
        setTotalAmount(0);
        onSuccess();
    };

    return (
        <Modal
            title={isEdit ? "Chỉnh sửa đơn hàng" : "Tạo đơn hàng mới"}
            visible={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
            width={800}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={handleValuesChange}
            >
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="id"
                            label="Mã đơn hàng"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã ĐH' },
                                { validator: validateOrderId }
                            ]}
                        >
                            <Input disabled={isEdit} placeholder="VD: DH001" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="customerId"
                            label="Khách hàng"
                            rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
                        >
                            <Select placeholder="Chọn khách hàng">
                                {MOCK_CUSTOMERS.map(c => (
                                    <Option key={c.id} value={c.id}>
                                        {c.name} - {c.phone}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                        >
                            <Select placeholder="Chọn trạng thái">
                                <Option value="Chờ xác nhận">Chờ xác nhận</Option>
                                <Option value="Đang giao">Đang giao</Option>
                                <Option value="Hoàn thành">Hoàn thành</Option>
                                <Option value="Hủy" disabled={initialValues ? initialValues.status !== 'Chờ xác nhận' : true}>Hủy</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="customerName" hidden><Input /></Form.Item>
                <Form.Item name="phone" hidden><Input /></Form.Item>
                <Form.Item name="address" hidden><Input /></Form.Item>

                <Form.List name="products">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, fieldKey, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'productId']}
                                        fieldKey={[fieldKey ?? name, 'productId']}
                                        rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                                        style={{ width: 300 }}
                                    >
                                        <Select placeholder="Chọn sản phẩm" showSearch optionFilterProp="children">
                                            {products.map(p => (
                                                <Option key={`${p.id}`} value={p.id} disabled={p.quantity === 0}>
                                                    {p.name} (Tồn: {p.quantity}, Giá: {p.price.toLocaleString()})
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'quantity']}
                                        fieldKey={[fieldKey ?? name, 'quantity']}
                                        dependencies={[['products', name, 'productId']]}
                                        rules={[
                                            { required: true, message: 'Nhập SL' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    const productId = getFieldValue(['products', name, 'productId']);
                                                    const product = products.find(p => p.id === productId);
                                                    if (!value || !product) return Promise.resolve();
                                                    if (value > product.quantity) {
                                                        return Promise.reject(new Error(`Tối đa ${product.quantity}`));
                                                    }
                                                    return Promise.resolve();
                                                },
                                            }),
                                        ]}
                                    >
                                        <InputNumber min={1} placeholder="SL" />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Thêm sản phẩm
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Card>
                    <Row justify="end">
                        <Text strong style={{ fontSize: 18 }}>
                            Tổng tiền: {totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </Text>
                    </Row>
                </Card>
            </Form>
        </Modal>
    );
};

export default CreateOrder;
