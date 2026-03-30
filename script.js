// ==================== ছায়াবর্তী - মাস্টার জাভাস্ক্রিপ্ট ====================

// গ্লোবাল ভেরিয়েবল
let currentUser = null;

// পেজ লোড হলে
document.addEventListener('DOMContentLoaded', function() {
  checkLoginStatus();
  initTheme();
  initLanguage();
});

// লগইন স্ট্যাটাস চেক
function checkLoginStatus() {
  const saved = localStorage.getItem('shadowverse_user');
  if (saved) {
    currentUser = JSON.parse(saved);
    updateUIForLoggedInUser();
  } else {
    updateUIForLoggedOutUser();
  }
}

// লগইন ইউজারের UI আপডেট
function updateUIForLoggedInUser() {
  const loginBtns = document.querySelectorAll('#loginBtn, #navLoginBtn');
  const registerBtns = document.querySelectorAll('#registerBtn, #navRegisterBtn');
  const logoutBtns = document.querySelectorAll('#logoutBtn');
  const dashboardBtns = document.querySelectorAll('#dashboardBtn');
  
  loginBtns.forEach(btn => { if (btn) btn.style.display = 'none'; });
  registerBtns.forEach(btn => { if (btn) btn.style.display = 'none'; });
  logoutBtns.forEach(btn => { if (btn) btn.style.display = 'inline-block'; });
  dashboardBtns.forEach(btn => { if (btn) btn.style.display = 'inline-block'; });
}

// লগআউট ইউজারের UI আপডেট
function updateUIForLoggedOutUser() {
  const loginBtns = document.querySelectorAll('#loginBtn, #navLoginBtn');
  const registerBtns = document.querySelectorAll('#registerBtn, #navRegisterBtn');
  const logoutBtns = document.querySelectorAll('#logoutBtn');
  const dashboardBtns = document.querySelectorAll('#dashboardBtn');
  
  loginBtns.forEach(btn => { if (btn) btn.style.display = 'inline-block'; });
  registerBtns.forEach(btn => { if (btn) btn.style.display = 'inline-block'; });
  logoutBtns.forEach(btn => { if (btn) btn.style.display = 'none'; });
  dashboardBtns.forEach(btn => { if (btn) btn.style.display = 'none'; });
}

// লগআউট ফাংশন
function logout() {
  localStorage.removeItem('shadowverse_user');
  currentUser = null;
  updateUIForLoggedOutUser();
  alert("লগআউট সফল!");
  window.location.href = "index.html";
}

// থিম টগল
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ল্যাঙ্গুয়েজ
function initLanguage() {
  const savedLang = localStorage.getItem('language') || 'bn';
  const langSelect = document.getElementById('languageSelect');
  if (langSelect) {
    langSelect.value = savedLang;
    langSelect.addEventListener('change', function(e) {
      localStorage.setItem('language', e.target.value);
      location.reload();
    });
  }
}

// নোটিফিকেশন
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        display: flex;
        gap: 10px;
        align-items: center;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// পৃষ্ঠা গণনা (প্রতি পৃষ্ঠা = 2000 শব্দ)
function calculatePages(content) {
  const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const pages = Math.max(1, Math.ceil(words / 2000));
  return { words, pages, earnings: pages * 10 };
}

// পয়েন্ট গণনা
function calculatePoints(action, value = null) {
  const points = {
    'write_story': 100,
    'read_page': 1,
    'comment': 5,
    'like': 1,
    'daily_login': 5,
    'referral': 50
  };
  return points[action] || 0;
}

// ওয়ালেট ফাংশন
async function getWalletBalance(userEmail) {
  const wallet = JSON.parse(localStorage.getItem(`wallet_${userEmail}`) || '{"balance":0}');
  return wallet.balance;
}

async function addToWallet(userEmail, amount, description) {
  let wallet = JSON.parse(localStorage.getItem(`wallet_${userEmail}`) || '{"balance":0,"transactions":[]}');
  wallet.balance += amount;
  wallet.transactions = wallet.transactions || [];
  wallet.transactions.push({
    type: 'add',
    amount: amount,
    description: description,
    date: Date.now()
  });
  localStorage.setItem(`wallet_${userEmail}`, JSON.stringify(wallet));
  return wallet.balance;
}

async function deductFromWallet(userEmail, amount, description) {
  let wallet = JSON.parse(localStorage.getItem(`wallet_${userEmail}`) || '{"balance":0,"transactions":[]}');
  if (wallet.balance < amount) return false;
  wallet.balance -= amount;
  wallet.transactions = wallet.transactions || [];
  wallet.transactions.push({
    type: 'deduct',
    amount: amount,
    description: description,
    date: Date.now()
  });
  localStorage.setItem(`wallet_${userEmail}`, JSON.stringify(wallet));
  return true;
}

// গল্প সংরক্ষণ
function saveStory(story) {
  let stories = JSON.parse(localStorage.getItem('published_stories') || '[]');
  stories.unshift(story);
  localStorage.setItem('published_stories', JSON.stringify(stories));
  return story;
}

// সব গল্প পাওয়া
function getAllStories() {
  return JSON.parse(localStorage.getItem('published_stories') || '[]');
}

// ইউজার সংরক্ষণ
function saveUser(user) {
  let users = JSON.parse(localStorage.getItem('shadowverse_users') || '[]');
  const index = users.findIndex(u => u.email === user.email);
  if (index !== -1) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem('shadowverse_users', JSON.stringify(users));
  localStorage.setItem('shadowverse_user', JSON.stringify(user));
  return user;
}

// গল্প ডিলিট
function deleteStory(storyId) {
  let stories = JSON.parse(localStorage.getItem('published_stories') || '[]');
  stories = stories.filter(s => s.id !== storyId);
  localStorage.setItem('published_stories', JSON.stringify(stories));
}

// ইউজার পাওয়া
function getUserByEmail(email) {
  const users = JSON.parse(localStorage.getItem('shadowverse_users') || '[]');
  return users.find(u => u.email === email);
}

// রেফারেল কোড জেনারেট
function generateReferralCode(email) {
  return btoa(email).substring(0, 8).toUpperCase();
}

// ডিসকাউন্ট গণনা
function getDiscountFromPoints(points) {
  if (points >= 50000) return 25;
  if (points >= 25000) return 20;
  if (points >= 10000) return 15;
  if (points >= 5000) return 10;
  if (points >= 1000) return 5;
  return 0;
}

// ইউটিলিটি ফাংশন
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('bn-BD');
}

function formatNumber(num) {
  return num.toLocaleString();
}

function truncateText(text, length = 100) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// গ্লোবাল ফাংশন এক্সপোজ
window.logout = logout;
window.showNotification = showNotification;
window.calculatePages = calculatePages;
window.getWalletBalance = getWalletBalance;
window.addToWallet = addToWallet;
window.deductFromWallet = deductFromWallet;
window.saveStory = saveStory;
window.getAllStories = getAllStories;
window.saveUser = saveUser;
window.deleteStory = deleteStory;
window.getUserByEmail = getUserByEmail;
window.generateReferralCode = generateReferralCode;
window.getDiscountFromPoints = getDiscountFromPoints;