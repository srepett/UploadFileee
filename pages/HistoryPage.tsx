
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { FileItem } from '../types';
import { Link } from 'react-router-dom';

const HistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUrl, setEditingUrl] = useState<{ id: string; value: string } | null>(null);

    const fetchFiles = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userFiles = await api.getUserFiles(user.id);
            setFiles(userFiles);
        } catch (error) {
            console.error("Failed to fetch files", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);
    
    const handleDelete = async (fileId: string) => {
        if (!user || !window.confirm("Are you sure you want to delete this file?")) return;
        try {
            await api.deleteFile(fileId, user.id);
            setFiles(prev => prev.filter(f => f.id !== fileId));
        } catch (error) {
            console.error("Failed to delete file", error);
            alert("Could not delete file.");
        }
    };
    
    const handleUpdateUrl = async (fileId: string) => {
        if (!user || !editingUrl || editingUrl.id !== fileId) return;
        try {
            await api.updateFileUrl(fileId, editingUrl.value, user.id);
            setEditingUrl(null);
            fetchFiles(); // Refresh to show new URL
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Failed to update URL");
        }
    };

    const getFullUrl = (file: FileItem) => {
        const path = file.customUrl || file.url;
        return window.location.origin + window.location.pathname + `#${path}`;
    };

    if (loading) {
        return <div className="text-center pt-10"><i className="fas fa-spinner fa-spin text-cyan-accent text-3xl"></i></div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-10">
            <h1 className="text-4xl font-bold text-cyan-accent mb-8">My Upload History</h1>
            {files.length === 0 ? (
                 <p className="text-gray-400">You haven't uploaded any files yet. <Link to="/" className="text-cyan-accent hover:underline">Upload one now!</Link></p>
            ) : (
                <div className="overflow-x-auto bg-dark-surface border border-dark-border rounded-lg shadow-lg">
                    <table className="min-w-full divide-y divide-dark-border">
                        <thead className="bg-dark-border/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">File Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">URL</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Uploaded</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-dark-surface divide-y divide-dark-border">
                            {files.map((file) => (
                                <tr key={file.id} className="hover:bg-dark-border/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{file.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{file.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-accent">
                                        {editingUrl?.id === file.id ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">.../{file.type === 'image' ? 'foto' : 'video'}/</span>
                                                <input
                                                  type="text"
                                                  value={editingUrl.value}
                                                  onChange={(e) => setEditingUrl({ id: file.id, value: e.target.value })}
                                                  className="bg-dark-bg border border-dark-border rounded-md px-2 py-1 text-sm w-32"
                                                />
                                                <button onClick={() => handleUpdateUrl(file.id)} className="text-green-400 hover:text-green-300"><i className="fas fa-check"></i></button>
                                                <button onClick={() => setEditingUrl(null)} className="text-red-400 hover:text-red-300"><i className="fas fa-times"></i></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <a href={getFullUrl(file)} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-xs">{getFullUrl(file)}</a>
                                                <button onClick={() => setEditingUrl({ id: file.id, value: (file.customUrl || file.url).split('/').pop() || '' })} className="text-gray-400 hover:text-white"><i className="fas fa-pen"></i></button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(file.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleDelete(file.id)} className="text-red-500 hover:text-red-400 transition-colors">
                                            <i className="fas fa-trash-alt mr-1"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
