import { sortBy } from 'lodash';

export interface DiplomaBook {
  id: string;
  year: number;
  currentEntryNumber: number;
  createdAt: string;
}

export const DIPLOMA_BOOKS_KEY = 'diplomaBooks';

const getBooks = (): DiplomaBook[] => {
  const books = localStorage.getItem(DIPLOMA_BOOKS_KEY);
  return books ? JSON.parse(books) : [];
};

const saveBooks = (books: DiplomaBook[]) => {
  localStorage.setItem(DIPLOMA_BOOKS_KEY, JSON.stringify(books));
};

export const getDiplomaBooks = async (params: any = {}) => {
  let data = getBooks();
  if (params.year) {
    data = data.filter(book => book.year === Number(params.year));
  }
  data = sortBy(data, ['year']).reverse();
  
  return {
    data,
    success: true,
    total: data.length,
  };
};

export const addDiplomaBook = async (book: Omit<DiplomaBook, 'currentEntryNumber' | 'createdAt' | 'id'> & { id?: string }) => {
  const books = getBooks();
  
  const id = book.id || `Sổ ${book.year}`;
  
  if (books.find(b => b.id === id || b.year === Number(book.year))) {
    throw new Error('Năm hoặc Mã sổ này đã tồn tại sổ.');
  }

  const newBook: DiplomaBook = {
    id,
    year: Number(book.year),
    currentEntryNumber: 0,
    createdAt: new Date().toISOString(),
  };
  
  books.push(newBook);
  saveBooks(books);
  return { success: true, data: newBook };
};

export const updateDiplomaBook = async (id: string, updates: Partial<DiplomaBook>) => {
  const books = getBooks();
  const index = books.findIndex(b => b.id === id);
  if (index === -1) throw new Error('Sổ không tồn tại.');
  
  books[index] = { ...books[index], ...updates };
  saveBooks(books);
  return { success: true, data: books[index] };
};

export const deleteDiplomaBook = async (id: string) => {
  let books = getBooks();
  books = books.filter(b => b.id !== id);
  saveBooks(books);
  return { success: true };
};

export const incrementBookEntryNumber = async (bookId: string) => {
  const books = getBooks();
  const index = books.findIndex(b => b.id === bookId);
  if (index === -1) throw new Error('Sổ không tồn tại.');
  
  books[index].currentEntryNumber += 1;
  saveBooks(books);
  return books[index].currentEntryNumber;
};
