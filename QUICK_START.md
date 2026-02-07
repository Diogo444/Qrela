# 🚀 Démarrage Rapide Docker

## ⚡ Commandes Essentielles

### Build et Lancer
```bash
docker-compose up -d
```

### Accéder à l'application
```
http://localhost
```

### Voir les logs
```bash
docker-compose logs -f qrela
```

### Arrêter
```bash
docker-compose down
```

---

## 🖥️ Sur Windows

Double-cliquez sur **`deploy.bat`** pour un menu interactif

---

## 🐧 Sur Linux/Mac

```bash
chmod +x deploy.sh
./deploy.sh
```

Ou exécutez directement :
```bash
docker-compose up -d
```

---

## 📌 Configuration Avant le Départ

1. **Créez `.env.local`** :
```bash
VITE_SITE_URL=https://votre-domaine.com
```

2. **Lancez** :
```bash
docker-compose up -d
```

3. **Vérifiez** :
```bash
curl http://localhost/health
```

---

## 🔍 Vérification Santé

```bash
# Health check endpoint
http://localhost/health

# Ou depuis le terminal
curl http://localhost/health
```

---

## 📂 Structure Docker Créée

| Fichier | Description |
|---------|-------------|
| **Dockerfile** | Build et packager l'app (multi-stage) |
| **docker-compose.yml** | Orchestration complète du service |
| **nginx.conf** | Config Nginx avec optimisations |
| **.dockerignore** | Exclure fichiers inutiles |
| **deploy.sh** | Helper Linux/Mac |
| **deploy.bat** | Helper Windows |
| **DOCKER_DEPLOYMENT.md** | Guide complet |

---

## 💡 Tips

- Pour changer le port : `ports: ["3000:80"]` dans `docker-compose.yml`
- Pour déboguer : `docker-compose exec qrela /bin/sh`
- Pour forcer rebuild : `docker-compose up -d --build`
- Pour nettoyer : `docker-compose down -v && docker system prune -f`

---

## 📊 Image Info

- **Base** : Node 20 alpine → Nginx alpine (multi-stage)
- **Taille finale** : ~150MB  
- **Type** : Service statique (pas de backend)
- **Port** : 80 (HTTP)

---

**Vous êtes prêt !** 🎉
