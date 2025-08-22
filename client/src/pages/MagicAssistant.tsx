import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const MagicAssistant: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white relative overflow-hidden">
      {/* Floating sparkles background effect */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <Sparkles className="w-72 h-72 text-purple-400 opacity-20 animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
          Magic Assistant
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300">
          Something magical is brewing... ✨
        </p>

        <motion.button
          whileHover={{ scale: 1.1, boxShadow: "0px 0px 20px #a855f7" }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl font-medium shadow-lg"
        >
          Notify Me
        </motion.button>
      </motion.div>
    </div>
  );
};

export default MagicAssistant;
