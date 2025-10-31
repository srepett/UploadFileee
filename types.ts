export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  bannedUntil?: string; // ISO string for ban expiry date
}

// Tipe khusus untuk tampilan admin, termasuk kata sandi
export interface AdminUserView extends User {
  password?: string;
}

export interface FileItem {
  id: string;
  userId: string;
  userEmail: string;
  name: string;
  type: 'image' | 'video';
  size: number;
  url: string;
  customUrl?: string;
  createdAt: string;
  previewData?: string; // For image previews on upload
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  register: (email: string, pass: string) => Promise<User | null>;
  logout: () => void;
}

export interface AdminStats {
  totalUsers: number;
  totalFiles: number;
  totalStorage: number; // in bytes
  storageByType: {
    images: number; // in bytes
    videos: number; // in bytes
  };
  totalCapacity: number; // in bytes
  remainingStorage: number; // in bytes
}
