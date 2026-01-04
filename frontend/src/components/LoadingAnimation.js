import React from 'react';
import './LoadingAnimation.css';

/**
 * LoadingAnimation Component
 * Data Particles - Flowing data streams and particles animation
 */

const LoadingAnimation = ({ message = 'Loading...', fullScreen = true }) => {
  const containerClass = fullScreen 
    ? 'loading-overlay' 
    : 'loading-inline';

  return (
    <div className={containerClass}>
      <div className="loading-content">
        <div className="loading-particles-container">
          {/* Center glow */}
          <div className="particle-center-glow"></div>
          
          {/* Particle streams */}
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="particle-stream"
              style={{ 
                '--angle': `${i * 18}deg`,
                '--delay': `${i * 0.15}s`,
                '--duration': `${2 + Math.random()}s`
              }}
            >
              <div className="stream-particle"></div>
            </div>
          ))}

          {/* Rotating rings */}
          <div className="particle-ring particle-ring-1"></div>
          <div className="particle-ring particle-ring-2"></div>
          <div className="particle-ring particle-ring-3"></div>
        </div>

        {message && (
          <div className="loading-message">
            <p className="message-text">{message}</p>
            <div className="message-underline"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingAnimation;
