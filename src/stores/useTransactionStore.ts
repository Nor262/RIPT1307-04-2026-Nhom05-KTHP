import create from 'zustand';
import { persist } from 'zustand/middleware';

export interface PendingItem {
  equipment_id: number;
  name: string;
  serial_number: string;
  transaction_id: number;
  status: 'pending' | 'verifying' | 'success' | 'failed';
}

interface TransactionState {
  pendingItems: PendingItem[];
  isSyncing: boolean;
  addPendingItem: (item: Omit<PendingItem, 'status'>) => void;
  updateItemStatus: (serialNumber: string, status: PendingItem['status']) => void;
  removePendingItem: (serialNumber: string) => void;
  clearAll: () => void;
  setSyncing: (syncing: boolean) => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      pendingItems: [],
      isSyncing: false,
      addPendingItem: (item) => set((state) => {
        if (state.pendingItems.find(i => i.serial_number === item.serial_number)) {
          return state;
        }
        return { pendingItems: [...state.pendingItems, { ...item, status: 'pending' }] };
      }),
      updateItemStatus: (serialNumber, status) => set((state) => ({
        pendingItems: state.pendingItems.map((item) =>
          item.serial_number === serialNumber ? { ...item, status } : item
        ),
      })),
      removePendingItem: (serialNumber) => set((state) => ({
        pendingItems: state.pendingItems.filter((item) => item.serial_number !== serialNumber),
      })),
      clearAll: () => set({ pendingItems: [] }),
      setSyncing: (syncing) => set({ isSyncing: syncing }),
    }),
    {
      name: 'transaction-storage',
    }
  )
);
