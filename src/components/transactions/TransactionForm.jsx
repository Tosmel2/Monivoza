import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authService } from "@/api/authService";

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
  const [lookupResult, setLookupResult] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  const handleAccountLookup = async () => {
    if (!formData.destinationAccountNumber.trim()) {
      setLookupError("Please enter an account number");
      setLookupResult(null);
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const result = await authService.lookupAccount(formData.destinationAccountNumber);
      setLookupResult(result);
    } catch (error) {
      setLookupError(error.message || "Account not found or lookup failed");
      setLookupResult(null);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // For transfers, require successful lookup
    if (type === "TRANSFER" && !lookupResult) {
      setLookupError("Please verify the recipient account before proceeding");
      return;
    }

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
          <div className="space-y-3">
            <Label htmlFor="destination">Destination Account Number</Label>
            <div className="flex gap-2">
              <Input
                id="destination"
                type="text"
                placeholder="Enter recipient's full account number"
                className="h-12 flex-1"
                value={formData.destinationAccountNumber}
                onChange={(e) => {
                  setFormData({ ...formData, destinationAccountNumber: e.target.value });
                  setLookupResult(null);
                  setLookupError(null);
                }}
                disabled={isLookingUp || isLoading}
              />
              <Button
                type="button"
                variant="outline"
                className="h-12 px-4"
                onClick={handleAccountLookup}
                disabled={isLookingUp || isLoading || !formData.destinationAccountNumber.trim()}
              >
                {isLookingUp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500">Enter the complete account number and verify before transfer</p>

            {lookupError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{lookupError}</AlertDescription>
              </Alert>
            )}

            {lookupResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-emerald-900 text-sm">Account Verified</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      {lookupResult.account_holder_name || lookupResult.name || "Recipient"}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      {lookupResult.account_type || "Account"} • {lookupResult.account_number?.slice(-4)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">N</span>
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
