"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebaseClient';
import { 
  collection, doc, onSnapshot, orderBy, query, 
  setDoc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { Icons } from './Icons';

export default function ChatSystem({ currentUser, listing, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const chatId = useRef(null);
    const messagesEndRef = useRef(null);
    
    // التمرير التلقائي لآخر رسالة
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!currentUser || !listing) return;

        // إنشاء معرف فريد للمحادثة يعتمد على معرفي المستخدمين ومعرف الإعلان
        // الترتيب (.sort) يضمن أن يكون المعرف هو نفسه بغض النظر عمن فتح المحادثة أولاً
        const participants = [currentUser.uid, listing.userId].sort();
        chatId.current = `chat_${participants.join('_')}_${listing.id}`;

        // الاشتراك في المحادثة لجلب الرسائل فورياً
        const messagesRef = collection(db, 'chats', chatId.current, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            setLoading(false);
        }, error => {
            console.error('Error fetching messages:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, listing]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !currentUser || !listing) return;
        
        try {
            const messageData = {
                text: newMessage,
                senderId: currentUser.uid,
                senderName: currentUser.displayName || currentUser.email,
                timestamp: serverTimestamp(),
                read: false
            };

            // 1. تحديث أو إنشاء وثيقة المحادثة الرئيسية (للقوائم وآخر رسالة)
            // نستخدم setDoc مع merge: true لعدم مسح البيانات القديمة إن وجدت
            await setDoc(doc(db, 'chats', chatId.current), {
                participants: [currentUser.uid, listing.userId],
                listingId: listing.id,
                listingTitle: listing.title,
                lastMessage: newMessage,
                lastMessageTime: serverTimestamp(),
                updatedAt: serverTimestamp()
            }, { merge: true });

            // 2. إضافة الرسالة إلى المجموعة الفرعية messages
            await addDoc(collection(db, 'chats', chatId.current, 'messages'), messageData);

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('حدث خطأ في إرسال الرسالة: ' + error.message);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-[3000] flex items-center justify-center p-4 backdrop-blur-sm" 
            role="dialog" 
            aria-modal="true"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl w-full max-w-md h-[80vh] flex flex-col shadow-2xl overflow-hidden dark:bg-gray-800 animate-fadeIn">
                {/* Header */}
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center dark:bg-gray-700/50 dark:border-gray-700">
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{listing.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            محادثة مباشرة
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-200 rounded-full transition dark:hover:bg-gray-600 dark:text-gray-300"
                        aria-label="إغلاق المحادثة"
                    >
                        <Icons.X size={20}/>
                    </button>
                </div>
                
                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100 dark:bg-gray-900 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">
                            <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                            <p>جاري تحميل المحادثة...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Icons.Message size={48} className="mx-auto mb-3 opacity-20" />
                            <p>ابدأ المحادثة الآن</p>
                            <p className="text-sm text-gray-500 mt-2">اسأل البائع عن تفاصيل الإعلان</p>
                        </div>
                    ) : (
                        messages.map(msg => {
                            const isMe = msg.senderId === currentUser.uid;
                            return (
                                <div 
                                    key={msg.id} 
                                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                >
                                    <div 
                                        className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                                            isMe 
                                            ? 'bg-blue-600 text-white rounded-tl-none' 
                                            : 'bg-white text-gray-800 rounded-tr-none border dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {msg.timestamp?.toDate 
                                            ? new Date(msg.timestamp.toDate()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) 
                                            : 'الآن'}
                                    </span>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="p-3 bg-white border-t dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex gap-2 items-center">
                        <input 
                            value={newMessage} 
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="اكتب رسالتك..." 
                            className="flex-1 border border-gray-300 rounded-full py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500" 
                            aria-label="رسالة جديدة" 
                        />
                        <button 
                            onClick={sendMessage} 
                            disabled={!newMessage.trim()}
                            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 shadow-md dark:bg-blue-500"
                            aria-label="إرسال الرسالة"
                        >
                            <Icons.Send size={20} className={newMessage.trim() ? "ml-0.5" : ""} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
