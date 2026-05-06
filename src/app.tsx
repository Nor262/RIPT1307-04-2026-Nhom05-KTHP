import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { notification } from 'antd';
import 'moment/locale/vi';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { getIntl, getLocale, history } from '@umijs/max';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundContent from './pages/exception/404';
import type { IInitialState } from './services/base/typing';
import './styles/global.less';
import { useAuthStore } from './stores/useAuthStore';
import defaultSettings from '../config/defaultSettings';



export async function getInitialState(): Promise<IInitialState> {
	await useAuthStore.getState().fetchProfile();
	const user = useAuthStore.getState().user;
	
	return {
		currentUser: user as any,
		permissionLoading: false,
	};
}

/**
 * @see https://umijs.org/docs/max/request
 */
export const request: RequestConfig = {
	timeout: 10000,
	errorConfig: {
		errorHandler: (error: any) => {
			const { response } = error;
			if (response && response.status) {
				const { status, statusText, url } = response;
				notification.error({
					message: `Yêu cầu lỗi ${status}: ${url}`,
					description: statusText,
				});
			} else if (!response) {
				notification.error({
					description: 'Yêu cầu gặp lỗi, vui lòng thử lại sau',
					message: 'Lỗi mạng',
				});
			}
			throw error;
		},
	},
};

// ProLayout  https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
	return {
		noFound: <NotFoundContent />,
		actionsRender: () => <RightContent />,
		disableContentMargin: false,

		footerRender: () => <Footer />,

		onPageChange: () => {
			const { location } = history;
			const isAuthenticated = useAuthStore.getState().isAuthenticated;
			
			// Bypass login/register pages
			if (location.pathname.startsWith('/user')) return;

			if (!isAuthenticated) {
				history.replace('/user/login');
			} else if (location.pathname === '/') {
				history.replace('/dashboard');
			}
		},

		menuItemRender: (item: any, dom: any) => (
			<a
				key={item?.path}
				onClick={() => {
					history.push(item?.path ?? '/');
				}}
				style={{ cursor: 'pointer', display: 'block' }}
			>
				{dom}
			</a>
		),

		childrenRender: (dom) => (
			<ErrorBoundary>
				{dom}
			</ErrorBoundary>
		),
		...initialState?.settings,
		...defaultSettings,
	};
};
