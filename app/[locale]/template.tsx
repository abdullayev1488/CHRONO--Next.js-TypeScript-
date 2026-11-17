"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

// template hər naviqasiyada yenidən qurulur: pathname oxumadan səhifə keçid animasiyası verir
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
