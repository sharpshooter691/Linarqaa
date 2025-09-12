import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useMode } from '@/contexts/ModeContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, Plus, Save, CalendarDays, History, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  firstNameArabic?: string;
  lastNameArabic?: string;
  level: string;
  classroom?: string;
  photoUrl?: string;
  studentType: 'KINDERGARTEN' | 'EXTRA_COURSE';
}

interface AttendanceRecord {
  id: string;
  student: Student;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  recordedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface Classroom {
  id: string;
  name: string;
  nameArabic?: string;
  level: string;
  studentType: 'KINDERGARTEN' | 'EXTRA_COURSE';
  maxCapacity: number;
  currentEnrollment: number;
  description?: string;
  isActive: boolean;
}

const AttendancePage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { mode } = useMode();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistoryRecords = async () => {
    try {
      setHistoryLoading(true);
      const studentType = mode === 'kindergarten' ? 'kindergarten' : 'extra_course';
      
      console.log('Fetching history records for type:', studentType);
      
      const response = await api.get(`/attendance?type=${studentType}`);
      console.log('History response:', response.data);
      
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const filteredRecords = response.data.filter((record: AttendanceRecord) => {
        const recordDate = new Date(record.attendanceDate);
        return recordDate >= thirtyDaysAgo;
      });
      
      console.log('Filtered records (last 30 days):', filteredRecords);
      setHistoryRecords(filteredRecords);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: t('common.error'),
        description: t('attendance.loadingError'),
        variant: "destructive",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistoryRecords();
    }
  }, [activeTab, mode]);

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedClassroom, mode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const studentType = mode === 'kindergarten' ? 'kindergarten' : 'extra_course';
      const studentsResponse = await api.get(`/students?type=${studentType}`);
      setStudents(studentsResponse.data);
      
      const classroomsResponse = await api.get(`/classrooms?type=${studentType}`);
      setClassrooms(classroomsResponse.data);
      
      const attendanceResponse = await api.get(`/attendance?date=${selectedDate}&type=${studentType}`);
      setAttendanceRecords(attendanceResponse.data);
      
      const initialData: Record<string, string> = {};
      studentsResponse.data.forEach((student: Student) => {
        const existingRecord = attendanceResponse.data.find((record: AttendanceRecord) => record.student.id === student.id);
        initialData[student.id] = existingRecord ? existingRecord.status : 'PRESENT';
      });
      setAttendanceData(initialData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('common.error'),
        description: t('attendance.loadingError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      const records = Object.entries(attendanceData).map(([studentId, status]) => ({
        studentId: studentId,
        attendanceDate: selectedDate,
        status: status,
        recordedBy: user?.fullName || 'Unknown',
        checkInTime: status === 'PRESENT' || status === 'LATE' ? new Date().toISOString() : null,
        notes: ''
      }));
      
      console.log('Sending attendance records:', records);
      
      const response = await api.post('/attendance/bulk', records);
      console.log('Response from server:', response.data);
      
      toast({
        title: t('common.success'),
        description: t('attendance.saveSuccess'),
      });
      
      fetchData();
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: t('common.error'),
        description: t('attendance.saveError'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'ABSENT':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'LATE':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'EXCUSED':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'SICK':
        return <AlertCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <User className="h-5 w-5" style={{ color: 'var(--mode-textSecondary)' }} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return t('attendance.status.present');
      case 'ABSENT':
        return t('attendance.status.absent');
      case 'LATE':
        return t('attendance.status.late');
      case 'EXCUSED':
        return t('attendance.status.excused');
      case 'SICK':
        return t('attendance.status.sick');
      default:
        return t('attendance.status.undefined');
    }
  };

  const getLevelLabel = (level: string) => {
    if (mode === 'kindergarten') {
      switch (level) {
        case 'PETITE': return t('attendance.levels.petite');
        case 'MOYENNE': return t('attendance.levels.moyenne');
        case 'GRANDE': return t('attendance.levels.grande');
        default: return level;
      }
    } else {
      switch (level) {
        case 'CP1': return t('attendance.levels.cp1');
        case 'CP2': return t('attendance.levels.cp2');
        case 'CP3': return t('attendance.levels.cp3');
        case 'CP4': return t('attendance.levels.cp4');
        case 'CP5': return t('attendance.levels.cp5');
        case 'CP6': return t('attendance.levels.cp6');
        case 'AC1': return t('attendance.levels.ac1');
        case 'AC2': return t('attendance.levels.ac2');
        case 'AC3': return t('attendance.levels.ac3');
        case 'TRONC_COMMUN': return t('attendance.levels.troncCommun');
        case 'BAC1': return t('attendance.levels.bac1');
        case 'BAC2': return t('attendance.levels.bac2');
        default: return level;
      }
    }
  };

  const getDisplayName = (student: Student) => {
    const isArabic = i18n.language === 'ar';
    
    if (isArabic) {
      const firstName = student.firstNameArabic || student.firstName;
      const lastName = student.lastNameArabic || student.lastName;
      return `${firstName} ${lastName}`;
    } else {
      return `${student.firstName} ${student.lastName}`;
    }
  };

  const getAttendanceStats = (records: AttendanceRecord[]) => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      sick: 0,
      total: records.length
    };
    
    records.forEach(record => {
      switch (record.status) {
        case 'PRESENT':
          stats.present++;
          break;
        case 'ABSENT':
          stats.absent++;
          break;
        case 'LATE':
          stats.late++;
          break;
        case 'EXCUSED':
          stats.excused++;
          break;
        case 'SICK':
          stats.sick++;
          break;
      }
    });
    
    return stats;
  };

  const groupRecordsByDate = (records: AttendanceRecord[]) => {
    const grouped: Record<string, AttendanceRecord[]> = {};
    
    records.forEach(record => {
      const date = record.attendanceDate;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });
    
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .reduce((acc, [date, records]) => {
        acc[date] = records;
        return acc;
      }, {} as Record<string, AttendanceRecord[]>);
  };

  const filteredStudents = selectedClassroom 
    ? students.filter(student => student.classroom === selectedClassroom)
    : students;

  const isRTL = i18n.language === 'ar';

  const formatDate = (date: Date) => {
    const isArabic = i18n.language === 'ar';
    
    if (isArabic) {
      const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      
      const dayName = days[date.getDay()];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${dayName}، ${day} ${month} ${year}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold' style={{ color: 'var(--mode-text)' }}>
            {mode === 'kindergarten' ? t('attendance.titleKindergarten') : t('attendance.titleExtra')}
          </h1>
          <p style={{ color: 'var(--mode-textSecondary)' }}>
            {mode === 'kindergarten' 
              ? t('attendance.subtitleKindergarten') 
              : t('attendance.subtitleExtra')
            }
          </p>
        </div>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 mx-auto' style={{ borderColor: 'var(--mode-primary)' }}></div>
            <p className='mt-2' style={{ color: 'var(--mode-textSecondary)' }}>{t('attendance.loading')}</p>
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
                  {mode === 'kindergarten' ? t('attendance.titleKindergarten') : t('attendance.titleExtra')} ✨
                </h1>
                <p 
                  className="text-lg"
                  style={{ color: 'var(--mode-textSecondary)' }}
                >
                  {mode === 'kindergarten' 
                    ? t('attendance.subtitleKindergarten') 
                    : t('attendance.subtitleExtra')
                  }
                </p>
                <div className="flex items-center mt-2 text-sm" style={{ color: 'var(--mode-textSecondary)' }}>
                  <Calendar size={16} className="mr-1" />
                  {t('common.managedBy')} {user?.fullName}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 shadow-lg border"
          style={{
            backgroundColor: 'var(--mode-card)',
            borderColor: 'var(--mode-border)',
            boxShadow: `0 10px 30px var(--mode-shadow)20`
          }}
        >
          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('today')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'today' 
                  ? 'text-white' 
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'today' ? 'var(--mode-primary)' : 'transparent',
                color: activeTab === 'today' ? 'white' : 'var(--mode-textSecondary)'
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{t('attendance.tabs.today')}</span>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'history' 
                  ? 'text-white' 
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'history' ? 'var(--mode-primary)' : 'transparent',
                color: activeTab === 'history' ? 'white' : 'var(--mode-textSecondary)'
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <History className="h-5 w-5" />
                <span>{t('attendance.tabs.history')}</span>
              </div>
            </motion.button>
          </div>

          {/* Tab Content */}
          {activeTab === 'today' ? (
            <>
              {/* Controls */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" style={{ color: 'var(--mode-textSecondary)' }} />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-50 transition-colors"
                    style={{ 
                      backgroundColor: 'var(--mode-surface)', 
                      color: 'var(--mode-text)', 
                      borderColor: 'var(--mode-border)'
                    }}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" style={{ color: 'var(--mode-textSecondary)' }} />
                  <select
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                    className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-50 transition-colors"
                    style={{ 
                      backgroundColor: 'var(--mode-surface)', 
                      color: 'var(--mode-text)', 
                      borderColor: 'var(--mode-border)'
                    }}
                  >
                    <option value="">{t('attendance.controls.allClassrooms')}</option>
                    {classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.name}>
                        {classroom.name} ({classroom.currentEnrollment}/{classroom.maxCapacity})
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={saveAttendance}
                  disabled={saving}
                  className={`flex items-center px-4 py-2 text-white rounded-md hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity ${
                    isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'
                  }`}
                  style={{ backgroundColor: 'var(--mode-primary)' }}
                >
                  {saving ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      <span>{t('attendance.controls.saving')}</span>
                    </>
                  ) : (
                    <>
                      <Save className='h-4 w-4' />
                      <span>{t('attendance.controls.saveAttendance')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Attendance Table */}
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y' style={{ borderColor: 'var(--mode-border)' }}>
                  <thead style={{ backgroundColor: 'var(--mode-surface)' }}>
                    <tr>
                      <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>
                        {t('attendance.table.student')}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>
                        {t('attendance.table.level')}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>
                        {t('attendance.table.classroom')}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>
                        {t('attendance.table.status')}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>
                        {t('attendance.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y' style={{ 
                    backgroundColor: 'var(--mode-card)',
                    borderColor: 'var(--mode-border)'
                  }}>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className='hover:opacity-80 transition-opacity' style={{ backgroundColor: 'var(--mode-surface)' }}>
                        <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                            <div className='relative'>
                              <div className='w-10 h-10 rounded-full overflow-hidden border-2' style={{ borderColor: 'var(--mode-border)' }}>
                                {student.photoUrl ? (
                                  <img
                                    src={student.photoUrl}
                                    alt={getDisplayName(student)}
                                    className='w-full h-full object-cover'
                                  />
                                ) : (
                                  <div className='w-full h-full flex items-center justify-center' style={{ backgroundColor: 'var(--mode-surface)' }}>
                                    <User className='h-5 w-5' style={{ color: 'var(--mode-textSecondary)' }} />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className={isRTL ? 'text-right' : 'text-left'}>
                              <div className='text-sm font-medium' style={{ color: 'var(--mode-text)' }}>
                                {getDisplayName(student)}
                              </div>
                              {student.firstNameArabic && student.lastNameArabic && (
                                <div className='text-sm' style={{ color: 'var(--mode-textSecondary)' }}>
                                  {student.firstNameArabic} {student.lastNameArabic}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium' style={{ 
                            backgroundColor: 'var(--mode-accent)', 
                            color: 'var(--mode-text)' 
                          }}>
                            {getLevelLabel(student.level)}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className='text-sm' style={{ color: 'var(--mode-text)' }}>
                            {student.classroom || '-'}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className='flex items-center space-x-2'>
                            {getStatusIcon(attendanceData[student.id] || 'PRESENT')}
                            <span className='text-sm' style={{ color: 'var(--mode-text)' }}>
                              {getStatusLabel(attendanceData[student.id] || 'PRESENT')}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                          <select
                            value={attendanceData[student.id] || 'PRESENT'}
                            onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                            className='border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2'
                            style={{ 
                              backgroundColor: 'var(--mode-surface)', 
                              color: 'var(--mode-text)', 
                              borderColor: 'var(--mode-border)'
                            }}
                          >
                            <option value='PRESENT'>{t('attendance.status.present')}</option>
                            <option value='ABSENT'>{t('attendance.status.absent')}</option>
                            <option value='LATE'>{t('attendance.status.late')}</option>
                            <option value='EXCUSED'>{t('attendance.status.excused')}</option>
                            <option value='SICK'>{t('attendance.status.sick')}</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredStudents.length === 0 && (
                <div className='text-center py-8' style={{ color: 'var(--mode-textSecondary)' }}>
                  {mode === 'kindergarten' 
                    ? t('students.noStudentsFoundKindergarten') 
                    : t('students.noStudentsFoundExtra')
                  }
                </div>
              )}
            </>
          ) : (
            /* History Tab */
            <div>
              <div className='mb-6'>
                <h3 className='text-lg font-medium mb-4' style={{ color: 'var(--mode-text)' }}>
                  {t('attendance.history.title')}
                </h3>
                <p className='text-sm' style={{ color: 'var(--mode-textSecondary)' }}>
                  {t('attendance.history.last30Days')}
                </p>
              </div>

              {historyLoading ? (
                <div className='flex items-center justify-center h-32'>
                  <div className='text-center'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 mx-auto' style={{ borderColor: 'var(--mode-primary)' }}></div>
                    <p className='mt-2 text-sm' style={{ color: 'var(--mode-textSecondary)' }}>
                      {t('attendance.history.loading')}
                    </p>
                  </div>
                </div>
              ) : historyRecords.length === 0 ? (
                <div className='text-center py-8' style={{ color: 'var(--mode-textSecondary)' }}>
                  {t('attendance.history.noRecords')}
                </div>
              ) : (
                <div className='space-y-6'>
                  {Object.entries(groupRecordsByDate(historyRecords)).map(([date, records]) => {
                    const stats = getAttendanceStats(records);
                    const formattedDate = formatDate(new Date(date));

                    return (
                      <div key={date} className='border rounded-lg p-4' style={{ 
                        backgroundColor: 'var(--mode-surface)', 
                        borderColor: 'var(--mode-border)' 
                      }}>
                        <div className='flex items-center justify-between mb-4'>
                          <h4 className='font-medium' style={{ color: 'var(--mode-text)' }}>
                            {formattedDate}
                          </h4>
                          <div className='flex items-center space-x-4 text-sm'>
                            <span className='text-green-600'>{stats.present} {t('attendance.history.stats.present')}</span>
                            <span className='text-red-600'>{stats.absent} {t('attendance.history.stats.absent')}</span>
                            <span className='text-yellow-600'>{stats.late} {t('attendance.history.stats.late')}</span>
                            <span className='text-blue-600'>{stats.excused} {t('attendance.history.stats.excused')}</span>
                            <span className='text-purple-600'>{stats.sick} {t('attendance.history.stats.sick')}</span>
                          </div>
                        </div>
                        
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                          {records.map((record) => (
                            <div key={record.id} className='flex items-center justify-between p-3 rounded border' style={{ 
                              backgroundColor: 'var(--mode-card)', 
                              borderColor: 'var(--mode-border)' 
                            }}>
                              <div className='flex items-center space-x-3'>
                                <div className='w-8 h-8 rounded-full overflow-hidden border' style={{ borderColor: 'var(--mode-border)' }}>
                                  {record.student.photoUrl ? (
                                    <img
                                      src={record.student.photoUrl}
                                      alt={getDisplayName(record.student)}
                                      className='w-full h-full object-cover'
                                    />
                                  ) : (
                                    <div className='w-full h-full flex items-center justify-center' style={{ backgroundColor: 'var(--mode-surface)' }}>
                                      <User className='h-4 w-4' style={{ color: 'var(--mode-textSecondary)' }} />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className='text-sm font-medium' style={{ color: 'var(--mode-text)' }}>
                                    {getDisplayName(record.student)}
                                  </div>
                                  <div className='text-xs' style={{ color: 'var(--mode-textSecondary)' }}>
                                    {getLevelLabel(record.student.level)}
                                  </div>
                                </div>
                              </div>
                              <div className='flex items-center space-x-2'>
                                {getStatusIcon(record.status)}
                                <span className='text-xs' style={{ color: 'var(--mode-textSecondary)' }}>
                                  {getStatusLabel(record.status)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AttendancePage;