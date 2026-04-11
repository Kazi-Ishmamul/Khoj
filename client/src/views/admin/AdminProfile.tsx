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

interface ProfileData {
    name: string; email: string; phone: string; address: string; role: string;
    profilePic: string;
}

const EMPTY: ProfileData = {
    name: '', email: '', phone: '', address: '', role: 'Admin',
    profilePic: mkAvatar('User'),
};

const iCls = 'w-full px-5 py-3.5 rounded-xl font-medium outline-none bg-slate-50 border-2 border-indigo-100 focus:border-indigo-400 focus:bg-white text-slate-800 transition-all';

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
        setIsChangingPassword(true);
    };

    const closePasswordModal = () => {
        setIsChangingPassword(false);
        setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800">
            <Toaster position="top-center" />

            {/* Cover Banner */}
            <div className="h-48 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
                <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-50%] right-[-10%] w-96 h-96 bg-black/10 rounded-full blur-3xl" />
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
                                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[80vh] overflow-y-auto pointer-events-auto flex flex-col">
                                    <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 sticky top-0 z-10">
                                        <div>
                                            <h3 className="text-lg font-extrabold text-slate-800">Edit Admin Profile</h3>
                                            <p className="text-xs text-slate-400 mt-0.5">Basic info management</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={closeEdit}
                                                className="px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm shadow-sm">
                                                <FaTimes size={12} /> Cancel
                                            </button>
                                            <button onClick={handleSave} disabled={saving}
                                                className="px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm disabled:opacity-60">
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
                                                    className="w-20 h-20 rounded-full object-cover border-4 border-indigo-100 shadow-md"
                                                />
                                                <button type="button" onClick={() => fileRef.current?.click()}
                                                    className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-full shadow-md hover:bg-indigo-700 transition-all">
                                                    <FaCamera size={11} />
                                                </button>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-700 text-sm">Profile Photo</p>
                                                <p className="text-xs text-slate-400 mt-0.5">Click the camera icon to upload a new photo</p>
                                            </div>
                                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPicChange} />
                                        </div>

                                        <hr className="border-slate-100" />

                                        {/* Basic Info */}
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2"><FaUser /> Basic Info</p>
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
                                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50">
                                        <h3 className="text-lg font-extrabold text-slate-800">Change Password</h3>
                                        <button onClick={closePasswordModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                            <FaTimes />
                                        </button>
                                    </div>
                                    <div className="px-6 py-6 space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Current Password</label>
                                            <input type="password" name="current_password" value={passwordData.current_password} onChange={handlePasswordChange} className={iCls} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">New Password</label>
                                            <input type="password" name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} className={iCls} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Confirm New Password</label>
                                            <input type="password" name="new_password_confirmation" value={passwordData.new_password_confirmation} onChange={handlePasswordChange} className={iCls} />
                                        </div>
                                        <button onClick={handlePasswordSave} disabled={passSaving}
                                            className="w-full mt-2 px-5 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow hover:bg-indigo-700 transition-all disabled:opacity-60">
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
                    className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.07)] border border-slate-100 overflow-hidden"
                >
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 px-8 pt-8 pb-6 border-b border-slate-100">
                        <img
                            src={userData.profilePic}
                            alt={userData.name}
                            onError={e => { (e.target as HTMLImageElement).src = mkAvatar(userData.name); }}
                            className="w-28 h-28 rounded-full object-cover border-[5px] border-white shadow-xl flex-shrink-0"
                        />
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-2xl font-extrabold text-slate-800">{userData.name}</h2>
                            <span className="inline-block mt-1 px-4 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold tracking-widest uppercase border border-purple-100">
                                {userData.role}
                            </span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            {!isEditing && (
                                <button onClick={openEdit}
                                    className="flex-shrink-0 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                    <FaEdit /> Edit Profile
                                </button>
                            )}
                            <button onClick={openPasswordModal}
                                className="flex-shrink-0 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all">
                                🔐 Change
                            </button>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Contact Info ONLY */}
                        <div>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2"><FaUser /> Admin Contact Info</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { icon: <FaEnvelope className="text-indigo-400" />, label: 'Email', value: userData.email },
                                    { icon: <FaPhoneAlt className="text-indigo-400" />, label: 'Phone', value: userData.phone },
                                    { icon: <FaMapMarkerAlt className="text-indigo-400" />, label: 'Address', value: userData.address, wide: true },
                                ].map(f => (
                                    <div key={f.label} className={`${f.wide ? 'sm:col-span-2' : ''} flex items-start gap-3 bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-100`}>
                                        <span className="mt-0.5 text-lg">{f.icon}</span>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</p>
                                            <p className="font-semibold text-slate-700 mt-0.5">{f.value || '—'}</p>
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
