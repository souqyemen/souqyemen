'use client'; // ضروري جداً لكي يعمل React في Next.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { firebase, auth, db, storage, googleProvider } from '../lib/firebase'; // استدعاء الفايربيس

// --- ثوابت وإعدادات ---
const RATES = { USD_TO_YER: 1600, SAR_TO_YER: 420 };
const YEMEN_CENTER = [15.5527, 48.5164]; 
const DEFAULT_ZOOM = 6;
const ADMIN_EMAIL = "mansouralbarout@gmail.com";
const ADMIN_PHONE = "770991885";

const ADMIN_EMAILS = [ADMIN_EMAIL].map(e => String(e || '').toLowerCase());
const isAdminEmail = (email) => !!email && ADMIN_EMAILS.includes(String(email).toLowerCase());

// --- Helper Functions ---
const formatNumber = (num) => Math.round(num).toLocaleString('en-US');

// --- Icons Component (Inline for simplicity) ---
const Icons = {
    Map: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    MapPin: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    Grid: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
    Plus: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
    User: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Search: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
    X: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    Google: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...p}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
    Phone: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
    Whatsapp: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366" {...p}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.826 9.826 0 0 1 2.9 6.994c-.004 5.45-4.437 9.88-9.885 9.88m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.333.151 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.333 11.89-11.893 0-3.18-1.24-6.162-3.495-8.411"/></svg>,
    Car: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 16H9m10 0h3v-3.15M5 16H2v-3.15M7 10h10M5 16v4h3v-4M19 16v4h-3v-4M7.5 7h9l1.5 5h-12z"/></svg>,
    Home: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    Smartphone: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    Zap: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    Camera: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    Send: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    Message: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    Bell: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    Sun: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    Moon: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
    Trash: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
    Edit: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    Shield: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Hammer: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25V2.75A2.75 2.75 0 0 0 16 0h-2.25a2.12 2.12 0 0 0-1.5.62L2.62 10.25"/><path d="M7 5.5 18.5 17"/></svg>,
    Eye: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>,
    Star: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    StarFilled: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

// --- DATA CONSTANTS ---
const CATEGORIES = [
    { id: 'all', name: 'الكل', icon: Icons.Grid, color: '#64748b' },
    { id: 'cars', name: 'سيارات', icon: Icons.Car, color: '#3b82f6' },
    { id: 'real_estate', name: 'عقارات', icon: Icons.Home, color: '#10b981' },
    { id: 'mobiles', name: 'جوالات', icon: Icons.Smartphone, color: '#8b5cf6' },
    { id: 'solar', name: 'طاقة', icon: Icons.Zap, color: '#eab308' },
];
const CITIES = ["صنعاء", "عدن", "تعز", "الحديدة", "إب", "المكلا", "حضرموت", "ذمار", "مأرب", "عمران"];

// --- COMPONENTS ---

const Logo = () => (
    <div className="flex items-center gap-2">
        <div className="bg-white p-1 rounded-lg shadow-sm dark:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24" className="rounded overflow-hidden">
                <rect width="100" height="100" fill="#1e40af"/>
                <path d="M25 35 h50 v50 a5 5 0 0 1 -5 5 h-40 a5 5 0 0 1 -5 -5 z" fill="#fff"/>
                <path d="M35 35 v-10 a15 15 0 0 1 30 0 v10" fill="none" stroke="#eab308" strokeWidth="6"/>
                <text x="50" y="80" textAnchor="middle" fill="#1e40af" fontSize="24" fontWeight="900">ي</text>
            </svg>
        </div>
        <h1 className="text-lg font-black text-white">سوق اليمن</h1>
    </div>
);

// Map Component (uses window.L from layout)
const MainMap = ({ items }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markers = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.L || !mapRef.current) return;
        
        if (!mapInstance.current) {
            mapInstance.current = window.L.map(mapRef.current).setView(YEMEN_CENTER, 6);
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'سوق اليمن'
            }).addTo(mapInstance.current);
            markers.current = window.L.markerClusterGroup();
            mapInstance.current.addLayer(markers.current);
        }

        const map = mapInstance.current;
        if (markers.current) {
            markers.current.clearLayers();
            if (items && items.length > 0) {
                items.forEach(item => {
                    if (item.coords && Array.isArray(item.coords)) {
                        const m = window.L.marker(item.coords);
                        m.bindPopup(`<b>${item.title}</b><br>${item.price} ${item.currency}`);
                        markers.current.addLayer(m);
                    }
                });
            }
        }
        setTimeout(() => map.invalidateSize(), 200);
    }, [items]);

    return <div ref={mapRef} className="w-full h-full min-h-[500px]" />;
};

