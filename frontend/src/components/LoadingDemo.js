import React, { useState } from 'react';
import LoadingAnimation from './LoadingAnimation';

/**
 * LoadingDemo Component
 * Showcase all loading animation variants
 * Use this to test and choose your favorite!
 */

const LoadingDemo = () => {
  const [selectedVariant, setSelectedVariant] = useState('brain');
  const [message, setMessage] = useState('Loading your study materials...');
  const [fullScreen, setFullScreen] = useState(false);

  const variants = [
    { 
      id: 'brain', 
      name: 'AI Brain', 
      description: 'Neural network with brain visualization',
      messages: [
        'Analyzing your study materials...',
        'Processing with AI...',
        'Building your study plan...'
      ]
    },
    { 
      id: 'particles', 
      name: 'Data Particles', 
      description: 'Flowing data streams and particles',
      messages: [
        'Syncing your data...',
        'Loading resources...',
        'Preparing your dashboard...'
      ]
    },
    { 
      id: 'gradient', 
      name: 'Morphing Blob', 
      description: 'Smooth gradient morphing animation',
      messages: [
        'Getting things ready...',
        'Almost there...',
        'Loading content...'
      ]
    },
    { 
      id: 'sync', 
      name: 'StudySync Logo', 
      description: 'Animated logo formation',
      messages: [
        'Welcome to StudySync AI...',
        'Initializing your workspace...',
        'Loading your profile...'
      ]
    },
    { 
      id: 'minimal', 
      name: 'Minimal Spinner', 
      description: 'Clean and simple animation',
      messages: [
        'Loading...',
        'Please wait...',
        'Just a moment...'
      ]
    }
  ];

  const handleVariantChange = (variantId) => {
    setSelectedVariant(variantId);
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      setMessage(variant.messages[0]);
    }
  };

  const selectedVariantData = variants.find(v => v.id === selectedVariant);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            StudySync AI Loading Animations
          </h1>
          <p className="text-slate-300 text-lg">
            Choose your favorite loading animation for the application
          </p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Variant Selection */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Select Animation Variant
              </label>
              <div className="grid grid-cols-2 gap-3">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedVariant === variant.id
                        ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/50'
                        : 'border-slate-600 bg-slate-700/30 hover:border-cyan-500'
                    }`}
                  >
                    <div className="font-semibold text-white mb-1">
                      {variant.name}
                    </div>
                    <div className="text-xs text-slate-300">
                      {variant.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Selection */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Loading Message
              </label>
              <div className="space-y-2">
                {selectedVariantData?.messages.map((msg, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessage(msg)}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      message === msg
                        ? 'border-cyan-500 bg-cyan-500/20 text-white'
                        : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-cyan-400'
                    }`}
                  >
                    {msg}
                  </button>
                ))}
              </div>

              {/* Full Screen Toggle */}
              <div className="mt-4">
                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fullScreen}
                    onChange={(e) => setFullScreen(e.target.checked)}
                    className="w-5 h-5 rounded accent-purple-500"
                  />
                  <span>Full Screen Mode</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Live Preview
          </h2>
          
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden">
            <LoadingAnimation 
              variant={selectedVariant}
              message={message}
              fullScreen={false}
            />
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">
            How to Use in Your App
          </h3>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-cyan-400">
{`import LoadingAnimation from './components/LoadingAnimation';

// In your component:
function MyComponent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <LoadingAnimation 
        variant="${selectedVariant}"
        message="${message}"
        fullScreen={${fullScreen}}
      />
    );
  }

  return <YourContent />;
}`}
            </pre>
          </div>

          <div className="mt-4 grid md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-400 mb-2">Props</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• <code className="text-cyan-400">variant</code>: Animation style</li>
                <li>• <code className="text-cyan-400">message</code>: Loading text</li>
                <li>• <code className="text-cyan-400">fullScreen</code>: Overlay mode</li>
              </ul>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-400 mb-2">Variants</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• brain (default)</li>
                <li>• particles</li>
                <li>• gradient</li>
                <li>• sync</li>
                <li>• minimal</li>
              </ul>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-400 mb-2">Features</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Fully responsive</li>
                <li>• Smooth animations</li>
                <li>• Theme-aware</li>
                <li>• Accessibility ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingDemo;
