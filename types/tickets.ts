export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplaintStatus = 'Open' | 'Escalated' | 'In Progress' | 'Resolved' | 'Closed';
export type AssetCondition = 'Good' | 'Needs Repair' | 'Damaged';
export type InfraRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface InstitutionRef {
  id: string;
  name: string;
  eiin?: string;
  type?: string;
}

export interface ComplaintAttachment {
  id: string;
  complaintId: string;
  fileUrl: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  institutionId: string;
  description: string;
  severity: SeverityLevel;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  institution?: InstitutionRef;
  attachments?: ComplaintAttachment[];
}

export interface CreateComplaintDto {
  description: string;
  severity: SeverityLevel;
}

export interface QueryComplaintsDto {
  page?: number;
  limit?: number;
  search?: string;
  severity?: SeverityLevel;
  status?: ComplaintStatus;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateAttachmentDto {
  fileUrl: string;
}

export interface InfrastructureRequest {
  id: string;
  institutionId: string;
  itemType: string;
  quantity: number;
  status: InfraRequestStatus;
  createdAt: string;
  updatedAt: string;
  institution?: InstitutionRef;
}

export interface CreateInfrastructureRequestDto {
  itemType: string;
  quantity: number;
}

export interface Asset {
  id: string;
  institutionId: string;
  name: string;
  condition: AssetCondition;
  createdAt: string;
  updatedAt: string;
  institution?: InstitutionRef;
}

export interface CreateAssetDto {
  name: string;
  condition: AssetCondition;
}

export interface UpdateAssetDto {
  name?: string;
  condition?: AssetCondition;
}
