import React from 'react';
import styles from './style.less';

interface SidebarProps {
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <div className={styles.sidebarWrapper}>
      <div className={styles.sidebarBrand}>
        <img src="/logo.png" alt="Logo" className={styles.sidebarLogo} />
        <div className={styles.sidebarBrandText}>
          <span>Equipment Management</span>
          <small>Quản lý thiết bị</small>
        </div>
      </div>
      <div className={styles.sidebarMenu}>{children}</div>
      <div className={styles.sidebarFooter}>
        <span>Phiên bản 1.0</span>
      </div>
    </div>
  );
};

export default Sidebar;
