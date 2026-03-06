import React, { useState } from 'react';

import { useNavigate, Link } from 'react-router-dom';



const Login = () => {

    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');

    const [emailError, setEmailError] = useState('');

    const [passwordError, setPasswordError] = useState('');

    const navigate = useNavigate();



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



    const handleLogin = (e: React.FormEvent) => {

        e.preventDefault();



        if (validate()) {

            if (email.toLowerCase().includes('admin')) {

                navigate('/admin-dashboard');

            } else {

                navigate('/user-dashboard');

            }

        }

    };



    return (

        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">

            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row w-full max-w-5xl min-h-[600px]">



                {/* Left Side - Blue Gradient Background */}

                <div className="w-full md:w-1/2 bg-gradient-to-br from-cyan-400 to-blue-500 p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">

                    {/* Decorative SVGs for the wave effect */}

                    <svg className="absolute bottom-0 left-0 w-full text-blue-600/20" viewBox="0 0 1440 320" preserveAspectRatio="none">

                        <path fill="currentColor" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>

                    </svg>

                    <svg className="absolute bottom-0 left-0 w-full text-cyan-400/20" viewBox="0 0 1440 320" preserveAspectRatio="none">

                        <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>

                    </svg>

                    <svg className="absolute bottom-0 left-0 w-full text-blue-500/40" viewBox="0 0 1440 320" preserveAspectRatio="none">

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

                <div className="w-full md:w-1/2 p-10 lg:p-14 flex flex-col justify-center bg-white relative z-10">

                    <div className="max-w-md mx-auto w-full">

                        <h2 className="text-4xl font-bold mb-3 text-slate-800">Login</h2>

                        <p className="text-slate-500 text-sm mb-10 font-medium leading-relaxed">

                            Welcome back! Please enter your credentials to connect with the community.

                        </p>



                        <form onSubmit={handleLogin} className="space-y-6">

                            {/* Email */}

                            <div>

                                <label className="block text-slate-600 font-semibold text-sm mb-2">Email Address</label>

                                <input

                                    type="text"

                                    value={email}

                                    onChange={(e) => setEmail(e.target.value)}

                                    className={`w-full px-4 py-3 rounded-lg border ${emailError ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-800 font-medium`}

                                />

                                {emailError && (

                                    <p className="text-red-500 text-xs mt-2 font-medium">{emailError}</p>

                                )}

                            </div>



                            {/* Password */}

                            <div>

                                <label className="block text-slate-600 font-semibold text-sm mb-2">Password</label>

                                <input

                                    type="password"

                                    value={password}

                                    onChange={(e) => setPassword(e.target.value)}

                                    className={`w-full px-4 py-3 rounded-lg border ${passwordError ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-800 font-medium`}

                                />

                                {passwordError && (

                                    <p className="text-red-500 text-xs mt-2 font-medium">{passwordError}</p>

                                )}

                            </div>



                            {/* Options */}

                            <div className="flex items-center">

                                <label className="flex items-center cursor-pointer group">

                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer transition-colors" />

                                    <span className="ml-2 text-sm text-slate-500 font-medium group-hover:text-slate-700 transition-colors">Remember me</span>

                                </label>

                            </div>



                            {/* Submit Button */}

                            <button

                                type="submit"

                                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 mt-6 active:scale-[0.98]"

                            >

                                LOGIN

                            </button>

                        </form>



                        <div className="flex justify-center items-center mt-10 text-sm">

                            <p className="text-slate-500 font-medium">

                                Don't have an account? <Link to="/register" className="text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors ml-1">Register here.</Link>

                            </p>

                        </div>

                    </div>

                </div>



            </div>

        </div>

    );

};



export default Login;

