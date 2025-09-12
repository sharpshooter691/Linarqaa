import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useMode } from '@/contexts/ModeContext';
import { 
  Plus, 
  Users, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Star,
  Clock,
  Award,
  TrendingUp,
  Activity,
  Zap,
  Target,
  X,
  Check,
  AlertCircle,
  Grid,
  List,
  User,
  GraduationCap,
  Sparkles,
  Heart,
  BookMarked,
  Filter as FilterIcon
} from 'lucide-react';

// ... existing interfaces remain the same ...
interface ExtraCourse {
  id: string;
  title: string;
  description: string;
  monthlyPrice: number;
  capacity: number;
  active: boolean;
  schedule: string;
  instructor: string;
  createdAt: string;
  updatedAt: string;
}

interface Student {
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

interface Enrollment {
  id: string;
  studentId?: string;
  extraStudentId?: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  status: string;
  enrollmentDate: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

const ExtraCoursesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { mode } = useMode(); // Add useMode hook
  
  // ... existing state remains the same ...
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<ExtraCourse[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingCourse, setEditingCourse] = useState<ExtraCourse | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showEnrolledStudentsModal, setShowEnrolledStudentsModal] = useState(false);
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ExtraCourse | null>(null);
  
  // New UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'full' | 'available'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    monthlyPrice: '',
    capacity: '',
    schedule: '',
    instructor: ''
  });
  const [newEnrollment, setNewEnrollment] = useState({
    studentId: '',
    courseId: '',
    notes: ''
  });

  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // ... existing useEffect and functions remain the same ...
  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchEnrollments();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.student-dropdown')) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // ... all existing API functions remain the same ...
  const fetchStudents = async () => {
    try {
      console.log('Fetching extra students...');
      const response = await api.get('/extra-students');
      console.log('Extra students API response:', response.data);
      
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        console.log('Using paginated response, found', response.data.content.length, 'students');
        setStudents(response.data.content);
      } else if (Array.isArray(response.data)) {
        console.log('Using direct array response, found', response.data.length, 'students');
        setStudents(response.data);
      } else {
        console.log('Unexpected response structure:', response.data);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching extra students from /api/extra-students:', error);
      
      try {
        console.log('Trying fallback endpoint /api/students?type=extra_course...');
        const fallbackResponse = await api.get('/students?type=extra_course');
        console.log('Fallback API response:', fallbackResponse.data);
        
        if (Array.isArray(fallbackResponse.data)) {
          console.log('Using fallback response, found', fallbackResponse.data.length, 'students');
          setStudents(fallbackResponse.data);
        } else {
          console.log('Fallback also failed, setting empty array');
          setStudents([]);
        }
      } catch (fallbackError) {
        console.error('Fallback endpoint also failed:', fallbackError);
        setStudents([]);
      }
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extras/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      console.log('Fetching extra student enrollments...');
      const response = await api.get('/extra-students/enrollments');
      console.log('Enrollments response:', response.data);
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
    }
  };

  const addCourse = async () => {
    if (!newCourse.title || !newCourse.monthlyPrice || !newCourse.capacity || !newCourse.schedule || !newCourse.instructor) {
      showNotification('error', t('extraCourses.messages.fillRequiredFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/extras/courses', {
        ...newCourse,
        monthlyPrice: parseFloat(newCourse.monthlyPrice),
        capacity: parseInt(newCourse.capacity)
      });
      
      showNotification('success', t('extraCourses.messages.courseAddedSuccess'));
      setNewCourse({
        title: '',
        description: '',
        monthlyPrice: '',
        capacity: '',
        schedule: '',
        instructor: ''
      });
      setShowNewCourseModal(false);
      fetchCourses();
    } catch (error: any) {
      console.error('Error adding course:', error);
      showNotification('error', error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCourse = async () => {
    if (!editingCourse) return;

    if (!editingCourse.title || !editingCourse.monthlyPrice || !editingCourse.capacity || !editingCourse.schedule || !editingCourse.instructor) {
      showNotification('error', t('extraCourses.messages.fillRequiredFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.put(`/extras/courses/${editingCourse.id}`, {
        title: editingCourse.title,
        description: editingCourse.description,
        monthlyPrice: editingCourse.monthlyPrice,
        capacity: editingCourse.capacity,
        schedule: editingCourse.schedule,
        instructor: editingCourse.instructor
      });
      
      showNotification('success', t('extraCourses.messages.courseModifiedSuccess'));
      setEditingCourse(null);
      setShowEditForm(false);
      fetchCourses();
    } catch (error: any) {
      console.error('Error updating course:', error);
      showNotification('error', error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (window.confirm(t('extraCourses.messages.confirmDelete'))) {
      try {
        await api.delete(`/extras/courses/${courseId}`);
        showNotification('success', t('extraCourses.messages.courseDeletedSuccess'));
        fetchCourses();
      } catch (error: any) {
        console.error('Error deleting course:', error);
        showNotification('error', error.response?.data?.message || error.message);
      }
    }
  };

  const enrollStudent = async () => {
    if (!newEnrollment.studentId || !newEnrollment.courseId) {
      showNotification('error', t('extraCourses.messages.selectStudentAndCourse'));
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Attempting to enroll extra student:', newEnrollment);
      
      const enrollmentData = {
        extraStudentId: newEnrollment.studentId,
        courseId: newEnrollment.courseId,
        notes: newEnrollment.notes
      };
      
      console.log('Sending enrollment data:', enrollmentData);
      
      const response = await api.post('/extra-students/enrollments', enrollmentData);
      
      console.log('Enrollment successful:', response.data);
      showNotification('success', t('extraCourses.messages.studentAffiliatedSuccess'));
      
      setNewEnrollment({
        studentId: '',
        courseId: '',
        notes: ''
      });
      setShowEnrollmentModal(false);
      setSelectedCourse(null);
      setStudentSearchTerm('');
      setShowStudentDropdown(false);
      
      fetchEnrollments();
      fetchCourses();
    } catch (error: any) {
      console.error('Error enrolling extra student:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      showNotification('error', t('extraCourses.messages.enrollmentError', { error: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... existing helper functions remain the same ...
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNewCourse({
      ...newCourse,
      [e.target.name]: e.target.value
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editingCourse) return;
    
    const { name, value } = e.target;
    setEditingCourse({
      ...editingCourse,
      [name]: name === 'monthlyPrice' || name === 'capacity' ? parseFloat(value) : value
    });
  };

  const handleEnrollmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNewEnrollment({
      ...newEnrollment,
      [e.target.name]: e.target.value
    });
  };

  const openEditForm = (course: ExtraCourse) => {
    setEditingCourse({ ...course });
    setShowEditForm(true);
  };

  const openEnrollmentModal = (course: ExtraCourse) => {
    setSelectedCourse(course);
    setNewEnrollment({
      studentId: '',
      courseId: course.id,
      notes: ''
    });
    setShowEnrollmentModal(true);
  };

  const openEnrolledStudentsModal = (course: ExtraCourse) => {
    setSelectedCourse(course);
    setShowEnrolledStudentsModal(true);
  };

  const getEnrollmentsForCourse = (courseId: string) => {
    const courseEnrollments = enrollments.filter(enrollment => {
      const matchesCourse = enrollment.courseId === courseId;
      return matchesCourse;
    });
    
    return courseEnrollments;
  };

  const getAvailableStudents = () => {
    console.log('getAvailableStudents called with', students.length, 'students');
    console.log('getAvailableStudents returning all', students.length, 'students (no age filter)');
    return students;
  };

  const getFilteredStudents = () => {
    const availableStudents = getAvailableStudents();
    console.log('getFilteredStudents: availableStudents count =', availableStudents.length);
    
    if (!studentSearchTerm.trim()) {
      console.log('getFilteredStudents: no search term, returning all available students');
      return availableStudents;
    }
    
    const searchTerm = studentSearchTerm.toLowerCase().trim();
    console.log('getFilteredStudents: searching for term =', searchTerm);
    
    const filteredStudents = availableStudents.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      if (fullName.includes(searchTerm)) return true;
      
      if (student.firstNameArabic && student.lastNameArabic) {
        const arabicName = `${student.firstNameArabic} ${student.lastNameArabic}`.toLowerCase();
        if (arabicName.includes(searchTerm)) return true;
      }
      
      if (student.firstName.toLowerCase().includes(searchTerm)) return true;
      if (student.lastName.toLowerCase().includes(searchTerm)) return true;
      if (student.firstNameArabic && student.firstNameArabic.toLowerCase().includes(searchTerm)) return true;
      if (student.lastNameArabic && student.lastNameArabic.toLowerCase().includes(searchTerm)) return true;
      
      return false;
    });
    
    console.log('getFilteredStudents: final filtered count =', filteredStudents.length);
    return filteredStudents;
  };

  const handleStudentSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentSearchTerm(e.target.value);
    setShowStudentDropdown(true);
  };

  // New filtering logic for courses
  const getFilteredCourses = () => {
    let filtered = courses;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(course => {
        const courseEnrollments = getEnrollmentsForCourse(course.id);
        const activeEnrollments = courseEnrollments.filter(e => e.status === 'ACTIVE');
        
        switch (filterStatus) {
          case 'active':
            return course.active;
          case 'full':
            return activeEnrollments.length >= course.capacity;
          case 'available':
            return course.active && activeEnrollments.length < course.capacity;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  // Statistics calculation
  const getStatistics = () => {
    const totalCourses = courses.length;
    const activeCourses = courses.filter(c => c.active).length;
    const totalEnrollments = enrollments.filter(e => e.status === 'ACTIVE').length;
    const totalRevenue = courses.reduce((sum, course) => {
      const courseEnrollments = getEnrollmentsForCourse(course.id);
      const activeEnrollments = courseEnrollments.filter(e => e.status === 'ACTIVE');
      return sum + (activeEnrollments.length * course.monthlyPrice);
    }, 0);

    return { totalCourses, activeCourses, totalEnrollments, totalRevenue };
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--mode-background)' }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-4"
            style={{ borderColor: 'var(--mode-primary)' }}
          />
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--mode-text)' }}
          >
            {t('extraCourses.messages.loading')}
          </h2>
          <p style={{ color: 'var(--mode-textSecondary)' }}>
            {t('extraCourses.messages.preparingDashboard')}
          </p>
        </div>
      </div>
    );
  }

  const stats = getStatistics();
  const filteredCourses = getFilteredCourses();

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: 'var(--mode-background)' }}
    >
      {/* Floating Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.3 }}
            className="fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg backdrop-blur-sm"
            style={{
              backgroundColor: notification.type === 'success' 
                ? 'var(--mode-primary)' 
                : '#ef4444',
              color: 'white'
            }}
          >
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
              <span>{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      {t('extraCourses.title')} ✨
                    </h1>
                    <p className="text-white/90 text-lg">
                      {t('extraCourses.subtitle')}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    <span className="text-white/90 text-sm">
                      {stats.totalCourses} {t('extraCourses.totalCourses')}
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
                onClick={() => setShowNewCourseModal(true)}
                className="px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 text-white bg-white/20 backdrop-blur-sm border border-white/30"
              >
                <Plus size={20} />
                <span>{t('extraCourses.addCourse')}</span>
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
                <p className="text-sm opacity-90">{t('extraCourses.table.title')}</p>
                <p className="text-3xl font-bold">{stats.totalCourses}</p>
              </div>
              <BookOpen size={32} className="opacity-80" />
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
                <p className="text-sm opacity-90">{t('extraCourses.table.activeCourses')}</p>
                <p className="text-3xl font-bold">{stats.activeCourses}</p>
              </div>
              <Zap size={32} className="opacity-80" />
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
                <p className="text-sm opacity-90">{t('extraCourses.table.enrolledStudents')}</p>
                <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
              </div>
              <Users size={32} className="opacity-80" />
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
                <p className="text-sm opacity-90">{t('extraCourses.table.monthlyPrice')}</p>
                <p className="text-3xl font-bold">{stats.totalRevenue} DH</p>
              </div>
              <TrendingUp size={32} className="opacity-80" />
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
                placeholder={t('extraCourses.messages.searchPlaceholder')}
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  color: 'var(--mode-text)',
                  borderColor: 'var(--mode-border)',
                }}
              >
                <option value="all">{t('extraCourses.filter.allCourses')}</option>
                <option value="active">{t('extraCourses.filter.activeCourses')}</option>
                <option value="available">{t('extraCourses.filter.availablePlaces')}</option>
                <option value="full">{t('extraCourses.filter.fullCourses')}</option>
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
            </div>
          </div>
        </motion.div>

        {/* Courses Display */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => {
                const courseEnrollments = getEnrollmentsForCourse(course.id);
                const activeEnrollments = courseEnrollments.filter(e => e.status === 'ACTIVE');
                const enrollmentPercentage = (activeEnrollments.length / course.capacity) * 100;
                
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--mode-card)',
                      borderColor: 'var(--mode-border)',
                      boxShadow: `0 10px 30px var(--mode-shadow)20`
                    }}
                  >
                    {/* Course Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 
                          className="text-xl font-bold mb-1"
                          style={{ color: 'var(--mode-text)' }}
                        >
                          {course.title}
                        </h3>
                        <p 
                          className="text-sm line-clamp-2"
                          style={{ color: 'var(--mode-textSecondary)' }}
                        >
                          {course.description}
                        </p>
                      </div>
                      <div 
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          course.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {course.active ? t('extraCourses.messages.active') : t('extraCourses.messages.inactive')}
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center" style={{ color: 'var(--mode-textSecondary)' }}>
                          <DollarSign size={16} className="mr-2" />
                          <span className="text-sm">{t('extraCourses.table.monthlyPrice')}</span>
                        </div>
                        <span 
                          className="font-semibold"
                          style={{ color: 'var(--mode-primary)' }}
                        >
                          {course.monthlyPrice} DH/mois
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center" style={{ color: 'var(--mode-textSecondary)' }}>
                          <Users size={16} className="mr-2" />
                          <span className="text-sm">{t('extraCourses.table.capacity')}</span>
                        </div>
                        <span 
                          className="font-semibold"
                          style={{ color: 'var(--mode-text)' }}
                        >
                          {activeEnrollments.length}/{course.capacity}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center" style={{ color: 'var(--mode-textSecondary)' }}>
                          <Clock size={16} className="mr-2" />
                          <span className="text-sm">{t('extraCourses.table.schedule')}</span>
                        </div>
                        <span 
                          className="text-sm font-medium"
                          style={{ color: 'var(--mode-text)' }}
                        >
                          {course.schedule}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center" style={{ color: 'var(--mode-textSecondary)' }}>
                          <GraduationCap size={16} className="mr-2" />
                          <span className="text-sm">{t('extraCourses.table.instructor')}</span>
                        </div>
                        <span 
                          className="text-sm font-medium"
                          style={{ color: 'var(--mode-text)' }}
                        >
                          {course.instructor}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--mode-textSecondary)' }}>
                        <span>{t('extraCourses.table.enrollments')}</span>
                        <span>{Math.round(enrollmentPercentage)}%</span>
                      </div>
                      <div 
                        className="w-full rounded-full h-2"
                        style={{ backgroundColor: 'var(--mode-border)' }}
                      >
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(enrollmentPercentage, 100)}%`,
                            backgroundColor: enrollmentPercentage >= 100 ? '#ef4444' : 
                                          enrollmentPercentage >= 80 ? '#f59e0b' : 'var(--mode-primary)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEnrollmentModal(course)}
                        disabled={activeEnrollments.length >= course.capacity}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          activeEnrollments.length >= course.capacity
                            ? 'cursor-not-allowed opacity-50'
                            : 'hover:shadow-lg'
                        }`}
                        style={{
                          backgroundColor: activeEnrollments.length >= course.capacity
                            ? 'var(--mode-border)'
                            : 'var(--mode-primary)',
                          color: activeEnrollments.length >= course.capacity
                            ? 'var(--mode-textSecondary)'
                            : 'white'
                        }}
                      >
                        <UserPlus size={16} className="inline mr-1" />
                        {activeEnrollments.length >= course.capacity ? t('extraCourses.messages.complete') : t('extraCourses.enroll')}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEnrolledStudentsModal(course)}
                        className="px-4 py-2 rounded-xl hover:opacity-80 transition-colors"
                        style={{
                          backgroundColor: 'var(--mode-secondary)',
                          color: 'white'
                        }}
                      >
                        <Eye size={16} />
                      </motion.button>
                      
                      {user?.role === 'OWNER' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditForm(course)}
                            className="px-4 py-2 rounded-xl hover:opacity-80 transition-colors"
                            style={{
                              backgroundColor: 'var(--mode-accent)',
                              color: 'white'
                            }}
                          >
                            <Edit size={16} />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteCourse(course.id)}
                            className="px-4 py-2 rounded-xl hover:opacity-80 transition-colors"
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white'
                            }}
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
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
                      <th className="w-1/4 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">
                        {t('extraCourses.table.title')}
                      </th>
                      <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">
                        {t('extraCourses.table.monthlyPrice')}
                      </th>
                      <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">
                        {t('extraCourses.table.capacity')}
                      </th>
                      <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">
                        {t('extraCourses.table.schedule')}
                      </th>
                      <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">
                        {t('extraCourses.table.instructor')}
                      </th>
                      <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">
                        {t('extraCourses.table.status')}
                      </th>
                      <th className="w-1/6 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-white">
                        {t('extraCourses.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--mode-border)' }}>
                    {filteredCourses.map((course) => {
                      const courseEnrollments = getEnrollmentsForCourse(course.id);
                      const activeEnrollments = courseEnrollments.filter(e => e.status === 'ACTIVE');
                      
                      return (
                        <tr 
                          key={course.id} 
                          className="hover:opacity-80 transition-colors"
                          style={{ backgroundColor: 'var(--mode-card)' }}
                        >
                          <td className="px-3 py-4">
                            <div className="text-center">
                              <div 
                                className="text-sm font-medium truncate"
                                style={{ color: 'var(--mode-text)' }}
                                title={course.title}
                              >
                                {course.title}
                              </div>
                              <div 
                                className="text-xs truncate"
                                style={{ color: 'var(--mode-textSecondary)' }}
                                title={course.description}
                              >
                                {course.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center">
                            <span 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: 'var(--mode-primary)20',
                                color: 'var(--mode-primary)'
                              }}
                            >
                              {course.monthlyPrice} DH
                            </span>
                          </td>
                          <td className="px-3 py-4 text-center">
                            <span 
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                activeEnrollments.length >= course.capacity 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {activeEnrollments.length}/{course.capacity}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-center text-sm" style={{ color: 'var(--mode-text)' }}>
                            {course.schedule}
                          </td>
                          <td className="px-3 py-4 text-center text-sm" style={{ color: 'var(--mode-text)' }}>
                            {course.instructor}
                          </td>
                          <td className="px-3 py-4 text-center">
                            <span 
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                course.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {course.active ? t('extraCourses.messages.active') : t('extraCourses.messages.inactive')}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-center">
                            <div className="flex justify-center space-x-1">
                              <button 
                                onClick={() => openEnrollmentModal(course)}
                                disabled={activeEnrollments.length >= course.capacity}
                                className={`p-2 rounded-md transition-colors ${
                                  activeEnrollments.length >= course.capacity
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:opacity-80'
                                }`}
                                style={{
                                  backgroundColor: activeEnrollments.length >= course.capacity
                                    ? 'var(--mode-border)'
                                    : 'var(--mode-primary)',
                                  color: activeEnrollments.length >= course.capacity
                                    ? 'var(--mode-textSecondary)'
                                    : 'white'
                                }}
                                title={activeEnrollments.length >= course.capacity ? t('extraCourses.messages.complete') : t('extraCourses.enroll')}
                              >
                                <UserPlus size={16} />
                              </button>
                              <button 
                                onClick={() => openEnrolledStudentsModal(course)}
                                className="p-2 rounded-md hover:opacity-80 transition-colors"
                                style={{
                                  backgroundColor: 'var(--mode-secondary)',
                                  color: 'white'
                                }}
                                title={`${t('extraCourses.table.viewEnrolled')} (${courseEnrollments.length})`}
                              >
                                <Users size={16} />
                              </button>
                              {user?.role === 'OWNER' && (
                                <>
                                  <button 
                                    onClick={() => openEditForm(course)}
                                    className="p-2 rounded-md hover:opacity-80 transition-colors"
                                    style={{ 
                                      backgroundColor: 'var(--mode-primary)20',
                                      color: 'var(--mode-primary)' 
                                    }}
                                    title={t('extraCourses.edit')}
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    onClick={() => deleteCourse(course.id)}
                                    className="p-2 rounded-md hover:opacity-80 transition-colors"
                                    style={{ 
                                      backgroundColor: '#ef444420',
                                      color: '#ef4444' 
                                    }}
                                    title={t('extraCourses.delete')}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {filteredCourses.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div 
                className="rounded-2xl p-8 shadow-lg border"
                style={{
                  backgroundColor: 'var(--mode-card)',
                  borderColor: 'var(--mode-border)',
                  boxShadow: `0 10px 30px var(--mode-shadow)20`
                }}
              >
                <BookMarked 
                  size={64} 
                  className="mx-auto mb-4"
                  style={{ color: 'var(--mode-textSecondary)' }}
                />
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: 'var(--mode-text)' }}
                >
                  {t('extraCourses.messages.noCoursesFound')}
                </h3>
                <p 
                  className="mb-4"
                  style={{ color: 'var(--mode-textSecondary)' }}
                >
                  {t('extraCourses.messages.tryAdjustingFilters')}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="px-6 py-2 rounded-xl hover:shadow-lg transition-all text-white"
                  style={{
                    backgroundColor: 'var(--mode-primary)'
                  }}
                >
                  {t('extraCourses.messages.resetFilters')}
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* New Course Modal */}
        <AnimatePresence>
          {showNewCourseModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                style={{
                  backgroundColor: 'var(--mode-card)',
                  borderColor: 'var(--mode-border)',
                  boxShadow: `0 20px 40px var(--mode-shadow)40`
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('extraCourses.addCourse')}
                  </h2>
                  <button 
                    onClick={() => setShowNewCourseModal(false)}
                    className="hover:opacity-80 transition-colors"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); addCourse(); }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('extraCourses.form.title')} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="title"
                        value={newCourse.title}
                        onChange={handleChange}
                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-opacity-50 transition-colors"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                        placeholder={t('extraCourses.form.title')}
                      />
                    </div>
                    
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('extraCourses.form.monthlyPrice')} (DH) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        name="monthlyPrice"
                        value={newCourse.monthlyPrice}
                        onChange={handleChange}
                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-opacity-50 transition-colors"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                        placeholder={t('extraCourses.form.monthlyPrice')}
                      />
                    </div>
                    
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('extraCourses.form.capacity')} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        name="capacity"
                        value={newCourse.capacity}
                        onChange={handleChange}
                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-opacity-50 transition-colors"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                        placeholder={t('extraCourses.form.capacity')}
                      />
                    </div>
                    
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('extraCourses.form.schedule')} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="schedule"
                        value={newCourse.schedule}
                        onChange={handleChange}
                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-opacity-50 transition-colors"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                        placeholder={t('extraCourses.form.schedule')}
                      />
                    </div>
                    
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('extraCourses.form.instructor')} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="instructor"
                        value={newCourse.instructor}
                        onChange={handleChange}
                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-opacity-50 transition-colors"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                        placeholder={t('extraCourses.form.instructor')}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--mode-text)' }}
                    >
                      {t('extraCourses.form.description')}
                    </label>
                    <textarea 
                      name="description"
                      value={newCourse.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-opacity-50 transition-colors resize-none"
                      style={{
                        backgroundColor: 'var(--mode-surface)',
                        color: 'var(--mode-text)',
                        borderColor: 'var(--mode-border)',
                      }}
                      placeholder={t('extraCourses.form.description')}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowNewCourseModal(false)}
                      className="px-6 py-3 rounded-xl font-medium transition-all"
                      style={{
                        backgroundColor: 'var(--mode-border)',
                        color: 'var(--mode-text)'
                      }}
                    >
                      {t('extraCourses.form.cancel')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--mode-primary)'
                      }}
                    >
                      {isSubmitting ? t('extraCourses.messages.creating') : t('extraCourses.form.createCourse')}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Course Modal */}
        <AnimatePresence>
          {showEditForm && editingCourse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                style={{
                  backgroundColor: 'var(--mode-card)',
                  borderColor: 'var(--mode-border)',
                  boxShadow: `0 20px 40px var(--mode-shadow)40`
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('extraCourses.editCourse')}
                  </h2>
                  <button 
                    onClick={() => setShowEditForm(false)}
                    className="hover:opacity-80 transition-colors"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); updateCourse(); }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('extraCourses.form.title')} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="title"
                        value={editingCourse.title}
                        onChange={handleEditChange}
                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-opacity-50 transition-colors"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                      />
                    </div>
                    
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('extraCourses.form.monthlyPrice')} (DH) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        name="monthlyPrice"
                        value={editingCourse.monthlyPrice}
                        onChange={handleEditChange}
                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-opacity-50 transition-colors"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                      />
                    </div>
                    
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('extraCourses.form.capacity')} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        name="capacity"
                        value={editingCourse.capacity}
                        onChange={handleEditChange}
                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-opacity-50 transition-colors"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                      />
                    </div>
                    
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('extraCourses.form.schedule')} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="schedule"
                        value={editingCourse.schedule}
                        onChange={handleEditChange}
                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-opacity-50 transition-colors"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                      />
                    </div>
                    
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('extraCourses.form.instructor')} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="instructor"
                        value={editingCourse.instructor}
                        onChange={handleEditChange}
                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-opacity-50 transition-colors"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--mode-text)' }}
                    >
                      {t('extraCourses.form.description')}
                    </label>
                    <textarea 
                      name="description"
                      value={editingCourse.description}
                      onChange={handleEditChange}
                      rows={4}
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-opacity-50 transition-colors resize-none"
                      style={{
                        backgroundColor: 'var(--mode-surface)',
                        color: 'var(--mode-text)',
                        borderColor: 'var(--mode-border)',
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="px-6 py-3 rounded-xl font-medium transition-all"
                      style={{
                        backgroundColor: 'var(--mode-border)',
                        color: 'var(--mode-text)'
                      }}
                    >
                      {t('extraCourses.form.cancel')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--mode-primary)'
                      }}
                    >
                      {isSubmitting ? t('extraCourses.messages.modifying') : t('extraCourses.form.updateCourse')}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enrollment Modal */}
        <AnimatePresence>
          {showEnrollmentModal && selectedCourse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="rounded-2xl p-6 w-full max-w-lg shadow-2xl"
                style={{
                  backgroundColor: 'var(--mode-card)',
                  borderColor: 'var(--mode-border)',
                  boxShadow: `0 20px 40px var(--mode-shadow)40`
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('extraCourses.enrollment.title')}
                  </h2>
                  <button 
                    onClick={() => setShowEnrollmentModal(false)}
                    className="hover:opacity-80 transition-colors"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <h3 
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('extraCourses.enrollment.courseTitle', { title: selectedCourse.title })}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {selectedCourse.description}
                  </p>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); enrollStudent(); }} className="space-y-4">
                  <div className="relative">
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--mode-text)' }}
                    >
                      {t('extraCourses.enrollment.selectStudent')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative student-dropdown">
                      <Search 
                        size={20} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2"
                        style={{ color: 'var(--mode-textSecondary)' }}
                      />
                      <input
                        type="text"
                        placeholder={t('extraCourses.enrollment.selectStudent')}
                        value={studentSearchTerm}
                        onChange={handleStudentSearchChange}
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-opacity-50 transition-colors"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                      />
                      
                      {showStudentDropdown && (
                        <div 
                          className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-lg z-10 max-h-60 overflow-y-auto"
                          style={{
                            backgroundColor: 'var(--mode-card)',
                            borderColor: 'var(--mode-border)',
                            boxShadow: `0 10px 30px var(--mode-shadow)20`
                          }}
                        >
                          {getFilteredStudents().length > 0 ? (
                            getFilteredStudents().map((student) => (
                              <button
                                key={student.id}
                                type="button"
                                onClick={() => {
                                  setNewEnrollment({ ...newEnrollment, studentId: student.id });
                                  setStudentSearchTerm(`${student.firstName} ${student.lastName}`);
                                  setShowStudentDropdown(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:opacity-80 transition-colors border-b last:border-b-0"
                                style={{
                                  backgroundColor: 'var(--mode-surface)',
                                  color: 'var(--mode-text)',
                                  borderColor: 'var(--mode-border)'
                                }}
                              >
                                <div className="font-medium">
                                  {student.firstName} {student.lastName}
                                </div>
                                {student.firstNameArabic && student.lastNameArabic && (
                                  <div 
                                    className="text-sm"
                                    style={{ color: 'var(--mode-textSecondary)' }}
                                  >
                                    {student.firstNameArabic} {student.lastNameArabic}
                                  </div>
                                )}
                              </button>
                            ))
                          ) : (
                            <div 
                              className="px-4 py-3 text-center"
                              style={{ color: 'var(--mode-textSecondary)' }}
                            >
                              {t('extraCourses.enrollment.noStudentFound')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--mode-text)' }}
                    >
                      {t('extraCourses.enrollment.notes')}
                    </label>
                    <textarea 
                      name="notes"
                      value={newEnrollment.notes}
                      onChange={handleEnrollmentChange}
                      rows={3}
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-opacity-50 transition-colors resize-none"
                      style={{
                        backgroundColor: 'var(--mode-surface)',
                        color: 'var(--mode-text)',
                        borderColor: 'var(--mode-border)',
                      }}
                      placeholder={t('extraCourses.enrollment.notes')}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowEnrollmentModal(false)}
                      className="px-6 py-3 rounded-xl font-medium transition-all"
                      style={{
                        backgroundColor: 'var(--mode-border)',
                        color: 'var(--mode-text)'
                      }}
                    >
                      {t('extraCourses.enrollment.cancel')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isSubmitting || !newEnrollment.studentId}
                      className="px-6 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--mode-primary)'
                      }}
                    >
                      {isSubmitting ? t('extraCourses.messages.enrolling') : t('extraCourses.enrollment.enroll')}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enrolled Students Modal */}
        <AnimatePresence>
          {showEnrolledStudentsModal && selectedCourse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
                style={{
                  backgroundColor: 'var(--mode-card)',
                  borderColor: 'var(--mode-border)',
                  boxShadow: `0 20px 40px var(--mode-shadow)40`
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('extraCourses.enrolledStudents')}
                  </h2>
                  <button 
                    onClick={() => setShowEnrolledStudentsModal(false)}
                    className="hover:opacity-80 transition-colors"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <h3 
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('extraCourses.enrolledStudents.courseTitle', { title: selectedCourse.title })}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {selectedCourse.description}
                  </p>
                </div>
                
                <div 
                  className="rounded-xl border overflow-hidden"
                  style={{
                    backgroundColor: 'var(--mode-surface)',
                    borderColor: 'var(--mode-border)'
                  }}
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y" style={{ borderColor: 'var(--mode-border)' }}>
                      <thead style={{ backgroundColor: 'var(--mode-card)' }}>
                        <tr>
                          <th 
                            className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'var(--mode-textSecondary)' }}
                          >
                            {t('extraCourses.table.student')}
                          </th>
                          <th 
                            className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'var(--mode-textSecondary)' }}
                          >
                            {t('extraCourses.table.enrollmentDate')}
                          </th>
                          <th 
                            className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'var(--mode-textSecondary)' }}
                          >
                            {t('extraCourses.table.status')}
                          </th>
                          <th 
                            className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'var(--mode-textSecondary)' }}
                          >
                            {t('extraCourses.table.notes')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: 'var(--mode-border)' }}>
                        {getEnrollmentsForCourse(selectedCourse.id).map((enrollment) => (
                          <tr 
                            key={enrollment.id}
                            className="hover:opacity-80 transition-colors"
                            style={{ backgroundColor: 'var(--mode-card)' }}
                          >
                            <td className="px-6 py-4">
                              <div 
                                className="text-sm font-medium"
                                style={{ color: 'var(--mode-text)' }}
                              >
                                {enrollment.studentName}
                              </div>
                            </td>
                            <td 
                              className="px-6 py-4 whitespace-nowrap text-sm"
                              style={{ color: 'var(--mode-text)' }}
                            >
                              {new Date(enrollment.enrollmentDate).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span 
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  enrollment.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {enrollment.status === 'ACTIVE' ? t('extraCourses.messages.active') : t('extraCourses.messages.inactive')}
                              </span>
                            </td>
                            <td 
                              className="px-6 py-4 text-sm max-w-xs truncate"
                              style={{ color: 'var(--mode-textSecondary)' }}
                            >
                              {enrollment.notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {getEnrollmentsForCourse(selectedCourse.id).length === 0 && (
                    <div className="text-center py-8">
                      <Users 
                        size={48} 
                        className="mx-auto mb-4"
                        style={{ color: 'var(--mode-textSecondary)' }}
                      />
                      <p 
                        className="text-lg font-medium"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('extraCourses.enrolledStudents.noStudentsEnrolled')}
                      </p>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--mode-textSecondary)' }}
                      >
                        {t('extraCourses.enrolledStudents.startEnrolling')}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExtraCoursesPage; 