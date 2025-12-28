"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { auth, db, storage, googleProvider } from '../lib/firebaseClient';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query, where, orderBy, limit, 
  serverTimestamp, increment, getDoc, getDocs, setDoc, writeBatch 
} from 'firebase/firestore';
import { 
  signInWithPopup, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile 
} from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Icons } from './Icons';

// --- الثوابت والإعدادات ---
const RATES = { USD_TO_YER: 1600, SAR_TO_YER: 420 };
const YEMEN_CENTER = [15.5527, 48.5164]; 
const DEFAULT_ZOOM = 6;
const ADMIN_EMAIL = "mansouralbarout@gmail.com";
const ADMIN_PHONE = "770991885";

const ADMIN_EMAILS = [ADMIN_EMAIL].map(e => String(e || '').toLowerCase());
const isAdminEmail = (email) => !!email && ADMIN_EMAILS.includes(String(email).toLowerCase());

const CITIES = ["صنعاء", "عدن", "تعز", "الحديدة", "إب", "المكلا", "حضرموت", "ذمار", "مأرب", "عمران", "الضالع", "حجة", "البيضاء", "المهرة", "سقطرى"];

const CATEGORIES = [
    { id: 'all', name: 'الكل', icon: Icons.Grid, color: '#64748b' },
    { id: 'cars', name: 'سيارات', icon: Icons.Car, color: '#3b82f6' },
    { id: 'real_estate', name: 'عقارات', icon: Icons.Home, color: '#10b981' },
    { id: 'mobiles', name: 'جوالات', icon: Icons.Smartphone, color: '#8b5cf6' },
    { id: 'solar', name: 'طاقة', icon: Icons.Zap, color: '#eab308' },
    { id: 'electronics', name: 'إلكترونيات', icon: Icons.Monitor, color: '#6366f1' },
    { id: 'furniture', name: 'أثاث', icon: Icons.Armchair, color: '#a855f7' },
    { id: 'fashion', name: 'ملابس', icon: Icons.Shirt, color: '#ec4899' },
    { id: 'motorcycles', name: 'دراجات نارية', icon: Icons.Motorcycle, color: '#f97316' },
    { id: 'internet', name: 'نت وشبكات', icon: Icons.Wifi, color: '#06b6d4' },
    { id: 'jobs', name: 'وظائف', icon: Icons.Briefcase, color: '#475569' },
    { id: 'maintenance', name: 'صيانة', icon: Icons.Wrench, color: '#f43f5e' },
    { id: 'books', name: 'كتب', icon: Icons.BookOpen, color: '#14b8a6' },
    { id: 'livestock', name: 'مواشي', icon: Icons.PawPrint, color: '#d97706' },
    { id: 'yemeni_products', name: 'منتجات يمنية', icon: Icons.ShoppingBag, color: '#16a34a' },
    { id: 'others', name: 'أخرى', icon: Icons.Grid, color: '#94a3b8' },
];

// --- دوال مساعدة ---
const formatNumber = (num) => Math.round(num).toLocaleString('en-US');

const getVisitorId = () => {
    if (typeof window === 'undefined') return 'server_visitor';
    try {
        let id = localStorage.getItem('sy_visitor_id');
        if (!id) {
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substring(2, 15);
            id = `visitor_${timestamp}_${random}`;
            localStorage.setItem('sy_visitor_id', id);
        }
        return id;
    } catch (e) {
        return 'temp_visitor_' + Date.now().toString(36);
    }
};

const reverseGeocodeOSM = async (lat, lon) => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
        const res = await fetch(url, { headers: { "Accept": "application/json" } });
        if (!res.ok) throw new Error("reverse geocode failed");
        const data = await res.json();
        const addr = data?.address || {};
        const city = addr.city || addr.town || addr.village || addr.county || addr.state || "";
        const label = data?.display_name ? String(data.display_name).split(",").slice(0, 3).join("، ").trim() : "";
        return { city, label };
    } catch (e) {
        console.warn("Reverse geocoding failed:", e);
        return { city: "", label: "" };
    }
};

