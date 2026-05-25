import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { decode } from "next-auth/jwt";

const httpServer = createServer();

// Health check for Railway
httpServer.on("request", (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
  }
});

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  perMessageDeflate: false,
});

const secret = process.env.NEXTAUTH_SECRET!;
if (!secret) {
  console.error("NEXTAUTH_SECRET is not set");
  process.exit(1);
}

interface TypingState {
  active: boolean;
  startTimestamp: number;
  elapsed: number;
  wpm: number;
  accuracy: number;
  progress: number;
  finished: boolean;
}

interface UserPresence {
  name: string;
  email: string;
  devices: string[];
  typing: TypingState | null;
  connected: boolean;
}

const userStates = new Map<string, TypingState>();
const userPresence = new Map<string, UserPresence>();
const userNames = new Map<string, { name: string; email: string }>();

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("No token provided"));

  try {
    const decoded = await decode({ token, secret });
    if (!decoded?.sub) return next(new Error("Invalid token"));
    (socket as any).userId = decoded.sub;
    (socket as any).userName = decoded.name || "Unknown";
    (socket as any).userEmail = decoded.email || "";
    (socket as any).userRole = decoded.role || "user";
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

function broadcastPresence() {
  const users = Array.from(userPresence.entries()).map(([id, p]) => ({
    id,
    ...p,
  }));
  io.to("admin").emit("presence:all", users);
}

function removeDevice(userId: string, deviceType: string) {
  const p = userPresence.get(userId);
  if (!p) return;
  p.devices = p.devices.filter((d) => d !== deviceType);
  if (p.devices.length === 0) {
    p.connected = false;
    p.typing = null;
  }
  broadcastPresence();
}

io.on("connection", (socket) => {
  const userId = (socket as any).userId;
  const userName = (socket as any).userName;
  const userEmail = (socket as any).userEmail;
  const userRole = (socket as any).userRole;
  const deviceType = (socket.handshake.query.device as string) || "unknown";
  const isAdmin = userRole === "admin";

  console.log(`${userName} (${userId}) connected as ${deviceType}`);

  socket.join(userId);

  if (isAdmin) {
    socket.join("admin");
    const users = Array.from(userPresence.entries()).map(([id, p]) => ({
      id,
      ...p,
    }));
    socket.emit("presence:all", users);
    return;
  }

  // Track regular user presence
  userNames.set(userId, { name: userName, email: userEmail });
  let presence = userPresence.get(userId);
  if (!presence) {
    presence = {
      name: userName,
      email: userEmail,
      devices: [],
      typing: null,
      connected: true,
    };
    userPresence.set(userId, presence);
  }
  if (!presence.devices.includes(deviceType)) {
    presence.devices.push(deviceType);
  }
  presence.connected = true;
  broadcastPresence();

  // Restore typing state
  const savedTyping = userStates.get(userId);
  if (savedTyping) {
    presence.typing = savedTyping;
    socket.emit("typing:sync", savedTyping);
  }

  // --- typing events ---
  socket.on("typing:start", () => {
    const state: TypingState = {
      active: true,
      startTimestamp: Date.now(),
      elapsed: 0,
      wpm: 0,
      accuracy: 100,
      progress: 0,
      finished: false,
    };
    userStates.set(userId, state);
    if (presence) presence.typing = state;
    io.to(userId).emit("typing:update", state);
    broadcastPresence();
  });

  socket.on("typing:update", (data: Partial<TypingState>) => {
    const prev = userStates.get(userId);
    if (!prev) return;
    const state = { ...prev, ...data, active: true };
    userStates.set(userId, state);
    if (presence) presence.typing = state;
    io.to(userId).emit("typing:update", state);
    broadcastPresence();
  });

  socket.on("typing:end", (data?: Partial<TypingState>) => {
    const prev = userStates.get(userId);
    if (!prev && !data) return;
    const elapsed = data?.elapsed ?? prev?.elapsed ?? 0;
    const state: TypingState = {
      active: false,
      startTimestamp: 0,
      elapsed,
      wpm: data?.wpm ?? prev?.wpm ?? 0,
      accuracy: data?.accuracy ?? prev?.accuracy ?? 100,
      progress: data?.progress ?? prev?.progress ?? 0,
      finished: true,
    };
    userStates.set(userId, state);
    if (presence) presence.typing = state;
    io.to(userId).emit("typing:update", state);
    broadcastPresence();
  });

  socket.on("typing:reset", () => {
    userStates.delete(userId);
    if (presence) presence.typing = null;
    const state: TypingState = {
      active: false,
      startTimestamp: 0,
      elapsed: 0,
      wpm: 0,
      accuracy: 100,
      progress: 0,
      finished: false,
    };
    io.to(userId).emit("typing:update", state);
    broadcastPresence();
  });

  socket.on("disconnect", () => {
    console.log(`${userName} (${userId}) disconnected (${deviceType})`);
    if (isAdmin) {
      socket.leave("admin");
      return;
    }
    removeDevice(userId, deviceType);
  });
});

const PORT = parseInt(process.env.PORT || process.env.SOCKET_PORT || "3001", 10);
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
