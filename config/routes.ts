export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				title: 'Đăng nhập - Equipment Management System',
				component: './user/Login',
			},
			{
				path: '/user/register',
				layout: false,
				name: 'register',
				title: 'Đăng ký - Equipment Management System',
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
		title: 'Bảng điều khiển - Equipment Management System',
		component: './TrangChu',
		icon: 'HomeOutlined',
		access: 'authenticated',
	},

	// ĐẶT MƯỢN THIẾT BỊ — Borrower only
	{
		path: '/catalog',
		name: 'Đặt mượn Thiết bị',
		title: 'Danh sách thiết bị & Đặt mượn - Equipment Management System',
		icon: 'AppstoreOutlined',
		component: './Catalog',
		access: 'isBorrower',
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
				title: 'Quản lý danh sách thiết bị - Equipment Management System',
				component: './Equipment',
				icon: 'ToolOutlined',
				access: 'adminOrStorekeeper',
			},
			{
				path: '/asset/categories',
				name: 'Danh mục',
				title: 'Quản lý danh mục thiết bị - Equipment Management System',
				component: './Categories',
				icon: 'AppstoreOutlined',
				access: 'adminOnly',
			},
			{
				path: '/asset/suppliers',
				name: 'Nhà cung cấp',
				title: 'Quản lý nhà cung cấp - Equipment Management System',
				component: './Suppliers',
				icon: 'ShopOutlined',
				access: 'adminOnly',
			},
			{
				path: '/asset/locations',
				name: 'Vị trí kho',
				title: 'Quản lý vị trí kho - Equipment Management System',
				component: './Locations',
				icon: 'EnvironmentOutlined',
				access: 'adminOnly',
			},
			{
				path: '/asset/maintenance',
				name: 'Bảo trì thiết bị',
				title: 'Theo dõi & Bảo trì thiết bị - Equipment Management System',
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
				title: 'Danh sách đơn mượn thiết bị - Equipment Management System',
				component: './Bookings',
				icon: 'UnorderedListOutlined',
				access: 'adminOrStorekeeper',
			},
			{
				path: '/booking/handle',
				name: 'Bàn giao / Thu hồi',
				title: 'Bàn giao và Thu hồi thiết bị - Equipment Management System',
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
				title: 'Danh sách thiết bị quá hạn trả - Equipment Management System',
				component: './Reports/Overdue',
				icon: 'WarningOutlined',
				access: 'adminOnly',
			},
			{
				path: '/reports/export',
				name: 'Xuất báo cáo',
				title: 'Xuất báo cáo và Thống kê thiết bị - Equipment Management System',
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
		title: 'Hồ sơ cá nhân - Equipment Management System',
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
				title: 'Quản lý danh sách người dùng - Equipment Management System',
				component: './Users',
				icon: 'TeamOutlined',
				access: 'adminOnly',
			},
		],
	},

	{
		path: '/gioi-thieu',
		name: 'About',
		title: 'Giới thiệu - Equipment Management System',
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
