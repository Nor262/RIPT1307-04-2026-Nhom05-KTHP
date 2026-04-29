import React, { useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Typography, Tag, Button, Row, Col, Space, Divider, List } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useParams, useModel, history } from 'umi';

const { Title, Paragraph, Text } = Typography;

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { posts, incrementView } = useModel('blog');
  const post = posts.find(p => p.slug === slug);

  useEffect(() => {
    if (post) {
      incrementView(post.id);
    }
  }, [post?.id]);

  if (!post) {
    return (
      <PageContainer>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Title level={3}>Bài viết không tồn tại</Title>
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => history.push('/blog/home')}>
              Quay lại trang chủ
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  const relatedPosts = posts.filter(p => 
    p.id !== post.id && 
    p.status === 'Đã đăng' && 
    p.tags.some(tag => post.tags.includes(tag))
  );

  return (
    <PageContainer title={false}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => history.push('/blog/home')}
        style={{ marginBottom: 16 }}
      >
        Quay lại danh sách
      </Button>

      <Row gutter={24}>
        <Col lg={17} md={24}>
          <Card cover={<img alt={post.title} src={post.coverImage} style={{ maxHeight: 400, objectFit: 'cover' }} />}>
            <Title level={1}>{post.title}</Title>
            <Space split={<Divider type="vertical" />} style={{ marginBottom: 16 }}>
              <span><UserOutlined /> {post.author}</span>
              <span><CalendarOutlined /> {post.date}</span>
              <span><EyeOutlined /> {post.views + 1} lượt xem</span>
            </Space>
            <div style={{ marginBottom: 24 }}>
              {post.tags.map(tag => <Tag key={tag} color="blue">{tag}</Tag>)}
            </div>
            <Divider />
            {/* Giả lập render Markdown đơn giản bằng div */}
            <div style={{ fontSize: 16, lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
          </Card>
        </Col>

        <Col lg={7} md={24}>
          <Card title="Bài viết liên quan">
            <List
              dataSource={relatedPosts}
              renderItem={item => (
                <List.Item 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => history.push(`/blog/post/${item.slug}`)}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={<Text type="secondary">{item.date}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default BlogDetail;
