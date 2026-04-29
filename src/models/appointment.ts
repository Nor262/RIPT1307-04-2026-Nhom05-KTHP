import { useState, useCallback } from 'react';

export interface WorkSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Staff {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  maxClientsPerDay: number;
  workSchedules: WorkSchedule[];
  avatar?: string;
}

export interface Service {
  id: number;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  description: string;
}

export type AppointmentStatus = 'Chờ duyệt' | 'Xác nhận' | 'Hoàn thành' | 'Hủy';

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: number;
  serviceName: string;
  staffId: number;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  note?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  staffId: number;
  staffName: string;
  customerName: string;
  serviceName: string;
  rating: number;
  comment: string;
  staffReply?: string;
  createdAt: string;
}

const initialStaff: Staff[] = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    specialty: 'Cắt tóc nam',
    phone: '0901234567',
    email: 'an@salon.vn',
    maxClientsPerDay: 8,
    workSchedules: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
    ],
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    specialty: 'Uốn, nhuộm tóc',
    phone: '0912345678',
    email: 'binh@salon.vn',
    maxClientsPerDay: 6,
    workSchedules: [
      { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 5, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 6, startTime: '08:00', endTime: '16:00' },
    ],
  },
  {
    id: 3,
    name: 'Lê Thị Châu',
    specialty: 'Spa & Massage',
    phone: '0923456789',
    email: 'chau@salon.vn',
    maxClientsPerDay: 5,
    workSchedules: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 6, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00' },
    ],
  },
];

const initialServices: Service[] = [
  { id: 1, name: 'Cắt tóc nam', category: 'Tóc', price: 80000, durationMinutes: 30, description: 'Cắt tóc nam cơ bản' },
  { id: 2, name: 'Cắt tóc nữ', category: 'Tóc', price: 120000, durationMinutes: 45, description: 'Cắt tóc nữ tạo kiểu' },
  { id: 3, name: 'Nhuộm tóc', category: 'Tóc', price: 350000, durationMinutes: 90, description: 'Nhuộm màu thời trang' },
  { id: 4, name: 'Uốn tóc', category: 'Tóc', price: 450000, durationMinutes: 120, description: 'Uốn xoăn / duỗi thẳng' },
  { id: 5, name: 'Massage mặt', category: 'Spa', price: 200000, durationMinutes: 60, description: 'Massage mặt thư giãn' },
  { id: 6, name: 'Chăm sóc da', category: 'Spa', price: 280000, durationMinutes: 75, description: 'Chăm sóc da chuyên sâu' },
  { id: 7, name: 'Massage toàn thân', category: 'Spa', price: 500000, durationMinutes: 90, description: 'Massage body thư giãn' },
  { id: 8, name: 'Tẩy da chết', category: 'Spa', price: 150000, durationMinutes: 45, description: 'Tẩy da chết toàn thân' },
];

const initialAppointments: Appointment[] = [
  {
    id: 'LH001',
    customerName: 'Phạm Thị Dung',
    customerPhone: '0934567890',
    serviceId: 1,
    serviceName: 'Cắt tóc nam',
    staffId: 1,
    staffName: 'Nguyễn Văn An',
    date: '2026-03-18',
    startTime: '09:00',
    endTime: '09:30',
    status: 'Hoàn thành',
    createdAt: '2026-03-17',
  },
  {
    id: 'LH002',
    customerName: 'Hoàng Văn Em',
    customerPhone: '0945678901',
    serviceId: 5,
    serviceName: 'Massage mặt',
    staffId: 3,
    staffName: 'Lê Thị Châu',
    date: '2026-03-18',
    startTime: '10:00',
    endTime: '11:00',
    status: 'Xác nhận',
    createdAt: '2026-03-17',
  },
  {
    id: 'LH003',
    customerName: 'Ngô Thị Phượng',
    customerPhone: '0956789012',
    serviceId: 3,
    serviceName: 'Nhuộm tóc',
    staffId: 2,
    staffName: 'Trần Thị Bình',
    date: '2026-03-19',
    startTime: '08:00',
    endTime: '09:30',
    status: 'Chờ duyệt',
    createdAt: '2026-03-18',
  },
];

const initialReviews: Review[] = [
  {
    id: 'DG001',
    appointmentId: 'LH001',
    staffId: 1,
    staffName: 'Nguyễn Văn An',
    customerName: 'Phạm Thị Dung',
    serviceName: 'Cắt tóc nam',
    rating: 5,
    comment: 'Nhân viên rất chuyên nghiệp, tóc cắt đẹp lắm!',
    staffReply: 'Cảm ơn chị đã tin tưởng! Hẹn gặp lại chị lần sau.',
    createdAt: '2026-03-18',
  },
];

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    //
  }
};

