export type UserRole = 'admin' | 'officer' | 'to' | 'ato' | 'head_teacher' | 'teacher';

export interface Role {
  id: string;
  name: UserRole;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  designation?: string;
  nid?: string;
}

export interface Institution {
  id: string;
  name: string;
  eiin: string;
  type: string;
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  email: string;
  status: 'active' | 'suspended';
  roleId: string;
  role?: Role;
  institutionId?: string | null;
  institution?: Institution | null;
  profile?: Profile | null;
}