const logListingView = async (listingId, authUser) => {
    if (!listingId) return;
    const visitorId = getVisitorId();
    try {
        // زيادة العداد الرئيسي
        await updateDoc(doc(db, 'listings', listingId), {
            views: increment(1)
        });
        
        // تسجيل تفاصيل المشاهدة
        await addDoc(collection(db, 'listings', listingId, 'views'), {
            visitorId,
            uid: authUser ? authUser.uid : null,
            email: authUser ? (authUser.email || null) : null,
            createdAt: serverTimestamp(),
            timestamp: Date.now()
        });
    } catch (e) {
        console.warn('listing view log failed:', e);
    }
};

// --- المكونات الفرعية ---

const LocationPicker = ({ onLocationSelect }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        // التأكد من أن الكود يعمل في المتصفح وأن Leaflet موجود
        if (typeof window !== 'undefined' && window.L && mapRef.current && !mapInstance.current) {
            try {
                mapInstance.current = window.L.map(mapRef.current).setView(YEMEN_CENTER, DEFAULT_ZOOM);
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; سوق اليمن'
                }).addTo(mapInstance.current);

                mapInstance.current.on('click', async (e) => {
                    const { lat, lng } = e.latlng;
                    
                    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
                    else {
                        markerRef.current = window.L.marker([lat, lng], { draggable: true }).addTo(mapInstance.current);
                        markerRef.current.on('dragend', async (ev) => {
                            const p = ev.target.getLatLng();
                            // Logic repeats for drag
                        });
                    }

                    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
                    const r = await reverseGeocodeOSM(lat, lng);
                    onLocationSelect({
                        coords: [lat, lng],
                        city: r.city || "",
                        locationText: r.label || "",
                        locationUrl: osmUrl
                    });
                });
            } catch (err) {
                console.error("Map init error:", err);
            }
        }
        
        // Cleanup fix for React StrictMode
        return () => {
           if (mapInstance.current) {
               mapInstance.current.remove();
               mapInstance.current = null;
           }
        };
    }, [onLocationSelect]);

    return <div ref={mapRef} className="w-full h-64 rounded-xl border border-gray-300 z-10 dark:border-gray-600" aria-label="خريطة تحديد الموقع" />;
};

const MultiImageUploader = ({ maxFiles = 5, onImagesUpload }) => {
    const [items, setItems] = useState([]);
    const [busy, setBusy] = useState(false);

    const uploadOne = (file, idx) => new Promise((resolve, reject) => {
        try {
            const timestamp = Date.now();
            const safeName = (file.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');
            const fileName = `listings/img_${timestamp}_${idx}_${safeName}`;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setItems(prev => {
                        const next = [...prev];
                        if (next[idx]) next[idx] = { ...next[idx], progress, uploading: true };
                        return next;
                    });
                },
                (error) => reject(error),
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        } catch (e) {
            reject(e);
        }
    });

    const handleSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const remaining = Math.max(0, maxFiles - items.length);
        const picked = files.slice(0, remaining);

        const previews = picked.map(f => ({ preview: URL.createObjectURL(f), url: '', uploading: true, progress: 0, file: f }));
        const baseIdx = items.length;
        const nextItems = [...items, ...previews].slice(0, maxFiles);
        setItems(nextItems);
        setBusy(true);

        try {
            for (let i = 0; i < previews.length; i++) {
                const absoluteIdx = baseIdx + i;
                const file = previews[i].file;
                try {
                    const url = await uploadOne(file, absoluteIdx);
                    setItems(prev => {
                        const next = [...prev];
                        if (next[absoluteIdx]) next[absoluteIdx] = { ...next[absoluteIdx], url, uploading: false, progress: 100 };
                        return next;
                    });
                } catch (error) {
                    console.error('Upload failed:', error);
                }
            }
        } finally {
            setBusy(false);
        }
    };

    // مزامنة الروابط النهائية عند اكتمال الرفع
    useEffect(() => {
        const urls = items.map(x => x.url).filter(Boolean);
        if (urls.length > 0) onImagesUpload(urls);
    }, [items, onImagesUpload]);

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center dark:border-gray-600">
             <div className="grid grid-cols-2 gap-3 mb-4">
                {items.map((it, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden border dark:border-gray-700 h-28">
                        <img src={it.preview} alt={`preview ${idx}`} className="w-full h-full object-cover" />
                        {it.uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                                {it.progress}%
                            </div>
                        )}
                        <button 
                            type="button"
                            onClick={() => setItems(items.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                            <Icons.X size={12} />
                        </button>
                    </div>
                ))}
            </div>
            {items.length < maxFiles && (
                <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-blue-600">
                    <Icons.Camera size={32} />
                    <span>اضغط لاختيار الصور</span>
                    <input type="file" accept="image/*" multiple onChange={handleSelect} className="hidden" />
                </label>
            )}
        </div>
    );
};

const ListingCard = ({ item, currentUser, onViewDetails, isFavorited, onToggleFavorite }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (item.isAuction && item.auctionEnd) {
            const updateTimer = () => {
                const now = new Date();
                const end = new Date(item.auctionEnd);
                const diff = end - now;
                if (diff <= 0) {
                    setTimeLeft('انتهى المزاد');
                    return;
                }
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                setTimeLeft(`${days}ي ${hours}س`);
            };
            updateTimer();
            const interval = setInterval(updateTimer, 60000);
            return () => clearInterval(interval);
        }
    }, [item.isAuction, item.auctionEnd]);

    return (
        <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group relative dark:bg-gray-800 dark:border-gray-700">
            <div className="h-48 relative overflow-hidden bg-gray-200 cursor-pointer" onClick={() => onViewDetails(item)}>
                <img 
                    src={item.image || (item.images && item.images[0]) || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }} 
                    className={`absolute top-2 left-2 p-2 rounded-full backdrop-blur-sm ${isFavorited ? 'bg-yellow-400 text-blue-900' : 'bg-black/40 text-white'}`}
                >
                    {isFavorited ? <Icons.StarFilled size={16} /> : <Icons.Star size={16} />}
                </button>
                {item.isAuction && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                        <Icons.Hammer size={12} /> مزاد
                    </div>
                )}
                {item.isAdmin && (
                    <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                        <Icons.Shield size={12} /> موثوق
                    </div>
                )}
            </div>
            <div className="p-4">
                <h2 className="font-bold text-gray-800 text-base line-clamp-1 mb-2 dark:text-gray-200">{item.title}</h2>
                <div className="flex justify-between items-center text-blue-900 font-black text-lg mb-2 dark:text-blue-300">
                    <span>{formatNumber(item.price)} <span className="text-xs">{item.currency}</span></span>
                    {item.isAuction && <span className="text-xs text-red-500 font-normal">{timeLeft}</span>}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span className="flex items-center gap-1"><Icons.MapPin size={12} /> {item.city}</span>
                    <span className="flex items-center gap-1"><Icons.Eye size={12} /> {item.views || 0}</span>
                </div>
            </div>
        </article>
    );
};

