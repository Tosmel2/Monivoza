# Authentication Setup Guide

## Overview

Your Monivoza application now has a complete authentication system with Login and Registration pages. This guide explains how to integrate it with your backend API.

## Files Created

### Authentication Pages
- `src/pages/Login.jsx` - Login page with email/password authentication
- `src/pages/Register.jsx` - Registration page with form validation and password strength indicator

### UI Components
- `src/components/ui/button.jsx` - Reusable button component
- `src/components/ui/input.jsx` - Reusable input field component
- `src/components/ui/label.jsx` - Form label component
- `src/components/ui/checkbox.jsx` - Checkbox component
- `src/components/ui/card.jsx` - Card container components
- `src/components/ui/select.jsx` - Select dropdown component
- `src/components/ui/dialog.jsx` - Modal dialog component
- `src/components/ui/dropdown-menu.jsx` - Dropdown menu component
- `src/components/ui/avatar.jsx` - User avatar component
- `src/components/ui/toaster.jsx` - Toast notification container

### Authentication System
- `src/lib/AuthContext.jsx` - React Context for authentication state management
- `src/api/authService.js` - Custom authentication service for backend communication
- `src/lib/query-client.js` - React Query configuration
- `src/utils/index.js` - Utility functions (email validation, currency formatting, etc.)
- `src/lib/NavigationTracker.jsx` - Page navigation tracker
- `src/lib/PageNotFound.jsx` - 404 error page
- `src/components/UserNotRegisteredError.jsx` - User registration error page

### Configuration
- `vite.config.js` - Updated with path alias support (`@/` for src folder)
- `package.json` - Updated with required dependencies

## Installation

First, install the new dependencies:

```bash
npm install
```

## Integration Steps

### 1. Backend API Setup

Update `src/api/authService.js` with your actual API endpoints:

```javascript
// In authService.js, change the API_BASE_URL to your backend URL
const API_BASE_URL = "http://your-api.com/api"; // Change this to your API URL

// Update these endpoints based on your backend:
// - POST /auth/login
// - POST /auth/register
// - POST /auth/verify
// - GET /auth/me
```

### 2. Update Authentication Methods

The `authService` singleton provides these methods:

```javascript
// Login
await authService.login(email, password);

// Register
await authService.register({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "securePassword123"
});

// Check authentication
const isAuth = authService.isAuthenticated();

// Get current user
const user = authService.getCurrentUser();

// Get token
const token = authService.getToken();

// Logout
authService.logout();
```

### 3. Use Auth in Components

```javascript
import { useAuth } from '@/lib/AuthContext';

function MyComponent() {
  const { user, login, logout, authError } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // User is logged in
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      {user && <p>Welcome, {user.firstName}!</p>}
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

## Features

### Login Page Features
- Email and password input fields
- Show/hide password toggle
- Remember me checkbox
- Forgot password link
- Sign up link to registration page
- Loading state during authentication
- Error message display
- Beautiful gradient dark theme design
- Smooth animations with Framer Motion

### Registration Page Features
- First and last name fields
- Email validation
- Password strength indicator
- Confirm password field
- Show/hide password toggles
- Terms and conditions acceptance
- Form validation with error messages
- Success modal with redirect to login
- Beautiful gradient dark theme design
- Smooth animations with Framer Motion

## Form Validation

The registration form includes validation for:
- Required fields (first name, last name, email)
- Valid email format
- Minimum 8 character password
- Matching passwords
- Terms and conditions acceptance

Password strength levels:
- Weak (1 requirement met)
- Fair (2 requirements met)
- Good (3 requirements met)
- Strong (4 requirements met)
- Very Strong (all requirements met)

Password requirements:
- At least 8 characters
- Contains uppercase and lowercase letters
- Contains numbers
- Contains special characters

## Styling

The authentication pages use:
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- Dark gradient theme with slate colors
- Blue accents for login
- Green accents for registration

## Environment Variables (Optional)

Create a `.env` file for API configuration:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Adnegs Bank
```

Then use in code:
```javascript
const BASE_URL = import.meta.env.VITE_API_URL;
```

## Next Steps

1. Connect to your backend API by updating `src/api/authService.js`
2. Implement proper error handling and validation
3. Add password reset functionality
4. Implement OAuth/SSO if needed
5. Add two-factor authentication
6. Setup session management and token refresh
7. Add analytics and logging

## Troubleshooting

### Path aliases not working
- Ensure `vite.config.js` has the correct alias configuration
- Clear node_modules and reinstall: `npm install`

### Components not importing correctly
- Check that all UI components are in `src/components/ui/`
- Verify the `@/` alias is configured in `vite.config.js`

### Authentication state not persisting
- Check browser localStorage for `auth_token`
- Verify JWT token validation on backend
- Check console for API errors

## API Contract Example

Your backend should implement these endpoints:

### POST /auth/register
Request:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "id": "user-123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

### POST /auth/login
Request:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

### GET /auth/me
Headers:
```
Authorization: Bearer jwt-token-here
```

Response:
```json
{
  "id": "user-123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

## Support

For issues or questions, refer to the documentation for:
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Query](https://tanstack.com/query/latest/)
