export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './Dashboard', // Updated to new Dashboard page
		icon: 'HomeOutlined',
	},

	{
		path: '/dat-lich-hen',
		name: 'Đặt lịch hẹn',
		icon: 'CalendarOutlined',
		routes: [
			{
				path: '/dat-lich-hen/nhan-vien',
				name: 'Nhân viên',
				component: './AppointmentBooking/Staff',
			},
			{
				path: '/dat-lich-hen/dich-vu',
				name: 'Dịch vụ',
				component: './AppointmentBooking/Services',
			},
			{
				path: '/dat-lich-hen/lich-hen',
				name: 'Lịch hẹn',
				component: './AppointmentBooking/Appointments',
			},
			{
				path: '/dat-lich-hen/danh-gia',
				name: 'Đánh giá',
				component: './AppointmentBooking/Reviews',
			},
			{
				path: '/dat-lich-hen/thong-ke',
				name: 'Thống kê',
				component: './AppointmentBooking/Statistics',
			},
		],
	},

	{
		path: '/quan-ly-van-bang',
		name: 'Quản lý văn bằng',
		icon: 'SolutionOutlined',
		routes: [
			{
				path: '/quan-ly-van-bang/so-van-bang',
				name: 'Sổ văn bằng',
				component: './ManageDiploma/DiplomaBooks',
			},
			{
				path: '/quan-ly-van-bang/quyet-dinh',
				name: 'Quyết định tốt nghiệp',
				component: './ManageDiploma/Decisions',
			},
			{
				path: '/quan-ly-van-bang/cau-hinh-mau',
				name: 'Cấu hình mẫu',
				component: './ManageDiploma/FormConfig',
			},
			{
				path: '/quan-ly-van-bang/thong-tin',
				name: 'Thông tin văn bằng',
				component: './ManageDiploma/DiplomaInfo',
			},
			{
				path: '/quan-ly-van-bang/tra-cuu',
				name: 'Tra cứu',
				component: './ManageDiploma/Inquiries',
			},
		],
	},

	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
