
import React, { useRef, useEffect } from 'react';
import type { TranscriptionEntry } from '../types';

interface TranscriptionDisplayProps {
  history: TranscriptionEntry[];
  currentUserText: string;
  currentModelText: string;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ history, currentUserText, currentModelText }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentUserText, currentModelText]);

  return (
    <div
      ref={scrollRef}
      className="w-full max-w-2xl h-48 p-4 bg-black bg-opacity-30 rounded-lg overflow-y-auto"
    >
      <div className="flex flex-col space-y-4">
        {history.map((entry, index) => (
          <div key={index} className={`flex flex-col ${entry.speaker === 'user' ? 'items-start' : 'items-end'}`}>
            <div className={`px-4 py-2 rounded-lg max-w-xs md:max-w-md break-words ${entry.speaker === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
              <p className="text-sm font-semibold mb-1 capitalize">{entry.speaker}</p>
              <p>{entry.text}</p>
            </div>
          </div>
        ))}
        {currentUserText && (
          <div className="flex flex-col items-start">
            <div className="px-4 py-2 rounded-lg bg-blue-600 opacity-70">
                <p className="text-sm font-semibold mb-1 capitalize">User</p>
                <p>{currentUserText}</p>
            </div>
          </div>
        )}
        {currentModelText && (
          <div className="flex flex-col items-end">
             <div className="px-4 py-2 rounded-lg bg-gray-700 opacity-70">
                <p className="text-sm font-semibold mb-1 capitalize">Model</p>
                <p>{currentModelText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionDisplay;
