/**
 * INSPIRING LOADING STATES
 * Not spinning circles. Real motivation while you wait.
 */

import { motion } from 'framer-motion';
import { Sparkles, Target, TrendingUp, Zap, Crown, Mountain } from 'lucide-react';

// Motivational micro-quotes for loading states
const loadingQuotes = [
  "Every master was once a beginner...",
  "Small steps. Big dreams.",
  "You're building momentum...",
  "Consistency compounds...",
  "Progress over perfection...",
  "Your future self will thank you...",
  "One day at a time...",
  "You've got this...",
];

/**
 * Full page loading with inspiration
 */
export const PageLoading = ({ message }) => {
  const quote = loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Animated icon */}
        <motion.div
          className="relative mx-auto w-24 h-24 flex items-center justify-center"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Pulsing glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#d4a574] to-[#ffd700]"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Icon */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-12 h-12 text-[#d4a574]" />
          </motion.div>
        </motion.div>

        {/* Loading message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <p className="text-xl text-gray-300">{message || "Loading your journey..."}</p>
          <motion.p
            className="text-sm text-[#d4a574] italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {quote}
          </motion.p>
        </motion.div>

        {/* Animated progress bar */}
        <div className="w-64 mx-auto h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#d4a574] to-[#ffd700]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Inline loading for sections
 */
export const SectionLoading = ({ message, icon: Icon = Target }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 space-y-4"
    >
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity }
        }}
        className="relative"
      >
        <motion.div
          className="absolute inset-0 blur-xl bg-[#d4a574]/30 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <Icon className="w-8 h-8 text-[#d4a574] relative z-10" />
      </motion.div>
      <p className="text-sm text-gray-400">{message || "Loading..."}</p>
    </motion.div>
  );
};

/**
 * Skeleton loader for lists
 */
export const SkeletonCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 space-y-4"
    >
      {/* Title skeleton */}
      <div className="flex items-center justify-between">
        <motion.div
          className="h-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg w-1/3"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="h-8 w-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
      </div>

      {/* Content skeletons */}
      <div className="space-y-2">
        <motion.div
          className="h-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded w-2/3"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />
        <motion.div
          className="h-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded w-1/2"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
      </div>

      {/* Progress bar skeleton */}
      <motion.div
        className="h-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      />
    </motion.div>
  );
};

/**
 * Button loading state
 */
export const ButtonLoading = () => {
  return (
    <motion.div
      className="flex items-center space-x-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="flex space-x-1"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-[#d4a574] rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>
      <span>Processing...</span>
    </motion.div>
  );
};

/**
 * Empty state with inspiration
 */
export const EmptyState = ({ icon: Icon = Mountain, title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16 px-4"
    >
      {/* Icon with glow */}
      <motion.div
        className="relative mx-auto w-24 h-24 flex items-center justify-center mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <motion.div
          className="absolute inset-0 blur-2xl bg-[#d4a574]/20 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <Icon className="w-16 h-16 text-[#d4a574]/60" />
      </motion.div>

      {/* Text */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-gray-200 mb-3"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-400 max-w-md mx-auto mb-8"
      >
        {description}
      </motion.p>

      {/* Action */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

export default {
  PageLoading,
  SectionLoading,
  SkeletonCard,
  ButtonLoading,
  EmptyState,
};
