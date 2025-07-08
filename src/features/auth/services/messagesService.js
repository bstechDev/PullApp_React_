import api from '../../../services/api';
import {
  getFileUrl,
  formatFileSize,
  getFileType,
  validateFile
} from '../../../utils/fileUtils';

export const messagesService = {
  async sendTextMessage(receiverId, content) {
    try {
      const response = await api.post(`/messages/${receiverId}`, {
        type: 'text',
        content: content
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'envoi du message texte:", error);
      throw error;
    }
  },

  async sendAudioMessage(receiverId, audioFile) {
    try {
      validateFile(audioFile);
      const formData = new FormData();
      formData.append('type', 'audio');
      formData.append('file', audioFile);

      const response = await api.post(`/messages/${receiverId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'envoi du message audio:", error);
      throw error;
    }
  },

  async sendFileMessage(receiverId, file) {
    try {
      validateFile(file);
      const formData = new FormData();
      formData.append('type', 'file');
      formData.append('file', file);

      const response = await api.post(`/messages/${receiverId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'envoi du fichier:", error);
      throw error;
    }
  },

  async getMessageHistory(userId) {
    try {
      const response = await api.get(`/messages/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      throw error;
    }
  },

  async markMessagesAsRead(userId) {
    try {
      const response = await api.post(`/messages/${userId}/read`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
      throw error;
    }
  },

  async downloadFile(messageId) {
    try {
      const response = await api.get(`/messages/${messageId}/download`, {
        responseType: 'blob', // important pour télécharger un fichier
      });
      return response.data; // on retourne le blob
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      throw error;
    }
  },
  

  // Réexpose les utilitaires pour usage éventuel dans les composants
  getFileUrl,
  formatFileSize,
  getFileType,
  validateFile
};