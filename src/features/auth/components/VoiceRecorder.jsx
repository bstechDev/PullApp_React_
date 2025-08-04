import React, { useState, useEffect, useRef } from 'react';
import { Mic, X } from 'lucide-react';

const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [error, setError] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    if (
      typeof window === 'undefined' ||
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setError("L'API d'enregistrement vocal n'est pas prise en charge dans cet environnement.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      setRecordTime(0);
      setAudioBlob(null);
      setAudioUrl(null);
      // Timer pour l'enregistrement vocal (gardé car nécessaire pour l'UI)
    intervalRef.current = setInterval(() => setRecordTime(prev => prev + 1), 1000);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement vocal:", err);
      setError("Impossible d'accéder au microphone. Vérifiez les permissions ou utilisez un navigateur compatible.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(intervalRef.current);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      const audioFile = new File([audioBlob], `vocal_${Date.now()}.wav`, { type: 'audio/wav' });
      onSend(audioFile);
      setAudioBlob(null);
      setAudioUrl(null);
    }
  };

  const handleCancelPreview = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Enregistrement vocal</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center space-y-4 mb-4">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
          >
            <Mic className="w-8 h-8" />
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white animate-pulse"
          >
            <Mic className="w-8 h-8" />
          </button>
        )}

        {audioUrl && (
          <div className="w-full text-center">
            <audio controls src={audioUrl} className="w-full mb-2" />
            <div className="flex justify-center space-x-4 mt-2">
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Envoyer
              </button>
              <button
                onClick={handleCancelPreview}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Réenregistrer
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mb-2">
        <p className="text-2xl font-mono text-gray-700">{formatTime(recordTime)}</p>
        {isRecording && (
          <p className="text-sm text-red-500 animate-pulse">Enregistrement en cours...</p>
        )}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default VoiceRecorder;
