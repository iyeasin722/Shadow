// ========== সুরক্ষা ইউটিলিটি ==========

// XSS প্রোটেকশন
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// SQL Injection প্রোটেকশন (Firebase এর জন্য)
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[;$'"]/g, '');
}

// CSRF টোকেন জেনারেট
function generateCSRFToken() {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  localStorage.setItem('csrf_token', token);
  return token;
}

function verifyCSRFToken(token) {
  const stored = localStorage.getItem('csrf_token');
  return stored === token;
}

// রেট লিমিটিং
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = new Map();
  }
  
  checkLimit(userId) {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    const recentRequests = userRequests.filter(t => now - t < this.timeWindow);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    return true;
  }
}

// ডাটা এনক্রিপশন (সিম্পল)
function simpleEncrypt(data) {
  return btoa(encodeURIComponent(data));
}

function simpleDecrypt(encrypted) {
  try {
    return decodeURIComponent(atob(encrypted));
  } catch (e) {
    return null;
  }
}

// সেশন ম্যানেজমেন্ট
class SessionManager {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000; // 30 মিনিট
    this.checkInterval = null;
  }
  
  startSession(userId) {
    const session = {
      userId: userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      token: generateCSRFToken()
    };
    localStorage.setItem(`session_${userId}`, JSON.stringify(session));
    this.startActivityCheck(userId);
    return session;
  }
  
  updateActivity(userId) {
    const session = localStorage.getItem(`session_${userId}`);
    if (session) {
      const parsed = JSON.parse(session);
      parsed.lastActivity = Date.now();
      localStorage.setItem(`session_${userId}`, JSON.stringify(parsed));
    }
  }
  
  isSessionValid(userId) {
    const session = localStorage.getItem(`session_${userId}`);
    if (!session) return false;
    
    const parsed = JSON.parse(session);
    const now = Date.now();
    
    if (now - parsed.lastActivity > this.sessionTimeout) {
      this.endSession(userId);
      return false;
    }
    return true;
  }
  
  endSession(userId) {
    localStorage.removeItem(`session_${userId}`);
    if (this.checkInterval) clearInterval(this.checkInterval);
  }
  
  startActivityCheck(userId) {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(() => {
      if (!this.isSessionValid(userId)) {
        alert("⏰ আপনার সেশন শেষ হয়েছে! দয়া করে আবার লগইন করুন।");
        window.location.href = "login.html";
      }
    }, 60000);
  }
}

// পাসওয়ার্ড শক্তি পরীক্ষক
function checkPasswordStrength(password) {
  let score = 0;
  let feedback = [];
  
  if (password.length >= 8) score += 20;
  else feedback.push("পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে");
  
  if (/[A-Z]/.test(password)) score += 20;
  else feedback.push("কমপক্ষে একটি বড় হাতের অক্ষর দিন");
  
  if (/[a-z]/.test(password)) score += 20;
  else feedback.push("কমপক্ষে একটি ছোট হাতের অক্ষর দিন");
  
  if (/[0-9]/.test(password)) score += 20;
  else feedback.push("কমপক্ষে একটি সংখ্যা দিন");
  
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  else feedback.push("কমপক্ষে একটি স্পেশাল ক্যারেক্টার দিন (!@#$%^&*)");
  
  return { score, feedback };
}

// অডিট লগ
class AuditLog {
  static async log(action, userId, details) {
    const logEntry = {
      id: Date.now(),
      action: action,
      userId: userId,
      details: details,
      ip: await getClientIP(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    let logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    logs.unshift(logEntry);
    // শুধু শেষ 1000 লগ রাখুন
    if (logs.length > 1000) logs = logs.slice(0, 1000);
    localStorage.setItem('audit_logs', JSON.stringify(logs));
  }
  
  static getLogs(userId = null) {
    let logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }
    return logs;
  }
}

// ক্লায়েন্ট IP পাওয়া
async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (e) {
    return 'unknown';
  }
}

// গ্লোবাল এক্সপোর্ট
window.escapeHtml = escapeHtml;
window.sanitizeInput = sanitizeInput;
window.generateCSRFToken = generateCSRFToken;
window.verifyCSRFToken = verifyCSRFToken;
window.RateLimiter = RateLimiter;
window.SessionManager = SessionManager;
window.checkPasswordStrength = checkPasswordStrength;
window.AuditLog = AuditLog;
window.simpleEncrypt = simpleEncrypt;
window.simpleDecrypt = simpleDecrypt;

console.log("🛡️ Security module loaded!");