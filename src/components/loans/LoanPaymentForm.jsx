import React, { useState } from "react";
import { DollarSign, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoanPaymentForm({ loan, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    amount: loan?.monthly_payment?.toFixed(2) || "",
    payment_method: "DEBIT",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    
    if (amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    if (amount > (loan?.outstanding_balance || 0)) {
      alert("Payment amount cannot exceed outstanding balance");
      return;
    }
    
    onSubmit({
      amount,
      payment_method: formData.payment_method,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const suggestedAmounts = [
    { label: "Minimum", value: loan?.monthly_payment || 0 },
    { label: "Outstanding", value: loan?.outstanding_balance || 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-slate-200/50 overflow-hidden shadow-xl"
    >
      <div className="bg-linear-to-r from-purple-500 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Make Loan Payment</h2>
            <p className="text-sm text-white/80">Loan #{loan?.loan_number}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Loan Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Outstanding Balance</p>
              <p className="text-lg font-bold text-slate-900">
                {formatCurrency(loan?.outstanding_balance)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Monthly Payment</p>
              <p className="text-lg font-bold text-slate-900">
                {formatCurrency(loan?.monthly_payment)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Amount Selection */}
        <div className="space-y-3">
          <Label>Quick Select</Label>
          <div className="grid grid-cols-2 gap-3">
            {suggestedAmounts.map((suggested) => (
              <Button
                key={suggested.label}
                type="button"
                variant="outline"
                className="h-auto py-3 flex flex-col items-center"
                onClick={() => setFormData({ ...formData, amount: suggested.value.toFixed(2) })}
              >
                <span className="text-xs text-slate-500">{suggested.label}</span>
                <span className="font-semibold">{formatCurrency(suggested.value)}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Payment Amount</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={loan?.outstanding_balance}
              placeholder="0.00"
              className="h-12 pl-8 text-lg font-semibold"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          {parseFloat(formData.amount) > (loan?.outstanding_balance || 0) && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Payment amount cannot exceed outstanding balance
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <Label>Payment Method</Label>
          <RadioGroup
            value={formData.payment_method}
            onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
          >
            <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-500 transition-colors cursor-pointer">
              <RadioGroupItem value="DEBIT" id="debit" />
              <Label htmlFor="debit" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <CreditCard className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Debit from Account</p>
                    <p className="text-xs text-slate-500">Direct debit from your bank account</p>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-500 transition-colors cursor-pointer">
              <RadioGroupItem value="TRANSFER" id="transfer" />
              <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <DollarSign className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Bank Transfer</p>
                    <p className="text-xs text-slate-500">Transfer from another account</p>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-500 transition-colors cursor-pointer">
              <RadioGroupItem value="CASH" id="cash" />
              <Label htmlFor="cash" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <DollarSign className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Cash Payment</p>
                    <p className="text-xs text-slate-500">Pay at branch location</p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Action Buttons */}
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
            className="flex-1 h-12 bg-linear-to-r from-purple-500 to-purple-600 hover:opacity-90"
            disabled={isLoading || parseFloat(formData.amount) > (loan?.outstanding_balance || 0)}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Make Payment
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}