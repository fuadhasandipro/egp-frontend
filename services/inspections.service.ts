import apiClient from '@/lib/axios';
import {
  ApiResponse,
  InstitutionRef,
  Inspection,
  CreateInspectionDto,
  QueryInspectionDto,
  PaginatedInspections,
  StudentStatistic,
  CreateStudentStatDto,
  UpdateStudentStatDto,
  AssignTrainingDto,
  TeacherTraining,
  TrainingProgram,
  CreateTrainingProgramDto,
  TeacherOption,
} from '@/types';

export const inspectionsService = {
  // ---------------------------------------------------------------
  // INSTITUTIONS (for select dropdowns)
  // ---------------------------------------------------------------
  async findInstitutionOptions(): Promise<InstitutionRef[]> {
    const res = await apiClient.get<ApiResponse<{ items: InstitutionRef[] }>>('/api/institutions', {
      params: { limit: 100 },
    });
    const data = res.data?.data || (res.data as any);
    return data?.items || [];
  },

  // ---------------------------------------------------------------
  // INSPECTIONS
  // ---------------------------------------------------------------
  async createInspection(dto: CreateInspectionDto): Promise<Inspection> {
    const res = await apiClient.post<ApiResponse<Inspection>>('/api/inspections', dto);
    return res.data?.data || (res.data as any);
  },

  async findAllInspections(query?: QueryInspectionDto): Promise<PaginatedInspections> {
    const res = await apiClient.get<ApiResponse<PaginatedInspections>>('/api/inspections', {
      params: query,
    });
    return res.data?.data || (res.data as any);
  },

  // ---------------------------------------------------------------
  // STUDENT STATISTICS
  // ---------------------------------------------------------------
  async createStudentStat(dto: CreateStudentStatDto): Promise<StudentStatistic> {
    const res = await apiClient.post<ApiResponse<StudentStatistic>>('/api/student-stats', dto);
    return res.data?.data || (res.data as any);
  },

  async findAllStudentStats(): Promise<StudentStatistic[]> {
    const res = await apiClient.get<ApiResponse<StudentStatistic[]>>('/api/student-stats');
    return res.data?.data || (res.data as any);
  },

  async findOneStudentStat(id: string): Promise<StudentStatistic> {
    const res = await apiClient.get<ApiResponse<StudentStatistic>>(`/api/student-stats/${id}`);
    return res.data?.data || (res.data as any);
  },

  async updateStudentStat(id: string, dto: UpdateStudentStatDto): Promise<StudentStatistic> {
    const res = await apiClient.patch<ApiResponse<StudentStatistic>>(`/api/student-stats/${id}`, dto);
    return res.data?.data || (res.data as any);
  },

  async removeStudentStat(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(`/api/student-stats/${id}`);
    return res.data?.data || (res.data as any);
  },

  // ---------------------------------------------------------------
  // TRAINING
  // ---------------------------------------------------------------
  async findTrainingPrograms(): Promise<TrainingProgram[]> {
    const res = await apiClient.get<ApiResponse<TrainingProgram[]>>('/api/training/programs');
    return res.data?.data || (res.data as any);
  },

  async findTeacherOptions(): Promise<TeacherOption[]> {
    const res = await apiClient.get<ApiResponse<TeacherOption[]>>('/api/training/teachers');
    return res.data?.data || (res.data as any);
  },

  async findTrainingRecords(): Promise<TeacherTraining[]> {
    const res = await apiClient.get<ApiResponse<TeacherTraining[]>>('/api/training/records');
    return res.data?.data || (res.data as any);
  },

  async createTrainingProgram(dto: CreateTrainingProgramDto): Promise<TrainingProgram> {
    const res = await apiClient.post<ApiResponse<TrainingProgram>>('/api/training/programs', dto);
    return res.data?.data || (res.data as any);
  },

  async assignTraining(dto: AssignTrainingDto): Promise<TeacherTraining> {
    const res = await apiClient.post<ApiResponse<TeacherTraining>>('/api/training/assign', dto);
    return res.data?.data || (res.data as any);
  },
};
