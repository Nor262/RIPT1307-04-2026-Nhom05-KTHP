import { sortBy } from 'lodash';

export type FieldDataType = 'String' | 'Number' | 'Date';

export interface FormConfigField {
  id: string;
  name: string;
  dataType: FieldDataType;
  required: boolean;
  createdAt: string;
}

export const FORM_CONFIG_KEY = 'formConfigFields';

const getFieldsSync = (): FormConfigField[] => {
  const data = localStorage.getItem(FORM_CONFIG_KEY);
  return data ? JSON.parse(data) : [];
};

const saveFields = (data: FormConfigField[]) => {
  localStorage.setItem(FORM_CONFIG_KEY, JSON.stringify(data));
};

export const getFormConfigFields = async (params: any = {}) => {
  let data = getFieldsSync();
  
  data = sortBy(data, ['createdAt']);
  
  return {
    data,
    success: true,
    total: data.length,
  };
};

export const addFormConfigField = async (field: Omit<FormConfigField, 'createdAt' | 'id'> & { id?: string }) => {
  const data = getFieldsSync();
  
  const id = field.id || `field_${Date.now()}`;
  
  if (data.find(d => d.id === id)) {
    throw new Error('Mã trường này đã tồn tại.');
  }

  const newField: FormConfigField = {
    ...field,
    id,
    createdAt: new Date().toISOString(),
  };
  
  data.push(newField);
  saveFields(data);
  return { success: true, data: newField };
};

export const updateFormConfigField = async (id: string, updates: Partial<FormConfigField>) => {
  const data = getFieldsSync();
  const index = data.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Trường không tồn tại.');
  
  data[index] = { ...data[index], ...updates };
  saveFields(data);
  return { success: true, data: data[index] };
};

export const deleteFormConfigField = async (id: string) => {
  let data = getFieldsSync();
  data = data.filter(d => d.id !== id);
  saveFields(data);
  return { success: true };
};

export const getFormConfigFieldsSync = getFieldsSync;
