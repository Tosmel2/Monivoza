const API_BASE_URL = "https://monivoza.onrender.com";

export const createAuthService = () => {
  let token = localStorage.getItem("auth_token");
  let user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // ==============================
  // Helpers
  // ==============================

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  });

  const fetchWithTimeout = async (url, options = {}, timeout = 20000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (err) {
      if (err?.name === "AbortError") {
        throw new Error(
          "Request timed out. Please check your network and try again."
        );
      }
      throw err;
    } finally {
      clearTimeout(id);
    }
  };

  const parseResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch (err) {
        // ignore JSON parse errors and fall back to text
      }
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      return text;
    }
  };

  const handleResponse = async (response, defaultMessage) => {
    const body = await parseResponse(response);

    if (!response.ok) {
      const message =
        (body && typeof body === "object" && body.message) ||
        body ||
        defaultMessage;
      throw new Error(message);
    }

    return body;
  };

  const requireAuth = () => {
    if (!token) throw new Error("Not authenticated");
  };

  // ==============================
  // Auth Methods
  // ==============================

  const login = async (email, password) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      mode: "cors",
    });

    const body = await handleResponse(response, "Login failed");

    token = body.token;
    user = body.user;

    localStorage.setItem("auth_token", body.token);
    localStorage.setItem("user", JSON.stringify(body.user));

    return body;
  };

  const register = async (userData) => {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        mode: "cors",
      }
    );

    return handleResponse(response, "Registration failed");
  };

  const logout = () => {
    token = null;
    user = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  };

  const isAuthenticated = () => !!token;
  const getToken = () => token;
  const getCurrentUser = () => user;

  // ==============================
  // Example Protected Method
  // ==============================

  const getAccounts = async () => {
    requireAuth();

    const response = await fetchWithTimeout(`${API_BASE_URL}/accounts`, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response, "Failed to fetch accounts");
  };

  const applyForLoan = async (loanData) => {
    requireAuth();

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/loans/apply`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(loanData),
      }
    );

    return handleResponse(response, "Failed to apply for loan");
  };

  // ==============================
  // Return Public API
  // ==============================

  return {
    login,
    register,
    logout,
    isAuthenticated,
    getToken,
    getCurrentUser,
    getAccounts,
    applyForLoan,
  };
};

// Singleton (like your original export)
export const authService = createAuthService();


// // Custom API Service

// // const API_BASE_URL = import.meta.env.DEV ? "/api" : "https://monivoza.onrender.com";
// const API_BASE_URL ="https://monivoza.onrender.com";

// class AuthService {
//   constructor() {
//     this.token = localStorage.getItem("auth_token");
//     this.user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
//   }

//   // Helper method to get headers with auth
//   getAuthHeaders() {
//     return {
//       "Content-Type": "application/json",
//       ...(this.token && { Authorization: `Bearer ${this.token}` }),
//     };
//   }

//   // wrapper around fetch that aborts after `timeout` ms
//   async fetchWithTimeout(url, options = {}, timeout = 20000) {
//     const controller = new AbortController();
//     const id = setTimeout(() => controller.abort(), timeout);
//     const opts = { ...options, signal: controller.signal };
//     try {
//       const res = await fetch(url, opts);
//       return res;
//     } catch (err) {
//       // Normalize AbortError to a friendly message so callers can show it
//       if (err && err.name === "AbortError") {
//         throw new Error("Request timed out. Please check your network and try again.");
//       }
//       throw err;
//     } finally {
//       clearTimeout(id);
//     }
//   }

//   // Authentication methods
//   // helper used internally to read either JSON or plain text
//   async parseResponse(response) {
//     const contentType = response.headers.get("content-type") || "";
//     if (contentType.includes("application/json")) {
//       // try to parse JSON, but guard against invalid/malformed bodies
//       try {
//         return await response.json();
//       } catch {
//         // fall through to text fallback
//       }
//     }

//     // not JSON or parsing failed – consume as text
//     const text = await response.text();
//     // attempt to convert a text response that *looks* like JSON
//     try {
//       return JSON.parse(text);
//     } catch {
//       return text;
//     }
//   }

//   async login(email, password) {
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//         mode: "cors", // explicit, though it's the default for cross‑origin calls
//       });

//       // parse body once; parseResponse will return an object or a string
//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         // some servers return a bare string; try to pull a message property
//         const message =
//           (body && typeof body === "object" && body.message) ||
//           body ||
//           "Login failed";
//         throw new Error(message);
//       }

//       // success path expects object with token/user
//       this.token = body.token;
//       this.user = body.user;
//       localStorage.setItem("auth_token", body.token);
//       localStorage.setItem("user", JSON.stringify(body.user));
//       return body;
//     } catch (error) {
//       // re‑throw with a plain message so the component can display it
//       throw new Error(error.message || "Login failed");
//     }
//   }

//   async register(userData) {
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(userData),
//         mode: "cors",
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message =
//           (body && typeof body === "object" && body.message) ||
//           body ||
//           "Registration failed";
//         throw new Error(message);
//       }

//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async verify() {
//     if (!this.token) return false;
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/auth/verify`, {
//         headers: { Authorization: `Bearer ${this.token}` },
//       });
//       return response.ok;
//     } catch {
//       return false;
//     }
//   }

//   async getUser() {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
//         headers: { Authorization: `Bearer ${this.token}` },
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to fetch user";
//         throw new Error(message);
//       }

//       this.user = body;
//       localStorage.setItem("user", JSON.stringify(body));
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   logout() {
//     this.token = null;
//     this.user = null;
//     localStorage.removeItem("auth_token");
//     localStorage.removeItem("user");
//   }

//   getToken() {
//     return this.token;
//   }

//   getCurrentUser() {
//     return this.user;
//   }

//   isAuthenticated() {
//     return !!this.token;
//   }

//   // Account methods
//   async getAccounts() {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/accounts`, {
//         headers: this.getAuthHeaders(),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to fetch accounts";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async getAccountBalance(accountId) {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/accounts/${accountId}/balance`, {
//         headers: this.getAuthHeaders(),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to fetch account balance";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async createAccount(accountData) {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/accounts`, {
//         method: "POST",
//         headers: this.getAuthHeaders(),
//         body: JSON.stringify(accountData),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to create account";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   // Admin methods
//   async getAllUsers() {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/users`, {
//         headers: this.getAuthHeaders(),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to fetch users";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async getPendingLoans() {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/loans/pending`, {
//         headers: this.getAuthHeaders(),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to fetch pending loans";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async getDashboardStats() {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/dashboard/stats`, {
//         headers: this.getAuthHeaders(),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to fetch dashboard stats";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async updateUserStatus(userId, status) {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/users/${userId}/status`, {
//         method: "PUT",
//         headers: this.getAuthHeaders(),
//         body: JSON.stringify({ status }),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to update user status";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async rejectLoan(loanId) {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/loans/${loanId}/reject`, {
//         method: "PUT",
//         headers: this.getAuthHeaders(),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to reject loan";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async disburseLoan(loanId) {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/loans/${loanId}/disburse`, {
//         method: "PUT",
//         headers: this.getAuthHeaders(),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to disburse loan";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async approveLoan(loanId) {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/loans/${loanId}/approve`, {
//         method: "PUT",
//         headers: this.getAuthHeaders(),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to approve loan";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   // Loan methods
//   async getLoans() {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/loans`, {
//         headers: this.getAuthHeaders(),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to fetch loans";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async getLoanDetails(loanId) {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/loans/${loanId}`, {
//         headers: this.getAuthHeaders(),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to fetch loan details";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async getLoanRepayments(loanId) {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/loans/${loanId}/repayments`, {
//         headers: this.getAuthHeaders(),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to fetch loan repayments";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async repayLoan(loanId, repaymentData) {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/loans/${loanId}/repay`, {
//         method: "POST",
//         headers: this.getAuthHeaders(),
//         body: JSON.stringify(repaymentData),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to repay loan";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async applyForLoan(loanData) {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/loans/apply`, {
//         method: "POST",
//         headers: this.getAuthHeaders(),
//         body: JSON.stringify(loanData),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to apply for loan";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   // Transaction methods
//   async getTransactions() {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/transactions`, {
//         headers: this.getAuthHeaders(),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to fetch transactions";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async withdraw(withdrawData) {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/transactions/withdraw`, {
//         method: "POST",
//         headers: this.getAuthHeaders(),
//         body: JSON.stringify(withdrawData),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to withdraw";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async transfer(transferData) {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/transactions/transfer`, {
//         method: "POST",
//         headers: this.getAuthHeaders(),
//         body: JSON.stringify(transferData),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to transfer";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }

//   async deposit(depositData) {
//     if (!this.token) throw new Error("Not authenticated");
//     try {
//       const response = await this.fetchWithTimeout(`${API_BASE_URL}/transactions/deposit`, {
//         method: "POST",
//         headers: this.getAuthHeaders(),
//         body: JSON.stringify(depositData),
//       });

//       const body = await this.parseResponse(response);
//       if (!response.ok) {
//         const message = (body && typeof body === "object" && body.message) || body || "Failed to deposit";
//         throw new Error(message);
//       }
//       return body;
//     } catch (error) {
//       throw new Error(error.message);
//     }
//   }
// }

// export const authService = new AuthService();
