# 🐛 Guide de Débogage - Système d'Appels Entrants

## 🎯 **Problème**

Le modal d'appel entrant ne s'affiche pas chez l'utilisateur qui reçoit l'appel.

## 🔍 **Étapes de Débogage**

### **Étape 1 : Vérifier les Composants de Débogage**

1. **Connectez-vous** à l'application
2. **Cherchez les boutons de débogage** :
   - **"🧪 Tester Appel Entrant"** (en bas à gauche)
   - **"🐛 Debug Appels"** (en bas à droite)

### **Étape 2 : Tester le Système de Test**

1. **Cliquez sur "🧪 Tester Appel Entrant"**
2. **Vérifiez que le modal apparaît** avec "EMMANUEL FAHE vous appelle"
3. **Si le modal apparaît** → Le problème vient de l'API backend
4. **Si le modal n'apparaît pas** → Le problème vient du frontend

### **Étape 3 : Utiliser le Debugger**

1. **Cliquez sur "🐛 Debug Appels"** (bouton rouge en bas à droite)
2. **Observez les informations** :
   - **Utilisateur** : Doit afficher "ID: [votre_id]"
   - **Amis** : Doit afficher un nombre > 0
   - **Dernier test** : Affiche les résultats de l'API

### **Étape 4 : Vérifier la Console**

Ouvrez la console du navigateur (F12) et cherchez ces logs :

```
🔍 GlobalCallWatcher: Vérification des appels entrants...
🔍 callsService: Appel à /calls/incoming...
🔍 callsService: Réponse brute: {...}
🔍 callsService: Données traitées: {...}
```

## 🚨 **Problèmes Possibles et Solutions**

### **Problème 1 : Pas de logs dans la console**

**Cause** : Le `GlobalCallWatcher` ne se lance pas
**Solution** :

1. Vérifier que `GlobalCallWatcher` est bien importé dans `App.jsx`
2. Vérifier que l'utilisateur est connecté
3. Redémarrer l'application

### **Problème 2 : Erreur API dans les logs**

**Cause** : Le backend ne répond pas ou l'endpoint n'existe pas
**Solution** :

1. Vérifier que le backend fonctionne sur `http://192.168.1.4:8000`
2. Vérifier que l'endpoint `/api/calls/incoming` existe
3. Tester l'endpoint directement avec Postman ou curl

### **Problème 3 : API répond mais pas d'appel**

**Cause** : Aucun appel en cours pour cet utilisateur
**Solution** :

1. Créer un appel depuis un autre compte
2. Vérifier que les deux comptes sont amis
3. Vérifier que l'appelant est en ligne

### **Problème 4 : API répond avec un appel mais pas de modal**

**Cause** : Problème dans la logique de détection
**Solution** :

1. Vérifier que `friendsList` contient bien l'ami qui appelle
2. Vérifier que `caller_id` correspond à un ami dans la liste
3. Vérifier que `incomingCall` est bien mis à jour

## 🧪 **Tests à Effectuer**

### **Test 1 : API Backend**

```bash
curl -X GET "http://192.168.1.4:8000/api/calls/incoming" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Test 2 : Test Manuel**

1. Cliquer sur "🧪 Tester Appel Entrant"
2. Vérifier que le modal apparaît
3. Tester Accepter/Refuser

### **Test 3 : Test Réel**

1. Deux comptes connectés
2. Compte A appelle Compte B
3. Vérifier les logs dans la console du Compte B

## 📊 **Logs à Surveiller**

### **Logs Normaux (Succès)**

```
🔍 GlobalCallWatcher: Vérification des appels entrants...
🔍 User ID: 123
🔍 callsService: Appel à /calls/incoming...
🔍 callsService: Données traitées: { call: { id: 456, caller_id: 789, ... } }
🔍 GlobalCallWatcher: Caller trouvé: { id: 789, first_name: "John", ... }
📞 Nouvel appel entrant détecté: {...}
🔍 GlobalCallWatcher: Affichage du modal avec: {...}
```

### **Logs d'Erreur (Problème)**

```
🔍 GlobalCallWatcher: Vérification des appels entrants...
❌ callsService: Erreur checkIncomingCalls: Connection refused
```

## 🔧 **Solutions Rapides**

### **Si le backend ne répond pas :**

1. Démarrer le backend : `php artisan serve` ou équivalent
2. Vérifier l'URL dans `vite.config.js`
3. Tester la connectivité

### **Si l'API répond mais pas de modal :**

1. Vérifier que `friendsList` est chargé
2. Vérifier que l'utilisateur a des amis
3. Vérifier que l'ami qui appelle est dans la liste

### **Si le modal apparaît mais ne fonctionne pas :**

1. Vérifier que `IncomingCallModal` est bien configuré
2. Vérifier les props passées au modal
3. Vérifier les fonctions `onAccept` et `onDecline`

## 🎯 **Résultat Attendu**

Après débogage, vous devriez voir :

1. **Logs normaux** dans la console
2. **Debugger affiche** des données valides
3. **Modal apparaît** quand un appel est détecté
4. **Système fonctionne** avec les vrais appels

---

**💡 Conseil :** Commencez par tester avec le bouton "🧪 Tester Appel Entrant" pour isoler le problème !
