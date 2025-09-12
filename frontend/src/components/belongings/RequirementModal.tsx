import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useMode } from '@/contexts/ModeContext';

interface BelongingRequirement {
  id?: string;
  name: string;
  nameArabic?: string;
  category: string;
  isRequired: boolean;
  quantityNeeded: number;
  description?: string;
  notes?: string;
  studentType?: 'KINDERGARTEN' | 'EXTRA_COURSE';
  level?: string;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
}

interface RequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requirement: BelongingRequirement) => void;
  editingRequirement?: BelongingRequirement | null;
  mode: 'kindergarten' | 'extra_course';
}

const RequirementModal: React.FC<RequirementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingRequirement,
  mode
}) => {
  const [formData, setFormData] = useState<BelongingRequirement>({
    name: '',
    nameArabic: '',
    category: '',
    isRequired: true,
    quantityNeeded: 1,
    description: '',
    notes: '',
    level: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingRequirement) {
      setFormData(editingRequirement);
    } else {
      setFormData({
        name: '',
        nameArabic: '',
        category: '',
        isRequired: true,
        quantityNeeded: 1,
        description: '',
        notes: '',
        level: ''
      });
    }
  }, [editingRequirement, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting requirement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BelongingRequirement, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const categories = [
    'Fournitures de base',
    'Art et créativité',
    'Livres et cahiers',
    'Matériel de géométrie',
    'Matériel de sciences',
    'Matériel de sport',
    'Matériel informatique',
    'Autres'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ 
        backgroundColor: 'var(--mode-card)', 
        border: '1px solid var(--mode-border)',
        boxShadow: 'var(--mode-shadow)'
      }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--mode-border)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--mode-text)' }}>
            {editingRequirement ? 'Modifier l\'exigence' : 'Ajouter une exigence'}
          </h2>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            style={{ color: 'var(--mode-textSecondary)' }}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--mode-text)' }}>
                Nom de l'article *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: 'var(--mode-surface)', 
                  color: 'var(--mode-text)', 
                  borderColor: 'var(--mode-border)'
                }}
                placeholder="Ex: Crayons de couleur"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--mode-text)' }}>
                Nom en arabe
              </label>
              <input
                type="text"
                value={formData.nameArabic || ''}
                onChange={(e) => handleInputChange('nameArabic', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: 'var(--mode-surface)', 
                  color: 'var(--mode-text)', 
                  borderColor: 'var(--mode-border)'
                }}
                placeholder="Ex: أقلام ملونة"
              />
            </div>
          </div>

          {/* Category and Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--mode-text)' }}>
                Catégorie *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: 'var(--mode-surface)', 
                  color: 'var(--mode-text)', 
                  borderColor: 'var(--mode-border)'
                }}
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--mode-text)' }}>
                Niveau (optionnel)
              </label>
              <select
                value={formData.level || ''}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: 'var(--mode-surface)', 
                  color: 'var(--mode-text)', 
                  borderColor: 'var(--mode-border)'
                }}
              >
                <option value="">Tous les niveaux</option>
                {mode === 'kindergarten' ? (
                  <>
                    <option value="PETITE">Petite Section</option>
                    <option value="MOYENNE">Moyenne Section</option>
                    <option value="GRANDE">Grande Section</option>
                  </>
                ) : (
                  <>
                    <option value="CP1">CP1 - السنة الأولى ابتدائي</option>
                    <option value="CP2">CP2 - السنة الثانية ابتدائي</option>
                    <option value="CP3">CP3 - السنة الثالثة ابتدائي</option>
                    <option value="CP4">CP4 - السنة الرابعة ابتدائي</option>
                    <option value="CP5">CP5 - السنة الخامسة ابتدائي</option>
                    <option value="CP6">CP6 - السنة السادسة ابتدائي</option>
                    <option value="AC1">1AC - السنة الأولى إعدادي</option>
                    <option value="AC2">2AC - السنة الثانية إعدادي</option>
                    <option value="AC3">3AC - السنة الثالثة إعدادي</option>
                    <option value="TRONC_COMMUN">الجذع المشترك</option>
                    <option value="BAC1">1ère Bac - السنة الأولى بكالوريا</option>
                    <option value="BAC2">2ème Bac - السنة الثانية بكالوريا</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Requirements and Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--mode-text)' }}>
                Quantité nécessaire
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantityNeeded}
                onChange={(e) => handleInputChange('quantityNeeded', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: 'var(--mode-surface)', 
                  color: 'var(--mode-text)', 
                  borderColor: 'var(--mode-border)'
                }}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => handleInputChange('isRequired', e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: 'var(--mode-primary)' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--mode-text)' }}>
                  Obligatoire
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--mode-text)' }}>
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--mode-surface)', 
                color: 'var(--mode-text)', 
                borderColor: 'var(--mode-border)'
              }}
              placeholder="Description détaillée de l'article..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--mode-text)' }}>
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--mode-surface)', 
                color: 'var(--mode-text)', 
                borderColor: 'var(--mode-border)'
              }}
              placeholder="Notes supplémentaires..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t" style={{ borderColor: 'var(--mode-border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              style={{ 
                backgroundColor: 'var(--mode-surface)', 
                color: 'var(--mode-textSecondary)',
                border: '1px solid var(--mode-border)'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--mode-primary)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{editingRequirement ? 'Modifier' : 'Ajouter'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequirementModal; 