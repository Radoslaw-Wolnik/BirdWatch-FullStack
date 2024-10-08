// File: src/components/ImageUpload.tsx

import React, { useState } from 'react';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  multiple?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, multiple = false }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    if (multiple) {
      Array.from(files).forEach(file => onUpload(file));
    } else {
      onUpload(files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        multiple={multiple}
        className="hidden"
        id="image-upload"
      />
      <label htmlFor="image-upload" className="cursor-pointer">
        <span className="text-blue-500">Click to upload</span> or drag and drop
      </label>
      <p className="text-gray-500 text-sm mt-2">
        {multiple ? 'Upload images' : 'Upload an image'}
      </p>
    </div>
  );
};

export default ImageUpload;