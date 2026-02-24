import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Building2,
  Shield,
  TrendingUp,
  Users,
  Wallet,
  ArrowLeftRight,
  Receipt,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xl tracking-tight">MoniVoza</span>
              <p className="text-xs text-slate-500">Smart Money. Fast Access</p>
            </div>
          </div>
          <Link to="/login">
            <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-100">
              <Sparkles className="w-4 h-4 mr-2" />
              Next-Gen Banking
            </Badge> */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Your Mini Banking &
              <span className="bg-linear-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent"> Loan Solution</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience seamless financial management with our comprehensive banking platform.
              Manage accounts, apply for loans, and handle transactions with confidence and ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-linear-to-r from-teal-500 to-teal-600 hover:opacity-90 text-lg px-8 py-4 h-auto">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto border-slate-200 hover:bg-slate-50">
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {[
              { number: "10K+", label: "Active Users", icon: Users },
              { number: "₦2.5B+", label: "Loans Disbursed", icon: TrendingUp },
              { number: "99.9%", label: "Uptime", icon: Shield },
              { number: "24/7", label: "Support", icon: CheckCircle }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.number}</div>
                <div className="text-slate-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need for Modern Banking
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to simplify your financial life
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {[
              {
                icon: Wallet,
                title: "Account Management",
                description: "Create and manage multiple accounts with real-time balance tracking and detailed transaction history.",
                gradient: "from-teal-500 to-teal-600"
              },
              {
                icon: Receipt,
                title: "Loan Services",
                description: "Apply for loans with our streamlined process, track payments, and manage your loan portfolio effortlessly.",
                gradient: "from-slate-500 to-slate-600"
              },
              {
                icon: ArrowLeftRight,
                title: "Secure Transactions",
                description: "Perform instant transfers with bank-grade security and comprehensive transaction monitoring.",
                gradient: "from-teal-500 to-teal-600"
              },
              {
                icon: TrendingUp,
                title: "Financial Insights",
                description: "Get detailed analytics and reports to understand your spending patterns and financial health.",
                gradient: "from-slate-500 to-slate-600"
              },
              {
                icon: Shield,
                title: "Advanced Security",
                description: "Your data is protected with enterprise-level encryption and multi-factor authentication.",
                gradient: "from-teal-500 to-teal-600"
              },
              {
                icon: Users,
                title: "24/7 Support",
                description: "Our dedicated support team is always ready to help you with any questions or concerns.",
                gradient: "from-slate-500 to-slate-600"
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full bg-white border-slate-200/50 hover:shadow-xl hover:shadow-slate-200/25 transition-all duration-300 group">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get started in just three simple steps
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up with your details and verify your identity to get started."
              },
              {
                step: "02",
                title: "Set Up Banking",
                description: "Open accounts, link existing ones, and configure your preferences."
              },
              {
                step: "03",
                title: "Start Banking",
                description: "Access all features, make transactions, and manage your finances."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-700">{step.step}</span>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust MoniVoza
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {[
              {
                name: "Sarah Johnson",
                role: "Small Business Owner",
                content: "MoniVoza has transformed how I manage my business finances. The loan process was incredibly smooth.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Freelancer",
                content: "The interface is intuitive and the security features give me peace of mind. Highly recommended!",
                rating: 5
              },
              {
                name: "Emily Davis",
                role: "Student",
                content: "Perfect for managing my student loans and savings. The app is fast and reliable.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full bg-white border-slate-200/50">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-600">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to know about MoniVoza
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {[
              {
                question: "How do I apply for a loan?",
                answer: "Applying for a loan is simple. Sign up for an account, complete your profile, and navigate to the Loans section. Choose your loan type, enter the amount needed, and submit your application. Our team will review it within 24 hours."
              },
              {
                question: "Is my data secure?",
                answer: "Yes, security is our top priority. We use bank-grade encryption, multi-factor authentication, and comply with all financial regulations. Your personal and financial data is protected with the highest security standards."
              },
              {
                question: "What are the loan interest rates?",
                answer: "Our interest rates vary based on loan type, amount, and your credit profile. Rates typically range from 8% to 24% APR. You'll see exact rates during the application process before committing."
              },
              {
                question: "How long does loan approval take?",
                answer: "Most loan applications are reviewed within 24 hours. Simple loans may be approved instantly, while larger amounts may take 2-3 business days for full verification and approval."
              },
              {
                question: "Can I manage multiple accounts?",
                answer: "Absolutely! You can create and manage multiple savings and checking accounts within your MoniVoza dashboard. Track balances, view transaction history, and transfer funds between accounts easily."
              },
              {
                question: "Are there any hidden fees?",
                answer: "We believe in transparency. There are no hidden fees at MoniVoza. All applicable fees are clearly disclosed during account setup and loan applications. Standard banking fees may apply for certain services."
              }
            ].map((faq, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="bg-white border-slate-200/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-slate-900">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-teal-500 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join MoniVoza today and experience the future of digital banking.
              No hidden fees, no complicated processes – just simple, powerful banking.
            </p>
            <Link to="/login">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-white/90 text-lg px-8 py-4 h-auto">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">MoniVoza</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Your trusted partner for digital banking and loan solutions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    to={isAuthenticated ? "/Accounts" : "/login"}
                    className="hover:text-white transition-colors"
                  >
                    Accounts
                  </Link>
                </li>
                <li>
                  <Link
                    to={isAuthenticated ? "/Loans" : "/login"}
                    className="hover:text-white transition-colors"
                  >
                    Loans
                  </Link>
                </li>
                <li>
                  <Link
                    to={isAuthenticated ? "/Transactions" : "/login"}
                    className="hover:text-white transition-colors"
                  >
                    Transactions
                  </Link>
                </li>
                <li><a href="#" className="hover:text-white transition-colors">Cards</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2026 MoniVoza. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;