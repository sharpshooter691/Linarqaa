import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useMode } from '@/contexts/ModeContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { 
  Camera, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  FileText, 
  AlertTriangle,
  Save,
  RotateCcw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import PhotoModal from '@/components/modals/PhotoModal';
import { motion } from 'framer-motion';

const EnrollmentsPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { mode } = useMode();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    firstNameArabic: '',
    lastNameArabic: '',
    birthDate: '',
    level: '',
    classroom: '',
    guardianName: '',
    guardianNameArabic: '',
    guardianPhone: '',
    address: '',
    addressArabic: '',
    allergies: '',
    notes: '',
    photoUrl: ''
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!newStudent.firstName || !newStudent.lastName || !newStudent.birthDate || !newStudent.level || !newStudent.guardianName || !newStudent.guardianPhone) {
        showNotification('error', t('enrollments.validation.fillRequiredFields'));
        return;
      }

      // Validate phone number format
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(newStudent.guardianPhone)) {
        showNotification('error', t('enrollments.validation.validPhone'));
        return;
      }

      // Validate birth date based on selected level
      const birthDate = new Date(newStudent.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (mode === 'kindergarten') {
        if (age < 2 || age > 6) {
          showNotification('error', t('enrollments.validation.ageKindergarten'));
          return;
        }
      } else {
        // For extra courses, validate age based on selected level
        const levelAgeRanges: Record<string, [number, number]> = {
          'CP1': [5, 7], 'CP2': [6, 8], 'CP3': [7, 9], 'CP4': [8, 10], 'CP5': [9, 11], 'CP6': [10, 12],
          'AC1': [11, 13], 'AC2': [12, 14], 'AC3': [13, 15],
          'TRONC_COMMUN': [14, 16], 'BAC1': [15, 17], 'BAC2': [16, 19]
        };
        
        const ageRange = levelAgeRanges[newStudent.level];
        if (ageRange && (age < ageRange[0] || age > ageRange[1])) {
          showNotification('error', t('enrollments.validation.ageRange', { min: ageRange[0], max: ageRange[1] }));
          return;
        }
      }

      await api.post('/students', {
        ...newStudent,
        studentType: mode === 'kindergarten' ? 'KINDERGARTEN' : 'EXTRA_COURSE'
      });
      
      showNotification('success', t('enrollments.success.enrolled', { name: `${newStudent.firstName} ${newStudent.lastName}` }));

      // Reset form
      setNewStudent({
        firstName: '',
        lastName: '',
        firstNameArabic: '',
        lastNameArabic: '',
        birthDate: '',
        level: '',
        classroom: '',
        guardianName: '',
        guardianNameArabic: '',
        guardianPhone: '',
        address: '',
        addressArabic: '',
        allergies: '',
        notes: '',
        photoUrl: ''
      });

    } catch (error: any) {
      console.error('Error saving:', error);
      showNotification('error', error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNewStudent({
      ...newStudent,
      [e.target.name]: e.target.value
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Auto-format phone number
    value = value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 0) {
      if (value.length <= 3) {
        value = value;
      } else if (value.length <= 6) {
        value = value.slice(0, 3) + '-' + value.slice(3);
      } else {
        value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
      }
    }
    
    setNewStudent({
      ...newStudent,
      guardianPhone: value
    });
  };

  const handlePhotoUpdate = (photoUrl: string) => {
    setNewStudent({
      ...newStudent,
      photoUrl: photoUrl
    });
    setShowPhotoModal(false);
    toast({
      title: t('enrollments.success.title'),
      description: t('enrollments.success.photoUpdated'),
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
      
      setNewStudent({
        ...newStudent,
        photoUrl: response.data.photoUrl
      });
      setShowPhotoModal(false);
      toast({
        title: t('enrollments.success.title'),
        description: t('enrollments.success.photoUploaded'),
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: t('enrollments.error.title'),
        description: t('enrollments.error.photoUpload'),
        variant: "destructive",
      });
    }
  };

  const handleCameraPhoto = async (base64Data: string) => {
    try {
      const response = await api.post('/enrollments/upload-camera-photo', {
        base64Data: base64Data
      });
      
      setNewStudent({
        ...newStudent,
        photoUrl: response.data.photoUrl
      });
      setShowPhotoModal(false);
      toast({
        title: t('enrollments.success.title'),
        description: t('enrollments.success.photoTaken'),
      });
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: t('enrollments.error.title'),
        description: t('enrollments.error.photoTake'),
        variant: "destructive",
      });
    }
  };

  const getLevelCapacity = (level: string) => {
    const capacities: Record<string, number> = {
      'PETITE': 20,
      'MOYENNE': 20,
      'GRANDE': 20
    };
    return capacities[level] || 0;
  };

  const formatDate = (date: Date) => {
    const isArabic = i18n.language === 'ar';
    if (isArabic) {
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const dayName = days[date.getDay()];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${dayName}، ${day} ${month} ${year}`;
    } else {
      return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: 'var(--mode-background)' }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Notification */}
        {notification && (
          <div 
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border backdrop-blur-sm ${
              notification.type === 'success' 
                ? 'text-white' 
                : 'text-white'
            }`}
            style={{
              backgroundColor: notification.type === 'success' 
                ? 'var(--mode-primary)' 
                : '#ef4444',
              borderColor: notification.type === 'success' 
                ? 'var(--mode-secondary)' 
                : '#dc2626',
            }}
          >
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div 
            className="rounded-3xl p-8 shadow-lg border"
            style={{
              backgroundColor: 'var(--mode-card)',
              borderColor: 'var(--mode-border)',
              boxShadow: `0 10px 30px var(--mode-shadow)20`
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 
                  className="text-4xl font-bold mb-2"
                  style={{ 
                    background: `linear-gradient(to right, var(--mode-primary), var(--mode-secondary))`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {mode === 'kindergarten' ? t('enrollments.title.kindergarten') : t('enrollments.title.extraCourses')} ✨
                </h1>
                <p 
                  className="text-lg"
                  style={{ color: 'var(--mode-textSecondary)' }}
                >
                  {mode === 'kindergarten' 
                    ? t('enrollments.subtitle.kindergarten')
                    : t('enrollments.subtitle.extraCourses')
                  }
                </p>
                <div className="flex items-center mt-2 text-sm" style={{ color: 'var(--mode-textSecondary)' }}>
                  <GraduationCap size={16} className="mr-1" />
                  {t('enrollments.enrolledBy')} {user?.fullNameArabic || user?.fullName} • {formatDate(new Date())}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Main Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl shadow-lg border p-8"
          style={{
            backgroundColor: 'var(--mode-card)',
            borderColor: 'var(--mode-border)',
            boxShadow: `0 10px 30px var(--mode-shadow)20`
          }}
        >
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center space-x-3'>
              <div 
                className='p-2 rounded-lg'
                style={{
                  backgroundColor: 'var(--mode-secondary)20',
                }}
              >
                <FileText 
                  className='h-6 w-6' 
                  style={{ color: 'var(--mode-secondary)' }}
                />
              </div>
              <h2 
                className='text-2xl font-bold'
                style={{ color: 'var(--mode-text)' }}
              >
                {t('enrollments.newEnrollment')}
              </h2>
            </div>
            {newStudent.level && (
              <div 
                className='flex items-center space-x-2 px-4 py-2 rounded-xl border'
                style={{
                  backgroundColor: 'var(--mode-accent)20',
                  borderColor: 'var(--mode-accent)',
                }}
              >
                <div 
                  className='w-2 h-2 rounded-full'
                  style={{ backgroundColor: 'var(--mode-accent)' }}
                ></div>
                <span 
                  className='text-sm font-medium'
                  style={{ color: 'var(--mode-accent)' }}
                >
                  {t('enrollments.capacity', { count: getLevelCapacity(newStudent.level) })}
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className='space-y-8'>
            {/* Student Information */}
            <div 
              className='rounded-xl p-6 border'
              style={{
                backgroundColor: 'var(--mode-background)',
                borderColor: 'var(--mode-border)',
              }}
            >
              <div className='flex items-center space-x-3 mb-6'>
                <User 
                  className='h-6 w-6' 
                  style={{ color: 'var(--mode-primary)' }}
                />
                <h3 
                  className='text-xl font-semibold'
                  style={{ color: 'var(--mode-text)' }}
                >
                  {mode === 'kindergarten' ? t('enrollments.studentInfo.kindergarten') : t('enrollments.studentInfo.extraCourses')}
                </h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('enrollments.form.firstNameFrench')} <span style={{ color: 'var(--mode-primary)' }}>*</span>
                  </label>
                  <input 
                    type='text' 
                    name='firstName'
                    value={newStudent.firstName}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)',
                      color: 'var(--mode-text)',
                    }}
                    placeholder={t('enrollments.placeholders.firstName')}
                  />
                </div>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('enrollments.form.lastNameFrench')} <span style={{ color: 'var(--mode-primary)' }}>*</span>
                  </label>
                  <input 
                    type='text' 
                    name='lastName'
                    value={newStudent.lastName}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)',
                      color: 'var(--mode-text)',
                    }}
                    placeholder={t('enrollments.placeholders.lastName')}
                  />
                </div>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('enrollments.form.firstNameArabic')}
                  </label>
                  <input 
                    type='text' 
                    name='firstNameArabic'
                    value={newStudent.firstNameArabic}
                    onChange={handleChange}
                    className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)',
                      color: 'var(--mode-text)',
                    }}
                    placeholder={t('enrollments.placeholders.firstNameArabic')}
                  />
                </div>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('enrollments.form.lastNameArabic')}
                  </label>
                  <input 
                    type='text' 
                    name='lastNameArabic'
                    value={newStudent.lastNameArabic}
                    onChange={handleChange}
                    className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)',
                      color: 'var(--mode-text)',
                    }}
                    placeholder={t('enrollments.placeholders.lastNameArabic')}
                  />
                </div>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('enrollments.form.birthDate')} <span style={{ color: 'var(--mode-primary)' }}>*</span>
                  </label>
                  <div className="relative">
                    <Calendar 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" 
                      style={{ color: 'var(--mode-textSecondary)' }}
                    />
                    <input 
                      type='date' 
                      name='birthDate'
                      value={newStudent.birthDate}
                      onChange={handleChange}
                      required
                      className='w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                      style={{
                        backgroundColor: 'var(--mode-surface)',
                        borderColor: 'var(--mode-border)',
                        color: 'var(--mode-text)',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('enrollments.form.level')} <span style={{ color: 'var(--mode-primary)' }}>*</span>
                  </label>
                  <select 
                    name='level'
                    value={newStudent.level}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)',
                      color: 'var(--mode-text)',
                    }}
                  >
                    <option value=''>{t('enrollments.form.selectLevel')}</option>
                    {mode === 'kindergarten' ? (
                      <>
                        <option value='PETITE'>{t('enrollments.levels.petite')}</option>
                        <option value='MOYENNE'>{t('enrollments.levels.moyenne')}</option>
                        <option value='GRANDE'>{t('enrollments.levels.grande')}</option>
                      </>
                    ) : (
                      <>
                        <optgroup label={t('enrollments.levelGroups.primary')}>
                          <option value='CP1'>{t('enrollments.levels.cp1')}</option>
                          <option value='CP2'>{t('enrollments.levels.cp2')}</option>
                          <option value='CP3'>{t('enrollments.levels.cp3')}</option>
                          <option value='CP4'>{t('enrollments.levels.cp4')}</option>
                          <option value='CP5'>{t('enrollments.levels.cp5')}</option>
                          <option value='CP6'>{t('enrollments.levels.cp6')}</option>
                        </optgroup>
                        <optgroup label={t('enrollments.levelGroups.lowerSecondary')}>
                          <option value='AC1'>{t('enrollments.levels.ac1')}</option>
                          <option value='AC2'>{t('enrollments.levels.ac2')}</option>
                          <option value='AC3'>{t('enrollments.levels.ac3')}</option>
                        </optgroup>
                        <optgroup label={t('enrollments.levelGroups.upperSecondary')}>
                          <option value='TRONC_COMMUN'>{t('enrollments.levels.troncCommun')}</option>
                          <option value='BAC1'>{t('enrollments.levels.bac1')}</option>
                          <option value='BAC2'>{t('enrollments.levels.bac2')}</option>
                        </optgroup>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('enrollments.form.classroom')}
                  </label>
                  <input 
                    type='text' 
                    name='classroom'
                    value={newStudent.classroom}
                    onChange={handleChange}
                    className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)',
                      color: 'var(--mode-text)',
                    }}
                    placeholder={t('enrollments.placeholders.classroom')}
                  />
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div 
              className='rounded-xl p-6 border'
              style={{
                backgroundColor: 'var(--mode-background)',
                borderColor: 'var(--mode-border)',
              }}
            >
              <div className='flex items-center space-x-3 mb-6'>
                <Phone 
                  className='h-6 w-6' 
                  style={{ color: 'var(--mode-secondary)' }}
                />
                <h3 
                  className='text-xl font-semibold'
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('enrollments.guardianInfo.title')}
                </h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('enrollments.form.guardianNameFrench')} <span style={{ color: 'var(--mode-primary)' }}>*</span>
                  </label>
                  <input 
                    type='text' 
                    name='guardianName'
                    value={newStudent.guardianName}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)',
                      color: 'var(--mode-text)',
                    }}
                    placeholder={t('enrollments.placeholders.guardianName')}
                  />
                </div>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('enrollments.form.guardianNameArabic')}
                  </label>
                  <input 
                    type='text' 
                    name='guardianNameArabic'
                    value={newStudent.guardianNameArabic}
                    onChange={handleChange}
                    className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)',
                      color: 'var(--mode-text)',
                    }}
                    placeholder={t('enrollments.placeholders.guardianNameArabic')}
                  />
                </div>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('enrollments.form.guardianPhone')} <span style={{ color: 'var(--mode-primary)' }}>*</span>
                  </label>
                  <div className="relative">
                    <Phone 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" 
                      style={{ color: 'var(--mode-textSecondary)' }}
                    />
                    <input 
                      type='tel' 
                      name='guardianPhone'
                      value={newStudent.guardianPhone}
                      onChange={handlePhoneChange}
                      required
                      className='w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                      style={{
                        backgroundColor: 'var(--mode-surface)',
                        borderColor: 'var(--mode-border)',
                        color: 'var(--mode-text)',
                      }}
                      placeholder={t('enrollments.placeholders.phone')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div 
              className='rounded-xl p-6 border'
              style={{
                backgroundColor: 'var(--mode-background)',
                borderColor: 'var(--mode-border)',
              }}
            >
              <div className='flex items-center space-x-3 mb-6'>
                <MapPin 
                  className='h-6 w-6' 
                  style={{ color: 'var(--mode-accent)' }}
                />
                <h3 
                  className='text-xl font-semibold'
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('enrollments.additionalInfo.title')}
                </h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('enrollments.form.addressFrench')}
                  </label>
                  <textarea 
                    name='address'
                    value={newStudent.address}
                    onChange={handleChange}
                    className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)',
                      color: 'var(--mode-text)',
                    }}
                    rows={3}
                    placeholder={t('enrollments.placeholders.address')}
                  />
                </div>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('enrollments.form.addressArabic')}
                  </label>
                  <textarea 
                    name='addressArabic'
                    value={newStudent.addressArabic}
                    onChange={handleChange}
                    className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)',
                      color: 'var(--mode-text)',
                    }}
                    rows={3}
                    placeholder={t('enrollments.placeholders.addressArabic')}
                  />
                </div>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    <div className="flex items-center space-x-2">
                      <AlertTriangle 
                        className="h-4 w-4" 
                        style={{ color: 'var(--mode-primary)' }}
                      />
                      <span>{t('enrollments.form.allergies')}</span>
                    </div>
                  </label>
                  <textarea 
                    name='allergies'
                    value={newStudent.allergies}
                    onChange={handleChange}
                    className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)',
                      color: 'var(--mode-text)',
                    }}
                    rows={3}
                    placeholder={t('enrollments.placeholders.allergies')}
                  />
                </div>
                <div>
                  <label 
                    className='block text-sm font-medium mb-2'
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('enrollments.form.notes')}
                  </label>
                  <textarea 
                    name='notes'
                    value={newStudent.notes}
                    onChange={handleChange}
                    className='w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-opacity-60'
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)',
                      color: 'var(--mode-text)',
                    }}
                    rows={3}
                    placeholder={t('enrollments.placeholders.notes')}
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div 
              className='rounded-xl p-6 border'
              style={{
                backgroundColor: 'var(--mode-background)',
                borderColor: 'var(--mode-border)',
              }}
            >
              <div className='flex items-center space-x-3 mb-6'>
                <Camera 
                  className='h-6 w-6' 
                  style={{ color: 'var(--mode-accent)' }}
                />
                <h3 
                  className='text-xl font-semibold'
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('enrollments.photo.title')}
                </h3>
              </div>
              <div className='flex items-center space-x-6'>
                <div className='relative'>
                  <div 
                    className='w-24 h-24 rounded-2xl overflow-hidden border-2 flex items-center justify-center shadow-lg'
                    style={{
                      borderColor: 'var(--mode-border)',
                      backgroundColor: 'var(--mode-surface)',
                    }}
                  >
                    {newStudent.photoUrl ? (
                      <img
                        src={newStudent.photoUrl}
                        alt={t('enrollments.photo.alt')}
                        className='w-full h-full object-cover'
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
                      !newStudent.photoUrl ? 'flex' : 'hidden'
                    }`}>
                      <Camera 
                        className='h-8 w-8' 
                        style={{ color: 'var(--mode-textSecondary)' }}
                      />
                    </div>
                  </div>
                </div>
                <div className='flex-1'>
                  <button
                    type='button'
                    onClick={() => setShowPhotoModal(true)}
                    className='flex items-center space-x-3 px-6 py-3 text-white rounded-xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5'
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
                    <Camera className='h-5 w-5' />
                    <span className='font-medium'>{t('enrollments.photo.addPhoto')}</span>
                  </button>
                  <p 
                    className='text-sm mt-2'
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {t('enrollments.photo.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div 
              className='flex justify-end space-x-4 pt-6 border-t'
              style={{ borderTopColor: 'var(--mode-border)' }}
            >
              <button 
                type='button'
                onClick={() => setNewStudent({
                  firstName: '',
                  lastName: '',
                  firstNameArabic: '',
                  lastNameArabic: '',
                  birthDate: '',
                  level: '',
                  classroom: '',
                  guardianName: '',
                  guardianNameArabic: '',
                  guardianPhone: '',
                  address: '',
                  addressArabic: '',
                  allergies: '',
                  notes: '',
                  photoUrl: ''
                })}
                className='flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-md'
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  color: 'var(--mode-text)',
                  borderColor: 'var(--mode-border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--mode-background)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--mode-surface)';
                }}
              >
                <RotateCcw className='h-4 w-4' />
                <span className='font-medium'>{t('enrollments.actions.reset')}</span>
              </button>
              <button 
                type='submit'
                disabled={isSubmitting}
                className='flex items-center space-x-2 px-8 py-3 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5'
                style={{
                  background: `linear-gradient(to right, var(--mode-primary), var(--mode-secondary))`,
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                    <span className='font-medium'>{t('enrollments.actions.saving')}</span>
                  </>
                ) : (
                  <>
                    <Save className='h-5 w-5' />
                    <span className='font-medium'>{t('enrollments.actions.saveEnrollment')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
        
        <PhotoModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          onSubmit={handlePhotoUpdate}
          onUploadFile={handlePhotoUpload}
          onUploadCamera={handleCameraPhoto}
          currentPhotoUrl={newStudent.photoUrl}
          studentName={t('enrollments.photo.newStudent')}
          studentId=""
        />
      </div>
    </div>
  );
};

export default EnrollmentsPage;
