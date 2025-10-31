import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import * as api from '../services/api';
import { AdminStats, AdminUserView, FileItem } from '../types';
import { Link } from 'react-router-dom';

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes < 0) bytes = 0;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatTimeLeft = (expiry: Date): string => {
    const now = new Date();
    let diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.ceil(diff / (1000 * 60));
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.join(' ');
};

const StatCard: React.FC<{ title: string; value: string | number; icon: string }> = ({ title, value, icon }) => (
    <div className="bg-dark-surface p-6 rounded-lg shadow-lg border border-dark-border flex items-center space-x-4">
        <div className="bg-cyan-accent/20 p-3 rounded-full">
            <i className={`${icon} text-cyan-accent text-2xl`}></i>
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const BanUserModal: React.FC<{ userEmail: string; onConfirm: (isoDate: string) => void; onCancel: () => void; }> = ({ userEmail, onConfirm, onCancel }) => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const handleConfirm = () => {
    const totalMilliseconds = (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60) * 1000;
    if (totalMilliseconds <= 0) {
        alert("Please enter a valid duration.");
        return;
    }
    const expiryDate = new Date(Date.now() + totalMilliseconds);
    onConfirm(expiryDate.toISOString());
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-dark-surface p-8 rounded-lg shadow-2xl border border-dark-border w-full max-w-md">
            <h3 className="text-2xl font-bold text-cyan-accent mb-4">Ban User: <span className="text-white font-mono">{userEmail}</span></h3>
            <p className="text-gray-400 mb-6">Set the duration for the ban.</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm text-gray-300 mb-1">Days</label>
                    <input type="number" min="0" value={days} onChange={e => setDays(parseInt(e.target.value) || 0)} className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2"/>
                </div>
                 <div>
                    <label className="block text-sm text-gray-300 mb-1">Hours</label>
                    <input type="number" min="0" max="23" value={hours} onChange={e => setHours(parseInt(e.target.value) || 0)} className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2"/>
                </div>
                 <div>
                    <label className="block text-sm text-gray-300 mb-1">Minutes</label>
                    <input type="number" min="0" max="59" value={minutes} onChange={e => setMinutes(parseInt(e.target.value) || 0)} className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2"/>
                </div>
            </div>
            <div className="flex justify-end gap-4">
                <button onClick={onCancel} className="px-4 py-2 rounded bg-dark-border hover:bg-gray-600 transition-colors">Cancel</button>
                <button onClick={handleConfirm} className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 transition-colors">Confirm Ban</button>
            </div>
        </div>
    </div>
  );
};

