"use client";

import { motion, MotionProps } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInUpProps {
  delay?: number;
  once?: boolean;
  amount?: number;
  className?: string;
  children: ReactNode;
}

export default function FadeInUp({
  delay = 0,
  once = true,
  amount = 0.2,
  className,
  children,
}: FadeInUpProps) {
  const prefersReducedMotion = useReducedMotion();

  const motionProps: MotionProps = {
    initial: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 20,
    },
    whileInView: {
      opacity: 1,
      y: 0,
    },
    viewport: {
      once,
      amount,
    },
    transition: {
      duration: 1.0,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
    },
  };

  return (
    <motion.div
      {...motionProps}
      className={cn(className)}
      style={{
        willChange: "transform, opacity",
      }}
    >
      {children}
    </motion.div>
  );
}

