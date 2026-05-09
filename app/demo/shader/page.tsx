import AnoAI from "@/components/ui/animated-shader-background";
import { Sparkles, Rocket, Shield, Brain } from "lucide-react";

export default function ShaderDemo() {
  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-10 overflow-hidden">
      <AnoAI />
      
      <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-float">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-white/80">Premium Visual Effects</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
          High-End <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Shader</span> Backgrounds
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Experience buttery-smooth WebGL animations that bring your landing pages to life. 
          Performance-optimized and fully responsive.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { icon: Rocket, title: "Speed", desc: "Optimized for 60fps" },
            { icon: Shield, title: "Secure", desc: "Hardware accelerated" },
            { icon: Brain, title: "Smart", desc: "Dynamic GPU shaders" },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
              <item.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
