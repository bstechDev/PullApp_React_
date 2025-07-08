import React from 'react';
import {
  Send,
  Paperclip,
  Download,
  Mic,
  Smile,
  FileText,
  CheckCircle,
  Check,
  MessageSquare,
} from 'lucide-react';
import VoiceRecorder from '../components/VoiceRecorder';
import AudioMessage from '../components/AudioMessage';

// Fonction utilitaire pour vérifier si c'est une image
const isImageFile = (fileName) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

// Affichage texte "Dernière connexion" formaté
const getLastSeenText = (lastSeenISO) => {
  if (!lastSeenISO) return 'Dernière connexion inconnue';
  const diffMs = Date.now() - new Date(lastSeenISO).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'À l’instant';
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffMinutes < 1440) return `Il y a ${Math.floor(diffMinutes / 60)} h`;
  return `Le ${new Date(lastSeenISO).toLocaleDateString()}`;
};

const ConversationPanel = ({
  selectedConversation,
  messages,
  messagesEndRef,
  showVoiceRecorder,
  setShowVoiceRecorder,
  messageContent,
  setMessageContent,
  file,
  handleSendMessage,
  handleSendVoiceMessage,
  handleFileChange,
  downloadFile,
  isMyMessage,
  showToast,
  userStatuses,
  lastSeen,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full">
      {selectedConversation ? (
        <>
          <div className="bg-white border-b border-gray-200 p-2 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="relative">
                  <div
                    className={`w-8 md:w-10 h-8 md:h-10 ${getAvatarColor(selectedConversation.friend.first_name, selectedConversation.friend.last_name)} rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-white`}
                  >
                    {getAvatar(selectedConversation.friend.first_name, selectedConversation.friend.last_name)}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 md:-bottom-1 -right-0.5 md:-right-1 w-2 md:w-3 h-2 md:h-3 rounded-full border-2 border-white ${
                      userStatuses[selectedConversation.friend.id] === 'online' ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {selectedConversation.friend.first_name} {selectedConversation.friend.last_name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    {userStatuses[selectedConversation.friend.id] === 'online'
                      ? 'En ligne'
                      : `Dernière connexion : ${getLastSeenText(lastSeen[selectedConversation.friend.id])}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-4 md:py-8">
                <p className="text-gray-500 text-sm md:text-base">Aucun message pour le moment. Démarrez la conversation 👋</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${isMyMessage(msg) ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs sm:max-w-sm md:max-w-md ${isMyMessage(msg) ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl p-2 md:p-3 shadow-sm ${
                        isMyMessage(msg) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.type === 'text' && <p className="text-sm break-words">{msg.content}</p>}
                      {msg.type === 'audio' && <AudioMessage message={msg} />}
                      {msg.type === 'file' && (
                        <>
                          {isImageFile(msg.file_name) ? (
                            <img
                              src={`/storage/${msg.file_path}`}
                              alt={msg.file_name}
                              className="max-w-full h-auto rounded-lg"
                            />
                          ) : (
                            <div className="flex items-center space-x-1 md:space-x-2">
                              <FileText className="w-3 md:w-4 h-3 md:h-4" />
                              <span className="text-sm truncate">{msg.file_name}</span>
                              <button
                                onClick={() => {
                                  try {
                                    downloadFile(msg.id, msg.file_name);
                                  } catch (err) {
                                    showToast(`Erreur lors du téléchargement : ${err.message}`, 'error');
                                  }
                                }}
                                className="p-1 md:p-1 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                <Download className="w-3 md:w-4 h-3 md:h-4" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                      {isMyMessage(msg) && (
                        <div className="flex items-center justify-end space-x-0.5 md:space-x-1 mt-1">
                          <span className="text-xs text-blue-100">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="text-blue-100">
                            {msg.is_read ? <CheckCircle className="w-2 md:w-3 h-2 md:h-3" /> : <Check className="w-2 md:w-3 h-2 md:h-3" />}
                          </div>
                        </div>
                      )}
                      {!isMyMessage(msg) && (
                        <div className="flex items-center justify-start space-x-0.5 md:space-x-1 mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {showVoiceRecorder && (
            <VoiceRecorder onSend={handleSendVoiceMessage} onCancel={() => setShowVoiceRecorder(false)} />
          )}

          {!showVoiceRecorder && (
            <div className="bg-white border-t border-gray-200 p-2 md:p-4 sticky bottom-0 z-10">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Tapez votre message..."
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-100 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 md:pr-12"
                  />
                  <button className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Smile className="w-4 md:w-5 h-4 md:h-5" />
                  </button>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <label className="p-1 md:p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer">
                    <Paperclip className="w-4 md:w-5 h-4 md:h-5" />
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                  <button
                    onClick={() => setShowVoiceRecorder(true)}
                    className="p-1 md:p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <Mic className="w-4 md:w-5 h-4 md:h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() && !file}
                    className="p-1 md:p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 md:w-5 h-4 md:h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-6 md:w-8 h-6 md:h-8" />
            <p className="text-gray-500 text-sm md:text-base">Sélectionnez une conversation pour commencer</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Fonctions utilitaires internes
const getAvatar = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

const getAvatarColor = (firstName, lastName) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500'];
  const nameHash = (firstName + lastName).length;
  return colors[nameHash % colors.length];
};

export default ConversationPanel;