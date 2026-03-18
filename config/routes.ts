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
