import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/api/authService";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone_number: "",
    address: "",
    date_of_birth: "",
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (user) {
      setFormData({
        phone_number: user?.phone_number || "",
        address: user?.address || "",
        date_of_birth: user?.date_of_birth || "",
      });
    }
  }, [user, navigate]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      // TODO: Replace with actual API call using authService
      // This will need to call your backend API endpoint for updating user profile
      throw new Error("User profile update API endpoint not yet implemented");
    },
    onSuccess: () => {
      // Reload user data after update
      window.location.reload();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200/50 overflow-hidden"
      >
        <div className="bg-linear-to-r from-teal-500 to-teal-600 h-24" />
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-linear-to-br from-teal-500 to-teal-600 text-white text-2xl font-bold">
                {getInitials(user?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{user?.full_name || "User"}</h2>
                <Badge className={
                  user?.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-slate-100 text-slate-700"
                }>
                  {user?.role === "admin" ? (
                    <><Shield className="w-3 h-3 mr-1" /> Admin</>
                  ) : (
                    <><User className="w-3 h-3 mr-1" /> User</>
                  )}
                </Badge>
              </div>
              <p className="text-slate-500 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200/50 p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Personal Information</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Full Name
              </Label>
              <Input
                value={user?.full_name || ""}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Name cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                Email Address
              </Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                Phone Number
              </Label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Date of Birth
              </Label>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              Address
            </Label>
            <Textarea
              placeholder="Enter your address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="min-h-25 resize-none"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              type="submit"
              className="bg-linear-to-r from-teal-500 to-teal-600"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200/50 p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-500">Account ID</p>
              <p className="font-medium text-slate-900 text-sm">{user?.id}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-500">Account Role</p>
              <p className="font-medium text-slate-900">{user?.role || "user"}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-slate-500">Account Created</p>
              <p className="font-medium text-slate-900">
                {user?.created_date 
                  ? new Date(user.created_date).toLocaleDateString()
                  : "Unknown"
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}