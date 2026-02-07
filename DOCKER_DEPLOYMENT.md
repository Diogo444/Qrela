# Guide de Déploiement Docker - Qrela

## 📋 Analyse du Projet

**Qrela** est une application web 100% front-end (Vite + Vanilla JS) pour générer des codes QR.

### Stack Technique
- **Build** : Vite 7.2.4
- **Framework** : Vanilla JavaScript (ES modules)
- **Styles** : Tailwind CSS 4.1
- **Dependencies** : qr-code-styling 1.9.2
- **Package Manager** : pnpm

### Architecture
- Application SPA (Single Page Application)
- Pages statiques pour SEO (FAQ, Privacy, About)
- Aucun backend requis - service statique uniquement

---

## 🐳 Configuration Docker

### Fichiers Créés

#### 1. **Dockerfile** (Multi-stage)
- **Stage 1 (Builder)** : Node 20-alpine
  - Installe pnpm
  - Installe dépendances avec `pnpm install --frozen-lockfile`
  - Build l'application avec `vite build`
  
- **Stage 2 (Production)** : Nginx alpine
  - Utilise Nginx pour servir les fichiers statiques
  - Applique la config Nginx optimisée
  - Expose le port 80
  - Inclut un health check

#### 2. **docker-compose.yml**
- Service `qrela` avec build automatique
- Port mappé : 80 (HTTP)
- Restart policy : `unless-stopped`
- Health check intégré
- Network isolé

#### 3. **nginx.conf**
Optimisations incluses :
- Compression gzip des assets
- Cache control intelligent (static = 365 jours, HTML = pas de cache)
- SPA routing (fallback sur index.html)
- Headers de sécurité (X-Frame-Options, CSP, etc.)
- Endpoint health check à `/health`

#### 4. **.dockerignore**
Exclut les fichiers inutiles pour réduire la taille de l'image

---

## 🚀 Déploiement

### Étape 1 : Configuration Variables d'Environnement

Créez un fichier `.env.local` :
```bash
VITE_SITE_URL=https://votre-domaine.com
```

Ou modifiez `.env.example` et renommez-le en `.env.local`

### Étape 2 : Build et Run avec Docker Compose

```bash
# Build et lancer
docker-compose up -d

# Afficher les logs
docker-compose logs -f qrela

# Arrêter
docker-compose down
```

### Étape 3 : Vérifier la Santé

```bash
# Check le health endpoint
curl http://localhost/health

# Ou accédez à l'app
http://localhost
```

---

## 📊 Taille et Performance

### Taille de l'Image
- Image Nginx : ~42MB
- Avec dépendances Node : ~150MB total
- Build final (dist/) : ~500KB

### Optimisations Appliquées
✅ Multi-stage build (réduit taille finale)
✅ Alpine Linux (léger)
✅ Gzip compression
✅ Cache control headers
✅ Health check
✅ Nginx parfaitement configuré

---

## 🔒 Sécurité

Headers de sécurité implémentés :
- `X-Frame-Options: SAMEORIGIN` (clickjacking protection)
- `X-Content-Type-Options: nosniff` (MIME type sniffing)
- `X-XSS-Protection: 1; mode=block` (XSS protection)
- `Permissions-Policy` (Camera, Microphone, Geolocation désactivés)

---

## 🎯 Déploiement en Production

### Sur un VPS/Cloud

```bash
# 1. Cloner le repo
git clone <repo-url>
cd Qrela

# 2. Builder l'image
docker build -t qrela:latest .

# 3. Lancer avec docker-compose
docker-compose up -d

# 4. Configurer le reverse proxy (Nginx/Traefik)
# Pointer vers http://localhost:80
```

### Avec Traefik (Option)
Modifiez `docker-compose.yml` pour ajouter les labels Traefik si vous utilisez un orchestrateur.

### Avec un registre Docker
```bash
# Tagger l'image
docker tag qrela:latest votre-registry/qrela:latest

# Pusher
docker push votre-registry/qrela:latest
```

---

## 📝 Variables d'Environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_SITE_URL` | URL canonique du site (SEO) | `https://qrela.com` |
| `NODE_ENV` | Environnement | `production` |

---

## ✅ Checklist Pré-Déploiement

- [ ] Vérifier que `VITE_SITE_URL` est correct dans `.env.local`
- [ ] Tester localement : `docker-compose up`
- [ ] Accéder à `http://localhost` et vérifier le fonctionnement
- [ ] Vérifier `/health` pour le health check
- [ ] Tester la compression gzip avec `curl -I http://localhost`
- [ ] Vérifier les headers de sécurité
- [ ] Mettre à jour le certificat SSL si en HTTPS (reverse proxy)

---

## 🛠️ Commandes Utiles

```bash
# Build l'image à partir du Dockerfile
docker build -t qrela:v1.0 .

# Lancer le conteneur directement (sans compose)
docker run -p 80:80 qrela:latest

# Voir les images
docker images | grep qrela

# Nettoyer (dangling images, stopped containers)
docker system prune

# Afficher les logs en live
docker-compose logs -f

# Accéder au shell du conteneur
docker exec -it qrela /bin/sh
```

---

## 📞 Support & Troubleshooting

### Le container démarre mais l'app ne répond pas
```bash
docker-compose logs qrela  # Vérifier les erreurs
curl http://localhost/health  # Tester health check
```

### Port 80 déjà utilisé
Changez dans `docker-compose.yml` :
```yaml
ports:
  - "3000:80"  # Accès via http://localhost:3000
```

### Variables d'env non appliquées
Assurez-vous d'avoir créé `.env.local` **avant** de builder

---

**Déploiement prêt !** 🎉
