import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';
import routes from './routes';

const APP_CONFIG_TEN_TRUONG = process.env.APP_CONFIG_TEN_TRUONG || 'Học viện Công nghệ Bưu chính Viễn thông';
const APP_CONFIG_TIEN_TO_TRUONG = process.env.APP_CONFIG_TIEN_TO_TRUONG || 'PTIT';
const APP_CONFIG_TEN_TRUONG_VIET_TAT_TIENG_ANH = process.env.APP_CONFIG_TEN_TRUONG_VIET_TAT_TIENG_ANH || 'PTIT';

export default defineConfig({
	title: 'Equipment Management System',
	hash: true,
	esbuildMinifyIIFE: true,
	metas: [
		{ name: 'description', content: `Hệ thống Quản lý Thiết bị dùng chung tại ${APP_CONFIG_TEN_TRUONG}. Giải pháp số hóa toàn diện vòng đời thiết bị: quản lý mượn/trả, in/quét mã QR, kiểm kê, bảo trì và thanh lý.` },
		{ name: 'keywords', content: `${APP_CONFIG_TIEN_TO_TRUONG}, ${APP_CONFIG_TEN_TRUONG_VIET_TAT_TIENG_ANH}, quản lý thiết bị, equipment management system, mượn trả thiết bị, quét mã QR, quản lý tài sản, chuyển đổi số` },
		{ name: 'robots', content: 'index, follow' },
		{ name: 'author', content: `${APP_CONFIG_TEN_TRUONG_VIET_TAT_TIENG_ANH} Group` },
		// Open Graph
		{ property: 'og:type', content: 'website' },
		{ property: 'og:url', content: 'https://equipmentmanagementsystem.netlify.app/' },
		{ property: 'og:title', content: `Equipment Management System - ${APP_CONFIG_TEN_TRUONG}` },
		{ property: 'og:description', content: `Giải pháp toàn diện quản lý vòng đời thiết bị, mượn/trả nhanh chóng bằng QR code tại ${APP_CONFIG_TEN_TRUONG}.` },
		{ property: 'og:image', content: 'https://equipmentmanagementsystem.netlify.app/metadata.png' },
		// Twitter
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:url', content: 'https://equipmentmanagementsystem.netlify.app/' },
		{ name: 'twitter:title', content: `Equipment Management System - ${APP_CONFIG_TEN_TRUONG}` },
		{ name: 'twitter:description', content: `Giải pháp toàn diện quản lý vòng đời thiết bị, mượn/trả nhanh chóng bằng QR code tại ${APP_CONFIG_TEN_TRUONG}.` },
		{ name: 'twitter:image', content: 'https://equipmentmanagementsystem.netlify.app/metadata.png' },
	],
	links: [
		{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
		{ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'true' },
		{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' },
		{ rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
		{ rel: 'icon', type: 'image/png', href: '/favicon.png', sizes: '32x32' },
		{ rel: 'shortcut icon', href: '/favicon.ico' },
		{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
		{ rel: 'manifest', href: '/site.webmanifest' },
	],
	headScripts: [
		{
			type: 'application/ld+json',
			content: JSON.stringify({
				"@context": "https://schema.org",
				"@graph": [
					{
						"@type": "WebApplication",
						"@id": "https://equipmentmanagementsystem.netlify.app/#webapp",
						"url": "https://equipmentmanagementsystem.netlify.app/",
						"name": "Equipment Management System",
						"applicationCategory": "BusinessApplication",
						"operatingSystem": "All",
						"browserRequirements": "Requires HTML5. Requires JavaScript.",
						"description": `Hệ thống Quản lý Thiết bị dùng chung tại ${APP_CONFIG_TEN_TRUONG}. Giải pháp số hóa toàn diện vòng đời thiết bị: quản lý mượn/trả, in/quét mã QR, kiểm kê, bảo trì và thanh lý.`,
						"provider": {
							"@type": "Organization",
							"name": APP_CONFIG_TEN_TRUONG,
							"url": "https://equipmentmanagementsystem.netlify.app/"
						}
					},
					{
						"@type": "WebSite",
						"@id": "https://equipmentmanagementsystem.netlify.app/#website",
						"url": "https://equipmentmanagementsystem.netlify.app/",
						"name": "Equipment Management System",
						"description": "Cổng thông tin quản lý thiết bị đa nền tảng.",
						"publisher": {
							"@type": "Organization",
							"name": APP_CONFIG_TEN_TRUONG
						}
					}
				]
			})
		}
	],
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
