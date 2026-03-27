const API_BASE_URL = "https://monivoza.onrender.com/api/v1";
const SESSION_TTL = 24 * 60 * 60 * 1000;

class ApiError extends Error {
  constructor(message, { status, code, body, details, url } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status ?? null;
    this.code = code ?? null;
    this.body = body ?? null;
    this.details = details ?? null;
    this.url = url ?? null;
  }
}

const createAuthService = () => {
  let token = localStorage.getItem("auth_token");
  let user = safeJsonParse(localStorage.getItem("user"));
  let authTimestamp = parseInt(localStorage.getItem("auth_timestamp"), 10) || null;

  function safeJsonParse(value) {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function persistAuth(nextToken, nextUser) {
    token = nextToken;
    user = nextUser;
    authTimestamp = Date.now();

    localStorage.setItem("auth_token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    localStorage.setItem("auth_timestamp", authTimestamp.toString());
  }

  function clearAuth() {
    token = null;
    user = null;
    authTimestamp = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth_timestamp");
  }

  function getAuthHeaders(extraHeaders = {}) {
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    };
  }

  async function fetchWithTimeout(url, options = {}, timeout = 20000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: "cors",
      });
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new ApiError("Request timed out. Please check your network and try again.", {
          code: "REQUEST_TIMEOUT",
          url,
        });
      }

      throw new ApiError("Unable to reach the server. Please check your internet connection and try again.", {
        code: "NETWORK_ERROR",
        url,
      });
    } finally {
      clearTimeout(id);
    }
  }

  async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }

    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  function extractMessage(body) {
    if (!body) return null;
    if (typeof body === "string") return body;

    return (
      body.message ||
      body.error ||
      body.details ||
      body.title ||
      null
    );
  }

  function fallbackMessageByStatus(status, defaultMessage) {
    switch (status) {
      case 400:
        return "The request is invalid. Please review the submitted information.";
      case 401:
        return "Your session has expired or you are not authenticated. Please sign in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource could not be found.";
      case 409:
        return "This request conflicts with the current state of the resource.";
      case 422:
        return "The submitted data could not be processed. Please correct the highlighted values and try again.";
      case 429:
        return "Too many requests were made. Please wait a moment and try again.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "The server encountered an error while processing your request. Please try again shortly.";
      default:
        return defaultMessage;
    }
  }

  async function handleResponse(response, defaultMessage) {
    const body = await parseResponse(response);

    if (!response.ok) {
      if (response.status === 401) {
        clearAuth();
      }

      const message =
        extractMessage(body) || fallbackMessageByStatus(response.status, defaultMessage);

      throw new ApiError(message, {
        status: response.status,
        code: body?.code,
        details: body?.errors || body?.details || null,
        body,
        url: response.url,
      });
    }

    return body;
  }

  function requireAuth() {
    if (!token) {
      throw new ApiError("Not authenticated", { status: 401, code: "AUTH_REQUIRED" });
    }
  }

  function normalizeCollectionResponse(body) {
    if (Array.isArray(body)) return body;
    if (Array.isArray(body?.data)) return body.data;
    if (Array.isArray(body?.items)) return body.items;
    if (Array.isArray(body?.results)) return body.results;
    if (Array.isArray(body?.accounts)) return body.accounts;
    if (Array.isArray(body?.loans)) return body.loans;
    if (Array.isArray(body?.transactions)) return body.transactions;
    if (Array.isArray(body?.repayments)) return body.repayments;
    if (Array.isArray(body?.users)) return body.users;
    return [];
  }

  function normalizeEntityResponse(body) {
    if (body && typeof body === "object") {
      return body.data || body.account || body.loan || body.transaction || body.user || body;
    }
    return body;
  }

  async function request(path, { method = "GET", body, headers, timeout } = {}, defaultMessage = "Request failed") {
    const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
      method,
      headers: getAuthHeaders(headers),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }, timeout);

    return handleResponse(response, defaultMessage);
  }

  async function publicRequest(path, { method = "GET", body, headers, timeout } = {}, defaultMessage = "Request failed") {
    const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }, timeout);

    return handleResponse(response, defaultMessage);
  }

  async function login(email, password) {
    const body = normalizeEntityResponse(
      await publicRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      }, "Login failed")
    );

    if (!body?.token || !body?.user) {
      throw new ApiError("Login response is missing authentication details.", {
        code: "INVALID_LOGIN_RESPONSE",
      });
    }

    persistAuth(body.token, body.user);
    return body;
  }

  async function register(userData) {
    const payload = {
      ...userData,
      first_name: userData.first_name ?? userData.firstName,
      last_name: userData.last_name ?? userData.lastName,
    };
    delete payload.confirmPassword;

    return publicRequest("/auth/register", {
      method: "POST",
      body: payload,
    }, "Registration failed");
  }

  async function getUser() {
    requireAuth();
    const body = await request("/auth/me", {}, "Failed to fetch current user");
    const normalizedUser = normalizeEntityResponse(body);
    user = normalizedUser;
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    return normalizedUser;
  }

  function logout() {
    clearAuth();
  }

  function isAuthenticated() {
    if (!token) return false;

    if (authTimestamp && Date.now() - authTimestamp > SESSION_TTL) {
      clearAuth();
      return false;
    }

    return true;
  }

  function getToken() {
    return token;
  }

  function getCurrentUser() {
    return user;
  }

  async function getAccounts() {
    requireAuth();
    return normalizeCollectionResponse(
      await request("/accounts", {}, "Failed to fetch accounts")
    );
  }

  async function getCurrentAccount() {
    requireAuth();
    return normalizeEntityResponse(
      await request("/accounts/current", {}, "Failed to fetch current account")
    );
  }

  async function setCurrentAccount(accountId) {
    requireAuth();
    return normalizeEntityResponse(
      await request("/accounts/current", {
        method: "POST",
        body: { accountId, account_id: accountId },
      }, "Failed to set current account")
    );
  }

  async function getAccountById(accountId) {
    requireAuth();
    return normalizeEntityResponse(
      await request(`/accounts/${accountId}`, {}, "Failed to fetch account details")
    );
  }

  async function getAccountBalance(accountId) {
    requireAuth();
    return normalizeEntityResponse(
      await request(`/accounts/${accountId}/balance`, {}, "Failed to fetch account balance")
    );
  }

  async function lookupAccount(accountNumber) {
    requireAuth();
    return normalizeEntityResponse(
      await request(`/accounts/lookup/${accountNumber}`, {}, "Failed to lookup account")
    );
  }

  async function createAccount(accountData) {
    requireAuth();
    const payload = {
      ...accountData,
      initial_deposit: accountData.initial_deposit ?? accountData.initialDeposit,
    };

    return normalizeEntityResponse(
      await request("/accounts", {
        method: "POST",
        body: payload,
      }, "Failed to create account")
    );
  }

  async function getAllUsers() {
    requireAuth();
    return normalizeCollectionResponse(
      await request("/admin/users", {}, "Failed to fetch users")
    );
  }

  async function getPendingLoans() {
    requireAuth();
    return normalizeCollectionResponse(
      await request("/admin/loans/pending", {}, "Failed to fetch pending loans")
    );
  }

  async function getDashboardStats() {
    requireAuth();
    return normalizeEntityResponse(
      await request("/admin/dashboard/stats", {}, "Failed to fetch dashboard statistics")
    );
  }

  async function updateUserStatus(userId, status) {
    requireAuth();
    return normalizeEntityResponse(
      await request(`/admin/users/${userId}/status`, {
        method: "PUT",
        body: { status },
      }, "Failed to update user status")
    );
  }

  async function rejectLoan(loanId, payload = {}) {
    requireAuth();
    return normalizeEntityResponse(
      await request(`/admin/loans/${loanId}/reject`, {
        method: "PUT",
        body: {
          ...payload,
          rejection_reason: payload.rejection_reason ?? payload.reason,
        },
      }, "Failed to reject loan")
    );
  }

  async function disburseLoan(loanId, payload = {}) {
    requireAuth();
    return normalizeEntityResponse(
      await request(`/admin/loans/${loanId}/disburse`, {
        method: "PUT",
        body: {
          ...payload,
          account_id: payload.account_id ?? payload.accountId,
        },
      }, "Failed to disburse loan")
    );
  }

  async function approveLoan(loanId, payload = {}) {
    requireAuth();
    return normalizeEntityResponse(
      await request(`/admin/loans/${loanId}/approve`, {
        method: "PUT",
        body: {
          ...payload,
          interest_rate: payload.interest_rate ?? payload.interestRate,
        },
      }, "Failed to approve loan")
    );
  }

  async function getLoans() {
    requireAuth();
    return normalizeCollectionResponse(
      await request("/loans", {}, "Failed to fetch loans")
    );
  }

  async function getLoanDetails(loanId) {
    requireAuth();
    return normalizeEntityResponse(
      await request(`/loans/${loanId}`, {}, "Failed to fetch loan details")
    );
  }

  async function getLoanRepayments(loanId) {
    requireAuth();
    return normalizeCollectionResponse(
      await request(`/loans/${loanId}/repayments`, {}, "Failed to fetch loan repayments")
    );
  }

  async function repayLoan(loanId, repaymentData) {
    requireAuth();
    return normalizeEntityResponse(
      await request(`/loans/${loanId}/repay`, {
        method: "POST",
        body: repaymentData,
      }, "Failed to repay loan")
    );
  }

  async function applyForLoan(loanData) {
    requireAuth();
    return normalizeEntityResponse(
      await request("/loans/apply", {
        method: "POST",
        body: loanData,
      }, "Failed to apply for loan")
    );
  }

  async function getTransactions() {
    requireAuth();
    return normalizeCollectionResponse(
      await request("/transactions", {}, "Failed to fetch transactions")
    );
  }

  async function withdraw(withdrawData) {
    requireAuth();
    return normalizeEntityResponse(
      await request("/transactions/withdraw", {
        method: "POST",
        body: {
          ...withdrawData,
          account_id: withdrawData.account_id ?? withdrawData.accountId,
        },
      }, "Failed to withdraw funds")
    );
  }

  async function transfer(transferData) {
    requireAuth();
    return normalizeEntityResponse(
      await request("/transactions/transfer", {
        method: "POST",
        body: {
          ...transferData,
          account_id: transferData.account_id ?? transferData.accountId,
          destination_account_number:
            transferData.destination_account_number ?? transferData.destinationAccountNumber,
        },
      }, "Failed to transfer funds")
    );
  }

  async function deposit(depositData) {
    requireAuth();
    return normalizeEntityResponse(
      await request("/transactions/deposit", {
        method: "POST",
        body: {
          ...depositData,
          account_id: depositData.account_id ?? depositData.accountId,
        },
      }, "Failed to deposit funds")
    );
  }

  return {
    SESSION_TTL,
    ApiError,
    login,
    register,
    logout,
    isAuthenticated,
    getToken,
    getCurrentUser,
    getUser,
    getAccounts,
    getCurrentAccount,
    setCurrentAccount,
    getAccountById,
    getAccountBalance,
    lookupAccount,
    createAccount,
    getAllUsers,
    getPendingLoans,
    getDashboardStats,
    updateUserStatus,
    rejectLoan,
    disburseLoan,
    approveLoan,
    getLoans,
    getLoanDetails,
    getLoanRepayments,
    repayLoan,
    applyForLoan,
    getTransactions,
    withdraw,
    transfer,
    deposit,
  };
};

export { ApiError };
export const authService = createAuthService();
