import { KnowledgeBlock, Subject, Question, Exam, ExamStructure, ExamRequirement } from '@/pages/QuestionBank/data';

const getFromStorage = <T>(key: string): T[] => {
	const data = localStorage.getItem(key);
	return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]) => {
	localStorage.setItem(key, JSON.stringify(data));
};

const createItem = <T extends { id: string }>(key: string, item: T) => {
	const items = getFromStorage<T>(key);
	saveToStorage(key, [...items, item]);
};

const updateItem = <T extends { id: string }>(key: string, id: string, item: T) => {
	const items = getFromStorage<T>(key);
	const index = items.findIndex((i) => i.id === id);
	if (index !== -1) {
		items[index] = item;
		saveToStorage(key, items);
	}
};

const deleteItem = <T extends { id: string }>(key: string, id: string) => {
	const items = getFromStorage<T>(key);
	saveToStorage(
		key,
		items.filter((i) => i.id !== id),
	);
};

const KEYS = {
	KNOWLEDGE_BLOCKS: 'qb_knowledge_blocks',
	SUBJECTS: 'qb_subjects',
	QUESTIONS: 'qb_questions',
	EXAMS: 'qb_exams',
	EXAM_STRUCTURES: 'qb_exam_structures',
};

export const getKnowledgeBlocks = () => getFromStorage<KnowledgeBlock>(KEYS.KNOWLEDGE_BLOCKS);
export const addKnowledgeBlock = (data: KnowledgeBlock) => createItem(KEYS.KNOWLEDGE_BLOCKS, data);
export const editKnowledgeBlock = (id: string, data: KnowledgeBlock) => updateItem(KEYS.KNOWLEDGE_BLOCKS, id, data);
export const removeKnowledgeBlock = (id: string) => deleteItem(KEYS.KNOWLEDGE_BLOCKS, id);

export const getSubjects = () => getFromStorage<Subject>(KEYS.SUBJECTS);
export const addSubject = (data: Subject) => createItem(KEYS.SUBJECTS, data);
export const editSubject = (id: string, data: Subject) => updateItem(KEYS.SUBJECTS, id, data);
export const removeSubject = (id: string) => deleteItem(KEYS.SUBJECTS, id);

export const getQuestions = () => getFromStorage<Question>(KEYS.QUESTIONS);
export const addQuestion = (data: Question) => createItem(KEYS.QUESTIONS, data);
export const editQuestion = (id: string, data: Question) => updateItem(KEYS.QUESTIONS, id, data);
export const removeQuestion = (id: string) => deleteItem(KEYS.QUESTIONS, id);

export const getExamStructures = () => getFromStorage<ExamStructure>(KEYS.EXAM_STRUCTURES);
export const addExamStructure = (data: ExamStructure) => createItem(KEYS.EXAM_STRUCTURES, data);
export const editExamStructure = (id: string, data: ExamStructure) => updateItem(KEYS.EXAM_STRUCTURES, id, data);
export const removeExamStructure = (id: string) => deleteItem(KEYS.EXAM_STRUCTURES, id);

export const getExams = () => getFromStorage<Exam>(KEYS.EXAMS);
export const addExam = (data: Exam) => createItem(KEYS.EXAMS, data);
export const editExam = (id: string, data: Exam) => updateItem(KEYS.EXAMS, id, data);
export const removeExam = (id: string) => deleteItem(KEYS.EXAMS, id);

const shuffleArray = <T>(array: T[]) => {
	const newArr = [...array];
	for (let i = newArr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArr[i], newArr[j]] = [newArr[j], newArr[i]];
	}
	return newArr;
};

export const generateExam = (subjectId: string, requirements: ExamRequirement[]): Question[] => {
	const allQuestions = getQuestions().filter((q) => q.subjectId === subjectId);
	const selectedQuestions: Question[] = [];

	for (const req of requirements) {
		const matchingQuestions = allQuestions.filter(
			(q) => q.difficulty === req.difficulty && q.knowledgeBlockId === req.knowledgeBlockId,
		);

		if (matchingQuestions.length < req.quantity) {
			const kb = getKnowledgeBlocks().find((k) => k.id === req.knowledgeBlockId)?.name || req.knowledgeBlockId;
			throw new Error(`Không đủ bộ câu hỏi cho mức độ '${req.difficulty}', khối kiến thức '${kb}'. Cần ${req.quantity}, nhưng chỉ có ${matchingQuestions.length}.`);
		}

		selectedQuestions.push(...shuffleArray(matchingQuestions).slice(0, req.quantity));
	}

	return shuffleArray(selectedQuestions);
};
