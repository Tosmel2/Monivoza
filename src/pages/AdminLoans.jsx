import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { authService } from "@/api/authService";

/* global base44 */
import {
  Receipt,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Clock,
  Send,
  Settings,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminLoans() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, type: null, loan: null });
  const [actionData, setActionData] = useState({ interestRate: "", comments: "", reason: "", accountId: "", customRate: "", maxAmount: "", notes: "" });
  const [userAccounts, setUserAccounts] = useState([]);
  const [selectedLoans, setSelectedLoans] = useState([]);
  const [userProfileModal, setUserProfileModal] = useState({ open: false, userEmail: null });
  const queryClient = useQueryClient();

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['admin-loans'],
    queryFn: () => authService.getPendingLoans(),
    enabled: user?.role === "admin",
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['admin-accounts'],
    queryFn: () => authService.getAccounts(),
    enabled: user?.role === "admin",
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => authService.getTransactions(),
    enabled: user?.role === "admin",
  });

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['user-loan-profiles'],
    queryFn: () => authService.getAllUsers(),
    enabled: user?.role === "admin",
  });

  const approveMutation = useMutation({
    mutationFn: async ({ loanId, data }) => {
      return authService.approveLoan(loanId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      setActionModal({ open: false, type: null, loan: null });
      setActionData({ interestRate: "", comments: "", reason: "" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ loanId, reason }) => {
      return authService.rejectLoan(loanId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      setActionModal({ open: false, type: null, loan: null });
      setActionData({ interestRate: "", comments: "", reason: "" });
    },
  });

  const generateTransactionRef = () => {
    return 'TXN' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const disburseMutation = useMutation({
    mutationFn: async ({ loanId, accountId }) => {
      return authService.disburseLoan(loanId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      setActionModal({ open: false, type: null, loan: null });
      setActionData({ interestRate: "", comments: "", reason: "", accountId: "", customRate: "", maxAmount: "", notes: "" });
    },
  });

  // Calculate credit score for a user
  const calculateCreditScore = (userEmail) => {
    const userLoans = loans.filter(l => l.created_by === userEmail);
    const userAccounts = accounts.filter(a => a.created_by === userEmail);
    const userTransactions = transactions.filter(t => t.created_by === userEmail);

    let score = 50; // Base score

    // Positive factors
    const completedLoans = userLoans.filter(l => l.status === "CLOSED").length;
    score += completedLoans * 10;

    const activeAccounts = userAccounts.filter(a => a.status === "ACTIVE").length;
    score += activeAccounts * 5;

    const totalBalance = userAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
    if (totalBalance > 10000) score += 15;
    else if (totalBalance > 5000) score += 10;
    else if (totalBalance > 1000) score += 5;

    // Negative factors
    const rejectedLoans = userLoans.filter(l => l.status === "REJECTED").length;
    score -= rejectedLoans * 5;

    const overdueLoans = userLoans.filter(l => 
      l.status === "ACTIVE" && l.maturity_date && new Date(l.maturity_date) < new Date()
    ).length;
    score -= overdueLoans * 15;

    return Math.min(100, Math.max(0, score));
  };

  const userProfileMutation = useMutation({
    mutationFn: async ({ userEmail, data }) => {
      const existingProfiles = await base44.entities.UserLoanProfile.filter({ user_email: userEmail });
      
      if (existingProfiles.length > 0) {
        await base44.entities.UserLoanProfile.update(existingProfiles[0].id, data);
      } else {
        await base44.entities.UserLoanProfile.create({
          user_email: userEmail,
          ...data,
          credit_score: calculateCreditScore(userEmail)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-loan-profiles'] });
      setUserProfileModal({ open: false, userEmail: null });
      setActionData({ interestRate: "", comments: "", reason: "", accountId: "", customRate: "", maxAmount: "", notes: "" });
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: async (loanIds) => {
      for (const loanId of loanIds) {
        const loan = loans.find(l => l.id === loanId);
        await base44.entities.Loan.update(loanId, {
          status: "APPROVED",
          approval_date: new Date().toISOString(),
          approved_by: user?.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      setSelectedLoans([]);
    },
  });

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = !searchTerm || 
      loan.loan_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.created_by?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || loan.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleLoanSelection = (loanId) => {
    setSelectedLoans(prev => 
      prev.includes(loanId) 
        ? prev.filter(id => id !== loanId)
        : [...prev, loanId]
    );
  };

  const getUserProfile = (userEmail) => {
    return userProfiles.find(p => p.user_email === userEmail);
  };

  const statusColors = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Loan Management</h1>
        <p className="text-slate-500 mt-1">Review and manage loan applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/50 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-100">
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
            <p className="text-sm text-slate-500">Pending</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {loans.filter(l => l.status === "PENDING").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/50 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <CheckCircle className="w-4 h-4 text-blue-700" />
            </div>
            <p className="text-sm text-slate-500">Approved</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {loans.filter(l => l.status === "APPROVED").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/50 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Receipt className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-sm text-slate-500">Active</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {loans.filter(l => l.status === "ACTIVE").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/50 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-100">
              <XCircle className="w-4 h-4 text-red-700" />
            </div>
            <p className="text-sm text-slate-500">Rejected</p>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {loans.filter(l => l.status === "REJECTED").length}
          </p>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/50 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by loan number or applicant..."
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48 h-11">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
          {selectedLoans.length > 0 && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => bulkApproveMutation.mutate(selectedLoans)}
              disabled={bulkApproveMutation.isPending}
            >
              {bulkApproveMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Approving...</>
              ) : (
                <>Approve {selectedLoans.length} Loan{selectedLoans.length > 1 ? 's' : ''}</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Loans List */}
      <div className="bg-white rounded-2xl border border-slate-200/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : filteredLoans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="w-12 py-4 px-4"></th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-600 text-sm">Loan Number</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-600 text-sm">Type</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-600 text-sm">Amount</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-600 text-sm">Applicant</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-600 text-sm">Score</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-600 text-sm">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-600 text-sm">Date</th>
                  <th className="text-right py-4 px-4 font-semibold text-slate-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan, index) => {
                  const creditScore = calculateCreditScore(loan.created_by);
                  const isPending = loan.status === "PENDING";
                  return (
                    <motion.tr
                      key={loan.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        {isPending && (
                          <input
                            type="checkbox"
                            checked={selectedLoans.includes(loan.id)}
                            onChange={() => toggleLoanSelection(loan.id)}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-900">{loan.loan_number}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-700">{loan.loan_type}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-900">{formatCurrency(loan.principal_amount)}</p>
                        <p className="text-xs text-slate-500">{loan.term_months} months</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-700 text-sm truncate max-w-37.5">{loan.created_by}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <TrendingUp className={`w-3 h-3 ${
                              creditScore >= 70 ? 'text-green-600' : 
                              creditScore >= 40 ? 'text-amber-600' : 
                              'text-red-600'
                            }`} />
                            <span className={`text-sm font-semibold ${
                              creditScore >= 70 ? 'text-green-600' : 
                              creditScore >= 40 ? 'text-amber-600' : 
                              'text-red-600'
                            }`}>
                              {creditScore}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setUserProfileModal({ open: true, userEmail: loan.created_by })}
                          >
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={statusColors[loan.status]}>
                          {loan.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-500">
                          {loan.created_date 
                            ? format(new Date(loan.created_date), "MMM d, yyyy")
                            : "Unknown"
                          }
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedLoan(loan)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {loan.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => setActionModal({ open: true, type: "approve", loan })}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setActionModal({ open: true, type: "reject", loan })}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {loan.status === "APPROVED" && (
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={async () => {
                                const accounts = await base44.entities.Account.filter({ 
                                  created_by: loan.created_by,
                                  status: "ACTIVE"
                                });
                                setUserAccounts(accounts);
                                setActionModal({ open: true, type: "disburse", loan });
                              }}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Disburse
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-medium">No loans found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your filters"
                : "Loan applications will appear here"
              }
            </p>
          </div>
        )}
      </div>

      {/* Loan Details Modal */}
      <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Loan Number</p>
                  <p className="font-semibold text-slate-900">{selectedLoan.loan_number}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <Badge className={statusColors[selectedLoan.status]}>
                    {selectedLoan.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Type</p>
                  <p className="font-semibold text-slate-900">{selectedLoan.loan_type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Principal Amount</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(selectedLoan.principal_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Interest Rate</p>
                  <p className="font-semibold text-slate-900">{selectedLoan.interest_rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Term</p>
                  <p className="font-semibold text-slate-900">{selectedLoan.term_months} months</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Monthly Payment</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(selectedLoan.monthly_payment)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Applicant</p>
                  <p className="font-semibold text-slate-900 truncate">{selectedLoan.created_by}</p>
                </div>
              </div>
              {selectedLoan.purpose && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">Purpose</p>
                  <p className="text-slate-900">{selectedLoan.purpose}</p>
                </div>
              )}
              {selectedLoan.rejection_reason && (
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">Rejection Reason</p>
                  <p className="text-red-700">{selectedLoan.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={actionModal.open} onOpenChange={() => setActionModal({ open: false, type: null, loan: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionModal.type === "approve" && "Approve Loan"}
              {actionModal.type === "reject" && "Reject Loan"}
              {actionModal.type === "disburse" && "Disburse Loan"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {actionModal.type === "approve" && (
              <>
                <div className="space-y-2">
                  <Label>Interest Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder={actionModal.loan?.interest_rate?.toString() || "12.5"}
                    value={actionData.interestRate}
                    onChange={(e) => setActionData({ ...actionData, interestRate: e.target.value })}
                  />
                  <p className="text-xs text-slate-500">
                    Leave empty to use the default rate: {actionModal.loan?.interest_rate}%
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Comments (Optional)</Label>
                  <Textarea
                    placeholder="Add any comments..."
                    value={actionData.comments}
                    onChange={(e) => setActionData({ ...actionData, comments: e.target.value })}
                  />
                </div>
              </>
            )}
            {actionModal.type === "reject" && (
              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Textarea
                  placeholder="Provide a reason for rejection..."
                  value={actionData.reason}
                  onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                  required
                />
              </div>
            )}
            {actionModal.type === "disburse" && (
              <>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm font-medium text-purple-900">Loan Amount</p>
                  <p className="text-2xl font-bold text-purple-700">{formatCurrency(actionModal.loan?.principal_amount)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Select Account to Credit</Label>
                  <Select 
                    value={actionData.accountId} 
                    onValueChange={(value) => setActionData({ ...actionData, accountId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {userAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account_type} - {account.account_number} ({formatCurrency(account.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    The loan amount will be credited to this account
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setActionModal({ open: false, type: null, loan: null })}
            >
              Cancel
            </Button>
            {actionModal.type === "approve" && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => approveMutation.mutate({ 
                  loanId: actionModal.loan?.id, 
                  data: actionData 
                })}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Approving...</>
                ) : (
                  "Approve Loan"
                )}
              </Button>
            )}
            {actionModal.type === "reject" && (
              <Button
                variant="destructive"
                onClick={() => rejectMutation.mutate({ 
                  loanId: actionModal.loan?.id, 
                  reason: actionData.reason 
                })}
                disabled={rejectMutation.isPending || !actionData.reason}
              >
                {rejectMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Rejecting...</>
                ) : (
                  "Reject Loan"
                )}
              </Button>
            )}
            {actionModal.type === "disburse" && (
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => disburseMutation.mutate({ 
                  loanId: actionModal.loan?.id, 
                  accountId: actionData.accountId 
                })}
                disabled={disburseMutation.isPending || !actionData.accountId}
              >
                {disburseMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Disbursing...</>
                ) : (
                  "Disburse Loan"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Loan Profile Modal */}
      <Dialog open={userProfileModal.open} onOpenChange={() => setUserProfileModal({ open: false, userEmail: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Loan Profile Settings</DialogTitle>
          </DialogHeader>
          {userProfileModal.userEmail && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">User Email</p>
                <p className="font-semibold text-slate-900">{userProfileModal.userEmail}</p>
                <div className="mt-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <p className="text-sm text-slate-500">Credit Score:</p>
                  <span className="font-bold text-indigo-600">
                    {calculateCreditScore(userProfileModal.userEmail)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Custom Interest Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 8.5"
                  value={actionData.customRate}
                  onChange={(e) => setActionData({ ...actionData, customRate: e.target.value })}
                />
                <p className="text-xs text-slate-500">Leave empty to use default rates</p>
              </div>

              <div className="space-y-2">
                <Label>Max Loan Amount</Label>
                <Input
                  type="number"
                  placeholder="e.g., 50000"
                  value={actionData.maxAmount}
                  onChange={(e) => setActionData({ ...actionData, maxAmount: e.target.value })}
                />
                <p className="text-xs text-slate-500">Maximum loan amount this user can apply for</p>
              </div>

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  placeholder="Add notes about this user's loan profile..."
                  value={actionData.notes}
                  onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setUserProfileModal({ open: false, userEmail: null })}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => userProfileMutation.mutate({
                userEmail: userProfileModal.userEmail,
                data: {
                  custom_interest_rate: actionData.customRate ? parseFloat(actionData.customRate) : null,
                  max_loan_amount: actionData.maxAmount ? parseFloat(actionData.maxAmount) : null,
                  notes: actionData.notes,
                  credit_score: calculateCreditScore(userProfileModal.userEmail)
                }
              })}
              disabled={userProfileMutation.isPending}
            >
              {userProfileMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                "Save Profile"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}