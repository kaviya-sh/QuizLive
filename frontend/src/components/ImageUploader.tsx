import { useState } from 'react';
import { mediaApi } from '../api/mediaApi';
import { X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export const ImageUploader = ({ value, onChange, onRemove }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const { data } = await mediaApi.upload(file);
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            ) : (
              <>
                <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-600">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
};
