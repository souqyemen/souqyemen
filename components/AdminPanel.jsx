"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebaseClient';
import { 
    collection, getDocs, doc, updateDoc, 
    addDoc, serverTimestamp 
} from 'firebase/firestore';
import { Icons } from './Icons';

// بيانات المدير
const ADMIN_EMAIL = "mansouralbarout@gmail.com";
const ADMIN_PHONE = "770991885";
const ADMIN_EMAILS = [ADMIN_EMAIL].map(e => String(e || '').toLowerCase());
const isAdminEmail = (email) => !!email && ADMIN_EMAILS.includes(String(email).toLowerCase());

const formatNumber = (num) => Math.round(num).toLocaleString('en-US');

export default function AdminPanel({ user, listings, onDeleteListing, onEditListing, onToggleListingStatus }) {
    const [showPanel, setShowPanel] = useState(false);
    const [activeTab, setActiveTab] = useState('listings');
    const [users, setUsers] = useState([]);
    const [reportedItems, setReportedItems] = useState([]);
    const [viewStats, setViewStats] = useState({});
    
    const isAdmin = !!(user && isAdminEmail(user.email));

    useEffect(() => {
        if (isAdmin && showPanel) {
            fetchUsers();
            fetchReports();
        }
    }, [isAdmin, showPanel]);

    const fetchUsers = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'users'));
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchReports = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'reports'));
            setReportedItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    };

    const handleBanUser = async (userId) => {
        if (window.confirm('هل أنت متأكد من حظر هذا المستخدم؟')) {
            try {
                await updateDoc(doc(db, 'users', userId), { banned: true });
                alert('تم حظر المستخدم بنجاح');
                fetchUsers(); // Refresh list
            } catch (error) {
                alert('حدث خطأ أثناء الحظر: ' + error.message);
            }
        }
    };

    const handleUnbanUser = async (userId) => {
        try {
            await updateDoc(doc(db, 'users', userId), { banned: false });
            alert('تم إلغاء حظر المستخدم بنجاح');
            fetchUsers(); // Refresh list
        } catch (error) {
            alert('حدث خطأ أثناء إلغاء الحظر: ' + error.message);
        }
    };

    const handleResolveReport = async (reportId) => {
        try {
            await updateDoc(doc(db, 'reports', reportId), { resolved: true });
            alert('تم التعامل مع البلاغ');
            fetchReports(); // Refresh list
        } catch (error) {
            alert('حدث خطأ أثناء معالجة البلاغ: ' + error.message);
        }
    };

    const testViewCounter = async (listingId) => {
        if (!listingId) return;
        
        try {
            // جلب إحصائيات المشاهدات الحقيقية من الـ Sub-collection
            const viewsSnapshot = await getDocs(collection(db, 'listings', listingId, 'views'));
            
            const uniqueVisitors = new Set();
            viewsSnapshot.docs.forEach(doc => {
                uniqueVisitors.add(doc.data().visitorId);
            });
            
            setViewStats({
                totalViews: viewsSnapshot.size,
                uniqueVisitors: uniqueVisitors.size,
                lastUpdated: new Date().toLocaleString()
            });
            
            alert(`إحصائيات الإعلان:
إجمالي المشاهدات المسجلة: ${viewsSnapshot.size}
عدد الزوار الفريدين: ${uniqueVisitors.size}`);
        } catch (error) {
            console.error('Test failed:', error);
            alert('فشل جلب الإحصائيات: ' + error.message);
        }
    };

    if (!isAdmin) return null;

    return (
        <>
            <button 
                onClick={() => setShowPanel(!showPanel)}
                className="fixed bottom-20 left-4 bg-red-600 text-white p-3 rounded-full shadow-lg z-[1500] hover:bg-red-700 transition-transform active:scale-90"
                aria-label="لوحة التحكم الإدارية"
                title="لوحة التحكم"
            >
                <Icons.Shield size={24} />
            </button>
            
            {showPanel && (
                <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <div className="bg-white rounded-xl w-full max-w-4xl h-[85vh] flex flex-col dark:bg-gray-800 animate-fadeIn shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                            <h2 className="text-xl font-bold dark:text-gray-200 flex items-center gap-2">
                                <Icons.Shield className="text-red-600" /> لوحة تحكم المدير
                            </h2>
                            <button onClick={() => setShowPanel(false)} aria-label="إغلاق" className="p-2 hover:bg-gray-200 rounded-full dark:hover:bg-gray-600 dark:text-gray-300">
                                <Icons.X size={24}/>
                            </button>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex border-b bg-white dark:bg-gray-800 dark:border-gray-700">
                            <button 
                                onClick={() => setActiveTab('listings')}
                                className={`flex-1 py-3 text-center font-bold text-sm transition-colors ${activeTab === 'listings' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                            >
                                الإعلانات ({listings.length})
                            </button>
                            <button 
                                onClick={() => setActiveTab('users')}
                                className={`flex-1 py-3 text-center font-bold text-sm transition-colors ${activeTab === 'users' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                            >
                                المستخدمون ({users.length})
                            </button>
                            <button 
                                onClick={() => setActiveTab('reports')}
                                className={`flex-1 py-3 text-center font-bold text-sm transition-colors ${activeTab === 'reports' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                            >
                                البلاغات ({reportedItems.length})
                            </button>
                            <button 
                                onClick={() => setActiveTab('views')}
                                className={`flex-1 py-3 text-center font-bold text-sm transition-colors ${activeTab === 'views' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                            >
                                المشاهدات
                            </button>
                        </div>
                        
                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900 custom-scrollbar">
                            {activeTab === 'listings' && (
                                <div className="space-y-3">
                                    <h3 className="font-bold mb-3 dark:text-gray-300 px-1">إدارة الإعلانات</h3>
                                    {listings.map(listing => (
                                        <div key={listing.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg shadow-sm border dark:bg-gray-800 dark:border-gray-700 gap-3">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{listing.title}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {listing.category} • {listing.city} • {formatNumber(listing.price)} {listing.currency}
                                                </p>
                                                <div className="text-xs text-gray-400 mt-1 flex gap-3">
                                                    <span className="flex items-center gap-1"><Icons.Eye size={12} /> {listing.views || 0}</span>
                                                    <span className="flex items-center gap-1"><Icons.Star size={12} /> {listing.likes || 0}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                                <button 
                                                    onClick={() => testViewCounter(listing.id)}
                                                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400"
                                                >
                                                    فحص المشاهدات
                                                </button>
                                                <button 
                                                    onClick={() => onEditListing && onEditListing(listing)}
                                                    className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                >
                                                    تعديل
                                                </button>
                                                <button 
                                                    onClick={() => onDeleteListing && onDeleteListing(listing.id)}
                                                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                                                >
                                                    حذف
                                                </button>
                                                <button 
                                                    onClick={() => onToggleListingStatus && onToggleListingStatus(listing.id, !listing.isActive)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${listing.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'}`}
                                                >
                                                    {listing.isActive ? 'نشط' : 'محظور'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {activeTab === 'users' && (
                                <div className="space-y-3">
                                    <h3 className="font-bold mb-3 dark:text-gray-300 px-1">إدارة المستخدمين</h3>
                                    {users.length === 0 ? <p className="text-gray-500 text-center py-4">جاري التحميل...</p> : 
                                    users.map(u => (
                                        <div key={u.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border dark:bg-gray-800 dark:border-gray-700">
                                            <div>
                                                <h4 className="font-bold dark:text-gray-200">{u.displayName || 'مستخدم'}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{u.email}</p>
                                                <p className="text-[10px] mt-1">
                                                    {u.banned ? <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">محظور</span> : <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">نشط</span>}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {u.banned ? (
                                                    <button 
                                                        onClick={() => handleUnbanUser(u.id)}
                                                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                                                    >
                                                        إلغاء الحظر
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleBanUser(u.id)}
                                                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                                                    >
                                                        حظر
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {activeTab === 'reports' && (
                                <div className="space-y-3">
                                    <h3 className="font-bold mb-3 dark:text-gray-300 px-1">البلاغات</h3>
                                    {reportedItems.length === 0 ? <p className="text-gray-500 text-center py-4">لا توجد بلاغات</p> : 
                                    reportedItems.map(report => (
                                        <div key={report.id} className="p-4 bg-white rounded-lg shadow-sm border dark:bg-gray-800 dark:border-gray-700">
                                            <div className="flex justify-between mb-2">
                                                <h4 className="font-bold text-red-600 dark:text-red-400">{report.reason}</h4>
                                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${report.resolved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {report.resolved ? 'تم الحل' : 'قيد المراجعة'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 bg-gray-50 p-2 rounded dark:bg-gray-700/50">{report.description}</p>
                                            <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-2 dark:border-gray-700">
                                                <span>بواسطة: {report.reporterName || 'مجهول'}</span>
                                                <span>{report.timestamp?.toDate ? new Date(report.timestamp.toDate()).toLocaleDateString() : ''}</span>
                                            </div>
                                            {!report.resolved && (
                                                <button 
                                                    onClick={() => handleResolveReport(report.id)}
                                                    className="mt-3 w-full py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                                                >
                                                    وضع علامة "تم الحل"
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {activeTab === 'views' && (
                                <div className="space-y-3">
                                    <h3 className="font-bold mb-3 dark:text-gray-300 px-1">إحصائيات سريعة</h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-md">
                                            <div className="text-2xl font-black">{viewStats.totalViews || '-'}</div>
                                            <div className="text-xs opacity-80">آخر إعلان تم فحصه (مشاهدات)</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-md">
                                            <div className="text-2xl font-black">{viewStats.uniqueVisitors || '-'}</div>
                                            <div className="text-xs opacity-80">زوار فريدون</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-xl shadow-md">
                                            <div className="text-2xl font-black">{listings.reduce((acc, curr) => acc + (curr.views || 0), 0)}</div>
                                            <div className="text-xs opacity-80">إجمالي المشاهدات (لكل الموقع)</div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white p-4 rounded-xl border dark:bg-gray-800 dark:border-gray-700">
                                        <h4 className="font-bold mb-2 dark:text-gray-300 text-sm">فحص الإعلانات</h4>
                                        <p className="text-xs text-gray-500 mb-3 dark:text-gray-400">اختر إعلاناً لفحص إحصائياته الدقيقة:</p>
                                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                                            {listings.slice(0, 10).map(listing => (
                                                <button 
                                                    key={listing.id}
                                                    onClick={() => testViewCounter(listing.id)}
                                                    className="p-2 text-right bg-gray-50 text-gray-700 rounded-lg text-xs hover:bg-gray-100 truncate dark:bg-gray-700 dark:text-gray-300"
                                                >
                                                    {listing.title}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50 text-center text-xs text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                            <p>للتواصل الطارئ: <span className="font-bold font-mono">{ADMIN_PHONE}</span></p>
                            <p className="mt-1 font-mono">{ADMIN_EMAIL}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
