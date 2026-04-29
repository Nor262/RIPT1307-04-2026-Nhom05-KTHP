
import { Club, Registration, RegistrationStatus } from './data.d';

const CLUBS_KEY = 'club_management_clubs';
const REGISTRATIONS_KEY = 'club_management_registrations';

const generateId = () => Math.random().toString(36).substr(2, 9);

const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Club Services
export const getClubs = async () => {
  return getFromStorage<Club>(CLUBS_KEY);
};

export const addClub = async (club: Omit<Club, 'id'>) => {
  const clubs = getFromStorage<Club>(CLUBS_KEY);
  const newClub = { ...club, id: generateId() };
  clubs.push(newClub);
  saveToStorage(CLUBS_KEY, clubs);
  return newClub;
};

export const updateClub = async (id: string, club: Partial<Club>) => {
  const clubs = getFromStorage<Club>(CLUBS_KEY);
  const index = clubs.findIndex((c) => c.id === id);
  if (index > -1) {
    clubs[index] = { ...clubs[index], ...club };
    saveToStorage(CLUBS_KEY, clubs);
    return clubs[index];
  }
  throw new Error('Club not found');
};

export const deleteClub = async (id: string) => {
  const clubs = getFromStorage<Club>(CLUBS_KEY);
  const filtered = clubs.filter((c) => c.id !== id);
  saveToStorage(CLUBS_KEY, filtered);
};

// Registration Services
export const getRegistrations = async () => {
  return getFromStorage<Registration>(REGISTRATIONS_KEY);
};

export const addRegistration = async (reg: Omit<Registration, 'id' | 'status' | 'createdAt' | 'history'>) => {
  const regs = getFromStorage<Registration>(REGISTRATIONS_KEY);
  const newReg: Registration = {
    ...reg,
    id: generateId(),
    status: 'Pending',
    createdAt: new Date().toISOString(),
    history: [
      {
        id: generateId(),
        action: 'Submitted',
        operator: 'User',
        timestamp: new Date().toISOString(),
      },
    ],
  };
  regs.push(newReg);
  saveToStorage(REGISTRATIONS_KEY, regs);
  return newReg;
};

export const updateRegistration = async (id: string, data: Partial<Registration>) => {
  const regs = getFromStorage<Registration>(REGISTRATIONS_KEY);
  const index = regs.findIndex((r) => r.id === id);
  if (index > -1) {
    regs[index] = { ...regs[index], ...data };
    saveToStorage(REGISTRATIONS_KEY, regs);
    return regs[index];
  }
  throw new Error('Registration not found');
};

export const deleteRegistration = async (id: string) => {
  const regs = getFromStorage<Registration>(REGISTRATIONS_KEY);
  const filtered = regs.filter((r) => r.id !== id);
  saveToStorage(REGISTRATIONS_KEY, filtered);
};

export const deleteRegistrations = async (ids: string[]) => {
  const regs = getFromStorage<Registration>(REGISTRATIONS_KEY);
  const filtered = regs.filter((r) => !ids.includes(r.id));
  saveToStorage(REGISTRATIONS_KEY, filtered);
};

export const updateRegistrationStatus = async (
  ids: string[],
  status: RegistrationStatus,
  note?: string,
) => {
  const regs = getFromStorage<Registration>(REGISTRATIONS_KEY);
  const updatedIds: string[] = [];

  const updatedRegs = regs.map((r) => {
    if (ids.includes(r.id)) {
      updatedIds.push(r.id);
      return {
        ...r,
        status,
        rejectionReason: status === 'Rejected' ? note : r.rejectionReason,
        history: [
          ...r.history,
          {
            id: generateId(),
            action: status === 'Approved' ? 'Approved' : 'Rejected',
            operator: 'Admin',
            timestamp: new Date().toISOString(),
            note,
          },
        ],
      };
    }
    return r;
  });

  saveToStorage(REGISTRATIONS_KEY, updatedRegs);
  return updatedIds;
};

export const changeMemberClub = async (memberIds: string[], newClubId: string) => {
  const regs = getFromStorage<Registration>(REGISTRATIONS_KEY);
  const updatedRegs = regs.map((r) => {
    if (memberIds.includes(r.id)) {
      return {
        ...r,
        clubId: newClubId,
        history: [
          ...r.history,
          {
            id: generateId(),
            action: `Transferred to Club ID: ${newClubId}`,
            operator: 'Admin',
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
    return r;
  });
  saveToStorage(REGISTRATIONS_KEY, updatedRegs);
};
