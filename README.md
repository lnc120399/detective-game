# 🔍 Detective Game - Multijugador Online

Juego interactivo de detectives para resolver misterios con tu pareja online.

## 🚀 Deploy en Railway (Opción más fácil)

Railway es gratuito y perfecto para apps con WebSockets.

### Pasos:

1. **Crea una cuenta en Railway.app**
   - Ve a https://railway.app
   - Regístrate (puedes usar GitHub)

2. **Sube el código a GitHub**
   ```bash
   cd /Users/lauranavascaina/detective-game
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TUUSUARIO/detective-game.git
   git branch -M main
   git push -u origin main
   ```
   (Reemplaza TUUSUARIO con tu usuario de GitHub)

3. **Despliega en Railway**
   - Ve a https://railway.app/dashboard
   - Click en "New Project"
   - Selecciona "Deploy from GitHub"
   - Elige tu repositorio `detective-game`
   - Railway detectará automáticamente que es una app Node.js
   - Click en "Deploy"

4. **Obtén el link público**
   - Ve a tu proyecto en Railway
   - En la sección "Networking", haz click en el dominio público
   - Ese es tu link! Ej: `https://detectivegame-production.up.railway.app`

5. **Comparte el link con tu novio**
   - Ambos abren `https://detectivegame-production.up.railway.app`
   - Usan el mismo código de sala
   - ¡A jugar!

---

## 🎮 Jugar en Local (Para probar primero)

```bash
npm install
npm start
```

Abre `http://localhost:3000` en dos navegadores.

---

## 🔐 Variables de entorno (opcional)

Si quieres cambiar el puerto:
```
PORT=3000
```

---

## 📋 Cómo jugar

1. Ambos jugadores entran con el **mismo código de sala**
2. Hacen click en las pistas para descubrirlas
3. Interrogan a los sospechosos para revelar secretos
4. Deducen quién es el culpable
5. Acusan cuando están seguros

¡Buena suerte, detectives! 🔍
