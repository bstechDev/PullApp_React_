import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

const AudioMessage = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-3 bg-orange-500 rounded-full px-4 py-2 max-w-xs">
      <button onClick={togglePlay} className="text-white hover:text-orange-100 transition-colors">
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <div className="flex-1">
        <div className="flex space-x-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-white rounded-full transition-all duration-150"
              style={{ height: `${Math.random() * 20 + 8}px`, opacity: (currentTime / duration) * 20 > i ? 1 : 0.3 }}
            />
          ))}
        </div>
      </div>
      <span className="text-white text-xs font-medium">{formatTime(currentTime)} / {formatTime(duration)}</span>
      <audio
        ref={audioRef}
        src={message.file_path ? `/storage/${message.file_path}` : null}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default AudioMessage;