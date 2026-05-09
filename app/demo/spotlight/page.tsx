import { GlowCard } from "@/components/ui/spotlight-card";
import { Sparkles, Zap, Shield } from "lucide-react";

export default function SpotlightDemo() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 gap-10">
      <h1 className="text-4xl font-bold text-white mb-10">Spotlight Cards</h1>
      
      <div className="flex flex-wrap items-center justify-center gap-10">
        <GlowCard glowColor="blue">
          <div className="flex flex-col h-full justify-between p-4 z-10">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Fast Setup</h2>
              <p className="text-gray-400 text-sm mt-2">Get up and running in minutes with our streamlined integration.</p>
            </div>
          </div>
        </GlowCard>

        <GlowCard glowColor="purple">
          <div className="flex flex-col h-full justify-between p-4 z-10">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Premium UI</h2>
              <p className="text-gray-400 text-sm mt-2">Beautiful animations and micro-interactions for a premium feel.</p>
            </div>
          </div>
        </GlowCard>

        <GlowCard glowColor="green">
          <div className="flex flex-col h-full justify-between p-4 z-10">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Secure Access</h2>
              <p className="text-gray-400 text-sm mt-2">Enterprise-grade security built into every layer of our platform.</p>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
