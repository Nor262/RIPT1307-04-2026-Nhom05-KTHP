import { useState, useCallback } from 'react';

export interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

export type OrderStatus = 'Chờ xác nhận' | 'Đang giao' | 'Hoàn thành' | 'Hủy';

export interface Order {
    id: string; // e.g., DH001
    customerName: string;
    phone: string;
    address: string;
    products: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
}

const initialOrders: Order[] = [
    {
        id: 'DH001',
        customerName: 'Nguyễn Văn A',
        phone: '0912345678',
        address: '123 Nguyễn Huệ, Q1, TP.HCM',
        products: [
            { productId: 1, productName: 'Laptop Dell XPS 13', quantity: 1, price: 25000000 },
        ],
        totalAmount: 25000000,
        status: 'Chờ xác nhận',
        createdAt: '2024-01-15',
    },
];

export default () => {
    const [orders, setOrders] = useState<Order[]>(() => {
        try {
            const stored = localStorage.getItem('orders');
            return stored ? JSON.parse(stored) : initialOrders;
        } catch (error) {
            console.error('Failed to load orders from localStorage', error);
            return initialOrders;
        }
    });

    const saveToLocalStorage = (newOrders: Order[]) => {
        try {
            localStorage.setItem('orders', JSON.stringify(newOrders));
        } catch (error) {
            console.error('Failed to save orders to localStorage', error);
        }
    };

    const addOrder = useCallback((order: Omit<Order, 'createdAt'>) => {
        setOrders((prev) => {
            const newOrder: Order = {
                ...order,
                createdAt: new Date().toISOString().split('T')[0],
            };
            const newData = [newOrder, ...prev];
            saveToLocalStorage(newData);
            return newData;
        });
    }, []);

    const updateOrder = useCallback((updatedOrder: Order) => {
        setOrders((prev) => {
            const newData = prev.map((item) => (item.id === updatedOrder.id ? { ...updatedOrder } : item));
            saveToLocalStorage(newData);
            return newData;
        });
    }, []);

    const updateOrderStatus = useCallback((id: string, status: Order['status']) => {
        setOrders((prev) => {
            const newData = prev.map((item) => (item.id === id ? { ...item, status } : item));
            saveToLocalStorage(newData);
            return newData;
        });
    }, []);

    return {
        orders,
        addOrder,
        updateOrder,
        updateOrderStatus,
    };
};
