import React, { useState, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Table, Button, Card, Space, Tag, Modal, Form, Input, InputNumber, Select, Popconfirm, message, Slider, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { Product } from '@/models/product';

const { Option } = Select;

const ProductManagement: React.FC = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useModel('product');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();

    // Filter & Search States
    const [searchText, setSearchText] = useState('');
    const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
    const [filterPriceRange, setFilterPriceRange] = useState<[number, number]>([0, 100000000]);
    const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

    const categories = Array.from(new Set(products.map(p => p.category)));

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: Product) => {
        setEditingProduct(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (id: number) => {
        deleteProduct(id);
        message.success('Đã xóa sản phẩm');
    };

    const handleOk = () => {
        form.validateFields().then(values => {
            if (editingProduct) {
                updateProduct(editingProduct.id, values);
                message.success('Cập nhật thành công');
            } else {
                addProduct(values);
                message.success('Thêm mới thành công');
            }
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const getStatus = (quantity: number) => {
        if (quantity === 0) return { color: 'red', text: 'Hết hàng' };
        if (quantity <= 10) return { color: 'orange', text: 'Sắp hết' };
        return { color: 'green', text: 'Còn hàng' };
    };

    const checkStatusFilter = (product: Product, statusFilter: string | undefined) => {
        if (!statusFilter) return true;
        const status = getStatus(product.quantity).text;
        return status === statusFilter;
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchName = product.name.toLowerCase().includes(searchText.toLowerCase());
            const matchCategory = filterCategory ? product.category === filterCategory : true;
            const matchPrice = product.price >= filterPriceRange[0] && product.price <= filterPriceRange[1];
            const matchStatus = checkStatusFilter(product, filterStatus);

            return matchName && matchCategory && matchPrice && matchStatus;
        });
    }, [products, searchText, filterCategory, filterPriceRange, filterStatus]);

    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (val: number) => val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
            sorter: (a: Product, b: Product) => a.price - b.price,
        },
        {
            title: 'Số lượng tồn kho',
            dataIndex: 'quantity',
            key: 'quantity',
            sorter: (a: Product, b: Product) => a.quantity - b.quantity,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_: any, record: Product) => {
                const status = getStatus(record.quantity);
                return <Tag color={status.color}>{status.text}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: Product) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
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
                                placeholder="Tìm kiếm theo tên"
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                            />
                        </Col>
                        <Col span={4}>
                            <Select
                                placeholder="Lọc theo danh mục"
                                style={{ width: '100%' }}
                                allowClear
                                onChange={setFilterCategory}
                            >
                                {categories.map(c => <Option key={c} value={c}>{c}</Option>)}
                            </Select>
                        </Col>
                        <Col span={4}>
                            <Select
                                placeholder="Lọc trạng thái"
                                style={{ width: '100%' }}
                                allowClear
                                onChange={setFilterStatus}
                            >
                                <Option value="Còn hàng">Còn hàng</Option>
                                <Option value="Sắp hết">Sắp hết</Option>
                                <Option value="Hết hàng">Hết hàng</Option>
                            </Select>
                        </Col>
                        <Col span={6}>
                            <span style={{ marginRight: 8 }}>Khoảng giá:</span>
                            <Slider
                                range
                                min={0}
                                max={100000000}
                                step={1000000}
                                defaultValue={[0, 100000000]}
                                onChange={(val: [number, number]) => setFilterPriceRange(val)}
                                tipFormatter={(val) => val?.toLocaleString('vi-VN')}
                            />
                        </Col>
                        <Col span={4} style={{ textAlign: 'right' }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                                Thêm mới
                            </Button>
                        </Col>
                    </Row>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredProducts}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            </Card>

            <Modal
                title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="price" label="Giá" rules={[{ required: true, type: 'number', min: 0 }]}>
                        <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value!.replace(/\$\s?|(,*)/g, '')} />
                    </Form.Item>
                    <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, type: 'number', min: 0 }]}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default ProductManagement;
