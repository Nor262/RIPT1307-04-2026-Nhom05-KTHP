import { useAuthStore } from '@/stores/useAuthStore';
import AvatarDropdown from './AvatarDropdown';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
	const user = useAuthStore((state) => state.user);

	if (!user) {
		return null;
	}

	return (
		<div className={styles.right}>
			<AvatarDropdown menu />
		</div>
	);
};

export default GlobalHeaderRight;
