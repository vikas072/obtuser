"use client";

import React from 'react';
import { Home, Video, Camera, Share2, Heart } from 'lucide-react';

const menuItems = [
  { title: 'Home', icon: Home, gradientFrom: '#a955ff', gradientTo: '#ea51ff' },
  { title: 'Video', icon: Video, gradientFrom: '#56CCF2', gradientTo: '#2F80ED' },
  { title: 'Photo', icon: Camera, gradientFrom: '#FF9966', gradientTo: '#FF5E62' },
  { title: 'Share', icon: Share2, gradientFrom: '#80FF72', gradientTo: '#7EE8FA' },
  { title: 'Tym', icon: Heart, gradientFrom: '#ffa9c6', gradientTo: '#f434e2' }
];

export default function GradientMenu() {
  return (
    <div className="flex justify-center items-center py-20 bg-dark">
      <ul className="flex flex-wrap justify-center gap-6">
        {menuItems.map(({ title, icon: Icon, gradientFrom, gradientTo }, idx) => (
          <li
            key={idx}
            style={{ 
              ['--gradient-from' as any]: gradientFrom, 
              ['--gradient-to' as any]: gradientTo 
            }}
            className="relative w-[60px] h-[60px] bg-card/80 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center transition-all duration-500 hover:w-[180px] hover:shadow-none group cursor-pointer border border-white/10"
          >
            {/* Gradient background on hover */}
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100"></span>
            
            {/* Blur glow */}
            <span className="absolute top-[10px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[15px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50"></span>

            {/* Icon */}
            <span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0">
              <Icon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            </span>

            {/* Title */}
            <span className="absolute text-white uppercase tracking-widest text-xs font-bold transition-all duration-500 scale-0 group-hover:scale-100 delay-150">
              {title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
