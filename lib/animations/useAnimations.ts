'use client';

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 },
  },
};

export const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0, 0, 0.58, 1] as const },
  },
};

export const scaleVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: [0, 0, 0.58, 1] as const },
  },
};

export const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: [0.42, 0, 0.58, 1] as const,
    },
  },
};

export const buttonHoverVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

export const shakeVariants = {
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
      ease: [0.42, 0, 0.58, 1] as const,
    },
  },
};

export const zoomVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0, 0, 0.58, 1] as const,
    },
  },
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};
