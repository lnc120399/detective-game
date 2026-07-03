import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const gameRooms = new Map();

const mystery = {
  title: "El Robo de la Joya de la Corona",
  setting: "La gala de caridad del Museo Arqueológico anoche",

  suspects: [
    {
      id: 1,
      name: "Gabriela Moretti",
      role: "Directora del museo",
      alibi: "Estaba cortando el champagne en la cocina",
      secrets: [
        "Tiene deudas del juego de $50,000",
        "La joya estaba asegurada por más de lo que vale",
        "Tiene llaves de todas las vitrinas"
      ],
      motive: "Necesitaba el dinero del seguro"
    },
    {
      id: 2,
      name: "Marco Delgado",
      role: "Vigilante nocturno",
      alibi: "Patrullaba el segundo piso",
      secrets: [
        "Vio a Gabriela cerca de la vitrina a las 10:45pm",
        "Tiene historial de hurtos menores hace 5 años",
        "Lo vieron saliendo por una puerta de servicio"
      ],
      motive: "Tiene antecedentes, fácil de culpar"
    },
    {
      id: 3,
      name: "Sofia Vega",
      role: "Coleccionista de arte invitada",
      alibi: "Estaba en el baño durante 20 minutos",
      secrets: [
        "Es una ladrona de arte internacional buscada",
        "Llevaba herramientas de robo en su bolsa",
        "Ya robó la misma joya hace 10 años en Ámsterdam"
      ],
      motive: "Es su especialidad, perfecta para ella"
    }
  ],

  clues: [
    {
      id: 1,
      title: "Grabación de seguridad borrosa",
      description: "Una figura encapuchada fue capturada en video cerca de la vitrina a las 10:42pm",
      where: "Cuarto de seguridad",
      discoveredBy: null,
      importance: "media"
    },
    {
      id: 2,
      title: "Puerta de servicio abierta",
      description: "La puerta trasera al jardín estaba abierta, el cierre había sido forzado",
      where: "Jardín del museo",
      discoveredBy: null,
      importance: "alta"
    },
    {
      id: 3,
      title: "Nota manuscrita",
      description: "Encontrada en la vitrina: 'Para Dimitri - te debo esto'",
      where: "Vitrina de la joya",
      discoveredBy: null,
      importance: "media"
    },
    {
      id: 4,
      title: "Boleta de depósito",
      description: "Gabriela depositó $45,000 en efectivo esta mañana",
      where: "Banco - registros",
      discoveredBy: null,
      importance: "alta"
    },
    {
      id: 5,
      title: "Reloj de bolsillo antiguo",
      description: "Encontrado en la escalera de emergencia. Pertenece a Sofia Vega según grabación de entrada",
      where: "Escalera de emergencia",
      discoveredBy: null,
      importance: "media"
    },
    {
      id: 6,
      title: "Email encriptado",
      description: "En la computadora de Sofia: 'El trabajo está listo para mañana'",
      where: "Laptop de Sofia (incautada)",
      discoveredBy: null,
      importance: "alta"
    },
    {
      id: 7,
      title: "Testimonio de camarero",
      description: "Marco fue visto fuera del edificio comprando cigarrillos a las 10:40pm",
      where: "Entrevista de testigo",
      discoveredBy: null,
      importance: "media"
    },
    {
      id: 8,
      title: "Llamadas telefónicas",
      description: "Sofia llamó a un número internacional (Ámsterdam) hace 3 días",
      where: "Registros telefónicos",
      discoveredBy: null,
      importance: "media"
    }
  ],

  solution: {
    culprit: 3, // Sofia Vega
    explanation: "Sofia es una ladrona profesional que fue contratada por Gabriela. La nota 'Para Dimitri' se refiere a un contacto criminal en Ámsterdam. Sofia usó la escalera de emergencia (dejó su reloj), y la puerta trasera fue su salida. La grabación borrosa fue Sofia. Marco fue el chivo expiatorio perfecto con sus antecedentes.",
    correctClues: [2, 3, 5, 6, 8]
  }
};

function createGameRoom(roomCode) {
  return {
    code: roomCode,
    players: new Map(),
    discoveredClues: new Set(),
    interrogations: new Map(),
    accusation: null,
    startTime: Date.now()
  };
}

io.on('connection', (socket) => {
  console.log(`Jugador conectado: ${socket.id}`);

  socket.on('join-room', (roomCode, playerName) => {
    let room = gameRooms.get(roomCode);
    if (!room) {
      room = createGameRoom(roomCode);
      gameRooms.set(roomCode, room);
    }

    if (room.players.size >= 2) {
      socket.emit('error', 'Sala llena (máximo 2 jugadores)');
      return;
    }

    room.players.set(socket.id, {
      name: playerName,
      role: room.players.size === 0 ? 'Detective 1' : 'Detective 2',
      joinedAt: Date.now()
    });

    socket.join(roomCode);
    socket.roomCode = roomCode;

    io.to(roomCode).emit('player-joined', {
      players: Array.from(room.players.values()),
      playerCount: room.players.size
    });

    if (room.players.size === 2) {
      io.to(roomCode).emit('game-started', {
        mystery: {
          title: mystery.title,
          setting: mystery.setting
        },
        suspects: mystery.suspects.map(s => ({
          id: s.id,
          name: s.name,
          role: s.role,
          alibi: s.alibi
        }))
      });
    }
  });

  socket.on('discover-clue', (clueId) => {
    const room = gameRooms.get(socket.roomCode);
    if (!room) return;

    const clue = mystery.clues.find(c => c.id === clueId);
    if (!clue) return;

    room.discoveredClues.add(clueId);
    clue.discoveredBy = room.players.get(socket.id).name;

    io.to(socket.roomCode).emit('clue-discovered', {
      clue: clue,
      discoveredBy: clue.discoveredBy
    });
  });

  socket.on('interrogate', (suspectId) => {
    const room = gameRooms.get(socket.roomCode);
    if (!room) return;

    const suspect = mystery.suspects.find(s => s.id === suspectId);
    if (!suspect) return;

    const interrogation = {
      suspectId: suspectId,
      suspect: suspect,
      timestamp: Date.now()
    };

    room.interrogations.set(suspectId, interrogation);

    io.to(socket.roomCode).emit('interrogation-revealed', {
      suspectId: suspectId,
      suspectName: suspect.name,
      secrets: suspect.secrets,
      motive: suspect.motive
    });
  });

  socket.on('make-accusation', (suspectId) => {
    const room = gameRooms.get(socket.roomCode);
    if (!room) return;

    const isCorrect = suspectId === mystery.solution.culprit;
    const player = room.players.get(socket.id);

    room.accusation = {
      accusedId: suspectId,
      accusedName: mystery.suspects.find(s => s.id === suspectId).name,
      isCorrect: isCorrect,
      accusedBy: player.name,
      correctCulprit: mystery.suspects.find(s => s.id === mystery.solution.culprit).name,
      explanation: mystery.solution.explanation,
      correctClues: mystery.solution.correctClues
    };

    io.to(socket.roomCode).emit('game-ended', room.accusation);
  });

  socket.on('disconnect', () => {
    const room = gameRooms.get(socket.roomCode);
    if (room) {
      room.players.delete(socket.id);
      io.to(socket.roomCode).emit('player-left', {
        players: Array.from(room.players.values()),
        playerCount: room.players.size
      });

      if (room.players.size === 0) {
        gameRooms.delete(socket.roomCode);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🔍 Servidor de detectives corriendo en http://localhost:${PORT}`);
});
