import { sortBy } from 'lodash';

export interface Decision {
  id: string;
  issueDate: string;
  summary: string;
  diplomaBookId: string;
  createdAt: string;
}

export const DECISIONS_KEY = 'decisions';

const getDecisionsSync = (): Decision[] => {
  const data = localStorage.getItem(DECISIONS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveDecisions = (data: Decision[]) => {
  localStorage.setItem(DECISIONS_KEY, JSON.stringify(data));
};

export const getDecisions = async (params: any = {}) => {
  let data = getDecisionsSync();
  if (params.id) {
    data = data.filter(d => d.id.includes(params.id as string));
  }
  if (params.diplomaBookId) {
    data = data.filter(d => d.diplomaBookId === params.diplomaBookId);
  }
  
  data = sortBy(data, ['issueDate']).reverse();
  
  return {
    data,
    success: true,
    total: data.length,
  };
};

export const getDecisionById = async (id: string) => {
  const data = getDecisionsSync();
  return data.find(d => d.id === id);
};

export const addDecision = async (decision: Omit<Decision, 'createdAt'>) => {
  const data = getDecisionsSync();
  if (data.find(d => d.id === decision.id)) {
    throw new Error('Số QĐ này đã tồn tại.');
  }

  const newDecision: Decision = {
    ...decision,
    createdAt: new Date().toISOString(),
  };
  
  data.push(newDecision);
  saveDecisions(data);
  return { success: true, data: newDecision };
};

export const updateDecision = async (id: string, updates: Partial<Decision>) => {
  const data = getDecisionsSync();
  const index = data.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Quyết định không tồn tại.');
  
  data[index] = { ...data[index], ...updates };
  saveDecisions(data);
  return { success: true, data: data[index] };
};

export const deleteDecision = async (id: string) => {
  let data = getDecisionsSync();
  data = data.filter(d => d.id !== id);
  saveDecisions(data);
  return { success: true };
};
