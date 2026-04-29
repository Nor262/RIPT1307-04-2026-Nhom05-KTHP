export type DifficultyLevel = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';

export interface KnowledgeBlock {
	id: string;
	name: string;
	description?: string;
}

export interface Subject {
	id: string;
	code: string;
	name: string;
	credits: number;
}

export interface Question {
	id: string;
	code: string;
	subjectId: string;
	content: string;
	difficulty: DifficultyLevel;
	knowledgeBlockId: string;
}

export interface ExamRequirement {
	knowledgeBlockId: string;
	difficulty: DifficultyLevel;
	quantity: number;
}

export interface ExamStructure {
	id: string;
	name: string;
	subjectId: string;
	requirements: ExamRequirement[];
}

export interface Exam {
	id: string;
	structureId: string;
	name: string;
	subjectId: string;
	createdAt: string;
	questions: Question[];
}
