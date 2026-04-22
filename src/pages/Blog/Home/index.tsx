import React, { useState, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Row, Col, Card, Input, Tag, List, Pagination, Empty, Typography } from 'antd';
import { SearchOutlined, EyeOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import debounce from 'lodash/debounce';

const { Text, Title, Paragraph } = Typography;

const BlogHome: React.FC = () => {
  const { posts } = useModel('blog');
  const { tags } = useModel('tag');
  const [searchText, setSearchText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchText(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const filteredPosts = posts.filter(p => {
    const isPublished = p.status === 'Đã đăng';
    const matchesSearch = p.title.toLowerCase().includes(searchText.toLowerCase()) || 
                          p.summary.toLowerCase().includes(searchText.toLowerCase());
    const matchesTag = selectedTag ? p.tags.includes(selectedTag) : true;
    return isPublished && matchesSearch && matchesTag;
  });

  const paginatedPosts = filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <PageContainer title={false}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Title level={2}>Chào mừng đến với Blog của tôi</Title>
        <Input
          placeholder="Tìm kiếm bài viết..."
          prefix={<SearchOutlined />}
          style={{ width: 400, marginBottom: 16 }}
          onChange={e => debouncedSearch(e.target.value)}
          size="large"
        />
        <div>
          <Text style={{ marginRight: 8 }}>Tags:</Text>
          <Tag 
            color={!selectedTag ? 'blue' : undefined} 
            style={{ cursor: 'pointer' }}
            onClick={() => { setSelectedTag(null); setCurrentPage(1); }}
          >
            Tất cả
          </Tag>
          {tags.map(t => (
            <Tag 
              key={t.id} 
              color={selectedTag === t.name ? 'blue' : undefined} 
              style={{ cursor: 'pointer' }}
              onClick={() => { setSelectedTag(t.name); setCurrentPage(1); }}
            >
              {t.name}
            </Tag>
          ))}
        </div>
      </div>

      {paginatedPosts.length > 0 ? (
        <>
          <Row gutter={[24, 24]}>
            {paginatedPosts.map(post => (
              <Col xs={24} sm={12} lg={8} key={post.id}>
                <Card
                  hoverable
                  cover={<img alt={post.title} src={post.coverImage} style={{ height: 200, objectFit: 'cover' }} />}
                  onClick={() => history.push(`/blog/post/${post.slug}`)}
                  actions={[
                    <span key="views"><EyeOutlined /> {post.views}</span>,
                    <span key="date"><CalendarOutlined /> {post.date}</span>,
                    <span key="author"><UserOutlined /> {post.author}</span>,
                  ]}
                >
                  <Card.Meta
                    title={post.title}
                    description={
                      <>
                        <Paragraph ellipsis={{ rows: 2 }}>{post.summary}</Paragraph>
                        <div>
                          {post.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
                        </div>
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Pagination 
              current={currentPage} 
              total={filteredPosts.length} 
              pageSize={pageSize}
              onChange={page => setCurrentPage(page)}
            />
          </div>
        </>
      ) : (
        <Empty description="Không tìm thấy bài viết nào" />
      )}
    </PageContainer>
  );
};

export default BlogHome;
