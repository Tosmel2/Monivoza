import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Receipt, Calendar, Percent, TrendingUp, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function LoanCard({ loan, onMakePayment, index }) {
  const statusColors = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const typeColors = {
    PERSONAL: "from-purple-500 to-purple-600",
    BUSINESS: "from-blue-500 to-blue-600",
    MORTGAGE: "from-teal-500 to-teal-600",
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const paidPercentage = loan?.principal_amount && loan?.outstanding_balance
    ? ((loan.principal_amount - loan.outstanding_balance) / loan.principal_amount) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl border border-slate-200/50 overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className={`h-2 bg-linear-to-r ${typeColors[loan?.loan_type] || typeColors.PERSONAL}`} />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-linear-to-br ${typeColors[loan?.loan_type] || typeColors.PERSONAL} text-white`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{loan?.loan_type} Loan</p>
              <p className="text-sm text-slate-500">#{loan?.loan_number}</p>
            </div>
          </div>
          <Badge className={statusColors[loan?.status]}>
            {loan?.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Principal Amount</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(loan?.principal_amount)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Outstanding</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(loan?.outstanding_balance)}</p>
          </div>
        </div>

        {loan?.status === "ACTIVE" && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Repayment Progress</span>
              <span className="font-medium text-slate-700">{paidPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={paidPercentage} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Rate</p>
              <p className="text-sm font-semibold text-slate-900">{loan?.interest_rate}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Term</p>
              <p className="text-sm font-semibold text-slate-900">{loan?.term_months} mo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Monthly</p>
              <p className="text-sm font-semibold text-slate-900">{formatCurrency(loan?.monthly_payment)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <Link to={createPageUrl("LoanDetails") + `?id=${loan?.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full"
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          {loan?.status === "ACTIVE" && (
            <Button
              className="flex-1 bg-linear-to-r from-teal-500 to-teal-600 hover:opacity-90"
              onClick={() => onMakePayment?.(loan)}
            >
              Make Payment
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}