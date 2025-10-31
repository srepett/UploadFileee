import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const formatTimeLeft = (expiry: Date): string => {
    const now = new Date();
    let diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return "beberapa saat";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    
    const parts = [];
    if (days > 0) parts.push(`${days} hari`);
    if (hours > 0) parts.push(`${hours} jam`);
    if (minutes > 0) parts.push(`${minutes} menit`);
    
    if (parts.length === 0) {
        return "kurang dari satu menit lagi";
    }
    
    return parts.join(', ') + ' lagi';
};


const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            if (err instanceof Error && err.message.startsWith('BANNED:')) {
                const expiryIso = err.message.split(':')[1];
                const expiryDate = new Date(expiryIso);
                const timeLeft = formatTimeLeft(expiryDate);
                setError(`Akun Anda telah diblokir. Silakan coba login kembali dalam ${timeLeft}.`);
            } else {
                setError('Gagal masuk. Silakan periksa kredensial Anda.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center pt-16">
            <div className="w-full max-w-md p-8 space-y-8 bg-dark-surface rounded-xl shadow-2xl border border-dark-border">
                <h2 className="text-3xl font-bold text-center text-cyan-accent">Login to CyanFile</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-cyan-accent focus:border-cyan-accent"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-gray-400">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-cyan-accent focus:border-cyan-accent"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-dark-bg bg-cyan-accent hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-dark-surface disabled:bg-gray-600">
                           {loading ? <i className="fas fa-spinner fa-spin"></i> : "Sign In"}
                        </button>
                    </div>
                </form>
                <p className="text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-cyan-accent hover:underline">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;