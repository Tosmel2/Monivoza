import React from "react";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { authService } from "@/api/authService";

export default function UserNotRegisteredError() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">User Not Registered</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          Your user account is not properly registered. Please contact support or try logging in again.
        </p>
        <Button
          onClick={handleLogout}
          className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          Return to Login
        </Button>
      </div>
    </div>
  );
}
