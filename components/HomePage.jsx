"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { auth, db } from "../lib/firebase";

// Firebase (modular v9)
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

// ----------------- Constants -----------------
const RATES = { USD_TO_YER: 1600, SAR_TO_YER: 420 };
const YEMEN_CENTER = [15.5527, 48.5164];
const DEFAULT_ZOOM = 6;

// ----------------- Helpers -----------------
const formatNumber = (num) => {
  const n = Number(num || 0);
  return Math.round(n).toLocaleString("en-US");
};

function normalizeText(s) {
  return String(s || "").toLowerCase().trim();
}

// ----------------- Icons -----------------
const Icons = {
  Map: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  Grid: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  ),
  Plus: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...p}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),
  Search: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  X: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  MapPin: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Eye: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Hammer: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="m15 12-8.5 8.5a2.12 2.12 0 0 1-3 0 2.12 2.12 0 0 1 0-3L12 9" />
      <path d="M17.64 15 22 10.64" />
      <path d="M20.91 11.7 19.66 10.45A3.18 3.18 0 0 1 18.73 8.2V2.75A2.75 2.75 0 0 0 16 0h-2.25a2.12 2.12 0 0 0-1.5.62L2.62 10.25" />
      <path d="M7 5.5 18.5 17" />
    </svg>
  ),
};

// ----------------- Data -----------------
const CATEGORIES = [
  { id: "all", name: "الكل", icon: Icons.Grid },
  { id: "cars", name: "سيارات", icon: Icons.Grid },
  { id: "real_estate", name: "عقارات", icon: Icons.Grid },
  { id: "mobiles", name: "جوالات", icon: Icons.Grid },
  { id: "solar", name: "طاقة", icon: Icons.Grid },
];

const CITIES = ["صنعاء", "عدن", "تعز", "الحديدة", "إب", "المكلا", "حضرموت", "ذمار", "مأرب", "عمران"];

// ----------------- Logo -----------------
const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="bg-white p-1 rounded-lg shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="26" height="26" className="rounded overflow-hidden">
        <rect width="100" height="100" fill="#1e40af" />
        <path d="M25 35 h50 v50 a5 5 0 0 1 -5 5 h-40 a5 5 0 0 1 -5 -5 z" fill="#fff" />
        <path d="M35 35 v-10 a15 15 0 0 1 30 0 v10" fill="none" stroke="#eab308" strokeWidth="6" />
        <text x="50" y="80" textAnchor="middle" fill="#1e40af" fontSize="24" fontWeight="900">
          ي
        </text>
      </svg>
    </div>
    <h1 className="text-lg font-black text-white">سوق اليمن</h1>
  </div>
);

// ----------------- Leaflet helpers (global scripts) -----------------
function waitForLeaflet(timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (typeof window !== "undefined" && window.L && typeof window.L.map === "function") return resolve(window.L);
      if (Date.now() - start > timeoutMs) return reject(new Error("Leaflet not loaded"));
      setTimeout(tick, 50);
    };
    tick();
  });
}

// ----------------- Map: MainMap -----------------
const MainMap = ({ items }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const L = await waitForLeaflet();
        if (!alive || !mapRef.current) return;

        if (!mapInstance.current) {
          mapInstance.current = L.map(mapRef.current).setView(YEMEN_CENTER, DEFAULT_ZOOM);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap",
          }).addTo(mapInstance.current);

          // marker cluster if available
          markersLayer.current = L.markerClusterGroup ? L.markerClusterGroup() : L.featureGroup();
          markersLayer.current.addTo(mapInstance.current);
        }

        // update markers
        if (markersLayer.current) {
          markersLayer.current.clearLayers();
          (items || []).forEach((it) => {
            if (it?.coords && Array.isArray(it.coords) && it.coords.length === 2) {
              const m = L.marker(it.coords);
              const safeTitle = String(it.title || "");
              const safeCity = String(it.city || "");
              m.bindPopup(`<b>${safeTitle}</b><br/>${safeCity}`);
              markersLayer.current.addLayer(m);
            }
          });
        }

        setTimeout(() => mapInstance.current?.invalidateSize(), 200);
      } catch {
        // ignore map failure
      }
    })();

    return () => {
      alive = false;
    };
  }, [items]);

  return <div ref={mapRef} className="w-full h-full min-h-[500px] leaflet-container rounded-xl" />;
};

