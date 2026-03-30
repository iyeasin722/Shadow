// ========== অটো ক্লিনআপ সিস্টেম ==========
// ৩ দিন পর পুরানো ডাটা অটো ডিলিট হবে

const AUTO_CLEANUP_DAYS = 3; // ৩ দিন
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // ২৪ ঘন্টা পর পর চেক করবে

class AutoCleanup {
  constructor() {
    this.lastCleanup = localStorage.getItem('last_cleanup');
    this.runCleanup();
    this.startInterval();
  }
  
  // ক্লিনআপ চালান
  runCleanup() {
    const now = Date.now();
    const cutoffTime = now - (AUTO_CLEANUP_DAYS * 24 * 60 * 60 * 1000);
    
    console.log(`🧹 ক্লিনআপ চলছে... কাটঅফ: ${new Date(cutoffTime).toLocaleString()}`);
    
    // 1. পুরানো গল্প ডিলিট
    let stories = JSON.parse(localStorage.getItem('published_stories') || '[]');
    let deletedStories = 0;
    let keptStories = [];
    
    stories.forEach(story => {
      // যদি ৩ দিনের বেশি পুরানো হয় এবং প্রোফাইল ভিউ না থাকে
      const isOld = story.createdAt < cutoffTime;
      const hasProfileView = story.profileViewed === true;
      
      if (isOld && !hasProfileView) {
        deletedStories++;
        console.log(`🗑️ ডিলিট: ${story.title} (${new Date(story.createdAt).toLocaleDateString()})`);
      } else {
        keptStories.push(story);
      }
    });
    
    if (deletedStories > 0) {
      localStorage.setItem('published_stories', JSON.stringify(keptStories));
      console.log(`✅ ${deletedStories}টি পুরানো গল্প ডিলিট করা হয়েছে`);
    }
    
    // 2. পুরানো টেম্প ফাইল ডিলিট
    let tempFiles = JSON.parse(localStorage.getItem('temp_uploads') || '[]');
    let keptTemp = tempFiles.filter(f => f.createdAt > cutoffTime);
    if (keptTemp.length !== tempFiles.length) {
      localStorage.setItem('temp_uploads', JSON.stringify(keptTemp));
      console.log(`✅ ${tempFiles.length - keptTemp.length}টি টেম্প ফাইল ডিলিট`);
    }
    
    // 3. পুরানো নোটিফিকেশন ডিলিট (৩০ দিন পরে)
    const users = JSON.parse(localStorage.getItem('shadowverse_users') || '[]');
    users.forEach(user => {
      let notifications = JSON.parse(localStorage.getItem(`notifications_${user.email}`) || '[]');
      let oldCount = notifications.filter(n => n.date < cutoffTime).length;
      notifications = notifications.filter(n => n.date >= cutoffTime);
      if (oldCount > 0) {
        localStorage.setItem(`notifications_${user.email}`, JSON.stringify(notifications));
      }
    });
    
    // 4. পুরানো ওয়ালেট ট্রানজেকশন লগ ডিলিট
    users.forEach(user => {
      let wallet = JSON.parse(localStorage.getItem(`wallet_${user.email}`) || '{"balance":0,"transactions":[]}');
      let oldTransactions = wallet.transactions.filter(t => t.date < cutoffTime).length;
      wallet.transactions = wallet.transactions.filter(t => t.date >= cutoffTime);
      if (oldTransactions > 0) {
        localStorage.setItem(`wallet_${user.email}`, JSON.stringify(wallet));
      }
    });
    
    localStorage.setItem('last_cleanup', now.toString());
    
    return { deletedStories, keptStories: keptStories.length };
  }
  
  startInterval() {
    setInterval(() => {
      this.runCleanup();
    }, CLEANUP_INTERVAL);
  }
  
  // ম্যানুয়ালি ক্লিনআপ চালান
  static manualCleanup() {
    const cleanup = new AutoCleanup();
    return cleanup.runCleanup();
  }
  
  // ডাটা স্ট্যাটাস দেখান
  static getStats() {
    const stories = JSON.parse(localStorage.getItem('published_stories') || '[]');
    const cutoffTime = Date.now() - (AUTO_CLEANUP_DAYS * 24 * 60 * 60 * 1000);
    const oldStories = stories.filter(s => s.createdAt < cutoffTime);
    const newStories = stories.filter(s => s.createdAt >= cutoffTime);
    
    return {
      totalStories: stories.length,
      newStories: newStories.length,
      oldStories: oldStories.length,
      lastCleanup: localStorage.getItem('last_cleanup'),
      cutoffDate: new Date(cutoffTime).toLocaleString()
    };
  }
}

// পেজ লোড হলে অটো ক্লিনআপ স্টার্ট
document.addEventListener('DOMContentLoaded', () => {
  if (!window.autoCleanupStarted) {
    window.autoCleanup = new AutoCleanup();
    window.autoCleanupStarted = true;
    console.log("🧹 অটো ক্লিনআপ সিস্টেম চালু হয়েছে (৩ দিন)");
  }
});