// Utility function to create page URLs
export const createPageUrl = (pageName) => {
  return `/${pageName}`;
};

// Utility function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Utility function to format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

// Utility function to validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Utility function to validate password
export const validatePassword = (password) => {
  return password.length >= 8;
};

// derive a human readable display name from a user object
export const getDisplayName = (user) => {
  if (!user) return "User";
  // try several common fields
  if (user.full_name) return user.full_name;
  const first = user.firstName || user.first_name || "";
  const last = user.lastName || user.last_name || "";
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;
  if (user.email) {
    // strip domain extension and any subaddress, return part before @
    const local = user.email.split("@")[0];
    return local || user.email;
  }
  return "User";
};

export const getFirstName = (user) => {
  const name = getDisplayName(user);
  // if display name contains email local part, it'll be returned already
  return name.split(" ")[0] || "User";
};

export const getInitials = (user) => {
  const name = getDisplayName(user);
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
