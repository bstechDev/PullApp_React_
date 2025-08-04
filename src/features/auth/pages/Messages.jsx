import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useMessages } from '../../../hooks/useMessages';
import MessageList from '../components/MessageList';
import ConversationPanel from '../components/ConversationPanel';
import { RefreshCw } from 'lucide-react';
import UserStatusManager from '../components/UserStatusManager';
import api from '../../../services/api'; // Pour appels API statuts

const Messages = () => {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    loading,
    error,
    sendTextMessage,
    sendFileMessage,
    sendAudioMessage,
    loadMessages,
    downloadFile,
    isMyMessage,
    reload,
  } = useMessages(receiverId);

  const [messageContent, setMessageContent] = useState('');
  const [file, setFile] = useState(null);
  const [, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [userStatuses, setUserStatuses] = useState({});
  const [lastSeen, setLastSeen] = useState({});
  const messagesEndRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Toggle pour mobile

  // Affichage toast
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 4000);
  };

  // Scroll automatique en bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Chargement des statuts utilisateurs
  const fetchUserStatuses = async () => {
    try {
      const response = await api.get('/status/friends');
      console.log('Réponse API /status/friends à', new Date().toISOString(), ':', JSON.stringify(response.data, null, 2));
  
      let statusData = Array.isArray(response.data.friends_status) ? response.data.friends_status : [];
      const statuses = {};
      const seen = {};
  
      statusData.forEach(user => {
        const isOnline = user.is_online === true; // Utiliser is_online (booléen)
        const lastSeen = user.last_seen ? new Date(user.last_seen).getTime() : 0;
        const isRecentlyActive = lastSeen && (Date.now() - lastSeen < 30000); // 30 secondes
  
        const finalStatus = isOnline || isRecentlyActive ? 'online' : 'offline';
        console.log(`User ${user.user_id} (${user.first_name} ${user.last_name}): is_online = ${user.is_online}, last_seen = ${user.last_seen}, finalStatus = ${finalStatus}`);
        statuses[user.user_id] = finalStatus;
        seen[user.user_id] = user.last_seen || null;
      });
  
      setUserStatuses(statuses);
      setLastSeen(seen);
    } catch (err) {
      console.error('Erreur lors du chargement des statuts des utilisateurs à', new Date().toISOString(), ':', err);
    }
  };

  // Initialisation + refresh périodique
  useEffect(() => {
    fetchUserStatuses();
    const interval = setInterval(fetchUserStatuses, 30000);
    return () => clearInterval(interval);
  }, []);

  // Chargement de la conversation
  useEffect(() => {
    if (receiverId && !selectedConversation && conversations.length > 0) {
      const conv = conversations.find(c => c.friend.id === parseInt(receiverId));
      if (conv) {
        setSelectedConversation(conv);
        loadMessages(receiverId);
      }
    }
  }, [receiverId, conversations, selectedConversation, loadMessages, setSelectedConversation]);

  // Scroll lors de nouveaux messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedConversation || (!messageContent.trim() && !file)) return;

    try {
      if (messageContent.trim()) {
        await sendTextMessage(selectedConversation.friend.id, messageContent);
        setMessageContent('');
        showToast('Message envoyé avec succès');
      }

      if (file) {
        await sendFileMessage(selectedConversation.friend.id, file);
        setFile(null);
        showToast('Fichier envoyé avec succès');
      }
    } catch (err) {
      showToast(`Erreur lors de l'envoi : ${err.message}`, 'error');
    }
  };

  const handleSendVoiceMessage = async (audioFile) => {
    if (!selectedConversation) return;

    try {
      await sendAudioMessage(selectedConversation.friend.id, audioFile);
      setShowVoiceRecorder(false);
      showToast('Message vocal envoyé avec succès');
    } catch (err) {
      showToast(`Erreur lors de l'envoi : ${err.message}`, 'error');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSelectConversation = (friendId) => {
    navigate(`/dashboard/messages/${friendId}`);
    setIsSidebarOpen(false); // Fermer la sidebar après sélection sur mobile
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement des conversations...</p>
          <button
            onClick={reload}
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center max-w-md">
          <RefreshCw className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Une erreur est survenue</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={reload}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <UserStatusManager isEnabled={!!user?.id} />
      <div className="h-screen flex flex-col md:flex-row">
        {/* Toggle button for mobile */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-2 bg-blue-500 text-white rounded-lg mb-2 mx-2"
        >
          {isSidebarOpen ? 'Fermer' : 'Ouvrir'} la liste
        </button>
        {/* Sidebar (MessageList) */}
        <div
          className={`w-full md:w-80 bg-red border-r border-gray-200 ${
            isSidebarOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <MessageList
            conversations={conversations}
            selectedConversation={selectedConversation}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSelectConversation={handleSelectConversation}
            reload={reload}
            userStatuses={userStatuses}
            lastSeen={lastSeen}
          />
        </div>
        {/* Conversation Panel */}
        <div className="flex-1">
          <ConversationPanel
            selectedConversation={selectedConversation}
            messages={messages}
            messagesEndRef={messagesEndRef}
            showVoiceRecorder={showVoiceRecorder}
            setShowVoiceRecorder={setShowVoiceRecorder}
            messageContent={messageContent}
            setMessageContent={setMessageContent}
            file={file}
            setFile={setFile}
            handleSendMessage={handleSendMessage}
            handleSendVoiceMessage={handleSendVoiceMessage}
            handleFileChange={handleFileChange}
            downloadFile={downloadFile}
            isMyMessage={isMyMessage}
            showToast={showToast}
            userStatuses={userStatuses}
            lastSeen={lastSeen}
          />
        </div>
      </div>
    </>
  );
};

export default Messages;