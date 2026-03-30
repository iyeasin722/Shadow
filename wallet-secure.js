// ========== সুরক্ষিত ওয়ালেট সিস্টেম ==========

class SecureWallet {
  constructor() {
    this.transactions = [];
    this.loadTransactions();
  }
  
  loadTransactions() {
    const saved = localStorage.getItem('secure_wallet_transactions');
    if (saved) {
      this.transactions = JSON.parse(saved);
    }
  }
  
  saveTransactions() {
    localStorage.setItem('secure_wallet_transactions', JSON.stringify(this.transactions));
  }
  
  // ট্রানজেকশন যোগ (এনক্রিপ্টেড)
  addTransaction(userId, type, amount, description, txId = null) {
    const transaction = {
      id: Date.now(),
      userId: userId,
      type: type, // 'add', 'withdraw', 'purchase', 'remove'
      amount: amount,
      description: simpleEncrypt(description),
      txId: txId ? simpleEncrypt(txId) : null,
      status: 'pending',
      timestamp: Date.now(),
      verifiedBy: null,
      verifiedAt: null
    };
    
    this.transactions.unshift(transaction);
    this.saveTransactions();
    AuditLog.log('wallet_transaction', userId, { type, amount, description });
    return transaction;
  }
  
  // ট্রানজেকশন ভেরিফাই (শুধু অ্যাডমিন)
  verifyTransaction(transactionId, adminId) {
    const index = this.transactions.findIndex(t => t.id === transactionId);
    if (index !== -1) {
      this.transactions[index].status = 'verified';
      this.transactions[index].verifiedBy = adminId;
      this.transactions[index].verifiedAt = Date.now();
      this.saveTransactions();
      
      // ব্যালেন্স আপডেট
      this.updateBalance(this.transactions[index].userId);
      return true;
    }
    return false;
  }
  
  // ট্রানজেকশন রিজেক্ট
  rejectTransaction(transactionId, adminId, reason) {
    const index = this.transactions.findIndex(t => t.id === transactionId);
    if (index !== -1) {
      this.transactions[index].status = 'rejected';
      this.transactions[index].verifiedBy = adminId;
      this.transactions[index].verifiedAt = Date.now();
      this.transactions[index].rejectionReason = simpleEncrypt(reason);
      this.saveTransactions();
      return true;
    }
    return false;
  }
  
  // ব্যালেন্স আপডেট
  updateBalance(userId) {
    const verifiedTransactions = this.transactions.filter(t =>
      t.userId === userId &&
      t.status === 'verified' &&
      t.type !== 'remove'
    );
    
    const removedTransactions = this.transactions.filter(t =>
      t.userId === userId &&
      t.type === 'remove' &&
      t.status === 'verified'
    );
    
    let balance = 0;
    verifiedTransactions.forEach(t => {
      if (t.type === 'add') balance += t.amount;
      if (t.type === 'withdraw') balance -= t.amount;
      if (t.type === 'purchase') balance -= t.amount;
    });
    
    removedTransactions.forEach(t => {
      balance -= t.amount;
    });
    
    if (balance < 0) balance = 0;
    
    // এনক্রিপ্টেড ব্যালেন্স সেভ
    localStorage.setItem(`secure_balance_${userId}`, simpleEncrypt(balance.toString()));
    return balance;
  }
  
  // ব্যালেন্স পাওয়া
  getBalance(userId) {
    const encrypted = localStorage.getItem(`secure_balance_${userId}`);
    if (encrypted) {
      const decrypted = simpleDecrypt(encrypted);
      return parseInt(decrypted) || 0;
    }
    return 0;
  }
  
  // ইউজারের ট্রানজেকশন
  getUserTransactions(userId) {
    return this.transactions.filter(t => t.userId === userId);
  }
  
  // পেন্ডিং ট্রানজেকশন (অ্যাডমিনের জন্য)
  getPendingTransactions() {
    return this.transactions.filter(t => t.status === 'pending');
  }
  
  // TxID ভেরিফিকেশন (সিমুলেটেড API)
  async verifyTxID(txnId, amount, number, method) {
    // এখানে bKash/Nagad API কল হবে
    console.log(`Verifying TxID: ${txnId} for ${amount} BDT via ${method}`);
    
    // সিমুলেটেড ভেরিফিকেশন
    // রিয়েল প্রোডাকশনে API কল করতে হবে
    return new Promise((resolve) => {
      setTimeout(() => {
        // TxID যাচাই (সিমুলেটেড)
        const isValid = txnId && txnId.length >= 8;
        resolve({ valid: isValid, message: isValid ? "TxID valid" : "Invalid TxID" });
      }, 1000);
    });
  }
}

// গ্লোবাল ইনস্ট্যান্স
window.secureWallet = new SecureWallet();