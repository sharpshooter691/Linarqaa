import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, RotateCcw } from 'lucide-react';

interface ColorWheelPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  onReset?: () => void;
  className?: string;
}

const ColorWheelPicker: React.FC<ColorWheelPickerProps> = ({
  label,
  value,
  onChange,
  onReset,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Extended predefined colors
  const predefinedColors = [
    // Warm colors
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    // Cool colors
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    // Pink/Purple
    '#d946ef', '#ec4899', '#f43f5e', '#be185d', '#7c3aed', '#5b21b6',
    // Neutral colors
    '#64748b', '#475569', '#334155', '#1e293b', '#0f172a',
    // Light colors
    '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8',
    // Custom gradients
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3',
    '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#ee5a24', '#0984e3'
  ];

  // Convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0;
    } else if (1/6 <= h && h < 2/6) {
      r = x; g = c; b = 0;
    } else if (2/6 <= h && h < 3/6) {
      r = 0; g = c; b = x;
    } else if (3/6 <= h && h < 4/6) {
      r = 0; g = x; b = c;
    } else if (4/6 <= h && h < 5/6) {
      r = x; g = 0; b = c;
    } else if (5/6 <= h && h < 1) {
      r = c; g = 0; b = x;
    }
    
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  };

  // Convert RGB to HEX
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // Draw color wheel
  const drawColorWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = 200;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 80;
    
    canvas.width = size;
    canvas.height = size;
    
    // Draw color wheel
    for (let angle = 0; angle < 360; angle += 1) {
      for (let r = 0; r < radius; r += 1) {
        const x = centerX + r * Math.cos((angle - 90) * Math.PI / 180);
        const y = centerY + r * Math.sin((angle - 90) * Math.PI / 180);
        
        const saturation = (r / radius) * 100;
        const lightness = 50;
        const [red, green, blue] = hslToRgb(angle, saturation, lightness);
        
        ctx.fillStyle = rgbToHex(red, green, blue);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    
    // Draw center circle for lightness
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
  };

  useEffect(() => {
    if (isOpen) {
      drawColorWheel();
    }
  }, [isOpen]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= 80) {
      const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      const hue = (angle + 360) % 360;
      const saturation = Math.min((distance / 80) * 100, 100);
      const lightness = 50;
      
      const [r, g, b] = hslToRgb(hue, saturation, lightness);
      const hex = rgbToHex(r, g, b);
      onChange(hex);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div className="flex items-center space-x-2">
        {/* Color Preview */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
            style={{ backgroundColor: value }}
          >
            <Palette className="w-4 h-4 text-white drop-shadow-sm" />
          </button>
          
          {/* Color Picker Dropdown */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-12 left-0 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[320px]"
            >
              <div className="space-y-4">
                {/* Color Wheel */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Color Wheel
                  </label>
                  <div className="flex justify-center">
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      className="cursor-crosshair rounded-lg border border-gray-300 dark:border-gray-600"
                      style={{ width: '200px', height: '200px' }}
                    />
                  </div>
                </div>

                {/* Custom Color Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Custom Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Extended Predefined Colors */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Quick Colors
                  </label>
                  <div className="grid grid-cols-12 gap-1">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => onChange(color)}
                        className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${
                          value === color 
                            ? 'border-gray-800 dark:border-white shadow-md' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                {onReset && (
                  <button
                    type="button"
                    onClick={onReset}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Default</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Reset Button */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ColorWheelPicker; 