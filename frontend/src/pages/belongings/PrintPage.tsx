import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, X, Download } from 'lucide-react';

interface BelongingRequirement {
  id: string;
  name: string;
  nameArabic?: string;
  category: string;
  isRequired: boolean;
  quantityNeeded: number;
  description?: string;
  notes?: string;
  studentType: 'KINDERGARTEN' | 'EXTRA_COURSE';
  level?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

interface PrintData {
  requirements: BelongingRequirement[];
  mode: 'kindergarten' | 'extra_course';
  level?: string;
  generatedAt: string;
}

const PrintPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [printData, setPrintData] = useState<PrintData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get data from location state
    const data = location.state?.printData;
    if (data) {
      setPrintData(data);
      setLoading(false);
      // Auto print after a short delay
      setTimeout(() => {
        window.print();
      }, 500);
    } else {
      // If no data, go back to belongings page
      navigate('/belongings');
    }
  }, [location.state, navigate]);

  const handleClose = () => {
    navigate('/belongings');
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

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center print:hidden'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>Préparation de l'impression...</p>
        </div>
      </div>
    );
  }

  if (!printData) {
    return null;
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Print Header - Only visible on screen */}
      <div className='print:hidden bg-gray-100 p-4 border-b'>
        <div className='max-w-4xl mx-auto flex items-center justify-between'>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>Page d'impression</h1>
            <p className='text-sm text-gray-600'>
              Liste des fournitures sélectionnées - {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className='flex space-x-2'>
            <button
              onClick={() => window.print()}
              className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
            >
              <Printer className='h-4 w-4' />
              <span>Imprimer</span>
            </button>
            <button
              onClick={handleClose}
              className='flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700'
            >
              <X className='h-4 w-4' />
              <span>Fermer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div className='max-w-4xl mx-auto p-8 print:p-0 print:max-w-none'>
        {/* Professional School Header */}
        <div className='text-center mb-8 print:mb-6'>
          <div className='mb-6'>
            <div className='flex items-center justify-center mb-4'>
              <div className='w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4'>
                <span className='text-white text-2xl font-bold'>L</span>
              </div>
              <div>
                <h1 className='text-4xl font-bold text-gray-900 print:text-3xl'>
                  École Linarqa
                </h1>
                <p className='text-lg text-gray-600 print:text-base'>
                  {printData.mode === 'kindergarten' ? 'École Maternelle Privée' : 'École Privée'}
                </p>
              </div>
            </div>
            <div className='w-48 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto'></div>
          </div>
          
          <h2 className='text-3xl font-bold text-gray-800 print:text-2xl mb-4'>
            Liste des Fournitures Scolaires
          </h2>
          
          <div className='bg-gray-50 p-4 rounded-lg print:bg-gray-100 border border-gray-200'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='font-semibold'>Année scolaire:</span> {new Date().getFullYear()}-{new Date().getFullYear() + 1}
              </div>
              {printData.level && (
                <div>
                  <span className='font-semibold'>Niveau:</span> {printData.level}
                </div>
              )}
              <div>
                <span className='font-semibold'>Date:</span> {new Date(printData.generatedAt).toLocaleDateString('fr-FR')}
              </div>
              <div>
                <span className='font-semibold'>Heure:</span> {new Date(printData.generatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        {/* Requirements by Category */}
        {Object.entries(groupRequirementsByCategory(printData.requirements)).map(([category, reqs]) => (
          <div key={category} className='mb-8 print:mb-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-4 print:mb-3 print:text-lg border-b-2 border-gray-400 pb-2'>
              {category}
            </h3>
            <div className='space-y-3'>
              {reqs.map((requirement, index) => (
                <div key={requirement.id} className='flex items-center space-x-4 p-3 border border-gray-300 rounded print:border-gray-400 bg-white print:bg-white'>
                  <div className='flex items-center space-x-3 flex-1'>
                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 ${
                      requirement.isRequired 
                        ? 'bg-red-500 border-red-500' 
                        : 'bg-green-500 border-green-500'
                    }`}></div>
                    <div className='flex-1'>
                      <div className='font-semibold text-gray-900 print:text-base'>{requirement.name}</div>
                      {requirement.nameArabic && (
                        <div className='text-sm text-gray-600 print:text-sm'>{requirement.nameArabic}</div>
                      )}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='font-bold text-gray-900 print:text-base'>
                      Qté: {requirement.quantityNeeded}
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded ${
                      requirement.isRequired 
                        ? 'bg-red-100 text-red-800 print:bg-red-50' 
                        : 'bg-green-100 text-green-800 print:bg-green-50'
                    }`}>
                      {requirement.isRequired ? 'Obligatoire' : 'Optionnel'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Summary Section */}
        <div className='mt-8 pt-6 border-t-2 border-gray-400 print:mt-6'>
          <div className='grid grid-cols-2 gap-6 mb-6'>
            <div className='bg-red-50 p-4 rounded print:bg-red-50 border-2 border-red-300'>
              <h4 className='font-bold text-red-800 mb-2 text-lg'>Fournitures Obligatoires</h4>
              <p className='text-3xl font-bold text-red-600'>
                {printData.requirements.filter(req => req.isRequired).length} articles
              </p>
              <p className='text-sm text-red-700 mt-1 font-medium'>À apporter impérativement</p>
            </div>
            <div className='bg-green-50 p-4 rounded print:bg-green-50 border-2 border-green-300'>
              <h4 className='font-bold text-green-800 mb-2 text-lg'>Fournitures Optionnelles</h4>
              <p className='text-3xl font-bold text-green-600'>
                {printData.requirements.filter(req => !req.isRequired).length} articles
              </p>
              <p className='text-sm text-green-700 mt-1 font-medium'>Recommandés mais non obligatoires</p>
            </div>
          </div>
          
          <div className='bg-yellow-50 p-6 rounded print:bg-yellow-50 border-2 border-yellow-300'>
            <h3 className='font-bold text-gray-900 mb-4 print:text-lg text-center'>Instructions importantes pour les parents :</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <ul className='text-sm text-gray-700 space-y-2 print:text-sm'>
                <li className='flex items-start space-x-2'>
                  <span className='text-red-600 font-bold mt-1'>•</span>
                  <span>Les articles <span className='text-red-600 font-semibold'>obligatoires</span> doivent être apportés dès la première semaine.</span>
                </li>
                <li className='flex items-start space-x-2'>
                  <span className='text-blue-600 font-bold mt-1'>•</span>
                  <span>Respectez scrupuleusement les quantités indiquées.</span>
                </li>
                <li className='flex items-start space-x-2'>
                  <span className='text-blue-600 font-bold mt-1'>•</span>
                  <span>Marquez tous les articles au nom de l'étudiant.</span>
                </li>
              </ul>
              <ul className='text-sm text-gray-700 space-y-2 print:text-sm'>
                <li className='flex items-start space-x-2'>
                  <span className='text-green-600 font-bold mt-1'>•</span>
                  <span>Les articles <span className='text-green-600 font-semibold'>optionnels</span> sont recommandés.</span>
                </li>
                <li className='flex items-start space-x-2'>
                  <span className='text-blue-600 font-bold mt-1'>•</span>
                  <span>Privilégiez la qualité pour la durabilité.</span>
                </li>
                <li className='flex items-start space-x-2'>
                  <span className='text-blue-600 font-bold mt-1'>•</span>
                  <span>Contactez-nous en cas de difficulté.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div className='mt-8 pt-6 border-t-2 border-gray-400 print:mt-6'>
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div className='border-r border-gray-300 pr-4'>
              <p className='font-bold text-gray-900 text-lg'>École Linarqa</p>
              <p className='text-sm text-gray-600'>Excellence éducative</p>
            </div>
            <div className='border-r border-gray-300 pr-4'>
              <p className='font-bold text-gray-900 text-lg'>Contact</p>
              <p className='text-sm text-gray-600'>contact@linarqa.com</p>
              <p className='text-sm text-gray-600'>+212 XXX XXX XXX</p>
            </div>
            <div>
              <p className='font-bold text-gray-900 text-lg'>Document officiel</p>
              <p className='text-sm text-gray-600'>Généré automatiquement</p>
              <p className='text-xs text-gray-500'>Ref: {new Date().getTime()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print-specific CSS */}
      <style jsx>{`
        @media print {
          @page {
            margin: 1in;
            size: A4;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:bg-red-50 {
            background-color: #fef2f2 !important;
          }
          
          .print\\:bg-green-50 {
            background-color: #f0fdf4 !important;
          }
          
          .print\\:bg-yellow-50 {
            background-color: #fefce8 !important;
          }
          
          .print\\:bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .print\\:bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintPage; 