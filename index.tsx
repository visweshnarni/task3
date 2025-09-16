document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const initialChats = [
        { id: 'user1', type: 'user', name: 'Viswesh', avatar: 'https://picsum.photos/seed/viswesh/200', online: true, lastMessage: 'Hey, how are you?', timestamp: '10:42 AM', unreadCount: 2 },
        { id: 'group1', type: 'group', name: 'Tailwind Fans', avatar: ['https://picsum.photos/seed/userA/200', 'https://picsum.photos/seed/userB/200', 'https://picsum.photos/seed/userC/200'], lastMessage: 'Harish: Sounds good!', timestamp: 'Yesterday', unreadCount: 0 },
        { id: 'user2', type: 'user', name: 'Raju', avatar: 'https://picsum.photos/seed/raju/200', online: false, lastMessage: 'Let\'s catch up later.', timestamp: '9:30 AM', unreadCount: 0 },
        { id: 'user3', type: 'user', name: 'Harish', avatar: 'https://picsum.photos/seed/harish/200', online: true, lastMessage: 'You: I\'m in! What time?', timestamp: 'Yesterday', unreadCount: 0 },
        { id: 'user4', type: 'user', name: 'Shreya', avatar: 'https://picsum.photos/seed/shreya/200', online: false, lastMessage: 'Can you send the file?', timestamp: 'Yesterday', unreadCount: 1 },
    ];

    const initialMessages = {
        'user1': [
            { id: 1, senderId: 'user1', text: 'Hey, how have you been?', timestamp: '10:30 AM' },
            { id: 2, senderId: 'me', text: 'I\'m doing great, thanks! How about you?', timestamp: '10:31 AM', status: 'read' },
            { id: 3, senderId: 'user1', text: 'That\'s exciting! I\'m good, just planning a trip.', timestamp: '10:32 AM' },
            { id: 4, senderId: 'me', text: 'A trip? Awesome!', timestamp: '10:32 AM', status: 'read' },
        ],
        'group1': [
            { id: 5, senderId: 'user3', senderName: 'Harish', text: 'Anyone up for a virtual co-working session tomorrow?', timestamp: '8:00 PM' },
            { id: 6, senderId: 'me', text: 'I\'m in! What time?', timestamp: '8:01 PM', status: 'delivered' },
            { id: 7, senderId: 'user4', senderName: 'Shreya', text: 'Me too! Morning works best for me.', timestamp: '8:05 PM' },
        ],
        'user2': [], 'user3': [], 'user4': []
    };
    
    const userAvatars = {
        'me': 'https://picsum.photos/seed/me/200',
        'user1': 'https://picsum.photos/seed/viswesh/200',
        'user2': 'https://picsum.photos/seed/raju/200',
        'user3': 'https://picsum.photos/seed/harish/200',
        'user4': 'https://picsum.photos/seed/shreya/200',
    };

    // --- STATE ---
    let state: any = {
        chats: initialChats,
        messages: initialMessages,
        activeChatId: null,
        sidebarOpen: false,
        theme: localStorage.getItem('theme') || 'light',
        isTyping: false,
        isLoading: false,
    };

    // --- DOM ELEMENTS ---
    const chatListEl = document.getElementById('chat-list');
    const chatWindowEl = document.getElementById('chat-window');
    const sidebarEl = document.getElementById('sidebar');
    const sidebarToggleEl = document.getElementById('sidebar-toggle');
    const sidebarOverlayEl = document.getElementById('sidebar-overlay');
    const mobileHeaderAvatarEl = document.getElementById('mobile-header-avatar');
    const mobileHeaderTitleEl = document.getElementById('mobile-header-title');
    const themeToggleEl = document.getElementById('theme-toggle');
    const emptyChatViewEl = document.getElementById('empty-chat-view');

    // --- ICONS ---
    const icons = {
        sun: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
        moon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
        check: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        checkAll: `<svg class="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 13l3 3 7-7"></path><path d="M17 13l-2.5-2.5"></path><path d="M14 16l-2.5-2.5"></path></svg>`,
        moreVertical: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>`,
        paperclip: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`,
        send: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
    };

    // --- RENDER FUNCTIONS ---
    const renderSidebar = () => {
        if (!chatListEl) return;
        chatListEl.innerHTML = state.chats.map((chat: any) => {
            const isActive = state.activeChatId === chat.id;
            let avatarHtml;
            if (chat.type === 'group') {
                avatarHtml = `
                    <div class="relative w-12 h-12 flex-shrink-0">
                        <img src="${chat.avatar[0]}" alt="${chat.name}" class="absolute w-8 h-8 rounded-full top-0 left-0 border-2 border-slate-50 dark:border-slate-900" />
                        <img src="${chat.avatar[1]}" alt="${chat.name}" class="absolute w-8 h-8 rounded-full bottom-0 right-0 border-2 border-slate-50 dark:border-slate-900 z-10" />
                        ${chat.avatar[2] ? `<img src="${chat.avatar[2]}" alt="${chat.name}" class="absolute w-8 h-8 rounded-full top-0 right-0 border-2 border-slate-50 dark:border-slate-900" />` : ''}
                    </div>`;
            } else {
                avatarHtml = `
                    <div class="relative flex-shrink-0">
                        <img src="${chat.avatar}" alt="${chat.name}" class="w-12 h-12 rounded-full" />
                        ${chat.online ? '<span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white" title="Online"></span>' : ''}
                    </div>`;
            }

            return `
                <li role="button" aria-pressed="${isActive}" data-chat-id="${chat.id}" class="chat-item cursor-pointer">
                    <div class="flex items-center p-4 transition-colors duration-200 ${isActive ? 'bg-blue-500/10' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}">
                        ${avatarHtml}
                        <div class="ml-4 flex-1 overflow-hidden">
                            <p class="font-semibold ${isActive ? 'text-slate-800 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}">${chat.name}</p>
                            <p class="text-sm text-slate-500 dark:text-slate-400 truncate">${chat.lastMessage}</p>
                        </div>
                        <div class="text-right text-sm text-slate-400">
                            <p class="mb-1.5">${chat.timestamp}</p>
                            ${chat.unreadCount > 0 ? `<span class="inline-block bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5">${chat.unreadCount}</span>` : ''}
                        </div>
                    </div>
                </li>`;
        }).join('');
        
        document.querySelectorAll('.chat-item').forEach(item => {
            // FIX: Cast item to HTMLElement to access dataset property.
            item.addEventListener('click', () => handleChatSelect((item as HTMLElement).dataset.chatId));
        });
    };

    const renderChatWindow = () => {
        if (!chatWindowEl) return;
        emptyChatViewEl.classList.add('hidden');

        if (state.isLoading) {
            chatWindowEl.innerHTML = `<div class="flex flex-1 items-center justify-center"><div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>`;
            return;
        }

        const activeChat = state.chats.find((c: any) => c.id === state.activeChatId);
        if (!activeChat) {
            emptyChatViewEl.classList.remove('hidden');
            chatWindowEl.innerHTML = '';
            chatWindowEl.appendChild(emptyChatViewEl);
            return;
        }

        chatWindowEl.innerHTML = `
            <header class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 shadow-sm md:flex bg-white dark:bg-slate-800/50">
                <div class="flex items-center">
                    <img src="${Array.isArray(activeChat.avatar) ? activeChat.avatar[1] : activeChat.avatar}" alt="${activeChat.name}" class="w-10 h-10 rounded-full mr-3" />
                    <div>
                        <h2 class="text-lg font-semibold dark:text-slate-200">${activeChat.name}</h2>
                        <p class="text-sm ${activeChat.online ? 'text-green-500' : 'text-slate-400'}">
                            ${activeChat.type === 'user' ? (activeChat.online ? 'Online' : 'Offline') : `${activeChat.name} Group`}
                        </p>
                    </div>
                </div>
                <button class="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="More options">
                    ${icons.moreVertical}
                </button>
            </header>
            
            <div id="message-list-container" class="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
                <div id="message-list" class="flex flex-col"></div>
            </div>

            <div class="p-4 bg-white dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                <form id="message-form" class="flex items-center space-x-4">
                    <button type="button" class="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Attach file">
                        ${icons.paperclip}
                    </button>
                    <input id="message-input" type="text" placeholder="Type a message..." class="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 dark:text-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" autocomplete="off" />
                    <button id="send-button" type="submit" class="p-3 bg-blue-500 text-white rounded-full disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors" aria-label="Send message" disabled>
                        ${icons.send}
                    </button>
                </form>
            </div>
        `;
        
        renderMessages();
        updateMobileHeader();
        setupMessageInput();
    };

    const renderMessages = () => {
        const messageList = document.getElementById('message-list');
        if (!messageList || !state.activeChatId) return;

        const messages = state.messages[state.activeChatId] || [];
        const activeChat = state.chats.find((c: any) => c.id === state.activeChatId);

        messageList.innerHTML = messages.map((message: any) => {
            const isMe = message.senderId === 'me';
            
            let statusIcon = '';
            if (isMe && message.status) {
                const iconColor = message.status === 'read' ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500';
                statusIcon = `<span class="ml-1.5 ${iconColor}">
                    ${message.status === 'sent' ? icons.check : icons.checkAll}
                </span>`;
            }
            
            const senderAvatar = isMe ? userAvatars.me : (userAvatars[message.senderId] || 'https://picsum.photos/seed/default/200');

            return `
                <div class="flex items-end gap-3 my-2 ${isMe ? 'flex-row-reverse' : ''}">
                    ${!isMe ? `<img src="${senderAvatar}" alt="Avatar" class="w-8 h-8 rounded-full flex-shrink-0" />` : ''}
                    <div class="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${isMe ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'}">
                        ${!isMe && activeChat.type === 'group' ? `<p class="text-xs font-semibold mb-1 text-blue-400">${message.senderName}</p>` : ''}
                        <p class="text-sm">${message.text}</p>
                        <p class="text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-slate-500 dark:text-slate-400'} text-right flex items-center justify-end">
                            ${message.timestamp} ${statusIcon}
                        </p>
                    </div>
                </div>
            `;
        }).join('');

        if (state.isTyping) {
            messageList.innerHTML += `
                <div id="typing-indicator" class="flex items-end gap-3 my-2">
                    <div class="px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 rounded-bl-none">
                        <div class="typing-indicator">
                            <span class="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full inline-block"></span>
                            <span class="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full inline-block"></span>
                            <span class="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full inline-block"></span>
                        </div>
                    </div>
                </div>`;
        }

        const container = document.getElementById('message-list-container');
        if (container) container.scrollTop = container.scrollHeight;
    };
    
    // --- EVENT HANDLERS & HELPERS ---
    const handleChatSelect = (chatId: string) => {
        state.isLoading = true;
        renderChatWindow();

        setTimeout(() => {
            state.activeChatId = chatId;
            state.isLoading = false;
            renderSidebar();
            renderChatWindow();
            toggleSidebar(false);
        }, 300);
    };
    
    const handleSendMessage = (e: Event) => {
        e.preventDefault();
        // FIX: Cast to HTMLInputElement to access 'value' property.
        const messageInput = document.getElementById('message-input') as HTMLInputElement;
        const text = messageInput.value.trim();
        if (text === '' || !state.activeChatId) return;

        const messageId = Date.now();
        const newMessage = {
            id: messageId,
            senderId: 'me',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
        };

        if (!state.messages[state.activeChatId]) state.messages[state.activeChatId] = [];
        state.messages[state.activeChatId].push(newMessage);
        renderMessages();
        messageInput.value = '';
        messageInput.focus();
        // FIX: Cast to HTMLButtonElement to access 'disabled' property.
        (document.getElementById('send-button') as HTMLButtonElement).disabled = true;

        setTimeout(() => updateMessageStatus(messageId, 'delivered'), 1000);
        
        setTimeout(() => {
            state.isTyping = true;
            renderMessages();
        }, 1500);

        setTimeout(() => {
            updateAllMessagesAsRead();
            const activeChat = state.chats.find((c: any) => c.id === state.activeChatId);
            const replyMessage = {
                id: Date.now() + 1,
                senderId: activeChat.type === 'group' ? 'user3' : activeChat.id,
                senderName: activeChat.type === 'group' ? 'Harish' : undefined,
                text: 'That\'s interesting! Tell me more.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            state.isTyping = false;
            state.messages[state.activeChatId].push(replyMessage);
            renderMessages();
        }, 3000);
    };

    const setupMessageInput = () => {
        const messageForm = document.getElementById('message-form');
        const messageInput = document.getElementById('message-input') as HTMLInputElement;
        const sendButton = document.getElementById('send-button') as HTMLButtonElement;
        
        if (messageForm) messageForm.addEventListener('submit', handleSendMessage);
        if (messageInput && sendButton) {
            messageInput.addEventListener('input', (e) => {
                // FIX: Cast e.target to HTMLInputElement to access 'value' property.
                sendButton.disabled = (e.target as HTMLInputElement).value.trim().length === 0;
            });
        }
    };
    
    const updateMessageStatus = (messageId: number, status: string) => {
        const message = state.messages[state.activeChatId]?.find((m: any) => m.id === messageId);
        if (message) {
            message.status = status;
            renderMessages();
        }
    };

    const updateAllMessagesAsRead = () => {
        state.messages[state.activeChatId]?.forEach((m: any) => {
            if (m.senderId === 'me' && m.status !== 'read') m.status = 'read';
        });
    };

    const updateMobileHeader = () => {
        const activeChat = state.chats.find((c: any) => c.id === state.activeChatId);
        if (mobileHeaderAvatarEl && mobileHeaderTitleEl) {
            if (activeChat) {
                mobileHeaderTitleEl.textContent = activeChat.name;
                mobileHeaderAvatarEl.innerHTML = `<img src="${Array.isArray(activeChat.avatar) ? activeChat.avatar[1] : activeChat.avatar}" alt="${activeChat.name}" class="w-10 h-10 rounded-full"/>`;
            } else {
                mobileHeaderTitleEl.textContent = 'Chats';
                mobileHeaderAvatarEl.innerHTML = '';
            }
        }
    };

    // FIX: Make forceState parameter optional to allow calling toggleSidebar without arguments.
    const toggleSidebar = (forceState?: boolean) => {
        const shouldBeOpen = typeof forceState === 'boolean' ? forceState : !state.sidebarOpen;
        if (sidebarEl && sidebarOverlayEl) {
            sidebarEl.classList.toggle('-translate-x-full', !shouldBeOpen);
            sidebarOverlayEl.classList.toggle('hidden', !shouldBeOpen);
            document.body.style.overflow = shouldBeOpen ? 'hidden' : '';
        }
        state.sidebarOpen = shouldBeOpen;
    };
    
    const initTheme = () => {
        if (document.documentElement.classList.contains('dark')) {
            state.theme = 'dark';
        }
        if (themeToggleEl) {
            themeToggleEl.innerHTML = state.theme === 'dark' ? icons.sun : icons.moon;
        }
    };

    const toggleTheme = () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', state.theme);
        document.documentElement.classList.toggle('dark', state.theme === 'dark');
        themeToggleEl.innerHTML = state.theme === 'dark' ? icons.sun : icons.moon;
    };

    // --- INITIALIZATION ---
    const init = () => {
        initTheme();
        renderSidebar();
        renderChatWindow();
        
        // Event Listeners
        if (sidebarToggleEl) sidebarToggleEl.addEventListener('click', () => toggleSidebar());
        if (sidebarOverlayEl) sidebarOverlayEl.addEventListener('click', () => toggleSidebar(false));
        if (themeToggleEl) themeToggleEl.addEventListener('click', toggleTheme);
    };

    init();
});