export default () => {
  const [staffList, setStaffList] = useState<Staff[]>(() =>
    loadFromStorage('apt_staff', initialStaff),
  );
  const [services, setServices] = useState<Service[]>(() =>
    loadFromStorage('apt_services', initialServices),
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadFromStorage('apt_appointments', initialAppointments),
  );
  const [reviews, setReviews] = useState<Review[]>(() =>
    loadFromStorage('apt_reviews', initialReviews),
  );

  const addStaff = useCallback((staff: Omit<Staff, 'id'>) => {
    setStaffList(prev => {
      const newList = [...prev, { ...staff, id: Date.now() }];
      saveToStorage('apt_staff', newList);
      return newList;
    });
  }, []);

  const updateStaff = useCallback((id: number, updates: Partial<Staff>) => {
    setStaffList(prev => {
      const newList = prev.map(s => (s.id === id ? { ...s, ...updates } : s));
      saveToStorage('apt_staff', newList);
      return newList;
    });
  }, []);

  const deleteStaff = useCallback((id: number) => {
    setStaffList(prev => {
      const newList = prev.filter(s => s.id !== id);
      saveToStorage('apt_staff', newList);
      return newList;
    });
  }, []);

  const addService = useCallback((service: Omit<Service, 'id'>) => {
    setServices(prev => {
      const newList = [...prev, { ...service, id: Date.now() }];
      saveToStorage('apt_services', newList);
      return newList;
    });
  }, []);

  const updateService = useCallback((id: number, updates: Partial<Service>) => {
    setServices(prev => {
      const newList = prev.map(s => (s.id === id ? { ...s, ...updates } : s));
      saveToStorage('apt_services', newList);
      return newList;
    });
  }, []);

  const deleteService = useCallback((id: number) => {
    setServices(prev => {
      const newList = prev.filter(s => s.id !== id);
      saveToStorage('apt_services', newList);
      return newList;
    });
  }, []);

  const checkConflict = useCallback(
    (staffId: number, date: string, startTime: string, endTime: string, excludeId?: string): boolean => {
      return appointments.some(apt => {
        if (apt.id === excludeId) return false;
        if (apt.staffId !== staffId) return false;
        if (apt.date !== date) return false;
        if (apt.status === 'Hủy') return false;
        return startTime < apt.endTime && endTime > apt.startTime;
      });
    },
    [appointments],
  );

  const checkDailyLimit = useCallback(
    (staffId: number, date: string, excludeId?: string): boolean => {
      const staff = staffList.find(s => s.id === staffId);
      if (!staff) return false;
      const count = appointments.filter(
        apt =>
          apt.staffId === staffId &&
          apt.date === date &&
          apt.status !== 'Hủy' &&
          apt.id !== excludeId,
      ).length;
      return count >= staff.maxClientsPerDay;
    },
    [appointments, staffList],
  );

  const addAppointment = useCallback(
    (apt: Omit<Appointment, 'id' | 'createdAt' | 'status'>): { success: boolean; message: string } => {
      if (checkConflict(apt.staffId, apt.date, apt.startTime, apt.endTime)) {
        return { success: false, message: 'Nhân viên đã có lịch hẹn trong khoảng thời gian này!' };
      }
      if (checkDailyLimit(apt.staffId, apt.date)) {
        return { success: false, message: 'Nhân viên đã đạt giới hạn khách trong ngày!' };
      }
      setAppointments(prev => {
        const newApt: Appointment = {
          ...apt,
          id: `LH${Date.now()}`,
          status: 'Chờ duyệt',
          createdAt: new Date().toISOString().split('T')[0],
        };
        const newList = [newApt, ...prev];
        saveToStorage('apt_appointments', newList);
        return newList;
      });
      return { success: true, message: 'Đặt lịch hẹn thành công!' };
    },
    [checkConflict, checkDailyLimit],
  );

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    setAppointments(prev => {
      const newList = prev.map(a => (a.id === id ? { ...a, status } : a));
      saveToStorage('apt_appointments', newList);
      return newList;
    });
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => {
      const newList = prev.filter(a => a.id !== id);
      saveToStorage('apt_appointments', newList);
      return newList;
    });
  }, []);

  const addReview = useCallback(
    (review: Omit<Review, 'id' | 'createdAt'>): { success: boolean; message: string } => {
      const existing = reviews.find(r => r.appointmentId === review.appointmentId);
      if (existing) return { success: false, message: 'Lịch hẹn này đã được đánh giá!' };
      setReviews(prev => {
        const newReview: Review = {
          ...review,
          id: `DG${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
        };
        const newList = [newReview, ...prev];
        saveToStorage('apt_reviews', newList);
        return newList;
      });
      return { success: true, message: 'Đánh giá thành công!' };
    },
    [reviews],
  );

  const replyReview = useCallback((id: string, reply: string) => {
    setReviews(prev => {
      const newList = prev.map(r => (r.id === id ? { ...r, staffReply: reply } : r));
      saveToStorage('apt_reviews', newList);
      return newList;
    });
  }, []);

  const getStaffAverageRating = useCallback(
    (staffId: number): number => {
      const staffReviews = reviews.filter(r => r.staffId === staffId);
      if (!staffReviews.length) return 0;
      return staffReviews.reduce((sum, r) => sum + r.rating, 0) / staffReviews.length;
    },
    [reviews],
  );

  return {
    staffList,
    services,
    appointments,
    reviews,
    addStaff,
    updateStaff,
    deleteStaff,
    addService,
    updateService,
    deleteService,
    addAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    addReview,
    replyReview,
    checkConflict,
    checkDailyLimit,
    getStaffAverageRating,
  };
};
