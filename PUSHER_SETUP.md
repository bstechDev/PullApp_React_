# 🚀 Configuration Pusher - PullApp React

## 📋 Variables d'environnement requises

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Configuration Pusher
VITE_PUSHER_APP_KEY=76a687ce58f17f3aa97a
VITE_PUSHER_APP_CLUSTER=eu

# Configuration API
VITE_API_URL=http://192.168.1.4:8000/api

# Configuration de développement
VITE_DEV_MODE=true
```

## 🔧 Installation et configuration

### 1. Installation des dépendances

```bash
npm install pusher-js
```

### 2. Structure des fichiers créés

```
src/
├── services/
│   └── pusherService.js          # Service principal Pusher
├── hooks/
│   ├── useNotifications.js       # Hook pour les notifications
│   ├── useRealTimeMessages.js    # Hook pour les messages temps réel
│   ├── usePosts.js              # Hook pour les posts
│   ├── useUserStatus.js         # Hook pour le statut utilisateur
│   └── useCalls.js              # Hook pour les appels
└── config/
    └── pusher.js                # Configuration Pusher
```

### 3. Initialisation dans l'application

L'application initialise automatiquement Pusher dans `App.jsx` quand un utilisateur se connecte.

## 📡 Canaux et événements disponibles

### Canaux publics (temporaires)

- `posts` - Nouveaux posts
- `user-status` - Statut des utilisateurs
- `notifications-{userId}` - Notifications pour un utilisateur
- `messages-{userId}` - Messages pour un utilisateur
- `calls-{userId}` - Appels pour un utilisateur

### Événements

- `new-post` - Nouveau post créé
- `new-message` - Nouveau message reçu
- `new-notification` - Nouvelle notification
- `new-call` - Nouvel appel entrant
- `user-online` - Utilisateur connecté
- `user-offline` - Utilisateur déconnecté

## 🎯 Utilisation dans les composants

### Exemple avec les notifications

```javascript
import { useNotifications } from "../hooks/useNotifications";

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications(userId);

  return (
    <div>
      <h3>Notifications ({unreadCount} non lues)</h3>
      {notifications.map((notification) => (
        <div key={notification.id} onClick={() => markAsRead(notification.id)}>
          {notification.message}
        </div>
      ))}
    </div>
  );
}
```

### Exemple avec les messages temps réel

```javascript
import { useRealTimeMessages } from "../hooks/useRealTimeMessages";

function MessagesComponent() {
  const { messages, addMessage } = useRealTimeMessages(userId);

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>{message.content}</div>
      ))}
    </div>
  );
}
```

## 🔒 Sécurité

⚠️ **Important** : L'authentification Pusher est temporairement désactivée en attendant l'implémentation backend.

Pour activer l'authentification :

1. Implémenter l'endpoint `/broadcasting/auth` côté backend
2. Décommenter les lignes d'authentification dans `pusherService.js`
3. Utiliser `subscribeToPrivateChannel()` au lieu de `subscribeToPublicChannel()`

## 🐛 Debugging

### Activation des logs Pusher

```javascript
// En développement
if (import.meta.env.DEV) {
  Pusher.logToConsole = true;
}
```

### Vérification de la connexion

```javascript
import pusherService from "../services/pusherService";

// Vérifier l'état de la connexion
console.log("État connexion:", pusherService.isConnected);
```

## 📊 Performance

- Les canaux sont automatiquement nettoyés lors du démontage des composants
- Reconnexion automatique en cas de perte de connexion
- Gestion d'erreurs robuste avec retry automatique

## 🎉 Résultat attendu

Après configuration, votre application devrait :

- ✅ Se connecter automatiquement à Pusher
- ✅ Recevoir les notifications en temps réel
- ✅ Afficher les nouveaux messages instantanément
- ✅ Mettre à jour les posts en temps réel
- ✅ Afficher le statut des utilisateurs
- ✅ Gérer les appels vidéo/audio
- ✅ Fonctionner sans erreurs CORS

## 🔄 Prochaines étapes

1. **Backend** : Implémenter l'endpoint d'authentification Pusher
2. **Sécurité** : Activer l'authentification des canaux privés
3. **Tests** : Tests d'intégration complets
4. **Optimisation** : Optimisation des performances
