'use client';

import React from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TimelineContentProps {
  children: React.ReactNode;
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLDivElement>;
  customVariants?: Variants;
  className?: string;
  as?: React.ElementType;
}

export const TimelineContent = ({
  children,
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  as = 'div',
}: TimelineContentProps) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const defaultVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: animationNum * 0.1,
      }
    },
  };

  const MotionComponent = motion(as as any);

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={customVariants || defaultVariants}
      className={cn(className)}
    >
      {children}
    </MotionComponent>
  );
};
