import { User, FileItem, AdminStats, AdminUserView } from '../types';

// --- Helper Functions ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const generateId = (length = 8) => Math.random().toString(36).substring(2, 2 + length);

const initializeDB = () => {
    if (!localStorage.getItem('users')) {
        const adminUser: User = { id: 'admin1', email: 'ask@zymzz.my.id', role: 'admin', createdAt: new Date().toISOString() };
        const regularUser: User = { id: 'user1', email: 'user@domain.com', role: 'user', createdAt: new Date().toISOString() };
        localStorage.setItem('users', JSON.stringify([adminUser, regularUser]));
        localStorage.setItem('passwords', JSON.stringify({ 'admin1': '1Iqanu6IbdvW85TmDWG2_bhnsFLLlTvQLGfe7AOy', 'user1': 'user123' }));
    }
    if (!localStorage.getItem('files')) {
        localStorage.setItem('files', JSON.stringify([]));
    }
};

initializeDB();

// --- Auth ---
export const login = async (email: string, pass: string): Promise<User> => {
    await delay(500);
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
    const user = users.find(u => u.email === email);
    
    if (user) {
        if (user.bannedUntil) {
            const banExpires = new Date(user.bannedUntil);
            if (new Date() < banExpires) {
                // Throw a specific error format that the frontend can easily parse.
                throw new Error(`BANNED:${user.bannedUntil}`);
            }
        }
        if (passwords[user.id] === pass) {
            localStorage.setItem('sessionUserId', user.id);
            return user;
        }
    }
    throw new Error('Invalid credentials');
};

export const register = async (email: string, pass: string): Promise<User> => {
    await delay(500);
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
    if (users.some(u => u.email === email)) {
        throw new Error('User already exists');
    }
    const newUser: User = { id: generateId(), email, role: 'user', createdAt: new Date().toISOString() };
    users.push(newUser);
    passwords[newUser.id] = pass;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('passwords', JSON.stringify(passwords));
    localStorage.setItem('sessionUserId', newUser.id);
    return newUser;
}

export const logout = () => {
    localStorage.removeItem('sessionUserId');
};

export const getCurrentUser = async (): Promise<User> => {
    await delay(100);
    const userId = localStorage.getItem('sessionUserId');
    if (!userId) throw new Error('No session');
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    return user;
};


// --- File Management (User) ---

export const uploadFile = async (file: File, userId: string): Promise<FileItem> => {
    await delay(1500);
    const files: FileItem[] = JSON.parse(localStorage.getItem('files') || '[]');
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found for upload");

    const fileType = file.type.startsWith('image/') ? 'image' : 'video';
    const newFile: FileItem = {
        id: generateId(),
        userId: userId,
        userEmail: user.email,
        name: file.name,
        type: fileType,
        size: file.size,
        url: `/${fileType === 'image' ? 'foto' : 'video'}/${generateId(6)}`,
        createdAt: new Date().toISOString(),
    };
    files.unshift(newFile);
    localStorage.setItem('files', JSON.stringify(files));
    return newFile;
};

export const getUserFiles = async (userId: string): Promise<FileItem[]> => {
    await delay(500);
    const files: FileItem[] = JSON.parse(localStorage.getItem('files') || '[]');
    return files.filter(f => f.userId === userId);
};

export const getFileByUrl = async (url: string): Promise<FileItem | undefined> => {
    await delay(300);
    const files: FileItem[] = JSON.parse(localStorage.getItem('files') || '[]');
    return files.find(f => f.url === url || f.customUrl === url);
}

export const updateFileUrl = async (fileId: string, newUrlSlug: string, userId: string): Promise<FileItem> => {
    await delay(400);
    const files: FileItem[] = JSON.parse(localStorage.getItem('files') || '[]');
    const fileIndex = files.findIndex(f => f.id === fileId && f.userId === userId);
    if (fileIndex === -1) throw new Error("File not found or permission denied");

    const fileToUpdate = files[fileIndex];
    const newUrl = `/${fileToUpdate.type === 'image' ? 'foto' : 'video'}/${newUrlSlug}`;
    
    // Check for conflicts
    if (files.some(f => f.url === newUrl || f.customUrl === newUrl)) {
        throw new Error("This custom URL is already taken.");
    }
    
    fileToUpdate.customUrl = newUrl;
    files[fileIndex] = fileToUpdate;
    localStorage.setItem('files', JSON.stringify(files));
    return fileToUpdate;
};

export const deleteFile = async (fileId: string, userId: string): Promise<void> => {
    await delay(400);
    let files: FileItem[] = JSON.parse(localStorage.getItem('files') || '[]');
    const initialLength = files.length;
    files = files.filter(f => !(f.id === fileId && f.userId === userId));
    if (files.length === initialLength) {
        throw new Error("File not found or permission denied");
    }
    localStorage.setItem('files', JSON.stringify(files));
};


// --- Admin ---

export const getAdminStats = async (): Promise<AdminStats> => {
    await delay(600);
    const files: FileItem[] = JSON.parse(localStorage.getItem('files') || '[]');
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    
    const totalCapacity = 1 * 1024 * 1024 * 1024; // 1 GB for demo

    const storageByType = files.reduce((acc, file) => {
        if (file.type === 'image') acc.images += file.size;
        if (file.type === 'video') acc.videos += file.size;
        return acc;
    }, { images: 0, videos: 0 });

    const totalStorage = storageByType.images + storageByType.videos;

    return {
        totalUsers: users.length,
        totalFiles: files.length,
        totalStorage,
        storageByType,
        totalCapacity,
        remainingStorage: totalCapacity - totalStorage,
    };
};

export const getAdminAllUsers = async (): Promise<AdminUserView[]> => {
    await delay(500);
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
    return users.map(user => ({
        ...user,
        password: passwords[user.id] || 'N/A'
    }));
};

export const getAllFiles = async (): Promise<FileItem[]> => {
    await delay(500);
    return JSON.parse(localStorage.getItem('files') || '[]');
};

export const adminDeleteFile = async (fileId: string): Promise<void> => {
    await delay(400);
    let files: FileItem[] = JSON.parse(localStorage.getItem('files') || '[]');
    files = files.filter(f => f.id !== fileId);
    localStorage.setItem('files', JSON.stringify(files));
};

export const adminDeleteUser = async (userId: string): Promise<void> => {
    await delay(500);
    let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    let passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
    let files: FileItem[] = JSON.parse(localStorage.getItem('files') || '[]');

    users = users.filter(u => u.id !== userId);
    files = files.filter(f => f.userId !== userId);
    delete passwords[userId];

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('files', JSON.stringify(files));
    localStorage.setItem('passwords', JSON.stringify(passwords));
};

export const setUserBan = async (userId: string, banUntilISO: string | null): Promise<void> => {
    await delay(500);
    let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        if (banUntilISO) {
            users[userIndex].bannedUntil = banUntilISO;
        } else {
            // If null is passed, it means unban
            delete users[userIndex].bannedUntil;
        }
        localStorage.setItem('users', JSON.stringify(users));
    } else {
        throw new Error("User not found");
    }
};