// --- AUTH MODAL ---
const AuthModal = ({ isOpen, onClose, onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await auth.signInWithEmailAndPassword(email, password);
            } else {
                await auth.createUserWithEmailAndPassword(email, password);
            }
            onLogin(); onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        try {
            await auth.signInWithPopup(googleProvider);
            onLogin(); onClose();
        } catch (err) { setError(err.message); }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content dark:bg-gray-800 dark:text-gray-200" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">{isLogin ? 'دخول' : 'تسجيل'}</h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <button onClick={handleGoogle} className="w-full p-2 border rounded mb-4 flex justify-center items-center gap-2">
                    <Icons.Google size={20} /> متابعة بجوجل
                </button>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="البريد" className="w-full p-2 border rounded dark:bg-gray-700" />
                    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full p-2 border rounded dark:bg-gray-700" />
                    <button disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded">{loading ? '...' : (isLogin ? 'دخول' : 'تسجيل')}</button>
                </form>
                <button onClick={()=>setIsLogin(!isLogin)} className="text-blue-500 mt-2 text-sm w-full text-center">
                    {isLogin ? 'إنشاء حساب جديد' : 'لديك حساب بالفعل؟'}
                </button>
            </div>
        </div>
    );
};

// --- LISTING CARD ---
const ListingCard = ({ item }) => (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="h-48 bg-gray-200 relative">
             <img src={item.image || 'https://via.placeholder.com/400'} alt={item.title} className="w-full h-full object-cover" />
             {item.isAuction && <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">مزاد</span>}
        </div>
        <div className="p-3">
            <h3 className="font-bold truncate dark:text-gray-200">{item.title}</h3>
            <p className="text-blue-600 font-bold">{formatNumber(item.price)} {item.currency}</p>
            <p className="text-xs text-gray-500">{item.city} • {item.views || 0} مشاهدة</p>
        </div>
    </div>
);

// --- MAIN PAGE COMPONENT ---
export default function HomePage() {
    const [user, setUser] = useState(null);
    const [listings, setListings] = useState([]);
    const [view, setView] = useState('home');
    const [modals, setModals] = useState({ auth: false, add: false });
    const [activeCat, setActiveCat] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged(setUser);
        const unsubDb = db.collection('listings').orderBy('createdAt', 'desc').onSnapshot(snap => {
            const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setListings(data);
        });
        return () => { unsubAuth(); unsubDb(); };
    }, []);

    const filteredListings = listings.filter(l => 
        (activeCat === 'all' || l.category === activeCat) &&
        (l.title.toLowerCase().includes(search.toLowerCase()))
    );

    const toggleDarkMode = () => {
        document.body.classList.toggle('dark-mode');
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="header-compact text-white shadow-lg">
                <div className="container mx-auto px-4 pb-4">
                    <div className="flex justify-between items-center mb-4">
                        <div onClick={()=>setView('home')} className="cursor-pointer"><Logo /></div>
                        <div className="flex gap-2">
                             <button onClick={toggleDarkMode} className="p-2 bg-white/20 rounded-full"><Icons.Sun size={20}/></button>
                             <button onClick={()=>user ? setView('profile') : setModals({...modals, auth:true})} className="p-2 bg-white/20 rounded-full">
                                {user ? <Icons.User size={20}/> : "دخول"}
                             </button>
                        </div>
                    </div>
                    <input 
                        value={search} onChange={e=>setSearch(e.target.value)}
                        placeholder="ابحث..." 
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-100 outline-none focus:bg-white focus:text-gray-900 transition"
                    />
                </div>
            </header>

            {/* Categories */}
            {view === 'home' && (
                <div className="category-scroll-container sticky top-[100px] z-10">
                    {CATEGORIES.map(c => (
                        <div key={c.id} onClick={()=>setActiveCat(c.id)} className={`flex flex-col items-center min-w-[60px] cursor-pointer ${activeCat===c.id ? 'text-blue-600' : 'text-gray-500'}`}>
                            <div className={`p-3 rounded-xl mb-1 ${activeCat===c.id ? 'bg-blue-100' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                <c.icon size={24} color={activeCat===c.id ? c.color : 'currentColor'}/>
                            </div>
                            <span className="text-[10px] font-bold">{c.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Content */}
            <main className="container mx-auto px-4 py-4">
                {view === 'map' ? (
                     <div className="h-[70vh] rounded-xl overflow-hidden border dark:border-gray-700 relative">
                        <MainMap items={filteredListings} />
                        <button onClick={()=>setView('home')} className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-full shadow"><Icons.X /></button>
                     </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredListings.map(l => (
                            <ListingCard key={l.id} item={l} />
                        ))}
                    </div>
                )}
            </main>
            
            {/* Floating Action Button */}
            <button 
                onClick={()=>setView(view === 'map' ? 'home' : 'map')}
                className="fixed bottom-6 left-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50 flex items-center gap-2"
            >
                {view === 'map' ? <><Icons.Grid/> قائمة</> : <><Icons.Map/> خريطة</>}
            </button>

            <AuthModal isOpen={modals.auth} onClose={()=>setModals({...modals, auth:false})} onLogin={()=>setModals({...modals, auth:false})} />
        </div>
    );
}
