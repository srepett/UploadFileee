
import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { FileItem } from '../types';
import { Link } from 'react-router-dom';

const UploadForm: React.FC = () => {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<FileItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            setUploadedFile(null);
            if (selectedFile.type.startsWith('image/')) {
                setPreview(URL.createObjectURL(selectedFile));
            } else {
                setPreview(null);
            }
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            if (fileInputRef.current) {
                fileInputRef.current.files = e.dataTransfer.files;
            }
            setFile(droppedFile);
            setError(null);
            setUploadedFile(null);
            if (droppedFile.type.startsWith('image/')) {
                setPreview(URL.createObjectURL(droppedFile));
            } else {
                setPreview(null);
            }
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleUpload = useCallback(async () => {
        if (!file || !user) return;

        setIsUploading(true);
        setError(null);
        setProgress(0);
        
        // Simulate upload progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 5;
            });
        }, 50);

        try {
            const result = await api.uploadFile(file, user.id);
            clearInterval(interval);
            setProgress(100);
            setUploadedFile(result);
            setFile(null);
            setPreview(null);
        } catch (err) {
            clearInterval(interval);
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    }, [file, user]);

    return (
        <div className="max-w-2xl mx-auto mt-10 p-8 bg-dark-surface rounded-xl shadow-2xl border border-dark-border">
            <h2 className="text-3xl font-bold text-center mb-6 text-cyan-accent">Upload a File</h2>
            
            <div 
                className="border-2 border-dashed border-dark-border hover:border-cyan-accent transition-colors rounded-lg p-10 text-center cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <i className="fas fa-file-arrow-up text-5xl text-gray-500 mb-4"></i>
                <p className="text-gray-400">Drag & drop your file here, or click to select a file</p>
            </div>

            {preview && (
                <div className="mt-6">
                    <img src={preview} alt="File preview" className="max-h-64 mx-auto rounded-lg" />
                </div>
            )}
            
            {file && (
                <div className="mt-6 text-center">
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button 
                        onClick={handleUpload} 
                        disabled={isUploading} 
                        className="mt-4 w-full bg-cyan-accent text-dark-bg font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isUploading ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-upload mr-2"></i>
                                Upload
                            </>
                        )}
                    </button>
                </div>
            )}
            
            {isUploading && (
                <div className="mt-4 w-full bg-dark-border rounded-full h-2.5">
                    <div className="bg-cyan-accent h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            )}

            {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
            
            {uploadedFile && (
                <div className="mt-6 p-4 bg-green-900/50 border border-green-500 rounded-lg text-center">
                    <p className="text-lg font-semibold text-green-300">Upload Successful!</p>
                    <p className="mt-2">Your file is available at:</p>
                    <div className="mt-2 flex items-center justify-center bg-dark-bg p-2 rounded-md">
                       <Link to={uploadedFile.url} className="text-cyan-accent font-mono hover:underline truncate">
                         {window.location.origin + window.location.pathname + `#${uploadedFile.url}`}
                       </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadForm;
