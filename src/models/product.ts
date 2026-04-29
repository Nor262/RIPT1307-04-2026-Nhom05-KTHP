import { useState, useCallback } from 'react';

export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    quantity: number;
}

const initialProducts: Product[] = [
    { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
    { id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
    { id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
    { id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
    { id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
    { id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
    { id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
    { id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

export default () => {
    const [products, setProducts] = useState<Product[]>(() => {
        try {
            const stored = localStorage.getItem('products');
            return stored ? JSON.parse(stored) : initialProducts;
        } catch (error) {
            console.error('Failed to load products from localStorage', error);
            return initialProducts;
        }
    });

    const saveToLocalStorage = (newProducts: Product[]) => {
        try {
            localStorage.setItem('products', JSON.stringify(newProducts));
        } catch (error) {
            console.error('Failed to save products to localStorage', error);
        }
    };

    const addProduct = useCallback((product: Omit<Product, 'id'>) => {
        setProducts((prev) => {
            const newProduct = { ...product, id: Date.now() }; // Simple ID generation
            const newData = [...prev, newProduct];
            saveToLocalStorage(newData);
            return newData;
        });
    }, []);

    const updateProduct = useCallback((id: number, updates: Partial<Product>) => {
        setProducts((prev) => {
            const newData = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
            saveToLocalStorage(newData);
            return newData;
        });
    }, []);

    const deleteProduct = useCallback((id: number) => {
        setProducts((prev) => {
            const newData = prev.filter((item) => item.id !== id);
            saveToLocalStorage(newData);
            return newData;
        });
    }, []);

    const decreaseStock = useCallback((id: number, amount: number) => {
        setProducts((prev) => {
            const newData = prev.map((item) => {
                if (item.id === id) {
                    return { ...item, quantity: Math.max(0, item.quantity - amount) };
                }
                return item;
            });
            saveToLocalStorage(newData);
            return newData;
        });
    }, []);

    const returnStock = useCallback((id: number, amount: number) => {
        setProducts((prev) => {
            const newData = prev.map((item) => {
                if (item.id === id) {
                    return { ...item, quantity: item.quantity + amount };
                }
                return item;
            });
            saveToLocalStorage(newData);
            return newData;
        });
    }, []);

    return {
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        decreaseStock,
        returnStock,
    };
};
