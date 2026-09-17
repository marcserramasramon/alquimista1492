'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface EmissariAlertModalProps {
  show: boolean
  frase: string
  onDismiss: () => void
}

export function EmissariAlertModal({
  show,
  frase,
  onDismiss,
}: EmissariAlertModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Dark overlay */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
          />

          {/* Modal card */}
          <motion.div
            className="relative w-full max-w-sm bg-[#3d0a0a] rounded-xl border-2 border-red-700 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Red glow effect behind card */}
            <div className="absolute -inset-px bg-gradient-to-br from-red-600 via-red-900 to-red-950 -z-10 rounded-xl blur-xl opacity-50" />

            <div className="relative p-6 sm:p-8">
              {/* Title */}
              <motion.div
                className="text-center mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-red-400 tracking-wider font-serif">
                  ⚠️ L'EMISSARI
                </h2>
                <p className="text-base sm:text-lg font-bold text-red-300 mt-1">
                  ESTÀ PEL POBLE
                </p>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="text-sm sm:text-base text-yellow-300 text-center mb-4 italic font-sans"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                L'han vist aturant a la gent i demanant coses
              </motion.p>

              {/* Body text */}
              <motion.p
                className="text-xs sm:text-sm text-gray-400 text-center mb-4 font-sans"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Se sap que pregunta per:
              </motion.p>

              {/* Reveal section - Frase with pulse effect */}
              <motion.div
                className="bg-[#2a0606] border-2 border-red-800 rounded-lg p-4 sm:p-5 my-5 shadow-inner"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ boxShadow: '0 0 20px rgba(220, 38, 38, 0.5)' }}
              >
                <motion.p
                  className="text-center text-amber-200 text-sm sm:text-base font-serif italic leading-relaxed"
                  animate={{ textShadow: ['0 0 8px rgba(251, 191, 36, 0)', '0 0 12px rgba(251, 191, 36, 0.6)', '0 0 8px rgba(251, 191, 36, 0)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  "{frase}"
                </motion.p>
              </motion.div>

              {/* Warning text */}
              <motion.p
                className="text-xs sm:text-sm text-red-300 text-center mb-6 font-bold font-sans uppercase tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Prepareu les respostes!
              </motion.p>

              {/* Button */}
              <motion.button
                type="button"
                onClick={onDismiss}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-[#2B2118] font-bold text-base sm:text-lg font-sans rounded-lg transition-colors shadow-lg uppercase tracking-wide"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ENTÈS
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
