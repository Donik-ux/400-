import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

/* Thin gold reading-progress bar pinned above the navbar. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] origin-left z-[60] pointer-events-none"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #ffd76e, #febb02 45%, #d99a2b)',
        boxShadow: '0 0 10px rgba(254,187,2,0.55)',
      }}
    />
  );
}
