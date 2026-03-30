// ========== প্রোফাইল ভিউ সিস্টেম ==========
// গল্প দেখলে অটো প্রোফাইল ভিউ হিসেবে চিহ্নিত হবে

class ProfileViewTracker {
  constructor() {
    this.trackedStories = new Set();
    this.loadTracked();
  }
  
  // ট্র্যাক করা গল্প লোড
  loadTracked() {
    const saved = localStorage.getItem('profile_viewed_stories');
    if (saved) {
      const arr = JSON.parse(saved);
      arr.forEach(id => this.trackedStories.add(id));
    }
  }
  
  // ট্র্যাক করা গল্প সেভ
  saveTracked() {
    localStorage.setItem('profile_viewed_stories', JSON.stringify([...this.trackedStories]));
  }
  
  // গল্প ভিউ ট্র্যাক করুন
  trackStory(storyId, story) {
    if (!this.trackedStories.has(storyId)) {
      this.trackedStories.add(storyId);
      this.saveTracked();
      
      // গল্পে প্রোফাইল ভিউ মার্ক করুন
      let stories = JSON.parse(localStorage.getItem('published_stories') || '[]');
      const index = stories.findIndex(s => s.id === storyId);
      if (index !== -1) {
        stories[index].profileViewed = true;
        stories[index].profileViewedAt = Date.now();
        localStorage.setItem('published_stories', JSON.stringify(stories));
        console.log(`👁️ প্রোফাইল ভিউ ট্র্যাক: ${story.title}`);
      }
      return true;
    }
    return false;
  }
  
  // গল্প দেখেছে কিনা চেক
  isStoryViewed(storyId) {
    return this.trackedStories.has(storyId);
  }
  
  // কোন গল্প ৩ দিন পর ডিলিট হবে চেক
  willBeDeleted(story) {
    const isOld = (Date.now() - story.createdAt) > (3 * 24 * 60 * 60 * 1000);
    const hasProfileView = story.profileViewed === true;
    return isOld && !hasProfileView;
  }
  
  // প্রোফাইল ভিউ স্ট্যাটাস
  getProfileViewStats() {
    const stories = JSON.parse(localStorage.getItem('published_stories') || '[]');
    const viewed = stories.filter(s => s.profileViewed === true);
    const notViewed = stories.filter(s => !s.profileViewed);
    const willDelete = stories.filter(s => this.willBeDeleted(s));
    
    return {
      total: stories.length,
      viewed: viewed.length,
      notViewed: notViewed.length,
      willDelete: willDelete.length,
      willDeleteList: willDelete.map(s => ({ id: s.id, title: s.title, createdAt: s.createdAt }))
    };
  }
}

// গ্লোবাল ইনস্ট্যান্স
window.profileViewTracker = new ProfileViewTracker();