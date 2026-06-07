import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from './style.less';

interface HeaderProps {
  defaultDom?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ defaultDom }) => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className={styles.headerWrapper}>
      <div className={styles.headerLeft}>{defaultDom}</div>
      <div className={styles.headerRight}>
        <div className={styles.greeting}>
          <span>Xin chào,</span>
          <strong>{user?.full_name || user?.email || 'Người dùng'}</strong>
        </div>
      </div>
    </div>
  );
};

export default Header;
