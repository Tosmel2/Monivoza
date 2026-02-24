import React from "react";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Users,
  Wallet,
  Receipt,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Activity,
  DollarSign
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import StatsCard from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/api/authService";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => authService.getAllUsers(),
    enabled: user?.role === "admin",
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['admin-accounts'],
    queryFn: () => authService.getAccounts(),
    enabled: user?.role === "admin",
  });

  const { data: loans = [] } = useQuery({
    queryKey: ['admin-loans'],
    queryFn: () => authService.getLoans(),
    enabled: user?.role === "admin",
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => authService.getTransactions(),
    enabled: user?.role === "admin",
  });

  const totalDeposits = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const pendingLoans = loans.filter(l => l.status === "PENDING").length;
  const activeLoans = loans.filter(l => l.status === "ACTIVE").length;
  const totalLoanAmount = loans
    .filter(l => l.status === "ACTIVE")
    .reduce((sum, l) => sum + (l.outstanding_balance || 0), 0);

  // Advanced metrics
  const totalLoansDisbursed = loans
    .filter(l => ["ACTIVE", "CLOSED"].includes(l.status))
    .reduce((sum, l) => sum + (l.principal_amount || 0), 0);
  
  const avgLoanAmount = loans.length > 0 
    ? loans.reduce((sum, l) => sum + (l.principal_amount || 0), 0) / loans.length 
    : 0;
  
  const approvalRate = loans.length > 0
    ? ((loans.filter(l => ["APPROVED", "ACTIVE", "CLOSED"].includes(l.status)).length / loans.length) * 100).toFixed(1)
    : 0;

  // Transaction volume trends (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const transactionTrends = last7Days.map(date => {
    const dayTransactions = transactions.filter(t => 
      t.created_date && t.created_date.split('T')[0] === date
    );
    return {
      date: format(new Date(date), 'MMM d'),
      amount: dayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
      count: dayTransactions.length
    };
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Loan status distribution for pie chart
  const loanStatusData = [
    { name: "Pending", value: loans.filter(l => l.status === "PENDING").length, color: "#f59e0b" },
    { name: "Active", value: loans.filter(l => l.status === "ACTIVE").length, color: "#10b981" },
    { name: "Approved", value: loans.filter(l => l.status === "APPROVED").length, color: "#3b82f6" },
    { name: "Rejected", value: loans.filter(l => l.status === "REJECTED").length, color: "#ef4444" },
    { name: "Closed", value: loans.filter(l => l.status === "CLOSED").length, color: "#6b7280" },
  ].filter(item => item.value > 0);

  const recentActivities = transactions.slice(0, 8);

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-slate-500">You don't have access to this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your banking platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={users.length}
          icon={Users}
          gradient="blue"
        />
        <StatsCard
          title="Total Deposits"
          value={formatCurrency(totalDeposits)}
          subtitle={`${accounts.length} accounts`}
          icon={Wallet}
          gradient="teal"
        />
        <StatsCard
          title="Pending Loans"
          value={pendingLoans}
          subtitle="Awaiting approval"
          icon={Clock}
          gradient="orange"
        />
        <StatsCard
          title="Active Loans"
          value={activeLoans}
          subtitle={formatCurrency(totalLoanAmount)}
          icon={Receipt}
          gradient="purple"
        />
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <Badge className="bg-indigo-100 text-indigo-700">All Time</Badge>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalLoansDisbursed)}</p>
          <p className="text-sm text-slate-500 mt-1">Total Loans Disbursed</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <Badge className="bg-green-100 text-green-700">{approvalRate}%</Badge>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(avgLoanAmount)}</p>
          <p className="text-sm text-slate-500 mt-1">Avg. Loan Amount</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <Badge className="bg-purple-100 text-purple-700">7 Days</Badge>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {transactionTrends.reduce((sum, d) => sum + d.count, 0)}
          </p>
          <p className="text-sm text-slate-500 mt-1">Transactions</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Volume Trends */}
        <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Transaction Volume (7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={transactionTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Loan Status Distribution</h3>
          {loanStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={loanStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {loanStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-62.5 text-slate-400">
              No loan data available
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {loanStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activities</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.transaction_type === "DEPOSIT" 
                      ? "bg-emerald-100 text-emerald-700" 
                      : activity.transaction_type === "WITHDRAWAL"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {activity.transaction_type === "DEPOSIT" 
                      ? <ArrowDownLeft className="w-4 h-4" />
                      : <ArrowUpRight className="w-4 h-4" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {activity.transaction_type} - {formatCurrency(activity.amount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {activity.created_date 
                        ? format(new Date(activity.created_date), "MMM d, h:mm a")
                        : "Unknown"
                      }
                    </p>
                  </div>
                  <Badge variant="secondary" className={
                    activity.status === "COMPLETED" 
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }>
                    {activity.status}
                  </Badge>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                No recent activities
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}