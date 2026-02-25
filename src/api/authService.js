// Custom API Service

const API_BASE_URL = import.meta.env.DEV ? "/api" : "https://monivoza.onrender.com";

class AuthService {
  constructor() {
    this.token = localStorage.getItem("auth_token");
    this.user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  }

  // Helper method to get headers with auth
  getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }

  // Authentication methods
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async verify() {
    if (!this.token) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getUser() {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch user");
      const data = await response.json();
      this.user = data;
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }

  getToken() {
    return this.token;
  }

  getCurrentUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.token;
  }

  // Account methods
  async getAccounts() {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/accounts`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch accounts");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAccountBalance(accountId) {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/balance`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch account balance");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createAccount(accountData) {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/accounts`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(accountData),
      });

      if (!response.ok) throw new Error("Failed to create account");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Admin methods
  async getAllUsers() {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch users");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getPendingLoans() {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/loans/pending`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch pending loans");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getDashboardStats() {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateUserStatus(userId, status) {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update user status");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async rejectLoan(loanId) {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/loans/${loanId}/reject`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to reject loan");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async disburseLoan(loanId) {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/loans/${loanId}/disburse`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to disburse loan");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async approveLoan(loanId) {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/loans/${loanId}/approve`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to approve loan");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Loan methods
  async getLoans() {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/loans`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch loans");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getLoanDetails(loanId) {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/loans/${loanId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch loan details");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getLoanRepayments(loanId) {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/loans/${loanId}/repayments`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch loan repayments");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async repayLoan(loanId, repaymentData) {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/loans/${loanId}/repay`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(repaymentData),
      });

      if (!response.ok) throw new Error("Failed to repay loan");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async applyForLoan(loanData) {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/loans/apply`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(loanData),
      });

      if (!response.ok) throw new Error("Failed to apply for loan");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Transaction methods
  async getTransactions() {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch transactions");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async withdraw(withdrawData) {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/withdraw`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(withdrawData),
      });

      if (!response.ok) throw new Error("Failed to withdraw");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async transfer(transferData) {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/transfer`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(transferData),
      });

      if (!response.ok) throw new Error("Failed to transfer");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deposit(depositData) {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/deposit`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(depositData),
      });

      if (!response.ok) throw new Error("Failed to deposit");
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export const authService = new AuthService();
