"use client";

import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

// دالة تنسيق الأرقام
const formatNumber = (num) => Math.round(num).toLocaleString('en-US');

export default function ListingDetailsModal({ item, isOpen, onClose, isFavorited, onToggleFavorite, onRegisterView }) {
    const [activeImg, setActiveImg] = useState('');

    // تسجيل المشاهدة عند فتح المودال
    useEffect(() => {
        if (isOpen && item && item.id && onRegisterView) {
            onRegisterView(item.id);
        }
    }, [isOpen, item]);

    // تعيين الصورة الأولى كصورة افتراضية عند فتح إعلان جديد
    useEffect(() => {
        const imgs = (item && item.images && item.images.length) ? item.images : (item && item.image ? [item.image] : []);
        setActiveImg(imgs[0] || '');
    }, [item]);

    // إغلاق المودال عند الضغط على Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen || !item) return null;

    const images = (item.images && item.images.length) ? item.images : (item.image ? [item.image] : []);
    const priceLabel = `${formatNumber(item.price || 0)} ${item.currency || 'YER'}`;

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] dark:bg-gray-800 dark:text-gray-200 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start p-4 border-b dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white line-clamp-2">{item.title}</h2>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-4 items-center">
                            <span className="flex items-center gap-1"><Icons.Eye size={16} className="text-blue-500"/> {item.views || 0}</span>
                            <span className="flex items-center gap-1"><Icons.Star size={16} className="text-yellow-500"/> {item.likes || 0}</span>
                            {(item.locationText || item.city) && (
                                <span className="flex items-center gap-1"><Icons.MapPin size={16} className="text-red-500"/> {item.locationText || item.city}</span>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition dark:bg-gray-700 dark:text-gray-300"
                    >
                        <Icons.X size={20} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    
                    {/* Price & Favorite */}
                    <div className="flex gap-3 mb-6">
                        <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-3 text-center dark:bg-blue-900/20 dark:border-blue-800/30">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">السعر المطلوب</div>
                            <div className="text-2xl font-black text-blue-700 dark:text-blue-400">{priceLabel}</div>
                        </div>

                        <button
                            onClick={() => onToggleFavorite && onToggleFavorite(item.id)}
                            className={`px-6 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                                isFavorited 
                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {isFavorited ? <Icons.StarFilled size={20} /> : <Icons.Star size={20} />}
                            <span className="text-xs">{isFavorited ? 'مفضلة' : 'حفظ'}</span>
                        </button>
                    </div>

                    {/* Main Image */}
                    <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-3 border dark:border-gray-700 group">
                        {activeImg ? (
                            <img 
                                src={activeImg} 
                                alt="صورة الإعلان" 
                                className="w-full h-[300px] sm:h-[400px] object-contain bg-black/5" 
                            />
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-400">لا توجد صور</div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 snap-x">
                            {images.map((src, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImg(src)}
                                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all snap-start ${
                                        activeImg === src ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <img src={src} alt={`مصغرة ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    {item.description && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 dark:bg-gray-700/50 dark:border-gray-600">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">تفاصيل الإعلان</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line dark:text-gray-300 text-sm sm:text-base">
                                {item.description}
                            </p>
                        </div>
                    )}
                    
                    {/* Location Link */}
                    {(item.locationUrl) && (
                        <div className="mb-6">
                             <a 
                                href={item.locationUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 p-3 rounded-xl border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30"
                            >
                                <Icons.MapPin size={18} />
                                فتح الموقع على خرائط جوجل/OSM
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3">
                        {item.phone && (
                            <a 
                                href={`tel:${item.phone}`} 
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition active:scale-95"
                            >
                                <Icons.Phone size={20} />
                                <span>اتصال</span>
                            </a>
                        )}
                        
                        {item.isWhatsapp && item.phone && (
                            <a 
                                href={`https://wa.me/${item.phone.replace(/\D/g,'').replace(/^0+/, '967')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition active:scale-95"
                            >
                                <Icons.Whatsapp size={20} />
                                <span>واتساب</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
