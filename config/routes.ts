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

	{
		path: '/quan-ly-clb',
		name: 'Quản lý Câu lạc bộ',
		icon: 'TeamOutlined',
		routes: [
			{
				path: '/quan-ly-clb/danh-sach',
				name: 'Danh sách CLB',
				component: './ClubManagement/ClubList',
			},
			{
				path: '/quan-ly-clb/don-dang-ky',
				name: 'Quản lý đơn đăng ký',
				component: './ClubManagement/Registration',
			},
			{
				path: '/quan-ly-clb/thanh-vien',
				name: 'Quản lý thành viên',
				component: './ClubManagement/Members',
			},
			{
				path: '/quan-ly-clb/thong-ke',
				name: 'Báo cáo thống kê',
				component: './ClubManagement/Statistics',
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
	// },

	{
		path: '/travel-planner',
		name: 'Kế hoạch Du lịch',
		icon: 'CompassOutlined',
		routes: [
			{
				path: '/travel-planner/explore',
				name: 'Khám phá',
				component: './TravelPlanner/Explore',
			},
			{
				path: '/travel-planner/itinerary',
				name: 'Lịch trình',
				component: './TravelPlanner/Itinerary',
			},
			{
				path: '/travel-planner/budget',
				name: 'Ngân sách',
				component: './TravelPlanner/Budget',
			},
			{
				path: '/travel-planner/admin',
				name: 'Quản trị điểm đến',
				component: './TravelPlanner/Admin',
			},
		],
	},

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
