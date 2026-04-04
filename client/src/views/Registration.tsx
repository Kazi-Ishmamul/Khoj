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

const Registration = () => {
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        profile_pic: null as File | null,
        password: '',
        confirmPassword: ''
    });

    // Error State
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        profile_pic: '',
        password: '',
        confirmPassword: ''
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFormData(prev => ({ ...prev, profile_pic: e.target.files![0] }));
            if (errors.profile_pic) {
                setErrors(prev => ({ ...prev, profile_pic: '' }));
            }
        }
    };

    const validate = () => {
        let isValid = true;
        const newErrors = {
            name: '',
            email: '',
            phone: '',
            address: '',
            profile_pic: '',
            password: '',
            confirmPassword: ''
        };

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required.';
            isValid = false;
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required.';
            isValid = false;
        } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
            newErrors.email = 'Please enter a valid email address containing @ and .';
            isValid = false;
        }

        // Phone validation
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required.';
            isValid = false;
        } else if (!/^\d+$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must contain only numbers.';
            isValid = false;
        }

        // Address validation
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required.';
            isValid = false;
        }

        // Profile Pic validation (Optional)
        if (formData.profile_pic) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(formData.profile_pic.type)) {
                newErrors.profile_pic = 'Only JPG/JPEG/PNG formats are allowed.';
                isValid = false;
            }
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required.';
            isValid = false;
        } else {
            const hasUpperCase = /[A-Z]/.test(formData.password);
            const hasLowerCase = /[a-z]/.test(formData.password);
            const hasNumber = /[0-9]/.test(formData.password);
            const hasSpecialChar = /[^A-Za-z0-9]/.test(formData.password);

            if (formData.password.length < 6 || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
                newErrors.password = 'Password must be at least 6 characters long and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.';
                isValid = false;
            }
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password.';
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (validate()) {
            setIsLoading(true);
            try {
                let picUrl = '';

                if (formData.profile_pic) {
                    const uploadData = new FormData();
                    uploadData.append('file', formData.profile_pic);
                    uploadData.append('upload_preset', 'khoj-profile');

                    try {
                        const cloudinaryRes = await axios.post('https://api.cloudinary.com/v1_1/dait0sacc/image/upload', uploadData);
                        picUrl = cloudinaryRes.data.secure_url;
                    } catch (uploadError) {
                        setErrorMessage('Failed to upload image to Cloudinary.');
                        setIsLoading(false);
                        return;
                    }
                }

                const postData = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    password: formData.password,
                    pic_url: picUrl
                };

                const response = await axios.post(`${secrets.backendEndpoint}/register`, postData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 201) {
                    setSuccessMessage('Registration successful! Redirecting to login...');
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                }
            } catch (error: any) {
                setErrorMessage(error.response?.data?.message || 'Registration failed.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden py-8">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-6xl relative z-10">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col-reverse md:flex-row border border-slate-700/50 min-h-[650px]">
                    
                    {/* Left Side - Registration Form */}
                    <div className="w-full md:w-[55%] p-8 lg:p-12 flex flex-col justify-center relative z-10 overflow-y-auto max-h-[90vh] md:max-h-none">
                        <div className="max-w-lg mx-auto w-full">
                            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">Create Account</h2>
                            <p className="text-slate-400 text-sm mb-8 font-medium leading-relaxed">
                                Join our community to report lost items and help others find their belongings.
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

                            <form onSubmit={handleRegister} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-slate-300 font-semibold text-sm mb-2">Full Name <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 rounded-lg border ${errors.name ? 'border-red-500/50 bg-red-500/10' : 'border-slate-600/50 bg-slate-700/50'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white font-medium placeholder-slate-500`}
                                            placeholder="John Doe"
                                        />
                                        {errors.name && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.name}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-slate-300 font-semibold text-sm mb-2">Phone Number <span className="text-red-400">*</span></label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 rounded-lg border ${errors.phone ? 'border-red-500/50 bg-red-500/10' : 'border-slate-600/50 bg-slate-700/50'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white font-medium placeholder-slate-500`}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                        {errors.phone && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.phone}</p>}
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-slate-300 font-semibold text-sm mb-2">Email Address <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-500/50 bg-red-500/10' : 'border-slate-600/50 bg-slate-700/50'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white font-medium placeholder-slate-500`}
                                        placeholder="your@email.com"
                                    />
                                    {errors.email && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.email}</p>}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-slate-300 font-semibold text-sm mb-2">Address <span className="text-red-400">*</span></label>
                                    <textarea
                                        name="address"
                                        rows={2}
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.address ? 'border-red-500/50 bg-red-500/10' : 'border-slate-600/50 bg-slate-700/50'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white font-medium resize-none placeholder-slate-500`}
                                        placeholder="Street address, city, state, zip"
                                    />
                                    {errors.address && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.address}</p>}
                                </div>

                                {/* Profile Pic */}
                                <div>
                                    <label className="block text-slate-300 font-semibold text-sm mb-2">Profile Picture (Optional)</label>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                        onChange={handleFileChange}
                                        className={`w-full px-3 py-2 rounded-lg border ${errors.profile_pic ? 'border-red-500/50 bg-red-500/10' : 'border-slate-600/50 bg-slate-700/50'} text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer`}
                                    />
                                    {errors.profile_pic && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.profile_pic}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Password */}
                                    <div>
                                        <label className="block text-slate-300 font-semibold text-sm mb-2">Password <span className="text-red-400">*</span></label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${errors.password ? 'border-red-500/50 bg-red-500/10' : 'border-slate-600/50 bg-slate-700/50'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white font-medium placeholder-slate-500`}
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
                                        {errors.password && <p className="text-red-400 text-xs mt-1.5 font-medium leading-tight">{errors.password}</p>}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-slate-300 font-semibold text-sm mb-2">Confirm Password <span className="text-red-400">*</span></label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${errors.confirmPassword ? 'border-red-500/50 bg-red-500/10' : 'border-slate-600/50 bg-slate-700/50'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white font-medium placeholder-slate-500`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.confirmPassword}</p>}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!!successMessage || isLoading}
                                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-blue-400 disabled:to-blue-400 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 mt-8 active:scale-[0.98]"
                                >
                                    {isLoading ? 'REGISTERING...' : 'CREATE ACCOUNT'}
                                </button>
                            </form>

                            <div className="flex justify-center items-center mt-8 text-sm">
                                <p className="text-slate-400 font-medium">
                                    Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline font-bold transition-colors ml-1">Login here.</Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Branding */}
                    <div className="w-full md:w-[45%] bg-gradient-to-bl from-blue-600 via-purple-600 to-blue-700 p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex rounded-r-none md:rounded-r-3xl shadow-lg z-20">
                        
                        {/* Decorative gradient blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight">
                                Join the<br />Khoj<br />Community
                            </h1>
                            <p className="text-lg text-white/90 leading-relaxed max-w-sm font-medium">
                                Become a member to report lost items, claim found belongings, and help build a trustworthy network.
                            </p>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                <span className="text-sm text-white/80 font-medium">Report & Find Items</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                <span className="text-sm text-white/80 font-medium">Verified Community</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                <span className="text-sm text-white/80 font-medium">Instant Notifications</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registration;
