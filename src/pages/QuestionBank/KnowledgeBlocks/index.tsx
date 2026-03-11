import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { Button, message, Popconfirm, Modal, Form, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { KnowledgeBlock } from '../data';
import { getKnowledgeBlocks, addKnowledgeBlock, editKnowledgeBlock, removeKnowledgeBlock } from '@/services/QuestionBank/storage';
import { v4 as uuidv4 } from 'uuid';

const KnowledgeBlocks: React.FC = () => {
	const [data, setData] = useState<KnowledgeBlock[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [editingItem, setEditingItem] = useState<KnowledgeBlock | null>(null);
	const [form] = Form.useForm();

	const loadData = () => {
		const blocks = getKnowledgeBlocks();
		setData(blocks);
	};

	useEffect(() => {
		loadData();
	}, []);

	const handleAdd = () => {
		setEditingItem(null);
		form.resetFields();
		setIsModalVisible(true);
	};

	const handleEdit = (record: KnowledgeBlock) => {
		setEditingItem(record);
		form.setFieldsValue(record);
		setIsModalVisible(true);
	};

	const handleDelete = (id: string) => {
		removeKnowledgeBlock(id);
		message.success('Xóa khối kiến thức thành công');
		loadData();
	};

	const handleOk = () => {
		form.validateFields().then((values) => {
			if (editingItem) {
				editKnowledgeBlock(editingItem.id, { ...editingItem, ...values });
				message.success('Cập nhật thành công');
			} else {
				addKnowledgeBlock({ id: uuidv4(), ...values });
				message.success('Thêm mới thành công');
			}
			setIsModalVisible(false);
			loadData();
		});
	};

	const columns: ProColumns<KnowledgeBlock>[] = [
		{
			title: 'Tên khối kiến thức',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			key: 'description',
			search: false,
		},
		{
			title: 'Thao tác',
			valueType: 'option',
			key: 'option',
			render: (text, record) => [
				<Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>,
				<Popconfirm key="delete" title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)}>
					<Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
				</Popconfirm>,
			],
		},
	];

	return (
		<PageContainer title="Quản lý Khối kiến thức">
			<ProTable<KnowledgeBlock>
				columns={columns}
				dataSource={data}
				rowKey="id"
				search={{
					labelWidth: 'auto',
				}}
				pagination={{
					pageSize: 10,
				}}
				dateFormatter="string"
				headerTitle="Danh sách Khối kiến thức"
				toolBarRender={() => [
					<Button key="button" icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
						Thêm mới
					</Button>,
				]}
				onSubmit={(params) => {
					const keyword = params.name?.toLowerCase();
					if (keyword) {
						setData(getKnowledgeBlocks().filter(i => i.name.toLowerCase().includes(keyword)));
					} else {
						loadData();
					}
				}}
				onReset={() => loadData()}
			/>

			<Modal
				title={editingItem ? "Sửa khối kiến thức" : "Thêm khối kiến thức"}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={() => setIsModalVisible(false)}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="name"
						label="Tên khối kiến thức"
						rules={[{ required: true, message: 'Vui lòng nhập tên khối kiến thức!' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="description"
						label="Mô tả"
					>
						<Input.TextArea rows={4} />
					</Form.Item>
				</Form>
			</Modal>
		</PageContainer>
	);
};

export default KnowledgeBlocks;
