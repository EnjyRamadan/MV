import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const MagicAssistant: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900 relative overflow-hidden">
      {/* Floating sparkles background effect */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <Sparkles className="w-72 h-72 text-blue-300 opacity-10 animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-md">
          Magic Assistant
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600">
          Your intelligent helper, powered by AI ⚡
        </p>

        <motion.button
        disabled
        className="mt-8 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-medium shadow-lg cursor-not-allowed"
        >
        Coming Soon!
        </motion.button>

      </motion.div>
    </div>
  );
};

export default MagicAssistant;
