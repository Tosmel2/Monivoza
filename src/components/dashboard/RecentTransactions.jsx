import React from "react";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RecentTransactions({ transactions = [], limit = 5 }) {
  const getTransactionIcon = (type) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownLeft className="w-4 h-4" />;
      case "WITHDRAWAL":
        return <ArrowUpRight className="w-4 h-4" />;
      case "TRANSFER":
        return <ArrowLeftRight className="w-4 h-4" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "DEPOSIT":
        return "bg-emerald-100 text-emerald-700";
      case "WITHDRAWAL":
        return "bg-red-100 text-red-700";
      case "TRANSFER":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const statusColors = {
    COMPLETED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    FAILED: "bg-red-100 text-red-700",
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <ArrowLeftRight className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">No transactions yet</p>
          <p className="text-sm text-slate-400 mt-1">Your recent transactions will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.slice(0, limit).map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className={`p-3 rounded-xl ${getTransactionColor(transaction.transaction_type)}`}>
              {getTransactionIcon(transaction.transaction_type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {transaction.description || transaction.transaction_type}
              </p>
              <p className="text-sm text-slate-500">
                {transaction.created_date 
                  ? format(new Date(transaction.created_date), "MMM d, yyyy • h:mm a")
                  : "Unknown date"
                }
              </p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${
                transaction.transaction_type === "DEPOSIT" 
                  ? "text-emerald-600" 
                  : "text-slate-900"
              }`}>
                {transaction.transaction_type === "DEPOSIT" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
              <Badge variant="secondary" className={statusColors[transaction.status]}>
                {transaction.status}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}