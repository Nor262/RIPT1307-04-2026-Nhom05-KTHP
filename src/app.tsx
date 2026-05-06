import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { notification } from 'antd';
import 'moment/locale/vi';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { getIntl, getLocale, history, useLocation } from '@umijs/max';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundContent from './pages/exception/404';
import type { IInitialState } from './services/base/typing';
import './styles/global.less';
import { useAuthStore } from './stores/useAuthStore';
import defaultSettings from '../config/defaultSettings';
import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';

const ContentWrapper = ({ dom }: { dom: React.ReactNode }) => {
	const location = useLocation();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		const timer = setTimeout(() => {
			setLoading(false);
		}, 400); // Slight delay for smooth transition
		return () => clearTimeout(timer);
	}, [location.pathname]);

	return (
		<div style={{ position: 'relative', minHeight: 'calc(100vh - 200px)' }}>
			{loading && (
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: 'rgba(255, 255, 255, 0.7)',
						zIndex: 999,
						borderRadius: '8px',
						backdropFilter: 'blur(2px)',
					}}
				>
					<Spin size="large" tip="Đang tải..." />
				</div>
			)}
			<div
				style={{
					opacity: loading ? 0.3 : 1,
					filter: loading ? 'blur(1px)' : 'none',
					transition: 'all 0.3s ease-in-out',
				}}
			>
				{dom}
			</div>
		</div>
	);
};



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
				<ContentWrapper dom={dom} />
			</ErrorBoundary>
		),
		...initialState?.settings,
		...defaultSettings,
	};
};
