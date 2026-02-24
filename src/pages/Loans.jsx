import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Plus,
  Receipt,
  Filter,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import LoanCard from "@/components/loans/LoanCard";
import LoanCalculator from "@/components/loans/LoanCalculator";
import LoanPaymentForm from "@/components/loans/LoanPaymentForm";
import { authService } from "@/api/authService";

export default function Loans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentModal, setPaymentModal] = useState({ open: false, loan: null });
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans', user?.email],
    queryFn: () => authService.getLoans(),
    enabled: !!user?.email,
  });

  const generatePaymentRef = () => {
    return 'PAY' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const paymentMutation = useMutation({
    mutationFn: async ({ loan, paymentData }) => {
      return authService.repayLoan(loan.id, paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setPaymentModal({ open: false, loan: null });
    },
  });

  const filteredLoans = filterStatus === "all" 
    ? loans 
    : loans.filter(loan => loan.status === filterStatus);

  const loanStats = {
    total: loans.length,
    pending: loans.filter(l => l.status === "PENDING").length,
    active: loans.filter(l => l.status === "ACTIVE").length,
    totalOutstanding: loans
      .filter(l => l.status === "ACTIVE")
      .reduce((sum, l) => sum + (l.outstanding_balance || 0), 0),
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Loans</h1>
          <p className="text-slate-500 mt-1">Manage your loan applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCalculator(true)}>
            Loan Calculator
          </Button>
          <Link to={createPageUrl("LoanApply")}>
            <Button className="bg-linear-to-r from-purple-500 to-purple-600 hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Apply for Loan
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/50 p-5">
          <p className="text-sm text-slate-500">Total Loans</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{loanStats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/50 p-5">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{loanStats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/50 p-5">
          <p className="text-sm text-slate-500">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{loanStats.active}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/50 p-5">
          <p className="text-sm text-slate-500">Outstanding</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(loanStats.totalOutstanding)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
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
      </div>

      {/* Loans Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : filteredLoans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLoans.map((loan, index) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              index={index}
              onViewDetails={(loan) => setSelectedLoan(loan)}
              onMakePayment={(loan) => setPaymentModal({ open: true, loan })}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/50 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Receipt className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No loans found</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {filterStatus !== "all" 
              ? "Try adjusting your filter to see more loans"
              : "Apply for a loan to get started"
            }
          </p>
          <Link to={createPageUrl("LoanApply")}>
            <Button className="bg-linear-to-r from-purple-500 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Apply for Your First Loan
            </Button>
          </Link>
        </div>
      )}

      {/* Loan Calculator Modal */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="sm:max-w-lg">
          <LoanCalculator />
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={paymentModal.open} onOpenChange={(open) => !open && setPaymentModal({ open: false, loan: null })}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <LoanPaymentForm
            loan={paymentModal.loan}
            onSubmit={(data) => paymentMutation.mutate({ loan: paymentModal.loan, paymentData: data })}
            onCancel={() => setPaymentModal({ open: false, loan: null })}
            isLoading={paymentMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}