import React from 'react';
import StatsCard from '@/components/Dashboard/StatsCard';
import './style.less';

const DashboardPage: React.FC = () => {
  return (
    <>
      <div className="dashboard-page">

      <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Chào mừng trở lại, Nguyễn Bình Minh
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatsCard
            title="Tổng thiết bị"
            value={248}
            color="#1677ff"
          />

          <StatsCard
            title="Sẵn sàng"
            value={186}
            color="#52c41a"
          />

          <StatsCard
            title="Đang cho mượn"
            value={42}
            color="#faad14"
          />

          <StatsCard
            title="Bảo trì"
            value={20}
            color="#ff4d4f"
          />
        </div>

        {/* Quick action */}
        <div className="shortcut-section">
          <h2>Phím tắt quản trị</h2>

          <div className="shortcut-grid">

            <button>
              Quản lý thiết bị
            </button>

            <button>
              Quản lý mượn trả
            </button>

            <button>
              Báo cáo thống kê
            </button>

            <button>
              Hồ sơ cá nhân
            </button>

          </div>
        </div>

      </div>
    </>
  );
};

export default DashboardPage;