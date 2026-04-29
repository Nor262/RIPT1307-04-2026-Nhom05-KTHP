import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Select, Typography, Alert, Row, Col, Progress, Statistic, Space, Divider } from 'antd';
import Chart from 'react-apexcharts';
import { getItineraries } from '../../../services/Travel/service';
import { Itinerary } from '../data';
import { AccountBookOutlined, CoffeeOutlined, HomeOutlined, CarOutlined } from '@ant-design/icons';

const { Text } = Typography;

const BudgetPage: React.FC = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getItineraries();
    setItineraries(res.data);
    if (res.data.length > 0) {
      setActiveId(res.data[0].id);
    }
  };

  const activeItin = itineraries.find(i => i.id === activeId);

  let totalFood = 0;
  let totalAcc = 0;
  let totalTrans = 0;
  
  if (activeItin) {
    activeItin.days.forEach(day => {
      day.destinations.forEach(dest => {
        totalFood += dest.costs?.food || 0;
        totalAcc += dest.costs?.accommodation || 0;
        totalTrans += dest.costs?.transport || 0;
      });
    });
  }

  const totalCost = totalFood + totalAcc + totalTrans;
  const budget = activeItin?.budget || 0;
  const isOverBudget = budget > 0 && totalCost > budget;

  const percentCost = budget > 0 ? Math.min(Math.round((totalCost / budget) * 100), 100) : 0;
  
  const getPercent = (value: number) => {
    if (totalCost === 0) return 0;
    return Math.round((value / totalCost) * 100);
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <PageContainer>
      <Card title="Chọn Lịch Trình Quản Lý Ngân Sách" style={{ marginBottom: 24 }}>
        <Select 
          style={{ width: 300 }} 
          value={activeId} 
          onChange={setActiveId}
          placeholder="-- Chọn lịch trình --"
          options={itineraries.map(i => ({ label: i.title, value: i.id }))}
        />
      </Card>

      {activeItin ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {isOverBudget && (
             <Alert
               message={`Cảnh báo: Bạn đã vượt ngân sách ${formatMoney(totalCost - budget)}!`}
               description="Tổng chi phí ước tính cao hơn ngân sách dự kiến của bạn. Hãy điều chỉnh lại lịch trình hoặc tăng ngân sách."
               type="error"
               showIcon
             />
          )}

          {!isOverBudget && budget > 0 && (
            <Alert
               message={`Ngân sách ổn định (Dư: ${formatMoney(budget - totalCost)})`}
               type="success"
               showIcon
            />
          )}

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
               <Card>
                 <Statistic 
                   title="Ngân Sách Dự Kiến" 
                   value={budget} 
                   prefix={<AccountBookOutlined />}
                   formatter={val => formatMoney(Number(val))} 
                 />
                 <Divider />
                 <Statistic 
                   title="Tổng Chi Phí Ước Tính" 
                   value={totalCost} 
                   valueStyle={{ color: isOverBudget ? '#cf1322' : '#3f8600' }}
                   formatter={val => formatMoney(Number(val))} 
                 />
                 
                 <div style={{ marginTop: 24, textAlign: 'center' }}>
                   <Progress type="dashboard" percent={percentCost} status={isOverBudget ? 'exception' : 'normal'} />
                   <div style={{ marginTop: 8 }}><Text type="secondary">Mức sử dụng ngân sách</Text></div>
                 </div>
               </Card>
            </Col>
            <Col xs={24} md={16}>
               <Card title="Phân bổ chi phí">
                 <Row gutter={[24, 24]} align="middle">
                   <Col xs={24} sm={12}>
                     <div style={{ marginBottom: 24 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Space><CoffeeOutlined style={{ color: '#1890ff' }}/> <Text strong>Ăn Uống</Text></Space>
                          <Text>{formatMoney(totalFood)}</Text>
                       </div>
                       <Progress strokeColor="#1890ff" percent={getPercent(totalFood)} />
                     </div>

                     <div style={{ marginBottom: 24 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Space><HomeOutlined style={{ color: '#52c41a' }}/> <Text strong>Lưu Trú</Text></Space>
                          <Text>{formatMoney(totalAcc)}</Text>
                       </div>
                       <Progress strokeColor="#52c41a" percent={getPercent(totalAcc)} />
                     </div>

                     <div style={{ marginBottom: 24 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Space><CarOutlined style={{ color: '#faad14' }}/> <Text strong>Di Chuyển</Text></Space>
                          <Text>{formatMoney(totalTrans)}</Text>
                       </div>
                       <Progress strokeColor="#faad14" percent={getPercent(totalTrans)} />
                     </div>
                   </Col>
                   <Col xs={24} sm={12} style={{ display: 'flex', justifyContent: 'center' }}>
                     {totalCost > 0 && (
                       <Chart
                         options={{
                           labels: ['Ăn Uống', 'Lưu Trú', 'Di Chuyển'],
                           colors: ['#1890ff', '#52c41a', '#faad14'],
                           legend: { position: 'bottom' }
                         }}
                         series={[totalFood, totalAcc, totalTrans]}
                         type="donut"
                         width="100%"
                       />
                     )}
                   </Col>
                 </Row>
               </Card>
            </Col>
          </Row>
        </Space>
      ) : (
        <Card>
          <Text type="secondary">Vui lòng chọn hoặc tạo mới một lịch trình để xem ngân sách.</Text>
        </Card>
      )}
    </PageContainer>
  );
};

export default BudgetPage;
