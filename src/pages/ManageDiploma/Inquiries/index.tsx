import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { searchDiploma, getInquiryStats, InquirySearchCount } from '@/services/ManageDiploma/inquiry';
import { DiplomaInfo } from '@/services/ManageDiploma/diplomaInfo';
import { getDecisions, Decision } from '@/services/ManageDiploma/decision';
import { Card, Form, Input, Button, message, Tabs, Table, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getFormConfigFields, FormConfigField } from '@/services/ManageDiploma/formConfig';

const { TabPane } = Tabs;

const InquiriesPage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchResults, setSearchResults] = useState<DiplomaInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DiplomaInfo | null>(null);

  const handleViewDetails = (record: DiplomaInfo) => {
    setSelectedRecord(record);
    setIsDetailVisible(true);
  };
  
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [stats, setStats] = useState<InquirySearchCount[]>([]);
  const [configFields, setConfigFields] = useState<FormConfigField[]>([]);

  const loadDependencies = async () => {
    const resDec = await getDecisions();
    setDecisions(resDec.data || []);
    const resStats = await getInquiryStats();
    setStats(resStats.data || []);
    const resConf = await getFormConfigFields();
    setConfigFields(resConf.data || []);
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  const handleSearch = async (values: any) => {
    setLoading(true);
    setHasSearched(false);
    try {
      const res = await searchDiploma(values);
      setSearchResults(res.data);
      setHasSearched(true);
      message.success(`Tìm thấy ${res.data.length} kết quả`);
      // Reload stats after search
      loadDependencies();
    } catch (error: any) {
      message.error(error.message || 'Lỗi tra cứu');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: ProColumns<DiplomaInfo>[] = [
    {
      title: 'Số hiệu văn bằng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Số vào sổ',
      dataIndex: 'entryNumber',
      key: 'entryNumber',
    },
    {
      title: 'Mã SV',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
    },
    {
      title: 'Quyết định',
      dataIndex: 'decisionId',
      key: 'decisionId',
      render: (_, record) => {
        const dec = decisions.find(d => d.id === record.decisionId);
        return dec ? dec.id : record.decisionId;
      },
    },
    // Dynamic fields
    ...configFields.map(field => ({
      title: field.name,
      dataIndex: ['dynamicFields', field.id],
      key: field.id,
      hideInTable: true, // Only show in details modal to save space
    })),
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <a onClick={() => handleViewDetails(record)}>Xem chi tiết</a>
      ),
    },
  ];

  const statColumns = [
    {
      title: 'Số Quyết định',
      dataIndex: 'decisionId',
      key: 'decisionId',
    },
    {
      title: 'Lượt tra cứu',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  return (
    <PageContainer>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Tra cứu văn bằng" key="1">
          <Card className="mb-4">
            <Form form={form} layout="vertical" onFinish={handleSearch}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 16px' }}>
                <div style={{ flex: '1 1 30%' }}>
                  <Form.Item name="id" label="Số hiệu văn bằng">
                    <Input placeholder="Nhập số hiệu" />
                  </Form.Item>
                </div>
                <div style={{ flex: '1 1 30%' }}>
                  <Form.Item name="entryNumber" label="Số vào sổ">
                    <Input placeholder="Nhập số vào sổ" />
                  </Form.Item>
                </div>
                <div style={{ flex: '1 1 30%' }}>
                  <Form.Item name="studentId" label="Mã sinh viên">
                    <Input placeholder="Nhập MSV" />
                  </Form.Item>
                </div>
                <div style={{ flex: '1 1 30%' }}>
                  <Form.Item name="fullName" label="Họ tên">
                    <Input placeholder="Nhập họ tên" />
                  </Form.Item>
                </div>
                <div style={{ flex: '1 1 30%' }}>
                  <Form.Item name="dateOfBirth" label="Ngày sinh">
                    <Input placeholder="YYYY-MM-DD" />
                  </Form.Item>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ marginRight: 16, color: '#888' }}>
                  * Yêu cầu nhập ít nhất 2 tham số để tìm kiếm
                </span>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                  Tra cứu
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={() => form.resetFields()}>
                  Xóa trắng
                </Button>
              </div>
            </Form>
          </Card>

          {hasSearched && (
            <ProTable<DiplomaInfo>
              headerTitle="Kết quả tra cứu"
              dataSource={searchResults}
              rowKey="id"
              columns={columns}
              search={false}
              options={false}
              pagination={{ pageSize: 10 }}
            />
          )}
        </TabPane>

        <TabPane tab="Thống kê" key="2">
          <Card title="Thống kê số lượt tra cứu theo Quyết định tốt nghiệp">
            <Table 
              dataSource={stats} 
              columns={statColumns} 
              rowKey="decisionId" 
              pagination={{ pageSize: 10 }} 
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="Chi tiết văn bằng"
        visible={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedRecord && (
          <div>
            <h3>Thông tin sinh viên và văn bằng</h3>
            <p><strong>Số hiệu:</strong> {selectedRecord.id}</p>
            <p><strong>Số vào sổ:</strong> {selectedRecord.entryNumber}</p>
            <p><strong>Mã SV:</strong> {selectedRecord.studentId}</p>
            <p><strong>Họ tên:</strong> {selectedRecord.fullName}</p>
            <p><strong>Ngày sinh:</strong> {selectedRecord.dateOfBirth}</p>
            
            {configFields.map(f => (
              <p key={f.id}><strong>{f.name}:</strong> {selectedRecord.dynamicFields?.[f.id]}</p>
            ))}

            <hr style={{ margin: '16px 0' }} />
            <h3>Thông tin Quyết định tốt nghiệp</h3>
            {(() => {
              const dec = decisions.find(d => d.id === selectedRecord.decisionId);
              if (!dec) return <p>Không tìm thấy quyết định.</p>;
              return (
                <>
                  <p><strong>Số QĐ:</strong> {dec.id}</p>
                  <p><strong>Ngày ban hành:</strong> {dec.issueDate}</p>
                  <p><strong>Trích yếu:</strong> {dec.summary}</p>
                  <p><strong>Sổ quản lý:</strong> {dec.diplomaBookId}</p>
                </>
              );
            })()}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default InquiriesPage;
