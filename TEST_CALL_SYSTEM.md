# 🧪 Guide de Test - Système d'Appels Entrants

## 🎯 **Ce qui est implémenté**

✅ **Détection globale** des appels entrants (polling toutes les 3 secondes)  
✅ **Modal d'appel entrant** qui s'affiche sur toutes les pages  
✅ **Notification sonore** automatique  
✅ **Toast informatif** persistant  
✅ **Boutons Accepter/Refuser** fonctionnels  
✅ **Indicateur visuel** dans la navigation

## 🚀 **Comment tester le système**

### **Étape 1 : Démarrer l'application**

```bash
npm run dev
```

### **Étape 2 : Se connecter**

1. Aller sur `http://localhost:5173`
2. Se connecter avec vos identifiants
3. Vous devriez voir le dashboard

### **Étape 3 : Tester la notification d'appel entrant**

1. **Chercher le bouton de test** : En bas à gauche de l'écran, vous verrez un bouton bleu "🧪 Tester Appel Entrant"
2. **Cliquer sur le bouton** : Cela simulera un appel entrant de "EMMANUEL FAHE"
3. **Observer les notifications** :
   - Modal d'appel entrant au centre de l'écran
   - Son de notification (bip sonore)
   - Toast informatif en haut
   - Indicateur visuel en haut à droite

### **Étape 4 : Tester les actions**

- **Cliquer "Accepter"** : Ouvre une salle de test dans un nouvel onglet
- **Cliquer "Refuser"** : Ferme l'appel et affiche un message
- **Fermer le modal** : Ignore l'appel

## 📱 **Interface de test**

### **Bouton de test**

- **Position** : En bas à gauche de l'écran
- **Couleur** : Bleu avec icône de test
- **Fonction** : Simule un appel entrant

### **Modal d'appel entrant**

- **Position** : Centre de l'écran
- **Design** : Fond sombre avec modal blanc
- **Contenu** :
  - Icône de téléphone animée
  - "Appel entrant (TEST)"
  - "EMMANUEL FAHE vous appelle"
  - Boutons "Refuser" et "Accepter"

### **Notifications**

- **Toast** : En haut au centre, persistant
- **Son** : Bip sonore automatique
- **Indicateur** : En haut à droite, rouge avec animation

## 🔧 **Test en conditions réelles**

### **Avec le backend connecté**

1. **Démarrer votre backend** sur `http://192.168.1.4:8000`
2. **Créer un appel réel** depuis un autre compte
3. **Vérifier que l'appel apparaît** automatiquement

### **Sans backend**

1. **Utiliser le bouton de test** pour simuler
2. **Tester sur différentes pages** (profil, messages, etc.)
3. **Vérifier que les notifications** apparaissent partout

## 🐛 **Dépannage**

### **Problème : Pas de son**

- Vérifier que le navigateur autorise l'audio
- Le système génère automatiquement un bip si le fichier son n'existe pas

### **Problème : Modal ne s'affiche pas**

- Vérifier la console pour les erreurs
- S'assurer que tous les composants sont importés

### **Problème : Bouton de test invisible**

- Vérifier que vous êtes connecté
- Vérifier que le composant `TestCallNotification` est bien importé

## 🎉 **Résultat attendu**

Quand vous cliquez sur "🧪 Tester Appel Entrant" :

1. **Son de notification** se joue immédiatement
2. **Modal d'appel entrant** apparaît au centre
3. **Toast informatif** s'affiche en haut
4. **Indicateur visuel** apparaît en haut à droite
5. **Boutons Accepter/Refuser** sont fonctionnels

## 🔮 **Prochaines étapes**

Une fois le test réussi, vous pouvez :

1. **Supprimer le composant de test** (`TestCallNotification`)
2. **Connecter le vrai backend** pour les appels réels
3. **Personnaliser les notifications** selon vos besoins
4. **Ajouter des animations** supplémentaires

---

**🎯 Objectif atteint :** L'utilisateur reçoit une notification d'appel entrant peu importe où il se trouve dans l'application !
