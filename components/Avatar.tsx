import React from 'react';

interface AvatarProps {
  isTalking: boolean;
  isConnected: boolean;
  imageUrl: string;
  theme?: 'light' | 'dark';
}

const Avatar: React.FC<AvatarProps> = ({ isTalking, isConnected, imageUrl, theme = 'dark' }) => {
  const baseRing = theme === 'dark' ? 'ring-2 ring-purple-500/40' : 'ring-2 ring-amber-300/60';
  const imgFilter = theme === 'dark' ? 'brightness-95 contrast-110' : 'brightness-110 contrast-105';
  const containerClasses = `relative w-24 h-24 rounded-full transition-all duration-500 ease-in-out ${baseRing}
    ${isConnected ? 'animate-breathing' : ''}
    ${isTalking ? 'animate-talking' : 'shadow-lg shadow-purple-500/30'}`;

  return (
    <div className={containerClasses}>
      <img
        src={imageUrl}
        alt="Marz AI Avatar"
        className={`w-full h-full object-cover rounded-full ${imgFilter}`}
      />
    </div>
  );
};

export default Avatar;
