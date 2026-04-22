import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Avatar, Typography, Row, Col, Space, Tag, Divider, Button } from 'antd';
import { GithubOutlined, FacebookOutlined, LinkedinOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const AboutPage: React.FC = () => {
  const skills = ['ReactJS', 'TypeScript', 'Ant Design', 'Node.js', 'MySQL', 'System Design'];

  return (
    <PageContainer title={false}>
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
            <Avatar 
              size={180} 
              src="https://joeschmoe.io/api/v1/random" 
              style={{ border: '4px solid #f0f2f5' }}
            />
          </Col>
          <Col xs={24} sm={16}>
            <Title level={1}>Admin</Title>
            <Title level={4} type="secondary">Full Stack Developer</Title>
            <Paragraph>
              Chào mừng bạn đến với blog cá nhân của tôi. Tôi là một lập trình viên đam mê công nghệ và thích chia sẻ những kiến thức mình học được với cộng đồng.
            </Paragraph>
            <Space size="middle">
              <Button icon={<GithubOutlined />} shape="circle" href="#" target="_blank" />
              <Button icon={<FacebookOutlined />} shape="circle" href="#" target="_blank" />
              <Button icon={<LinkedinOutlined />} shape="circle" href="#" target="_blank" />
              <Button icon={<MailOutlined />} shape="circle" href="#" target="_blank" />
            </Space>
          </Col>
        </Row>
        
        <Divider />
        
        <Title level={3}>Tiểu sử</Title>
        <Paragraph>
          Với hơn 5 năm kinh nghiệm trong lĩnh vực phát triển web, tôi đã tham gia nhiều dự án đa dạng từ quy mô nhỏ đến lớn. Blog này là nơi tôi ghi lại những hành trình khám phá các công nghệ mới và các bài học kinh nghiệm trong quá trình làm việc.
        </Paragraph>
        
        <Divider />
        
        <Title level={3}>Kỹ năng</Title>
        <div style={{ marginBottom: 16 }}>
          {skills.map(skill => (
            <Tag key={skill} color="blue" style={{ fontSize: 14, padding: '4px 12px', marginBottom: 8 }}>
              {skill}
            </Tag>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
};

export default AboutPage;