const AdminPage: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUserView[]>([]);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [banModal, setBanModal] = useState<{ isOpen: boolean; userId: string; userEmail: string; }>({ isOpen: false, userId: '', userEmail: '' });
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        // Only set main loading on initial fetch
        if (!stats) setLoading(true);
        try {
            const [statsData, usersData, filesData] = await Promise.all([
                api.getAdminStats(),
                api.getAdminAllUsers(),
                api.getAllFiles(),
            ]);
            setStats(statsData);
            setUsers(usersData);
            setFiles(filesData);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    }, [stats]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteUser = async (userId: string, userEmail: string) => {
        if (!window.confirm(`Are you sure you want to DELETE the user ${userEmail}? This is permanent and will remove all their files.`)) return;
        setDeletingId(userId);
        try {
            await api.adminDeleteUser(userId);
            fetchData();
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Could not delete user.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleConfirmBan = async (banUntilISO: string) => {
        try {
            await api.setUserBan(banModal.userId, banUntilISO);
            setBanModal({ isOpen: false, userId: '', userEmail: '' });
            fetchData();
        } catch(error) {
             console.error("Failed to ban user", error);
            alert("Could not ban user.");
        }
    }
    
    const handleUnbanUser = async (userId: string) => {
        try {
            await api.setUserBan(userId, null); // Pass null to unban
            fetchData();
        } catch (error) {
            console.error("Failed to unban user", error);
            alert("Could not unban user.");
        }
    };
    
    const handleDeleteFile = async (fileId: string) => {
        if (!window.confirm(`Are you sure you want to delete this file?`)) return;
        setDeletingId(fileId);
        try {
            await api.adminDeleteFile(fileId);
            fetchData();
        } catch (error) {
            console.error("Failed to delete file", error);
            alert("Could not delete file.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return <div className="text-center pt-10"><i className="fas fa-spinner fa-spin text-cyan-accent text-3xl"></i></div>;
    }

    const chartData = [
        { name: 'Images', size: stats?.storageByType.images || 0 },
        { name: 'Videos', size: stats?.storageByType.videos || 0 }
    ];

    const imageFilesCount = files.filter(f => f.type === 'image').length;
    const videoFilesCount = files.filter(f => f.type === 'video').length;

    return (
        <div className="max-w-7xl mx-auto py-10 space-y-12">
            {banModal.isOpen && <BanUserModal userEmail={banModal.userEmail} onConfirm={handleConfirmBan} onCancel={() => setBanModal({isOpen: false, userId: '', userEmail: ''})} />}
            <h1 className="text-4xl font-bold text-cyan-accent">Admin Dashboard</h1>

            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon="fas fa-users" />
                    <StatCard title="Total Files" value={stats?.totalFiles ?? 0} icon="fas fa-file-alt" />
                    <StatCard title="Image Files" value={imageFilesCount} icon="fas fa-file-image" />
                    <StatCard title="Video Files" value={videoFilesCount} icon="fas fa-file-video" />
                </div>
            </section>
            
            <section className="bg-dark-surface p-6 rounded-lg shadow-lg border border-dark-border">
                <h2 className="text-2xl font-semibold text-white mb-4">Storage Overview</h2>
                <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
                    <span>{formatBytes(stats?.totalStorage ?? 0)} used</span>
                    <span>{formatBytes(stats?.totalCapacity ?? 0)} total</span>
                </div>
                <div className="w-full bg-dark-border rounded-full h-4 my-2">
                    <div className="bg-cyan-accent h-4 rounded-full" style={{ width: `${((stats?.totalStorage ?? 0) / (stats?.totalCapacity || 1)) * 100}%` }}></div>
                </div>
                <p className="text-right mt-2 text-lg font-bold text-gray-300">{formatBytes(stats?.remainingStorage ?? 0)} remaining</p>
            </section>

             <section className="bg-dark-surface p-6 rounded-lg shadow-lg border border-dark-border">
                <h2 className="text-2xl font-semibold text-white mb-4">Storage by Type</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(tick) => formatBytes(tick)} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #2d2d2d' }} />
                        <Legend />
                        <Bar dataKey="size" fill="#00ddff" name="Storage Used"/>
                    </BarChart>
                </ResponsiveContainer>
            </section>

            <section>
                <h2 className="text-2xl font-semibold text-white mb-4">User Management</h2>
                <div className="overflow-x-auto bg-dark-surface border border-dark-border rounded-lg shadow-lg">
                    <table className="min-w-full divide-y divide-dark-border">
                        <thead><tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-dark-border">
                            {users.map(user => {
                                const isBanned = user.bannedUntil && new Date(user.bannedUntil) > new Date();
                                return (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 text-sm text-white font-mono">{user.email}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {isBanned ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-200">
                                                Banned ({formatTimeLeft(new Date(user.bannedUntil!))})
                                            </span>
                                        ) : (
                                             <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-200">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300 capitalize">{user.role}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-4">
                                            {user.role !== 'admin' && (
                                                <div className="flex items-center gap-4">
                                                    {isBanned ? (
                                                        <button onClick={() => handleUnbanUser(user.id)} className="text-green-400 hover:text-green-300" disabled={!!deletingId}><i className="fas fa-check-circle mr-1"></i>Unban</button>
                                                    ) : (
                                                        <button onClick={() => setBanModal({isOpen: true, userId: user.id, userEmail: user.email})} className="text-yellow-400 hover:text-yellow-300" disabled={!!deletingId}><i className="fas fa-gavel mr-1"></i>Ban</button>
                                                    )}
                                                    <button onClick={() => handleDeleteUser(user.id, user.email)} className="text-red-500 hover:text-red-400" disabled={!!deletingId}><i className="fas fa-user-slash mr-1"></i>Delete</button>
                                                </div>
                                            )}
                                            {deletingId === user.id && (<i className="fas fa-spinner fa-spin text-white"></i>)}
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </section>

             <section>
                <h2 className="text-2xl font-semibold text-white mb-4">All Files</h2>
                <div className="overflow-x-auto bg-dark-surface border border-dark-border rounded-lg shadow-lg">
                    <table className="min-w-full divide-y divide-dark-border">
                         <thead><tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">File Name</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">URL</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Uploaded By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-dark-border">
                            {files.map(file => (
                                <tr key={file.id}>
                                    <td className="px-6 py-4 text-sm text-white truncate max-w-xs">{file.name}</td>
                                    <td className="px-6 py-4 text-sm text-cyan-accent font-mono"><Link to={file.customUrl || file.url} target="_blank">{file.customUrl || file.url}</Link></td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{file.userEmail}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{formatBytes(file.size)}</td>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <Link to={file.customUrl || file.url} target="_blank" className={`text-cyan-accent hover:text-cyan-400 ${deletingId ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <i className="fas fa-eye mr-1"></i>View
                                            </Link>
                                            <button onClick={() => handleDeleteFile(file.id)} className="text-red-500 hover:text-red-400" disabled={!!deletingId}>
                                                <i className="fas fa-trash-alt mr-1"></i>Delete
                                            </button>
                                            {deletingId === file.id && <i className="fas fa-spinner fa-spin text-white"></i>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminPage;