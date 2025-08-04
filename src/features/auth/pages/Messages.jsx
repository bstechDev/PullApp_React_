import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useMessages } from '../../../hooks/useMessages';
import MessageList from '../components/MessageList';
import ConversationPanel from '../components/ConversationPanel';
import { RefreshCw } from 'lucide-react';
import UserStatusManager from '../components/UserStatusManager';
import api from '../../../services/api'; // Pour appels API statuts
// Outils de débogage temporaires - à supprimer plus tard
import DebugInfo from '../../../components/DebugInfo';
import TestFriends from '../../../components/TestFriends';
import ForceConversations from '../../../components/ForceConversations';
import TestSendMessage from '../../../components/TestSendMessage';
import SimpleTestSendMessage from '../../../components/SimpleTestSendMessage';
import ForceDisplayConversations from '../../../components/ForceDisplayConversations';
import QuickTest from '../../../components/QuickTest';
import ForceLoadConversations from '../../../components/ForceLoadConversations';

const Messages = () => {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Logs de débogage réduits

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

  // Initialisation des statuts utilisateurs
  useEffect(() => {
    fetchUserStatuses();
  }, []);

  // Chargement de la conversation - Optimisé avec cache
  useEffect(() => {
    if (receiverId && conversations.length > 0) {
      const conv = conversations.find(c => c.friend.id === parseInt(receiverId));
      if (conv) {
        setSelectedConversation(conv);
        // Charger les messages (sera instantané si en cache)
        loadMessages(receiverId);
      }
    }
  }, [receiverId, conversations, loadMessages]);

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

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement des conversations...</p>
          <p className="text-gray-500 text-sm mt-4">
            Les messages se mettent à jour automatiquement
          </p>
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
          <p className="text-gray-500 text-sm">
            Les messages se mettent à jour automatiquement
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <UserStatusManager isEnabled={!!user?.id} />
      {/* Outils de débogage temporaires - à supprimer plus tard */}
      <DebugInfo />
      <TestFriends />
      <ForceConversations />
      <TestSendMessage />
      <SimpleTestSendMessage />
      <ForceDisplayConversations />
      <QuickTest />
      <ForceLoadConversations />
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

            userStatuses={userStatuses}
            lastSeen={lastSeen}
          />
        </div>
        {/* Conversation Panel */}
        <div className="flex-1">
          {loading && messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Chargement des messages...</p>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </>
  );
};

export default Messages;