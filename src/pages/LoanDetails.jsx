import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft,
  Receipt,
  Calendar,
  Percent,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Loader2,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import LoanPaymentForm from "@/components/loans/LoanPaymentForm";
import { authService } from "@/api/authService";

export default function LoanDetails() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loanId, setLoanId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLoanId(params.get('id'));
    
    // Redirect to login if not authenticated
    if (!authService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const { data: loan, isLoading: loanLoading } = useQuery({
    queryKey: ['loan', loanId],
    queryFn: async () => {
      return authService.getLoanDetails(loanId);
    },
    enabled: !!loanId,
  });

  const { data: repayments = [], isLoading: repaymentsLoading } = useQuery({
    queryKey: ['loan-repayments', loanId],
    queryFn: () => {
      return authService.getLoanRepayments(loanId);
    },
    enabled: !!loanId,
  });

  const generatePaymentRef = () => {
    return 'PAY' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const paymentMutation = useMutation({
    mutationFn: async (paymentData) => {
      return authService.repayLoan(loanId, paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan', loanId] });
      queryClient.invalidateQueries({ queryKey: ['loan-repayments', loanId] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setShowPaymentModal(false);
    },
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGR',
    }).format(amount || 0);
  };

  const statusColors = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const paidPercentage = loan?.principal_amount && loan?.outstanding_balance
    ? ((loan.principal_amount - loan.outstanding_balance) / loan.principal_amount) * 100
    : 0;

  const totalPaid = repayments.reduce((sum, r) => sum + (r.amount || 0), 0);

  const handleExportRepayments = () => {
    const csv = [
      ['Date', 'Payment Ref', 'Amount', 'Principal', 'Interest', 'Method', 'Status'],
      ...repayments.map(r => [
        r.created_date ? format(new Date(r.created_date), 'yyyy-MM-dd') : '',
        r.payment_ref,
        r.amount,
        r.principal_amount || '',
        r.interest_amount || '',
        r.payment_method,
        r.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-${loan?.loan_number}-repayments.csv`;
    a.click();
  };

  if (loanLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Loan not found</p>
        <Button
          onClick={() => navigate(createPageUrl("Loans"))}
          className="mt-4"
        >
          Back to Loans
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Loans"))}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Loan Details</h1>
          <p className="text-slate-500 mt-1">#{loan.loan_number}</p>
        </div>
        {loan.status === "ACTIVE" && (
          <Button
            onClick={() => setShowPaymentModal(true)}
            className="bg-linear-to-r from-purple-500 to-purple-600 hover:opacity-90"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Make Payment
          </Button>
        )}
      </div>

      {/* Loan Summary Card */}
      <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/80 mb-2">Outstanding Balance</p>
            <p className="text-4xl font-bold">{formatCurrency(loan.outstanding_balance)}</p>
          </div>
          <Badge className={statusColors[loan.status]}>
            {loan.status}
          </Badge>
        </div>

        {loan.status === "ACTIVE" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Repayment Progress</span>
              <span className="font-semibold">{paidPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={paidPercentage} className="h-3 bg-white/20" />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
          <div>
            <p className="text-xs text-white/70 mb-1">Principal</p>
            <p className="font-semibold">{formatCurrency(loan.principal_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-white/70 mb-1">Interest Rate</p>
            <p className="font-semibold">{loan.interest_rate}%</p>
          </div>
          <div>
            <p className="text-xs text-white/70 mb-1">Term</p>
            <p className="font-semibold">{loan.term_months} months</p>
          </div>
          <div>
            <p className="text-xs text-white/70 mb-1">Monthly Payment</p>
            <p className="font-semibold">{formatCurrency(loan.monthly_payment)}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-emerald-100">
              <CheckCircle className="w-5 h-5 text-emerald-700" />
            </div>
            <p className="text-sm text-slate-500">Total Paid</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalPaid)}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-blue-100">
              <Receipt className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-sm text-slate-500">Payments Made</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{repayments.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-purple-100">
              <Calendar className="w-5 h-5 text-purple-700" />
            </div>
            <p className="text-sm text-slate-500">Next Payment</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {loan.status === "ACTIVE" ? formatCurrency(loan.monthly_payment) : "N/A"}
          </p>
        </div>
      </div>

      {/* Repayment History */}
      <div className="bg-white rounded-2xl border border-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Repayment History</h2>
          {repayments.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportRepayments}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>

        {repaymentsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : repayments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {repayments.map((repayment, index) => (
              <motion.div
                key={repayment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-100">
                    <CheckCircle className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(repayment.amount)}
                      </p>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {repayment.payment_method}
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        {repayment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Ref: {repayment.payment_ref}
                    </p>
                    <div className="flex gap-4 text-xs text-slate-400 mt-2">
                      <span>Principal: {formatCurrency(repayment.principal_amount)}</span>
                      <span>Interest: {formatCurrency(repayment.interest_amount)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">
                      {repayment.created_date 
                        ? format(new Date(repayment.created_date), "MMM d, yyyy")
                        : "Unknown"
                      }
                    </p>
                    <p className="text-xs text-slate-500">
                      {repayment.created_date 
                        ? format(new Date(repayment.created_date), "h:mm a")
                        : ""
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-medium">No payments yet</p>
            <p className="text-sm text-slate-500 mt-1">Payment history will appear here</p>
          </div>
        )}
      </div>

      {/* Additional Info */}
      {loan.purpose && (
        <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Loan Purpose</h3>
          <p className="text-slate-700">{loan.purpose}</p>
        </div>
      )}

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <LoanPaymentForm
            loan={loan}
            onSubmit={(data) => paymentMutation.mutate(data)}
            onCancel={() => setShowPaymentModal(false)}
            isLoading={paymentMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}