# 🔧 Configuration Backend pour Pusher - Messages

## 📋 **Problème actuel**

Les messages sont envoyés et reçus côté backend, mais les événements Pusher ne sont pas déclenchés, ce qui empêche l'affichage en temps réel côté frontend.

## 🚀 **Solution : Configuration Backend**

### **1. Installation Pusher côté Backend**

```bash
composer require pusher/pusher-php-server
```

### **2. Configuration Laravel Broadcasting**

Dans `config/broadcasting.php` :

```php
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY', '76a687ce58f17f3aa97a'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'cluster' => env('PUSHER_APP_CLUSTER', 'eu'),
        'encrypted' => true,
        'host' => env('PUSHER_HOST') ?: 'api-'.env('PUSHER_APP_CLUSTER', 'eu').'.pusherapp.com',
        'port' => env('PUSHER_PORT', 443),
        'scheme' => env('PUSHER_SCHEME', 'https')
    ],
],
```

### **3. Variables d'environnement (.env)**

```env
PUSHER_APP_KEY=76a687ce58f17f3aa97a
PUSHER_APP_SECRET=votre_secret_ici
PUSHER_APP_ID=votre_app_id_ici
PUSHER_APP_CLUSTER=eu
BROADCAST_DRIVER=pusher
```

### **4. Événement Message**

Créer `app/Events/NewMessage.php` :

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $sender_name;

    public function __construct($message, $sender_name = null)
    {
        $this->message = $message;
        $this->sender_name = $sender_name;
    }

    public function broadcastOn()
    {
        // Envoyer au destinataire du message
        return new PrivateChannel('messages.' . $this->message->receiver_id);
    }

    public function broadcastAs()
    {
        return 'new-message';
    }

    public function broadcastWith()
    {
        return [
            'message' => $this->message,
            'sender_name' => $this->sender_name,
            'timestamp' => now()->toISOString()
        ];
    }
}
```

### **5. Modification du Controller Messages**

**Trouvez votre controller de messages** (probablement dans `app/Http/Controllers/` ou `app/Http/Api/Controllers/`) et modifiez la méthode qui gère l'envoi de messages :

```php
use App\Events\NewMessage;

// Dans votre méthode d'envoi de message (store, send, etc.)
public function store(Request $request, $receiverId)
{
    // Votre logique existante pour créer le message
    $message = Message::create([
        'sender_id' => auth()->id(),
        'receiver_id' => $receiverId,
        'type' => $request->type,
        'content' => $request->content,
        // ... autres champs
    ]);

    // Déclencher l'événement Pusher
    $sender = auth()->user();
    $senderName = $sender->first_name . ' ' . $sender->last_name;

    broadcast(new NewMessage($message, $senderName))->toOthers();

    return response()->json($message, 201);
}
```

### **6. Routes Broadcasting**

Dans `routes/channels.php` :

```php
Broadcast::channel('messages.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
```

### **7. Middleware Broadcasting**

Dans `app/Http/Kernel.php` :

```php
protected $middlewareGroups = [
    'web' => [
        // ... autres middlewares
        \App\Http\Middleware\VerifyCsrfToken::class,
    ],
    'api' => [
        // ... autres middlewares
        \App\Http\Middleware\VerifyCsrfToken::class,
    ],
];
```

### **8. Route d'authentification Pusher**

Dans `routes/api.php` ou `routes/web.php` :

```php
Route::post('/broadcasting/auth', function (Request $request) {
    return Broadcast::auth($request);
})->middleware('auth:sanctum'); // ou 'auth:api' selon votre configuration
```

### **9. Test de l'intégration**

Pour tester si Pusher fonctionne :

```php
// Dans un controller de test
public function testPusher()
{
    $message = Message::first(); // ou créer un message de test
    broadcast(new NewMessage($message, 'Test User'));

    return response()->json(['message' => 'Événement Pusher déclenché']);
}
```

## 🔍 **Débogage**

### **Vérifier les logs Laravel :**

```bash
tail -f storage/logs/laravel.log
```

### **Vérifier la console du navigateur :**

- Ouvrir les DevTools (F12)
- Aller dans l'onglet Console
- Chercher les logs : `📨 Nouveau message reçu via Pusher`

### **Vérifier Pusher Debug Console :**

- Aller sur https://dashboard.pusher.com/
- Sélectionner votre app
- Aller dans "Debug Console"
- Vérifier que les événements sont envoyés

## ✅ **Résultat attendu**

Une fois configuré, quand un utilisateur envoie un message :

1. ✅ Le message est sauvegardé en base
2. ✅ L'événement Pusher est déclenché
3. ✅ Le destinataire reçoit le message en temps réel
4. ✅ Le message s'affiche instantanément dans la conversation
5. ✅ La liste des conversations se met à jour
6. ✅ L'indicateur de messages non lus s'actualise

## 🚨 **Points d'attention**

- **Authentification** : Assurez-vous que l'authentification Pusher fonctionne
- **CORS** : Vérifiez que les headers CORS sont corrects
- **SSL** : En production, utilisez HTTPS
- **Rate Limiting** : Pusher a des limites de messages par seconde

## 🧪 **Test temporaire**

En attendant la configuration backend, vous pouvez utiliser le bouton "Test Msg" dans le composant PusherTest pour vérifier que le frontend fonctionne correctement.
