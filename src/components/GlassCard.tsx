"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
}

/** Gray "glass" card with entry + hover-lift animation (ported from old app). */
const GlassCard = ({ children, className = "", onClick, delay = 0 }: GlassCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={`glass-card ml-2 mr-2 rounded-2xl p-6 ${className}`}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

export default GlassCard;
