import React from 'react';

export default function CTACards() {
  return (
    <section className="bg-gray-100 py-16 px-6 text-center">
      <h2 className="text-4xl font-orbitron font-bold mb-10 text-indigo-900">Marz’s Offerings</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
          <h3 className="text-2xl font-semibold text-indigo-800 mb-4">Smart Wallet Onboarding</h3>
          <p className="text-gray-700 mb-6">Begin your journey with gasless onboarding and emotionally intelligent guidance.</p>
          <button className="bg-indigo-700 text-white px-5 py-2 rounded-full hover:bg-indigo-800 transition">
            Activate Wallet
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
          <h3 className="text-2xl font-semibold text-indigo-800 mb-4">Crypto Sentinel</h3>
          <p className="text-gray-700 mb-6">Protect your assets with Marz’s watchful eye and legacy-driven smart contracts.</p>
          <button className="bg-indigo-700 text-white px-5 py-2 rounded-full hover:bg-indigo-800 transition">
            Explore Sentinel
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
          <h3 className="text-2xl font-semibold text-indigo-800 mb-4">Voice Companion</h3>
          <p className="text-gray-700 mb-6">Let Marz speak with clarity and care, powered by Azure’s Live Voice API.</p>
          <button className="bg-indigo-700 text-white px-5 py-2 rounded-full hover:bg-indigo-800 transition">
            Awaken Voice
          </button>
        </div>
      </div>
    </section>
  );
}
