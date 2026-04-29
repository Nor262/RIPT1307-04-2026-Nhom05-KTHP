import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { Button, message, Popconfirm, Modal, List, Typography, Tag, Space, Form, Input } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { Exam, Subject } from '../data';
import { getExams, removeExam, getSubjects, editExam } from '@/services/QuestionBank/storage';
import { history } from 'umi';

const { Text } = Typography;

const Exams: React.FC = () => {
	const [data, setData] = useState<Exam[]>([]);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [viewingExam, setViewingExam] = useState<Exam | null>(null);
	const [editingExam, setEditingExam] = useState<Exam | null>(null);
	const [form] = Form.useForm();

	const loadData = () => {
		setSubjects(getSubjects());
		setData(getExams());
	};

	useEffect(() => {
		loadData();
	}, []);

	const handleDelete = (id: string) => {
		removeExam(id);
		message.success('Xóa đề thi thành công');
		loadData();
	};

	const handleEdit = (record: Exam) => {
		setEditingExam(record);
		form.setFieldsValue({ name: record.name });
	};

	const handleSaveEdit = () => {
		form.validateFields().then((values) => {
			if (editingExam) {
				editExam(editingExam.id, { ...editingExam, name: values.name });
				message.success('Cập nhật tên đề thi thành công');
				setEditingExam(null);
				loadData();
			}
		});
	};

	const columns: ProColumns<Exam>[] = [
		{
			title: 'Tên đề thi',
			dataIndex: 'name',
			key: 'name',
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
			title: 'Ngày tạo',
			dataIndex: 'createdAt',
			key: 'createdAt',
			valueType: 'dateTime',
		},
		{
			title: 'Số câu hỏi',
			key: 'questionCount',
			render: (_, record) => <Tag color="blue">{record.questions.length} câu</Tag>,
			search: false,
		},
		{
			title: 'Thao tác',
			valueType: 'option',
			key: 'option',
			render: (text, record) => [
				<Button key="view" type="link" icon={<EyeOutlined />} onClick={() => setViewingExam(record)}>Xem chi tiết</Button>,
				<Button key="edit" type="link" onClick={() => handleEdit(record)}>Sửa tên</Button>,
				<Popconfirm key="delete" title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)}>
					<Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
				</Popconfirm>,
			],
		},
	];

	return (
		<PageContainer title="Quản lý Đề thi">
			<ProTable<Exam>
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
				headerTitle="Danh sách Đề thi"
				toolBarRender={() => [
					<Button key="button" icon={<PlusOutlined />} type="primary" onClick={() => history.push('/ngan-hang-cau-hoi/tao-de-thi')}>
						Tạo đề thi mới
					</Button>,
				]}
				onSubmit={(params) => {
					let filtered = getExams();
					if (params.name) {
						filtered = filtered.filter(i => i.name.toLowerCase().includes(params.name?.toString().toLowerCase() || ''));
					}
					if (params.subjectId) {
						filtered = filtered.filter(i => i.subjectId === params.subjectId);
					}
					setData(filtered);
				}}
				onReset={() => loadData()}
			/>

			<Modal
				title={`Sửa tên đề thi: ${editingExam?.name}`}
				visible={!!editingExam}
				onOk={handleSaveEdit}
				onCancel={() => setEditingExam(null)}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="name"
						label="Tên đề thi mới"
						rules={[{ required: true, message: 'Vui lòng nhập tên đề thi!' }]}
					>
						<Input />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title={`Chi tiết đề thi: ${viewingExam?.name}`}
				visible={!!viewingExam}
				onCancel={() => setViewingExam(null)}
				footer={[
					<Button key="close" onClick={() => setViewingExam(null)}>Đóng</Button>
				]}
				width={800}
				bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
			>
				{viewingExam && (
					<List
						itemLayout="vertical"
						dataSource={viewingExam.questions}
						renderItem={(item, index) => (
							<List.Item>
								<List.Item.Meta
									title={<Space><Text strong>Câu {index + 1}:</Text> <Tag color={
										item.difficulty === 'Dễ' ? 'green' :
											item.difficulty === 'Trung bình' ? 'blue' :
												item.difficulty === 'Khó' ? 'orange' : 'red'
									}>{item.difficulty}</Tag></Space>}
									description={<Text>{item.content}</Text>}
								/>
							</List.Item>
						)}
					/>
				)}
			</Modal>
		</PageContainer>
	);
};

export default Exams;
