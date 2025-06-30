import api from '../../../services/api';

export const messagesService = {
  async sendTextMessage(receiverId, content) {
    if (!receiverId || !content) throw new Error('Destinataire et contenu requis');
    try {
      const response = await api.post(`/messages/${receiverId}`, {
        type: 'text',
        content,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur sendTextMessage:', error.response?.data || error);
      throw error;
    }
  },

  async sendFileMessage(receiverId, file) {
    if (!receiverId || !file) throw new Error('Destinataire et fichier requis');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', file.type.startsWith('audio') ? 'audio' : 'file');
      
      const response = await api.post(`/messages/${receiverId}`, formData, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur sendFileMessage:', error.response?.data || error);
      throw error;
    }
  },

  async getMessageHistory(receiverId) {
    if (!receiverId) throw new Error('Destinataire requis');
    try {
      const response = await api.get(`/messages/${receiverId}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getMessageHistory:', error.response?.data || error);
      throw error;
    }
  },

  async markMessagesAsRead(receiverId) {
    if (!receiverId) throw new Error('Destinataire requis');
    try {
      const response = await api.post(`/messages/${receiverId}/read`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur markMessagesAsRead:', error.response?.data || error);
      throw error;
    }
  },

  async downloadFile(receiverId, messageId) {
    if (!receiverId) throw new Error('Destinataire requis');
    try {
      // Supprimer le messageId du body si l'API ne l'attend pas
      const response = await api.post(`/messages/${receiverId}/download`, {}, {
        headers: {
          'Accept': 'application/octet-stream',
        },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Erreur downloadFile:', error.response?.data || error);
      throw error;
    }
  },
  // Ajouter cette fonction si nécessaire
  async markSpecificMessageAsRead(receiverId, messageId) {
    if (!receiverId || !messageId) throw new Error('Destinataire et ID du message requis');
    try {
      const response = await api.post(`/messages/${receiverId}/read`, {
        message_id: messageId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur markSpecificMessageAsRead:', error.response?.data || error);
      throw error;
    }
  }
};
