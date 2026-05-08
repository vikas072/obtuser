"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const plans = [
  {
    name: "Standard",
    description:
      "Full access to all 1st and 2nd year subjects with notes and video lectures.",
    price: 299,
    yearlyPrice: 499,
    buttonText: "Unlock Now",
    buttonVariant: "outline" as const,
    includes: [
      "Access to All Subjects",
      "Handwritten Notes",
      "Topic-wise Video Lectures",
      "Practice Questions",
      "Regular Updates",
      "Mobile Responsive Access",
    ],
  },
  {
    name: "Pro Pack",
    description:
      "Most popular choice for serious students looking to excel in exams.",
    price: 599,
    yearlyPrice: 999,
    buttonText: "Get Pro Access",
    buttonVariant: "default" as const,
    popular: true,
    includes: [
      "Everything in Standard, plus:",
      "Previous Year Solved Papers",
      "VIP Doubt Support",
      "Exclusive Masterclasses",
      "Priority Updates",
      "Downloadable PDFs",
    ],
  },
  {
    name: "Ultimate",
    description:
      "Complete 4-year engineering companion for total academic success.",
    price: 1499,
    yearlyPrice: 2499,
    buttonText: "Get Ultimate",
    buttonVariant: "outline" as const,
    includes: [
      "Everything in Pro Pack, plus:",
      "Placement Prep Kit",
      "Interview Guidance",
      "Resume Building Support",
      "Lifetime Community Access",
      "One-on-One Mentorship",
    ],
  },
];

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900 border border-gray-700 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit h-10  rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "0" ? "text-white" : "text-gray-200",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-primary border-primary bg-gradient-to-t from-primary/80 to-primary"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "1" ? "text-white" : "text-gray-200",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-10 w-full  rounded-full border-4 shadow-sm shadow-primary border-primary bg-gradient-to-t from-primary/80 to-primary"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">Yearly</span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection4() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <div
      className=" min-h-screen mx-auto relative bg-black overflow-hidden"
      ref={pricingRef}
    >
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute top-0 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)] "
      >
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff2c_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a01_1px,transparent_1px)] bg-[size:70px_80px] "></div>
        <SparklesComp
          density={1800}
          direction="bottom"
          speed={1}
          color="#FFFFFF"
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </TimelineContent>
      
      <TimelineContent
        animationNum={5}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute left-0 top-[-114px] w-full h-full flex flex-col items-start justify-start content-start flex-none flex-nowrap gap-2.5 overflow-hidden p-0 z-0"
      >
        <div className="framer-1i5axl2 w-full h-full relative">
          <div
            className="absolute left-[-20%] right-[-20%] top-0 h-[800px] flex-none rounded-full"
            style={{
              border: "100px solid #6366f1",
              filter: "blur(120px)",
              WebkitFilter: "blur(120px)",
              opacity: 0.1,
            }}
          ></div>
        </div>
      </TimelineContent>

      <article className="relative z-50 text-center mb-12 pt-24 max-w-3xl mx-auto space-y-4">
        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center "
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            Choose the Plan that Fits Your Goal
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto"
        >
          Invest in your future with our affordable study packages. Unlock your potential today.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="pt-4"
        >
          <PricingSwitch onSwitch={togglePricingPeriod} />
        </TimelineContent>
      </article>

      <div className="relative z-10 grid md:grid-cols-3 max-w-6xl gap-6 px-4 py-12 mx-auto ">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="h-full"
          >
            <Card
              className={`h-full relative text-white border-neutral-800 transition-all duration-500 hover:border-primary/50 ${
                plan.popular
                  ? "bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 shadow-[0px_0px_50px_-12px_rgba(99,102,241,0.5)] z-20 border-primary/30"
                  : "bg-neutral-900/50 backdrop-blur-sm z-10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-xs font-bold rounded-full text-white uppercase tracking-wider z-30">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-left pb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    ₹
                    <NumberFlow
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      className="text-4xl font-bold"
                    />
                  </span>
                  <span className="text-gray-400 font-medium">
                    /{isYearly ? "pack" : "sem"}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-3 leading-relaxed">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-4">
                <button
                  className={`w-full mb-8 p-4 text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                    plan.popular
                      ? "bg-gradient-to-r from-primary to-accent shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white"
                      : "bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                  }`}
                >
                  {plan.buttonText}
                </button>

                <div className="space-y-4 pt-6 border-t border-neutral-800">
                  <ul className="space-y-3">
                    {plan.includes.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-3"
                      >
                        <div className={`h-1.5 w-1.5 rounded-full ${plan.popular ? "bg-primary" : "bg-neutral-500"}`} />
                        <span className="text-sm text-gray-300 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}
