import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { Button, message, Popconfirm, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Question, Subject, KnowledgeBlock, DifficultyLevel } from '../data';
import {
	getQuestions, addQuestion, editQuestion, removeQuestion,
	getSubjects, getKnowledgeBlocks
} from '@/services/QuestionBank/storage';
import { v4 as uuidv4 } from 'uuid';

const { Option } = Select;

const difficultyLevels: DifficultyLevel[] = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];

const Questions: React.FC = () => {
	const [data, setData] = useState<Question[]>([]);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [knowledgeBlocks, setKnowledgeBlocks] = useState<KnowledgeBlock[]>([]);

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [editingItem, setEditingItem] = useState<Question | null>(null);
	const [form] = Form.useForm();

	const loadData = () => {
		setSubjects(getSubjects());
		setKnowledgeBlocks(getKnowledgeBlocks());
		setData(getQuestions());
	};

	useEffect(() => {
		loadData();
	}, []);

	const handleAdd = () => {
		setEditingItem(null);
		form.resetFields();
		setIsModalVisible(true);
	};

	const handleEdit = (record: Question) => {
		setEditingItem(record);
		form.setFieldsValue(record);
		setIsModalVisible(true);
	};

	const handleDelete = (id: string) => {
		removeQuestion(id);
		message.success('Xóa câu hỏi thành công');
		loadData();
	};

	const handleOk = () => {
		form.validateFields().then((values) => {
			if (editingItem) {
				editQuestion(editingItem.id, { ...editingItem, ...values });
				message.success('Cập nhật thành công');
			} else {
				addQuestion({ id: uuidv4(), ...values });
				message.success('Thêm mới thành công');
			}
			setIsModalVisible(false);
			loadData();
		});
	};

	const columns: ProColumns<Question>[] = [
		{
			title: 'Mã câu hỏi',
			dataIndex: 'code',
			key: 'code',
		},
		{
			title: 'Nội dung',
			dataIndex: 'content',
			key: 'content',
			ellipsis: true,
			width: '30%',
		},
		{
			title: 'Môn học',
			dataIndex: 'subjectId',
			key: 'subjectId',
			valueType: 'select',
			valueEnum: subjects.reduce((acc, curr) => {
				acc[curr.id] = { text: curr.name };
				return acc;
			}, {} as Record<string, { text: string }>),
		},
		{
			title: 'Khối kiến thức',
			dataIndex: 'knowledgeBlockId',
			key: 'knowledgeBlockId',
			valueType: 'select',
			valueEnum: knowledgeBlocks.reduce((acc, curr) => {
				acc[curr.id] = { text: curr.name };
				return acc;
			}, {} as Record<string, { text: string }>),
		},
		{
			title: 'Mức độ',
			dataIndex: 'difficulty',
			key: 'difficulty',
			valueType: 'select',
			valueEnum: difficultyLevels.reduce((acc, curr) => {
				acc[curr] = { text: curr };
				return acc;
			}, {} as Record<string, { text: string }>),
		},
		{
			title: 'Thao tác',
			valueType: 'option',
			key: 'option',
			width: 150,
			render: (text, record) => [
				<Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>,
				<Popconfirm key="delete" title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)}>
					<Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
				</Popconfirm>,
			],
		},
	];

	return (
		<PageContainer title="Quản lý Câu hỏi">
			<ProTable<Question>
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
				headerTitle="Ngân hàng câu hỏi"
				toolBarRender={() => [
					<Button key="button" icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
						Thêm câu hỏi
					</Button>,
				]}
				onSubmit={(params) => {
					let filtered = getQuestions();
					if (params.code) {
						filtered = filtered.filter(i => i.code.toLowerCase().includes(params.code?.toString().toLowerCase() || ''));
					}
					if (params.content) {
						filtered = filtered.filter(i => i.content.toLowerCase().includes(params.content?.toString().toLowerCase() || ''));
					}
					if (params.subjectId) {
						filtered = filtered.filter(i => i.subjectId === params.subjectId);
					}
					if (params.knowledgeBlockId) {
						filtered = filtered.filter(i => i.knowledgeBlockId === params.knowledgeBlockId);
					}
					if (params.difficulty) {
						filtered = filtered.filter(i => i.difficulty === params.difficulty);
					}
					setData(filtered);
				}}
				onReset={() => loadData()}
			/>

			<Modal
				title={editingItem ? "Sửa câu hỏi" : "Thêm câu hỏi"}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={() => setIsModalVisible(false)}
				width={600}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="code"
						label="Mã câu hỏi"
						rules={[{ required: true, message: 'Vui lòng nhập mã câu hỏi!' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						name="subjectId"
						label="Môn học"
						rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
					>
						<Select placeholder="Chọn môn học">
							{subjects.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
						</Select>
					</Form.Item>

					<Form.Item
						name="knowledgeBlockId"
						label="Khối kiến thức"
						rules={[{ required: true, message: 'Vui lòng chọn khối kiến thức!' }]}
					>
						<Select placeholder="Chọn khối kiến thức">
							{knowledgeBlocks.map(k => <Option key={k.id} value={k.id}>{k.name}</Option>)}
						</Select>
					</Form.Item>

					<Form.Item
						name="difficulty"
						label="Mức độ khó"
						rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
					>
						<Select placeholder="Chọn mức độ">
							{difficultyLevels.map(d => <Option key={d} value={d}>{d}</Option>)}
						</Select>
					</Form.Item>

					<Form.Item
						name="content"
						label="Nội dung câu hỏi"
						rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
					>
						<Input.TextArea rows={4} />
					</Form.Item>
				</Form>
			</Modal>
		</PageContainer>
	);
};

export default Questions;
