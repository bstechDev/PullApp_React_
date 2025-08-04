// src/components/VideoPlayer.jsx
import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const VideoPlayer = ({ src, poster, duration, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  const handleError = (e) => {
    setIsLoading(false);
    setHasError(true);
    if (onError) onError(e);
  };

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      {/* Conteneur pour maintenir l'aspect ratio 16:9 */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
            <svg
              className="h-12 w-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500">Vidéo non disponible</p>
          </div>
        ) : (
          <>
            {/* Vidéo */}
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              className="absolute inset-0 w-full h-full object-contain"
              controls
              preload="metadata"
              playsInline
              onLoadedData={handleLoadedData}
              onError={handleError}
            >
              <source src={src} type="video/mp4" />
              <source src={src} type="video/webm" />
              <source src={src} type="video/ogg" />
              Votre navigateur ne supporte pas les vidéos HTML5.
            </video>

            {/* Indicateur de chargement */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <svg
                  className="animate-spin h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}

            {/* Overlay d'informations */}
            {!isLoading && !hasError && (
              <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                {duration && (
                  <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {duration}
                  </span>
                )}
                <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  HD
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

VideoPlayer.propTypes = {
  src: PropTypes.string.isRequired,
  poster: PropTypes.string,
  duration: PropTypes.string,
  onError: PropTypes.func,
};

export default VideoPlayer;