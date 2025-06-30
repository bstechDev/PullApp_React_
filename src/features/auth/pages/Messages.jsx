// src/features/messages/pages/Messages.jsx
import React, { useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useMessages } from '../../../hooks/useMessages';
import {
  Send,
  Paperclip,
  RefreshCw,
  Users,
  MessageSquare,
  Download,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const Toast = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
    },
  };
  const config = typeConfig[type] || typeConfig.error;
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all animate-in slide-in-from-top-2 duration-300">
      <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4 shadow-lg max-w-sm`}>
        <div className="flex items-start space-x-3">
          <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${config.textColor}`}>{message}</p>
          </div>
          <button onClick={onClose} className={`${config.textColor} hover:opacity-70 transition-opacity`}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Messages = () => {
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
    loadMessages,
    downloadFile,
    reload,
  } = useMessages();

  const [messageContent, setMessageContent] = useState('');
  const [file, setFile] = useState(null);
  const [ setToast] = useState({ isVisible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 4000);
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || (!messageContent.trim() && !file)) return;
    try {
      if (messageContent.trim()) {
        await sendTextMessage(selectedConversation.friend.id, messageContent);
        setMessageContent('');
        showToast('Message envoyé avec succès', 'success');
      }
      if (file) {
        await sendFileMessage(selectedConversation.friend.id, file);
        setFile(null);
        showToast('Fichier envoyé avec succès', 'success');
      }
    } catch (err) {
      showToast(`Erreur lors de l'envoi : ${err.message}`, 'error');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSelectConversation = async (friendId) => {
    const conv = conversations.find(conv => conv.friend.id === friendId);
    setSelectedConversation(conv);
    await loadMessages(friendId);
  };

  const getAvatar = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getAvatarColor = (firstName, lastName) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500'
    ];
    const nameHash = (firstName + lastName).length;
    return colors[nameHash % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Une erreur est survenue</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={reload}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-600">{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversations</h3>
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Aucune conversation pour le moment</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map(conv => (
                  <button
                    key={conv.friend.id}
                    onClick={() => handleSelectConversation(conv.friend.id)}
                    className={`w-full p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-100 transition-colors duration-200 ${selectedConversation?.friend.id === conv.friend.id ? 'bg-blue-50 border border-blue-200' : ''}`}
                  >
                    <div className={`w-10 h-10 ${getAvatarColor(conv.friend.first_name, conv.friend.last_name)} rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
                      {getAvatar(conv.friend.first_name, conv.friend.last_name)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {conv.friend.first_name} {conv.friend.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.lastMessage
                          ? conv.lastMessage.content || 'Fichier envoyé'
                          : 'Aucun message'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 lg:col-span-2">
            {selectedConversation ? (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 ${getAvatarColor(selectedConversation.friend.first_name, selectedConversation.friend.last_name)} rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm`}>
                    {getAvatar(selectedConversation.friend.first_name, selectedConversation.friend.last_name)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedConversation.friend.first_name} {selectedConversation.friend.last_name}
                  </h3>
                </div>

                <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {messages.length === 0 ? (
                    <p className="text-sm text-center text-gray-500">Aucun message pour le moment. Démarrez la conversation 👋</p>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`mb-4 flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs p-3 rounded-lg ${msg.sender_id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                          {msg.type === 'text' && <p className="text-sm">{msg.content}</p>}
                          {msg.type === 'audio' && (
                            <audio controls className="w-full">
                              <source src={msg.file_path} type={msg.file_type} />
                            </audio>
                          )}
                          {msg.type === 'file' && (
                            <div className="flex items-center space-x-2">
                              <p className="text-sm truncate">{msg.file_name}</p>
                              <button
                                onClick={() => downloadFile(selectedConversation.friend.id, msg.id, msg.file_name)}
                                className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                              >
                                <Download className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          )}
                          <p className="text-xs mt-1 opacity-75">{new Date(msg.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Écrire un message..."
                    className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="p-2 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200 cursor-pointer">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors duration-200"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                {file && (
                  <p className="text-sm text-gray-600 mt-2">Fichier sélectionné : {file.name}</p>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Sélectionnez une conversation pour commencer</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <button 
        onClick={() => {
          console.log('🔄 Rechargement forcé');
          reload();
        }}
        className="px-9 py-2 bg-blue-500 text-white rounded-lg"
      >
        🔄 Recharger les conversations
      </button>
    </div>
  );
};

export default Messages;
