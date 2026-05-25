import { useAuthStore } from '@/stores/useAuthStore';
import AvatarDropdown from './AvatarDropdown';
import styles from './index.less';
import NoticeIconView from './NoticeIcon';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
	const user = useAuthStore((state) => state.user);

	if (!user) {
		return null;
	}

	return (
		<div className={styles.right}>
			{/* <ModuleSwitch /> */}

			<NoticeIconView />

			{/* <Tooltip title='Giới thiệu chung' placement='bottom'>
				<a onClick={() => history.push('/gioi-thieu')}>
					<InfoCircleOutlined />
				</a>
			</Tooltip> */}

			<AvatarDropdown menu />
		</div>
	);
};

export default GlobalHeaderRight;

//add to push
