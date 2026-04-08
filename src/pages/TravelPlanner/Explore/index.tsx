import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Row, Col, Space, Typography, Rate, Select, Tag, Button, Empty } from 'antd';
import { Destination } from '../data';
import { getDestinations } from '../../../services/Travel/service';
import { EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import { history } from 'umi';

const { Text, Paragraph } = Typography;

const ExplorePage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number>(0);
  const [filterPrice, setFilterPrice] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('default');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getDestinations();
    setDestinations(res.data);
    setFilteredDestinations(res.data);
  };

  useEffect(() => {
    let result = destinations;
    if (filterType !== 'all') {
      result = result.filter(d => d.type === filterType);
    }
    if (filterRating > 0) {
      result = result.filter(d => d.rating >= filterRating);
    }
    if (filterPrice !== 'all') {
      result = result.filter(d => {
        const total = (d.costs?.food || 0) + (d.costs?.accommodation || 0) + (d.costs?.transport || 0);
        if (filterPrice === 'cheap') return total <= 1500000;
        if (filterPrice === 'medium') return total > 1500000 && total <= 3000000;
        return total > 3000000;
      });
    }
    if (sortOrder === 'price_asc') {
      result = result.sort((a, b) => {
        const tA = (a.costs?.food || 0) + (a.costs?.accommodation || 0) + (a.costs?.transport || 0);
        const tB = (b.costs?.food || 0) + (b.costs?.accommodation || 0) + (b.costs?.transport || 0);
        return tA - tB;
      });
    } else if (sortOrder === 'price_desc') {
      result = result.sort((a, b) => {
        const tA = (a.costs?.food || 0) + (a.costs?.accommodation || 0) + (a.costs?.transport || 0);
        const tB = (b.costs?.food || 0) + (b.costs?.accommodation || 0) + (b.costs?.transport || 0);
        return tB - tA;
      });
    } else if (sortOrder === 'rating_desc') {
      result = result.sort((a, b) => b.rating - a.rating);
    }

    setFilteredDestinations([...result]);
  }, [filterType, filterRating, filterPrice, sortOrder, destinations]);

  const typeColorMap: Record<string, string> = {
    beach: 'blue',
    mountain: 'green',
    city: 'orange'
  };

  const typeNameMap: Record<string, string> = {
    beach: 'Biển',
    mountain: 'Núi',
    city: 'Thành Phố'
  };

  return (
    <PageContainer>
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <Space size="large" wrap>
          <Space direction="vertical" size={2}>
            <Text type="secondary">Loại hình</Text>
            <Select 
              value={filterType} 
              style={{ width: 150 }} 
              onChange={setFilterType}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'beach', label: 'Biển' },
                { value: 'mountain', label: 'Núi' },
                { value: 'city', label: 'Thành phố' },
              ]}
            />
          </Space>

          <Space direction="vertical" size={2}>
            <Text type="secondary">Đánh giá tối thiểu</Text>
            <Select 
              value={filterRating} 
              style={{ width: 150 }} 
              onChange={setFilterRating}
              options={[
                { value: 0, label: 'Bất kỳ sao' },
                { value: 4.8, label: 'Từ 4.8 Sao' },
                { value: 4.5, label: 'Từ 4.5 Sao' },
                { value: 4.0, label: 'Từ 4.0 Sao' },
              ]}
            />
          </Space>

          <Space direction="vertical" size={2}>
            <Text type="secondary">Chi phí cơ bản dự kiến</Text>
            <Select 
              value={filterPrice} 
              style={{ width: 180 }} 
              onChange={setFilterPrice}
              options={[
                { value: 'all', label: 'Tất cả mức giá' },
                { value: 'cheap', label: 'Tiết kiệm (Dưới 1.5tr)' },
                { value: 'medium', label: 'Trung cấp (1.5tr - 3tr)' },
                { value: 'luxury', label: 'Cao cấp (Trên 3tr)' },
              ]}
            />
          </Space>
          <Space direction="vertical" size={2}>
            <Text type="secondary">Sắp xếp</Text>
            <Select 
              value={sortOrder} 
              style={{ width: 180 }} 
              onChange={setSortOrder}
              options={[
                { value: 'default', label: 'Mặc định' },
                { value: 'rating_desc', label: 'Đánh giá cao nhất' },
                { value: 'price_asc', label: 'Giá thấp đến cao' },
                { value: 'price_desc', label: 'Giá cao đến thấp' },
              ]}
            />
          </Space>
        </Space>
      </Card>

      {filteredDestinations.length === 0 ? (
        <Card>
          <Empty description="Không tìm thấy điểm đến phù hợp" />
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {filteredDestinations.map(item => {
            const totalCost = (item.costs?.food || 0) + (item.costs?.accommodation || 0) + (item.costs?.transport || 0);
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 200, overflow: 'hidden' }}>
                      <img 
                        alt={item.name} 
                        src={item.image} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null;
                          currentTarget.src = "https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg";
                        }}
                      />
                    </div>
                  }
                  actions={[
                    <Button 
                      type="link" 
                      onClick={() => {
                         history.push('/travel-planner/itinerary');
                      }}
                      icon={<PlusOutlined />}
                    >
                      Lên Lịch
                    </Button>
                  ]}
                >
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography.Title level={5} style={{ margin: 0 }} ellipsis={{ tooltip: item.name }}>
                        {item.name}
                      </Typography.Title>
                      <Tag color={typeColorMap[item.type]}>{typeNameMap[item.type]}</Tag>
                    </div>
                    
                    <Space size={4} style={{ color: '#8c8c8c' }}>
                      <EnvironmentOutlined />
                      <Text type="secondary" ellipsis={{ tooltip: item.location }}>{item.location}</Text>
                    </Space>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <Rate disabled defaultValue={Math.round(item.rating * 2) / 2} allowHalf style={{ fontSize: 12 }} />
                      <Text strong style={{ fontSize: 12 }}>{item.rating}</Text>
                    </div>

                    <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ marginTop: 8, marginBottom: 0, minHeight: 44 }}>
                      {item.description}
                    </Paragraph>

                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Chi phí từ:</Text>
                      <Text strong type="danger">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCost)}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </PageContainer>
  );
};

export default ExplorePage;
