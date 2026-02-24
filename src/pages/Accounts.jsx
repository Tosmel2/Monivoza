import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/api/authService";
import { 
  Plus, 
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import AccountCard from "@/components/dashboard/AccountCard";
import TransactionForm from "@/components/transactions/TransactionForm";

export default function Accounts() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [transactionModal, setTransactionModal] = useState({ open: false, type: null, account: null });
  const [newAccount, setNewAccount] = useState({ account_type: "SAVINGS", initialDeposit: "" });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['accounts', user?.email],
    queryFn: () => authService.getAccounts(),
    enabled: !!user?.email,
  });

  const accounts = data || [];

  const createAccountMutation = useMutation({
    mutationFn: async (data) => {
      return authService.createAccount(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowCreateModal(false);
      setNewAccount({ account_type: "SAVINGS", initialDeposit: "" });
    },
  });

  const transactionMutation = useMutation({
    mutationFn: async ({ type, data }) => {
      if (type === "DEPOSIT") {
        return authService.deposit(data);
      } else if (type === "WITHDRAWAL") {
        return authService.withdraw(data);
      } else if (type === "TRANSFER") {
        return authService.transfer(data);
      }
      throw new Error("Invalid transaction type");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setTransactionModal({ open: false, type: null, account: null });
    },
  });

  const handleDeposit = (account) => {
    setTransactionModal({ open: true, type: "DEPOSIT", account });
  };

  const handleWithdraw = (account) => {
    setTransactionModal({ open: true, type: "WITHDRAWAL", account });
  };

  const handleTransfer = (account) => {
    setTransactionModal({ open: true, type: "TRANSFER", account });
  };

  const handleTransactionSubmit = (data) => {
    transactionMutation.mutate({ type: transactionModal.type, data });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Accounts</h1>
          <p className="text-slate-500 mt-1">Manage your bank accounts</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-linear-to-r from-teal-500 to-teal-600 hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Account
        </Button>
      </div>

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account, index) => (
            <AccountCard
              key={account.id}
              account={account}
              index={index}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
              onTransfer={handleTransfer}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/50 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No accounts yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Create your first bank account to start managing your finances
          </p>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-linear-to-r from-teal-500 to-teal-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Account
          </Button>
        </div>
      )}

      {/* Create Account Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              createAccountMutation.mutate(newAccount);
            }}
            className="space-y-4 mt-4"
          >
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select
                value={newAccount.account_type}
                onValueChange={(value) => setNewAccount({ ...newAccount, account_type: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAVINGS">Savings Account</SelectItem>
                  <SelectItem value="CURRENT">Current Account</SelectItem>
                  <SelectItem value="FIXED_DEPOSIT">Fixed Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Initial Deposit (Optional)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="h-12 pl-8"
                  value={newAccount.initialDeposit}
                  onChange={(e) => setNewAccount({ ...newAccount, initialDeposit: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-linear-to-r from-teal-500 to-teal-600"
                disabled={createAccountMutation.isPending}
              >
                {createAccountMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction Modal */}
      <Dialog 
        open={transactionModal.open} 
        onOpenChange={(open) => !open && setTransactionModal({ open: false, type: null, account: null })}
      >
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <TransactionForm
            type={transactionModal.type}
            accounts={accounts}
            selectedAccount={transactionModal.account}
            onSubmit={handleTransactionSubmit}
            onCancel={() => setTransactionModal({ open: false, type: null, account: null })}
            isLoading={transactionMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}