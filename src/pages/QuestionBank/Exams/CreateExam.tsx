import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Button, Form, Input, Select, Space, InputNumber, message, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Subject, KnowledgeBlock, DifficultyLevel } from '../data';
import { getSubjects, getKnowledgeBlocks, generateExam, addExam, addExamStructure, getExamStructures } from '@/services/QuestionBank/storage';
import { history } from 'umi';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

const { Option } = Select;

const difficultyLevels: DifficultyLevel[] = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];

const CreateExam: React.FC = () => {
	const [form] = Form.useForm();
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [knowledgeBlocks, setKnowledgeBlocks] = useState<KnowledgeBlock[]>([]);
	const [examStructures, setExamStructures] = useState<any[]>([]);

	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setSubjects(getSubjects());
		setKnowledgeBlocks(getKnowledgeBlocks());
		setExamStructures(getExamStructures());
	}, []);

	const handleGenerate = (values: any) => {
		if (!values.requirements || values.requirements.length === 0) {
			message.warning('Vui lòng thêm ít nhất một cấu trúc yêu cầu.');
			return;
		}

		setIsSubmitting(true);
		try {
			const generatedQuestions = generateExam(values.subjectId, values.requirements);

			let structureId = uuidv4();

			if (values.saveStructure) {
				addExamStructure({
					id: structureId,
					name: values.structureName || `Cấu trúc đề - ${moment().format('DD/MM/YYYY HH:mm')}`,
					subjectId: values.subjectId,
					requirements: values.requirements,
				});
				message.success('Đã lưu cấu trúc đề thi');
			}

			addExam({
				id: uuidv4(),
				name: values.name || `Đề thi môn ${subjects.find(s => s.id === values.subjectId)?.name}`,
				subjectId: values.subjectId,
				structureId: structureId,
				createdAt: moment().toISOString(),
				questions: generatedQuestions,
			});

			message.success('Đã khởi tạo đề thi thành công!');
			history.push('/ngan-hang-cau-hoi/de-thi');

		} catch (error: any) {
			message.error(error.message || 'Có lỗi xảy ra khi tạo đề thi.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleLoadStructure = (structureId: string) => {
		const structure = examStructures.find(s => s.id === structureId);
		if (structure) {
			form.setFieldsValue({
				subjectId: structure.subjectId,
				requirements: structure.requirements,
			});
			message.success('Đã nạp cấu trúc thành công!');
		}
	};

	return (
		<PageContainer title="Tạo Đề Thi Tự Động" onBack={() => history.goBack()}>
			<Card bordered={false}>
				<Form
					form={form}
					layout="vertical"
					onFinish={handleGenerate}
					initialValues={{
						saveStructure: false,
						requirements: [{}]
					}}
				>
					<Form.Item
						name="name"
						label="Tên đề thi"
						rules={[{ required: true, message: 'Vui lòng nhập tên đề thi!' }]}
					>
						<Input placeholder="Ví dụ: Đề kiểm tra giữa kỳ môn Cấu trúc dữ liệu" />
					</Form.Item>

					<Form.Item label="Nạp cấu trúc đã lưu (Tùy chọn)">
						<Select placeholder="Chọn cấu trúc mẫu để nạp" onChange={handleLoadStructure} allowClear>
							{examStructures.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
						</Select>
					</Form.Item>

					<Form.Item
						name="subjectId"
						label="Môn học"
						rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
					>
						<Select placeholder="Chọn môn học">
							{subjects.map(s => <Option key={s.id} value={s.id}>{s.name} - {s.code}</Option>)}
						</Select>
					</Form.Item>

					<Divider orientation="left">Thiết lập cấu trúc đề</Divider>

					<Form.List name="requirements">
						{(fields, { add, remove }) => (
							<>
								{fields.map(({ key, name, ...restField }) => (
									<Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
										<Form.Item
											{...restField}
											name={[name, 'knowledgeBlockId']}
											rules={[{ required: true, message: 'Chọn khối kiến thức' }]}
										>
											<Select placeholder="Chọn khối kiến thức" style={{ width: 250 }}>
												{knowledgeBlocks.map(k => <Option key={k.id} value={k.id}>{k.name}</Option>)}
											</Select>
										</Form.Item>

										<Form.Item
											{...restField}
											name={[name, 'difficulty']}
											rules={[{ required: true, message: 'Chọn mức độ' }]}
										>
											<Select placeholder="Mức độ khó" style={{ width: 150 }}>
												{difficultyLevels.map(d => <Option key={d} value={d}>{d}</Option>)}
											</Select>
										</Form.Item>

										<Form.Item
											{...restField}
											name={[name, 'quantity']}
											rules={[{ required: true, message: 'Nhập số lượng' }]}
										>
											<InputNumber placeholder="Số câu" min={1} max={100} style={{ width: 120 }} />
										</Form.Item>

										<MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
									</Space>
								))}
								<Form.Item>
									<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
										Thêm yêu cầu
									</Button>
								</Form.Item>
							</>
						)}
					</Form.List>

					<Divider />

					<Form.Item
						name="saveStructure"
						valuePropName="checked"
					>
						<Input type="checkbox" onChange={(e) => {
							const isChecked = e.target.checked;
							form.setFieldsValue({ saveStructure: isChecked });
						}} style={{ width: 'auto', marginRight: 8 }} />
						<span>Lưu cấu trúc đề thi này để sử dụng lại</span>
					</Form.Item>

					<Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.saveStructure !== currentValues.saveStructure}>
						{({ getFieldValue }) =>
							getFieldValue('saveStructure') ? (
								<Form.Item
									name="structureName"
									label="Tên cấu trúc đề"
									rules={[{ required: true, message: 'Vui lòng nhập tên cấu trúc để lưu!' }]}
								>
									<Input placeholder="Ví dụ: Cấu trúc thi giữa kỳ chuẩn" />
								</Form.Item>
							) : null
						}
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={isSubmitting}>
							Tạo và Lưu Đề Thi
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</PageContainer>
	);
};

export default CreateExam;
