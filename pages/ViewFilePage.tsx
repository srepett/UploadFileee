
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FileItem } from '../types';
import * as api from '../services/api';

const ViewFilePage: React.FC = () => {
    const location = useLocation();
    const [file, setFile] = useState<FileItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFile = async () => {
            setLoading(true);
            setError(null);
            
            // Construct the path from the hash
            const path = location.pathname;

            try {
                const fetchedFile = await api.getFileByUrl(path);
                if (fetchedFile) {
                    setFile(fetchedFile);
                } else {
                    setError('File not found.');
                }
            } catch (err) {
                setError('Error retrieving file.');
            } finally {
                setLoading(false);
            }
        };

        fetchFile();
    }, [location.pathname]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><i className="fas fa-spinner fa-spin text-cyan-accent text-4xl"></i></div>;
    }

    if (error) {
        return (
            <div className="text-center pt-20">
                <i className="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
                <h1 className="text-3xl font-bold text-red-400">{error}</h1>
                <p className="text-gray-400 mt-2">The link may be broken or the file may have been deleted.</p>
            </div>
        );
    }
    
    if (!file) {
        return null;
    }

    return (
        <div className="container mx-auto p-4 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4 break-all">{file.name}</h1>
            <div className="w-full max-w-4xl bg-dark-surface p-4 rounded-lg shadow-lg border border-dark-border">
                {file.type === 'image' ? (
                     <img src={`https://picsum.photos/seed/${file.id}/1200/800`} alt={file.name} className="w-full h-auto rounded-md object-contain" />
                ) : (
                     <video controls src={`https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4`} className="w-full rounded-md">
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>
             <div className="text-center mt-4 text-gray-400 text-sm">
                <p>Uploaded by: {file.userEmail} on {new Date(file.createdAt).toLocaleDateString()}</p>
                <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
        </div>
    );
};

export default ViewFilePage;
