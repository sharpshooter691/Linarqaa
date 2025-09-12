import React, { useState, useRef, useCallback } from 'react';
import { X, Camera, Link, Upload, FileImage, Video, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (photoUrl: string) => void;
  onUploadFile: (file: File) => void;
  onUploadCamera: (base64Data: string) => void;
  currentPhotoUrl?: string;
  studentName: string;
  studentId: string;
}

const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUploadFile,
  onUploadCamera,
  currentPhotoUrl = '',
  studentName,
  studentId
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'camera'>('url');
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const handleUrlSubmit = (e: React.FormEvent) => {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Type de fichier invalide",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onUploadFile(selectedFile);
      toast({
        title: "Succès",
        description: "Photo téléchargée avec succès",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      // Simulate file input change
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Erreur caméra",
        description: "Impossible d'accéder à la caméra",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCapturedImage(null);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const saveCapturedPhoto = async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    try {
      await onUploadCamera(capturedImage);
      toast({
        title: "Succès",
        description: "Photo capturée avec succès",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setPhotoUrl('');
    setIsValidUrl(true);
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTabChange = (tab: 'url' | 'upload' | 'camera') => {
    setActiveTab(tab);
    if (tab === 'camera' && !isCameraActive) {
      startCamera();
    } else if (tab !== 'camera') {
      stopCamera();
    }
    // Clear file selection when switching tabs
    if (tab !== 'upload') {
      clearFileSelection();
    }
  };

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ 
        backgroundColor: 'var(--mode-card)', 
        border: '1px solid var(--mode-border)',
        boxShadow: 'var(--mode-shadow)'
      }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center" style={{ color: 'var(--mode-text)' }}>
            <Camera className="h-5 w-5 mr-2" />
            Photo de profil - {studentName}
          </h3>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            style={{ color: 'var(--mode-textSecondary)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 p-1 rounded-lg" style={{ backgroundColor: 'var(--mode-surface)' }}>
          <button
            onClick={() => handleTabChange('url')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'url' 
                ? 'shadow-sm' 
                : 'hover:opacity-70'
            }`}
            style={{
              backgroundColor: activeTab === 'url' ? 'var(--mode-card)' : 'transparent',
              color: activeTab === 'url' ? 'var(--mode-primary)' : 'var(--mode-textSecondary)'
            }}
          >
            <Link className="h-4 w-4 inline mr-1" />
            URL
          </button>
          <button
            onClick={() => handleTabChange('upload')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upload' 
                ? 'shadow-sm' 
                : 'hover:opacity-70'
            }`}
            style={{
              backgroundColor: activeTab === 'upload' ? 'var(--mode-card)' : 'transparent',
              color: activeTab === 'upload' ? 'var(--mode-primary)' : 'var(--mode-textSecondary)'
            }}
          >
            <FileImage className="h-4 w-4 inline mr-1" />
            Fichier
          </button>
          <button
            onClick={() => handleTabChange('camera')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'camera' 
                ? 'shadow-sm' 
                : 'hover:opacity-70'
            }`}
            style={{
              backgroundColor: activeTab === 'camera' ? 'var(--mode-card)' : 'transparent',
              color: activeTab === 'camera' ? 'var(--mode-primary)' : 'var(--mode-textSecondary)'
            }}
          >
            <Video className="h-4 w-4 inline mr-1" />
            Caméra
          </button>
        </div>

        {/* URL Tab */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--mode-text)' }}>
                URL de l'image
              </label>
              <div className="flex">
                <div className="flex-1">
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/photo.jpg"
                    className={`w-full px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 ${
                      !isValidUrl && photoUrl.trim() ? 'border-red-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: 'var(--mode-surface)', 
                      color: 'var(--mode-text)', 
                      borderColor: !isValidUrl && photoUrl.trim() ? '#ef4444' : 'var(--mode-border)'
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 border border-l-0 rounded-r-md hover:opacity-70 transition-opacity"
                  style={{ 
                    backgroundColor: 'var(--mode-surface)', 
                    borderColor: 'var(--mode-border)',
                    color: 'var(--mode-textSecondary)'
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {!isValidUrl && photoUrl.trim() && (
                <p className="text-red-500 text-sm mt-1">URL invalide</p>
              )}
            </div>

            <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--mode-surface)' }}>
              <h4 className="text-sm font-medium mb-2 flex items-center" style={{ color: 'var(--mode-text)' }}>
                <Link className="h-4 w-4 mr-1" />
                Exemples d'URLs
              </h4>
              <div className="text-xs space-y-1" style={{ color: 'var(--mode-textSecondary)' }}>
                <p>• Cloud: https://images.unsplash.com/photo-xxx</p>
                <p>• Local: http://localhost:3000/images/photo.jpg</p>
                <p>• Base64: data:image/jpeg;base64,/9j/4AAQ...</p>
              </div>
            </div>

            {photoUrl && isValidUrl && (
              <div className="border rounded-md p-3" style={{ borderColor: 'var(--mode-border)' }}>
                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--mode-text)' }}>Aperçu</h4>
                <div className="flex justify-center">
                  <img
                    src={photoUrl}
                    alt="Aperçu"
                    className="w-32 h-32 rounded-lg object-cover border-2 shadow-sm"
                    style={{ borderColor: 'var(--mode-border)' }}
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
          </form>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver ? 'bg-opacity-20' : ''
              }`}
              style={{ 
                borderColor: isDragOver ? 'var(--mode-primary)' : 'var(--mode-border)',
                backgroundColor: isDragOver ? 'var(--mode-primary)' : 'transparent'
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileImage className={`h-12 w-12 mx-auto mb-4 transition-colors ${
                isDragOver ? 'text-white' : ''
              }`} style={{ color: isDragOver ? 'white' : 'var(--mode-textSecondary)' }} />
              <p className={`text-sm mb-4 transition-colors ${
                isDragOver ? 'text-white' : ''
              }`} style={{ color: isDragOver ? 'white' : 'var(--mode-textSecondary)' }}>
                {isDragOver ? 'Déposez l\'image ici' : 'Glissez-déposez une image ici ou cliquez pour sélectionner'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 text-white rounded-md hover:opacity-80 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: 'var(--mode-primary)' }}
              >
                {isUploading ? 'Téléchargement...' : 'Sélectionner une image'}
              </button>
            </div>
            <div className="text-xs text-center" style={{ color: 'var(--mode-textSecondary)' }}>
              Formats supportés: JPG, PNG, GIF • Taille max: 5MB
            </div>
            
            {filePreview && (
              <div className="border rounded-md p-4" style={{ borderColor: 'var(--mode-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium" style={{ color: 'var(--mode-text)' }}>Aperçu du fichier</h4>
                  <button
                    onClick={clearFileSelection}
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--mode-textSecondary)' }}
                    title="Supprimer la sélection"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-center">
                  <img
                    src={filePreview}
                    alt="Aperçu du fichier"
                    className="w-48 h-48 rounded-lg object-cover border-2 shadow-sm"
                    style={{ borderColor: 'var(--mode-border)' }}
                  />
                </div>
                {selectedFile && (
                  <div className="mt-3 text-xs text-center" style={{ color: 'var(--mode-textSecondary)' }}>
                    <p><strong>Nom:</strong> {selectedFile.name}</p>
                    <p><strong>Taille:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Type:</strong> {selectedFile.type}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Camera Tab */}
        {activeTab === 'camera' && (
          <div className="space-y-4">
            {!capturedImage ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg border"
                  style={{ borderColor: 'var(--mode-border)' }}
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={capturePhoto}
                    className="p-3 text-white rounded-full hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'var(--mode-primary)' }}
                    title="Capturer"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  <button
                    onClick={stopCamera}
                    className="p-3 text-white rounded-full hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'var(--mode-textSecondary)' }}
                    title="Arrêter"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-md p-4" style={{ borderColor: 'var(--mode-border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium" style={{ color: 'var(--mode-text)' }}>Photo capturée</h4>
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        startCamera();
                      }}
                      className="hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--mode-textSecondary)' }}
                      title="Reprendre"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={capturedImage}
                      alt="Photo capturée"
                      className="w-48 h-48 rounded-lg object-cover border-2 shadow-sm"
                      style={{ borderColor: 'var(--mode-border)' }}
                    />
                  </div>
                </div>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={saveCapturedPhoto}
                    disabled={isUploading}
                    className="px-4 py-2 text-white rounded-md hover:opacity-80 disabled:opacity-50 transition-opacity"
                    style={{ backgroundColor: 'var(--mode-accent)' }}
                  >
                    {isUploading ? 'Sauvegarde...' : 'Sauvegarder la photo'}
                  </button>
                  <button
                    onClick={() => {
                      setCapturedImage(null);
                      startCamera();
                    }}
                    className="px-4 py-2 text-white rounded-md hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'var(--mode-textSecondary)' }}
                  >
                    Reprendre
                  </button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t" style={{ borderColor: 'var(--mode-border)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:opacity-70 transition-opacity"
            style={{ 
              backgroundColor: 'var(--mode-surface)', 
              color: 'var(--mode-textSecondary)',
              borderColor: 'var(--mode-border)'
            }}
          >
            Annuler
          </button>
          {activeTab === 'url' && (
            <button
              onClick={handleUrlSubmit}
              className="px-4 py-2 text-white rounded-md hover:opacity-80 transition-opacity flex items-center"
              style={{ backgroundColor: 'var(--mode-primary)' }}
            >
              <Upload className="h-4 w-4 mr-1" />
              Sauvegarder
            </button>
          )}
          {activeTab === 'upload' && (
            <button
              onClick={handleFileUpload}
              disabled={isUploading}
              className="px-4 py-2 text-white rounded-md hover:opacity-80 transition-opacity flex items-center"
              style={{ backgroundColor: 'var(--mode-primary)' }}
            >
              <Upload className="h-4 w-4 mr-1" />
              Sauvegarder
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoModal; 