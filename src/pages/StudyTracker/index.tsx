import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Modal, Form, Input, InputNumber, Select, message, DatePicker, Popconfirm, Progress, Card, Space } from 'antd';
import dayjs from 'dayjs';

interface Subject {
    id: string;
    name: string;
}

interface StudySession {
    id: string;
    subjectId: string;
    dateTime: string;
    duration: number;
    content: string;
    notes: string;
}

interface MonthlyGoal {
    id: string;
    monthYear: string;
    subjectId: string;
    targetDuration: number;
}

const defaultSubjects: Subject[] = [
    { id: '1', name: 'Toán' },
    { id: '2', name: 'Văn' },
    { id: '3', name: 'Anh' },
    { id: '4', name: 'Khoa học' },
    { id: '5', name: 'Công nghệ' },
];

const defaultSessions: StudySession[] = [
    { id: '101', subjectId: '1', dateTime: dayjs().subtract(2, 'day').toISOString(), duration: 120, content: 'Hệ phương trình bậc nhất', notes: 'Làm thêm bài tập trang 25' },
    { id: '102', subjectId: '3', dateTime: dayjs().subtract(1, 'day').toISOString(), duration: 90, content: 'Luyện nghe tiếng Anh', notes: 'Hoàn thành listening test 1' },
    { id: '103', subjectId: '4', dateTime: dayjs().toISOString(), duration: 60, content: 'Thực hành vật lý', notes: 'Viết báo cáo thí nghiệm' },
];

const defaultGoals: MonthlyGoal[] = [
    { id: '201', monthYear: dayjs().format('YYYY-MM'), subjectId: '1', targetDuration: 600 },
    { id: '202', monthYear: dayjs().format('YYYY-MM'), subjectId: '3', targetDuration: 1200 },
    { id: '203', monthYear: dayjs().format('YYYY-MM'), subjectId: 'TOTAL', targetDuration: 3000 },
];

