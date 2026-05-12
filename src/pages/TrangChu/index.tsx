import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import AdminDashboard from './AdminDashboard';
import StorekeeperDashboard from './StorekeeperDashboard';
import BorrowerDashboard from './BorrowerDashboard';

/**
 * Dashboard Router — renders role-specific dashboard
 *
 * - admin       → Full analytics dashboard (charts, stats, alerts)
 * - storekeeper → Warehouse operations dashboard (handovers, inventory)
 * - borrower    → Personal loan tracking dashboard
 */
const DashboardRouter: React.FC = () => {
  const role = useAuthStore((state) => state.user?.role);

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'storekeeper':
      return <StorekeeperDashboard />;
    case 'borrower':
      return <BorrowerDashboard />;
    default:
      return <BorrowerDashboard />;
  }
};

export default DashboardRouter;
