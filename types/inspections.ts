import { InstitutionRef } from './tickets';

export interface UserRef {
  id: string;
  email: string;
}

export interface Inspection {
  id: string;
  institutionId: string;
  inspectorId: string;
  score: number;
  notes?: string;
  institution?: InstitutionRef;
  inspector?: UserRef;
}

export interface CreateInspectionDto {
  institutionId: string;
  score: number;
  notes?: string;
}

export interface QueryInspectionDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  institutionId?: string;
  inspectorId?: string;
}

export interface PaginatedInspections {
  items: Inspection[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

export interface StudentStatistic {
  id: string;
  institutionId: string;
  academicYear: string;
  totalBoys: number;
  totalGirls: number;
  createdAt: string;
  updatedAt: string;
  institution?: InstitutionRef;
}

export interface CreateStudentStatDto {
  institutionId: string;
  academicYear: string;
  totalBoys: number;
  totalGirls: number;
}

export interface UpdateStudentStatDto {
  academicYear?: string;
  totalBoys?: number;
  totalGirls?: number;
}

export interface AssignTrainingDto {
  userId: string;
  trainingId: string;
  completionDate: string;
}

export interface TeacherTraining {
  id: string;
  userId: string;
  trainingId: string;
  completionDate: string;
  createdAt: string;
}
