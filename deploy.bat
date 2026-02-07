@echo off
REM Qrela Docker Deployment Helper (Windows)

setlocal enabledelayedexpansion

echo.
echo 🐳 Qrela Docker Deployment
echo ════════════════════════════
echo.

REM Vérifier Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker n'est pas installé ou n'est pas dans le PATH
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose n'est pas installé ou n'est pas dans le PATH
    pause
    exit /b 1
)

echo ✓ Docker et Docker Compose trouvés
echo.

:menu
echo Que voulez-vous faire ?
echo 1) Build et lancer l'application
echo 2) Arrêter l'application
echo 3) Voir les logs
echo 4) Redémarrer
echo 5) Nettoyer
echo 6) Vérifier la santé
echo.

set /p choice="Choisissez (1-6): "

if "%choice%"=="1" (
    echo.
    echo 🔨 Building et lançant le conteneur...
    docker-compose down
    docker-compose up -d
    echo.
    timeout /t 3 /nobreak
    echo ✓ Application démarrée !
    echo ✓ Accédez à : http://localhost
    echo.
) else if "%choice%"=="2" (
    echo.
    echo 🛑 Arrêt du conteneur...
    docker-compose down
    echo ✓ Arrêté
    echo.
) else if "%choice%"=="3" (
    echo.
    echo 📋 Affichage des logs (Ctrl+C pour quitter)...
    docker-compose logs -f qrela
    echo.
) else if "%choice%"=="4" (
    echo.
    echo 🔄 Redémarrage...
    docker-compose restart
    timeout /t 2 /nobreak
    echo ✓ Application redémarrée !
    echo.
) else if "%choice%"=="5" (
    echo.
    echo 🧹 Nettoyage...
    docker-compose down -v
    docker system prune -f
    echo ✓ Nettoyé
    echo.
) else if "%choice%"=="6" (
    echo.
    echo 🏥 Vérification de la santé...
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost/health' -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host '✓ L''application est en bonne santé' -ForegroundColor Green; Write-Host '✓ Accédez à : http://localhost' -ForegroundColor Green } } catch { Write-Host '❌ L''application n''est pas accessible' -ForegroundColor Red }"
    echo.
) else (
    echo ❌ Choix invalide
    echo.
    goto menu
)

pause
