document.addEventListener('DOMContentLoaded', () => {
    const initialUsers = [
        { id: 1, name: 'Viswesh', avatar: 'https://picsum.photos/seed/viswesh/200', lastMessage: 'Hey, how are you?', timestamp: '10:42 AM', online: true, unreadCount: 2 },
        { id: 2, name: 'Raju', avatar: 'https://picsum.photos/seed/raju/200', lastMessage: 'Let\'s catch up later.', timestamp: '9:30 AM', online: false, unreadCount: 0 },
        { id: 3, name: 'Harish', avatar: 'https://picsum.photos/seed/harish/200', lastMessage: 'Sounds good!', timestamp: 'Yesterday', online: true, unreadCount: 0 },
        { id: 4, name: 'Shreya', avatar: 'https://picsum.photos/seed/shreya/200', lastMessage: 'Can you send the file?', timestamp: 'Yesterday', online: false, unreadCount: 1 },
    ];

    const initialMessages = [
        { id: 1, sender: 'other', text: 'Hey, how have you been?', timestamp: '10:30 AM', avatar: 'https://picsum.photos/seed/viswesh/200' },
        { id: 2, sender: 'me', text: 'I\'m doing great, thanks for asking! Just working on a new project. How about you?', timestamp: '10:31 AM', avatar: 'https://picsum.photos/seed/me/200' },
        { id: 3, sender: 'other', text: 'That sounds exciting! I\'m good, just planning a trip for next month.', timestamp: '10:32 AM', avatar: 'https://picsum.photos/seed/viswesh/200' },
        { id: 4, sender: 'me', text: 'A trip? Awesome! Where are you headed?', timestamp: '10:32 AM', avatar: 'https://picsum.photos/seed/me/200' },
    ];

    let users = initialUsers;
    let messages = initialMessages;
    let activeUser = users[0];
    let sidebarOpen = false;

    const userListEl = document.getElementById('user-list');
    const chatWindowEl = document.getElementById('chat-window');
    const sidebarEl = document.getElementById('sidebar');
    const sidebarToggleEl = document.getElementById('sidebar-toggle');
    const sidebarOverlayEl = document.getElementById('sidebar-overlay');
    const mobileHeaderAvatarEl = document.getElementById('mobile-header-avatar');

    const renderUsers = () => {
        if (!userListEl) return;
        userListEl.innerHTML = '';
        users.forEach(user => {
            const isActive = activeUser && user.id === activeUser.id;
            const userLi = document.createElement('li');
            userLi.className = 'cursor-pointer';
            userLi.setAttribute('role', 'button');
            // FIX: Convert boolean to string for setAttribute, as it expects a string.
            userLi.setAttribute('aria-pressed', String(isActive));
            userLi.innerHTML = `
                <div class="flex items-center p-4 transition-colors duration-200 ${isActive ? 'bg-blue-500 bg-opacity-10' : 'hover:bg-slate-200'}">
                    <div class="relative">
                        <img src="${user.avatar}" alt="${user.name}" class="w-12 h-12 rounded-full" />
                        ${user.online ? '<span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white" title="Online"></span>' : ''}
                    </div>
                    <div class="ml-4 flex-1 overflow-hidden">
                        <p class="font-semibold ${isActive ? 'text-slate-800' : 'text-slate-700'}">${user.name}</p>
                        <p class="text-sm text-slate-500 truncate">${user.lastMessage}</p>
                    </div>
                    <div class="text-right text-sm text-slate-400">
                        <p class="mb-1.5">${user.timestamp}</p>
                        ${user.unreadCount > 0 ? `<span class="inline-block bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5">${user.unreadCount}</span>` : ''}
                    </div>
                </div>
            `;
            userLi.addEventListener('click', () => handleUserSelect(user));
            userListEl.appendChild(userLi);
        });
    };

    const renderChat = () => {
        if (!chatWindowEl || !activeUser) {
            if (chatWindowEl) {
                chatWindowEl.innerHTML = `
                    <div class="flex-1 flex items-center justify-center text-slate-500">
                        <p>Select a chat to start messaging</p>
                    </div>
                `;
            }
            return;
        }

        chatWindowEl.innerHTML = `
            <header class="flex items-center justify-between p-4 border-b border-slate-200 shadow-sm hidden md:flex">
                <div class="flex items-center">
                    <img src="${activeUser.avatar}" alt="${activeUser.name}" class="w-10 h-10 rounded-full mr-3" />
                    <div>
                        <h2 class="text-lg font-semibold">${activeUser.name}</h2>
                        <p class="text-sm ${activeUser.online ? 'text-green-500' : 'text-slate-400'}">
                            ${activeUser.online ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
                <button class="p-2 rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="More options">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                </button>
            </header>
            
            <div id="message-list-container" class="flex-1 overflow-y-auto p-6 bg-slate-50">
                <div id="message-list" class="flex flex-col"></div>
            </div>

            <div class="p-4 bg-white border-t border-slate-200">
                <form id="message-form" class="flex items-center space-x-4">
                    <button type="button" class="p-2 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Attach file">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    </button>
                    <input id="message-input" type="text" placeholder="Type a message..." class="flex-1 px-4 py-2 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" autocomplete="off" />
                    <button id="send-button" type="submit" class="p-3 bg-blue-500 text-white rounded-full disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors" aria-label="Send message">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
        `;
        
        renderMessages();

        if(mobileHeaderAvatarEl) {
            mobileHeaderAvatarEl.innerHTML = `<img src="${activeUser.avatar}" alt="${activeUser.name}" class="w-10 h-10 rounded-full"/>`;
        }

        const messageForm = document.getElementById('message-form');
        // FIX: Add correct types for DOM elements to access their properties safely.
        const messageInput = document.getElementById('message-input') as HTMLInputElement | null;
        const sendButton = document.getElementById('send-button') as HTMLButtonElement | null;

        if (messageForm) messageForm.addEventListener('submit', handleSendMessage);
        
        if (messageInput && sendButton) {
            messageInput.addEventListener('input', (e) => {
                // FIX: Cast event target to HTMLInputElement to access the 'value' property.
                const hasText = (e.target as HTMLInputElement).value.trim().length > 0;
                // FIX: Access 'disabled' property on the correctly typed HTMLButtonElement.
                sendButton.disabled = !hasText;
            });
            // FIX: Access 'disabled' and 'value' properties on correctly typed elements.
            sendButton.disabled = !messageInput.value.trim();
        }
    };

    const renderMessages = () => {
        const messageList = document.getElementById('message-list');
        if (!messageList) return;
        
        messageList.innerHTML = messages.map(message => {
            const isMe = message.sender === 'me';
            return `
                <div class="flex items-end gap-3 my-2 ${isMe ? 'justify-end' : 'justify-start'}">
                    ${!isMe ? `<img src="${message.avatar}" alt="Avatar" class="w-8 h-8 rounded-full" />` : ''}
                    <div class="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${isMe ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}">
                        <p class="text-sm">${message.text}</p>
                        <p class="text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-slate-500'} text-right">${message.timestamp}</p>
                    </div>
                    ${isMe ? `<img src="${message.avatar}" alt="My Avatar" class="w-8 h-8 rounded-full" />` : ''}
                </div>
            `;
        }).join('');

        const container = document.getElementById('message-list-container');
        if (container) container.scrollTop = container.scrollHeight;
    };

    const handleUserSelect = (user: typeof users[0]) => {
        activeUser = user;
        renderUsers();
        renderChat();
        toggleSidebar(false);
    };

    const handleSendMessage = (e: Event) => {
        e.preventDefault();
        // FIX: Cast to HTMLInputElement and add a null check to safely access 'value'.
        const messageInput = document.getElementById('message-input') as HTMLInputElement | null;
        if (!messageInput) return;

        const text = messageInput.value.trim();

        if (text === '') return;

        const newMessage = {
            id: messages.length + 1,
            text,
            sender: 'me',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: 'https://picsum.photos/seed/me/200',
        };
        messages.push(newMessage);
        renderMessages();
        messageInput.value = '';
        messageInput.focus();
        // FIX: Cast to HTMLButtonElement and add a null check to safely access 'disabled'.
        const sendButton = document.getElementById('send-button') as HTMLButtonElement | null;
        if (sendButton) {
            sendButton.disabled = true;
        }

        setTimeout(() => {
            const replyMessage = {
                id: messages.length + 2,
                text: 'That\'s interesting! Tell me more.',
                sender: 'other',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                avatar: activeUser?.avatar || '',
            };
            messages.push(replyMessage);
            renderMessages();
        }, 1500);
    };

    // FIX: Make the 'forceState' parameter optional to allow calling with no arguments.
    const toggleSidebar = (forceState?: boolean) => {
        const shouldBeOpen = typeof forceState === 'boolean' ? forceState : !sidebarOpen;
        if (sidebarEl && sidebarOverlayEl) {
            if (shouldBeOpen) {
                sidebarEl.classList.remove('-translate-x-full');
                sidebarOverlayEl.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            } else {
                sidebarEl.classList.add('-translate-x-full');
                sidebarOverlayEl.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        }
        sidebarOpen = shouldBeOpen;
    };
    
    renderUsers();
    renderChat();

    if (sidebarToggleEl) sidebarToggleEl.addEventListener('click', () => toggleSidebar());
    if (sidebarOverlayEl) sidebarOverlayEl.addEventListener('click', () => toggleSidebar(false));
});
