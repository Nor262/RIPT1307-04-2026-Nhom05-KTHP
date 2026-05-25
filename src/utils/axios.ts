import axios from 'axios';
import { message, notification } from 'antd';
import { useAuthStore } from '@/stores/useAuthStore';

axios.defaults.baseURL = (typeof APP_CONFIG_IP_ROOT !== 'undefined' && APP_CONFIG_IP_ROOT) ? APP_CONFIG_IP_ROOT : 'http://localhost:3000/v1';
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
    // Không gắn token cho các endpoint auth công khai
    const publicPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];
    const isPublic = publicPaths.some(path => config.url?.includes(path));
    
    if (!isPublic) {
      const accessToken = useAuthStore.getState().accessToken;
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
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
        if (originalRequest.url?.includes('/auth/login')) {
          notification.error({ message: 'Đăng nhập thất bại', description: 'Email hoặc mật khẩu không đúng' });
          break;
        }

        // Refresh token cũng thất bại hoặc token/refresh hết hạn → logout ngay
        if (originalRequest.url?.includes('/auth/refresh')) {
          useAuthStore.getState().logout();
          notification.error({
            message: 'Phiên đăng nhập đã hết hạn',
            description: 'Vui lòng đăng nhập lại.',
          });
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

          const refreshToken = useAuthStore.getState().refreshToken;

          if (!refreshToken) {
            isRefreshing = false;
            useAuthStore.getState().logout();
            return Promise.reject(error);
          }

          try {
            const rs = await axios.post('/auth/refresh', { refreshToken });
            const newAccessToken = rs.data?.data?.accessToken || rs.data?.accessToken;
            const newRefreshToken = rs.data?.data?.refreshToken || rs.data?.refreshToken;
            
            if (newAccessToken) {
              useAuthStore.setState({
                accessToken: newAccessToken,
                ...(newRefreshToken && { refreshToken: newRefreshToken }),
              });
              
              axios.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              processQueue(null, newAccessToken);
              return axios(originalRequest);
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            useAuthStore.getState().logout();
            notification.error({
              message: 'Phiên đăng nhập đã hết hạn',
              description: 'Vui lòng đăng nhập lại.',
            });
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
