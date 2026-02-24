import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
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
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/login">
                <Button className="bg-linear-to-r from-teal-500 to-teal-600 hover:opacity-90">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
            <p className="text-slate-600 text-lg">
              Last updated: February 18, 2026
            </p>
          </motion.div>

          <motion.div
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-white border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">Introduction</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  At MoniVoza, we are committed to protecting your privacy and ensuring the security of your personal information.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital banking services.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Personal Information</h3>
                <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                  <li>Name, email address, phone number, and date of birth</li>
                  <li>Government-issued identification documents</li>
                  <li>Financial information including account numbers and transaction history</li>
                  <li>Employment and income information for loan applications</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mb-3">Technical Information</h3>
                <ul className="list-disc pl-6 text-slate-700 space-y-2">
                  <li>IP address, browser type, and device information</li>
                  <li>Usage data and interaction with our services</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <p className="text-slate-700 mb-4">We use your information to:</p>
                <ul className="list-disc pl-6 text-slate-700 space-y-2">
                  <li>Provide and maintain our banking services</li>
                  <li>Process transactions and loan applications</li>
                  <li>Verify your identity and prevent fraud</li>
                  <li>Communicate with you about your accounts and services</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Improve our services and develop new features</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">Information Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <p className="text-slate-700 mb-4">We may share your information in the following circumstances:</p>
                <ul className="list-disc pl-6 text-slate-700 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations and regulatory requirements</li>
                  <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
                  <li>In connection with a business transfer or merger</li>
                  <li>To protect our rights, property, or safety, or that of our users</li>
                </ul>
                <p className="text-slate-700 mt-4">
                  We do not sell your personal information to third parties for marketing purposes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">Data Security</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  We implement industry-standard security measures to protect your personal information, including:
                </p>
                <ul className="list-disc pl-6 text-slate-700 space-y-2 mt-4">
                  <li>256-bit SSL/TLS encryption for all data transmission</li>
                  <li>Multi-factor authentication for account access</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Secure data centers with redundant backups</li>
                  <li>Employee training on data protection and privacy</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <p className="text-slate-700 mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 text-slate-700 space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information (subject to legal requirements)</li>
                  <li>Opt out of certain communications</li>
                  <li>Request data portability</li>
                </ul>
                <p className="text-slate-700 mt-4">
                  To exercise these rights, please contact us through your account dashboard or our support channels.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns,
                  and provide personalized services. You can control cookie preferences through your browser settings,
                  though this may affect certain features of our service.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">International Data Transfers</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own.
                  We ensure that such transfers comply with applicable data protection laws and implement
                  appropriate safeguards to protect your information.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly
                  collect personal information from children under 18. If we become aware that we have collected
                  such information, we will take steps to delete it.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes
                  by posting the new policy on this page and updating the "Last updated" date. We encourage you
                  to review this policy periodically.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <p className="text-slate-700 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="text-slate-700">
                  <p><strong>Email:</strong> privacy@MoniVoza.com</p>
                  <p><strong>Phone:</strong> +234 (0) 123 456 7890</p>
                  <p><strong>Address:</strong> 123 Financial District, Lagos, Nigeria</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>&copy; 2026 MoniVoza. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;