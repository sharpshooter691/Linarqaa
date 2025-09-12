import React, { useState } from 'react';
import { X, Camera, Link, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (photoUrl: string) => void;
  currentPhotoUrl?: string;
  studentName: string;
}

const PhotoUrlModal: React.FC<PhotoUrlModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentPhotoUrl = '',
  studentName
}) => {
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const { toast } = useToast();

  const validateUrl = (url: string) => {
    if (!url.trim()) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPhotoUrl(url);
    setIsValidUrl(validateUrl(url));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (photoUrl.trim() && !isValidUrl) {
      toast({
        title: "URL invalide",
        description: "Veuillez entrer une URL valide",
        variant: "destructive",
      });
      return;
    }

    onSubmit(photoUrl.trim());
    onClose();
  };

  const handleClear = () => {
    setPhotoUrl('');
    setIsValidUrl(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Photo de profil - {studentName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de l'image
            </label>
            <div className="flex">
              <div className="flex-1">
                <input
                  type="url"
                  value={photoUrl}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/photo.jpg"
                  className={`w-full px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isValidUrl && photoUrl.trim() ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {!isValidUrl && photoUrl.trim() && (
              <p className="text-red-500 text-sm mt-1">URL invalide</p>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Link className="h-4 w-4 mr-1" />
              Exemples d'URLs
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• Cloud: https://images.unsplash.com/photo-xxx</p>
              <p>• Local: http://localhost:3000/images/photo.jpg</p>
              <p>• Base64: data:image/jpeg;base64,/9j/4AAQ...</p>
            </div>
          </div>

          {photoUrl && isValidUrl && (
            <div className="border rounded-md p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu</h4>
              <div className="flex justify-center">
                <img
                  src={photoUrl}
                  alt="Aperçu"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    toast({
                      title: "Erreur d'image",
                      description: "Impossible de charger l'image",
                      variant: "destructive",
                    });
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Upload className="h-4 w-4 mr-1" />
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhotoUrlModal; 