
export interface Club {
  id: string;
  avatar?: string;
  name: string;
  foundedDate: string;
  description: string;
  chairman: string;
  isActive: boolean;
}

export type RegistrationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  talents: string;
  clubId: string;
  reason: string;
  status: RegistrationStatus;
  rejectionReason?: string;
  createdAt: string;
  history: OperationHistory[];
}

export interface OperationHistory {
  id: string;
  action: string;
  operator: string;
  timestamp: string;
  note?: string;
}
