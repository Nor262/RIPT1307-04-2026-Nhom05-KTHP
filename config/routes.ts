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
		path: '/products',
		name: 'Quản lý Sản phẩm',
		component: './ProductManagement',
		icon: 'ShoppingOutlined',
	},
	{
		path: '/orders',
		name: 'Quản lý Đơn hàng',
		component: './OrderManagement',
		icon: 'SolutionOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/todo-list',
		name: 'TodoList',
		icon: 'OrderedListOutlined',
		component: './TodoList',
	},
	{
		path: '/oan-tu-ti',
		name: 'Oẳn Tù Tì',
		component: './RockPaperScissors',
		icon: 'ScissorOutlined',
	},
	{
		path: '/ngan-hang-cau-hoi',
		name: 'Ngân hàng câu hỏi',
		icon: 'DatabaseOutlined',
		routes: [
			{
				path: '/ngan-hang-cau-hoi/khoi-kien-thuc',
				name: 'Khối kiến thức',
				component: './QuestionBank/KnowledgeBlocks',
			},
			{
				path: '/ngan-hang-cau-hoi/mon-hoc',
				name: 'Môn học',
				component: './QuestionBank/Subjects',
			},
			{
				path: '/ngan-hang-cau-hoi/cau-hoi',
				name: 'Câu hỏi',
				component: './QuestionBank/Questions',
			},
			{
				path: '/ngan-hang-cau-hoi/de-thi',
				name: 'Đề thi',
				component: './QuestionBank/Exams',
			},
			{
				path: '/ngan-hang-cau-hoi/tao-de-thi',
				name: 'Tạo đề thi',
				component: './QuestionBank/Exams/CreateExam',
				hideInMenu: true,
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
