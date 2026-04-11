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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
            <div className="bg-slate-900/80 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col-reverse md:flex-row w-full max-w-6xl min-h-[700px] border border-slate-800">

                {/* Left Side - Registration Form */}
                <div className="w-full md:w-[55%] p-8 lg:p-12 flex flex-col justify-center bg-slate-900 relative z-10">
                    <div className="max-w-lg mx-auto w-full">
                        <h2 className="text-4xl font-bold mb-3 text-white">Register</h2>
                        <p className="text-slate-400 text-sm mb-8 font-medium leading-relaxed">
                            Create a new Khoj account to join the community and start recovering lost items.
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

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Name */}
                                <div>
                                    <label className="block text-slate-300 font-semibold text-sm mb-2">Full Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.name ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700 bg-slate-800'} focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-white font-medium placeholder-slate-500`}
                                        placeholder="John Doe"
                                    />
                                    {errors.name && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.name}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-slate-300 font-semibold text-sm mb-2">Phone Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.phone ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700 bg-slate-800'} focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-white font-medium placeholder-slate-500`}
                                        placeholder="01712345678"
                                    />
                                    {errors.phone && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.phone}</p>}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-slate-300 font-semibold text-sm mb-2">Email Address <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700 bg-slate-800'} focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-white font-medium placeholder-slate-500`}
                                    placeholder="you@example.com"
                                />
                                {errors.email && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.email}</p>}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-slate-300 font-semibold text-sm mb-2">Address <span className="text-red-500">*</span></label>
                                <textarea
                                    name="address"
                                    rows={2}
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.address ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700 bg-slate-800'} focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-white font-medium resize-none placeholder-slate-500`}
                                    placeholder="Your address"
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
                                    className={`w-full px-3 py-2 rounded-lg border ${errors.profile_pic ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700 bg-slate-800'} text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-600/20 file:text-teal-300 hover:file:bg-teal-600/30 transition-all cursor-pointer`}
                                />
                                {errors.profile_pic && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.profile_pic}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Password */}
                                <div>
                                    <label className="block text-slate-300 font-semibold text-sm mb-2">Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${errors.password ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700 bg-slate-800'} focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-white font-medium placeholder-slate-500`}
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
                                    {errors.password && <p className="text-red-400 text-xs mt-1.5 font-medium leading-tight">{errors.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-slate-300 font-semibold text-sm mb-2">Confirm Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${errors.confirmPassword ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700 bg-slate-800'} focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-white font-medium placeholder-slate-500`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
                                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-700 text-white font-bold rounded-lg shadow-lg shadow-teal-900/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 focus:ring-offset-slate-900 mt-8 active:scale-[0.98]"
                            >
                                {isLoading ? 'REGISTERING...' : 'REGISTER'}
                            </button>
                        </form>

                        <div className="flex justify-center items-center mt-8 text-sm">
                            <p className="text-slate-400 font-medium">
                                Already have an account? <Link to="/login" className="text-teal-400 hover:text-teal-300 hover:underline font-bold transition-colors ml-1">Login here.</Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Theme Gradient Background */}
                <div className="w-full md:w-[45%] bg-gradient-to-bl from-teal-900 via-slate-900 to-slate-800 p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex rounded-l-none md:rounded-l-3xl shadow-[-10px_0_30px_rgb(0,0,0,0.1)] z-20 border-l border-slate-800">
                    {/* Decorative SVGs for the wave effect (Inverted X axis horizontally) */}
                    <svg className="absolute bottom-0 right-0 w-full text-slate-700/30 transform scale-x-[-1]" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path fill="currentColor" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                    <svg className="absolute bottom-0 right-0 w-full text-teal-500/20 transform scale-x-[-1]" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                    <svg className="absolute bottom-0 right-0 w-full text-slate-800/50 transform scale-x-[-1]" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path fill="currentColor" fillOpacity="1" d="M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,224C672,213,768,171,864,149.3C960,128,1056,128,1152,144C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>

                    <div className="relative z-10 mt-8 text-left">
                        <h1 className="text-5xl font-extrabold mb-6 tracking-tight">Join <br /> Khoj</h1>
                        <p className="text-lg text-white/90 leading-relaxed max-w-sm mr-auto font-medium">
                            Become a member to report lost items, claim found belongings, and help build a trustworthy network.
                        </p>
                    </div>

                    <div className="relative z-10 text-sm opacity-90 mt-auto pt-16 font-medium tracking-wide text-left">
                        Together, we make recoveries possible.
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Registration;
