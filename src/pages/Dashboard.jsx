import React from "react";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  Wallet, 
  ArrowLeftRight, 
  Receipt, 
  TrendingUp,
  Plus,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/StatsCard";
import AccountCard from "@/components/dashboard/AccountCard";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { authService } from "@/api/authService";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', user?.email],
    queryFn: () => authService.getAccounts(),
    enabled: !!user?.email,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', user?.email],
    queryFn: () => authService.getTransactions(),
    enabled: !!user?.email,
  });

  const { data: loans = [] } = useQuery({
    queryKey: ['loans', user?.email],
    queryFn: () => {
      // TODO: Replace with actual API call using authService
      // For now, return empty array until API endpoints are implemented
      return Promise.resolve([]);
    },
    enabled: !!user?.email,
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const activeLoans = loans.filter(l => l.status === "ACTIVE");
  const totalLoanAmount = activeLoans.reduce((sum, l) => sum + (l.outstanding_balance || 0), 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGR',
    }).format(amount || 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-slate-900"
          >
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
          </motion.h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your finances</p>
        </div>
        <Link to={createPageUrl("Accounts")}>
          <Button className="bg-linear-to-r from-teal-500 to-teal-600 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            New Account
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Balance"
          value={formatCurrency(totalBalance)}
          subtitle={`#{accounts.length} account${accounts.length !== 1 ? 's' : ''}`}
          icon={Wallet}
          gradient="teal"
        />
        <StatsCard
          title="Transactions"
          value={transactions.length}
          subtitle="This month"
          icon={ArrowLeftRight}
          gradient="blue"
        />
        <StatsCard
          title="Active Loans"
          value={activeLoans.length}
          subtitle={formatCurrency(totalLoanAmount)}
          icon={Receipt}
          gradient="purple"
        />
        <StatsCard
          title="Monthly Income"
          value={formatCurrency(
            transactions
              .filter(t => t.transaction_type === "DEPOSIT")
              .reduce((sum, t) => sum + (t.amount || 0), 0)
          )}
          icon={TrendingUp}
          gradient="orange"
        />
      </div>

      {/* Accounts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Your Accounts</h2>
          <Link to={createPageUrl("Accounts")}>
            <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.slice(0, 3).map((account, index) => (
              <AccountCard
                key={account.id}
                account={account}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/50 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-medium mb-2">No accounts yet</p>
            <p className="text-sm text-slate-500 mb-4">Create your first account to get started</p>
            <Link to={createPageUrl("Accounts")}>
              <Button className="bg-linear-to-r from-teal-500 to-teal-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={transactions} limit={5} />
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to={createPageUrl("Transactions")} className="block">
                <Button variant="outline" className="w-full justify-start h-12">
                  <ArrowLeftRight className="w-5 h-5 mr-3 text-blue-600" />
                  New Transaction
                </Button>
              </Link>
              <Link to={createPageUrl("LoanApply")} className="block">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Receipt className="w-5 h-5 mr-3 text-purple-600" />
                  Apply for Loan
                </Button>
              </Link>
              <Link to={createPageUrl("Accounts")} className="block">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Plus className="w-5 h-5 mr-3 text-teal-600" />
                  Open Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Active Loans Summary */}
          {activeLoans.length > 0 && (
            <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Active Loans</h3>
              <p className="text-3xl font-bold mb-1">{formatCurrency(totalLoanAmount)}</p>
              <p className="text-sm text-white/80">Outstanding balance</p>
              <Link to={createPageUrl("Loans")}>
                <Button 
                  size="sm" 
                  className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  View Loans
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}