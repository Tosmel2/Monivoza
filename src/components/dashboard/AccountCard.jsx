import React, { useState } from "react";
import { CreditCard, ArrowUpRight, ArrowDownLeft, MoreHorizontal, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AccountCard({ account, onDeposit, onWithdraw, onTransfer, index }) {
  const [copied, setCopied] = useState(false);
  
  const typeColors = {
    SAVINGS: "from-teal-500 to-emerald-600",
    CURRENT: "from-blue-500 to-indigo-600",
    FIXED_DEPOSIT: "from-purple-500 to-pink-600",
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: account?.currency || 'USD',
    }).format(amount || 0);
  };

  const formatAccountNumber = (num) => {
    if (!num) return "****";
    return `•••• ${num.slice(-4)}`;
  };

  const copyAccountNumber = () => {
    if (account?.account_number) {
      navigator.clipboard.writeText(account.account_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${typeColors[account?.account_type] || typeColors.SAVINGS} p-6 text-white shadow-xl`}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-24 -translate-x-24" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">{account?.account_type?.replace("_", " ")}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-white/60">{formatAccountNumber(account?.account_number)}</p>
                <button
                  onClick={copyAccountNumber}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Copy full account number"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <Copy className="w-3 h-3 text-white/60" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDeposit?.(account)}>
                <ArrowDownLeft className="w-4 h-4 mr-2 text-emerald-600" />
                Deposit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onWithdraw?.(account)}>
                <ArrowUpRight className="w-4 h-4 mr-2 text-red-600" />
                Withdraw
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTransfer?.(account)}>
                <ArrowUpRight className="w-4 h-4 mr-2 text-blue-600" />
                Transfer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-6">
          <p className="text-sm text-white/70 mb-1">Available Balance</p>
          <p className="text-3xl font-bold tracking-tight">{formatCurrency(account?.balance)}</p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            onClick={() => onDeposit?.(account)}
          >
            <ArrowDownLeft className="w-4 h-4 mr-1" />
            Deposit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            onClick={() => onTransfer?.(account)}
          >
            <ArrowUpRight className="w-4 h-4 mr-1" />
            Transfer
          </Button>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-white/30 font-bold text-6xl tracking-tighter">
        {account?.currency || "USD"}
      </div>
    </motion.div>
  );
}