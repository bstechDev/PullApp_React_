// src/features/auth/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../../../services/api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/notifications');
        console.log('Réponse API notifications:', response);
        
        if (response.data && response.data.success) {
          // S'assurer que notifications est toujours un tableau
          const notificationsData = response.data.notifications || [];
          setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
        } else {
          console.warn('Réponse API invalide pour les notifications:', response.data);
          setNotifications([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        setError('Erreur lors du chargement des notifications');
        setNotifications([]); // S'assurer qu'on a toujours un tableau
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    } else {
      setLoading(false);
      setNotifications([]);
    }
  }, [user]);

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'PPP à HH:mm', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'post_rejected':
        return (
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        );
      case 'post_approved':
        return (
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
        );
    }
  };

  const NotificationItem = ({ notification }) => {
    // Vérification de sécurité pour les données de notification
    if (!notification || typeof notification !== 'object') {
      console.warn('Notification invalide reçue:', notification);
      return null;
    }

    const { type, data, created_at, is_unread } = notification;

    const renderContent = () => {
      // Vérification de sécurité pour les données
      const safeData = data || {};
      
      switch (type) {
        case 'post_rejected':
          return (
            <div>
              <p className="font-medium text-red-600">
                Votre publication a été rejetée
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Raison : {safeData.reason || 'Aucune raison spécifiée'}
              </p>
              {safeData.post_preview && (
                <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  <p className="font-medium">Contenu de la publication :</p>
                  <p className="line-clamp-2">{safeData.post_preview}</p>
                </div>
              )}
            </div>
          );
        case 'post_approved':
          return (
            <div>
              <p className="font-medium text-green-600">
                Votre publication a été approuvée
              </p>
              {safeData.post_preview && (
                <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  <p className="font-medium">Contenu de la publication :</p>
                  <p className="line-clamp-2">{safeData.post_preview}</p>
                </div>
              )}
            </div>
          );
        default:
          return (
            <p className="text-gray-600">
              {safeData.message || 'Nouvelle notification'}
            </p>
          );
      }
    };

    return (
      <div className="flex space-x-4 p-4 hover:bg-gray-50 transition-colors duration-200">
        {getNotificationIcon(type)}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {renderContent()}
              <p className="mt-1 text-xs text-gray-400">
                {formatDate(created_at)}
              </p>
            </div>
            {is_unread && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Nouveau
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Affichage de l'erreur si elle existe
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Erreur</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Vérification de sécurité finale avant le rendu
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">
              {safeNotifications.length} notification{safeNotifications.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {safeNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="mt-4">Aucune notification pour le moment</p>
              </div>
            ) : (
              safeNotifications.map((notification) => (
                <NotificationItem 
                  key={notification.id || Math.random()} 
                  notification={notification} 
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;