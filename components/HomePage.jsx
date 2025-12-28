"use client";

import React, { useState, useEffect, useRef } from 'react';
import { auth, db, storage, googleProvider } from '../lib/firebaseClient';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query, where, orderBy, limit, 
  serverTimestamp, increment, getDoc, getDocs, setDoc, writeBatch 
} from 'firebase/firestore';
import { 
  signInWithPopup, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, onAuthStateChanged 
} from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Icons } from './Icons';

// استيراد المكونات الفرعية
import ListingDetailsModal from './ListingDetailsModal';
import ChatSystem from './ChatSystem';
import AdminPanel from './AdminPanel';

// --- الثوابت ---
const YEMEN_CENTER = [15.5527, 48.5164]; 
const DEFAULT_ZOOM = 6;
const ADMIN_EMAIL = "mansouralbarout@gmail.com";
const ADMIN_PHONE = "770991885"; // إضافة رقم المدير
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

// بيانات الإعلانات الافتراضية
const SAMPLE_LISTINGS = [
    {
        title: 'تويوتا كامري 2022 موديل حديث',
        price: 35000,
        currency: 'USD',
        category: 'cars',
        city: 'صنعاء',
        description: 'كامري 2022 فل كامل، لون أبيض، 20 ألف كم فقط، بحالة الوكالة',
        phone: ADMIN_PHONE,
        isWhatsapp: true,
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop',
        coords: [15.3694, 44.1910],
        views: 150, likes: 25, isActive: true, featured: true
    },
    {
        title: 'فيلا فاخرة في حي الروضة صنعاء',
        price: 250000,
        currency: 'USD',
        category: 'real_estate',
        city: 'صنعاء',
        description: 'فيلا 4 غرف نوم، 3 دور، ملحق، حديقة، جراج لسيارتين',
        phone: ADMIN_PHONE,
        isWhatsapp: true,
        image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop',
        coords: [15.3547, 44.2066],
        views: 320, likes: 45, isActive: true, featured: true
    },
    {
        title: 'آيفون 14 برو ماكس جديد',
        price: 1200,
        currency: 'USD',
        category: 'mobiles',
        city: 'عدن',
        description: 'آيفون 14 برو ماكس 256 جيجا، ضمان سنة، شاحن أصلي',
        phone: ADMIN_PHONE,
        isWhatsapp: true,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
        coords: [12.7855, 45.0187],
        views: 210, likes: 38, isActive: true
    },
    {
        title: 'نظام طاقة شمسية 5 كيلو وات',
        price: 4500,
        currency: 'USD',
        category: 'solar',
        city: 'تعز',
        description: 'نظام متكامل مع بطاريات وبوابة شحن، ضمان 10 سنوات',
        phone: ADMIN_PHONE,
        isWhatsapp: true,
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
        coords: [13.5795, 44.0209],
        views: 180, likes: 32, isActive: true
    }
];

const formatNumber = (num) => Math.round(num).toLocaleString('en-US');

// --- المكونات المساعدة ---

