"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Clock } from "lucide-react";
import { useRazorpay } from "@/src/hooks/useRazorpay";

const features = [
  "Access to all 4 years content",
  "500+ Video Lectures",
  "1000+ Notes PDFs",
  "Offline Download Access",
  "Regular Content Updates",
  "24/7 Support",
  "Lifetime Access",
  "No Hidden Fees",
];

export function Pricing() {
  const { startPayment, isLoading } = useRazorpay();
  const [timeLeft, setTimeLeft] = useState({ hours: 24, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    const calculateTimeLeft = () => {
      let startTime = localStorage.getItem("offerStartTime");
      if (!startTime) {
        startTime = Date.now().toString();
        localStorage.setItem("offerStartTime", startTime);
      }
      
      let elapsed = Date.now() - parseInt(startTime, 10);
      if (elapsed > TWENTY_FOUR_HOURS) {
        // Reset if it hits 0
        startTime = Date.now().toString();
        localStorage.setItem("offerStartTime", startTime);
        elapsed = 0;
      }
      
      const remaining = TWENTY_FOUR_HOURS - elapsed;
      
      const h = Math.floor((remaining / (1000 * 60 * 60)) % 24);
      const m = Math.floor((remaining / 1000 / 60) % 60);
      const s = Math.floor((remaining / 1000) % 60);
      
      setTimeLeft({ hours: h, minutes: m, seconds: s });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (t: number) => t.toString().padStart(2, '0');

  return (
    <section className="relative py-24 px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Simple,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            One payment. Lifetime access. No subscriptions. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-2xl opacity-20" />

          <div className="relative bg-card/70 backdrop-blur-2xl border border-primary/30 rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/20 to-transparent rounded-tr-full" />

            {/* Popular badge */}
            <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary to-accent rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-semibold text-white">
                BEST VALUE
              </span>
            </div>

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              {/* Left side - Price */}
              <div className="text-center md:text-left">
                <p className="text-muted-foreground mb-2">One-time Payment</p>
                <div className="flex items-baseline justify-center md:justify-start gap-2 mb-4">
                  <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    ₹29
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹299
                  </span>
                </div>
                <p className="text-sm text-accent font-medium mb-2">
                  90% OFF - Limited Time Offer!
                </p>
                
                {isMounted ? (
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent font-mono text-sm shadow-sm">
                      <Clock className="w-4 h-4 animate-pulse" />
                      <span>Offer ends in: </span>
                      <span className="font-bold">{formatTime(timeLeft.hours)}</span>:
                      <span className="font-bold">{formatTime(timeLeft.minutes)}</span>:
                      <span className="font-bold">{formatTime(timeLeft.seconds)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-[34px] mb-6" /> // Placeholder to prevent layout shift
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startPayment}
                  disabled={isLoading}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Zap className="w-5 h-5" />
                  {isLoading ? "Processing..." : "Get Lifetime Access"}
                </motion.button>

                <p className="text-xs text-muted-foreground mt-4">
                  Secure payment via Razorpay
                </p>
              </div>

              {/* Right side - Features */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">Instant Access</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">500+ Students Enrolled</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
