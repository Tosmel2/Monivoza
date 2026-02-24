import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Filter,
  Download,
  Search,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionForm from "@/components/transactions/TransactionForm";
import { authService } from "@/api/authService";

export default function Transactions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [transactionModal, setTransactionModal] = useState({ open: false, type: null });
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.email],
    queryFn: () => authService.getTransactions(),
    enabled: !!user?.email,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', user?.email],
    queryFn: () => authService.getAccounts(),
    enabled: !!user?.email,
  });

  const generateTransactionRef = () => {
    return 'TXN' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const transactionMutation = useMutation({
    mutationFn: async ({ type, data }) => {
      // TODO: Replace with actual API calls using authService
      // This will need to call your backend API endpoints for transactions
      const account = accounts.find(a => a.id === data.accountId);
      if (!account) throw new Error("Account not found");

      if (type === "WITHDRAWAL" && account.balance < data.amount) {
        throw new Error("Insufficient balance");
      }

      // Placeholder - replace with actual API calls
      throw new Error("Transaction API endpoints not yet implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setTransactionModal({ open: false, type: null });
    },
  });

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = !searchTerm || 
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.transaction_ref?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || tx.transaction_type === filterType;
    return matchesSearch && matchesType;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownLeft className="w-4 h-4" />;
      case "WITHDRAWAL":
        return <ArrowUpRight className="w-4 h-4" />;
      case "TRANSFER":
        return <ArrowLeftRight className="w-4 h-4" />;
      default:
        return <ArrowLeftRight className="w-4 h-4" />;
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

  const handleExport = () => {
    const csv = [
      ['Reference', 'Type', 'Amount', 'Description', 'Status', 'Date'],
      ...filteredTransactions.map(tx => [
        tx.transaction_ref,
        tx.transaction_type,
        tx.amount,
        tx.description || '',
        tx.status,
        tx.created_date ? format(new Date(tx.created_date), 'yyyy-MM-dd HH:mm') : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500 mt-1">View and manage your transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Action Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 h-auto">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
          >
            All Transactions
          </TabsTrigger>
          <TabsTrigger 
            value="deposit"
            onClick={() => setTransactionModal({ open: true, type: "DEPOSIT" })}
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            <ArrowDownLeft className="w-4 h-4 mr-2" />
            Deposit
          </TabsTrigger>
          <TabsTrigger 
            value="withdraw"
            onClick={() => setTransactionModal({ open: true, type: "WITHDRAWAL" })}
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Withdraw
          </TabsTrigger>
          <TabsTrigger 
            value="transfer"
            onClick={() => setTransactionModal({ open: true, type: "TRANSFER" })}
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Transfer
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/50 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search transactions..."
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48 h-11">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="DEPOSIT">Deposits</SelectItem>
              <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
              <SelectItem value="TRANSFER">Transfers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className={`p-3 rounded-xl ${getTransactionColor(transaction.transaction_type)}`}>
                  {getTransactionIcon(transaction.transaction_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {transaction.transaction_type}
                    </p>
                    <Badge variant="secondary" className={statusColors[transaction.status]}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {transaction.description || transaction.transaction_ref}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {transaction.created_date 
                      ? format(new Date(transaction.created_date), "MMM d, yyyy • h:mm a")
                      : "Unknown date"
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    transaction.transaction_type === "DEPOSIT" 
                      ? "text-emerald-600" 
                      : "text-slate-900"
                  }`}>
                    {transaction.transaction_type === "DEPOSIT" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <ArrowLeftRight className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-medium">No transactions found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your filters"
                : "Your transactions will appear here"
              }
            </p>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <Dialog 
        open={transactionModal.open} 
        onOpenChange={(open) => !open && setTransactionModal({ open: false, type: null })}
      >
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <TransactionForm
            type={transactionModal.type}
            accounts={accounts}
            onSubmit={(data) => transactionMutation.mutate({ type: transactionModal.type, data })}
            onCancel={() => setTransactionModal({ open: false, type: null })}
            isLoading={transactionMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}