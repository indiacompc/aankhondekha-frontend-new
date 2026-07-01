"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

/** Fade/slide page wrapper (ported from old app). */
const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="page-container"
  >
    {children}
  </motion.div>
);

export default PageTransition;
