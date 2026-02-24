import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  DollarSign,
  Calendar,
  Percent,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2
} from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import LoanCalculator from "@/components/loans/LoanCalculator";
import { authService } from "@/api/authService";

export default function LoanApply() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [calculatedValues, setCalculatedValues] = useState(null);
  const [formData, setFormData] = useState({
    loan_type: "PERSONAL",
    principal_amount: 10000,
    term_months: 24,
    interest_rate: 12.5,
    purpose: "",
    account_id: "",
  });

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', user?.email],
    queryFn: () => {
      // TODO: Replace with actual API call using authService
      // For now, return empty array until API endpoints are implemented
      return Promise.resolve([]);
    },
    enabled: !!user?.email,
  });

  const generateLoanNumber = () => {
    return 'LOAN' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const calculateMonthlyPayment = () => {
    const principal = formData.principal_amount;
    const monthlyRate = formData.interest_rate / 100 / 12;
    const numberOfPayments = formData.term_months;
    
    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }
    
    return principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  };

  const applyMutation = useMutation({
    mutationFn: async () => {
      return authService.applyForLoan(formData);
    },
    onSuccess: () => {
      setStep(4);
    },
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const steps = [
    { number: 1, title: "Loan Details", icon: Receipt },
    { number: 2, title: "Purpose", icon: FileText },
    { number: 3, title: "Review", icon: CheckCircle },
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label>Loan Type</Label>
              <Select
                value={formData.loan_type}
                onValueChange={(value) => setFormData({ ...formData, loan_type: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERSONAL">Personal Loan</SelectItem>
                  <SelectItem value="BUSINESS">Business Loan</SelectItem>
                  <SelectItem value="MORTGAGE">Mortgage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  Loan Amount
                </Label>
                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(formData.principal_amount)}
                </span>
              </div>
              <Slider
                value={[formData.principal_amount]}
                onValueChange={([value]) => setFormData({ ...formData, principal_amount: value })}
                min={1000}
                max={500000}
                step={1000}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>$1,000</span>
                <span>$500,000</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Loan Term
                </Label>
                <span className="text-sm font-semibold text-slate-900">
                  {formData.term_months} months
                </span>
              </div>
              <Slider
                value={[formData.term_months]}
                onValueChange={([value]) => setFormData({ ...formData, term_months: value })}
                min={6}
                max={84}
                step={6}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>6 months</span>
                <span>84 months</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Disbursement Account</Label>
              <Select
                value={formData.account_id}
                onValueChange={(value) => setFormData({ ...formData, account_id: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_type} - {account.account_number?.slice(-4)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Payment Card */}
            <div className="p-5 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 text-white">
              <p className="text-sm text-white/80 mb-1">Estimated Monthly Payment</p>
              <p className="text-3xl font-bold">{formatCurrency(calculateMonthlyPayment())}</p>
              <p className="text-xs text-white/60 mt-2">
                Interest Rate: {formData.interest_rate}% APR
              </p>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label>Purpose of Loan</Label>
              <Textarea
                placeholder="Describe how you plan to use this loan..."
                className="min-h-37.5 resize-none"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              />
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                Providing a clear purpose helps expedite your loan approval process.
              </p>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Loan Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Loan Type</p>
                  <p className="font-semibold text-slate-900">{formData.loan_type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Principal Amount</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(formData.principal_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Term</p>
                  <p className="font-semibold text-slate-900">{formData.term_months} months</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Interest Rate</p>
                  <p className="font-semibold text-slate-900">{formData.interest_rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Monthly Payment</p>
                  <p className="font-semibold text-purple-600">{formatCurrency(calculateMonthlyPayment())}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Repayment</p>
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(calculateMonthlyPayment() * formData.term_months)}
                  </p>
                </div>
              </div>
              {formData.purpose && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500">Purpose</p>
                  <p className="text-slate-900">{formData.purpose}</p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                By submitting this application, you agree to our terms and conditions. 
                Your application will be reviewed within 1-2 business days.
              </p>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Your loan application has been submitted successfully. 
              We'll review it and get back to you within 1-2 business days.
            </p>
            <Button
              onClick={() => navigate(createPageUrl("Loans"))}
              className="bg-linear-to-r from-purple-500 to-purple-600"
            >
              View My Loans
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => step > 1 && step < 4 ? setStep(step - 1) : navigate(createPageUrl("Loans"))}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Apply for Loan</h1>
          <p className="text-slate-500">Complete the form to submit your application</p>
        </div>
      </div>

      {/* Progress Steps */}
      {step < 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <React.Fragment key={s.number}>
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${step >= s.number 
                      ? "bg-linear-to-br from-purple-500 to-purple-600 text-white" 
                      : "bg-slate-100 text-slate-400"
                    }
                  `}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className={`hidden sm:block text-sm font-medium ${
                    step >= s.number ? "text-slate-900" : "text-slate-400"
                  }`}>
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step > s.number ? "bg-purple-500" : "bg-slate-200"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-slate-200/50 p-6 md:p-8">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
            {step > 1 && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                className="flex-1 bg-linear-to-r from-purple-500 to-purple-600"
                onClick={() => setStep(step + 1)}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="flex-1 bg-linear-to-r from-purple-500 to-purple-600"
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
              >
                {applyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}