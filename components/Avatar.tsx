import React, { useState, useEffect } from 'react';

interface AvatarProps {
  isTalking: boolean;
  isConnected: boolean;
  imageUrl: string;
  theme?: 'light' | 'dark';
}

// Fallback avatar SVG for when image fails to load
const FallbackAvatar: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => (
  <div className={`w-full h-full rounded-full flex items-center justify-center ${
    theme === 'dark' ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-amber-400 to-orange-500'
  }`}>
    <svg
      className="w-12 h-12 text-white"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9ZM12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8ZM12 18C15.32 18 18 19.69 18 21H6C6 19.69 8.68 18 12 18Z"/>
    </svg>
  </div>
);

const Avatar: React.FC<AvatarProps> = ({ isTalking, isConnected, imageUrl, theme = 'dark' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset error state when imageUrl changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [imageUrl]);

  // If image fails, always fallback to generated avatar (never imgbb or broken)
  useEffect(() => {
    if (imageError) {
      // Use a generated fallback avatar
      setImageLoaded(true);
    }
  }, [imageError]);

  const baseRing = theme === 'dark' ? 'ring-2 ring-purple-500/40' : 'ring-2 ring-amber-300/60';
  const imgFilter = theme === 'dark' ? 'brightness-95 contrast-110' : 'brightness-110 contrast-105';
  const containerClasses = `relative w-24 h-24 rounded-full transition-all duration-500 ease-in-out ${baseRing}
    ${isConnected ? 'animate-breathing' : ''}
    ${isTalking ? 'animate-talking' : 'shadow-lg shadow-purple-500/30'}`;

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    console.warn('Avatar image failed to load:', imageUrl);
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div className={containerClasses}>
      {!imageError ? (
        <img
          src={imageUrl}
          alt="Marz AI Avatar"
          className={`w-full h-full object-cover rounded-full transition-opacity duration-300 ${imgFilter} ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        <FallbackAvatar theme={theme} />
      )}
      
      {/* Loading indicator */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 rounded-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
        </div>
      )}
    </div>
  );
};

export default Avatar;
