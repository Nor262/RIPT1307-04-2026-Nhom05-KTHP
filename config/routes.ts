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
	// DASHBOARD — accessible by all authenticated users
	// The component itself renders different views per role
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
		access: 'authenticated',
	},

	// QUẢN LÝ TÀI SẢN — Admin + Storekeeper
	{
		path: '/asset',
		name: 'Quản lý Tài sản',
		icon: 'DatabaseOutlined',
		access: 'adminOrStorekeeper',
		routes: [
			{
				path: '/asset/equipment',
				name: 'Thiết bị',
				component: './Equipment',
				icon: 'ToolOutlined',
				access: 'adminOrStorekeeper',
			},
			{
				path: '/asset/categories',
				name: 'Danh mục',
				component: './Categories',
				icon: 'AppstoreOutlined',
				access: 'adminOnly',
			},
			{
				path: '/asset/suppliers',
				name: 'Nhà cung cấp',
				component: './Suppliers',
				icon: 'ShopOutlined',
				access: 'adminOnly',
			},
			{
				path: '/asset/locations',
				name: 'Vị trí kho',
				component: './Locations',
				icon: 'EnvironmentOutlined',
				access: 'adminOnly',
			},
			{
				path: '/asset/maintenance',
				name: 'Bảo trì thiết bị',
				component: './Maintenance',
				icon: 'ToolOutlined',
				access: 'adminOrStorekeeper',
			},
		],
	},

	// NGHIỆP VỤ MƯỢN/TRẢ — Admin + Storekeeper
	{
		path: '/booking',
		name: 'Mượn / Trả',
		icon: 'SwapOutlined',
		access: 'adminOrStorekeeper',
		routes: [
			{
				path: '/booking/list',
				name: 'Danh sách đơn mượn',
				component: './Bookings',
				icon: 'UnorderedListOutlined',
				access: 'adminOrStorekeeper',
			},
			{
				path: '/booking/handle',
				name: 'Bàn giao / Thu hồi',
				component: './Transactions/HandleTransaction',
				icon: 'ScanOutlined',
				access: 'adminOrStorekeeper',
			},
		],
	},

	// BÁO CÁO & THỐNG KÊ — Admin only
	{
		path: '/reports',
		name: 'Báo cáo',
		icon: 'BarChartOutlined',
		access: 'adminOnly',
		routes: [
			{
				path: '/reports/overdue',
				name: 'Quá hạn trả',
				component: './Reports/Overdue',
				icon: 'WarningOutlined',
				access: 'adminOnly',
			},
			{
				path: '/reports/export',
				name: 'Xuất báo cáo',
				component: './Reports/ExportReport',
				icon: 'FileExcelOutlined',
				access: 'adminOnly',
			},
		],
	},

	// HỒ SƠ CÁ NHÂN
	{
		path: '/profile',
		name: 'Hồ sơ cá nhân',
		icon: 'UserOutlined',
		component: './Profile',
		access: 'authenticated',
	},

	// QUẢN TRỊ HỆ THỐNG — Admin only
	{
		path: '/system',
		name: 'Hệ thống',
		icon: 'SettingOutlined',
		access: 'adminOnly',
		routes: [
			{
				path: '/system/users',
				name: 'Quản lý người dùng',
				component: './Users',
				icon: 'TeamOutlined',
				access: 'adminOnly',
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
