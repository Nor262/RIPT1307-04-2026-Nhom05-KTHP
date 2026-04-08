import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Button, Row, Col, Typography, Select, List, Space, Input, InputNumber, Divider, Popconfirm, message } from 'antd';
import { Destination, Itinerary, DayPlan } from '../data';
import { getDestinations, getItineraries, saveItinerary, removeItinerary } from '../../../services/Travel/service';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, SaveOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ItineraryPage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [activeItineraryId, setActiveItineraryId] = useState<string | 'NEW'>('NEW');

  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState(0);
  const [days, setDays] = useState<DayPlan[]>([{ id: 'day-1', dayNumber: 1, destinations: [] }]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const destRes = await getDestinations();
    setDestinations(destRes.data);

    const itinsRes = await getItineraries();
    setItineraries(itinsRes.data);
  };

  useEffect(() => {
    if (activeItineraryId === 'NEW') {
      setTitle('');
      setBudget(0);
      setDays([{ id: Date.now().toString(), dayNumber: 1, destinations: [] }]);
    } else {
      const selected = itineraries.find(i => i.id === activeItineraryId);
      if (selected) {
        setTitle(selected.title);
        setBudget(selected.budget);
        setDays(selected.days || []);
      }
    }
  }, [activeItineraryId, itineraries]);

  const handleAddDay = () => {
    const nextDay = days.length > 0 ? Math.max(...days.map(d => d.dayNumber)) + 1 : 1;
    setDays([...days, { id: Date.now().toString(), dayNumber: nextDay, destinations: [] }]);
  };

  const handleDeleteDay = (dayId: string) => {
    setDays(days.filter(d => d.id !== dayId));
  };

  const handleAddDestToDay = (dayId: string, destId: string) => {
    const dest = destinations.find(d => d.id === destId);
    if (!dest) return;

    setDays(days.map(day => {
      if (day.id === dayId) {
        return { ...day, destinations: [...day.destinations, dest] };
      }
      return day;
    }));
  };

  const handleRemoveDestFromDay = (dayId: string, idx: number) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        const newDests = [...day.destinations];
        newDests.splice(idx, 1);
        return { ...day, destinations: newDests };
      }
      return day;
    }));
  };

  const moveDest = (dayId: string, idx: number, direction: -1 | 1) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        const newDests = [...day.destinations];
        if (idx + direction >= 0 && idx + direction < newDests.length) {
          const temp = newDests[idx];
          newDests[idx] = newDests[idx + direction];
          newDests[idx + direction] = temp;
        }
        return { ...day, destinations: newDests };
      }
      return day;
    }));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      message.error('Vui lòng nhập tên lịch trình');
      return;
    }

    const newItinerary: Itinerary = {
      id: activeItineraryId === 'NEW' ? Date.now().toString() : activeItineraryId,
      title,
      budget,
      days,
      createdAt: Date.now(),
    };

    const res = await saveItinerary(newItinerary);
    if (res.success) {
      await loadData();
      if (activeItineraryId === 'NEW') {
         setActiveItineraryId(newItinerary.id);
      }
    }
  };

  const handleDeleteItinerary = async () => {
    if (activeItineraryId !== 'NEW') {
      const res = await removeItinerary(activeItineraryId);
      if (res.success) {
        setActiveItineraryId('NEW');
        await loadData();
      }
    }
  };

  const calculateTotalCost = () => {
    let total = 0;
    days.forEach(day => {
      day.destinations.forEach(d => {
        total += (d.costs?.food || 0) + (d.costs?.accommodation || 0) + (d.costs?.transport || 0);
      });
    });
    return total;
  };

  const calculateTotalTime = () => {
    let total = 0;
    days.forEach(day => {
      day.destinations.forEach(d => {
        total += (d.timeToVisit || 0);
      });
    });
    return total;
  };

  return (
    <PageContainer>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
           <Card title="Quản lý Lịch trình" extra={<Button type="link" onClick={() => setActiveItineraryId('NEW')} icon={<PlusOutlined />}>Tạo mới</Button>}>
             <Select
                style={{ width: '100%', marginBottom: 16 }}
                value={activeItineraryId}
                onChange={setActiveItineraryId}
                options={[
                  { label: '-- Tạo lịch trình mới --', value: 'NEW' },
                  ...itineraries.map(i => ({ label: i.title, value: i.id }))
                ]}
             />

              <Divider />
              
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary">Tóm tắt lịch trình hiện tại:</Text>
                <div>
                  <Text>Tổng số ngày: </Text><Text strong>{days.length}</Text>
                </div>
                <div>
                  <Text>Tổng điểm đến: </Text><Text strong>{days.reduce((acc, curr) => acc + curr.destinations.length, 0)}</Text>
                </div>
                <div>
                  <Text>Tổng thời gian tham quan: </Text><Text strong>{calculateTotalTime()} giờ</Text>
                </div>
                <div>
                  <Text>Tổng chi phí dự kiến: </Text><Text strong type="danger">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotalCost())}</Text>
                </div>
              </Space>

           </Card>
        </Col>

        <Col xs={24} md={16}>
           <Card 
              title={activeItineraryId === 'NEW' ? 'Soạn lịch trình mới' : `Chỉnh sửa: ${title}`}
              extra={
                <Space>
                  {activeItineraryId !== 'NEW' && (
                    <Popconfirm title="Xóa lịch trình này?" onConfirm={handleDeleteItinerary}>
                      <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                  )}
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>Lưu Lịch Trình</Button>
                </Space>
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">Tên lịch trình:</Text>
                    <Input placeholder="Ví dụ: Chuyến đi Phú Quốc 3 Ngày" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">Ngân sách dự kiến (VNĐ):</Text>
                    <InputNumber style={{ width: '100%' }} min={0} step={100000} value={budget} onChange={(val) => setBudget(val || 0)} />
                  </div>
                </Col>
              </Row>

              <Divider />

              {days.map((day, dIdx) => (
                <Card 
                  key={day.id} 
                  type="inner" 
                  title={`Ngày ${day.dayNumber}`} 
                  style={{ marginBottom: 16 }}
                  extra={
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteDay(day.id)} />
                  }
                >
                  <Space style={{ marginBottom: 16, width: '100%' }}>
                    <Select
                       style={{ width: 300 }}
                       showSearch
                       placeholder="Chọn điểm đến để thêm vào ngày này"
                       optionFilterProp="children"
                       onChange={(val) => handleAddDestToDay(day.id, val as string)}
                       value={undefined as any}
                    >
                       {destinations.map(d => (
                         <Select.Option key={d.id} value={d.id}>{d.name} ({d.location})</Select.Option>
                       ))}
                    </Select>
                  </Space>

                  <List
                    size="small"
                    bordered
                    dataSource={day.destinations}
                    renderItem={(dest, idx) => (
                      <List.Item
                        actions={[
                          <Button key="up" type="text" size="small" icon={<ArrowUpOutlined />} disabled={idx === 0} onClick={() => moveDest(day.id, idx, -1)} />,
                          <Button key="down" type="text" size="small" icon={<ArrowDownOutlined />} disabled={idx === day.destinations.length - 1} onClick={() => moveDest(day.id, idx, 1)} />,
                          <Button key="del" type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleRemoveDestFromDay(day.id, idx)} />
                        ]}
                      >
                        <List.Item.Meta
                          title={dest.name}
                          description={`Chi phí: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((dest.costs?.food||0) + (dest.costs?.accommodation||0) + (dest.costs?.transport||0))} - Thời gian: ${dest.timeToVisit}h`}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              ))}

              <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAddDay}>
                Thêm Ngày
              </Button>
           </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ItineraryPage;
