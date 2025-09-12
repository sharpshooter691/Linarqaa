import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useMode } from '@/contexts/ModeContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import RequirementModal from '@/components/belongings/RequirementModal';
import { 
  BookOpen, 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Printer, 
  Download,
  ClipboardList,
  Users,
  Settings,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface BelongingRequirement {
  id: string;
  name: string;
  nameArabic?: string;
  category: string;
  isRequired: boolean;
  quantityNeeded: number;
  description?: string;
  notes?: string;
  level?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

interface StudentBelonging {
  id: string;
  name: string;
  nameArabic?: string;
  category: string;
  quantity: number;
  status: string;
  checkInDate?: string;
  checkOutDate?: string;
  checkedInBy?: string;
  checkedOutBy?: string;
  notes?: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    firstNameArabic?: string;
    lastNameArabic?: string;
    level: string;
    photoUrl?: string;
  };
}

const BelongingsPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { mode } = useMode();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'requirements' | 'tracking' | 'print'>('requirements');
  const [requirements, setRequirements] = useState<BelongingRequirement[]>([]);
  const [studentBelongings, setStudentBelongings] = useState<StudentBelonging[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<BelongingRequirement | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'requirements') {
        const response = await api.get('/belongings/requirements');
        setRequirements(response.data);
      } else if (activeTab === 'tracking') {
        const studentsResponse = await api.get('/students');
        const allBelongings: StudentBelonging[] = [];
        
        for (const student of studentsResponse.data) {
          const belongingsResponse = await api.get(`/belongings/student/${student.id}`);
          allBelongings.push(...belongingsResponse.data);
        }
        
        setStudentBelongings(allBelongings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('common.error'),
        description: t('belongings.loadingError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequirement = async (requirement: Omit<BelongingRequirement, 'id' | 'isActive' | 'createdAt'>) => {
    try {
      const newRequirement = {
        ...requirement,
        quantityNeeded: requirement.quantityNeeded || 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: user?.fullName || 'Unknown'
      };
      
      await api.post('/belongings/requirements', newRequirement);
      
      toast({
        title: t('common.success'),
        description: t('belongings.requirements.createSuccess'),
      });
      
      setShowRequirementModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating requirement:', error);
      toast({
        title: t('common.error'),
        description: t('belongings.requirements.createError'),
        variant: "destructive",
      });
    }
  };

  const handleUpdateRequirement = async (id: string, requirement: Partial<BelongingRequirement>) => {
    try {
      await api.put(`/belongings/requirements/${id}`, requirement);
      
      toast({
        title: t('common.success'),
        description: t('belongings.requirements.updateSuccess'),
      });
      
      setEditingRequirement(null);
      fetchData();
    } catch (error) {
      console.error('Error updating requirement:', error);
      toast({
        title: t('common.error'),
        description: t('belongings.requirements.updateError'),
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequirement = async (id: string) => {
    try {
      await api.delete(`/belongings/requirements/${id}`);
      
      toast({
        title: t('common.success'),
        description: t('belongings.requirements.deleteSuccess'),
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting requirement:', error);
      toast({
        title: t('common.error'),
        description: t('belongings.requirements.deleteError'),
        variant: "destructive",
      });
    }
  };

  const handleCheckOutBelonging = async (belongingId: string) => {
    try {
      await api.patch(`/belongings/${belongingId}/check-out`);
      
      toast({
        title: t('common.success'),
        description: t('belongings.tracking.checkOutSuccess'),
      });
      
      fetchData();
    } catch (error) {
      console.error('Error checking out belonging:', error);
      toast({
        title: t('common.error'),
        description: t('belongings.tracking.checkOutError'),
        variant: "destructive",
      });
    }
  };

  const handleUpdateBelongingStatus = async (belongingId: string, status: string, notes?: string) => {
    try {
      await api.patch(`/belongings/${belongingId}/status`, { status, notes });
      
      toast({
        title: t('common.success'),
        description: t('belongings.tracking.updateStatusSuccess'),
      });
      
      fetchData();
    } catch (error) {
      console.error('Error updating belonging status:', error);
      toast({
        title: t('common.error'),
        description: t('belongings.tracking.updateStatusError'),
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (selectedRequirements.length === 0) {
      toast({
        title: t('common.error'),
        description: t('belongings.print.noItemsSelected'),
        variant: "destructive",
      });
      return;
    }

    const selectedReqs = requirements.filter(req => selectedRequirements.includes(req.id));
    const printData = {
      requirements: selectedReqs,
      mode: 'kindergarten',
      level: selectedLevel,
      generatedAt: new Date().toISOString()
    };

    navigate('/belongings/print', { state: { printData } });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_STAFF':
        return <Package className="h-5 w-5" style={{ color: 'var(--mode-primary)' }} />;
      case 'RETURNED':
        return <CheckCircle className="h-5 w-5" style={{ color: 'var(--mode-accent)' }} />;
      case 'LOST':
        return <XCircle className="h-5 w-5" style={{ color: '#ef4444' }} />;
      case 'DAMAGED':
        return <AlertCircle className="h-5 w-5" style={{ color: '#f59e0b' }} />;
      case 'EXPIRED':
        return <AlertCircle className="h-5 w-5" style={{ color: 'var(--mode-textSecondary)' }} />;
      default:
        return <Package className="h-5 w-5" style={{ color: 'var(--mode-textSecondary)' }} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_STAFF':
        return t('belongings.tracking.status.inStaff');
      case 'RETURNED':
        return t('belongings.tracking.status.returned');
      case 'LOST':
        return t('belongings.tracking.status.lost');
      case 'DAMAGED':
        return t('belongings.tracking.status.damaged');
      case 'EXPIRED':
        return t('belongings.tracking.status.expired');
      default:
        return t('belongings.tracking.status.unknown');
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'PETITE': return t('belongings.print.levels.petite');
      case 'MOYENNE': return t('belongings.print.levels.moyenne');
      case 'GRANDE': return t('belongings.print.levels.grande');
      default: return level;
    }
  };

  const getDisplayName = (student: { firstName: string; lastName: string; firstNameArabic?: string; lastNameArabic?: string }) => {
    const isArabic = i18n.language === 'ar';
    
    if (isArabic) {
      const firstName = student.firstNameArabic || student.firstName;
      const lastName = student.lastNameArabic || student.lastName;
      return `${firstName} ${lastName}`;
    } else {
      return `${student.firstName} ${student.lastName}`;
    }
  };

  const getBelongingName = (belonging: { name: string; nameArabic?: string }) => {
    const isArabic = i18n.language === 'ar';
    
    if (isArabic) {
      return belonging.nameArabic || belonging.name;
    } else {
      return belonging.name;
    }
  };

  const getCategoryLabel = (category: string) => {
    // Use the translation system properly
    return t(`belongings.requirements.categories.${category}`) || category;
  };

  const groupRequirementsByCategory = (reqs: BelongingRequirement[]) => {
    return reqs.reduce((groups, req) => {
      const category = req.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(req);
      return groups;
    }, {} as Record<string, BelongingRequirement[]>);
  };

  const filteredRequirements = selectedLevel 
    ? requirements.filter(req => !req.level || req.level === selectedLevel)
    : requirements;

  const isRTL = i18n.language === 'ar';

  if (loading) {
    return (
      <div className='space-y-6' style={{ backgroundColor: 'var(--mode-background)' }}>
        <div>
          <h1 className='text-2xl font-bold' style={{ color: 'var(--mode-text)' }}>
            {t('belongings.title')}
          </h1>
          <p style={{ color: 'var(--mode-textSecondary)' }}>
            {t('belongings.subtitle')}
          </p>
        </div>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 mx-auto' style={{ borderColor: 'var(--mode-primary)' }}></div>
            <p className='mt-2' style={{ color: 'var(--mode-textSecondary)' }}>{t('belongings.loading')}</p>
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
                  {t('belongings.title')} ✨
                </h1>
                <p 
                  className="text-lg"
                  style={{ color: 'var(--mode-textSecondary)' }}
                >
                  {t('belongings.subtitle')}
                </p>
                <div className="flex items-center mt-2 text-sm" style={{ color: 'var(--mode-textSecondary)' }}>
                  <Package size={16} className="mr-1" />
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
              onClick={() => setActiveTab('requirements')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'requirements' 
                  ? 'text-white' 
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'requirements' ? 'var(--mode-primary)' : 'transparent',
                color: activeTab === 'requirements' ? 'white' : 'var(--mode-textSecondary)'
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <ClipboardList className="h-5 w-5" />
                <span>{t('belongings.tabs.requirements')}</span>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('tracking')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'tracking' 
                  ? 'text-white' 
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'tracking' ? 'var(--mode-primary)' : 'transparent',
                color: activeTab === 'tracking' ? 'white' : 'var(--mode-textSecondary)'
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Package className="h-5 w-5" />
                <span>{t('belongings.tabs.tracking')}</span>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('print')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'print' 
                  ? 'text-white' 
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'print' ? 'var(--mode-primary)' : 'transparent',
                color: activeTab === 'print' ? 'white' : 'var(--mode-textSecondary)'
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Printer className="h-5 w-5" />
                <span>{t('belongings.tabs.print')}</span>
              </div>
            </motion.button>
          </div>

          {/* Tab Content */}
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              {/* Requirements Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ color: 'var(--mode-text)' }}
                  >
                    {t('belongings.requirements.title')}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--mode-textSecondary)' }}
                  >
                    {t('belongings.requirements.subtitle')}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRequirementModal(true)}
                  className="flex items-center px-4 py-2 text-white rounded-xl hover:opacity-80 transition-opacity space-x-2"
                  style={{ backgroundColor: 'var(--mode-primary)' }}
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('belongings.requirements.addRequirement')}</span>
                </motion.button>
              </div>

              {/* Requirements List */}
              <div className='space-y-4'>
                {Object.entries(groupRequirementsByCategory(filteredRequirements)).map(([category, reqs]) => (
                  <div key={category} className='border rounded-lg p-4' style={{ 
                    backgroundColor: 'var(--mode-surface)', 
                    borderColor: 'var(--mode-border)' 
                  }}>
                    <h4 className='font-medium mb-3' style={{ color: 'var(--mode-text)' }}>
                      {getCategoryLabel(category)}
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                      {reqs.map((req) => (
                        <div key={req.id} className='flex items-center justify-between p-3 rounded border' style={{ 
                          backgroundColor: 'var(--mode-card)', 
                          borderColor: 'var(--mode-border)' 
                        }}>
                          <div className='flex-1'>
                            <div className='font-medium text-sm' style={{ color: 'var(--mode-text)' }}>
                              {getBelongingName(req)}
                            </div>
                            <div className='text-xs' style={{ color: 'var(--mode-textSecondary)' }}>
                              {t('belongings.requirements.table.quantity')}: {req.quantityNeeded}
                              {req.level && ` • ${getLevelLabel(req.level)}`}
                            </div>
                          </div>
                          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                            {req.isRequired && (
                              <span className='text-xs px-2 py-1 rounded' style={{ 
                                backgroundColor: 'var(--mode-accent)', 
                                color: 'white' 
                              }}>
                                {t('belongings.requirements.table.required')}
                              </span>
                            )}
                            <button
                              onClick={() => setEditingRequirement(req)}
                              className='p-1 text-blue-600 hover:opacity-70 transition-opacity'
                              title={t('belongings.requirements.editRequirement')}
                            >
                              <Edit className='h-4 w-4' />
                            </button>
                            <button
                              onClick={() => handleDeleteRequirement(req.id)}
                              className='p-1 text-red-600 hover:opacity-70 transition-opacity'
                              title={t('belongings.requirements.deleteRequirement')}
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className='space-y-6'>
              {/* Tracking Header */}
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className='text-lg font-semibold' style={{ color: 'var(--mode-text)' }}>{t('belongings.tracking.title')}</h3>
                <p className='text-sm' style={{ color: 'var(--mode-textSecondary)' }}>{t('belongings.tracking.subtitle')}</p>
              </div>

              {/* Tracking Table */}
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y' style={{ borderColor: 'var(--mode-border)' }}>
                  <thead style={{ backgroundColor: 'var(--mode-surface)' }}>
                    <tr>
                      <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>
                        {t('belongings.tracking.table.student')}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>
                        {t('belongings.tracking.table.item')}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>
                        {t('belongings.tracking.table.category')}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>
                        {t('belongings.tracking.table.quantity')}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>
                        {t('belongings.tracking.table.status')}
                      </th>
                      <th className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: 'var(--mode-textSecondary)' }}>
                        {t('belongings.tracking.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y' style={{ 
                    backgroundColor: 'var(--mode-card)',
                    borderColor: 'var(--mode-border)'
                  }}>
                    {studentBelongings.map((belonging) => (
                      <tr key={belonging.id} className='hover:opacity-80 transition-opacity' style={{ backgroundColor: 'var(--mode-surface)' }}>
                        <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                            <div className='relative'>
                              <div className='w-10 h-10 rounded-full overflow-hidden border-2' style={{ borderColor: 'var(--mode-border)' }}>
                                {belonging.student.photoUrl ? (
                                  <img
                                    src={belonging.student.photoUrl}
                                    alt={getDisplayName(belonging.student)}
                                    className='w-full h-full object-cover'
                                  />
                                ) : (
                                  <div className='w-full h-full flex items-center justify-center' style={{ backgroundColor: 'var(--mode-surface)' }}>
                                    <Users className='h-5 w-5' style={{ color: 'var(--mode-textSecondary)' }} />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className={isRTL ? 'text-right' : 'text-left'}>
                              <div className='text-sm font-medium' style={{ color: 'var(--mode-text)' }}>
                                {getDisplayName(belonging.student)}
                              </div>
                              <div className='text-sm' style={{ color: 'var(--mode-textSecondary)' }}>
                                {getLevelLabel(belonging.student.level)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className='text-sm font-medium' style={{ color: 'var(--mode-text)' }}>
                            {getBelongingName(belonging)}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium' style={{ 
                            backgroundColor: 'var(--mode-accent)', 
                            color: 'var(--mode-text)' 
                          }}>
                            {getCategoryLabel(belonging.category)}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className='text-sm' style={{ color: 'var(--mode-text)' }}>
                            {belonging.quantity}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                            {getStatusIcon(belonging.status)}
                            <span className='text-sm' style={{ color: 'var(--mode-text)' }}>
                              {getStatusLabel(belonging.status)}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                            {belonging.status === 'IN_STAFF' && (
                              <button
                                onClick={() => handleCheckOutBelonging(belonging.id)}
                                className='p-1 text-green-600 hover:opacity-70 transition-opacity'
                                title={t('belongings.tracking.checkOutSuccess')}
                              >
                                <CheckCircle className='h-4 w-4' />
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateBelongingStatus(belonging.id, 'LOST')}
                              className='p-1 text-red-600 hover:opacity-70 transition-opacity'
                              title={t('belongings.tracking.status.lost')}
                            >
                              <XCircle className='h-4 w-4' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {studentBelongings.length === 0 && (
                <div className='text-center py-8' style={{ color: 'var(--mode-textSecondary)' }}>
                  {t('students.noStudentsFoundKindergarten')}
                </div>
              )}
            </div>
          )}

          {activeTab === 'print' && (
            <div className='space-y-6'>
              {/* Print Header */}
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className='text-lg font-semibold' style={{ color: 'var(--mode-text)' }}>{t('belongings.print.title')}</h3>
                <p className='text-sm' style={{ color: 'var(--mode-textSecondary)' }}>{t('belongings.print.subtitle')}</p>
              </div>

              {/* Print Controls */}
              <div className={`flex flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                  <label className='text-sm font-medium' style={{ color: 'var(--mode-text)' }}>
                    {t('belongings.print.selectLevel')}:
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className='border rounded px-3 py-2 focus:outline-none focus:ring-2'
                    style={{ 
                      backgroundColor: 'var(--mode-surface)', 
                      color: 'var(--mode-text)', 
                      borderColor: 'var(--mode-border)'
                    }}
                  >
                    <option value=''>{t('belongings.print.levels.all')}</option>
                    <option value='PETITE'>{t('belongings.print.levels.petite')}</option>
                    <option value='MOYENNE'>{t('belongings.print.levels.moyenne')}</option>
                    <option value='GRANDE'>{t('belongings.print.levels.grande')}</option>
                  </select>
                </div>
                
                <button
                  onClick={handlePrint}
                  className={`flex items-center px-4 py-2 text-white rounded-md hover:opacity-80 transition-opacity ${
                    isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'
                  }`}
                  style={{ backgroundColor: 'var(--mode-primary)' }}
                >
                  <Printer className='h-4 w-4' />
                  <span>{t('belongings.print.printList')}</span>
                </button>
              </div>

              {/* Requirements Selection */}
              <div className='space-y-4'>
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h4 className='font-medium' style={{ color: 'var(--mode-text)' }}>{t('belongings.print.selectItems')}</h4>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <button
                      onClick={() => setSelectedRequirements(filteredRequirements.map(req => req.id))}
                      className='text-sm px-3 py-1 border rounded hover:opacity-70 transition-opacity'
                      style={{ 
                        backgroundColor: 'var(--mode-surface)', 
                        color: 'var(--mode-text)', 
                        borderColor: 'var(--mode-border)'
                      }}
                    >
                      {t('belongings.print.selectAll')}
                    </button>
                    <button
                      onClick={() => setSelectedRequirements([])}
                      className='text-sm px-3 py-1 border rounded hover:opacity-70 transition-opacity'
                      style={{ 
                        backgroundColor: 'var(--mode-surface)', 
                        color: 'var(--mode-text)', 
                        borderColor: 'var(--mode-border)'
                      }}
                    >
                      {t('belongings.print.deselectAll')}
                    </button>
                  </div>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                  {filteredRequirements.map((req) => (
                    <div key={req.id} className='flex items-center justify-between p-3 rounded border' style={{ 
                      backgroundColor: 'var(--mode-surface)', 
                      borderColor: 'var(--mode-border)' 
                    }}>
                      <div className='flex-1'>
                        <div className='font-medium text-sm' style={{ color: 'var(--mode-text)' }}>
                          {getBelongingName(req)}
                        </div>
                        <div className='text-xs' style={{ color: 'var(--mode-textSecondary)' }}>
                          {t('belongings.requirements.table.quantity')}: {req.quantityNeeded}
                          {req.level && ` • ${getLevelLabel(req.level)}`}
                        </div>
                      </div>
                      <input
                        type='checkbox'
                        checked={selectedRequirements.includes(req.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRequirements([...selectedRequirements, req.id]);
                          } else {
                            setSelectedRequirements(selectedRequirements.filter(id => id !== req.id));
                          }
                        }}
                        className='ml-2'
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Requirement Modal */}
        <RequirementModal
          isOpen={showRequirementModal || !!editingRequirement}
          mode={mode === 'extra-courses' ? 'extra_course' : mode}
          onClose={() => {
            setShowRequirementModal(false);
            setEditingRequirement(null);
          }}
          onSubmit={editingRequirement ? 
            (req) => handleUpdateRequirement(editingRequirement.id, req) : 
            handleCreateRequirement
          }
        />
      </div>
    </div>
  );
};

export default BelongingsPage;