"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Code, Cpu, GraduationCap, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const secondYearCurriculum = [
  {
    branch: "Mechanical Engineering",
    year: "2nd Year",
    subjects: [
      "Technical Communication",
      "Human Value",
      "Math-IV",
      "Digital Electronics",
      "SOM",
      "Manufacturing Processes",
      "ATD",
      "TD",
      "Python",
      "Cyber Security",
      "FM",
      "ME",
    ],
  },
  {
    branch: "EEE",
    year: "2nd Year",
    subjects: [
      "Technical Communication",
      "Human Value",
      "Python",
      "Cyber Security",
      "Maths-IV",
      "Digital Electronics",
      "NAS",
      "Digital Electronics Lab",
      "EM-I",
      "EMI",
      "EMFT",
      "BSS",
    ],
  },
  {
    branch: "ECE",
    year: "2nd Year",
    subjects: [
      "Technical Communication",
      "Human Value",
      "Python",
      "Cyber Security",
      "Math-IV",
      "Digital Electronics",
      "Signal System",
      "Analog",
      "CE",
      "NAS",
      "DSD",
      "ED",
    ],
  },
  {
    branch: "Civil Engineering",
    year: "2nd Year",
    subjects: [
      "Technical Communication",
      "Python",
      "Human Value",
      "Math-IV",
      "Digital Electronics",
      "MTCP",
      "SOM",
      "HEM",
      "Surveying",
      "FM",
      "EM",
      "Cyber Security",
    ],
  },
];

const thirdYearCurriculum = [
  {
    branch: "CSE & Allied",
    year: "3rd Year",
    subjects: [
      "Constitution of India",
      "Essence of Indian Traditional Knowledge",
      "DBMS",
      "Web Technology",
      "DAA",
      "Software Engineering",
      "Compiler Design",
      "Computer Networks",
    ],
  },
  {
    branch: "Civil Engineering",
    year: "3rd Year",
    subjects: [
      "Constitution of India",
      "Essence of Indian Traditional Knowledge",
      "Geotechnical Engineering",
      "Structural Analysis",
      "Quantity Estimation and Construction Management",
    ],
  },
  {
    branch: "EEE",
    year: "3rd Year",
    subjects: [
      "Constitution of India",
      "Essence of Indian Traditional Knowledge",
      "Power System - I",
      "Control System",
      "Electrical Machines - II",
      "Power System - II",
      "Power Electronics",
      "Microprocessor",
    ],
  },
  {
    branch: "ECE",
    year: "3rd Year",
    subjects: [
      "Constitution of India",
      "Essence of Indian Traditional Knowledge",
      "Integrated Circuits",
      "Microprocessor & Microcontroller",
      "Digital Signal Processing",
      "Digital Communication",
      "Control System",
      "Antenna and Wave Propagation",
    ],
  },
  {
    branch: "Mechanical Engineering",
    year: "3rd Year",
    subjects: [
      "Constitution of India",
      "Essence of Indian Traditional Knowledge",
      "Heat & Mass Transfer",
      "Machine Design",
      "Industrial Engineering",
      "Refrigeration and AC",
      "CAD",
      "CAM",
      "Theory of Machine",
    ],
  },
];

const curriculumSections = [
  {
    title: "2nd Year Subjects",
    items: secondYearCurriculum,
  },
  {
    title: "3rd Year Subjects",
    items: thirdYearCurriculum,
  },
];

const years = [
  {
    id: 1,
    year: "1st Year",
    subjects: "Mathematics 1 & 2, Physics, Chemistry, PPS, EVS & more",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20",
    semesters: [1, 2],
  },
  {
    id: 2,
    year: "2nd Year",
    subjects: "Data Structure, Python, OOP Java, COA, OS, Cyber Security & more",
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
            Subjects /{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Curriculum
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select your current year and review the latest branch-wise subject lists.
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

        {curriculumSections.map((section) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-16"
          >
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
                Branch Curriculum
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                {section.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.items.map((item) => (
                <motion.article
                  key={`${item.year}-${item.branch}`}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/5"
                >
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <h4 className="text-xl font-bold text-foreground">
                        {item.branch}
                      </h4>
                      <p className="text-sm font-medium text-primary">
                        {item.year}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {item.subjects.length} Subjects
                    </span>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {item.subjects.map((subject) => (
                      <li
                        key={`${item.year}-${item.branch}-${subject}`}
                        className="rounded-lg border border-border/70 bg-secondary/25 px-3 py-2 text-sm font-medium text-foreground"
                      >
                        {subject}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              ))}
            </div>
          </motion.div>
        ))}
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
