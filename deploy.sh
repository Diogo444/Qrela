#!/bin/bash

# Qrela Docker Deployment Helper

set -e

echo "🐳 Qrela Docker Deployment"
echo "════════════════════════════"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker et Docker Compose trouvés${NC}"

# Menu
echo ""
echo "Que voulez-vous faire ?"
echo "1) Build et lancer l'application (build)"
echo "2) Arrêter l'application (stop)"
echo "3) Voir les logs (logs)"
echo "4) Redémarrer (restart)"
echo "5) Nettoyer (clean)"
echo "6) Vérifier la santé (health)"
echo ""
read -p "Choisissez (1-6): " choice

case $choice in
    1)
        echo -e "${YELLOW}🔨 Building et lançant la conteneur...${NC}"
        docker-compose down 2>/dev/null || true
        docker-compose up -d
        echo ""
        sleep 2
        # Vérifier health
        if curl -s http://localhost/health > /dev/null; then
            echo -e "${GREEN}✓ Application démarrée avec succès !${NC}"
            echo -e "${GREEN}✓ Accédez à : http://localhost${NC}"
        else
            echo -e "${YELLOW}⏳ L'application démarre... (attendez quelques secondes)${NC}"
        fi
        ;;
    2)
        echo -e "${YELLOW}🛑 Arrêt du conteneur...${NC}"
        docker-compose down
        echo -e "${GREEN}✓ Arrêté${NC}"
        ;;
    3)
        echo -e "${YELLOW}📋 Affichage des logs (Ctrl+C pour quitter)...${NC}"
        docker-compose logs -f qrela
        ;;
    4)
        echo -e "${YELLOW}🔄 Redémarrage...${NC}"
        docker-compose restart
        sleep 1
        if curl -s http://localhost/health > /dev/null; then
            echo -e "${GREEN}✓ Application redémarrée !${NC}"
        else
            echo -e "${YELLOW}⏳ Attendez quelques secondes...${NC}"
        fi
        ;;
    5)
        echo -e "${YELLOW}🧹 Nettoyage des images, conteneurs et volumes non utilisés...${NC}"
        docker-compose down -v
        docker system prune -f
        echo -e "${GREEN}✓ Nettoyé${NC}"
        ;;
    6)
        echo -e "${YELLOW}🏥 Vérification de la santé...${NC}"
        if curl -s http://localhost/health > /dev/null; then
            echo -e "${GREEN}✓ L'application est saine${NC}"
            echo -e "${GREEN}✓ Accédez à : http://localhost${NC}"
        else
            echo -e "${RED}❌ L'application n'est pas en bonne santé${NC}"
            docker-compose logs qrela | tail -20
        fi
        ;;
    *)
        echo -e "${RED}❌ Choix invalide${NC}"
        exit 1
        ;;
esac
