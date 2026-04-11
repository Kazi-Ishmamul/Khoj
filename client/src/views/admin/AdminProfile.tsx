import React, { useState, useEffect, useRef } from 'react';

import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUser, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt,
    FaCamera, FaEdit, FaCheck, FaTimes
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

const mkAvatar = (name: string) =>
    `https://ui-avatars.com/api/?background=6366f1&color=fff&size=200&name=${encodeURIComponent(name || 'User')}`;

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
);

interface ProfileData {
    name: string; email: string; phone: string; address: string; role: string;
    profilePic: string;
}

const EMPTY: ProfileData = {
    name: '', email: '', phone: '', address: '', role: 'Admin',
    profilePic: mkAvatar('User'),
};

const iCls = 'w-full px-5 py-3.5 rounded-xl font-medium outline-none bg-slate-800/70 border border-slate-600 focus:border-sky-400 text-slate-100 transition-all';

const AdminProfile = () => {
    const [userData, setUserData] = useState<ProfileData>(EMPTY);
    const [editData, setEditData] = useState<ProfileData>(EMPTY);
    const [picPreview, setPicPreview] = useState<string | null>(null);
    const [picFile, setPicFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passSaving, setPassSaving] = useState(false);
    const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
    const [showPassword, setShowPassword] = useState({
        current_password: false,
        new_password: false,
        new_password_confirmation: false,
    });
    const fileRef = useRef<HTMLInputElement>(null);
    const editRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token');
                const { data } = await axios.get('http://localhost:8000/api/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const u = data.user;
                const isDefaultPic = !u.pic_url ||
                    u.pic_url === 'assets/profile_pictures/default_profile_pic.png';
                const pic = isDefaultPic
                    ? mkAvatar(u.name)
                    : (u.pic_url.startsWith('http') ? u.pic_url : `http://localhost:8000/${u.pic_url}`);

                const loaded: ProfileData = {
                    name: u.name || '', email: u.email || '', phone: u.phone || '',
                    address: u.address || '', role: u.role === 'admin' ? 'Admin' : 'User',
                    profilePic: pic
                };
                setUserData(loaded);
                setEditData(loaded);
            } catch {
                toast.error('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Scroll edit panel into view when it opens
    useEffect(() => {
        if (isEditing && editRef.current) {
            editRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isEditing]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const onPicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPicFile(file);
        setPicPreview(URL.createObjectURL(file));
    };

    const openEdit = () => {
        setEditData({ ...userData });
        setPicPreview(null);
        setPicFile(null);
        setIsEditing(true);
    };

    const closeEdit = () => {
        setPicPreview(null);
        setPicFile(null);
        setIsEditing(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let finalPicUrl = userData.profilePic;

            if (picFile) {
                const uploadData = new FormData();
                uploadData.append('file', picFile);
                uploadData.append('upload_preset', 'khoj-profile');

                try {
                    const cloudinaryRes = await axios.post('https://api.cloudinary.com/v1_1/dait0sacc/image/upload', uploadData);
                    finalPicUrl = cloudinaryRes.data.secure_url;
                } catch (err) {
                    toast.error('Failed to upload image to Cloudinary.');
                    setSaving(false);
                    return;
                }
            }

            const token = localStorage.getItem('token');
            const form = new FormData();
            Object.entries({
                name: editData.name, phone: editData.phone, address: editData.address
            }).forEach(([k, v]) => {
                if (v !== undefined && v !== null) {
                    form.append(k, v.toString());
                }
            });
            form.append('pic_url', finalPicUrl);

            await axios.post('http://localhost:8000/api/profile', form, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });

            setUserData(prev => ({ ...prev, ...editData, profilePic: finalPicUrl }));
            toast.success('Admin Profile updated!');
            closeEdit();
        } catch {
            toast.error('Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const openPasswordModal = () => {
        setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
        setShowPassword({ current_password: false, new_password: false, new_password_confirmation: false });
        setIsChangingPassword(true);
    };

    const closePasswordModal = () => {
        setIsChangingPassword(false);
        setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
        setShowPassword({ current_password: false, new_password: false, new_password_confirmation: false });
    };

    const handlePasswordSave = async () => {
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            toast.error("New passwords don't match");
            return;
        }
        if (passwordData.new_password.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }
        
        setPassSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/profile/password', passwordData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Admin Password updated successfully!');
            closePasswordModal();
        } catch (error: any) {
            if (error.response?.data?.errors?.current_password) {
                toast.error(error.response.data.errors.current_password[0]);
            } else if (error.response?.data?.errors?.new_password) {
                toast.error(error.response.data.errors.new_password[0]);
            } else {
                toast.error('Failed to update password');
            }
        } finally {
            setPassSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-sky-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 font-sans text-slate-100">
            <Toaster position="top-center" />

            {/* Cover Banner */}
            <div className="h-48 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden border-b border-slate-700/60">
                <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[-50%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            </div>

            {/* Page content: single column */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-16 pb-20 space-y-5 relative z-10">

                {/* ── EDIT SETTINGS PANEL ── */}
                <AnimatePresence>
                    {isEditing && (
                        <>
                            <motion.div
                                key="backdrop"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={closeEdit}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                            />

                            <motion.div
                                key="edit-panel"
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-none"
                            >
                                <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden max-h-[80vh] overflow-y-auto pointer-events-auto flex flex-col">
                                    <div className="flex items-center justify-between px-8 py-5 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0 z-10">
                                        <div>
                                            <h3 className="text-lg font-extrabold text-slate-100">Edit Admin Profile</h3>
                                            <p className="text-xs text-slate-400 mt-0.5">Basic info management</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={closeEdit}
                                                className="px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700 transition-all text-sm shadow-sm">
                                                <FaTimes size={12} /> Cancel
                                            </button>
                                            <button onClick={handleSave} disabled={saving}
                                                className="px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm disabled:opacity-60">
                                                <FaCheck size={12} /> {saving ? 'Saving…' : 'Save'}
                                            </button>
                                        </div>
                                    </div>

                                    <div ref={editRef} className="px-8 py-6 space-y-6">
                                        {/* Profile Picture Upload */}
                                        <div className="flex items-center gap-5">
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={picPreview || userData.profilePic}
                                                    alt="Preview"
                                                    className="w-20 h-20 rounded-full object-cover border-4 border-slate-700 shadow-md"
                                                />
                                                <button type="button" onClick={() => fileRef.current?.click()}
                                                    className="absolute -bottom-1 -right-1 bg-sky-600 text-white p-1.5 rounded-full shadow-md hover:bg-sky-700 transition-all">
                                                    <FaCamera size={11} />
                                                </button>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-200 text-sm">Profile Photo</p>
                                                <p className="text-xs text-slate-400 mt-0.5">Click the camera icon to upload a new photo</p>
                                            </div>
                                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPicChange} />
                                        </div>

                                        <hr className="border-slate-700" />

                                        {/* Basic Info */}
                                        <div>
                                            <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaUser /> Basic Info</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block ml-1">Full Name</label>
                                                    <input name="name" value={editData.name} onChange={onChange} className={iCls} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block ml-1">Phone</label>
                                                    <div className="relative">
                                                        <FaPhoneAlt className="absolute top-[18px] left-5 text-slate-400" />
                                                        <input name="phone" value={editData.phone} onChange={onChange} className={`${iCls} pl-12`} />
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block ml-1">Address</label>
                                                    <div className="relative">
                                                        <FaMapMarkerAlt className="absolute top-[18px] left-5 text-slate-400" />
                                                        <input name="address" value={editData.address} onChange={onChange} className={`${iCls} pl-12`} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ── CHANGE PASSWORD MODAL ── */}
                <AnimatePresence>
                    {isChangingPassword && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={closePasswordModal}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
                            >
                                <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
                                        <h3 className="text-lg font-extrabold text-slate-100">Change Password</h3>
                                        <button onClick={closePasswordModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                            <FaTimes />
                                        </button>
                                    </div>
                                    <div className="px-6 py-6 space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Current Password</label>
                                            <div className="relative">
                                                <input type={showPassword.current_password ? 'text' : 'password'} name="current_password" value={passwordData.current_password} onChange={handlePasswordChange} className={`${iCls} pr-12`} />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((prev) => ({ ...prev, current_password: !prev.current_password }))}
                                                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                                                    aria-label={showPassword.current_password ? 'Hide current password' : 'Show current password'}
                                                >
                                                    {showPassword.current_password ? <EyeOffIcon /> : <EyeIcon />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">New Password</label>
                                            <div className="relative">
                                                <input type={showPassword.new_password ? 'text' : 'password'} name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} className={`${iCls} pr-12`} />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((prev) => ({ ...prev, new_password: !prev.new_password }))}
                                                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                                                    aria-label={showPassword.new_password ? 'Hide new password' : 'Show new password'}
                                                >
                                                    {showPassword.new_password ? <EyeOffIcon /> : <EyeIcon />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Confirm New Password</label>
                                            <div className="relative">
                                                <input type={showPassword.new_password_confirmation ? 'text' : 'password'} name="new_password_confirmation" value={passwordData.new_password_confirmation} onChange={handlePasswordChange} className={`${iCls} pr-12`} />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((prev) => ({ ...prev, new_password_confirmation: !prev.new_password_confirmation }))}
                                                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                                                    aria-label={showPassword.new_password_confirmation ? 'Hide confirm password' : 'Show confirm password'}
                                                >
                                                    {showPassword.new_password_confirmation ? <EyeOffIcon /> : <EyeIcon />}
                                                </button>
                                            </div>
                                        </div>
                                        <button onClick={handlePasswordSave} disabled={passSaving}
                                            className="w-full mt-2 px-5 py-3 rounded-xl font-bold bg-sky-600 text-white shadow hover:bg-sky-700 transition-all disabled:opacity-60">
                                            {passSaving ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ── PROFILE CARD ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="bg-slate-900/70 rounded-3xl shadow-xl border border-slate-700/60 overflow-hidden backdrop-blur-sm"
                >
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 px-8 pt-8 pb-6 border-b border-slate-700">
                        <img
                            src={userData.profilePic}
                            alt={userData.name}
                            onError={e => { (e.target as HTMLImageElement).src = mkAvatar(userData.name); }}
                            className="w-28 h-28 rounded-full object-cover border-[5px] border-slate-800 shadow-xl flex-shrink-0"
                        />
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-2xl font-extrabold text-slate-100">{userData.name}</h2>
                            <span className="inline-block mt-1 px-4 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold tracking-widest uppercase border border-purple-400/30">
                                {userData.role}
                            </span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            {!isEditing && (
                                <button onClick={openEdit}
                                    className="flex-shrink-0 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-sky-600 text-white hover:bg-sky-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                    <FaEdit /> Edit Profile
                                </button>
                            )}
                            <button onClick={openPasswordModal}
                                className="flex-shrink-0 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all">
                                🔐 Change
                            </button>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Contact Info ONLY */}
                        <div>
                            <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FaUser /> Admin Contact Info</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { icon: <FaEnvelope className="text-sky-400" />, label: 'Email', value: userData.email },
                                    { icon: <FaPhoneAlt className="text-sky-400" />, label: 'Phone', value: userData.phone },
                                    { icon: <FaMapMarkerAlt className="text-sky-400" />, label: 'Address', value: userData.address, wide: true },
                                ].map(f => (
                                    <div key={f.label} className={`${f.wide ? 'sm:col-span-2' : ''} flex items-start gap-3 bg-slate-800/70 rounded-2xl px-4 py-3.5 border border-slate-700`}>
                                        <span className="mt-0.5 text-lg">{f.icon}</span>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</p>
                                            <p className="font-semibold text-slate-200 mt-0.5">{f.value || '—'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminProfile;
