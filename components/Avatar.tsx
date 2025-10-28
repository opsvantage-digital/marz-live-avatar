
import React, { useState, useEffect } from 'react';

interface AvatarProps {


  isTalking: boolean;
  isConnected: boolean;
  imageUrl: string;
  theme?: 'light' | 'dark';
  showThemeToggle?: boolean; // Optional: show toggle button
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


const Avatar: React.FC<AvatarProps> = ({ isTalking, isConnected, imageUrl, theme = 'dark', showThemeToggle = false }) => {
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(theme);
  const [imageError, setImageError] = useState<null | string>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);


  // Sync local theme with prop
  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  // Reset error state when imageUrl changes
  useEffect(() => {
    setImageError(null);
    setImageLoaded(false);
    setRetryCount(0);
  }, [imageUrl]);

  // If image fails, always fallback to generated avatar (never imgbb or broken)
  useEffect(() => {
    if (imageError) {
      setImageLoaded(true);
    }
  }, [imageError]);

  const baseRing = localTheme === 'dark' ? 'ring-2 ring-purple-500/40' : 'ring-2 ring-amber-300/60';
  const imgFilter = localTheme === 'dark' ? 'brightness-95 contrast-110' : 'brightness-110 contrast-105';
  const containerClasses = `relative w-24 h-24 rounded-full transition-all duration-500 ease-in-out ${baseRing}
    ${isConnected ? 'animate-breathing' : ''}
    ${isTalking ? 'animate-talking' : 'shadow-lg shadow-purple-500/30'}`;

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(null);
  };

  const handleImageError = (e?: React.SyntheticEvent<HTMLImageElement, Event>) => {
    let errorMsg = 'Failed to load avatar image.';
    if (imageUrl.startsWith('https://blob.vercel-storage.com/')) {
      errorMsg = 'Could not load image from Vercel Blob. The URL may be expired, private, or blocked by CORS.';
    }
    setImageError(errorMsg);
    setImageLoaded(false);
  };

  // Enterprise-level: Try to fetch the image HEAD to check for CORS/404
  const checkBlobUrl = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl, { method: 'HEAD', mode: 'cors' });
      if (!res.ok) {
        setImageError('Image not found (404) or access denied.');
      }
    } catch (err: any) {
      setImageError('Network or CORS error: Image cannot be loaded.');
    }
  };

  useEffect(() => {
    if (imageUrl && imageUrl.startsWith('https://blob.vercel-storage.com/')) {
      checkBlobUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, retryCount]);

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
          crossOrigin={imageUrl.startsWith('https://blob.vercel-storage.com/') ? 'anonymous' : undefined}
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <FallbackAvatar theme={localTheme} />
          <div className="mt-2 text-xs text-red-400 text-center px-2">
            {imageError}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded"
              onClick={() => setRetryCount(c => c + 1)}
              aria-label="Retry loading image"
            >
              Retry
            </button>
            <label className="px-2 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded cursor-pointer">
              Upload New
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setImageError(null);
                    setImageLoaded(false);
                    // @ts-ignore
                    window.dispatchEvent(new CustomEvent('marz-avatar-upload', { detail: url }));
                  }
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Theme toggle button */}
      {showThemeToggle && (
        <button
          className={`absolute top-1 right-1 px-2 py-1 text-xs rounded-full shadow bg-slate-700/80 text-white hover:bg-purple-600 transition-colors`}
          onClick={() => {
            const nextTheme = localTheme === 'dark' ? 'light' : 'dark';
            setLocalTheme(nextTheme);
            window.dispatchEvent(new CustomEvent('marz-theme-toggle', { detail: nextTheme }));
          }}
          aria-label="Toggle light/dark theme"
        >
          {localTheme === 'dark' ? '🌙' : '☀️'}
        </button>
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
