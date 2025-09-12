import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMode } from '@/contexts/ModeContext';

const ModeToggle: React.FC = () => {
  const { mode, toggleMode } = useMode();
  const navigate = useNavigate();

  const handleModeToggle = () => {
    toggleMode();
    // Always redirect to dashboard when switching modes
    navigate('/dashboard');
  };

  return (
    <motion.button
      onClick={handleModeToggle}
      className={`
        relative p-3 rounded-full transition-all duration-300 ease-in-out
        ${mode === 'kindergarten' 
          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg shadow-yellow-200' 
          : 'bg-gradient-to-r from-gray-700 to-gray-900 shadow-lg shadow-gray-800'
        }
        hover:scale-110 hover:shadow-xl
        focus:outline-none focus:ring-4 focus:ring-opacity-50
        ${mode === 'kindergarten' 
          ? 'focus:ring-yellow-400' 
          : 'focus:ring-gray-400'
        }
      `}
      whileHover={{ 
        scale: 1.1,
        rotate: 5,
      }}
      whileTap={{ 
        scale: 0.95,
        rotate: -5,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: mode === 'kindergarten' ? 0 : 180,
          scale: mode === 'kindergarten' ? 1 : 0.8,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        className="text-white"
      >
        {mode === 'kindergarten' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </motion.div>
      
      {/* Glow effect */}
      <motion.div
        className={`
          absolute inset-0 rounded-full blur-md opacity-0
          ${mode === 'kindergarten' 
            ? 'bg-yellow-400' 
            : 'bg-gray-400'
          }
        `}
        animate={{
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  );
};

export default ModeToggle; 