import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { notification } from 'antd';
import 'moment/locale/vi';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, useLocation } from '@umijs/max';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundContent from './pages/exception/404';
import type { IInitialState } from './services/base/typing';
import './styles/global.less';
import { useAuthStore } from './stores/useAuthStore';
import defaultSettings from '../config/defaultSettings';
import React, { useEffect, useState } from 'react';
import { Spin, ConfigProvider } from 'antd';

export function rootContainer(container: React.ReactNode) {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 12,
          colorBgLayout: '#f3f4f6',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          colorTextHeading: '#1f2937',
          colorText: '#374151',
        },
        components: {
          Button: {
            controlHeight: 40,
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          },
          Input: {
            controlHeight: 40,
            borderRadius: 8,
          },
          Select: {
            controlHeight: 40,
            borderRadius: 8,
          },
          Card: {
            boxShadowTertiary: '0 4px 24px rgba(0, 0, 0, 0.04)',
          }
        }
      }}
    >
      {container}
    </ConfigProvider>
  );
}

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
		actionsRender: () => (
			<>
				<RightContent />
			</>
		),
		disableContentMargin: false,

		footerRender: () => (
			<>
				<Footer />
			</>
		),

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
				<ContentWrapper dom={dom as any} />
			</ErrorBoundary>
		),
		
		// ProLayout Premium Styling
		token: {
			header: {
				colorBgHeader: 'rgba(255, 255, 255, 0.65)',
				colorHeaderTitle: '#1f2937',
			},
			sider: {
				colorMenuBackground: '#ffffff',
				colorBgMenuItemSelected: 'rgba(22, 119, 255, 0.08)',
				colorTextMenuSelected: '#1677ff',
			},
			pageContainer: {
				colorBgPageContainer: '#f3f4f6',
			}
		},
		headerStyle: {
			backdropFilter: 'blur(12px)',
			WebkitBackdropFilter: 'blur(12px)',
			boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
			borderBottom: '1px solid rgba(0,0,0,0.04)',
		},
		siderStyle: {
			boxShadow: '2px 0 8px rgba(0,0,0,0.02)',
			borderRight: 'none',
		},
		
		...initialState?.settings,
		...defaultSettings,
	} as any;
};
