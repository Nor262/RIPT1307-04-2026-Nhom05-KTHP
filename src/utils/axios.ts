import axios from 'axios';
import { message, notification } from 'antd';
import { history } from '@umijs/max';

axios.defaults.baseURL = 'http://localhost:3000/v1';
axios.defaults.headers.post['Content-Type'] = 'application/json';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor
axios.interceptors.request.use(
  (config) => {
    // Đọc token trực tiếp từ localStorage của Zustand persist
    const storageStr = localStorage.getItem('auth-storage');
    if (storageStr) {
      try {
        const { state } = JSON.parse(storageStr);
        if (state?.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
      } catch (e) {
        console.error('Error parsing auth storage', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const descriptionError = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';

    switch (status) {
      case 400:
        notification.error({
          message: 'Dữ liệu không hợp lệ (400)',
          description: Array.isArray(descriptionError) ? descriptionError.join(', ') : descriptionError,
        });
        break;

      case 401:
        if (originalRequest.url === '/auth/login') {
          notification.error({ message: 'Đăng nhập thất bại', description: 'Email hoặc mật khẩu không đúng' });
          break;
        }

        // Bắt đầu logic Refresh Token
        if (!originalRequest._retry) {
          if (isRefreshing) {
            return new Promise(function(resolve, reject) {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = 'Bearer ' + token;
                return axios(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          const storageStr = localStorage.getItem('auth-storage');
          let refreshToken = null;
          if (storageStr) {
            try {
              const { state } = JSON.parse(storageStr);
              refreshToken = state?.refreshToken;
            } catch (e) {}
          }

          if (!refreshToken) {
            // Không có refresh token -> Logout luôn
            isRefreshing = false;
            // Clear zustand persist
            localStorage.removeItem('auth-storage');
            history.replace('/user/login');
            return Promise.reject(error);
          }

          try {
            // Gọi api refresh (Giả định endpoint là POST /auth/refresh)
            const rs = await axios.post('/auth/refresh', { refreshToken });
            const newAccessToken = rs.data?.data?.accessToken;
            const newRefreshToken = rs.data?.data?.refreshToken;
            
            if (newAccessToken) {
              // Cập nhật lại zustand storage thủ công
              if (storageStr) {
                const parsed = JSON.parse(storageStr);
                parsed.state.accessToken = newAccessToken;
                if (newRefreshToken) parsed.state.refreshToken = newRefreshToken;
                localStorage.setItem('auth-storage', JSON.stringify(parsed));
              }
              
              axios.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              processQueue(null, newAccessToken);
              return axios(originalRequest);
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            // Refresh token hết hạn hoặc lỗi -> Xóa token và bắt đăng nhập lại
            localStorage.removeItem('auth-storage');
            notification.error({
              message: 'Phiên đăng nhập đã hết hạn',
              description: 'Vui lòng đăng nhập lại.',
            });
            history.replace('/user/login');
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        break;

      case 403:
        notification.error({
          message: 'Từ chối truy cập (403)',
          description: 'Bạn không có quyền thực hiện hành động này.',
        });
        break;

      case 404:
        notification.error({
          message: 'Không tìm thấy dữ liệu (404)',
          description: descriptionError,
        });
        break;

      case 500:
      case 502:
      case 503:
        notification.error({
          message: 'Lỗi máy chủ (500)',
          description: 'Hệ thống đang gặp sự cố, vui lòng thử lại sau.',
        });
        break;

      default:
        message.error('Có lỗi hệ thống. Vui lòng kiểm tra kết nối mạng.');
        break;
    }

    return Promise.reject(error);
  }
);

export default axios;
