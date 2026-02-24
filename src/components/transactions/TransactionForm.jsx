import React, { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TransactionForm({ 
  type, 
  accounts = [], 
  selectedAccount,
  onSubmit, 
  onCancel,
  isLoading 
}) {
  const [formData, setFormData] = useState({
    accountId: selectedAccount?.id || "",
    destinationAccountNumber: "",
    amount: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  const typeConfig = {
    DEPOSIT: {
      title: "Deposit Funds",
      subtitle: "Add money to your account",
      icon: ArrowDownLeft,
      color: "from-emerald-500 to-emerald-600",
      buttonText: "Deposit",
    },
    WITHDRAWAL: {
      title: "Withdraw Funds",
      subtitle: "Take money from your account",
      icon: ArrowUpRight,
      color: "from-red-500 to-red-600",
      buttonText: "Withdraw",
    },
    TRANSFER: {
      title: "Transfer Funds",
      subtitle: "Send money to another account",
      icon: ArrowLeftRight,
      color: "from-blue-500 to-blue-600",
      buttonText: "Transfer",
    },
  };

  const config = typeConfig[type] || typeConfig.DEPOSIT;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-slate-200/50 overflow-hidden shadow-xl"
    >
      <div className={`bg-linear-to-r ${config.color} p-6 text-white`}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{config.title}</h2>
            <p className="text-sm text-white/80">{config.subtitle}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="account">{type === "TRANSFER" ? "From Account" : "Account"}</Label>
          <Select
            value={formData.accountId}
            onValueChange={(value) => setFormData({ ...formData, accountId: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.account_type} - {account.account_number?.slice(-4)} (${account.balance?.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {type === "TRANSFER" && (
          <div className="space-y-2">
            <Label htmlFor="destination">Destination Account Number</Label>
            <Input
              id="destination"
              type="text"
              placeholder="Enter recipient's full account number"
              className="h-12"
              value={formData.destinationAccountNumber}
              onChange={(e) => setFormData({ ...formData, destinationAccountNumber: e.target.value })}
              required
            />
            <p className="text-xs text-slate-500">Enter the complete account number of the recipient</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="h-12 pl-8 text-lg font-semibold"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Enter a description for this transaction"
            className="min-h-20 resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className={`flex-1 h-12 bg-linear-to-r ${config.color} hover:opacity-90`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              config.buttonText
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}