const StudyTracker: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [goals, setGoals] = useState<MonthlyGoal[]>([]);

    useEffect(() => {
        const localSubjects = localStorage.getItem('study_subjects');
        const localSessions = localStorage.getItem('study_sessions');
        const localGoals = localStorage.getItem('study_goals');

        if (localSubjects) {
            setSubjects(JSON.parse(localSubjects));
        } else {
            setSubjects(defaultSubjects);
            localStorage.setItem('study_subjects', JSON.stringify(defaultSubjects));
        }

        if (localSessions) {
            setSessions(JSON.parse(localSessions));
        } else {
            setSessions(defaultSessions);
            localStorage.setItem('study_sessions', JSON.stringify(defaultSessions));
        }

        if (localGoals) {
            setGoals(JSON.parse(localGoals));
        } else {
            setGoals(defaultGoals);
            localStorage.setItem('study_goals', JSON.stringify(defaultGoals));
        }
    }, []);

    const saveSubjects = (newSubjects: Subject[]) => {
        setSubjects(newSubjects);
        localStorage.setItem('study_subjects', JSON.stringify(newSubjects));
    };

    const saveSessions = (newSessions: StudySession[]) => {
        setSessions(newSessions);
        localStorage.setItem('study_sessions', JSON.stringify(newSessions));
    };

    const saveGoals = (newGoals: MonthlyGoal[]) => {
        setGoals(newGoals);
        localStorage.setItem('study_goals', JSON.stringify(newGoals));
    };

    const [isSubjectModalVisible, setIsSubjectModalVisible] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [subjectForm] = Form.useForm();

    const openSubjectModal = (record?: Subject) => {
        if (record) {
            setEditingSubject(record);
            subjectForm.setFieldsValue(record);
        } else {
            setEditingSubject(null);
            subjectForm.resetFields();
        }
        setIsSubjectModalVisible(true);
    };

    const handleSubjectSubmit = (values: { name: string }) => {
        if (editingSubject) {
            saveSubjects(subjects.map(s => s.id === editingSubject.id ? { ...s, name: values.name } : s));
            message.success('Cập nhật môn học thành công');
        } else {
            saveSubjects([...subjects, { id: Date.now().toString(), name: values.name }]);
            message.success('Thêm môn học thành công');
        }
        setIsSubjectModalVisible(false);
    };

    const deleteSubject = (id: string) => {
        saveSubjects(subjects.filter(s => s.id !== id));
        saveSessions(sessions.filter(s => s.subjectId !== id));
        saveGoals(goals.filter(g => g.subjectId !== id));
        message.success('Đã xóa môn học');
    };

    const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);
    const [editingSession, setEditingSession] = useState<StudySession | null>(null);
    const [sessionForm] = Form.useForm();

    const openSessionModal = (record?: StudySession) => {
        if (record) {
            setEditingSession(record);
            sessionForm.setFieldsValue({
                ...record,
                dateTime: dayjs(record.dateTime),
            });
        } else {
            setEditingSession(null);
            sessionForm.resetFields();
        }
        setIsSessionModalVisible(true);
    };

    const handleSessionSubmit = (values: any) => {
        const sessionData: StudySession = {
            id: editingSession ? editingSession.id : Date.now().toString(),
            subjectId: values.subjectId,
            dateTime: values.dateTime.toISOString(),
            duration: values.duration,
            content: values.content,
            notes: values.notes || '',
        };

        if (editingSession) {
            saveSessions(sessions.map(s => s.id === editingSession.id ? sessionData : s));
            message.success('Cập nhật buổi học thành công');
        } else {
            saveSessions([...sessions, sessionData]);
            message.success('Thêm buổi học thành công');
        }
        setIsSessionModalVisible(false);
    };

    const deleteSession = (id: string) => {
        saveSessions(sessions.filter(s => s.id !== id));
        message.success('Đã xóa buổi học');
    };

    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
    const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null);
    const [goalForm] = Form.useForm();

    const openGoalModal = (record?: MonthlyGoal) => {
        if (record) {
            setEditingGoal(record);
            goalForm.setFieldsValue({
                ...record,
                monthYear: dayjs(`${record.monthYear}-01`),
            });
        } else {
            setEditingGoal(null);
            goalForm.resetFields();
        }
        setIsGoalModalVisible(true);
    };

    const handleGoalSubmit = (values: any) => {
        const monthYearStr = values.monthYear.format('YYYY-MM');
        const goalData: MonthlyGoal = {
            id: editingGoal ? editingGoal.id : Date.now().toString(),
            monthYear: monthYearStr,
            subjectId: values.subjectId,
            targetDuration: values.targetDuration,
        };

        if (editingGoal) {
            saveGoals(goals.map(g => g.id === editingGoal.id ? goalData : g));
        } else {
            const existing = goals.find(g => g.monthYear === monthYearStr && g.subjectId === values.subjectId);
            if (existing) {
                message.error('Mục tiêu cho môn này trong tháng đã tồn tại!');
                return;
            }
            saveGoals([...goals, goalData]);
        }
        message.success('Lưu mục tiêu thành công');
        setIsGoalModalVisible(false);
    };

    const deleteGoal = (id: string) => {
        saveGoals(goals.filter(g => g.id !== id));
        message.success('Đã xóa mục tiêu');
    };

    const getSubjectName = (id: string) => {
        if (id === 'TOTAL') return 'Tổng tất cả môn';
        return subjects.find(s => s.id === id)?.name || 'Không rõ';
    };

    const subjectColumns = [
        { title: 'Tên môn học', dataIndex: 'name', key: 'name' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Subject) => (
                <Space>
                    <Button type="link" onClick={() => openSubjectModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa môn học này?" onConfirm={() => deleteSubject(record.id)}>
                        <Button type="link" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    const sessionColumns = [
        { title: 'Môn học', dataIndex: 'subjectId', key: 'subjectId', render: (id: string) => getSubjectName(id) },
        { title: 'Thời gian', dataIndex: 'dateTime', key: 'dateTime', render: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm') },
        { title: 'Thời lượng (phút)', dataIndex: 'duration', key: 'duration' },
        { title: 'Nội dung', dataIndex: 'content', key: 'content' },
        { title: 'Ghi chú', dataIndex: 'notes', key: 'notes' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: StudySession) => (
                <Space>
                    <Button type="link" onClick={() => openSessionModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa buổi học này?" onConfirm={() => deleteSession(record.id)}>
                        <Button type="link" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    const calculateProgress = (goal: MonthlyGoal) => {
        const [year, month] = goal.monthYear.split('-');
        let relevantSessions = sessions.filter(s => {
            const d = dayjs(s.dateTime);
            return d.year().toString() === year && (d.month() + 1).toString().padStart(2, '0') === month;
        });

        if (goal.subjectId !== 'TOTAL') {
            relevantSessions = relevantSessions.filter(s => s.subjectId === goal.subjectId);
        }

        const totalStudied = relevantSessions.reduce((sum, s) => sum + s.duration, 0);
        const percent = Math.min(100, Math.round((totalStudied / goal.targetDuration) * 100));
        return { totalStudied, percent };
    };

    const goalColumns = [
        { title: 'Tháng', dataIndex: 'monthYear', key: 'monthYear' },
        { title: 'Môn học', dataIndex: 'subjectId', key: 'subjectId', render: (id: string) => getSubjectName(id) },
        { title: 'Mục tiêu (phút)', dataIndex: 'targetDuration', key: 'targetDuration' },
        {
            title: 'Tiến độ',
            key: 'progress',
            render: (_: any, record: MonthlyGoal) => {
                const { totalStudied, percent } = calculateProgress(record);
                return (
                    <div style={{ width: 150 }}>
                        <div style={{ fontSize: 12, marginBottom: 4 }}>{totalStudied} / {record.targetDuration} phút</div>
                        <Progress percent={percent} status={percent >= 100 ? 'success' : 'active'} />
                    </div>
                );
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: MonthlyGoal) => (
                <Space>
                    <Button type="link" onClick={() => openGoalModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa mục tiêu này?" onConfirm={() => deleteGoal(record.id)}>
                        <Button type="link" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    return (
        <Card style={{ margin: 24 }}>
            <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Quản lý Môn học" key="1">
                    <Button type="primary" onClick={() => openSubjectModal()} style={{ marginBottom: 16 }}>Thêm môn học</Button>
                    <Table columns={subjectColumns} dataSource={subjects} rowKey="id" />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Lịch học" key="2">
                    <Button type="primary" onClick={() => openSessionModal()} style={{ marginBottom: 16 }}>Thêm buổi học</Button>
                    <Table columns={sessionColumns} dataSource={sessions} rowKey="id" />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Mục tiêu tháng" key="3">
                    <Button type="primary" onClick={() => openGoalModal()} style={{ marginBottom: 16 }}>Thêm mục tiêu</Button>
                    <Table columns={goalColumns} dataSource={goals} rowKey="id" />
                </Tabs.TabPane>
            </Tabs>

            <Modal title={editingSubject ? 'Sửa môn học' : 'Thêm môn học'} visible={isSubjectModalVisible} onCancel={() => setIsSubjectModalVisible(false)} onOk={() => subjectForm.submit()}>
                <Form form={subjectForm} onFinish={handleSubjectSubmit} layout="vertical">
                    <Form.Item name="name" label="Tên môn học" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title={editingSession ? 'Sửa buổi học' : 'Thêm buổi học'} visible={isSessionModalVisible} onCancel={() => setIsSessionModalVisible(false)} onOk={() => sessionForm.submit()}>
                <Form form={sessionForm} onFinish={handleSessionSubmit} layout="vertical">
                    <Form.Item name="subjectId" label="Môn học" rules={[{ required: true }]}>
                        <Select>
                            {subjects.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="dateTime" label="Thời gian" rules={[{ required: true }]}>
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="content" label="Nội dung" rules={[{ required: true }]}>
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="notes" label="Ghi chú">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title={editingGoal ? 'Sửa mục tiêu' : 'Thêm mục tiêu'} visible={isGoalModalVisible} onCancel={() => setIsGoalModalVisible(false)} onOk={() => goalForm.submit()}>
                <Form form={goalForm} onFinish={handleGoalSubmit} layout="vertical">
                    <Form.Item name="monthYear" label="Tháng" rules={[{ required: true }]}>
                        <DatePicker picker="month" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="subjectId" label="Môn học" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="TOTAL">Tổng tất cả môn</Select.Option>
                            {subjects.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="targetDuration" label="Mục tiêu (phút)" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default StudyTracker;
