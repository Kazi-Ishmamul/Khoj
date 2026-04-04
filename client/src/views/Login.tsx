import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { secrets } from '../secrets';

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
);

const Login = () => {

    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');

    const [emailError, setEmailError] = useState('');

    const [passwordError, setPasswordError] = useState('');

    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');



    const validate = () => {

        let isValid = true;



        // Email validation: must contain @ and .

        if (!email.includes('@') || !email.includes('.')) {

            setEmailError('Please enter a valid email address containing @ and .');

            isValid = false;

        } else {

            setEmailError('');

        }



        // Password validation: min 6 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char

        const hasUpperCase = /[A-Z]/.test(password);

        const hasLowerCase = /[a-z]/.test(password);

        const hasNumber = /[0-9]/.test(password);

        const hasSpecialChar = /[^A-Za-z0-9]/.test(password);



        if (password.length < 6 || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {

            setPasswordError('Password must be at least 6 characters long and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.');

            isValid = false;

        } else {

            setPasswordError('');

        }



        return isValid;

    };



    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (validate()) {
            try {
                const response = await axios.post(`${secrets.backendEndpoint}/login`, {
                    email,
                    password
                });
                
                const data = response.data;
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                setSuccessMessage('Login successful!');
                
                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        navigate('/admin-dashboard');
                    } else {
                        navigate('/user-dashboard/items');
                    }
                }, 1000);
            } catch (error: any) {
                setErrorMessage(error.response?.data?.error || 'Login failed. Please check your credentials.');
            }
        }
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-5xl relative z-10">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-700/50 min-h-[600px]">
                    
                    {/* Left Side - Branding */}
                    <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
                        
                        {/* Decorative gradient blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight">
                                Welcome<br />to Khoj
                            </h1>
                            <p className="text-lg text-white/90 leading-relaxed max-w-md font-medium">
                                Your trusted platform for recovering lost belongings and building a supportive community.
                            </p>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                <span className="text-sm text-white/80 font-medium">Secure & Verified Users</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                <span className="text-sm text-white/80 font-medium">Real Item Reunions</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                <span className="text-sm text-white/80 font-medium">Community Driven</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full md:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 lg:p-14 flex flex-col justify-center relative z-10">
                        <div className="max-w-md mx-auto w-full">
                            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">Login</h2>
                            <p className="text-slate-400 text-sm mb-10 font-medium leading-relaxed">
                                Welcome back! Enter your credentials to access your account.
                            </p>

                            {successMessage && (
                                <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-lg font-medium text-center shadow-sm">
                                    {successMessage}
                                </div>
                            )}
                            {errorMessage && (
                                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg font-medium text-center shadow-sm">
                                    {errorMessage}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-6">
                                {/* Email */}
                                <div>
                                    <label className="block text-slate-300 font-semibold text-sm mb-2">Email Address</label>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-lg border ${emailError ? 'border-red-500/50 bg-red-500/10' : 'border-slate-600/50 bg-slate-700/50'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white font-medium placeholder-slate-500`}
                                        placeholder="your@email.com"
                                    />
                                    {emailError && (
                                        <p className="text-red-400 text-xs mt-2 font-medium">{emailError}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-slate-300 font-semibold text-sm mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={`w-full px-4 py-3 pr-10 rounded-lg border ${passwordError ? 'border-red-500/50 bg-red-500/10' : 'border-slate-600/50 bg-slate-700/50'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white font-medium placeholder-slate-500`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                    {passwordError && (
                                        <p className="text-red-400 text-xs mt-2 font-medium">{passwordError}</p>
                                    )}
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 cursor-pointer transition-colors" />
                                        <span className="ml-2 text-sm text-slate-400 font-medium group-hover:text-slate-300 transition-colors">Remember me</span>
                                    </label>
                                    <Link to="#" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 mt-6 active:scale-[0.98]"
                                >
                                    LOGIN
                                </button>
                            </form>

                            <div className="flex justify-center items-center mt-10 text-sm">
                                <p className="text-slate-400 font-medium">
                                    Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 hover:underline font-bold transition-colors ml-1">Register here.</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};



export default Login;

