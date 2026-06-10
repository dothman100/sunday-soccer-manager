const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = Number(process.env.PORT || 4173);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@sundaysoccer.local").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sunday-admin";
const sessions = new Map();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function nextSunday(date = new Date()) {
  const next = new Date(date);
  const daysUntilSunday = (7 - next.getDay()) % 7;
  next.setDate(next.getDate() + daysUntilSunday);
  return next.toISOString().slice(0, 10);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, expected] = stored.split(":");
  const actual = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

function readSeedPlayers() {
  const appJs = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const match = appJs.match(/const seedPlayers = ([\s\S]*?);\r?\n\r?\nconst seedState/);
  if (!match) throw new Error("Could not find seedPlayers in app.js");
  return JSON.parse(match[1]);
}

function initialDb() {
  const players = readSeedPlayers();
  return {
    state: {
      players,
      generatedTeams: [],
      games: [],
      selectedPlayerId: players[0]?.id || "",
      view: "dashboard",
      accessRole: "",
      shuffleCount: 0
    },
    users: [
      {
        id: "admin",
        role: "admin",
        email: ADMIN_EMAIL,
        passwordHash: hashPassword(ADMIN_PASSWORD),
        playerId: null,
        name: "Admin"
      }
    ],
    availability: {
      date: nextSunday(),
      responses: {}
    }
  };
}

function readDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const db = initialDb();
    writeDb(db);
    return db;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDb(db) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function send(res, status, body, headers = {}) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, {
    "content-type": typeof body === "string" ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    ...headers
  });
  res.end(payload);
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || "").split(";").filter(Boolean).map((cookie) => {
    const [key, ...value] = cookie.trim().split("=");
    return [key, decodeURIComponent(value.join("="))];
  }));
}

function getSession(req) {
  const token = parseCookies(req).ssm_session;
  return token ? sessions.get(token) : null;
}

function requireSession(req, res) {
  const session = getSession(req);
  if (!session) {
    send(res, 401, { error: "Not signed in" });
    return null;
  }
  return session;
}

function requireAdmin(req, res) {
  const session = requireSession(req, res);
  if (!session) return null;
  if (session.role !== "admin") {
    send(res, 403, { error: "Admin access required" });
    return null;
  }
  return session;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) {
        reject(new Error("Request too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    playerId: user.playerId,
    name: user.name
  };
}

function sanitizeState(state) {
  return {
    ...state,
    accessRole: "",
    view: "dashboard"
  };
}

async function handleApi(req, res) {
  const db = readDb();
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/api/session") {
    return send(res, 200, { user: publicUser(getSession(req)) });
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    const body = await readBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = db.users.find((entry) => entry.email === email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return send(res, 401, { error: "Invalid email or password" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, publicUser(user));
    return send(res, 200, { user: publicUser(user) }, {
      "set-cookie": `ssm_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`
    });
  }

  if (req.method === "POST" && url.pathname === "/api/logout") {
    const token = parseCookies(req).ssm_session;
    if (token) sessions.delete(token);
    return send(res, 200, { ok: true }, {
      "set-cookie": "ssm_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
    });
  }

  if (req.method === "GET" && url.pathname === "/api/state") {
    const session = requireSession(req, res);
    if (!session) return;
    return send(res, 200, { state: db.state, user: session });
  }

  if (req.method === "POST" && url.pathname === "/api/state") {
    if (!requireAdmin(req, res)) return;
    const body = await readBody(req);
    if (!body.state || !Array.isArray(body.state.players)) return send(res, 400, { error: "Invalid state" });
    db.state = sanitizeState(body.state);
    writeDb(db);
    return send(res, 200, { ok: true, state: db.state });
  }

  if (req.method === "GET" && url.pathname === "/api/availability") {
    const session = requireSession(req, res);
    if (!session) return;
    if (db.availability.date !== nextSunday()) {
      db.availability = { date: nextSunday(), responses: {} };
      writeDb(db);
    }
    return send(res, 200, { availability: db.availability, user: session });
  }

  if (req.method === "POST" && url.pathname === "/api/availability") {
    const session = requireSession(req, res);
    if (!session) return;
    const body = await readBody(req);
    const status = ["in", "out", "unknown"].includes(body.status) ? body.status : "unknown";
    const playerId = session.role === "admin" ? body.playerId : session.playerId;
    if (!playerId) return send(res, 400, { error: "Missing player" });
    db.availability.responses[playerId] = {
      playerId,
      status,
      note: String(body.note || "").slice(0, 180),
      updatedAt: new Date().toISOString(),
      updatedBy: session.id
    };
    writeDb(db);
    return send(res, 200, { ok: true, availability: db.availability });
  }

  if (req.method === "POST" && url.pathname === "/api/availability/reset") {
    if (!requireAdmin(req, res)) return;
    db.availability = { date: nextSunday(), responses: {} };
    writeDb(db);
    return send(res, 200, { ok: true, availability: db.availability });
  }

  if (req.method === "GET" && url.pathname === "/api/users") {
    if (!requireAdmin(req, res)) return;
    return send(res, 200, { users: db.users.map(publicUser) });
  }

  if (req.method === "POST" && url.pathname === "/api/users/player") {
    if (!requireAdmin(req, res)) return;
    const body = await readBody(req);
    const player = db.state.players.find((entry) => entry.id === body.playerId);
    if (!player) return send(res, 404, { error: "Player not found" });
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) return send(res, 400, { error: "Email and password required" });
    const existing = db.users.find((entry) => entry.playerId === player.id || entry.email === email);
    const user = existing || { id: crypto.randomUUID(), role: "player", playerId: player.id };
    user.role = "player";
    user.playerId = player.id;
    user.email = email;
    user.name = player.name;
    user.passwordHash = hashPassword(password);
    if (!existing) db.users.push(user);
    writeDb(db);
    return send(res, 200, { user: publicUser(user) });
  }

  return send(res, 404, { error: "Not found" });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const resolved = path.resolve(path.join(ROOT, decodeURIComponent(pathname)));
  if (!resolved.startsWith(ROOT) || resolved.includes(`${path.sep}data${path.sep}`)) {
    return send(res, 403, "Forbidden");
  }
  fs.readFile(resolved, (error, data) => {
    if (error) {
      fs.readFile(path.join(ROOT, "index.html"), (indexError, indexData) => {
        if (indexError) return send(res, 404, "Not found");
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(indexData);
      });
      return;
    }
    res.writeHead(200, { "content-type": mimeTypes[path.extname(resolved)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    handleApi(req, res).catch((error) => send(res, 500, { error: error.message || "Server error" }));
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Sunday Soccer Manager listening on ${PORT}`);
});
