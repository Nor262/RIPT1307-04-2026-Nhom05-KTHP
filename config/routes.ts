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
				path: '/user/register',
				layout: false,
				name: 'register',
				component: './user/Register',
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
		component: './TrangChu',
		icon: 'HomeOutlined',
	},

	// QUẢN LÝ TÀI SẢN
	{
		path: '/asset',
		name: 'Quản lý Tài sản',
		icon: 'DatabaseOutlined',
		routes: [
			{
				path: '/asset/equipment',
				name: 'Thiết bị',
				component: './Equipment',
				icon: 'ToolOutlined',
			},
			{
				path: '/asset/categories',
				name: 'Danh mục',
				component: './Categories',
				icon: 'AppstoreOutlined',
			},
			{
				path: '/asset/suppliers',
				name: 'Nhà cung cấp',
				component: './Suppliers',
				icon: 'ShopOutlined',
			},
			{
				path: '/asset/locations',
				name: 'Vị trí kho',
				component: './Locations',
				icon: 'EnvironmentOutlined',
			},
			{
				path: '/asset/maintenance',
				name: 'Bảo trì thiết bị',
				component: './Maintenance',
				icon: 'ToolOutlined',
			},
		],
	},

	// NGHIỆP VỤ MƯỢN/TRẢ
	{
		path: '/booking',
		name: 'Mượn / Trả',
		icon: 'SwapOutlined',
		routes: [
			{
				path: '/booking/list',
				name: 'Danh sách đơn mượn',
				component: './Bookings',
				icon: 'UnorderedListOutlined',
			},
			{
				path: '/booking/handle',
				name: 'Bàn giao / Thu hồi',
				component: './Transactions/HandleTransaction',
				icon: 'ScanOutlined',
			},
		],
	},

	// BÁO CÁO & THỐNG KÊ
	{
		path: '/reports',
		name: 'Báo cáo',
		icon: 'BarChartOutlined',
		routes: [
			{
				path: '/reports/overdue',
				name: 'Quá hạn trả',
				component: './Reports/Overdue',
				icon: 'WarningOutlined',
			},
			{
				path: '/reports/export',
				name: 'Xuất báo cáo',
				component: './Reports/ExportReport',
				icon: 'FileExcelOutlined',
			},
		],
	},

	// QUẢN TRỊ HỆ THỐNG
	{
		path: '/system',
		name: 'Hệ thống',
		icon: 'SettingOutlined',
		routes: [
			{
				path: '/system/users',
				name: 'Quản lý người dùng',
				component: './Users',
				icon: 'TeamOutlined',
			},
		],
	},

	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
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