const NotificationSystem = ({ user }) => {
    const [unread, setUnread] = useState(0);
    const [show, setShow] = useState(false);
    const [notifs, setNotifs] = useState([]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'notifications'), where('userId', '==', user.uid), where('read', '==', false), limit(10));
        const unsub = onSnapshot(q, (snap) => {
            setNotifs(snap.docs.map(d => ({id: d.id, ...d.data()})));
            setUnread(snap.size);
        });
        return () => unsub();
    }, [user]);

    return (
        <div className="relative">
            <button onClick={() => setShow(!show)} className="relative p-2 rounded-full hover:bg-white/20 transition">
                <Icons.Bell size={24} className="text-white" />
                {unread > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{unread}</span>}
            </button>
            {show && (
                <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl z-50 overflow-hidden dark:bg-gray-800 dark:border dark:border-gray-700">
                    <div className="p-3 border-b text-sm font-bold dark:border-gray-700">الإشعارات</div>
                    <div className="max-h-60 overflow-y-auto">
                        {notifs.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">لا توجد إشعارات جديدة</div>
                        ) : (
                            notifs.map(n => (
                                <div key={n.id} className="p-3 border-b hover:bg-gray-50 text-sm dark:border-gray-700 dark:hover:bg-gray-700">
                                    {n.message}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const DarkModeToggle = () => {
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const isDarkStored = localStorage.getItem('darkMode') === 'true';
        setIsDark(isDarkStored);
        if (isDarkStored) document.documentElement.classList.add('dark');
    }, []);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem('darkMode', next);
        if (next) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    return (
        <button onClick={toggle} className="p-2 rounded-full hover:bg-white/20 transition text-white">
            {isDark ? <Icons.Sun size={24} /> : <Icons.Moon size={24} />}
        </button>
    );
};

const MainMap = ({ listings, onViewDetails }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.L && mapRef.current) {
            if (!mapInstance.current) {
                mapInstance.current = window.L.map(mapRef.current).setView(YEMEN_CENTER, 6);
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; سوق اليمن'
                }).addTo(mapInstance.current);
                
                if (window.L.markerClusterGroup) {
                    markersRef.current = window.L.markerClusterGroup();
                } else {
                    markersRef.current = window.L.layerGroup();
                }
                mapInstance.current.addLayer(markersRef.current);
            }

            const markers = markersRef.current;
            markers.clearLayers();

            listings.forEach(item => {
                if (item.coords && Array.isArray(item.coords)) {
                    const marker = window.L.marker(item.coords);
                    const popupContent = `
                        <div class="text-center">
                            <h3 class="font-bold text-sm mb-1">${item.title}</h3>
                            <p class="text-blue-600 font-bold">${formatNumber(item.price)} ${item.currency}</p>
                        </div>
                    `;
                    marker.bindPopup(popupContent);
                    marker.on('popupopen', () => {
                        // يمكن إضافة زر تفاصيل هنا لاحقاً
                    });
                    markers.addLayer(marker);
                }
            });
        }
    }, [listings]);

    return <div ref={mapRef} className="w-full h-[calc(100vh-200px)] rounded-xl z-0" />;
};

