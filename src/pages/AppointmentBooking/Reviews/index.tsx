import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Card, Table, Button, Space, Modal, Form, Rate, Input, Tag,
  Typography, Row, Col, Avatar, Divider, Empty, Tabs, Alert,
  message, Statistic, Progress,
} from 'antd';
import {
  StarOutlined, MessageOutlined, UserOutlined, CommentOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import type { Review } from '@/models/appointment';
import dayjs from 'dayjs';

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

const STAR_COLORS = ['', '#ff4d4f', '#fa8c16', '#fadb14', '#52c41a', '#1890ff'];

const ReviewsPage: React.FC = () => {
  const { appointments, reviews, staffList, addReview, replyReview } =
    useModel('appointment');

  const [reviewModal, setReviewModal] = useState<{ appointmentId: string; customerName: string; serviceName: string; staffId: number; staffName: string } | null>(null);
  const [replyModal, setReplyModal] = useState<Review | null>(null);
  const [reviewForm] = Form.useForm();
  const [replyForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('pending');

  const reviewedIds = new Set(reviews.map(r => r.appointmentId));
  const pendingReview = appointments.filter(
    a => a.status === 'Hoàn thành' && !reviewedIds.has(a.id),
  );

  const openReview = (apt: (typeof appointments)[0]) => {
    reviewForm.resetFields();
    setReviewModal({
      appointmentId: apt.id,
      customerName: apt.customerName,
      serviceName: apt.serviceName,
      staffId: apt.staffId,
      staffName: apt.staffName,
    });
  };

  const submitReview = () => {
    reviewForm.validateFields().then(values => {
      if (!reviewModal) return;
      const result = addReview({
        appointmentId: reviewModal.appointmentId,
        staffId: reviewModal.staffId,
        staffName: reviewModal.staffName,
        customerName: reviewModal.customerName,
        serviceName: reviewModal.serviceName,
        rating: values.rating,
        comment: values.comment,
      });
      if (result.success) {
        message.success(result.message);
        setReviewModal(null);
      } else {
        message.error(result.message);
      }
    });
  };

  const submitReply = () => {
    replyForm.validateFields().then(values => {
      if (!replyModal) return;
      replyReview(replyModal.id, values.reply);
      message.success('Đã phản hồi đánh giá!');
      setReplyModal(null);
    });
  };

  const staffRatings = staffList.map(staff => {
    const staffReviews = reviews.filter(r => r.staffId === staff.id);
    const avg = staffReviews.length
      ? staffReviews.reduce((s, r) => s + r.rating, 0) / staffReviews.length
      : 0;
    const dist = [1, 2, 3, 4, 5].map(star =>
      staffReviews.filter(r => r.rating === star).length,
    );
    return { ...staff, reviews: staffReviews, avg, dist, total: staffReviews.length };
  });

  const pendingColumns = [
    {
      title: 'Mã LH',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text code>{id}</Text>,
    },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Dịch vụ', dataIndex: 'serviceName', key: 'serviceName', render: (v: string) => <Tag color="geekblue">{v}</Tag> },
    { title: 'Nhân viên', dataIndex: 'staffName', key: 'staffName' },
    { title: 'Ngày', dataIndex: 'date', key: 'date', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, r: (typeof appointments)[0]) => (
        <Button type="primary" icon={<StarOutlined />} onClick={() => openReview(r)}>
          Đánh giá
        </Button>
      ),
    },
  ];

  const reviewColumns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: any, r: Review) => (
        <Space>
          <Avatar style={{ background: '#1890ff' }}>{r.customerName.charAt(0)}</Avatar>
          <div>
            <Text strong>{r.customerName}</Text>
            <br />
            <Tag color="geekblue" style={{ fontSize: 11 }}>{r.serviceName}</Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'staffName',
      key: 'staffName',
      render: (n: string) => <Space><UserOutlined /><Text>{n}</Text></Space>,
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      render: (_: any, r: Review) => (
        <div>
          <Rate disabled value={r.rating} style={{ fontSize: 14 }} />
          <Paragraph style={{ marginBottom: 4, marginTop: 4, maxWidth: 200 }} ellipsis={{ rows: 2 }}>
            "{r.comment}"
          </Paragraph>
          {r.staffReply && (
            <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, padding: '4px 8px', marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>💬 Phản hồi: </Text>
              <Text style={{ fontSize: 11 }}>{r.staffReply}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, r: Review) => (
        !r.staffReply
          ? <Button icon={<CommentOutlined />} onClick={() => { replyForm.resetFields(); setReplyModal(r); }}>
              Phản hồi
            </Button>
          : <Tag icon={<CheckCircleOutlined />} color="success">Đã phản hồi</Tag>
      ),
    },
  ];

  return (
    <PageContainer title="Đánh giá dịch vụ">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          key="pending"
          tab={<Space><StarOutlined />Chờ đánh giá <Tag color="red">{pendingReview.length}</Tag></Space>}
        >
          <Card>
            {pendingReview.length === 0
              ? <Empty description="Không có lịch hẹn nào chờ đánh giá" />
              : <Table columns={pendingColumns} dataSource={pendingReview} rowKey="id" pagination={{ pageSize: 8 }} />
            }
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane
          key="all"
          tab={<Space><MessageOutlined />Tất cả đánh giá <Tag>{reviews.length}</Tag></Space>}
        >
          <Card>
            {reviews.length === 0
              ? <Empty description="Chưa có đánh giá nào" />
              : <Table columns={reviewColumns} dataSource={reviews} rowKey="id" pagination={{ pageSize: 8 }} />
            }
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane
          key="staff"
          tab={<Space><UserOutlined />Theo nhân viên</Space>}
        >
          <Row gutter={[16, 16]}>
            {staffRatings.map(staff => (
              <Col key={staff.id} xs={24} md={12} lg={8}>
                <Card
                  title={
                    <Space>
                      <Avatar style={{ background: 'linear-gradient(135deg, #1890ff, #722ed1)' }}>
                        {staff.name.charAt(0)}
                      </Avatar>
                      <div>
                        <Text strong>{staff.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>{staff.specialty}</Text>
                      </div>
                    </Space>
                  }
                >
                  {staff.total === 0 ? (
                    <Empty description="Chưa có đánh giá" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <>
                      <Row align="middle" gutter={16}>
                        <Col>
                          <Statistic value={staff.avg.toFixed(1)} suffix="/5" valueStyle={{ color: STAR_COLORS[Math.round(staff.avg)], fontSize: 28 }} />
                          <Rate disabled value={staff.avg} allowHalf style={{ fontSize: 12 }} />
                          <br />
                          <Text type="secondary" style={{ fontSize: 11 }}>{staff.total} đánh giá</Text>
                        </Col>
                        <Col flex={1}>
                          {[5, 4, 3, 2, 1].map(star => (
                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                              <Text style={{ fontSize: 11, minWidth: 12 }}>{star}⭐</Text>
                              <Progress
                                percent={staff.total ? Math.round((staff.dist[star - 1] / staff.total) * 100) : 0}
                                size="small"
                                strokeColor={STAR_COLORS[star]}
                                showInfo={false}
                                style={{ flex: 1, margin: 0 }}
                              />
                              <Text style={{ fontSize: 11, minWidth: 14 }}>{staff.dist[star - 1]}</Text>
                            </div>
                          ))}
                        </Col>
                      </Row>
                      <Divider style={{ margin: '8px 0' }} />
                      <div style={{ maxHeight: 100, overflowY: 'auto' }}>
                        {staff.reviews.slice(0, 3).map(r => (
                          <div key={r.id} style={{ marginBottom: 6 }}>
                            <Rate disabled value={r.rating} style={{ fontSize: 11 }} />
                            <Text style={{ fontSize: 11, display: 'block' }} type="secondary">"{r.comment}"</Text>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title={<Title level={4} style={{ margin: 0 }}>⭐ Đánh giá dịch vụ</Title>}
        visible={!!reviewModal}
        onOk={submitReview}
        onCancel={() => setReviewModal(null)}
        okText="Gửi đánh giá"
        cancelText="Hủy"
        width={480}
      >
        {reviewModal && (
          <>
            <Alert
              message={`Dịch vụ: ${reviewModal.serviceName} — Nhân viên: ${reviewModal.staffName}`}
              type="info"
              style={{ marginBottom: 16 }}
            />
            <Form form={reviewForm} layout="vertical">
              <Form.Item name="rating" label="Đánh giá sao" rules={[{ required: true, message: 'Chọn số sao!' }]}>
                <Rate style={{ fontSize: 32 }} />
              </Form.Item>
              <Form.Item name="comment" label="Nhận xét" rules={[{ required: true, message: 'Nhập nhận xét!' }]}>
                <TextArea rows={3} placeholder="Chia sẻ trải nghiệm của bạn..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      <Modal
        title="💬 Phản hồi đánh giá"
        visible={!!replyModal}
        onOk={submitReply}
        onCancel={() => setReplyModal(null)}
        okText="Gửi phản hồi"
        cancelText="Hủy"
        width={480}
      >
        {replyModal && (
          <>
            <Alert
              message={
                <div>
                  <Rate disabled value={replyModal.rating} style={{ fontSize: 14 }} />
                  <br />
                  <Text>"{replyModal.comment}"</Text>
                  <br />
                  <Text type="secondary">— {replyModal.customerName}</Text>
                </div>
              }
              type="info"
              style={{ marginBottom: 16 }}
            />
            <Form form={replyForm} layout="vertical">
              <Form.Item name="reply" label="Nội dung phản hồi" rules={[{ required: true }]}>
                <TextArea rows={3} placeholder="Cảm ơn quý khách..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ReviewsPage;
