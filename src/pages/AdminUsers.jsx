import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Shield,
  User,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { authService } from "@/api/authService";

export default function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => authService.getAllUsers(),
    enabled: user?.role === "admin",
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['admin-accounts'],
    queryFn: () => authService.getAccounts(),
    enabled: user?.role === "admin",
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm || 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getUserAccounts = (email) => {
    return accounts.filter(a => a.created_by === email);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-slate-500">You don't have access to this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage all users on the platform</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/50 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search users..."
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full md:w-48 h-11">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-slate-200/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((u, index) => {
              const userAccounts = getUserAccounts(u.email);
              const totalBalance = userAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
              
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  <Avatar className="h-12 w-12 border-2 border-slate-200">
                    <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-600 text-white font-semibold">
                      {getInitials(u.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{u.full_name || "Unknown"}</p>
                      <Badge variant="secondary" className={
                        u.role === "admin" 
                          ? "bg-purple-100 text-purple-700" 
                          : "bg-slate-100 text-slate-700"
                      }>
                        {u.role === "admin" ? (
                          <><Shield className="w-3 h-3 mr-1" /> Admin</>
                        ) : (
                          <><User className="w-3 h-3 mr-1" /> User</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {u.email}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Joined {u.created_date ? format(new Date(u.created_date), "MMM d, yyyy") : "Unknown"}
                    </p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm text-slate-500">{userAccounts.length} accounts</p>
                    <p className="font-semibold text-slate-900">
                      ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedUser(u)}>
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-medium">No users found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchTerm || filterRole !== "all" 
                ? "Try adjusting your filters"
                : "Users will appear here"
              }
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-slate-200">
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-600 text-white text-xl font-semibold">
                    {getInitials(selectedUser.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-lg text-slate-900">{selectedUser.full_name || "Unknown"}</p>
                  <p className="text-slate-500">{selectedUser.email}</p>
                  <Badge variant="secondary" className={
                    selectedUser.role === "admin" 
                      ? "bg-purple-100 text-purple-700 mt-1" 
                      : "bg-slate-100 text-slate-700 mt-1"
                  }>
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-sm text-slate-500">User ID</p>
                  <p className="font-medium text-slate-900 text-sm truncate">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Joined</p>
                  <p className="font-medium text-slate-900">
                    {selectedUser.created_date 
                      ? format(new Date(selectedUser.created_date), "MMM d, yyyy")
                      : "Unknown"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Accounts</p>
                  <p className="font-medium text-slate-900">
                    {getUserAccounts(selectedUser.email).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Balance</p>
                  <p className="font-medium text-slate-900">
                    ${getUserAccounts(selectedUser.email)
                      .reduce((sum, acc) => sum + (acc.balance || 0), 0)
                      .toLocaleString('en-US', { minimumFractionDigits: 2 })
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}