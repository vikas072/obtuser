"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Code, Cpu, GraduationCap, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const years = [
  {
    id: 1,
    year: "1st Year",
    subjects: "Physics, Chemistry, Maths-I & II, Basic Engineering",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20",
    semesters: [1, 2],
  },
  {
    id: 2,
    year: "2nd Year",
    subjects: "Data Structures, Python, Maths-III & IV, Soft Skills",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
    semesters: [3, 4],
  },
  {
    id: 3,
    year: "3rd Year",
    subjects: "Operating Systems, Computer Networks, AI/ML, Web Dev",
    icon: Cpu,
    color: "from-violet-500 to-purple-500",
    shadow: "shadow-violet-500/20",
    semesters: [5, 6],
  },
  {
    id: 4,
    year: "4th Year",
    subjects: "Cloud Computing, Blockchain, Cyber Security, Projects",
    icon: GraduationCap,
    color: "from-orange-500 to-amber-500",
    shadow: "shadow-orange-500/20",
    semesters: [7, 8],
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
  const router = useRouter();
  const [selectedYearData, setSelectedYearData] = useState<any>(null);

  const handleYearClick = (item: any) => {
    setSelectedYearData(item);
  };

  const handleSemesterSelect = (sem: number) => {
    if (selectedYearData) {
      router.push(`/dashboard?year=${selectedYearData.id}&semester=${sem}`);
      setSelectedYearData(null);
    }
  };

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
            Select your current year and semester to access all the study materials you need
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
                onClick={() => handleYearClick(item)}
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
                  <span className="text-sm font-medium">Select Semester</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Semester Selection Modal */}
      <Dialog open={!!selectedYearData} onOpenChange={(open) => !open && setSelectedYearData(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Select Semester
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Choose your current semester for {selectedYearData?.year}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {selectedYearData?.semesters.map((sem: number) => (
              <button
                key={sem}
                onClick={() => handleSemesterSelect(sem)}
                className="group relative p-6 rounded-2xl border border-border bg-secondary/30 hover:bg-primary hover:border-primary transition-all duration-300 text-center"
              >
                <span className="block text-3xl font-bold mb-1 group-hover:text-white transition-colors">
                  Sem {sem}
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors uppercase tracking-widest font-semibold">
                  Access Now
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
