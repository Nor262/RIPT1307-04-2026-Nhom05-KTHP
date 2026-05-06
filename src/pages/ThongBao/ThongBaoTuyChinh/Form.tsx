import TinyEditor from '@/components/TinyEditor';
import UploadFile from '@/components/Upload/UploadFile';
import { AppModules } from '@/services/base/constant';
import { dowLoadBieuMauNguoiNhan } from '@/services/ThongBao';
import { EVaiTroKhaoSat, TenVaiTroKhaoSat } from '@/services/ThongBao/constant';
import { currentRole } from '@/utils/ip';
import rules from '@/utils/rules';
import { resetFieldsForm } from '@/utils/utils';
import { DownloadOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select, Space } from 'antd';
import fileDownload from 'js-file-download';
import { useEffect } from 'react';
import { useModel } from '@umijs/max';

const FormThongBaoTuyChinh = (props: any) => {
	const { afterAddNew, type } = props;
	const [form] = Form.useForm();
	const {
		visibleThongBaoDanhSach,
		setVisibleThongBaoDanhSach,
		formSubmiting,
		guiThongBaoDanhSachModal,
		recordThongBaoDanhSach,
	} = useModel('thongbao.thongbao');

	useEffect(() => {
		if (!visibleThongBaoDanhSach) {
			resetFieldsForm(form);
			form.setFieldsValue({ content: '' });
		} else {
			form.setFieldsValue(recordThongBaoDanhSach);
		}
	}, [visibleThongBaoDanhSach, recordThongBaoDanhSach?.title]);

	const onDownloadTemplate = () => {
		try {
			dowLoadBieuMauNguoiNhan().then((res: any) => fileDownload(res.data, 'File biểu mẫu.xlsx'));
		} catch (er) {
			console.log('🚀 er:', er);
		}
	};

	const onFinish = async (values: any) => {
		await guiThongBaoDanhSachModal(
			values?.file?.fileList[0],
			type,
			values.title,
			values.content,
			AppModules[currentRole].title,
			values.vaiTroNguoiNhan,
			'0',
		)
			.then((rec) => {
				if (afterAddNew) afterAddNew(rec);
			})
			.catch((err) => console.log(err));
	};

	return (
		<Form layout='vertical' onFinish={onFinish} form={form}>
			<Row gutter={[12, 0]}>
				<Col span={24}>
					<Form.Item name='title' label='Tiêu đề' rules={[...rules.required, ...rules.text, ...rules.length(250)]}>
						<Input placeholder='Nhập tiêu đề' />
					</Form.Item>
				</Col>
				<Col span={24} md={12}>
					<Form.Item name='vaiTroNguoiNhan' label='Vai trò người nhận' rules={[...rules.required]}>
						<Select
							placeholder='Chọn vai trò người nhận'
							options={Object.values([EVaiTroKhaoSat.SINH_VIEN, EVaiTroKhaoSat.NHAN_VIEN]).map((item) => ({
								value: item,
								label: TenVaiTroKhaoSat[item],
							}))}
						/>
					</Form.Item>
				</Col>
				<Col span={24} md={12}>
					<Form.Item
						name='file'
						label={
							<Space>
								<span>Danh sách người nhận thông báo</span>

								<Button icon={<DownloadOutlined />} type='link' onClick={onDownloadTemplate}>
									Tải tập tin mẫu
								</Button>
							</Space>
						}
						rules={[...rules.required]}
					>
						<UploadFile maxCount={1} />
					</Form.Item>
				</Col>
				<Form.Item
					name='content'
					label='Nội dung chi tiết thông báo'
					rules={[...rules.requiredHtml]}
					extra={
						<div>
							<p>Hướng dẫn:</p>
							<ul style={{ margin: 0, paddingLeft: '20px', marginTop: -10 }}>
								<li>
									Các giá trị trong cú pháp <strong>{'{{..}}'}</strong> tương ứng với tên cột trong file Excel bạn tải
									lên.
								</li>
								<li>Đảm bảo file Excel có tiêu đề cột chính xác và đầy đủ ở hàng đầu tiên (A1, B1, ...).</li>
								<li>
									Ví dụ: Nếu file Excel có cột <strong>HOTEN</strong>, bạn có thể sử dụng <strong>{'{{HOTEN}}'}</strong>{' '}
									để hiển thị giá trị từ cột đó.
								</li>
								<li>Hãy kiểm tra file Excel để tránh lỗi trong quá trình xử lý.</li>
							</ul>
						</div>
					}
				>
					<TinyEditor height={300} hideMenubar />
				</Form.Item>
			</Row>

			<div className='form-footer'>
				<Button loading={formSubmiting} htmlType='submit' type='primary'>
					Xem trước
				</Button>
				<Button onClick={() => setVisibleThongBaoDanhSach(false)}>Hủy</Button>
			</div>
		</Form>
	);
};

export default FormThongBaoTuyChinh;
