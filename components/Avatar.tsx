import React from 'react';

interface AvatarProps {
  isTalking: boolean;
  isConnected: boolean;
  imageUrl: string;
}

const Avatar: React.FC<AvatarProps> = ({ isTalking, isConnected, imageUrl }) => {
  const containerClasses = `relative w-24 h-24 rounded-full transition-all duration-500 ease-in-out
    ${isConnected ? 'animate-breathing' : ''}
    ${isTalking ? 'animate-talking' : 'shadow-lg shadow-purple-500/30'}`;

  return (
    <div className={containerClasses}>
      <img
        src={imageUrl}
        alt="Marz AI Avatar"
        className="w-full h-full object-cover rounded-full"
      />
    </div>
  );
};

export default Avatar;
