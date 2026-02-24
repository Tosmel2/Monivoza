import React, { useState, useEffect, useMemo } from "react";
import { Calculator, DollarSign, Percent, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function LoanCalculator({ onCalculate }) {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(12.5);
  const [term, setTerm] = useState(24);

  const result = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = term;
    
    let monthlyPayment;
    if (monthlyRate === 0) {
      monthlyPayment = principal / numberOfPayments;
    } else {
      monthlyPayment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }
    
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
    };
  }, [principal, rate, term]);

  // Call onCalculate when result changes
  useEffect(() => {
    onCalculate?.(result);
  }, [result, onCalculate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 text-white">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Loan Calculator</h3>
          <p className="text-sm text-slate-500">Estimate your monthly payments</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              Loan Amount
            </Label>
            <span className="text-sm font-semibold text-slate-900">{formatCurrency(principal)}</span>
          </div>
          <Slider
            value={[principal]}
            onValueChange={([value]) => setPrincipal(value)}
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
              <Percent className="w-4 h-4 text-slate-400" />
              Interest Rate
            </Label>
            <span className="text-sm font-semibold text-slate-900">{rate}%</span>
          </div>
          <Slider
            value={[rate]}
            onValueChange={([value]) => setRate(value)}
            min={1}
            max={30}
            step={0.5}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>1%</span>
            <span>30%</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Loan Term
            </Label>
            <span className="text-sm font-semibold text-slate-900">{term} months</span>
          </div>
          <Slider
            value={[term]}
            onValueChange={([value]) => setTerm(value)}
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
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-5 rounded-xl bg-linear-to-br from-slate-50 to-slate-100 border border-slate-200"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500 mb-1">Monthly Payment</p>
              <p className="text-lg font-bold text-teal-600">{formatCurrency(result.monthlyPayment)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Interest</p>
              <p className="text-lg font-bold text-slate-700">{formatCurrency(result.totalInterest)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Payment</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(result.totalPayment)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}