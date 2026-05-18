import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';
import routes from './routes';

export default defineConfig({
	hash: true,
	antd: {
		// antd 5 theme config
		// https://ant.design/docs/react/customize-theme
		configProvider: {
			theme: {
				token: {
					colorPrimary: '#c00c0c',
					colorLink: '#c00c0c',
					borderRadius: 6,
				},
			},
		},
	},
	access: {},
	model: {},
	initialState: {},
	request: {},
	layout: {
		locale: false,
		...defaultSettings,
	},
	locale: {
		default: 'vi-VN',
		antd: true,
		baseNavigator: false,
	},
	routes,
	fastRefresh: true,
	mfsu: {
		strategy: 'normal',
	},
	define: Object.entries(process.env).reduce((result, [key, value]) => {
		if (key.startsWith('APP_CONFIG_')) {
			return {
				...result,
				[key]: value,
			};
		}
		return result;
	}, {}),
});
