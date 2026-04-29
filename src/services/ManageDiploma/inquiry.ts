import { getDiplomaInfosSync } from './diplomaInfo';

export interface InquirySearchCount {
  decisionId: string;
  count: number;
}

export const INQUIRY_STATS_KEY = 'inquiryStats';

const getStatsSync = (): InquirySearchCount[] => {
  const data = localStorage.getItem(INQUIRY_STATS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveStats = (data: InquirySearchCount[]) => {
  localStorage.setItem(INQUIRY_STATS_KEY, JSON.stringify(data));
};

export const incrementInquiryStat = (decisionId: string) => {
  if (!decisionId) return;
  const stats = getStatsSync();
  const index = stats.findIndex(s => s.decisionId === decisionId);
  if (index === -1) {
    stats.push({ decisionId, count: 1 });
  } else {
    stats[index].count += 1;
  }
  saveStats(stats);
};

export const getInquiryStats = async () => {
  const stats = getStatsSync();
  return {
    data: stats,
    success: true,
  };
};

export interface InquirySearchParams {
  id?: string;
  entryNumber?: string | number;
  studentId?: string;
  fullName?: string;
  dateOfBirth?: string;
}

export const searchDiploma = async (params: InquirySearchParams) => {
  const validKeys = ['id', 'entryNumber', 'studentId', 'fullName', 'dateOfBirth'];
  let providedCount = 0;
  validKeys.forEach(key => {
    if (params[key as keyof InquirySearchParams] !== undefined && params[key as keyof InquirySearchParams] !== '') {
      providedCount++;
    }
  });

  if (providedCount < 2) {
    throw new Error('Vui lòng nhập ít nhất 2 tham số để tra cứu.');
  }

  let data = getDiplomaInfosSync();

  if (params.id) {
    data = data.filter(d => d.id.toLowerCase().includes(params.id!.toLowerCase()));
  }
  if (params.entryNumber) {
    data = data.filter(d => String(d.entryNumber) === String(params.entryNumber));
  }
  if (params.studentId) {
    data = data.filter(d => d.studentId.toLowerCase().includes(params.studentId!.toLowerCase()));
  }
  if (params.fullName) {
    data = data.filter(d => d.fullName.toLowerCase().includes(params.fullName!.toLowerCase()));
  }
  if (params.dateOfBirth) {
    data = data.filter(d => d.dateOfBirth === params.dateOfBirth);
  }

  const decisionIds = new Set(data.map(d => d.decisionId));
  decisionIds.forEach(decisionId => {
    incrementInquiryStat(decisionId);
  });

  return {
    data,
    success: true,
    total: data.length,
  };
};
