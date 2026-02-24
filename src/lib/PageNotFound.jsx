import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        {/* <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Adnegs Bank</h1>
          <p className="text-slate-600">Secure Banking Solutions</p>
        </motion.div> */}

        {/* 404 Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-xl shadow-slate-200/20">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                {/* Icon */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="flex justify-center mb-6"
                >
                  <AlertCircle className="h-20 w-20 text-teal-500" />
                </motion.div>

                {/* 404 Title */}
                <h2 className="text-6xl font-bold text-slate-900 mb-4">404</h2>
                <h3 className="text-2xl font-semibold text-slate-700 mb-2">Page Not Found</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                  The page you're looking for doesn't exist or may have been moved.
                </p>

                {/* Go Home Button */}
                <Link to="/">
                  <Button className="cursor-pointer bg-linear-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold h-11 shadow-lg shadow-teal-500/25">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}