import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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
                const response = await axios.post('http://localhost:8000/api/login', {
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

        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">

            <div className="bg-slate-900/80 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row w-full max-w-5xl min-h-[600px] border border-slate-800">



                {/* Left Side - Theme Gradient Background */}

                <div className="w-full md:w-1/2 bg-gradient-to-br from-slate-800 via-slate-900 to-teal-900 p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">

                    {/* Decorative SVGs for the wave effect */}

                    <svg className="absolute bottom-0 left-0 w-full text-slate-700/30" viewBox="0 0 1440 320" preserveAspectRatio="none">

                        <path fill="currentColor" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>

                    </svg>

                    <svg className="absolute bottom-0 left-0 w-full text-teal-500/20" viewBox="0 0 1440 320" preserveAspectRatio="none">

                        <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>

                    </svg>

                    <svg className="absolute bottom-0 left-0 w-full text-slate-800/50" viewBox="0 0 1440 320" preserveAspectRatio="none">

                        <path fill="currentColor" fillOpacity="1" d="M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,224C672,213,768,171,864,149.3C960,128,1056,128,1152,144C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>

                    </svg>



                    <div className="relative z-10 mt-8">

                        <h1 className="text-5xl font-extrabold mb-6 tracking-tight">Welcome to Khoj</h1>

                        <p className="text-lg text-white/90 leading-relaxed max-w-md font-medium">

                            Your trusted platform for recovering lost belongings and building a supportive community.

                        </p>

                    </div>



                    <div className="relative z-10 text-sm opacity-90 mt-auto pt-16 font-medium tracking-wide">

                        Reuniting people with their possessions.

                    </div>

                </div>



                {/* Right Side - Login Form */}

                <div className="w-full md:w-1/2 p-10 lg:p-14 flex flex-col justify-center bg-slate-900 relative z-10">

                    <div className="max-w-md mx-auto w-full">

                        <h2 className="text-4xl font-bold mb-3 text-white">Login</h2>

                        <p className="text-slate-400 text-sm mb-10 font-medium leading-relaxed">
                            Welcome back! Please enter your credentials to connect with the community.
                        </p>

                        {successMessage && (
                            <div className="mb-6 p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg font-medium text-center shadow-sm">
                                {successMessage}
                            </div>
                        )}
                        {errorMessage && (
                            <div className="mb-6 p-4 bg-red-500/15 border border-red-500/30 text-red-300 rounded-lg font-medium text-center shadow-sm">
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

                                    className={`w-full px-4 py-3 rounded-lg border ${emailError ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700 bg-slate-800'} focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-white font-medium placeholder-slate-500`}

                                    placeholder="you@example.com"

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

                                        className={`w-full px-4 py-3 pr-10 rounded-lg border ${passwordError ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700 bg-slate-800'} focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-white font-medium placeholder-slate-500`}

                                        placeholder="••••••••"

                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>

                                {passwordError && (

                                    <p className="text-red-400 text-xs mt-2 font-medium">{passwordError}</p>

                                )}

                            </div>



                            {/* Options */}

                            <div className="flex items-center">

                                <label className="flex items-center cursor-pointer group">

                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-600 text-teal-600 focus:ring-teal-500 cursor-pointer transition-colors" />

                                    <span className="ml-2 text-sm text-slate-400 font-medium group-hover:text-slate-300 transition-colors">Remember me</span>

                                </label>

                            </div>



                            {/* Submit Button */}

                            <button

                                type="submit"

                                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-lg shadow-teal-900/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 focus:ring-offset-slate-900 mt-6 active:scale-[0.98]"

                            >

                                LOGIN

                            </button>

                        </form>



                        <div className="flex justify-center items-center mt-10 text-sm">

                            <p className="text-slate-400 font-medium">

                                Don't have an account? <Link to="/register" className="text-teal-400 hover:text-teal-300 hover:underline font-bold transition-colors ml-1">Register here.</Link>

                            </p>

                        </div>

                    </div>

                </div>



            </div>

        </div>

    );

};



export default Login;

