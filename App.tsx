import React, { useState } from 'react';
import MarzModal from './components/MarzModal';

const App: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-black flex flex-col items-center justify-center p-4 relative text-center">
            <div aria-hidden={isModalOpen}>
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8">
                    Welcome to the Future
                </h1>
                <p className="text-gray-400 mb-8 max-w-lg">
                    This is the main application content. Marz, your AI companion, is here to help you. Click below to start a conversation.
                </p>
                <button
                    onClick={() => setIsModalOpen(true)}
                    aria-label="Open AI assistant"
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                >
                    Ask Marz
                </button>
            </div>
            <MarzModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default App;
