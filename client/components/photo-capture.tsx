'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Image as ImageIcon, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from './upload-files';

interface PhotoCaptureProps {
  onPhotosChange: (photoUrls: string[]) => void;
  existingPhotos?: string[];
  maxPhotos?: number;
}

export function PhotoCapture({
  onPhotosChange,
  existingPhotos = [],
  maxPhotos = 5,
}: PhotoCaptureProps) {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      let imageUrl: string | null = null;

      // Use the existing uploadFile function
      const url = await uploadFile(
        file,
        (url: string) => {
          imageUrl = url;
        },
        (loading: boolean) => {
          setUploading(loading);
        }
      );

      return url || imageUrl;
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || error?.message || 'Failed to upload photo',
        variant: 'destructive',
      });
      setUploading(false);
      return null;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      toast({
        title: 'Error',
        description: `Maximum ${maxPhotos} photos allowed`,
        variant: 'destructive',
      });
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        continue;
      }

      const url = await uploadPhoto(file);
      if (url) {
        setPhotos((prev) => {
          const updated = [...prev, url];
          onPhotosChange(updated);
          return updated;
        });
      }
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    onPhotosChange(updated);
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium flex items-center gap-2">
        <Camera className="w-4 h-4" />
        Photos ({photos.length}/{maxPhotos})
      </label>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* <Button
          type="button"
          variant="outline"
          onClick={handleCameraClick}
          disabled={uploading || photos.length >= maxPhotos}
          className="flex-1 border-primary/30 hover:bg-primary/10"
        >
          <Camera className="w-4 h-4 mr-2" />
          Camera
        </Button> */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGalleryClick}
          disabled={uploading || photos.length >= maxPhotos}
          className="flex-1 border-primary/30 hover:bg-primary/10"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Gallery
        </Button>
      </div>

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photoUrl, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border"
            >
              <img
                src={photoUrl}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Upload className="w-4 h-4 animate-pulse" />
          Uploading photo...
        </div>
      )}
    </div>
  );
}