// ----------------- LocationPicker -----------------
const LocationPicker = ({ onPick }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const L = await waitForLeaflet();
        if (!alive || !mapRef.current) return;

        if (!mapInstance.current) {
          mapInstance.current = L.map(mapRef.current).setView(YEMEN_CENTER, DEFAULT_ZOOM);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap",
          }).addTo(mapInstance.current);

          mapInstance.current.on("click", (e) => {
            const { lat, lng } = e.latlng;
            const coords = [lat, lng];

            if (markerRef.current) markerRef.current.setLatLng(coords);
            else markerRef.current = L.marker(coords, { draggable: true }).addTo(mapInstance.current);

            markerRef.current.on("dragend", (ev) => {
              const p = ev.target.getLatLng();
              onPick([p.lat, p.lng]);
            });

            onPick(coords);
          });
        }

        setTimeout(() => mapInstance.current?.invalidateSize(), 200);
      } catch {
        // ignore
      }
    })();

    return () => {
      alive = false;
    };
  }, [onPick]);

  return <div ref={mapRef} className="w-full h-64 rounded-xl border border-gray-300 leaflet-container" />;
};

// ----------------- AuthModal -----------------
const AuthModal = ({ open, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (ex) {
      setErr(ex?.message || "خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-black">{isLogin ? "تسجيل الدخول" : "إنشاء حساب"}</h2>
          <button onClick={onClose} className="p-1">
            <Icons.X />
          </button>
        </div>

        {err && <div className="text-red-600 text-sm mb-2">{err}</div>}

        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full p-3 border rounded-xl"
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full p-3 border rounded-xl"
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button disabled={busy} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
            {busy ? "..." : isLogin ? "دخول" : "تسجيل"}
          </button>

          <button
            type="button"
            onClick={() => setIsLogin((v) => !v)}
            className="w-full text-sm text-blue-700 font-bold"
          >
            {isLogin ? "إنشاء حساب جديد" : "لديك حساب؟ سجّل دخول"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ----------------- ListingCard (with currency + auction timer) -----------------
const ListingCard = ({ item, onOpen }) => {
  const [timeLeft, setTimeLeft] = useState("");

  const prices = useMemo(() => {
    const base = Number(item?.price || 0);
    let yer = 0;
    if (item?.currency === "USD") yer = base * RATES.USD_TO_YER;
    else if (item?.currency === "SAR") yer = base * RATES.SAR_TO_YER;
    else yer = base;

    return {
      YER: formatNumber(yer),
      USD: formatNumber(yer / RATES.USD_TO_YER),
      SAR: formatNumber(yer / RATES.SAR_TO_YER),
    };
  }, [item]);

  useEffect(() => {
    if (!item?.isAuction || !item?.auctionEnd) return;

    const tick = () => {
      const now = new Date();
      const end = new Date(item.auctionEnd);
      const diff = end - now;
      if (diff <= 0) return setTimeLeft("انتهى المزاد");

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}ي ${hours}س ${minutes}د`);
    };

    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [item?.isAuction, item?.auctionEnd]);

  const img =
    (item?.images && item.images.length ? item.images[0] : "") ||
    item?.image ||
    "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <article
      onClick={onOpen}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
    >
      <div className="h-48 relative overflow-hidden bg-gray-200">
        <img src={img} alt={item?.title || ""} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {item?.isAuction && (
            <div className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-black flex items-center gap-1">
              <Icons.Hammer /> مزاد
            </div>
          )}
          <div className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1">
            <Icons.MapPin /> {item?.city || "—"}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-black text-gray-900 line-clamp-1 mb-2">{item?.title || "بدون عنوان"}</h3>

        {item?.isAuction && (
          <div className="mb-2 bg-red-50 border border-red-100 p-2 rounded-lg text-center">
            <div className="text-[11px] text-red-700 font-black">{timeLeft || "..."}</div>
          </div>
        )}

        <div className="bg-blue-50 rounded-xl p-3 space-y-1">
          <div className="text-blue-900 font-black text-lg">
            {formatNumber(item?.price)} <span className="text-xs">{item?.currency || "YER"}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-600 font-bold pt-1 border-t border-blue-200">
            <span>{prices.YER} ر.ي</span>
            <span>{prices.SAR} ر.س</span>
            <span>{prices.USD} $</span>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-3">
          <span className="flex items-center gap-1">
            <Icons.Eye /> {item?.views || 0}
          </span>
          <span className="text-blue-700 font-bold">تفاصيل</span>
        </div>
      </div>
    </article>
  );
};

// ----------------- Details Modal -----------------
const ListingDetailsModal = ({ open, item, onClose }) => {
  if (!open || !item) return null;

  const img =
    (item?.images && item.images.length ? item.images[0] : "") ||
    item?.image ||
    "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 left-3 bg-white/70 p-1 rounded-full">
          <Icons.X />
        </button>

        <img src={img} className="w-full h-64 object-cover rounded-xl mb-4" alt={item?.title || ""} />

        <h2 className="text-2xl font-black mb-2">{item?.title}</h2>

        <div className="text-xl font-black text-blue-600 mb-3">
          {formatNumber(item?.price)} {item?.currency}
        </div>

        <div className="flex gap-4 mb-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Icons.MapPin /> {item?.city || "—"}
          </span>
          <span className="flex items-center gap-1">
            <Icons.Eye /> {item?.views || 0}
          </span>
        </div>

        {item?.description && <p className="text-gray-700 whitespace-pre-line mb-5">{item.description}</p>}

        {item?.phone && (
          <a
            href={`tel:${item.phone}`}
            className="w-full block bg-green-600 text-white py-3 rounded-xl text-center font-black"
          >
            اتصال: {item.phone}
          </a>
        )}
      </div>
    </div>
  );
};

// ----------------- Add Listing Modal -----------------
const AddListingModal = ({ open, onClose, onAdd }) => {
  const [data, setData] = useState({
    title: "",
    price: "",
    currency: "YER",
    category: "cars",
    city: "",
    phone: "",
    description: "",
    image: "",
    images: [],
    coords: null,
    isAuction: false,
    auctionEnd: "",
  });

  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const addImageUrl = () => {
    const url = String(data.image || "").trim();
    if (!url) return;
    setData((p) => ({ ...p, images: [...(p.images || []), url].slice(0, 5), image: "" }));
  };

  const submit = async () => {
    if (!data.title || !data.price || !data.phone) {
      alert("الرجاء تعبئة: العنوان + السعر + رقم الهاتف");
      return;
    }
    setBusy(true);
    try {
      await onAdd({
        ...data,
        price: Number(data.price),
        image: (data.images && data.images[0]) || "",
      });
      onClose();
    } catch (e) {
      alert(e?.message || "حدث خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-black">إضافة إعلان</h2>
          <button onClick={onClose} className="p-1">
            <Icons.X />
          </button>
        </div>

        <div className="space-y-3 max-h-[70vh] overflow-y-auto p-1">
          <input
            className="w-full p-3 border rounded-xl"
            placeholder="العنوان"
            value={data.title}
            onChange={(e) => setData((p) => ({ ...p, title: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              className="w-full p-3 border rounded-xl"
              type="number"
              placeholder="السعر"
              value={data.price}
              onChange={(e) => setData((p) => ({ ...p, price: e.target.value }))}
            />
            <select
              className="w-full p-3 border rounded-xl"
              value={data.currency}
              onChange={(e) => setData((p) => ({ ...p, currency: e.target.value }))}
            >
              <option value="YER">ريال يمني</option>
              <option value="SAR">ريال سعودي</option>
              <option value="USD">دولار</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              className="w-full p-3 border rounded-xl"
              value={data.category}
              onChange={(e) => setData((p) => ({ ...p, category: e.target.value }))}
            >
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="w-full p-3 border rounded-xl"
              value={data.city}
              onChange={(e) => setData((p) => ({ ...p, city: e.target.value }))}
            >
              <option value="">المدينة</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <input
            className="w-full p-3 border rounded-xl"
            placeholder="رقم الهاتف"
            value={data.phone}
            onChange={(e) => setData((p) => ({ ...p, phone: e.target.value }))}
          />

          <textarea
            className="w-full p-3 border rounded-xl h-24"
            placeholder="الوصف"
            value={data.description}
            onChange={(e) => setData((p) => ({ ...p, description: e.target.value }))}
          />

          <div className="border rounded-xl p-3">
            <div className="font-black mb-2 text-sm">صور (روابط) - اختياري (حتى 5)</div>
            <div className="flex gap-2">
              <input
                className="flex-1 p-2 border rounded-lg"
                placeholder="ضع رابط صورة ثم اضغط إضافة"
                value={data.image}
                onChange={(e) => setData((p) => ({ ...p, image: e.target.value }))}
              />
              <button onClick={addImageUrl} className="bg-blue-600 text-white px-3 rounded-lg font-black">
                إضافة
              </button>
            </div>

            {data.images?.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {data.images.map((u, i) => (
                  <img key={i} src={u} className="w-full h-20 object-cover rounded" alt="" />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
            <input
              type="checkbox"
              checked={data.isAuction}
              onChange={(e) => setData((p) => ({ ...p, isAuction: e.target.checked }))}
            />
            <span className="font-black text-sm">تفعيل المزاد</span>
          </div>

          {data.isAuction && (
            <div>
              <div className="text-xs font-bold mb-1">تاريخ انتهاء المزاد</div>
              <input
                type="datetime-local"
                className="w-full p-3 border rounded-xl"
                value={data.auctionEnd}
                onChange={(e) => setData((p) => ({ ...p, auctionEnd: e.target.value }))}
              />
            </div>
          )}

          <div className="font-black text-sm mt-2">حدد الموقع على الخريطة (اختياري):</div>
          <LocationPicker onPick={(coords) => setData((p) => ({ ...p, coords }))} />
        </div>

        <button
          onClick={submit}
          disabled={busy}
          className="w-full bg-yellow-400 text-black py-3 rounded-xl font-black mt-4"
        >
          {busy ? "جاري النشر..." : "نشر الإعلان"}
        </button>
      </div>
    </div>
  );
};

// ----------------- Main HomePage -----------------
export default function HomePage() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [view, setView] = useState("home"); // home | map
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");

  const [authOpen, setAuthOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsub();
  }, []);

  // Listings realtime
  useEffect(() => {
    const qy = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setListings(data);
      },
      () => {}
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const s = normalizeText(search);
    return listings.filter((l) => {
      const okCat = activeCat === "all" || l.category === activeCat;
      if (!okCat) return false;
      if (!s) return true;
      const t = normalizeText(l.title);
      const c = normalizeText(l.city);
      return t.includes(s) || c.includes(s);
    });
  }, [listings, activeCat, search]);

  const openDetails = async (item) => {
    setSelected(item);
    setDetailsOpen(true);
    try {
      await updateDoc(doc(db, "listings", item.id), { views: increment(1) });
    } catch {}
  };

  const addListing = async (data) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    await addDoc(collection(db, "listings"), {
      ...data,
      userId: user.uid,
      userEmail: user.email || "",
      views: 0,
      createdAt: serverTimestamp(),
    });
  };

  const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="header-compact text-white shadow-lg">
        <div className="container mx-auto px-4 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div onClick={() => setView("home")} className="cursor-pointer">
              <Logo />
            </div>

            <div className="flex gap-2 items-center">
              <button onClick={toggleDarkMode} className="p-2 bg-white/20 rounded-full">
                ☀️
              </button>

              <button
                onClick={() => (user ? setAddOpen(true) : setAuthOpen(true))}
                className="p-2 bg-yellow-400 text-black rounded-full shadow"
                title="إضافة إعلان"
              >
                <Icons.Plus />
              </button>

              {user ? (
                <button
                  onClick={() => signOut(auth)}
                  className="px-3 py-2 bg-white/20 rounded-full text-sm font-black"
                  title="تسجيل خروج"
                >
                  خروج
                </button>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="px-3 py-2 bg-white/20 rounded-full text-sm font-black"
                >
                  دخول
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في الإعلانات..."
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-100 outline-none focus:bg-white focus:text-gray-900 transition pr-10"
            />
            <span className="absolute right-3 top-3 text-white/80">
              <Icons.Search />
            </span>
          </div>
        </div>
      </header>

      {/* Categories */}
      {view === "home" && (
        <div className="category-scroll-container sticky top-[100px] z-10">
          {CATEGORIES.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`flex flex-col items-center min-w-[60px] cursor-pointer ${
                activeCat === c.id ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <div className={`p-3 rounded-xl mb-1 ${activeCat === c.id ? "bg-blue-100" : "bg-gray-100"}`}>
                <c.icon />
              </div>
              <span className="text-[10px] font-bold">{c.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main */}
      <main className="container mx-auto px-4 py-4">
        {view === "map" ? (
          <div className="h-[70vh] rounded-xl overflow-hidden border relative">
            <MainMap items={filtered} />
            <button
              onClick={() => setView("home")}
              className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-full shadow"
              title="إغلاق الخريطة"
            >
              <Icons.X />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((l) => (
              <ListingCard key={l.id} item={l} onOpen={() => openDetails(l)} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-gray-500 py-20 col-span-full">لا توجد إعلانات</div>
            )}
          </div>
        )}
      </main>

      {/* Floating Map Button */}
      <button
        onClick={() => setView(view === "map" ? "home" : "map")}
        className="fixed bottom-6 left-6 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 font-black"
      >
        {view === "map" ? (
          <>
            <Icons.Grid /> قائمة
          </>
        ) : (
          <>
            <Icons.Map /> خريطة
          </>
        )}
      </button>

      {/* Modals */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <AddListingModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addListing}
      />

      <ListingDetailsModal
        open={detailsOpen}
        item={selected}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
}
