import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useMode, AppMode, ThemeColors, colorPalette, predefinedThemes } from '@/contexts/ModeContext';
import ColorPicker from '@/components/ui/ColorPicker';
import { Palette, RotateCcw, Baby, School, Save, Eye, Download, Upload, Trash2, Grid3X3, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { mode, themes, updateTheme, saveTheme, savedThemes, loadTheme, deleteTheme } = useMode();
  
  const [settings, setSettings] = useState({
    schoolName: '',
    schoolNameArabic: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    descriptionArabic: '',
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showPredefinedThemes, setShowPredefinedThemes] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', settings);
  };

  const handleColorChange = (colorType: keyof ThemeColors, color: string) => {
    updateTheme(mode, { [colorType]: color });
  };

  const handleResetColor = (colorType: keyof ThemeColors) => {
    // Reset individual color to default
    const defaultTheme = mode === 'kindergarten' 
      ? {
          primary: '#f59e0b',
          secondary: '#f97316',
          accent: '#eab308',
          background: '#fefce8',
          surface: '#ffffff',
          sidebar: '#fefce8',
          card: '#ffffff',
          text: '#1f2937',
          textSecondary: '#6b7280',
          border: '#fde68a',
          shadow: '#fbbf24',
        }
      : {
          primary: '#3b82f6',
          secondary: '#6366f1',
          accent: '#8b5cf6',
          background: '#f8fafc',
          surface: '#ffffff',
          sidebar: '#f8fafc',
          card: '#ffffff',
          text: '#1f2937',
          textSecondary: '#6b7280',
          border: '#cbd5e1',
          shadow: '#64748b',
        };
    
    updateTheme(mode, { [colorType]: defaultTheme[colorType] });
  };

  const handleSaveCustomTheme = () => {
    if (customThemeName.trim()) {
      saveTheme(customThemeName, themes[mode]);
      setCustomThemeName('');
      setShowSaveDialog(false);
    }
  };

  // Remove the local predefinedThemes array and use the one from context
  const currentTheme = themes[mode];
  const currentModeSavedThemes = savedThemes.filter(theme => theme.mode === mode);

  return (
    <div className='min-h-screen p-6'>
      <div className='max-w-6xl mx-auto space-y-8'>
        {/* Header */}
        <motion.div 
          className="relative overflow-hidden rounded-3xl p-8 text-white"
          style={{
            background: `linear-gradient(to bottom right, var(--mode-primary), var(--mode-secondary))`,
            boxShadow: `0 20px 40px var(--mode-shadow)20`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative z-10">
            <h1 className='text-4xl font-bold mb-2'>{t('settings.title')}</h1>
            <p className='text-lg opacity-90'>
              {t('settings.subtitle')} {mode === 'kindergarten' ? 'Linarqa Kids' : 'Linarqa Academy'}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
            <Palette className="w-full h-full" />
          </div>
        </motion.div>

        {/* Theme Customization */}
        <motion.div 
          className='rounded-2xl shadow-xl p-8'
          style={{
            backgroundColor: 'var(--mode-card)',
            border: '2px solid var(--mode-border)',
            boxShadow: `0 10px 30px var(--mode-shadow)10`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className='text-2xl font-bold' style={{ color: 'var(--mode-text)' }}>
              {t('settings.general.title')} - {mode === 'kindergarten' ? 'Linarqa Kids' : 'Linarqa Academy'}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'var(--mode-primary)',
                  color: 'white',
                }}
              >
                <Eye className="w-4 h-4" />
                <span>{t('settings.common.preview')}</span>
              </button>
              <button
                onClick={() => setShowPredefinedThemes(!showPredefinedThemes)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'var(--mode-secondary)',
                  color: 'white',
                }}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>{t('settings.general.theme')}</span>
              </button>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'var(--mode-accent)',
                  color: 'white',
                }}
              >
                <Plus className="w-4 h-4" />
                <span>{t('settings.common.save')}</span>
              </button>
            </div>
          </div>

          {/* Theme Preview */}
          {showPreview && (
            <motion.div 
              className="mb-8 p-6 rounded-xl border-2 border-dashed"
              style={{
                borderColor: 'var(--mode-primary)',
                backgroundColor: 'var(--mode-background)',
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--mode-text)' }}>
                {t('settings.common.preview')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div 
                  className="p-4 rounded-lg text-center"
                  style={{
                    backgroundColor: 'var(--mode-primary)',
                    color: 'white',
                  }}
                >
                  <div className="font-semibold">{t('settings.general.primary')}</div>
                  <div className="text-sm opacity-90">{currentTheme.primary}</div>
                </div>
                <div 
                  className="p-4 rounded-lg text-center"
                  style={{
                    backgroundColor: 'var(--mode-secondary)',
                    color: 'white',
                  }}
                >
                  <div className="font-semibold">{t('settings.general.secondary')}</div>
                  <div className="text-sm opacity-90">{currentTheme.secondary}</div>
                </div>
                <div 
                  className="p-4 rounded-lg text-center"
                  style={{
                    backgroundColor: 'var(--mode-accent)',
                    color: 'white',
                  }}
                >
                  <div className="font-semibold">{t('settings.general.accent')}</div>
                  <div className="text-sm opacity-90">{currentTheme.accent}</div>
                </div>
                <div 
                  className="p-4 rounded-lg text-center border"
                  style={{
                    backgroundColor: 'var(--mode-card)',
                    borderColor: 'var(--mode-border)',
                    color: 'var(--mode-text)',
                  }}
                >
                  <div className="font-semibold">{t('settings.general.card')}</div>
                  <div className="text-sm opacity-70">{currentTheme.card}</div>
                </div>
                <div 
                  className="p-4 rounded-lg text-center border"
                  style={{
                    backgroundColor: 'var(--mode-sidebar)',
                    borderColor: 'var(--mode-border)',
                    color: 'var(--mode-text)',
                  }}
                >
                  <div className="font-semibold">{t('settings.general.sidebar')}</div>
                  <div className="text-sm opacity-70">{currentTheme.sidebar}</div>
                </div>
                <div 
                  className="p-4 rounded-lg text-center border"
                  style={{
                    backgroundColor: 'var(--mode-surface)',
                    borderColor: 'var(--mode-border)',
                    color: 'var(--mode-text)',
                  }}
                >
                  <div className="font-semibold">{t('settings.general.surface')}</div>
                  <div className="text-sm opacity-70">{currentTheme.surface}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Predefined Themes */}
          {showPredefinedThemes && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--mode-text)' }}>
                {t('settings.general.predefinedThemes')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {Object.entries(predefinedThemes).map(([themeName, themeConfig]) => (
                  <motion.button
                    key={themeName}
                    onClick={() => {
                      Object.entries(themeConfig[mode]).forEach(([key, value]) => {
                        handleColorChange(key as keyof ThemeColors, value);
                      });
                    }}
                    className="p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    style={{
                      borderColor: 'var(--mode-border)',
                      backgroundColor: 'var(--mode-card)',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex space-x-1 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: themeConfig[mode].primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: themeConfig[mode].secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: themeConfig[mode].accent }}
                      />
                    </div>
                    <div className="text-sm font-medium" style={{ color: 'var(--mode-text)' }}>
                      {themeName}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Color Customization */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ColorPicker
              label={t('settings.general.primaryColor')}
              value={currentTheme.primary}
              onChange={(color) => handleColorChange('primary', color)}
              onReset={() => handleResetColor('primary')}
            />
            <ColorPicker
              label={t('settings.general.secondaryColor')}
              value={currentTheme.secondary}
              onChange={(color) => handleColorChange('secondary', color)}
              onReset={() => handleResetColor('secondary')}
            />
            <ColorPicker
              label={t('settings.general.accentColor')}
              value={currentTheme.accent}
              onChange={(color) => handleColorChange('accent', color)}
              onReset={() => handleResetColor('accent')}
            />
            <ColorPicker
              label={t('settings.general.background')}
              value={currentTheme.background}
              onChange={(color) => handleColorChange('background', color)}
              onReset={() => handleResetColor('background')}
            />
            <ColorPicker
              label={t('settings.general.sidebar')}
              value={currentTheme.sidebar}
              onChange={(color) => handleColorChange('sidebar', color)}
              onReset={() => handleResetColor('sidebar')}
            />
            <ColorPicker
              label={t('settings.general.card')}
              value={currentTheme.card}
              onChange={(color) => handleColorChange('card', color)}
              onReset={() => handleResetColor('card')}
            />
            <ColorPicker
              label={t('settings.general.surface')}
              value={currentTheme.surface}
              onChange={(color) => handleColorChange('surface', color)}
              onReset={() => handleResetColor('surface')}
            />
            <ColorPicker
              label={t('settings.general.primaryText')}
              value={currentTheme.text}
              onChange={(color) => handleColorChange('text', color)}
              onReset={() => handleResetColor('text')}
            />
            <ColorPicker
              label={t('settings.general.secondaryText')}
              value={currentTheme.textSecondary}
              onChange={(color) => handleColorChange('textSecondary', color)}
              onReset={() => handleResetColor('textSecondary')}
            />
            <ColorPicker
              label={t('settings.general.border')}
              value={currentTheme.border}
              onChange={(color) => handleColorChange('border', color)}
              onReset={() => handleResetColor('border')}
            />
            <ColorPicker
              label={t('settings.general.shadow')}
              value={currentTheme.shadow}
              onChange={(color) => handleColorChange('shadow', color)}
              onReset={() => handleResetColor('shadow')}
            />
          </div>

          {/* Save Dialog */}
          {showSaveDialog && (
            <motion.div 
              className="mt-8 p-6 rounded-xl border-2 border-dashed"
              style={{ 
                backgroundColor: 'var(--mode-background)',
                borderColor: 'var(--mode-primary)',
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--mode-text)' }}>
                {t('settings.general.saveCustomTheme')}
              </h3>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder={t('settings.general.themeNamePlaceholder')}
                  value={customThemeName}
                  onChange={(e) => setCustomThemeName(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--mode-card)',
                    borderColor: 'var(--mode-border)',
                    color: 'var(--mode-text)',
                  }}
                />
                <button
                  onClick={handleSaveCustomTheme}
                  disabled={!customThemeName.trim()}
                  className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--mode-primary)',
                    color: 'white',
                  }}
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {t('settings.common.save')}
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--mode-textSecondary)',
                    color: 'white',
                  }}
                >
                  {t('settings.common.cancel')}
                </button>
              </div>
            </motion.div>
          )}

          {/* Saved Themes */}
          {currentModeSavedThemes.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--mode-text)' }}>
                {t('settings.general.savedThemes')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentModeSavedThemes.map((theme) => (
                  <motion.div
                    key={theme.id}
                    className="p-4 rounded-xl border-2"
                    style={{
                      borderColor: 'var(--mode-border)',
                      backgroundColor: 'var(--mode-card)',
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold" style={{ color: 'var(--mode-text)' }}>
                        {theme.name}
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadTheme(theme.id)}
                          className="p-1 rounded hover:bg-gray-200"
                          style={{ color: 'var(--mode-primary)' }}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTheme(theme.id)}
                          className="p-1 rounded hover:bg-gray-200"
                          style={{ color: 'var(--mode-secondary)' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>
                    <div className="text-xs mt-2" style={{ color: 'var(--mode-textSecondary)' }}>
                      {t('settings.general.createdOn')} {new Date(theme.createdAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* School Information */}
        <motion.div 
          className='rounded-2xl shadow-xl p-8'
          style={{
            backgroundColor: 'var(--mode-card)',
            border: '2px solid var(--mode-border)',
            boxShadow: `0 10px 30px var(--mode-shadow)10`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className='text-2xl font-bold mb-6' style={{ color: 'var(--mode-text)' }}>
            {t('settings.general.schoolInfo')}
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--mode-text)' }}>
                {t('settings.general.schoolName')} ({t('settings.general.french')})
              </label>
              <input 
                type='text' 
                name='schoolName'
                value={settings.schoolName}
                onChange={handleChange}
                className='w-full border rounded-lg px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-opacity-50'
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  borderColor: 'var(--mode-border)',
                  color: 'var(--mode-text)',
                }}
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--mode-text)' }}>
                {t('settings.general.schoolName')} ({t('settings.general.arabic')})
              </label>
              <input 
                type='text' 
                name='schoolNameArabic'
                value={settings.schoolNameArabic}
                onChange={handleChange}
                className='w-full border rounded-lg px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-opacity-50'
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  borderColor: 'var(--mode-border)',
                  color: 'var(--mode-text)',
                }}
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--mode-text)' }}>
                {t('settings.general.schoolAddress')}
              </label>
              <input 
                type='text' 
                name='address'
                value={settings.address}
                onChange={handleChange}
                className='w-full border rounded-lg px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-opacity-50'
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  borderColor: 'var(--mode-border)',
                  color: 'var(--mode-text)',
                }}
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--mode-text)' }}>
                {t('settings.general.schoolPhone')}
              </label>
              <input 
                type='tel' 
                name='phone'
                value={settings.phone}
                onChange={handleChange}
                className='w-full border rounded-lg px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-opacity-50'
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  borderColor: 'var(--mode-border)',
                  color: 'var(--mode-text)',
                }}
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--mode-text)' }}>
                {t('settings.general.schoolEmail')}
              </label>
              <input 
                type='email' 
                name='email'
                value={settings.email}
                onChange={handleChange}
                className='w-full border rounded-lg px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-opacity-50'
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  borderColor: 'var(--mode-border)',
                  color: 'var(--mode-text)',
                }}
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--mode-text)' }}>
                {t('settings.general.website')}
              </label>
              <input 
                type='url' 
                name='website'
                value={settings.website}
                onChange={handleChange}
                className='w-full border rounded-lg px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-opacity-50'
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  borderColor: 'var(--mode-border)',
                  color: 'var(--mode-text)',
                }}
              />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--mode-text)' }}>
                {t('settings.general.description')} ({t('settings.general.french')})
              </label>
              <textarea 
                name='description'
                value={settings.description}
                onChange={handleChange}
                rows={3}
                className='w-full border rounded-lg px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-opacity-50'
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  borderColor: 'var(--mode-border)',
                  color: 'var(--mode-text)',
                }}
              />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--mode-text)' }}>
                {t('settings.general.description')} ({t('settings.general.arabic')})
              </label>
              <textarea 
                name='descriptionArabic'
                value={settings.descriptionArabic}
                onChange={handleChange}
                rows={3}
                className='w-full border rounded-lg px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-opacity-50'
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  borderColor: 'var(--mode-border)',
                  color: 'var(--mode-text)',
                }}
              />
            </div>
          </div>
          
          <div className='mt-8 flex justify-end'>
            <button 
              onClick={handleSave}
              className='px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105'
              style={{
                backgroundColor: 'var(--mode-primary)',
                color: 'white',
              }}
            >
              {t('settings.general.saveSettings')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;