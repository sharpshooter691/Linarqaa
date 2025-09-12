import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useMode } from '@/contexts/ModeContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Printer,
  Users,
  Phone,
  CreditCard,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Briefcase,
  DollarSign,
  Calendar,
  Shield,
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
  ArrowLeft,
  GraduationCap,
  Sparkles
} from 'lucide-react';

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  firstNameArabic?: string;
  lastNameArabic?: string;
  identityNumber: string;
  phoneNumber: string;
  salary: number;
  type: 'ASSISTANT' | 'EDUCATRICE' | 'AIDE_EDUCATRICE';
  typeDisplayName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StaffFormData {
  firstName: string;
  lastName: string;
  firstNameArabic: string;
  lastNameArabic: string;
  identityNumber: string;
  phoneNumber: string;
  salary: number;
  type: 'ASSISTANT' | 'EDUCATRICE' | 'AIDE_EDUCATRICE';
  active: boolean;
}

const PersonnelPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const { mode } = useMode();
  const { toast } = useToast();
  
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const [formData, setFormData] = useState<StaffFormData>({
    firstName: '',
    lastName: '',
    firstNameArabic: '',
    lastNameArabic: '',
    identityNumber: '',
    phoneNumber: '',
    salary: 0,
    type: 'ASSISTANT',
    active: true
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/staff/all');
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: t('common.error'),
        description: t('personnel.messages.loadError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, formData);
        toast({
          title: t('common.success'),
          description: t('personnel.messages.updateSuccess'),
        });
      } else {
        await api.post('/staff', formData);
        toast({
          title: t('common.success'),
          description: t('personnel.messages.createSuccess'),
        });
      }
      
      setShowForm(false);
      setEditingStaff(null);
      resetForm();
      fetchStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast({
        title: t('common.error'),
        description: editingStaff ? t('personnel.messages.updateError') : t('personnel.messages.createError'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      firstNameArabic: staffMember.firstNameArabic || '',
      lastNameArabic: staffMember.lastNameArabic || '',
      identityNumber: staffMember.identityNumber,
      phoneNumber: staffMember.phoneNumber,
      salary: staffMember.salary,
      type: staffMember.type,
      active: staffMember.active
    });
    setShowForm(true);
  };

  const handleDelete = async (staffId: string) => {
    try {
      await api.delete(`/staff/${staffId}`);
      toast({
        title: t('common.success'),
        description: t('personnel.messages.deleteSuccess'),
      });
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({
        title: t('common.error'),
        description: t('personnel.messages.deleteError'),
        variant: "destructive",
      });
    }
    setShowDeleteModal(false);
    setStaffToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      firstNameArabic: '',
      lastNameArabic: '',
      identityNumber: '',
      phoneNumber: '',
      salary: 0,
      type: 'ASSISTANT',
      active: true
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStaff(null);
    resetForm();
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.firstNameArabic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastNameArabic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.identityNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || member.type === typeFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && member.active) ||
      (statusFilter === 'inactive' && !member.active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (active: boolean) => {
    return active ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusText = (active: boolean) => {
    return active ? t('personnel.status.active') : t('personnel.status.inactive');
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'ASSISTANT':
        return t('personnel.types.assistant');
      case 'EDUCATRICE':
        return t('personnel.types.educatrice');
      case 'AIDE_EDUCATRICE':
        return t('personnel.types.aideEducatrice');
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ASSISTANT':
        return <User className="h-5 w-5" />;
      case 'EDUCATRICE':
        return <Award className="h-5 w-5" />;
      case 'AIDE_EDUCATRICE':
        return <Shield className="h-5 w-5" />;
      default:
        return <Briefcase className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ASSISTANT':
        return 'var(--mode-primary)';
      case 'EDUCATRICE':
        return 'var(--mode-secondary)';
      case 'AIDE_EDUCATRICE':
        return 'var(--mode-accent)';
      default:
        return 'var(--mode-textSecondary)';
    }
  };

  // Statistics
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.active).length;
  const totalSalary = staff.reduce((sum, s) => sum + s.salary, 0);
  const avgSalary = totalStaff > 0 ? totalSalary / totalStaff : 0;

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
            {t('personnel.loading')}
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
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {t('personnel.title')} ✨
                  </h1>
                  <p className="text-white/90 text-lg">
                    {t('personnel.subtitle')}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <span className="text-white/90 text-sm">
                    {totalStaff} {t('personnel.stats.totalStaff')}
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
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 text-white bg-white/20 backdrop-blur-sm border border-white/30"
            >
              <UserPlus size={20} />
              <span>{t('personnel.addStaff')}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
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
                <p className="text-sm opacity-90">{t('personnel.stats.totalStaff')}</p>
                <p className="text-3xl font-bold">{totalStaff}</p>
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
                <p className="text-sm opacity-90">{t('personnel.stats.activeStaff')}</p>
                <p className="text-3xl font-bold">{activeStaff}</p>
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
                <p className="text-sm opacity-90">{t('personnel.stats.totalSalary')}</p>
                <p className="text-3xl font-bold">{totalSalary.toLocaleString()} MAD</p>
              </div>
              <DollarSign size={32} className="opacity-80" />
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
                <p className="text-sm opacity-90">{t('personnel.stats.avgSalary')}</p>
                <p className="text-3xl font-bold">{avgSalary.toLocaleString()} MAD</p>
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
                placeholder={t('personnel.searchPlaceholder')}
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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{
                  backgroundColor: 'var(--mode-surface)',
                  color: 'var(--mode-text)',
                  borderColor: 'var(--mode-border)',
                }}
              >
                <option value="">{t('personnel.allTypes')}</option>
                <option value="ASSISTANT">{t('personnel.types.assistant')}</option>
                <option value="EDUCATRICE">{t('personnel.types.educatrice')}</option>
                <option value="AIDE_EDUCATRICE">{t('personnel.types.aideEducatrice')}</option>
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
                <option value="">{t('personnel.allStatuses')}</option>
                <option value="active">{t('personnel.status.active')}</option>
                <option value="inactive">{t('personnel.status.inactive')}</option>
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

        {/* Staff Display */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStaff.map((member, index) => (
                <motion.div
                  key={member.id}
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
                  {/* Staff Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 
                        className="text-xl font-bold mb-1"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {member.firstName} {member.lastName}
                      </h3>
                      {(member.firstNameArabic || member.lastNameArabic) && (
                        <p 
                          className="text-sm line-clamp-2"
                          style={{ color: 'var(--mode-textSecondary)' }}
                        >
                          {member.firstNameArabic} {member.lastNameArabic}
                        </p>
                      )}
                    </div>
                    <div 
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {member.active ? t('personnel.status.active') : t('personnel.status.inactive')}
                    </div>
                  </div>

                  {/* Staff Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center" style={{ color: 'var(--mode-textSecondary)' }}>
                        <User size={16} className="mr-2" />
                        <span className="text-sm">{t('personnel.table.type')}</span>
                      </div>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {getTypeDisplayName(member.type)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center" style={{ color: 'var(--mode-textSecondary)' }}>
                        <CreditCard size={16} className="mr-2" />
                        <span className="text-sm">{t('personnel.table.cin')}</span>
                      </div>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {member.identityNumber}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center" style={{ color: 'var(--mode-textSecondary)' }}>
                        <Phone size={16} className="mr-2" />
                        <span className="text-sm">{t('personnel.table.phone')}</span>
                      </div>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {member.phoneNumber}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center" style={{ color: 'var(--mode-textSecondary)' }}>
                        <DollarSign size={16} className="mr-2" />
                        <span className="text-sm">{t('personnel.table.salary')}</span>
                      </div>
                      <span 
                        className="font-semibold"
                        style={{ color: 'var(--mode-primary)' }}
                      >
                        {member.salary.toLocaleString()} MAD
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(member)}
                      className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-lg"
                      style={{
                        backgroundColor: 'var(--mode-primary)',
                        color: 'white'
                      }}
                    >
                      <Edit size={16} className="inline mr-1" />
                      {t('personnel.edit')}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setStaffToDelete(member);
                        setShowDeleteModal(true);
                      }}
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
            <div 
              className="rounded-2xl shadow-lg border overflow-hidden"
              style={{
                backgroundColor: 'var(--mode-card)',
                borderColor: 'var(--mode-border)',
                boxShadow: `0 10px 30px var(--mode-shadow)20`
              }}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: 'var(--mode-border)' }}>
                  <thead style={{ 
                    background: `linear-gradient(to bottom right, var(--mode-primary), var(--mode-secondary))`
                  }}>
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                      >
                        {t('personnel.table.picture')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                      >
                        {t('personnel.table.name')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                      >
                        {t('personnel.table.cin')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                      >
                        {t('personnel.table.phone')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                      >
                        {t('personnel.table.type')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                      >
                        {t('personnel.table.salary')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                      >
                        {t('personnel.table.status')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                      >
                        {t('personnel.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--mode-border)' }}>
                    {filteredStaff.map((member, index) => (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:opacity-80 transition-opacity duration-200"
                        style={{ backgroundColor: 'var(--mode-card)' }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className="h-10 w-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${getTypeColor(member.type)}20` }}
                          >
                            {React.cloneElement(getTypeIcon(member.type), {
                              style: { color: getTypeColor(member.type) }
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--mode-text)' }}>
                              {member.firstName} {member.lastName}
                            </div>
                            {(member.firstNameArabic || member.lastNameArabic) && (
                              <div className="text-sm" style={{ color: 'var(--mode-textSecondary)' }}>
                                {member.firstNameArabic} {member.lastNameArabic}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--mode-text)' }}>
                          {member.identityNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--mode-text)' }}>
                          {member.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${getTypeColor(member.type)}20`,
                              color: getTypeColor(member.type)
                            }}
                          >
                            {getTypeDisplayName(member.type)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold" style={{ color: 'var(--mode-primary)' }}>
                          {member.salary.toLocaleString()} MAD
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(member.active)}
                            <span className="text-sm" style={{ color: 'var(--mode-text)' }}>
                              {getStatusText(member.active)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(member)}
                              className="p-2 rounded-lg transition-all duration-200"
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
                              onClick={() => {
                                setStaffToDelete(member);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 rounded-lg transition-all duration-200"
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>

        {filteredStaff.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div 
              className="mx-auto h-24 w-24 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--mode-surface)' }}
            >
              <Users className="h-12 w-12" style={{ color: 'var(--mode-textSecondary)' }} />
            </div>
            <h3 
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--mode-text)' }}
            >
              {t('personnel.noStaffMembers')}
            </h3>
            <p 
              className="text-lg mb-6"
              style={{ color: 'var(--mode-textSecondary)' }}
            >
              {t('personnel.noStaffDescription')}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white mx-auto"
              style={{
                background: `linear-gradient(to right, var(--mode-primary), var(--mode-secondary))`
              }}
            >
              <UserPlus className="h-5 w-5" />
              <span className="font-medium">{t('personnel.addStaff')}</span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
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
              className="rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: 'var(--mode-card)',
                borderColor: 'var(--mode-border)',
                boxShadow: `0 25px 50px var(--mode-shadow)40`
              }}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: 'var(--mode-primary)20' }}
                    >
                      <UserPlus className="h-6 w-6" style={{ color: 'var(--mode-primary)' }} />
                    </div>
                    <h2 
                      className="text-2xl font-bold"
                      style={{ color: 'var(--mode-text)' }}
                    >
                      {editingStaff ? t('personnel.editStaff') : t('personnel.addStaff')}
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCancel}
                    className="p-2 rounded-xl transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      color: 'var(--mode-textSecondary)'
                    }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label 
                        className="block text-sm font-medium mb-3"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('personnel.form.firstNameFrench')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label 
                        className="block text-sm font-medium mb-3"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('personnel.form.lastNameFrench')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                      />
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
                        {t('personnel.form.firstNameArabic')}
                      </label>
                      <input
                        type="text"
                        value={formData.firstNameArabic}
                        onChange={(e) => setFormData({...formData, firstNameArabic: e.target.value})}
                        className="w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                      />
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
                        {t('personnel.form.lastNameArabic')}
                      </label>
                      <input
                        type="text"
                        value={formData.lastNameArabic}
                        onChange={(e) => setFormData({...formData, lastNameArabic: e.target.value})}
                        className="w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
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
                        {t('personnel.form.identityNumber')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.identityNumber}
                        onChange={(e) => setFormData({...formData, identityNumber: e.target.value})}
                        className="w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
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
                        {t('personnel.form.phoneNumber')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        className="w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                      />
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
                        {t('personnel.form.salary')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.salary}
                        onChange={(e) => setFormData({...formData, salary: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <label 
                        className="block text-sm font-medium mb-3"
                        style={{ color: 'var(--mode-text)' }}
                      >
                        {t('personnel.form.type')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                        className="w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{
                          backgroundColor: 'var(--mode-surface)',
                          color: 'var(--mode-text)',
                          borderColor: 'var(--mode-border)',
                        }}
                      >
                        <option value="ASSISTANT">{t('personnel.types.assistant')}</option>
                        <option value="EDUCATRICE">{t('personnel.types.educatrice')}</option>
                        <option value="AIDE_EDUCATRICE">{t('personnel.types.aideEducatrice')}</option>
                      </select>
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex items-center space-x-3 p-4 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--mode-surface)',
                      borderColor: 'var(--mode-border)'
                    }}
                  >
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      className="h-5 w-5 rounded border-2 transition-all duration-200"
                      style={{
                        accentColor: 'var(--mode-primary)',
                        borderColor: 'var(--mode-border)'
                      }}
                    />
                    <label 
                      htmlFor="active" 
                      className="text-sm font-medium"
                      style={{ color: 'var(--mode-text)' }}
                    >
                      {t('personnel.form.active')}
                    </label>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="flex justify-end space-x-4 pt-6"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                      style={{
                        backgroundColor: 'var(--mode-border)',
                        color: 'var(--mode-text)'
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span>{t('personnel.cancel')}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                      style={{
                        background: `linear-gradient(to right, var(--mode-primary), var(--mode-secondary))`
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{t('personnel.saving')}</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>{editingStaff ? t('personnel.update') : t('personnel.create')}</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && staffToDelete && (
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
                    {t('personnel.confirmDelete')}
                  </h2>
                </div>
                
                <p 
                  className="text-lg mb-8"
                  style={{ color: 'var(--mode-textSecondary)' }}
                >
                  {t('personnel.deleteConfirmation', { name: `${staffToDelete.firstName} ${staffToDelete.lastName}` })}
                </p>
                
                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowDeleteModal(false);
                      setStaffToDelete(null);
                    }}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                    style={{
                      backgroundColor: 'var(--mode-border)',
                      color: 'var(--mode-text)'
                    }}
                  >
                    <X className="h-4 w-4" />
                    <span>{t('personnel.cancel')}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(staffToDelete.id)}
                    className="px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center space-x-2"
                    style={{
                      backgroundColor: '#ef4444'
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{t('personnel.deleteStaff')}</span>
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

export default PersonnelPage;