const AddListingModal = ({ isOpen, onClose, user, onAdd }) => {
    const [formData, setFormData] = useState({
        title: '', price: '', currency: 'YER', city: '', category: 'cars', 
        phone: '', isWhatsapp: true, description: '', coords: null, image: '', images: [],
        isAuction: false, auctionEnd: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!formData.title || !formData.price || !formData.phone) return alert("يرجى ملء البيانات الضرورية");
        setSubmitting(true);
        try {
            await onAdd(formData);
            onClose();
        } catch (e) {
            alert("خطأ: " + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 dark:bg-gray-800 dark:text-gray-100" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">إضافة إعلان جديد</h2>
                <div className="space-y-4">
                    <input className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" placeholder="العنوان" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" placeholder="السعر" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                        <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                            <option value="YER">ريال يمني</option>
                            <option value="SAR">ريال سعودي</option>
                            <option value="USD">دولار</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                            <option value="">اختر المدينة</option>
                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    
                    <MultiImageUploader onImagesUpload={(urls) => setFormData(prev => ({...prev, images: urls, image: urls[0]}))} />
                    
                    <LocationPicker onLocationSelect={(loc) => setFormData(prev => ({...prev, coords: loc.coords, city: loc.city || prev.city, locationText: loc.locationText }))} />
                    
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl dark:bg-red-900/20">
                        <input type="checkbox" checked={formData.isAuction} onChange={e => setFormData({...formData, isAuction: e.target.checked})} />
                        <label className="text-red-800 font-bold dark:text-red-300">تفعيل نظام المزاد 🔥</label>
                    </div>
                    {formData.isAuction && (
                        <input type="datetime-local" className="w-full p-3 border rounded-xl dark:bg-gray-700" value={formData.auctionEnd} onChange={e => setFormData({...formData, auctionEnd: e.target.value})} />
                    )}

                    <textarea className="w-full p-3 border rounded-xl h-24 dark:bg-gray-700 dark:border-gray-600" placeholder="التفاصيل..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    <input type="tel" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" placeholder="رقم الهاتف" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    
                    <button disabled={submitting} onClick={handleSubmit} className="w-full bg-yellow-400 text-blue-900 font-bold py-3 rounded-xl hover:bg-yellow-500 disabled:opacity-50">
                        {submitting ? 'جاري النشر...' : 'نشر الإعلان'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AuthModal = ({ isOpen, onClose, onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            let userCred;
            if (isLogin) {
                userCred = await signInWithEmailAndPassword(auth, email, password);
            } else {
                userCred = await createUserWithEmailAndPassword(auth, email, password);
            }
            // Save basic user info to Firestore
            await setDoc(doc(db, 'users', userCred.user.uid), {
                email: userCred.user.email,
                uid: userCred.user.uid,
                createdAt: serverTimestamp()
            }, { merge: true });

            onLogin();
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogle = async () => {
        try {
            const res = await signInWithPopup(auth, googleProvider);
            await setDoc(doc(db, 'users', res.user.uid), {
                email: res.user.email,
                displayName: res.user.displayName,
                photoURL: res.user.photoURL,
                uid: res.user.uid,
                createdAt: serverTimestamp()
            }, { merge: true });
            onLogin();
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 dark:bg-gray-800 dark:text-gray-100" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'تسجيل الدخول' : 'حساب جديد'}</h2>
                {error && <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">{error}</div>}
                
                <button onClick={handleGoogle} className="w-full border py-3 rounded-xl flex justify-center items-center gap-2 mb-4 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                    <Icons.Google size={20} /> المتابعة بـ Google
                </button>
                
                <form onSubmit={handleAuth} className="space-y-4">
                    <input type="email" placeholder="البريد الإلكتروني" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" value={email} onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="كلمة المرور" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" value={password} onChange={e => setPassword(e.target.value)} />
                    <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">{isLogin ? 'دخول' : 'تسجيل'}</button>
                </form>
                
                <p className="text-center mt-4 text-sm text-blue-600 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخول'}
                </p>
            </div>
        </div>
    );
};

// --- المكون الرئيسي ---

export default function HomePage() {
    const [listings, setListings] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [user, setUser] = useState(null);
    const [modals, setModals] = useState({ auth: false, add: false });
    const [activeCat, setActiveCat] = useState('all');
    const [search, setSearch] = useState('');
    const [favorites, setFavorites] = useState(new Set());
    const [isAdmin, setIsAdmin] = useState(false);

    // مراقبة حالة المستخدم
    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                setIsAdmin(isAdminEmail(u.email));
                // جلب المفضلة
                const favSnap = await getDocs(collection(db, 'users', u.uid, 'favorites'));
                setFavorites(new Set(favSnap.docs.map(d => d.id)));
            } else {
                setFavorites(new Set());
            }
        });
        return () => unsubAuth();
    }, []);

    // جلب الإعلانات
    useEffect(() => {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setListings(data);
            setFiltered(data);
        });
        return () => unsub();
    }, []);

    // الفلترة
    useEffect(() => {
        let res = listings;
        if (activeCat !== 'all') res = res.filter(i => i.category === activeCat);
        if (search) {
            const s = search.toLowerCase();
            res = res.filter(i => i.title.toLowerCase().includes(s) || i.city.toLowerCase().includes(s));
        }
        setFiltered(res);
    }, [activeCat, search, listings]);

    const handleAddListing = async (data) => {
        if (!user) return;
        
        const fallbackCover = data.image || `https://source.unsplash.com/random/400x300?${data.category}`;
        const newAd = {
            ...data,
            userId: user.uid,
            userName: user.displayName || user.email,
            userEmail: user.email,
            userPhoto: user.photoURL || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            price: parseFloat(data.price),
            views: 0,
            likes: 0,
            isActive: true,
            isAdmin: isAdminEmail(user.email),
            images: data.images.length ? data.images : [fallbackCover],
            image: data.images[0] || fallbackCover
        };
        
        await addDoc(collection(db, 'listings'), newAd);
        alert('تم إضافة الإعلان بنجاح!');
    };

    const toggleFavorite = async (id) => {
        if (!user) return setModals({ ...modals, auth: true });
        
        const ref = doc(db, 'users', user.uid, 'favorites', id);
        const isFav = favorites.has(id);
        
        if (isFav) {
            await deleteDoc(ref);
            await updateDoc(doc(db, 'listings', id), { likes: increment(-1) });
            setFavorites(prev => { const n = new Set(prev); n.delete(id); return n; });
        } else {
            await setDoc(ref, { createdAt: serverTimestamp() });
            await updateDoc(doc(db, 'listings', id), { likes: increment(1) });
            setFavorites(prev => new Set(prev).add(id));
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 sticky top-0 z-50 shadow-lg rounded-b-3xl">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-white text-blue-800 p-2 rounded-lg font-black text-xl">ي</div>
                            <h1 className="text-xl font-bold">سوق اليمن</h1>
                        </div>
                        <div className="flex gap-2">
                             {!user ? (
                                <button onClick={() => setModals({...modals, auth: true})} className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold">دخول</button>
                             ) : (
                                <div className="flex items-center gap-2">
                                    <img src={user.photoURL || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full border" alt="User" />
                                    <button onClick={() => setModals({...modals, add: true})} className="bg-yellow-400 text-blue-900 p-2 rounded-full shadow-lg hover:scale-110 transition">
                                        <Icons.Plus size={20} />
                                    </button>
                                </div>
                             )}
                        </div>
                    </div>
                    
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="ابحث عن سيارة، عقار، جوال..." 
                            className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 text-white placeholder-blue-200 outline-none focus:bg-white focus:text-gray-900 transition"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <Icons.Search className="absolute right-3 top-3 text-blue-200" />
                    </div>
                </div>
            </header>

            {/* Categories */}
            <div className="container mx-auto px-4 mt-4 overflow-x-auto whitespace-nowrap hide-scrollbar py-2">
                <div className="flex gap-3">
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => setActiveCat(cat.id)}
                            className={`flex flex-col items-center gap-1 min-w-[60px] transition ${activeCat === cat.id ? 'scale-110' : 'opacity-70'}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 ${activeCat === cat.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}>
                                <cat.icon size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Listings Grid */}
            <main className="container mx-auto px-4 mt-6">
                {filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p>لا توجد إعلانات تطابق بحثك</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(item => (
                            <ListingCard 
                                key={item.id} 
                                item={item} 
                                currentUser={user}
                                isFavorited={favorites.has(item.id)}
                                onToggleFavorite={toggleFavorite}
                                onViewDetails={() => console.log('Details', item.id)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modals */}
            <AddListingModal isOpen={modals.add} onClose={() => setModals({...modals, add: false})} user={user} onAdd={handleAddListing} />
            <AuthModal isOpen={modals.auth} onClose={() => setModals({...modals, auth: false})} onLogin={() => alert('مرحباً بك!')} />
        </div>
    );
}
