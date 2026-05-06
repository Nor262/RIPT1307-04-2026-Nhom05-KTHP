import { ProLayoutProps } from '@ant-design/pro-components';

const Settings: ProLayoutProps & {
	pwa?: boolean;
	logo?: string;
	borderRadiusBase: string;
	siderWidth: number;
} = {
	navTheme: 'light',
	primaryColor: process.env.APP_CONFIG_PRIMARY_COLOR,
	borderRadiusBase: '2px',
	layout: 'mix',
	contentWidth: 'Fluid',
	fixedHeader: true,
	fixSiderbar: true,
	colorWeak: false,
	title: 'LẬP TRÌNH WEB - RIPT',
	pwa: false,
	logo: '/logo.png',
	iconfontUrl: '',
	headerTheme: 'light',
	headerHeight: 56,
	siderWidth: 220,
};

export default Settings;
