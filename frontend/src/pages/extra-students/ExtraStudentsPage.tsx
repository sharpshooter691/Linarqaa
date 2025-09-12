import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useMode } from '@/contexts/ModeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit, 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Camera, 
  User,
  Search,
  Filter,
  Download,
  Printer,
  Users,
  Calendar,
  Phone,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  GraduationCap,
  Shield,
  Heart,
  Star,
  TrendingUp,
  Activity,
  Zap,
  Target,
  X,
  Save,
  Loader2,
  Grid,
  List,
  Eye,
  MoreVertical,
  Settings,
  Award,
  Clock,
  MapPin,
  Mail,
  Building,
  RefreshCw,
  CheckSquare,
  Square,
  CreditCard,
  Receipt
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PhotoModal from '@/components/modals/PhotoModal';

interface ExtraStudent {
  id: string;
  firstName: string;
  lastName: string;
  firstNameArabic?: string;
  lastNameArabic?: string;
  birthDate: string;
  photoUrl?: string;
  responsibleName: string;
  responsibleNameArabic?: string;
  responsiblePhone: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

const EditStudentForm: React.FC<{
  student: ExtraStudent;
  onSave: (data: Partial<ExtraStudent>) => void;
  onCancel: () => void;
}> = ({ student, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: student.firstName,
    lastName: student.lastName,
    firstNameArabic: student.firstNameArabic || '',
    lastNameArabic: student.lastNameArabic || '',
    birthDate: student.birthDate.split('T')[0],
    responsibleName: student.responsibleName,
    responsibleNameArabic: student.responsibleNameArabic || '',
    responsiblePhone: student.responsiblePhone,
    status: student.status,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('extraStudentRegistration.validation.firstNameRequired');
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('extraStudentRegistration.validation.lastNameRequired');
    }
    if (!formData.birthDate) {
      newErrors.birthDate = t('extraStudentRegistration.validation.birthDateRequired');
    }
    if (!formData.responsibleName.trim()) {
      newErrors.responsibleName = t('extraStudentRegistration.validation.responsibleNameRequired');
    }
    if (!formData.responsiblePhone.trim()) {
      newErrors.responsiblePhone = t('extraStudentRegistration.validation.responsiblePhoneRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--mode-text)' }}
          >
            {t('extraStudentRegistration.form.firstName')} *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{
              backgroundColor: 'var(--mode-surface)',
              color: 'var(--mode-text)',
              borderColor: errors.firstName ? '#ef4444' : 'var(--mode-border)'
            }}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--mode-text)' }}
          >
            {t('extraStudentRegistration.form.lastName')} *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{
              backgroundColor: 'var(--mode-surface)',
              color: 'var(--mode-text)',
              borderColor: errors.lastName ? '#ef4444' : 'var(--mode-border)'
            }}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--mode-text)' }}
          >
            {t('extraStudentRegistration.form.firstNameArabic')}
          </label>
          <input
            type="text"
            value={formData.firstNameArabic}
            onChange={(e) => setFormData(prev => ({ ...prev, firstNameArabic: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border transition-colors"
            style={{
              backgroundColor: 'var(--mode-surface)',
              color: 'var(--mode-text)',
              borderColor: 'var(--mode-border)'
            }}
          />
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--mode-text)' }}
          >
            {t('extraStudentRegistration.form.lastNameArabic')}
          </label>
          <input
            type="text"
            value={formData.lastNameArabic}
            onChange={(e) => setFormData(prev => ({ ...prev, lastNameArabic: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border transition-colors"
            style={{
              backgroundColor: 'var(--mode-surface)',
              color: 'var(--mode-text)',
              borderColor: 'var(--mode-border)'
            }}
          />
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--mode-text)' }}
          >
            {t('extraStudentRegistration.form.birthDate')} *
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              errors.birthDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{
              backgroundColor: 'var(--mode-surface)',
              color: 'var(--mode-text)',
              borderColor: errors.birthDate ? '#ef4444' : 'var(--mode-border)'
            }}
          />
          {errors.birthDate && (
            <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
          )}
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--mode-text)' }}
          >
            {t('extraStudentRegistration.form.status')}
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))}
            className="w-full px-4 py-3 rounded-xl border transition-colors"
            style={{
              backgroundColor: 'var(--mode-surface)',
              color: 'var(--mode-text)',
              borderColor: 'var(--mode-border)'
            }}
          >
            <option value="ACTIVE">{t('students.status.active')}</option>
            <option value="INACTIVE">{t('students.status.inactive')}</option>
          </select>
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--mode-text)' }}
          >
            {t('extraStudentRegistration.form.responsibleName')} *
          </label>
          <input
            type="text"
            value={formData.responsibleName}
            onChange={(e) => setFormData(prev => ({ ...prev, responsibleName: e.target.value }))}
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              errors.responsibleName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{
              backgroundColor: 'var(--mode-surface)',
              color: 'var(--mode-text)',
              borderColor: errors.responsibleName ? '#ef4444' : 'var(--mode-border)'
            }}
          />
          {errors.responsibleName && (
            <p className="text-red-500 text-sm mt-1">{errors.responsibleName}</p>
          )}
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--mode-text)' }}
          >
            {t('extraStudentRegistration.form.responsiblePhone')} *
          </label>
          <input
            type="tel"
            value={formData.responsiblePhone}
            onChange={(e) => setFormData(prev => ({ ...prev, responsiblePhone: e.target.value }))}
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              errors.responsiblePhone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{
              backgroundColor: 'var(--mode-surface)',
              color: 'var(--mode-text)',
              borderColor: errors.responsiblePhone ? '#ef4444' : 'var(--mode-border)'
            }}
          />
          {errors.responsiblePhone && (
            <p className="text-red-500 text-sm mt-1">{errors.responsiblePhone}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t" style={{ borderColor: 'var(--mode-border)' }}>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl font-medium transition-colors"
          style={{
            backgroundColor: 'var(--mode-surface)',
            color: 'var(--mode-text)',
            borderColor: 'var(--mode-border)'
          }}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="px-6 py-3 rounded-xl font-medium text-white transition-colors"
          style={{
            backgroundColor: 'var(--mode-primary)'
          }}
        >
          {t('common.save')}
        </button>
      </div>
    </form>
  );
};

const ExtraStudentsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { mode } = useMode();
  const navigate = useNavigate();
  
  const [students, setStudents] = useState<ExtraStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<ExtraStudent | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ExtraStudent | null>(null);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudentData, setEditingStudentData] = useState<ExtraStudent | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [showSelectAll, setShowSelectAll] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra-students');
      console.log('API Response:', response.data);
      
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        setStudents(response.data.content);
      } else if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: t('common.error'),
        description: t('students.loadError'),
        variant: "destructive"
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await api.delete(`/extra-students/${studentId}`);
      toast({
        title: t('common.success'),
        description: t('students.deleteSuccess'),
      });
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: t('common.error'),
        description: t('students.deleteError'),
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (student: ExtraStudent) => {
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
      await api.patch(`/extra-students/${studentId}/photo`, { photoUrl });
      toast({
        title: t('common.success'),
        description: t('students.photoUpdateSuccess'),
      });
      fetchStudents();
    } catch (error) {
      console.error('Error updating photo:', error);
      toast({
        title: t('common.error'),
        description: t('students.photoUpdateError'),
        variant: "destructive",
      });
    }
  };

  const handleUploadFile = async (file: File) => {
    if (!selectedStudent) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    await api.post(`/extra-students/${selectedStudent.id}/upload-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    fetchStudents();
  };

  const handleUploadCamera = async (base64Data: string) => {
    if (!selectedStudent) return;
    
    await api.post(`/extra-students/${selectedStudent.id}/upload-camera-photo`, {
      base64Data: base64Data
    });
    
    fetchStudents();
  };

  const openPhotoModal = (student: ExtraStudent) => {
    setSelectedStudent(student);
    setShowPhotoModal(true);
  };

  const startEditing = (student: ExtraStudent) => {
    if (viewMode === 'grid') {
      setEditingStudentData(student);
      setShowEditModal(true);
    } else {
      setEditingStudent(student.id);
      const newExpandedRows = new Set(expandedRows);
      newExpandedRows.add(student.id);
      setExpandedRows(newExpandedRows);
    }
  };

  const cancelEditing = () => {
    setEditingStudent(null);
    if (editingStudent) {
      const newExpandedRows = new Set(expandedRows);
      newExpandedRows.delete(editingStudent);
      setExpandedRows(newExpandedRows);
    }
  };

  const handleEditSave = async (updatedData: Partial<ExtraStudent>) => {
    if (!editingStudentData) return;
    
    try {
      await api.put(`/extra-students/${editingStudentData.id}`, updatedData);
      
      toast({
        title: t('common.success'),
        description: t('students.saveSuccess', { name: `${updatedData.firstName} ${updatedData.lastName}` }),
      });
      
      setShowEditModal(false);
      setEditingStudentData(null);
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

  const saveStudent = async (student: ExtraStudent) => {
    try {
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
        responsibleName: formData.get('responsibleName') as string,
        responsibleNameArabic: formData.get('responsibleNameArabic') as string,
        responsiblePhone: formData.get('responsiblePhone') as string,
        photoUrl: student.photoUrl,
      };

      await api.put(`/extra-students/${student.id}`, updatedStudent);
      
      toast({
        title: t('common.success'),
        description: t('students.saveSuccess', { name: `${updatedStudent.firstName} ${updatedStudent.lastName}` }),
      });
      
      setEditingStudent(null);
      const newExpandedRows = new Set(expandedRows);
      newExpandedRows.delete(student.id);
      setExpandedRows(newExpandedRows);
      
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

  const getPhotoUrl = (photoUrl?: string) => {
    if (!photoUrl) return '';
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    return `http://localhost:8080/api${photoUrl}`;
  };

  const getStatusIcon = (status: string) => {
    return status === 'ACTIVE' ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusText = (status: string) => {
    return status === 'ACTIVE' ? t('students.status.active') : t('students.status.inactive');
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.responsibleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.responsiblePhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === '' || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'ACTIVE').length;
  const inactiveStudents = students.filter(s => s.status === 'INACTIVE').length;
  const avgAge = students.length > 0 ? 
    students.reduce((sum, s) => {
      const birthDate = new Date(s.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return sum + age;
    }, 0) / students.length : 0;

  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
    setShowSelectAll(newSelected.size > 0);
  };

  const selectAllStudents = () => {
    const allStudentIds = new Set(filteredStudents.map(student => student.id));
    setSelectedStudents(allStudentIds);
    setShowSelectAll(true);
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
    setShowSelectAll(false);
  };

  const exportSelectedToCSV = () => {
    if (selectedStudents.size === 0) {
      toast({
        title: t('common.error'),
        description: t('students.noStudentsSelected'),
        variant: "destructive",
      });
      return;
    }

    const selectedStudentsData = filteredStudents.filter(student => 
      selectedStudents.has(student.id)
    );

    const headers = [
      t('students.export.fullName'),
      t('students.export.firstNameArabic'),
      t('students.export.lastNameArabic'),
      t('students.export.birthDate'),
      t('students.export.guardian'),
      t('students.export.guardianArabic'),
      t('students.export.phone'),
      t('students.export.status')
    ];

    const csvContent = [
      headers.join(','),
      ...selectedStudentsData.map(student => [
        `"${student.firstName} ${student.lastName}"`,
        `"${student.firstNameArabic || ''}"`,
        `"${student.lastNameArabic || ''}"`,
        `"${new Date(student.birthDate).toLocaleDateString()}"`,
        `"${student.responsibleName}"`,
        `"${student.responsibleNameArabic || ''}"`,
        `"${student.responsiblePhone}"`,
        `"${getStatusText(student.status)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `extra-students-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: t('students.exportSuccess'),
      description: t('students.exportDescription', { 
        count: selectedStudents.size, 
        type: t('students.extraCourse') 
      }),
    });
  };

  const printSelectedStudents = () => {
    if (selectedStudents.size === 0) {
      toast({
        title: t('common.error'),
        description: t('students.noStudentsSelected'),
        variant: "destructive",
      });
      return;
    }

    const selectedStudentsData = filteredStudents.filter(student => 
      selectedStudents.has(student.id)
    );

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const title = t('students.printTitleExtra');
    const currentDate = new Date().toLocaleDateString();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #333; margin-bottom: 10px; }
            .header p { color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .photo { width: 50px; height: 50px; object-fit: cover; border-radius: 50%; }
            .status-active { color: green; font-weight: bold; }
            .status-inactive { color: red; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p>${t('students.printedOn')}: ${currentDate}</p>
            <p>${t('students.totalStudents')}: ${selectedStudentsData.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>${t('students.printHeaders.photo')}</th>
                <th>${t('students.printHeaders.fullName')}</th>
                <th>${t('students.printHeaders.birthDate')}</th>
                <th>${t('students.printHeaders.guardian')}</th>
                <th>${t('students.printHeaders.phone')}</th>
                <th>${t('students.printHeaders.status')}</th>
              </tr>
            </thead>
            <tbody>
              ${selectedStudentsData.map(student => `
                <tr>
                  <td>
                    ${student.photoUrl ? 
                      `<img src="${getPhotoUrl(student.photoUrl)}" class="photo" alt="${student.firstName} ${student.lastName}">` : 
                      '<div class="photo" style="background-color: #f0f0f0; display: flex; align-items: center; justify-content: center;">👤</div>'
                    }
                  </td>
                  <td>${student.firstName} ${student.lastName}</td>
                  <td>${new Date(student.birthDate).toLocaleDateString()}</td>
                  <td>${student.responsibleName}</td>
                  <td>${student.responsiblePhone}</td>
                  <td class="status-${student.status.toLowerCase()}">${getStatusText(student.status)}</td>
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
      description: t('students.printDescription', { 
        count: selectedStudents.size, 
        type: t('students.extraCourse') 
      }),
    });
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--mode-background)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div 
            className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto mb-4"
            style={{ borderColor: 'var(--mode-primary)' }}
          ></div>
          <p 
            className="text-lg font-medium"
            style={{ color: 'var(--mode-text)' }}
          >
            {t('students.loading')}
          </p>
        </motion.div>
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
            className="relative overflow-hidden rounded-3xl p-8 text-white transition-all duration-300"
            style={{
              background: `linear-gradient(to bottom right, var(--mode-primary), var(--mode-secondary))`,
              boxShadow: `0 20px 40px var(--mode-shadow)20`,
            }}
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      {t('students.title')} ✨
                    </h1>
                    <p className="text-white/90 text-lg">
                      {t('students.subtitleWithCount', { count: students.length })}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    <span className="text-white/90 text-sm">
                      {activeStudents} {t('students.status.active')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    <span className="text-white/90 text-sm">
                      {t('common.managedBy')} {user?.fullName}
                    </span>
                  </div>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/extra-students-register')}
                className="px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 text-white bg-white/20 backdrop-blur-sm border border-white/30"
              >
                <UserPlus size={20} />
                <span>{t('students.addStudent')}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div 
            className="rounded-2xl p-6 text-white"
            style={{
              background: `linear-gradient(to right, var(--mode-primary), var(--mode-secondary))`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('students.stats.totalStudents')}</p>
                <p className="text-3xl font-bold">{totalStudents}</p>
              </div>
              <Users size={32} className="opacity-80" />
            </div>
          </div>
          
          <div 
            className="rounded-2xl p-6 text-white"
            style={{
              background: `linear-gradient(to right, var(--mode-accent), var(--mode-primary))`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('students.stats.activeStudents')}</p>
                <p className="text-3xl font-bold">{activeStudents}</p>
              </div>
              <CheckCircle size={32} className="opacity-80" />
            </div>
          </div>
          
          <div 
            className="rounded-2xl p-6 text-white"
            style={{
              background: `linear-gradient(to right, var(--mode-secondary), var(--mode-accent))`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('students.stats.inactiveStudents')}</p>
                <p className="text-3xl font-bold">{inactiveStudents}</p>
              </div>
              <XCircle size={32} className="opacity-80" />
            </div>
          </div>
          
          <div 
            className="rounded-2xl p-6 text-white"
            style={{
              background: `linear-gradient(to right, var(--mode-primary), var(--mode-accent))`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('students.stats.avgAge')}</p>
                <p className="text-3xl font-bold">{avgAge.toFixed(1)}</p>
              </div>
              <Calendar size={32} className="opacity-80" />
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 shadow-lg border mb-8"
          style={{
            backgroundColor: 'var(--mode-card)', 
            borderColor: 'var(--mode-border)',
            boxShadow: `0 10px 30px var(--mode-shadow)20`
          }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--mode-textSecondary)' }}
              />
              <input
                type="text"
                placeholder={t('students.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{ 
                  backgroundColor: 'var(--mode-surface)', 
                  color: 'var(--mode-text)', 
                  borderColor: 'var(--mode-border)',
                }}
              />
            </div>
            
            <div className="flex items-center space-x-4">
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
                <option value="">{t('students.filter.allStatus')}</option>
                <option value="ACTIVE">{t('students.status.active')}</option>
                <option value="INACTIVE">{t('students.status.inactive')}</option>
              </select>
              
              <div 
                className="flex rounded-xl p-1"
                style={{ backgroundColor: 'var(--mode-surface)' }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'shadow-sm' : ''}`}
                  style={{
                    backgroundColor: viewMode === 'grid' ? 'var(--mode-card)' : 'transparent',
                    color: 'var(--mode-text)'
                  }}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'shadow-sm' : ''}`}
                  style={{
                    backgroundColor: viewMode === 'list' ? 'var(--mode-card)' : 'transparent',
                    color: 'var(--mode-text)'
                  }}
                >
                  <List size={16} />
                </button>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center p-3 border rounded-xl transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  color: 'var(--mode-text)',
                  borderColor: 'var(--mode-border)'
                }}
                title={t('students.export')}
                onClick={exportSelectedToCSV}
              >
                <Download className="h-4 w-4" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center p-3 border rounded-xl transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  color: 'var(--mode-text)',
                  borderColor: 'var(--mode-border)'
                }}
                title={t('students.print')}
                onClick={printSelectedStudents}
              >
                <Printer className="h-4 w-4" />
              </motion.button>

              {showSelectAll && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={selectAllStudents}
                  className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                  style={{
                    backgroundColor: 'var(--mode-primary)',
                    color: 'white'
                  }}
                >
                  <CheckSquare size={16} />
                  <span>{t('students.selectAll')}</span>
                </motion.button>
              )}

              {selectedStudents.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearSelection}
                  className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                  style={{
                    backgroundColor: 'var(--mode-surface)',
                    color: 'var(--mode-text)',
                    borderColor: 'var(--mode-border)'
                  }}
                >
                  <X size={16} />
                  <span>{t('students.clearSelection')}</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Students Display */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 ${
                    selectedStudents.has(student.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--mode-card)',
                    borderColor: selectedStudents.has(student.id) ? 'var(--mode-primary)' : 'var(--mode-border)',
                    boxShadow: `0 10px 30px var(--mode-shadow)20`
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleStudentSelection(student.id)}
                      className="p-2 rounded-xl transition-all duration-200"
                      style={{
                        backgroundColor: selectedStudents.has(student.id) ? 'var(--mode-primary)' : 'var(--mode-surface)',
                        color: selectedStudents.has(student.id) ? 'white' : 'var(--mode-textSecondary)'
                      }}
                    >
                      {selectedStudents.has(student.id) ? (
                        <CheckSquare size={20} />
                      ) : (
                        <Square size={20} />
                      )}
                    </motion.button>
                    
                    <div 
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {getStatusText(student.status)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mb-4">
                    <div className="relative">
                      <div 
                        className="w-16 h-16 rounded-2xl overflow-hidden border-2 flex items-center justify-center shadow-lg"
                        style={{
                          borderColor: 'var(--mode-border)',
                          backgroundColor: 'var(--mode-surface)',
                        }}
                      >
                        {student.photoUrl ? (
                          <img
                            src={getPhotoUrl(student.photoUrl)}
                            alt={`${student.firstName} ${student.lastName}`}
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
                          !student.photoUrl ? 'flex' : 'hidden'
                        }`}>
                          <User className="h-8 w-8" style={{ color: 'var(--mode-textSecondary)' }} />
                        </div>
                      </div>
                      {user?.role === 'OWNER' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openPhotoModal(student)}
                          className="absolute -bottom-1 -right-1 p-2 rounded-full text-white shadow-lg"
                          style={{ backgroundColor: 'var(--mode-primary)' }}
                        >
                          <Camera className="h-3 w-3" />
                        </motion.button>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="text-xl font-bold mb-1"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {student.firstName} {student.lastName}
                      </h3>
                      {(student.firstNameArabic || student.lastNameArabic) && (
                        <p 
                          className="text-sm mb-2"
                          style={{ color: 'var(--mode-textSecondary)' }}
                        >
                          {student.firstNameArabic} {student.lastNameArabic}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Student Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center" style={{ color: 'var(--mode-textSecondary)' }}>
                        <Calendar size={16} className="mr-2" />
                        <span className="text-sm">{t('students.table.birthDate')}</span>
                      </div>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {new Date(student.birthDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center" style={{ color: 'var(--mode-textSecondary)' }}>
                        <User size={16} className="mr-2" />
                        <span className="text-sm">{t('students.table.guardianName')}</span>
                      </div>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {student.responsibleName}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center" style={{ color: 'var(--mode-textSecondary)' }}>
                        <Phone size={16} className="mr-2" />
                        <span className="text-sm">{t('students.table.phone')}</span>
                      </div>
                      <span 
                        className="font-semibold"
                        style={{ color: 'var(--mode-primary)' }}
                      >
                        {student.responsiblePhone}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startEditing(student)}
                      className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-lg"
                      style={{
                        backgroundColor: 'var(--mode-primary)',
                        color: 'white'
                      }}
                    >
                      <Edit size={16} className="inline mr-1" />
                      {t('common.edit')}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => confirmDelete(student)}
                      className="px-4 py-2 rounded-xl hover:opacity-80 transition-colors"
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white'
                      }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Table view with selection checkboxes
            <div 
              className="rounded-2xl shadow-lg border overflow-hidden"
              style={{
                backgroundColor: 'var(--mode-card)',
                borderColor: 'var(--mode-border)',
                boxShadow: `0 10px 30px var(--mode-shadow)20`
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full table-fixed divide-y" style={{ borderColor: 'var(--mode-border)' }}>
                  <thead style={{ 
                    background: `linear-gradient(to bottom right, var(--mode-primary), var(--mode-secondary))`
                  }}>
                    <tr>
                      <th className="w-12 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={selectAllStudents}
                          className="p-1 rounded transition-colors text-white"
                        >
                          <CheckSquare size={16} />
                        </motion.button>
                      </th>
                      <th className="w-12 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white"></th>
                      <th className="w-1/4 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">{t('students.table.fullName')}</th>
                      <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">{t('students.table.birthDate')}</th>
                      <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">{t('students.table.guardianName')}</th>
                      <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">{t('students.table.phone')}</th>
                      <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">{t('students.table.status')}</th>
                      <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">{t('students.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--mode-border)' }}>
                    {filteredStudents.map((student, index) => (
                      <React.Fragment key={student.id}>
                        <motion.tr
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`hover:opacity-80 transition-opacity duration-200 cursor-pointer ${
                            selectedStudents.has(student.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                          style={{ backgroundColor: 'var(--mode-card)' }}
                        >
                          <td className="px-3 py-4 text-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleStudentSelection(student.id)}
                              className="p-1 rounded transition-colors"
                              style={{ 
                                color: selectedStudents.has(student.id) ? 'var(--mode-primary)' : 'var(--mode-textSecondary)'
                              }}
                            >
                              {selectedStudents.has(student.id) ? (
                                <CheckSquare size={16} />
                              ) : (
                                <Square size={16} />
                              )}
                            </motion.button>
                          </td>
                          <td className="px-3 py-4 text-center">
                            <button 
                              className="hover:opacity-70 transition-opacity" 
                              style={{ color: 'var(--mode-textSecondary)' }}
                              onClick={() => toggleRow(student.id)}
                            >
                              {isRowExpanded(student.id) ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                            </button>
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center justify-center">
                              <div className="relative mr-3">
                                <div 
                                  className="w-8 h-8 rounded-full overflow-hidden border-2"
                                  style={{ borderColor: 'var(--mode-border)' }}
                                >
                                  {student.photoUrl ? (
                                    <img
                                      src={getPhotoUrl(student.photoUrl)}
                                      alt={`${student.firstName} ${student.lastName}`}
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
                                    !student.photoUrl ? 'flex' : 'hidden'
                                  }`} style={{ backgroundColor: 'var(--mode-surface)' }}>
                                    <User className="h-4 w-4" style={{ color: 'var(--mode-textSecondary)' }} />
                                  </div>
                                  {user?.role === 'OWNER' && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openPhotoModal(student);
                                      }}
                                      className="absolute -bottom-1 -right-1 p-1 rounded-full text-white shadow-lg"
                                      style={{ backgroundColor: 'var(--mode-primary)' }}
                                    >
                                      <Camera className="h-2 w-2" />
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-medium truncate" style={{ color: 'var(--mode-text)' }}>
                                  {student.firstName} {student.lastName}
                                </div>
                                {(student.firstNameArabic || student.lastNameArabic) && (
                                  <div className="text-xs truncate" style={{ color: 'var(--mode-textSecondary)' }}>
                                    {student.firstNameArabic} {student.lastNameArabic}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center text-sm" style={{ color: 'var(--mode-text)' }}>
                            {new Date(student.birthDate).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-4 text-center text-sm" style={{ color: 'var(--mode-text)' }}>
                            {student.responsibleName}
                          </td>
                          <td className="px-3 py-4 text-center text-sm" style={{ color: 'var(--mode-text)' }}>
                            {student.responsiblePhone}
                          </td>
                          <td className="px-3 py-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {getStatusIcon(student.status)}
                              <span className="text-sm" style={{ color: 'var(--mode-text)' }}>
                                {getStatusText(student.status)}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center">
                            <div className="flex justify-center space-x-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(student);
                                }}
                                className="p-2 rounded-md transition-all duration-200"
                                style={{
                                  backgroundColor: 'var(--mode-primary)20',
                                  color: 'var(--mode-primary)'
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(student);
                                }}
                                className="p-2 rounded-md transition-all duration-200"
                                style={{
                                  backgroundColor: '#ef444420',
                                  color: '#ef4444'
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>

                        {/* Expanded Row for Editing */}
                        {isRowExpanded(student.id) && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t"
                            style={{ 
                              backgroundColor: 'var(--mode-card)',
                              borderColor: 'var(--mode-border)'
                            }}
                          >
                            <td colSpan={8} className="px-6 py-4">
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                {editingStudent === student.id ? (
                                  <form 
                                    data-student-id={student.id}
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      saveStudent(student);
                                    }}
                                    className="space-y-4"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          {t('students.form.firstName')}
                                        </label>
                                        <input
                                          type="text"
                                          name="firstName"
                                          defaultValue={student.firstName}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          {t('students.form.lastName')}
                                        </label>
                                        <input
                                          type="text"
                                          name="lastName"
                                          defaultValue={student.lastName}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          {t('students.form.firstNameArabic')}
                                        </label>
                                        <input
                                          type="text"
                                          name="firstNameArabic"
                                          defaultValue={student.firstNameArabic || ''}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          {t('students.form.lastNameArabic')}
                                        </label>
                                        <input
                                          type="text"
                                          name="lastNameArabic"
                                          defaultValue={student.lastNameArabic || ''}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          {t('students.form.birthDate')}
                                        </label>
                                        <input
                                          type="date"
                                          name="birthDate"
                                          defaultValue={student.birthDate}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          {t('students.form.guardianName')}
                                        </label>
                                        <input
                                          type="text"
                                          name="responsibleName"
                                          defaultValue={student.responsibleName}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          {t('students.form.guardianNameArabic')}
                                        </label>
                                        <input
                                          type="text"
                                          name="responsibleNameArabic"
                                          defaultValue={student.responsibleNameArabic || ''}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          {t('students.form.phone')}
                                        </label>
                                        <input
                                          type="tel"
                                          name="responsiblePhone"
                                          defaultValue={student.responsiblePhone}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                      <button
                                        type="button"
                                        onClick={cancelEditing}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                      >
                                        {t('common.cancel')}
                                      </button>
                                      <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                      >
                                        {t('common.save')}
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="text-center py-4">
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                      {t('students.clickToEdit')}
                                    </p>
                                    <button
                                      onClick={() => startEditing(student)}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                      {t('students.startEditing')}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>

        {filteredStudents.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div 
              className="mx-auto h-24 w-24 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--mode-surface)' }}
            >
              <GraduationCap className="h-12 w-12" style={{ color: 'var(--mode-textSecondary)' }} />
            </div>
            <h3 
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--mode-text)' }}
            >
              {t('students.noStudents')}
            </h3>
            <p 
              className="text-lg mb-6"
              style={{ color: 'var(--mode-textSecondary)' }}
            >
              {t('students.noStudentsDescription')}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/extra-students-register')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white mx-auto"
              style={{
                background: `linear-gradient(to right, var(--mode-primary), var(--mode-secondary))`
              }}
            >
              <UserPlus className="h-5 w-5" />
              <span className="font-medium">{t('students.addStudent')}</span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {showPhotoModal && selectedStudent && (
          <PhotoModal
            isOpen={showPhotoModal}
            studentId={selectedStudent.id}
            studentName={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
            currentPhotoUrl={selectedStudent.photoUrl || ''}
            onClose={() => {
              setShowPhotoModal(false);
              setSelectedStudent(null);
            }}
            onSubmit={(photoUrl) => handleUpdatePhoto(selectedStudent.id, photoUrl)}
            onUploadFile={handleUploadFile}
            onUploadCamera={handleUploadCamera}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      {showEditModal && editingStudentData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--mode-card)',
              borderColor: 'var(--mode-border)',
              boxShadow: `0 20px 40px var(--mode-shadow)40`
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('students.editStudent')}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  style={{ color: 'var(--mode-textSecondary)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <EditStudentForm
                student={editingStudentData}
                onSave={handleEditSave}
                onCancel={() => setShowEditModal(false)}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && studentToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="rounded-3xl shadow-2xl max-w-md w-full"
              style={{
                backgroundColor: 'var(--mode-card)',
                borderColor: 'var(--mode-border)',
                boxShadow: `0 25px 50px var(--mode-shadow)40`
              }}
            >
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: '#ef444420' }}
                  >
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <h2 
                    className="text-xl font-bold"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('students.confirmDelete')}
                  </h2>
                </div>
                
                <p 
                  className="text-lg mb-8"
                  style={{ color: 'var(--mode-textSecondary)' }}
                >
                  {t('students.deleteConfirmation', { name: `${studentToDelete.firstName} ${studentToDelete.lastName}` })}
                </p>
                
                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowDeleteModal(false);
                      setStudentToDelete(null);
                    }}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                    style={{
                      backgroundColor: 'var(--mode-border)',
                      color: 'var(--mode-text)'
                    }}
                  >
                    <X className="h-4 w-4" />
                    <span>{t('common.cancel')}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={executeDelete}
                    className="px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center space-x-2"
                    style={{
                      backgroundColor: '#ef4444'
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{t('students.deleteStudent')}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExtraStudentsPage;