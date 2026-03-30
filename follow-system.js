// ========== ফলো সিস্টেম ==========
class FollowSystem {
    constructor() {
        this.followers = JSON.parse(localStorage.getItem('followers') || '{}');
        this.following = JSON.parse(localStorage.getItem('following') || '{}');
    }
    
    // ইউজারকে ফলো করুন
    follow(userId, currentUserId) {
        if (!this.followers[userId]) this.followers[userId] = [];
        if (!this.following[currentUserId]) this.following[currentUserId] = [];
        
        if (!this.followers[userId].includes(currentUserId)) {
            this.followers[userId].push(currentUserId);
            this.following[currentUserId].push(userId);
            
            this.save();
            return true;
        }
        return false;
    }
    
    // আনফলো করুন
    unfollow(userId, currentUserId) {
        if (this.followers[userId]) {
            this.followers[userId] = this.followers[userId].filter(id => id !== currentUserId);
        }
        if (this.following[currentUserId]) {
            this.following[currentUserId] = this.following[currentUserId].filter(id => id !== userId);
        }
        this.save();
        return true;
    }
    
    // ফলোয়ার কাউন্ট
    getFollowersCount(userId) {
        return this.followers[userId]?.length || 0;
    }
    
    // ফলোইং কাউন্ট
    getFollowingCount(userId) {
        return this.following[userId]?.length || 0;
    }
    
    // চেক করা ফলো করে কিনা
    isFollowing(userId, currentUserId) {
        return this.followers[userId]?.includes(currentUserId) || false;
    }
    
    save() {
        localStorage.setItem('followers', JSON.stringify(this.followers));
        localStorage.setItem('following', JSON.stringify(this.following));
    }
}

// ========== মেসেজ সিস্টেম ==========
class MessageSystem {
    constructor() {
        this.messages = JSON.parse(localStorage.getItem('messages') || '[]');
    }
    
    // মেসেজ পাঠান
    sendMessage(fromUserId, toUserId, text, imageUrl = null, videoUrl = null) {
        const message = {
            id: Date.now(),
            from: fromUserId,
            to: toUserId,
            text: text,
            image: imageUrl,
            video: videoUrl,
            read: false,
            createdAt: Date.now()
        };
        this.messages.push(message);
        this.save();
        
        // নোটিফিকেশন
        this.sendNotification(toUserId, fromUserId, text);
        return message;
    }
    
    // ইউজারের মেসেজ পাওয়া
    getUserMessages(userId, withUserId = null) {
        let userMessages = this.messages.filter(m =>
            m.from === userId || m.to === userId
        );
        
        if (withUserId) {
            userMessages = userMessages.filter(m =>
                (m.from === userId && m.to === withUserId) ||
                (m.from === withUserId && m.to === userId)
            );
        }
        
        return userMessages.sort((a, b) => a.createdAt - b.createdAt);
    }
    
    // কনভার্সেশন লিস্ট
    getConversations(userId) {
        const conversations = {};
        this.messages.forEach(msg => {
            const otherId = msg.from === userId ? msg.to : msg.from;
            if (!conversations[otherId] || conversations[otherId].createdAt < msg.createdAt) {
                conversations[otherId] = {
                    userId: otherId,
                    lastMessage: msg.text,
                    lastMessageTime: msg.createdAt,
                    unread: !msg.read && msg.to === userId ? 1 : 0
                };
            }
        });
        return Object.values(conversations).sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    }
    
    // মেসেজ রিড মার্ক
    markAsRead(messageIds, userId) {
        this.messages = this.messages.map(msg => {
            if (msg.to === userId && messageIds.includes(msg.id)) {
                msg.read = true;
            }
            return msg;
        });
        this.save();
    }
    
    sendNotification(toUserId, fromUserId, text) {
        let notifications = JSON.parse(localStorage.getItem(`notifications_${toUserId}`) || '[]');
        notifications.unshift({
            id: Date.now(),
            type: 'message',
            title: '💬 নতুন মেসেজ',
            message: `নতুন মেসেজ: ${text.substring(0, 50)}...`,
            from: fromUserId,
            date: Date.now(),
            isRead: false
        });
        localStorage.setItem(`notifications_${toUserId}`, JSON.stringify(notifications));
    }
    
    save() {
        localStorage.setItem('messages', JSON.stringify(this.messages));
    }
}

window.followSystem = new FollowSystem();
window.messageSystem = new MessageSystem();