import apiClient from '@/lib/axios';
import {
  ApiResponse,
  PaginatedResult,
  Complaint,
  CreateComplaintDto,
  QueryComplaintsDto,
  ComplaintAttachment,
  CreateAttachmentDto,
  InfrastructureRequest,
  CreateInfrastructureRequestDto,
  Asset,
  CreateAssetDto,
  UpdateAssetDto,
} from '@/types';

export const ticketsService = {
  // ---------------------------------------------------------------
  // COMPLAINTS
  // ---------------------------------------------------------------
  async createComplaint(dto: CreateComplaintDto): Promise<Complaint> {
    const res = await apiClient.post<ApiResponse<Complaint>>('/api/tickets/complaints', dto);
    return res.data?.data || (res.data as any);
  },

  async findAllComplaints(query?: QueryComplaintsDto): Promise<PaginatedResult<Complaint>> {
    const res = await apiClient.get<ApiResponse<PaginatedResult<Complaint>>>('/api/tickets/complaints', {
      params: query,
    });
    return res.data?.data || (res.data as any);
  },

  async escalateComplaint(id: string): Promise<Complaint> {
    const res = await apiClient.patch<ApiResponse<Complaint>>(`/api/tickets/complaints/${id}/escalate`);
    return res.data?.data || (res.data as any);
  },

  // ---------------------------------------------------------------
  // INFRASTRUCTURE REQUESTS
  // ---------------------------------------------------------------
  async createInfrastructureRequest(dto: CreateInfrastructureRequestDto): Promise<InfrastructureRequest> {
    const res = await apiClient.post<ApiResponse<InfrastructureRequest>>('/api/tickets/infrastructure', dto);
    return res.data?.data || (res.data as any);
  },

  // ---------------------------------------------------------------
  // ASSETS CRUD
  // ---------------------------------------------------------------
  async createAsset(dto: CreateAssetDto): Promise<Asset> {
    const res = await apiClient.post<ApiResponse<Asset>>('/api/tickets/assets', dto);
    return res.data?.data || (res.data as any);
  },

  async findAllAssets(): Promise<Asset[]> {
    const res = await apiClient.get<ApiResponse<Asset[]>>('/api/tickets/assets');
    return res.data?.data || (res.data as any);
  },

  async findOneAsset(id: string): Promise<Asset> {
    const res = await apiClient.get<ApiResponse<Asset>>(`/api/tickets/assets/${id}`);
    return res.data?.data || (res.data as any);
  },

  async updateAsset(id: string, dto: UpdateAssetDto): Promise<Asset> {
    const res = await apiClient.patch<ApiResponse<Asset>>(`/api/tickets/assets/${id}`, dto);
    return res.data?.data || (res.data as any);
  },

  async removeAsset(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(`/api/tickets/assets/${id}`);
    return res.data?.data || (res.data as any);
  },

  // ---------------------------------------------------------------
  // COMPLAINT ATTACHMENTS
  // ---------------------------------------------------------------
  async addAttachment(complaintId: string, dto: CreateAttachmentDto): Promise<ComplaintAttachment> {
    const res = await apiClient.post<ApiResponse<ComplaintAttachment>>(
      `/api/tickets/complaints/${complaintId}/attachments`,
      dto,
    );
    return res.data?.data || (res.data as any);
  },

  async findAttachments(complaintId: string): Promise<ComplaintAttachment[]> {
    const res = await apiClient.get<ApiResponse<ComplaintAttachment[]>>(
      `/api/tickets/complaints/${complaintId}/attachments`,
    );
    return res.data?.data || (res.data as any);
  },
};
