"use client";

import { motion } from "framer-motion";
import { BookOpen, Code, Cpu, GraduationCap } from "lucide-react";

const years = [
  {
    year: "1st Year",
    subjects: "Physics, Chemistry, Mathematics, Basic Engineering",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20",
  },
  {
    year: "2nd Year",
    subjects: "Data Structures, Digital Electronics, OOPs, Database",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
  },
  {
    year: "3rd Year",
    subjects: "Operating Systems, Computer Networks, AI/ML, Web Dev",
    icon: Cpu,
    color: "from-violet-500 to-purple-500",
    shadow: "shadow-violet-500/20",
  },
  {
    year: "4th Year",
    subjects: "Cloud Computing, Blockchain, Cyber Security, Projects",
    icon: GraduationCap,
    color: "from-orange-500 to-amber-500",
    shadow: "shadow-orange-500/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function YearCards() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Year
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select your current year to access all the study materials you need
          </p>
        </motion.div>

        {/* Year Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {years.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`group relative p-6 rounded-2xl bg-card backdrop-blur-xl border border-border cursor-pointer transition-all duration-300 hover:border-primary/50 hover:${item.shadow} hover:shadow-xl`}
              >
                {/* Glow effect on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Icon */}
                <div
                  className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg ${item.shadow}`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="relative text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {item.year}
                </h3>
                <p className="relative text-sm text-muted-foreground leading-relaxed">
                  {item.subjects}
                </p>

                {/* Arrow indicator */}
                <div className="relative flex items-center gap-2 mt-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Explore</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
