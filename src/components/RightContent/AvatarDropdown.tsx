import { history } from 'umi';
import { landingUrl } from '@/services/base/constant';
import { FileWordOutlined, GlobalOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin } from 'antd';
import type { MenuProps } from 'antd';
import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import HeaderDropdown from './HeaderDropdown';
import styles from './index.less';

export type GlobalHeaderRightProps = {
	menu?: boolean;
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	const loginOut = () => logout();

	if (!user)
		return (
			<span className={`${styles.action} ${styles.account}`}>
				<Spin size='small' style={{ marginLeft: 8, marginRight: 8 }} />
			</span>
		);

	const fullName = user.full_name || user.email || 'User';
	const lastNameChar = fullName.split(' ')?.at(-1)?.[0]?.toUpperCase() || 'U';

	const items: MenuProps['items'] = [
		{
			key: 'name',
			icon: <UserOutlined />,
			label: fullName,
			onClick: () => history.push('/profile'),
		},
		{
			key: 'office',
			icon: <FileWordOutlined />,
			label: 'Office 365',
			onClick: () => window.open('https://office.com/'),
		},
		{
			key: 'portal',
			icon: <GlobalOutlined />,
			label: APP_CONFIG_TITLE_LANDING ?? 'Cổng thông tin',
			onClick: () => window.open(landingUrl),
		},
		{ type: 'divider', key: 'divider' },
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: 'Đăng xuất',
			onClick: loginOut,
			danger: true,
		},
	];

	return (
		<>
			<HeaderDropdown overlay={<Menu className={styles.menu} items={items} />}>
				<span className={`${styles.action} ${styles.account}`}>
					<Avatar
						className={styles.avatar}
						src={user.avatar_url}
						icon={lastNameChar ?? <UserOutlined />}
						alt='avatar'
					/>
					<span className={`${styles.name}`}>{fullName}</span>
				</span>
			</HeaderDropdown>
		</>
	);
};

export default AvatarDropdown;
