import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useMode } from '@/contexts/ModeContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Edit, Trash2, Plus, ChevronDown, ChevronRight, Camera, User, Download, Printer, Receipt } from 'lucide-react';
import PhotoModal from '@/components/modals/PhotoModal';
import PaymentHistoryModal from '@/components/modals/PaymentHistoryModal';
import { motion } from 'framer-motion';

// Define types for better type safety
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  firstNameArabic?: string;
  lastNameArabic?: string;
  birthDate: string;
  level: string;
  classroom?: string;
  guardianName: string;
  guardianNameArabic?: string;
  guardianPhone: string;
  address?: string;
  addressArabic?: string;
  allergies?: string;
  notes?: string;
  status: string;
  photoUrl?: string;
  studentType: 'KINDERGARTEN' | 'EXTRA_COURSE';
}

interface User {
  role: string;
}

const StudentsPage = () => {
  const { t, i18n } = useTranslation(); // Add i18n here
  const { user } = useAuth();
  const { mode } = useMode();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  useEffect(() => {
    // Clear students immediately when mode changes
    if (currentMode !== mode) {
      setStudents([]);
      setExpandedRows(new Set());
      setEditingStudent(null);
      setCurrentMode(mode);
      setLoading(true);
      // Fetch immediately for mode change
      fetchStudents();
      return;
    }

    if (!isInitialized) {
      // Initial load - no debounce
      fetchStudents();
      setIsInitialized(true);
    } else {
      // Subsequent loads - with debounce only for search/filter changes
      const timeoutId = setTimeout(() => {
        fetchStudents();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, levelFilter, statusFilter, mode]); // Removed isInitialized and currentMode from dependencies

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await api.delete(`/students/${studentId}`);
      toast({
        title: t('common.success'),
        description: t('students.deleteSuccess'),
      });
      // Only refresh if we're still in the same mode
      if (currentMode === mode) {
        fetchStudents();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: t('common.error'),
        description: t('students.deleteError'),
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const executeDelete = () => {
    if (studentToDelete) {
      handleDeleteStudent(studentToDelete.id);
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const toggleRow = (studentId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(studentId)) {
      newExpandedRows.delete(studentId);
    } else {
      newExpandedRows.add(studentId);
    }
    setExpandedRows(newExpandedRows);
  };

  const isRowExpanded = (studentId: string) => expandedRows.has(studentId);

  const handleUpdatePhoto = async (studentId: string, photoUrl: string) => {
    try {
      await api.patch(`/students/${studentId}/photo`, { photoUrl });
      toast({
        title: t('common.success'),
        description: t('students.photoUpdateSuccess'),
      });
      // Only refresh if we're still in the same mode
      if (currentMode === mode) {
        fetchStudents();
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      toast({
        title: t('common.error'),
        description: t('students.photoUpdateError'),
        variant: "destructive",
      });
    }
  };

  const handleUploadFile = async (studentId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    await api.post(`/students/${studentId}/upload-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Only refresh if we're still in the same mode
    if (currentMode === mode) {
    fetchStudents();
    }
  };

  const handleUploadCamera = async (studentId: string, base64Data: string) => {
    await api.post(`/students/${studentId}/upload-camera-photo`, {
      base64Data: base64Data
    });
    
    // Only refresh if we're still in the same mode
    if (currentMode === mode) {
      fetchStudents();
    }
  };

  const openPhotoModal = (student: Student) => {
    setSelectedStudent(student);
    setShowPhotoModal(true);
  };

  const openPaymentHistoryModal = (student: Student) => {
    setSelectedStudent(student);
    setShowPaymentHistoryModal(true);
  };

  const handleEditStudent = (student: Student) => {
    // TODO: Implement edit functionality
    toast({
      title: t('students.edit'),
      description: t('students.editStudent', { name: `${student.firstName} ${student.lastName}` }),
    });
  };

  const startEditing = (student: Student) => {
    setEditingStudent(student.id);
  };

  const cancelEditing = () => {
    setEditingStudent(null);
    // Also close the expanded row
    if (editingStudent) {
      const newExpandedRows = new Set(expandedRows);
      newExpandedRows.delete(editingStudent);
      setExpandedRows(newExpandedRows);
    }
  };

  const saveStudent = async (student: Student) => {
    try {
      // Get all form values from the expanded row
      const form = document.querySelector(`[data-student-id="${student.id}"]`) as HTMLFormElement;
      if (!form) {
        toast({
          title: t('common.error'),
          description: t('students.formNotFound'),
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData(form);
      const updatedStudent = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        firstNameArabic: formData.get('firstNameArabic') as string,
        lastNameArabic: formData.get('lastNameArabic') as string,
        birthDate: formData.get('birthDate') as string,
        level: formData.get('level') as string,
        classroom: formData.get('classroom') as string,
        guardianName: formData.get('guardianName') as string,
        guardianNameArabic: formData.get('guardianNameArabic') as string,
        guardianPhone: formData.get('guardianPhone') as string,
        address: formData.get('address') as string,
        addressArabic: formData.get('addressArabic') as string,
        allergies: formData.get('allergies') as string,
        notes: formData.get('notes') as string,
        photoUrl: student.photoUrl, // Preserve existing photo URL
      };

      // Send update to backend
      await api.put(`/students/${student.id}`, updatedStudent);
      
      toast({
        title: t('common.success'),
        description: t('students.saveSuccess', { name: `${updatedStudent.firstName} ${updatedStudent.lastName}` }),
      });
      
      setEditingStudent(null);
      // Also close the expanded row
      const newExpandedRows = new Set(expandedRows);
      newExpandedRows.delete(student.id);
      setExpandedRows(newExpandedRows);
      
      // Refresh the students list
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: t('common.error'),
        description: t('students.saveError'),
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Filter students based on current mode and search/filter parameters
      const studentType = currentMode === 'kindergarten' ? 'kindergarten' : 'extra_course';
      const params = new URLSearchParams({
        type: studentType,
        ...(searchTerm && { search: searchTerm }),
        ...(levelFilter && { level: levelFilter }),
        ...(statusFilter && { status: statusFilter })
      });
      
      console.log(`Fetching students for mode: ${currentMode}, type: ${studentType}`);
      const response = await api.get(`/students?${params}`);
      setStudents(response.data);
      console.log(`Loaded ${response.data.length} students for ${currentMode} mode`);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: t('common.error'),
        description: t('students.loadError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelLabel = (level: string) => {
    if (mode === 'kindergarten') {
    switch (level) {
      case 'PETITE': return t('students.levels.petite');
      case 'MOYENNE': return t('students.levels.moyenne');
      case 'GRANDE': return t('students.levels.grande');
      default: return level;
      }
    } else {
      // For extra courses, show Moroccan education system levels
      switch (level) {
        // Primary School (التعليم الابتدائي)
        case 'CP1': return t('students.levels.cp1');
        case 'CP2': return t('students.levels.cp2');
        case 'CP3': return t('students.levels.cp3');
        case 'CP4': return t('students.levels.cp4');
        case 'CP5': return t('students.levels.cp5');
        case 'CP6': return t('students.levels.cp6');
        
        // Lower Secondary (التعليم الثانوي الإعدادي)
        case 'AC1': return t('students.levels.ac1');
        case 'AC2': return t('students.levels.ac2');
        case 'AC3': return t('students.levels.ac3');
        
        // Upper Secondary (التعليم الثانوي التأهيلي)
        case 'TRONC_COMMUN': return t('students.levels.troncCommun');
        case 'BAC1': return t('students.levels.bac1');
        case 'BAC2': return t('students.levels.bac2');
        
        // Fallback for old levels
        case 'PETITE': return t('students.levels.cp1');
        case 'MOYENNE': return t('students.levels.cp2');
        case 'GRANDE': return t('students.levels.cp3');
        
        default: return level;
      }
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>{t('students.status.active')}</span>;
    }
    return <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>{t('students.status.left')}</span>;
  };

  const exportToCSV = () => {
    const headers = [
      t('students.export.fullName'),
      t('students.export.firstNameArabic'),
      t('students.export.lastNameArabic'), 
      t('students.export.birthDate'),
      t('students.export.age'),
      t('students.export.level'),
      t('students.export.classroom'),
      t('students.export.guardian'),
      t('students.export.guardianArabic'),
      t('students.export.phone'),
      t('students.export.address'),
      t('students.export.addressArabic'),
      t('students.export.allergies'),
      t('students.export.notes'),
      t('students.export.status')
    ];

    const csvContent = [
      headers.join(','),
      ...students.map(student => [
        `"${student.firstName} ${student.lastName}"`,
        `"${student.firstNameArabic || ''}"`,
        `"${student.lastNameArabic || ''}"`,
        `"${new Date(student.birthDate).toLocaleDateString('fr-FR')}"`,
        `"${new Date().getFullYear() - new Date(student.birthDate).getFullYear()} ans"`,
        `"${getLevelLabel(student.level)}"`,
        `"${student.classroom || ''}"`,
        `"${student.guardianName}"`,
        `"${student.guardianNameArabic || ''}"`,
        `"${student.guardianPhone}"`,
        `"${student.address || ''}"`,
        `"${student.addressArabic || ''}"`,
        `"${student.allergies || ''}"`,
        `"${student.notes || ''}"`,
        `"${student.status === 'ACTIVE' ? t('students.status.active') : t('students.status.left')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${mode === 'kindergarten' ? 'eleves' : 'etudiants'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: t('students.exportSuccess'),
      description: t('students.exportDescription', { count: students.length, type: mode === 'kindergarten' ? t('students.kindergarten') : t('students.extraCourse') }),
    });
  };

  const printStudents = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('fr-FR');
    const title = mode === 'kindergarten' ? t('students.printTitleKindergarten') : t('students.printTitleExtra');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .date { text-align: center; margin-bottom: 30px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .photo { width: 50px; height: 50px; object-fit: cover; border-radius: 50%; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="date">${t('students.generatedOn')} ${currentDate}</div>
          <table>
            <thead>
              <tr>
                <th>${t('students.printHeaders.photo')}</th>
                <th>${t('students.printHeaders.fullName')}</th>
                <th>${t('students.printHeaders.level')}</th>
                <th>${t('students.printHeaders.classroom')}</th>
                <th>${t('students.printHeaders.guardian')}</th>
                <th>${t('students.printHeaders.phone')}</th>
                <th>${t('students.printHeaders.status')}</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(student => `
                <tr>
                  <td>
                    ${student.photoUrl 
                      ? `<img src="${student.photoUrl}" alt="${student.firstName} ${student.lastName}" class="photo" />`
                      : '<div style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center;">👤</div>'
                    }
                  </td>
                  <td>${student.firstName} ${student.lastName}</td>
                  <td>${getLevelLabel(student.level)}</td>
                  <td>${student.classroom || '-'}</td>
                  <td>${student.guardianName}</td>
                  <td>${student.guardianPhone}</td>
                  <td>${student.status === 'ACTIVE' ? t('students.status.active') : t('students.status.left')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();

    toast({
      title: t('students.printSuccess'),
      description: t('students.printDescription', { count: students.length, type: mode === 'kindergarten' ? t('students.kindergarten') : t('students.extraCourse') }),
    });
  };

  // Helper function to get the appropriate name based on current language
  const getDisplayName = (student: Student) => {
    const isArabic = i18n.language === 'ar';
    
    if (isArabic) {
      // Show Arabic names if available, otherwise fallback to French
      const firstName = student.firstNameArabic || student.firstName;
      const lastName = student.lastNameArabic || student.lastName;
      return `${firstName} ${lastName}`;
    } else {
      // Show French names
      return `${student.firstName} ${student.lastName}`;
    }
  };

  // Helper function to get guardian name based on current language
  const getGuardianName = (student: Student) => {
    const isArabic = i18n.language === 'ar';
    
    if (isArabic) {
      // Show Arabic guardian name if available, otherwise fallback to French
      return student.guardianNameArabic || student.guardianName;
    } else {
      // Show French guardian name
      return student.guardianName;
    }
  };

  // Helper function to get address based on current language
  const getAddress = (student: Student) => {
    const isArabic = i18n.language === 'ar';
    
    if (isArabic) {
      // Show Arabic address if available, otherwise fallback to French
      return student.addressArabic || student.address;
    } else {
      // Show French address
      return student.address;
    }
  };

  if (loading) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold' style={{ color: 'var(--mode-text)' }}>
            {mode === 'kindergarten' ? t('students.kindergarten') : t('students.extraCourse')}
          </h1>
          <p style={{ color: 'var(--mode-textSecondary)' }}>
            {mode === 'kindergarten' 
              ? t('students.loadingKindergarten') 
              : t('students.loadingExtra')
            }
          </p>
        </div>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 mx-auto' style={{ borderColor: 'var(--mode-primary)' }}></div>
            <p className='mt-2' style={{ color: 'var(--mode-textSecondary)' }}>
              {mode === 'kindergarten' 
                ? t('students.loadingKindergarten') 
                : t('students.loadingExtra')
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: 'var(--mode-background)' }}
    >
      <div className="container mx-auto px-4 py-8">
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
                  {mode === 'kindergarten' ? t('students.kindergarten') : t('students.extraCourse')} ✨
                </h1>
                <p 
                  className="text-lg"
                  style={{ color: 'var(--mode-textSecondary)' }}
                >
                  {mode === 'kindergarten' 
                    ? t('students.managementKindergarten', { count: students.length }) 
                    : t('students.managementExtra', { count: students.length })
                  }
                </p>
                <div className="flex items-center mt-2 text-sm" style={{ color: 'var(--mode-textSecondary)' }}>
                  <User size={16} className="mr-1" />
                  {t('common.managedBy')} {user?.fullName}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 shadow-lg border mb-8"
          style={{
            backgroundColor: 'var(--mode-card)',
            borderColor: 'var(--mode-border)',
            boxShadow: `0 10px 30px var(--mode-shadow)20`
          }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={mode === 'kindergarten' ? t('students.searchKindergarten') : t('students.searchExtra')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  color: 'var(--mode-text)',
                  borderColor: 'var(--mode-border)',
                }}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  color: 'var(--mode-text)',
                  borderColor: 'var(--mode-border)',
                }}
              >
                <option value="">{t('students.allLevels')}</option>
                {mode === 'kindergarten' ? (
                  <>
                    <option value="PETITE">{t('students.levels.petite')}</option>
                    <option value="MOYENNE">{t('students.levels.moyenne')}</option>
                    <option value="GRANDE">{t('students.levels.grande')}</option>
                  </>
                ) : (
                  <>
                    <optgroup label={t('students.levels.primarySchool')}>
                      <option value="CP1">{t('students.levels.cp1')}</option>
                      <option value="CP2">{t('students.levels.cp2')}</option>
                      <option value="CP3">{t('students.levels.cp3')}</option>
                      <option value="CP4">{t('students.levels.cp4')}</option>
                      <option value="CP5">{t('students.levels.cp5')}</option>
                      <option value="CP6">{t('students.levels.cp6')}</option>
                    </optgroup>
                    <optgroup label={t('students.levels.lowerSecondary')}>
                      <option value="AC1">{t('students.levels.ac1')}</option>
                      <option value="AC2">{t('students.levels.levels.ac2')}</option>
                      <option value="AC3">{t('students.levels.ac3')}</option>
                    </optgroup>
                    <optgroup label={t('students.levels.upperSecondary')}>
                      <option value="TRONC_COMMUN">{t('students.levels.troncCommun')}</option>
                      <option value="BAC1">{t('students.levels.bac1')}</option>
                      <option value="BAC2">{t('students.levels.bac2')}</option>
                    </optgroup>
                  </>
                )}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  color: 'var(--mode-text)',
                  borderColor: 'var(--mode-border)',
                }}
              >
                <option value="">{t('students.allStatuses')}</option>
                <option value="ACTIVE">{t('students.status.active')}</option>
                <option value="INACTIVE">{t('students.status.inactive')}</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Students Display */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className='rounded-lg shadow p-6 transition-all duration-300' style={{ 
            backgroundColor: 'var(--mode-card)', 
            border: '1px solid var(--mode-border)',
            boxShadow: 'var(--mode-shadow)'
          }}>
            <div className='flex gap-4 mb-4'>
              <input
                type='text'
                placeholder={mode === 'kindergarten' ? t('students.searchKindergarten') : t('students.searchExtra')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                style={{ 
                  backgroundColor: 'var(--mode-surface)', 
                  color: 'var(--mode-text)', 
                  borderColor: 'var(--mode-border)'
                }}
              />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className='border rounded px-3 py-2'
                style={{ 
                  backgroundColor: 'var(--mode-surface)', 
                  color: 'var(--mode-text)', 
                  borderColor: 'var(--mode-border)'
                }}
              >
                <option value=''>{t('students.allLevels')}</option>
                {mode === 'kindergarten' ? (
                  <>
                <option value='PETITE'>{t('students.levels.petite')}</option>
                <option value='MOYENNE'>{t('students.levels.moyenne')}</option>
                <option value='GRANDE'>{t('students.levels.grande')}</option>
                  </>
                ) : (
                  <>
                    <optgroup label={t('students.levels.primarySchool')}>
                      <option value='CP1'>{t('students.levels.cp1')}</option>
                      <option value='CP2'>{t('students.levels.cp2')}</option>
                      <option value='CP3'>{t('students.levels.cp3')}</option>
                      <option value='CP4'>{t('students.levels.cp4')}</option>
                      <option value='CP5'>{t('students.levels.cp5')}</option>
                      <option value='CP6'>{t('students.levels.cp6')}</option>
                    </optgroup>
                    <optgroup label={t('students.levels.lowerSecondary')}>
                      <option value='AC1'>{t('students.levels.ac1')}</option>
                      <option value='AC2'>{t('students.levels.ac2')}</option>
                      <option value='AC3'>{t('students.levels.ac3')}</option>
                    </optgroup>
                    <optgroup label={t('students.levels.upperSecondary')}>
                      <option value='TRONC_COMMUN'>{t('students.levels.troncCommun')}</option>
                      <option value='BAC1'>{t('students.levels.bac1')}</option>
                      <option value='BAC2'>{t('students.levels.bac2')}</option>
                    </optgroup>
                  </>
                )}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='border rounded px-3 py-2'
                style={{ 
                  backgroundColor: 'var(--mode-surface)', 
                  color: 'var(--mode-text)', 
                  borderColor: 'var(--mode-border)'
                }}
              >
                <option value=''>{t('students.allStatuses')}</option>
                <option value='ACTIVE'>{t('students.status.active')}</option>
                <option value='LEFT'>{t('students.status.left')}</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setLevelFilter('');
                  setStatusFilter('');
                }}
                className='px-4 py-2 text-white rounded-md hover:opacity-80 transition-opacity'
                style={{ backgroundColor: 'var(--mode-secondary)' }}
              >
                {t('common.reset')}
              </button>
            </div>

            {/* Export/Print Actions */}
            <div className='flex gap-3 mb-4 justify-end'>
              <button
                onClick={exportToCSV}
                disabled={students.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-opacity ${
                  students.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                }`}
                style={{ 
                  backgroundColor: students.length === 0 ? 'var(--mode-textSecondary)' : 'var(--mode-accent)',
                  color: 'white'
                }}
                title={t('students.exportCSV')}
              >
                <Download className='h-4 w-4' />
                {t('students.exportCSV')}
              </button>
              <button
                onClick={printStudents}
                disabled={students.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-opacity ${
                  students.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                }`}
                style={{ 
                  backgroundColor: students.length === 0 ? 'var(--mode-textSecondary)' : 'var(--mode-primary)',
                  color: 'white'
                }}
                title={t('students.printList')}
              >
                <Printer className='h-4 w-4' />
                {t('students.print')}
              </button>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y' style={{ borderColor: 'var(--mode-border)' }}>
                <thead style={{ backgroundColor: 'var(--mode-surface)' }}>
                  <tr>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}></th>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>{t('students.table.photo')}</th>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>{t('students.table.fullName')}</th>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>{t('students.table.level')}</th>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>{t('students.table.classroom')}</th>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>{t('students.table.guardian')}</th>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>{t('students.table.phone')}</th>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>{t('students.table.status')}</th>
                    <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>{t('students.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className='divide-y' style={{ 
                  backgroundColor: 'var(--mode-card)',
                  borderColor: 'var(--mode-border)'
                }}>
                  {students.map((student) => (
                    <React.Fragment key={student.id}>
                      <tr 
                        className='hover:opacity-80 transition-all duration-200 cursor-pointer'
                        style={{ backgroundColor: 'var(--mode-surface)' }}
                        onClick={() => toggleRow(student.id)}
                      >
                        <td className={`px-6 py-4 whitespace-nowrap ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <button className='hover:opacity-70 transition-opacity' style={{ color: 'var(--mode-textSecondary)' }}>
                            {isRowExpanded(student.id) ? (
                              <ChevronDown className='h-5 w-5' />
                            ) : (
                              <ChevronRight className='h-5 w-5' />
                            )}
                          </button>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className='flex justify-center'>
                            <div className='relative'>
                              <div className='w-10 h-10 rounded-full overflow-hidden border-2' style={{ borderColor: 'var(--mode-border)' }}>
                                {student.photoUrl ? (
                                  <img
                                    src={student.photoUrl}
                                    alt={getDisplayName(student)}
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
                                  !student.photoUrl ? 'flex' : 'hidden'
                                }`} style={{ backgroundColor: 'var(--mode-surface)' }}>
                                  <User className='h-5 w-5' style={{ color: 'var(--mode-textSecondary)' }} />
                                </div>
                              </div>
                              {user?.role === 'OWNER' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPhotoModal(student);
                                  }}
                                  className={`absolute p-1 rounded-full text-white hover:opacity-80 transition-opacity ${
                                    i18n.language === 'ar' ? '-bottom-1 -left-1' : '-bottom-1 -right-1'
                                  }`}
                                  style={{ backgroundColor: 'var(--mode-primary)' }}
                                  title={t('students.editPhoto')}
                                >
                                  <Camera className='h-3 w-3' />
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className='text-sm font-medium' style={{ color: 'var(--mode-text)' }}>
                            {getDisplayName(student)}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className='text-sm' style={{ color: 'var(--mode-text)' }}>{getLevelLabel(student.level)}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className='text-sm' style={{ color: 'var(--mode-text)' }}>{student.classroom || '-'}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className='text-sm' style={{ color: 'var(--mode-text)' }}>{getGuardianName(student)}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className='text-sm' style={{ color: 'var(--mode-text)' }}>{student.guardianPhone}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {getStatusBadge(student.status)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className='flex space-x-2'>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPaymentHistoryModal(student);
                              }}
                              className='p-1 text-green-600 hover:opacity-70 transition-opacity'
                              title={t('students.paymentHistory')}
                            >
                              <Receipt className='h-4 w-4' />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(student);
                              }}
                              className='p-1 text-blue-600 hover:opacity-70 transition-opacity'
                              title={t('students.edit')}
                            >
                              <Edit className='h-4 w-4' />
                            </button>
                            {user?.role === 'OWNER' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(student);
                                }}
                                className='p-1 text-red-600 hover:opacity-70 transition-opacity'
                                title={t('common.delete')}
                              >
                                <Trash2 className='h-4 w-4' />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row */}
                      {isRowExpanded(student.id) && (
                        <tr>
                          <td colSpan={8} className='px-6 py-4'>
                            <div className='bg-gray-50 rounded-lg p-4' style={{ backgroundColor: 'var(--mode-surface)' }}>
                              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                {/* Photo Section */}
                                <div className='flex justify-center'>
                                  <div className='relative'>
                                    <div className='w-32 h-32 rounded-full overflow-hidden border-4' style={{ borderColor: 'var(--mode-border)' }}>
                                      {student.photoUrl ? (
                                        <img
                                          src={student.photoUrl}
                                          alt={getDisplayName(student)}
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
                                        !student.photoUrl ? 'flex' : 'hidden'
                                      }`} style={{ backgroundColor: 'var(--mode-surface)' }}>
                                        <User className='h-16 w-16' style={{ color: 'var(--mode-textSecondary)' }} />
                                      </div>
                                      {user?.role === 'OWNER' && (
                                        <button
                                          onClick={() => openPhotoModal(student)}
                                          className={`absolute p-2 rounded-full text-white hover:opacity-80 transition-opacity ${
                                            i18n.language === 'ar' ? 'bottom-2 left-2' : 'bottom-2 right-2'
                                          }`}
                                          style={{ backgroundColor: 'var(--mode-primary)' }}
                                          title={t('students.editPhoto')}
                                        >
                                          <Camera className='h-5 w-5' />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Student Information */}
                                <div className='md:col-span-2 space-y-6'>
                                  {editingStudent === student.id ? (
                                    // Edit Mode - show both languages in form
                                    <>
                                      <div className='flex items-center justify-between mb-4'>
                                        <h4 className='text-lg font-medium' style={{ color: 'var(--mode-text)' }}>{t('students.editInformation')}</h4>
                                        <div className='flex space-x-2'>
                                          <button
                                            onClick={() => cancelEditing()}
                                            className='px-3 py-1 text-sm border rounded-md hover:opacity-70 transition-opacity'
                                            style={{ 
                                              backgroundColor: 'var(--mode-surface)', 
                                              color: 'var(--mode-textSecondary)',
                                              borderColor: 'var(--mode-border)'
                                            }}
                                          >
                                            {t('common.cancel')}
                                          </button>
                                          <button
                                            onClick={() => saveStudent(student)}
                                            className='px-3 py-1 text-sm text-white rounded-md hover:opacity-80 transition-opacity'
                                            style={{ backgroundColor: 'var(--mode-primary)' }}
                                          >
                                            {t('common.save')}
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <form data-student-id={student.id} className='space-y-4'>
                                        {/* Basic Information */}
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                          <div>
                                            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.firstName')}</label>
                                            <input
                                              type='text'
                                              name='firstName'
                                              defaultValue={student.firstName}
                                              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                              style={{ 
                                                backgroundColor: 'var(--mode-surface)', 
                                                color: 'var(--mode-text)', 
                                                borderColor: 'var(--mode-border)'
                                              }}
                                            />
                                          </div>
                                          <div>
                                            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.lastName')}</label>
                                            <input
                                              type='text'
                                              name='lastName'
                                              defaultValue={student.lastName}
                                              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                              style={{ 
                                                backgroundColor: 'var(--mode-surface)', 
                                                color: 'var(--mode-text)', 
                                                borderColor: 'var(--mode-border)'
                                              }}
                                            />
                                          </div>
                                          <div>
                                            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.firstNameArabic')}</label>
                                            <input
                                              type='text'
                                              name='firstNameArabic'
                                              defaultValue={student.firstNameArabic || ''}
                                              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                              style={{ 
                                                backgroundColor: 'var(--mode-surface)', 
                                                color: 'var(--mode-text)', 
                                                borderColor: 'var(--mode-border)'
                                              }}
                                            />
                                          </div>
                                          <div>
                                            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.lastNameArabic')}</label>
                                            <input
                                              type='text'
                                              name='lastNameArabic'
                                              defaultValue={student.lastNameArabic || ''}
                                              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                              style={{ 
                                                backgroundColor: 'var(--mode-surface)', 
                                                color: 'var(--mode-text)', 
                                                borderColor: 'var(--mode-border)'
                                              }}
                                            />
                                          </div>
                                          <div>
                                            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.birthDate')}</label>
                                            <input
                                              type='date'
                                              name='birthDate'
                                              defaultValue={student.birthDate}
                                              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                              style={{ 
                                                backgroundColor: 'var(--mode-surface)', 
                                                color: 'var(--mode-text)', 
                                                borderColor: 'var(--mode-border)'
                                              }}
                                            />
                                          </div>
                                          <div>
                                            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.level')}</label>
                                            <select
                                              name='level'
                                              defaultValue={student.level}
                                              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                              style={{ 
                                                backgroundColor: 'var(--mode-surface)', 
                                                color: 'var(--mode-text)', 
                                                borderColor: 'var(--mode-border)'
                                              }}
                                            >
                                              {mode === 'kindergarten' ? (
                                                <>
                                                  <option value='PETITE'>{t('students.levels.petite')}</option>
                                                  <option value='MOYENNE'>{t('students.levels.moyenne')}</option>
                                                  <option value='GRANDE'>{t('students.levels.grande')}</option>
                                                </>
                                              ) : (
                                                <>
                                                  <option value='CP1'>{t('students.levels.cp1')}</option>
                                                  <option value='CP2'>{t('students.levels.cp2')}</option>
                                                  <option value='CP3'>{t('students.levels.cp3')}</option>
                                                  <option value='CP4'>{t('students.levels.cp4')}</option>
                                                  <option value='CP5'>{t('students.levels.cp5')}</option>
                                                  <option value='CP6'>{t('students.levels.cp6')}</option>
                                                  <option value='AC1'>{t('students.levels.ac1')}</option>
                                                  <option value='AC2'>{t('students.levels.ac2')}</option>
                                                  <option value='AC3'>{t('students.levels.ac3')}</option>
                                                  <option value='TRONC_COMMUN'>{t('students.levels.troncCommun')}</option>
                                                  <option value='BAC1'>{t('students.levels.bac1')}</option>
                                                  <option value='BAC2'>{t('students.levels.bac2')}</option>
                                                </>
                                              )}
                                            </select>
                                          </div>
                                          <div>
                                            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.classroom')}</label>
                                            <input
                                              type='text'
                                              name='classroom'
                                              defaultValue={student.classroom || ''}
                                              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                              style={{ 
                                                backgroundColor: 'var(--mode-surface)', 
                                                color: 'var(--mode-text)', 
                                                borderColor: 'var(--mode-border)'
                                              }}
                                            />
                                          </div>
                                        </div>

                                        {/* Guardian Information */}
                                        <div>
                                          <h5 className='font-medium mb-3' style={{ color: 'var(--mode-text)' }}>{t('students.guardianInformation')}</h5>
                                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <div>
                                              <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.guardianName')}</label>
                                              <input
                                                type='text'
                                                name='guardianName'
                                                defaultValue={student.guardianName}
                                                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                                style={{ 
                                                  backgroundColor: 'var(--mode-surface)', 
                                                  color: 'var(--mode-text)', 
                                                  borderColor: 'var(--mode-border)'
                                                }}
                                              />
                                            </div>
                                            <div>
                                              <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.guardianNameArabic')}</label>
                                              <input
                                                type='text'
                                                name='guardianNameArabic'
                                                defaultValue={student.guardianNameArabic || ''}
                                                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                                style={{ 
                                                  backgroundColor: 'var(--mode-surface)', 
                                                  color: 'var(--mode-text)', 
                                                  borderColor: 'var(--mode-border)'
                                                }}
                                              />
                                            </div>
                                            <div>
                                              <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.phone')}</label>
                                              <input
                                                type='tel'
                                                name='guardianPhone'
                                                defaultValue={student.guardianPhone}
                                                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                                style={{ 
                                                  backgroundColor: 'var(--mode-surface)', 
                                                  color: 'var(--mode-text)', 
                                                  borderColor: 'var(--mode-border)'
                                                }}
                                              />
                                            </div>
                                            <div>
                                              <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.address')}</label>
                                              <textarea
                                                name='address'
                                                defaultValue={student.address || ''}
                                                rows={2}
                                                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                                style={{ 
                                                  backgroundColor: 'var(--mode-surface)', 
                                                  color: 'var(--mode-text)', 
                                                  borderColor: 'var(--mode-border)'
                                                }}
                                              />
                                            </div>
                                            <div>
                                              <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.addressArabic')}</label>
                                              <textarea
                                                name='addressArabic'
                                                defaultValue={student.addressArabic || ''}
                                                rows={2}
                                                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                                style={{ 
                                                  backgroundColor: 'var(--mode-surface)', 
                                                  color: 'var(--mode-text)', 
                                                  borderColor: 'var(--mode-border)'
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>

                                        {/* Additional Information */}
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                          <div>
                                            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.allergies')}</label>
                                            <textarea
                                              name='allergies'
                                              defaultValue={student.allergies || ''}
                                              rows={3}
                                              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                              style={{ 
                                                backgroundColor: 'var(--mode-surface)', 
                                                color: 'var(--mode-text)', 
                                                borderColor: 'var(--mode-border)'
                                              }}
                                              placeholder={t('students.form.noAllergies')}
                                            />
                                          </div>
                                          <div>
                                            <label className='block text-sm font-medium mb-1' style={{ color: 'var(--mode-text)' }}>{t('students.form.notes')}</label>
                                            <textarea
                                              name='notes'
                                              defaultValue={student.notes || ''}
                                              rows={3}
                                              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
                                              style={{ 
                                                backgroundColor: 'var(--mode-surface)', 
                                                color: 'var(--mode-text)', 
                                                borderColor: 'var(--mode-border)'
                                              }}
                                              placeholder={t('students.form.additionalNotes')}
                                            />
                                          </div>
                                        </div>
                                      </form>
                                    </>
                                  ) : (
                                    // Read Only Mode - show only current language
                                    <>
                                      <div className='flex items-center justify-between mb-4'>
                                        <h4 className='text-lg font-medium' style={{ color: 'var(--mode-text)' }}>{t('students.detailedInformation')}</h4>
                                      </div>
                                      
                                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div>
                                          <h4 className='font-medium mb-2' style={{ color: 'var(--mode-text)' }}>{t('students.personalInformation')}</h4>
                                          <div className='space-y-2 text-sm'>
                                            <div>
                                              <span className='font-medium' style={{ color: 'var(--mode-textSecondary)' }}>{t('students.form.birthDate')}:</span>
                                              <span className='ml-2' style={{ color: 'var(--mode-text)' }}>
                                                {new Date(student.birthDate).toLocaleDateString('fr-FR')}
                                              </span>
                                            </div>
                                            <div>
                                              <span className='font-medium' style={{ color: 'var(--mode-textSecondary)' }}>{t('students.age')}:</span>
                                              <span className='ml-2' style={{ color: 'var(--mode-text)' }}>
                                                {new Date().getFullYear() - new Date(student.birthDate).getFullYear()} {t('students.years')}
                                              </span>
                                            </div>
                                            <div>
                                              <span className='font-medium' style={{ color: 'var(--mode-textSecondary)' }}>{t('students.form.level')}:</span>
                                              <span className='ml-2' style={{ color: 'var(--mode-text)' }}>{getLevelLabel(student.level)}</span>
                                            </div>
                                            <div>
                                              <span className='font-medium' style={{ color: 'var(--mode-textSecondary)' }}>{t('students.form.classroom')}:</span>
                                              <span className='ml-2' style={{ color: 'var(--mode-text)' }}>{student.classroom || t('students.notAssigned')}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className='font-medium mb-2' style={{ color: 'var(--mode-text)' }}>{t('students.guardianContact')}</h4>
                                          <div className='space-y-2 text-sm'>
                                            <div>
                                              <span className='font-medium' style={{ color: 'var(--mode-textSecondary)' }}>{t('students.form.guardianName')}:</span>
                                              <span className='ml-2' style={{ color: 'var(--mode-text)' }}>{getGuardianName(student)}</span>
                                            </div>
                                            <div>
                                              <span className='font-medium' style={{ color: 'var(--mode-textSecondary)' }}>{t('students.form.phone')}:</span>
                                              <span className='ml-2' style={{ color: 'var(--mode-text)' }}>{student.guardianPhone}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Address */}
                                      {getAddress(student) && (
                                        <div>
                                          <h4 className='font-medium mb-2' style={{ color: 'var(--mode-text)' }}>{t('students.form.address')}</h4>
                                          <div className='text-sm' style={{ color: 'var(--mode-text)' }}>
                                            {getAddress(student)}
                                          </div>
                                        </div>
                                      )}

                                      {/* Additional Information */}
                                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        {student.allergies && (
                                          <div>
                                            <h4 className='font-medium mb-2' style={{ color: 'var(--mode-text)' }}>{t('students.form.allergies')}</h4>
                                            <div className='text-sm p-3 rounded-md' style={{ 
                                              backgroundColor: 'var(--mode-surface)', 
                                              color: 'var(--mode-text)' 
                                            }}>
                                              {student.allergies}
                                            </div>
                                          </div>
                                        )}
                                        {student.notes && (
                                          <div>
                                            <h4 className='font-medium mb-2' style={{ color: 'var(--mode-text)' }}>{t('students.form.notes')}</h4>
                                            <div className='text-sm p-3 rounded-md' style={{ 
                                              backgroundColor: 'var(--mode-surface)', 
                                              color: 'var(--mode-text)' 
                                            }}>
                                              {student.notes}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {students.length === 0 && (
              <div className='text-center py-8' style={{ color: 'var(--mode-textSecondary)' }}>
                {mode === 'kindergarten' 
                  ? t('students.noStudentsFoundKindergarten') 
                  : t('students.noStudentsFoundExtra')
                }
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
              <div className='rounded-lg p-6 max-w-md w-full mx-4' style={{ 
                backgroundColor: 'var(--mode-card)', 
                border: '1px solid var(--mode-border)',
                boxShadow: 'var(--mode-shadow)'
              }}>
                <h3 className='text-lg font-medium mb-4' style={{ color: 'var(--mode-text)' }}>
                  {t('students.confirmDelete')}
                </h3>
                <p className='mb-6' style={{ color: 'var(--mode-textSecondary)' }}>
                  {t('students.deleteConfirmation', { name: getDisplayName(studentToDelete!) })}
                </p>
                <div className='flex justify-end space-x-3'>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className='px-4 py-2 border rounded-md hover:opacity-70 transition-opacity'
                    style={{ 
                      backgroundColor: 'var(--mode-surface)', 
                      color: 'var(--mode-textSecondary)',
                      borderColor: 'var(--mode-border)'
                    }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={executeDelete}
                    className='px-4 py-2 text-white rounded-md hover:opacity-80 transition-opacity'
                    style={{ backgroundColor: 'var(--mode-accent)' }}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Photo Modal */}
          <PhotoModal
            isOpen={showPhotoModal}
            onClose={() => setShowPhotoModal(false)}
            onSubmit={(photoUrl) => selectedStudent?.id && handleUpdatePhoto(selectedStudent.id, photoUrl)}
            onUploadFile={(file) => selectedStudent?.id && handleUploadFile(selectedStudent.id, file)}
            onUploadCamera={(base64Data) => selectedStudent?.id && handleUploadCamera(selectedStudent.id, base64Data)}
            currentPhotoUrl={selectedStudent?.photoUrl}
            studentName={selectedStudent ? getDisplayName(selectedStudent) : ''}
            studentId={selectedStudent?.id || ''}
          />

          {/* Payment History Modal */}
          <PaymentHistoryModal
            isOpen={showPaymentHistoryModal}
            onClose={() => setShowPaymentHistoryModal(false)}
            studentId={selectedStudent?.id || ''}
            studentName={selectedStudent ? getDisplayName(selectedStudent) : ''}
            studentType={selectedStudent?.studentType || 'KINDERGARTEN'}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default StudentsPage;