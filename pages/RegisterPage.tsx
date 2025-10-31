
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError('');
        setLoading(true);
        try {
            await register(email, password);
            navigate('/');
        } catch (err) {
             setError(err instanceof Error ? err.message : 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center pt-16">
            <div className="w-full max-w-md p-8 space-y-8 bg-dark-surface rounded-xl shadow-2xl border border-dark-border">
                <h2 className="text-3xl font-bold text-center text-cyan-accent">Create an Account</h2>
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
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-cyan-accent focus:border-cyan-accent"
                            placeholder="••••••••"
                        />
                    </div>
                     <div>
                        <label htmlFor="confirm-password"  className="block text-sm font-medium text-gray-400">Confirm Password</label>
                        <input
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-cyan-accent focus:border-cyan-accent"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-dark-bg bg-cyan-accent hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-dark-surface disabled:bg-gray-600">
                           {loading ? <i className="fas fa-spinner fa-spin"></i> : "Register"}
                        </button>
                    </div>
                </form>
                 <p className="text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-cyan-accent hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