const Footer = ({ listings }) => {
    const totalViews = listings.reduce((acc, cur) => acc + (cur.views || 0), 0);
    const activeAuctions = listings.filter(l => l.isAuction).length;

    return (
        <footer className="mt-10 bg-white border-t py-8 dark:bg-gray-800 dark:border-gray-700">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="p-4 bg-blue-50 rounded-xl dark:bg-blue-900/20">
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{listings.length}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">إعلان نشط</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl dark:bg-purple-900/20">
                        <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{formatNumber(totalViews)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">مشاهدة</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl dark:bg-red-900/20">
                        <div className="text-2xl font-black text-red-600 dark:text-red-400">{activeAuctions}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">مزاد جاري</div>
                    </div>
                </div>
                <div className="text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} سوق اليمن. جميع الحقوق محفوظة.</p>
                    <p className="mt-1">رقم المدير: <span className="font-mono">{ADMIN_PHONE}</span></p>
                </div>
            </div>
        </footer>
    );
};

// --- دوال مساعدة (Map & Upload) ---

const LocationPicker = ({ onLocationSelect, initialCoords }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.L && mapRef.current && !mapInstance.current) {
            try {
                const center = initialCoords || YEMEN_CENTER;
                const zoom = initialCoords ? 12 : DEFAULT_ZOOM;
                
                mapInstance.current = window.L.map(mapRef.current).setView(center, zoom);
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; سوق اليمن' }).addTo(mapInstance.current);

                if (initialCoords) {
                    markerRef.current = window.L.marker(initialCoords, { draggable: true }).addTo(mapInstance.current);
                }

                mapInstance.current.on('click', async (e) => {
                    const { lat, lng } = e.latlng;
                    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
                    else markerRef.current = window.L.marker([lat, lng], { draggable: true }).addTo(mapInstance.current);
                    
                    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
                    try {
                        const res = await fetch(url);
                        const data = await res.json();
                        onLocationSelect({ 
                            coords: [lat, lng], 
                            city: data.address?.city || data.address?.town || "", 
                            locationText: data.display_name,
                            locationUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}`
                        });
                    } catch(e) { console.log(e); }
                });
            } catch (err) { console.error("Map init error:", err); }
        }
    }, [onLocationSelect, initialCoords]);

    return <div ref={mapRef} className="w-full h-64 rounded-xl border border-gray-300 z-10 dark:border-gray-600" />;
};

const MultiImageUploader = ({ maxFiles = 5, onImagesUpload, initialImages = [] }) => {
    const [items, setItems] = useState([]);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (initialImages.length > 0 && items.length === 0) {
            setItems(initialImages.map(url => ({ preview: url, url, progress: 100 })));
        }
    }, [initialImages]);

    const uploadOne = (file, idx) => new Promise((resolve, reject) => {
        const fileName = `listings/img_${Date.now()}_${idx}_${file.name.replace(/\W/g,'_')}`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed',
            (snap) => {
                const progress = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                setItems(prev => { const n=[...prev]; if(n[idx]) n[idx].progress=progress; return n; });
            },
            reject,
            async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
        );
    });

    const handleSelect = async (e) => {
        const files = Array.from(e.target.files || []).slice(0, maxFiles - items.length);
        if (!files.length) return;
        
        const baseIdx = items.length;
        const newItems = files.map(f => ({ preview: URL.createObjectURL(f), url: '', progress: 0, file: f }));
        setItems([...items, ...newItems]);
        setBusy(true);

        for (let i = 0; i < newItems.length; i++) {
            try {
                const url = await uploadOne(newItems[i].file, baseIdx + i);
                setItems(prev => { const n=[...prev]; n[baseIdx+i].url=url; return n; });
            } catch (e) { console.error(e); }
        }
        setBusy(false);
    };

    useEffect(() => {
        const urls = items.map(x => x.url).filter(Boolean);
        onImagesUpload(urls);
    }, [items]);

    const removeImage = (idx) => {
        setItems(prev => prev.filter((_, i) => i !== idx));
    };

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center dark:border-gray-600">
             <div className="flex gap-2 overflow-x-auto mb-2">
                {items.map((it, idx) => (
                    <div key={idx} className="w-20 h-20 relative shrink-0 group">
                        <img src={it.preview} className="w-full h-full object-cover rounded" alt="Preview" />
                        {!it.url && <div className="absolute inset-0 bg-black/50 text-white text-xs flex items-center justify-center">{it.progress}%</div>}
                        <button onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition">
                            <Icons.X size={12} />
                        </button>
                    </div>
                ))}
            </div>
            {items.length < maxFiles && !busy && (
                <label className="cursor-pointer text-blue-600 font-bold">
                    <Icons.Camera className="mx-auto mb-1"/> {items.length > 0 ? 'إضافة المزيد' : 'إضافة صور'}
                    <input type="file" accept="image/*" multiple onChange={handleSelect} className="hidden" />
                </label>
            )}
            {busy && <span className="text-gray-500">جاري الرفع...</span>}
        </div>
    );
};

// --- بطاقة الإعلان ---

const ListingCard = ({ item, currentUser, onViewDetails, isFavorited, onToggleFavorite, onChat, onDelete, onEdit }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [showBidInput, setShowBidInput] = useState(false);
    const [submittingBid, setSubmittingBid] = useState(false);

    const isOwner = currentUser && item.userId === currentUser.uid;

    useEffect(() => {
        if (item.isAuction && item.auctionEnd) {
            const updateTimer = () => {
                const diff = new Date(item.auctionEnd) - new Date();
                if (diff <= 0) return setTimeLeft('منتهي');
                const d = Math.floor(diff / (1000*60*60*24));
                const h = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
                setTimeLeft(`${d}ي ${h}س`);
            };
            updateTimer();
            const interval = setInterval(updateTimer, 60000);
            return () => clearInterval(interval);
        }
    }, [item]);

    const handleBid = async () => {
        if (!currentUser) return alert("يجب تسجيل الدخول للمزايدة");
        const amount = parseFloat(bidAmount);
        if (!amount || amount <= item.price) return alert("يجب أن يكون المبلغ أعلى من السعر الحالي");
        
        setSubmittingBid(true);
        try {
            await updateDoc(doc(db, 'listings', item.id), {
                price: amount,
                lastBidderId: currentUser.uid,
                lastBidderName: currentUser.displayName || currentUser.email,
                bidsCount: increment(1)
            });
            await addDoc(collection(db, 'listings', item.id, 'bids'), {
                amount,
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email,
                timestamp: serverTimestamp()
            });
            alert("تمت المزايدة بنجاح!");
            setShowBidInput(false);
            setBidAmount('');
        } catch (e) {
            alert(e.message);
        } finally {
            setSubmittingBid(false);
        }
    };

    return (
        <article className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-lg transition group relative dark:bg-gray-800 dark:border-gray-700">
            <div className="h-48 relative overflow-hidden bg-gray-200 cursor-pointer" onClick={() => onViewDetails(item)}>
                <img src={item.image || (item.images && item.images[0]) || 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={item.title}/>
                <button onClick={(e) => {e.stopPropagation(); onToggleFavorite(item.id);}} className={`absolute top-2 left-2 p-2 rounded-full backdrop-blur-sm ${isFavorited ? 'bg-yellow-400 text-blue-900' : 'bg-black/40 text-white'}`}>
                    {isFavorited ? <Icons.StarFilled size={16}/> : <Icons.Star size={16}/>}
                </button>
                {item.isAuction && <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold flex gap-1"><Icons.Hammer size={12}/> مزاد</div>}
                {isOwner && <div className="absolute bottom-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold">إعلاني</div>}
            </div>
            <div className="p-4">
                <h2 className="font-bold text-gray-800 line-clamp-1 mb-2 dark:text-gray-200">{item.title}</h2>
                <div className="flex justify-between items-center text-blue-900 font-black text-lg mb-2 dark:text-blue-300">
                    <span>{formatNumber(item.price)} <span className="text-xs">{item.currency}</span></span>
                    {item.isAuction && <span className="text-xs text-red-500 font-normal">{timeLeft}</span>}
                </div>

                {item.isAuction && timeLeft !== 'منتهي' && (
                    <div className="mb-3">
                        {!showBidInput ? (
                            <button onClick={() => setShowBidInput(true)} className="w-full bg-red-50 text-red-600 py-1.5 rounded-lg text-sm font-bold border border-red-100 hover:bg-red-100">
                                <Icons.Hammer size={14} className="inline ml-1"/> زايد الآن
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    placeholder="السعر" 
                                    className="w-full p-1.5 border rounded-lg text-sm"
                                    value={bidAmount}
                                    onChange={e => setBidAmount(e.target.value)}
                                />
                                <button disabled={submittingBid} onClick={handleBid} className="bg-red-600 text-white px-3 rounded-lg text-sm font-bold">
                                    {submittingBid ? '...' : 'تم'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-between items-center mt-2 pt-2 border-t dark:border-gray-700">
                    <span className="text-xs text-gray-400 flex gap-1"><Icons.MapPin size={12}/> {item.city}</span>
                    <div className="flex gap-2">
                        {isOwner ? (
                            <>
                                <button onClick={(e) => {e.stopPropagation(); onEdit(item)}} className="text-yellow-600 hover:bg-yellow-50 p-2 rounded-full transition">
                                    <Icons.Edit size={16} />
                                </button>
                                <button onClick={(e) => {e.stopPropagation(); onDelete(item.id)}} className="text-red-600 hover:bg-red-50 p-2 rounded-full transition">
                                    <Icons.Trash size={16} />
                                </button>
                            </>
                        ) : (
                            <button onClick={(e) => {e.stopPropagation(); onChat(item);}} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition dark:hover:bg-gray-700">
                                <Icons.Message size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};

// --- نافذة الإضافة / التعديل ---

const AddListingModal = ({ isOpen, onClose, user, onAdd, editItem }) => {
    const [data, setData] = useState({
        title: '', price: '', currency: 'YER', city: '', category: 'cars', 
        phone: '', isWhatsapp: true, description: '', coords: null, image: '', images: [],
        isAuction: false, auctionEnd: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (editItem) {
            setData({
                ...editItem,
                price: editItem.price || '',
                description: editItem.description || '',
                phone: editItem.phone || ''
            });
        } else {
            setData({
                title: '', price: '', currency: 'YER', city: '', category: 'cars', 
                phone: '', isWhatsapp: true, description: '', coords: null, image: '', images: [],
                isAuction: false, auctionEnd: ''
            });
        }
    }, [editItem, isOpen]);

    const handleSubmit = async () => {
        if (!data.title || !data.price || !data.phone) return alert("يرجى ملء البيانات الضرورية");
        setSubmitting(true);
        try { 
            await onAdd(data, editItem?.id);
            onClose(); 
        } 
        catch (e) { alert(e.message); } 
        finally { setSubmitting(false); }
    };

    const handleAutoLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setData(prev => ({ ...prev, coords: [pos.coords.latitude, pos.coords.longitude] }));
                alert("تم تحديد موقعك بنجاح!");
            });
        } else {
            alert("المتصفح لا يدعم تحديد الموقع");
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 dark:bg-gray-800 dark:text-gray-100" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">{editItem ? 'تعديل الإعلان' : 'إضافة إعلان'}</h2>
                    <button onClick={onClose}><Icons.X/></button>
                </div>
                <div className="space-y-4">
                    <input className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" placeholder="العنوان" value={data.title} onChange={e => setData({...data, title: e.target.value})} />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" placeholder="السعر" value={data.price} onChange={e => setData({...data, price: e.target.value})} />
                        <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" value={data.currency} onChange={e => setData({...data, currency: e.target.value})}>
                            <option value="YER">ريال يمني</option> <option value="SAR">ريال سعودي</option> <option value="USD">دولار</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" value={data.category} onChange={e => setData({...data, category: e.target.value})}>
                            {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" value={data.city} onChange={e => setData({...data, city: e.target.value})}>
                            <option value="">اختر المدينة</option>
                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    
                    <MultiImageUploader 
                        initialImages={data.images}
                        onImagesUpload={(urls) => setData(prev => ({...prev, images: urls, image: urls[0]}))} 
                    />
                    
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold">الموقع:</label>
                        <button onClick={handleAutoLocation} className="text-blue-600 text-xs font-bold">📍 تحديد موقعي الحالي</button>
                    </div>
                    <LocationPicker 
                        initialCoords={data.coords}
                        onLocationSelect={(loc) => setData(prev => ({...prev, coords: loc.coords, city: loc.city || prev.city, locationText: loc.locationText, locationUrl: loc.locationUrl }))} 
                    />
                    
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl dark:bg-red-900/20">
                        <input type="checkbox" checked={data.isAuction} onChange={e => setData({...data, isAuction: e.target.checked})} />
                        <label className="text-red-800 font-bold dark:text-red-300">نظام المزاد</label>
                    </div>
                    {data.isAuction && <input type="datetime-local" className="w-full p-3 border rounded-xl dark:bg-gray-700" value={data.auctionEnd} onChange={e => setData({...data, auctionEnd: e.target.value})} />}
                    
                    <textarea className="w-full p-3 border rounded-xl h-24 dark:bg-gray-700 dark:border-gray-600" placeholder="التفاصيل..." value={data.description} onChange={e => setData({...data, description: e.target.value})} />
                    <input type="tel" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" placeholder="رقم الهاتف" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} />
                    
                    <button disabled={submitting} onClick={handleSubmit} className="w-full bg-yellow-400 text-blue-900 font-bold py-3 rounded-xl hover:bg-yellow-500 disabled:opacity-50">
                        {submitting ? 'جاري الحفظ...' : (editItem ? 'تحديث الإعلان' : 'نشر الإعلان')}
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
    
    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            const fn = isLogin ? signInWithEmailAndPassword : createUserWithEmailAndPassword;
            const res = await fn(auth, email, password);
            if (!isLogin) await setDoc(doc(db, 'users', res.user.uid), { email, uid: res.user.uid, createdAt: serverTimestamp() }, { merge: true });
            onLogin(); onClose();
        } catch (err) { alert(err.message); }
    };

    const handleGoogle = async () => {
        try {
            const res = await signInWithPopup(auth, googleProvider);
            await setDoc(doc(db, 'users', res.user.uid), { email: res.user.email, displayName: res.user.displayName, photoURL: res.user.photoURL, uid: res.user.uid, createdAt: serverTimestamp() }, { merge: true });
            onLogin(); onClose();
        } catch (err) { alert(err.message); }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 dark:bg-gray-800 dark:text-gray-100" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'تسجيل الدخول' : 'حساب جديد'}</h2>
                <button onClick={handleGoogle} className="w-full border py-3 rounded-xl flex justify-center gap-2 mb-4 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Icons.Google size={20}/> Google</button>
                <form onSubmit={handleAuth} className="space-y-4">
                    <input type="email" placeholder="البريد" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" value={email} onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="كلمة المرور" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" value={password} onChange={e => setPassword(e.target.value)} />
                    <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">{isLogin ? 'دخول' : 'تسجيل'}</button>
                </form>
                <p className="text-center mt-4 text-blue-600 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'ليس لديك حساب؟' : 'لديك حساب؟'}</p>
            </div>
        </div>
    );
};

// --- الصفحة الرئيسية (Main) ---

export default function HomePage() {
    const [listings, setListings] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [user, setUser] = useState(null);
    const [modals, setModals] = useState({ auth: false, add: false });
    const [activeCat, setActiveCat] = useState('all');
    const [search, setSearch] = useState('');
    const [favorites, setFavorites] = useState(new Set());
    const [isAdmin, setIsAdmin] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); 
    
    // State للمودالات الجديدة
    const [selectedListingId, setSelectedListingId] = useState(null);
    const [chatListing, setChatListing] = useState(null);
    const [editItem, setEditItem] = useState(null);

    const addSampleListings = async () => {
        const batch = writeBatch(db);
        SAMPLE_LISTINGS.forEach((item) => {
            const ref = doc(collection(db, 'listings'));
            batch.set(ref, {
                ...item,
                userId: user.uid,
                userName: 'مدير النظام',
                userEmail: user.email,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isAdmin: true
            });
        });
        await batch.commit();
        alert('تم إضافة الإعلانات الافتراضية بنجاح');
    };

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                setIsAdmin(isAdminEmail(u.email));
                try {
                    const snap = await getDocs(collection(db, 'users', u.uid, 'favorites'));
                    setFavorites(new Set(snap.docs.map(d => d.id)));
                } catch(e) { console.log("Fav error", e); }
            } else {
                setFavorites(new Set());
                setIsAdmin(false);
            }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setListings(data);
            setFiltered(data);
        }, (err) => console.log(err));
        return () => unsub();
    }, []);

    useEffect(() => {
        let res = listings;
        if (activeCat !== 'all') res = res.filter(i => i.category === activeCat);
        if (search) {
            const s = search.toLowerCase();
            res = res.filter(i => i.title.toLowerCase().includes(s) || i.city.toLowerCase().includes(s));
        }
        setFiltered(res);
    }, [activeCat, search, listings]);

    const handleAddOrUpdateListing = async (data, id = null) => {
        if (!user) return;
        
        const fallbackCover = data.image || `https://source.unsplash.com/random/400x300?${data.category}`;
        const adData = {
            ...data, 
            userId: user.uid, 
            userName: user.displayName || user.email, 
            userEmail: user.email, 
            userPhoto: user.photoURL || '',
            updatedAt: serverTimestamp(), 
            price: parseFloat(data.price), 
            images: data.images.length ? data.images : [fallbackCover], 
            image: data.images[0] || fallbackCover
        };

        if (id) {
            await updateDoc(doc(db, 'listings', id), adData);
            alert('تم التعديل بنجاح!');
        } else {
            adData.createdAt = serverTimestamp();
            adData.views = 0;
            adData.likes = 0;
            adData.isActive = true;
            adData.isAdmin = isAdminEmail(user.email);
            
            await addDoc(collection(db, 'listings'), adData);
            alert('تم النشر!');
        }
    };

    const toggleFavorite = async (id) => {
        if (!user) return setModals({ ...modals, auth: true });
        const ref = doc(db, 'users', user.uid, 'favorites', id);
        if (favorites.has(id)) {
            await deleteDoc(ref);
            await updateDoc(doc(db, 'listings', id), { likes: increment(-1) });
            setFavorites(prev => { const n=new Set(prev); n.delete(id); return n; });
        } else {
            await setDoc(ref, { createdAt: serverTimestamp() });
            await updateDoc(doc(db, 'listings', id), { likes: increment(1) });
            setFavorites(prev => new Set(prev).add(id));
        }
    };

    const handleDeleteListing = async (id) => {
        if (confirm('هل أنت متأكد من حذف الإعلان؟')) await deleteDoc(doc(db, 'listings', id));
    };
    
    const handleEditListing = (item) => {
        setEditItem(item);
        setModals({ ...modals, add: true });
    };

    const handleToggleListingStatus = async (id, status) => {
        await updateDoc(doc(db, 'listings', id), { isActive: status });
    };

    const handleChat = (item) => {
        if (!user) return setModals({...modals, auth: true});
        if (user.uid === item.userId) return alert("لا يمكنك مراسلة نفسك!");
        setChatListing(item);
    };

    const selectedListing = listings.find(l => l.id === selectedListingId);

    const closeAddModal = () => {
        setModals({...modals, add: false});
        setEditItem(null);
    };

    return (
        <div className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 sticky top-0 z-40 shadow-lg rounded-b-3xl">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2" onClick={() => { setActiveCat('all'); setSearch(''); }}>
                            <div className="bg-white text-blue-800 p-2 rounded-lg font-black text-xl shadow cursor-pointer">ي</div>
                            <h1 className="text-xl font-bold cursor-pointer">سوق اليمن</h1>
                        </div>
                        <div className="flex gap-2 items-center">
                             <NotificationSystem user={user} />
                             <DarkModeToggle />
                             
                             <button 
                                onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                                className="p-2 rounded-full hover:bg-white/20 transition text-white"
                                title={viewMode === 'grid' ? 'عرض الخريطة' : 'عرض القائمة'}
                             >
                                {viewMode === 'grid' ? <Icons.Map size={24} /> : <Icons.List size={24} />}
                             </button>

                             {!user ? (
                                <button onClick={() => setModals({...modals, auth: true})} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-bold transition">دخول</button>
                             ) : (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setModals({...modals, add: true})} className="bg-yellow-400 text-blue-900 p-2 rounded-full shadow-lg hover:scale-110 transition"><Icons.Plus size={20} /></button>
                                    <img src={user.photoURL || 'https://via.placeholder.com/40'} className="w-9 h-9 rounded-full border-2 border-white/50" alt="User" />
                                </div>
                             )}
                        </div>
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="ابحث..." className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 text-white placeholder-blue-200 outline-none focus:bg-white focus:text-gray-900 transition" value={search} onChange={e => setSearch(e.target.value)} />
                        <Icons.Search className="absolute right-3 top-3 text-blue-200" />
                    </div>
                </div>
            </header>

            {/* Categories */}
            {viewMode === 'grid' && (
                <div className="container mx-auto px-4 mt-4 overflow-x-auto whitespace-nowrap hide-scrollbar py-2">
                    <div className="flex gap-3">
                        {CATEGORIES.map(cat => (
                            <button key={cat.id} onClick={() => setActiveCat(cat.id)} className={`flex flex-col items-center gap-1 min-w-[64px] transition ${activeCat === cat.id ? 'scale-110 opacity-100' : 'opacity-70 hover:opacity-100'}`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${activeCat === cat.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-100'}`}><cat.icon size={24} /></div>
                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content: Grid or Map */}
            <main className="container mx-auto px-4 mt-6">
                {viewMode === 'map' ? (
                    <MainMap listings={filtered} onViewDetails={(it) => setSelectedListingId(it.id)} />
                ) : (
                    <>
                        {filtered.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <p className="mb-4">لا توجد إعلانات حالياً</p>
                                {isAdmin && (
                                    <button onClick={addSampleListings} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                                        إضافة إعلانات افتراضية
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filtered.map(item => (
                                    <ListingCard 
                                        key={item.id} 
                                        item={item} 
                                        currentUser={user}
                                        isFavorited={favorites.has(item.id)}
                                        onToggleFavorite={toggleFavorite}
                                        onViewDetails={(it) => setSelectedListingId(it.id)}
                                        onChat={handleChat}
                                        onDelete={handleDeleteListing}
                                        onEdit={handleEditListing}
                                    />
                                ))}
                            </div>
                        )}
                        {/* Footer */}
                        <Footer listings={listings} />
                    </>
                )}
            </main>

            {/* Modals & Components */}
            <AddListingModal 
                isOpen={modals.add} 
                onClose={closeAddModal} 
                user={user} 
                onAdd={handleAddOrUpdateListing} 
                editItem={editItem}
            />
            <AuthModal isOpen={modals.auth} onClose={() => setModals({...modals, auth: false})} onLogin={() => alert('تم الدخول!')} />
            
            <ListingDetailsModal 
                item={selectedListing} 
                isOpen={!!selectedListingId} 
                onClose={() => setSelectedListingId(null)}
                isFavorited={selectedListing && favorites.has(selectedListing.id)}
                onToggleFavorite={toggleFavorite}
                onRegisterView={async (id) => await updateDoc(doc(db, 'listings', id), { views: increment(1) })}
            />

            {chatListing && (
                <ChatSystem 
                    currentUser={user}
                    listing={chatListing}
                    onClose={() => setChatListing(null)}
                />
            )}

            {isAdmin && (
                <AdminPanel 
                    user={user}
                    listings={listings}
                    onDeleteListing={handleDeleteListing}
                    onEditListing={handleEditListing}
                    onToggleListingStatus={handleToggleListingStatus}
                />
            )}
        </div>
    );
}
