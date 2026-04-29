import { sortBy } from 'lodash';
import { getDecisionById } from './decision';
import { incrementBookEntryNumber } from './diplomaBook';

export interface DiplomaInfo {
  id: string;
  entryNumber: number;
  studentId: string;
  fullName: string;
  dateOfBirth: string;
  decisionId: string;
  dynamicFields: Record<string, any>;
  createdAt: string;
}

export const DIPLOMA_INFO_KEY = 'diplomaInfoRecords';

const getInfoSync = (): DiplomaInfo[] => {
  const data = localStorage.getItem(DIPLOMA_INFO_KEY);
  return data ? JSON.parse(data) : [];
};

const saveInfo = (data: DiplomaInfo[]) => {
  localStorage.setItem(DIPLOMA_INFO_KEY, JSON.stringify(data));
};

export const getDiplomaInfos = async (params: any = {}) => {
  let data = getInfoSync();

  if (params.decisionId) {
    data = data.filter(d => d.decisionId === params.decisionId);
  }
  if (params.studentId) {
    data = data.filter(d => d.studentId.includes(params.studentId));
  }
  if (params.id) {
    data = data.filter(d => d.id.includes(params.id));
  }
  
  data = sortBy(data, ['createdAt']).reverse();
  
  return {
    data,
    success: true,
    total: data.length,
  };
};

export const addDiplomaInfo = async (info: Omit<DiplomaInfo, 'createdAt' | 'entryNumber'>) => {
  const data = getInfoSync();
  
  if (data.find(d => d.id === info.id)) {
    throw new Error('Số hiệu văn bằng này đã tồn tại.');
  }

  const decision = await getDecisionById(info.decisionId);
  if (!decision) {
    throw new Error('Không tìm thấy Quyết định tốt nghiệp.');
  }

  const newEntryNumber = await incrementBookEntryNumber(decision.diplomaBookId);

  const newInfo: DiplomaInfo = {
    ...info,
    entryNumber: newEntryNumber,
    createdAt: new Date().toISOString(),
  };
  
  data.push(newInfo);
  saveInfo(data);
  return { success: true, data: newInfo };
};

export const updateDiplomaInfo = async (id: string, updates: Partial<DiplomaInfo>) => {
  const data = getInfoSync();
  const index = data.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Thông tin văn bằng không tồn tại.');
  
  const safeUpdates = { ...updates };
  delete safeUpdates.entryNumber;

  data[index] = { ...data[index], ...safeUpdates };
  saveInfo(data);
  return { success: true, data: data[index] };
};

export const deleteDiplomaInfo = async (id: string) => {
  let data = getInfoSync();
  data = data.filter(d => d.id !== id);
  saveInfo(data);
  return { success: true };
};

export const getDiplomaInfosSync = getInfoSync;
