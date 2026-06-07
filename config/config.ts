import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';
import routes from './routes';

export default defineConfig({
	title: 'Equipment Management System',
	hash: true,
	esbuildMinifyIIFE: true,
	antd: {
		// antd 5 theme config
		// https://ant.design/docs/react/customize-theme
		configProvider: {
			theme: {
				token: {
					colorPrimary: '#C00C0C',
					colorLink: '#C00C0C',
					colorBgBase: '#FAFAF8',
					colorTextBase: '#1A1A1A',
					colorTextLightSolid: '#FFFFFF',
					colorBorder: '#E8E4DF',
					colorError: '#A85448',
					borderRadius: 6,
					fontFamily: '"Source Sans 3", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
				},
				components: {
					Button: {
						controlHeight: 44,
						borderRadius: 6,
					},
					Input: {
						controlHeight: 44,
						borderRadius: 6,
						colorBgContainer: 'rgba(255, 255, 255, 0.5)',
					},
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
