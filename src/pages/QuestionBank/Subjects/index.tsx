import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { Button, message, Popconfirm, Modal, Form, Input, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Subject } from '../data';
import { getSubjects, addSubject, editSubject, removeSubject } from '@/services/QuestionBank/storage';
import { v4 as uuidv4 } from 'uuid';

const Subjects: React.FC = () => {
	const [data, setData] = useState<Subject[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [editingItem, setEditingItem] = useState<Subject | null>(null);
	const [form] = Form.useForm();

	const loadData = () => {
		const subjects = getSubjects();
		setData(subjects);
	};

	useEffect(() => {
		loadData();
	}, []);

	const handleAdd = () => {
		setEditingItem(null);
		form.resetFields();
		setIsModalVisible(true);
	};

	const handleEdit = (record: Subject) => {
		setEditingItem(record);
		form.setFieldsValue(record);
		setIsModalVisible(true);
	};

	const handleDelete = (id: string) => {
		removeSubject(id);
		message.success('Xóa môn học thành công');
		loadData();
	};

	const handleOk = () => {
		form.validateFields().then((values) => {
			if (editingItem) {
				editSubject(editingItem.id, { ...editingItem, ...values });
				message.success('Cập nhật thành công');
			} else {
				addSubject({ id: uuidv4(), ...values });
				message.success('Thêm mới thành công');
			}
			setIsModalVisible(false);
			loadData();
		});
	};

	const columns: ProColumns<Subject>[] = [
		{
			title: 'Mã môn học',
			dataIndex: 'code',
			key: 'code',
		},
		{
			title: 'Tên môn học',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Số tín chỉ',
			dataIndex: 'credits',
			key: 'credits',
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
		<PageContainer title="Quản lý Môn học">
			<ProTable<Subject>
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
				headerTitle="Danh sách Môn học"
				toolBarRender={() => [
					<Button key="button" icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
						Thêm mới
					</Button>,
				]}
				onSubmit={(params) => {
					let filtered = getSubjects();
					if (params.code) {
						filtered = filtered.filter(i => i.code.toLowerCase().includes(params.code?.toString().toLowerCase() || ''));
					}
					if (params.name) {
						filtered = filtered.filter(i => i.name.toLowerCase().includes(params.name?.toString().toLowerCase() || ''));
					}
					setData(filtered);
				}}
				onReset={() => loadData()}
			/>

			<Modal
				title={editingItem ? "Sửa môn học" : "Thêm môn học"}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={() => setIsModalVisible(false)}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="code"
						label="Mã môn học"
						rules={[{ required: true, message: 'Vui lòng nhập mã môn học!' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="name"
						label="Tên môn học"
						rules={[{ required: true, message: 'Vui lòng nhập tên môn học!' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="credits"
						label="Số tín chỉ"
						rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ!' }]}
					>
						<InputNumber min={1} max={10} style={{ width: '100%' }} />
					</Form.Item>
				</Form>
			</Modal>
		</PageContainer>
	);
};

export default Subjects;
