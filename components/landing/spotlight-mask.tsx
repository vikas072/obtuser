"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface SpotlightMaskProps {
  children: React.ReactNode;
}

export function SpotlightMask({ children }: SpotlightMaskProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of this specific section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Grow the spotlight from 0% to 150% of the container size
  // We start the reveal when the section is 20% visible and finish at 80%
  const radius = useTransform(scrollYProgress, [0.1, 0.6], ["0%", "150%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <section 
      ref={sectionRef} 
      className="relative bg-black overflow-hidden py-24 md:py-32"
    >
      {/* 
        This is the container that will be clipped. 
        Everything outside the circle will reveal the black background of the parent section.
      */}
      <motion.div
        style={{
          clipPath: `circle(${radius} at 50% 50%)`,
          WebkitClipPath: `circle(${radius} at 50% 50%)`,
          opacity,
        }}
        className="relative z-10"
      >
        {children}
      </motion.div>

      {/* Decorative spotlight glow behind the content */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          style={{
            scale: useTransform(scrollYProgress, [0, 1], [0.5, 1.5]),
            opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.2, 0]),
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 rounded-full blur-[120px]" 
        />
      </div>
    </section>
  );
}
