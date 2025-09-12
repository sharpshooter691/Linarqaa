import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useMode } from '@/contexts/ModeContext';
import PhotoModal from '@/components/modals/PhotoModal';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Phone, 
  UserCheck, 
  Save, 
  Sparkles,
  GraduationCap,
  Shield,
  Heart,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  Image
} from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  firstNameArabic: string;
  lastNameArabic: string;
  birthDate: string;
  responsibleName: string;
  responsibleNameArabic: string;
  responsiblePhone: string;
  status: 'ACTIVE' | 'INACTIVE';
  photoUrl: string;
}

const ExtraStudentRegistrationPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mode } = useMode();
  const [loading, setLoading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    firstNameArabic: '',
    lastNameArabic: '',
    birthDate: '',
    responsibleName: '',
    responsibleNameArabic: '',
    responsiblePhone: '',
    status: 'ACTIVE',
    photoUrl: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('extraStudentRegistration.validation.firstNameRequired');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('extraStudentRegistration.validation.lastNameRequired');
    }

    if (!formData.birthDate) {
      newErrors.birthDate = t('extraStudentRegistration.validation.birthDateRequired');
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.birthDate = t('extraStudentRegistration.validation.birthDatePast');
      }
    }

    if (!formData.responsibleName.trim()) {
      newErrors.responsibleName = t('extraStudentRegistration.validation.responsibleNameRequired');
    }

    if (!formData.responsiblePhone.trim()) {
      newErrors.responsiblePhone = t('extraStudentRegistration.validation.responsiblePhoneRequired');
    } else if (!/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.responsiblePhone)) {
      newErrors.responsiblePhone = t('extraStudentRegistration.validation.phoneInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhotoUpdate = (photoUrl: string) => {
    setFormData({
      ...formData,
      photoUrl: photoUrl
    });
    setShowPhotoModal(false);
    toast({
      title: t('extraStudentRegistration.messages.success'),
      description: t('extraStudentRegistration.messages.photoUpdated'),
    });
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/enrollments/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setFormData(prev => ({
        ...prev,
        photoUrl: response.data.photoUrl
      }));
      setShowPhotoModal(false);
      toast({
        title: t('extraStudentRegistration.messages.success'),
        description: t('extraStudentRegistration.messages.photoUploaded'),
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: t('extraStudentRegistration.messages.error'),
        description: t('extraStudentRegistration.messages.photoUploadError'),
        variant: "destructive",
      });
    }
  };

  const handleCameraPhoto = async (base64Data: string) => {
    try {
      const response = await api.post('/enrollments/upload-camera-photo', {
        base64Data: base64Data
      });
      
      setFormData(prev => ({
        ...prev,
        photoUrl: response.data.photoUrl
      }));
      setShowPhotoModal(false);
      toast({
        title: t('extraStudentRegistration.messages.success'),
        description: t('extraStudentRegistration.messages.photoTaken'),
      });
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: t('extraStudentRegistration.messages.error'),
        description: t('extraStudentRegistration.messages.photoTakeError'),
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: t('common.error'),
        description: t('extraStudentRegistration.messages.error'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/extra-students', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        firstNameArabic: formData.firstNameArabic.trim() || undefined,
        lastNameArabic: formData.lastNameArabic.trim() || undefined,
        birthDate: formData.birthDate,
        responsibleName: formData.responsibleName.trim(),
        responsibleNameArabic: formData.responsibleNameArabic.trim() || undefined,
        responsiblePhone: formData.responsiblePhone.trim(),
        status: formData.status,
        photoUrl: formData.photoUrl || undefined
      });

      toast({
        title: t('common.success'),
        description: `${t('extraStudentRegistration.messages.success')}: ${formData.firstName} ${formData.lastName}`,
      });

      // Navigate back to students list
      navigate('/extra-students');
    } catch (error: any) {
      console.error('Error creating extra student:', error);
      const errorMessage = error.response?.data?.error || t('extraStudentRegistration.messages.error');
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/extra-students');
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: 'var(--mode-background)' }}
    >
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div 
          className="relative overflow-hidden rounded-3xl p-6 text-white transition-all duration-300 max-w-7xl mx-auto"
          style={{
            background: `linear-gradient(to bottom right, var(--mode-primary), var(--mode-secondary))`,
            boxShadow: `0 20px 40px var(--mode-shadow)20`,
          }}
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="mb-4 lg:mb-0 flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                  title={t('common.back')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </motion.button>
                
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-1">
                    {t('extraStudentRegistration.title')} ✨
                  </h1>
                  <p className="text-white/90 text-base">
                    {t('extraStudentRegistration.subtitle')}
                  </p>
                </div>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <User className="h-3 w-3 text-white" />
                  <span className="text-white text-xs font-medium">{t('extraStudentRegistration.studentInfo')}</span>
                </div>
                <div className="w-6 h-0.5 bg-white/30"></div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <Shield className="h-3 w-3 text-white" />
                  <span className="text-white text-xs font-medium">{t('extraStudentRegistration.responsibleInfo')}</span>
                </div>
                <div className="w-6 h-0.5 bg-white/30"></div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <CheckCircle className="h-3 w-3 text-white" />
                  <span className="text-white text-xs font-medium">{t('extraStudentRegistration.validation.title')}</span>
                </div>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 text-white bg-white/20 backdrop-blur-sm border border-white/30 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="text-sm">{loading ? t('common.saving') : t('extraStudentRegistration.saveStudent')}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Student Information Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl shadow-lg border overflow-hidden"
            style={{
              backgroundColor: 'var(--mode-card)',
              borderColor: 'var(--mode-border)',
              boxShadow: `0 10px 30px var(--mode-shadow)20`
            }}
          >
            {/* Header Section with Gradient */}
            <div 
              className="p-8 pb-0"
              style={{
                background: `linear-gradient(to bottom right, var(--mode-primary), var(--mode-secondary))`
              }}
            >
              <div className="flex items-center space-x-3 pb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <div 
                  className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
                >
                  <User className="h-6 w-6 text-white" />
                </div>
                <h2 
                  className="text-2xl font-bold text-white"
                >
                  {t('extraStudentRegistration.studentInfo')}
                </h2>
              </div>
            </div>
            
            {/* Input Fields Section with Normal Background */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('extraStudentRegistration.form.firstName')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{
                      backgroundColor: errors.firstName ? '#fef2f2' : 'var(--mode-surface)',
                      color: 'var(--mode-text)',
                      borderColor: errors.firstName ? '#ef4444' : 'var(--mode-border)'
                    }}
                    placeholder={t('extraStudentRegistration.placeholders.firstName')}
                    disabled={loading}
                  />
                  {formData.firstName && !errors.firstName && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.firstName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.firstName}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('extraStudentRegistration.form.lastName')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{
                      backgroundColor: errors.lastName ? '#fef2f2' : 'var(--mode-surface)',
                      color: 'var(--mode-text)',
                      borderColor: errors.lastName ? '#ef4444' : 'var(--mode-border)'
                    }}
                    placeholder={t('extraStudentRegistration.placeholders.lastName')}
                    disabled={loading}
                  />
                  {formData.lastName && !errors.lastName && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.lastName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.lastName}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('extraStudentRegistration.form.firstNameArabic')}
                </label>
                <input
                  type="text"
                  value={formData.firstNameArabic}
                  onChange={(e) => handleInputChange('firstNameArabic', e.target.value)}
                  className="w-full px-4 py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 border-gray-300 hover:border-gray-400"
                  style={{
                    backgroundColor: 'var(--mode-surface)',
                    color: 'var(--mode-text)',
                    borderColor: 'var(--mode-border)'
                  }}
                  placeholder={t('extraStudentRegistration.placeholders.firstNameArabic')}
                  disabled={loading}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('extraStudentRegistration.form.lastNameArabic')}
                </label>
                <input
                  type="text"
                  value={formData.lastNameArabic}
                  onChange={(e) => handleInputChange('lastNameArabic', e.target.value)}
                  className="w-full px-4 py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 border-gray-300 hover:border-gray-400"
                  style={{
                    backgroundColor: 'var(--mode-surface)',
                    color: 'var(--mode-text)',
                    borderColor: 'var(--mode-border)'
                  }}
                  placeholder={t('extraStudentRegistration.placeholders.lastNameArabic')}
                  disabled={loading}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('extraStudentRegistration.form.birthDate')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  />
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      errors.birthDate ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{
                      backgroundColor: errors.birthDate ? '#fef2f2' : 'var(--mode-surface)',
                      color: 'var(--mode-text)',
                      borderColor: errors.birthDate ? '#ef4444' : 'var(--mode-border)'
                    }}
                    disabled={loading}
                  />
                  {formData.birthDate && !errors.birthDate && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.birthDate && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.birthDate}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('extraStudentRegistration.form.status')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
                  className="w-full px-4 py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 border-gray-300 hover:border-gray-400"
                  style={{
                    backgroundColor: 'var(--mode-surface)',
                    color: 'var(--mode-text)',
                    borderColor: 'var(--mode-border)'
                  }}
                  disabled={loading}
                >
                  <option value="ACTIVE">{t('extraStudentRegistration.form.active')}</option>
                  <option value="INACTIVE">{t('extraStudentRegistration.form.inactive')}</option>
                </select>
              </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Responsible Information Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl shadow-lg border overflow-hidden"
            style={{
              backgroundColor: 'var(--mode-card)',
              borderColor: 'var(--mode-border)',
              boxShadow: `0 10px 30px var(--mode-shadow)20`
            }}
          >
            {/* Header Section with Gradient */}
            <div 
              className="p-8 pb-0"
              style={{
                background: `linear-gradient(to bottom right, var(--mode-primary), var(--mode-secondary))`
              }}
            >
              <div className="flex items-center space-x-3 pb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <div 
                  className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
                >
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h2 
                  className="text-2xl font-bold text-white"
                >
                  {t('extraStudentRegistration.responsibleInfo')}
                </h2>
              </div>
            </div>
            
            {/* Input Fields Section with Normal Background */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('extraStudentRegistration.form.responsibleName')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.responsibleName}
                    onChange={(e) => handleInputChange('responsibleName', e.target.value)}
                    className={`w-full px-4 py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      errors.responsibleName ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{
                      backgroundColor: errors.responsibleName ? '#fef2f2' : 'var(--mode-surface)',
                      color: 'var(--mode-text)',
                      borderColor: errors.responsibleName ? '#ef4444' : 'var(--mode-border)'
                    }}
                    placeholder={t('extraStudentRegistration.placeholders.responsibleName')}
                    disabled={loading}
                  />
                  {formData.responsibleName && !errors.responsibleName && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.responsibleName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.responsibleName}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('extraStudentRegistration.form.responsibleNameArabic')}
                </label>
                <input
                  type="text"
                  value={formData.responsibleNameArabic}
                  onChange={(e) => handleInputChange('responsibleNameArabic', e.target.value)}
                  className="w-full px-4 py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 border-gray-300 hover:border-gray-400"
                  style={{
                    backgroundColor: 'var(--mode-surface)',
                    color: 'var(--mode-text)',
                    borderColor: 'var(--mode-border)'
                  }}
                  placeholder={t('extraStudentRegistration.placeholders.responsibleNameArabic')}
                  disabled={loading}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="md:col-span-2 lg:col-span-3"
              >
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('extraStudentRegistration.form.responsiblePhone')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  />
                  <input
                    type="tel"
                    value={formData.responsiblePhone}
                    onChange={(e) => handleInputChange('responsiblePhone', e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      errors.responsiblePhone ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{
                      backgroundColor: errors.responsiblePhone ? '#fef2f2' : 'var(--mode-surface)',
                      color: 'var(--mode-text)',
                      borderColor: errors.responsiblePhone ? '#ef4444' : 'var(--mode-border)'
                    }}
                    placeholder={t('extraStudentRegistration.placeholders.responsiblePhone')}
                    disabled={loading}
                  />
                  {formData.responsiblePhone && !errors.responsiblePhone && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.responsiblePhone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.responsiblePhone}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </motion.div>

          {/* Photo Upload Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl shadow-lg border overflow-hidden"
            style={{
              backgroundColor: 'var(--mode-card)',
              borderColor: 'var(--mode-border)',
              boxShadow: `0 10px 30px var(--mode-shadow)20`
            }}
          >
            {/* Header Section with Gradient */}
            <div 
              className="p-8 pb-0"
              style={{
                background: `linear-gradient(to bottom right, var(--mode-primary), var(--mode-secondary))`
              }}
            >
              <div className="flex items-center space-x-3 pb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <div 
                  className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
                >
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <h3 
                  className="text-2xl font-bold text-white"
                >
                  {t('extraStudentRegistration.form.photo')}
                </h3>
              </div>
            </div>
            
            {/* Photo Content Section with Normal Background */}
            <div className="p-8">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div 
                    className="w-24 h-24 rounded-2xl overflow-hidden border-2 flex items-center justify-center shadow-lg"
                    style={{
                      borderColor: 'var(--mode-border)',
                      backgroundColor: 'var(--mode-surface)',
                    }}
                  >
                    {formData.photoUrl ? (
                      <img
                        src={formData.photoUrl}
                        alt={t('extraStudentRegistration.form.photo')}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const sibling = target.nextElementSibling as HTMLElement;
                          if (sibling) {
                            sibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${
                      !formData.photoUrl ? 'flex' : 'hidden'
                    }`}>
                      <Camera 
                        className="h-8 w-8" 
                        style={{ color: 'var(--mode-textSecondary)' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="flex items-center space-x-3 px-6 py-3 text-white rounded-xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                    style={{
                      backgroundColor: 'var(--mode-primary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--mode-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--mode-primary)';
                    }}
                  >
                    <Camera className="h-5 w-5" />
                    <span className="font-medium">{t('extraStudentRegistration.actions.uploadPhoto')}</span>
                  </button>
                  <p 
                    className="text-sm mt-2"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {t('extraStudentRegistration.photo.description')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-3xl p-8 shadow-lg border"
            style={{
              backgroundColor: 'var(--mode-card)',
              borderColor: 'var(--mode-border)',
              boxShadow: `0 10px 30px var(--mode-shadow)20`
            }}
          >
            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-8 py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--mode-border)',
                  color: 'var(--mode-text)'
                }}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>{t('extraStudentRegistration.actions.cancel')}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="px-8 py-4 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, var(--mode-primary), var(--mode-secondary))`
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t('extraStudentRegistration.actions.creating')}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>{t('extraStudentRegistration.actions.create')}</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </form>
      </div>

      {/* Photo Modal */}
      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSubmit={handlePhotoUpdate}
        onUploadFile={handlePhotoUpload}
        onUploadCamera={handleCameraPhoto}
        currentPhotoUrl={formData.photoUrl}
        studentName={t('extraStudentRegistration.photo.newStudent')}
        studentId=""
      />
    </div>
  );
};

export default ExtraStudentRegistrationPage;
