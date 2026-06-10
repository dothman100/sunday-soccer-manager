const STORAGE_KEY = "sunday-soccer-manager-v2";
const positions = ["GK", "Defender", "Midfielder", "Forward"];
const ADMIN_PASSCODE = "sunday-admin";
const VIEWER_PASSCODE = "soccer-viewer";
const attributeKeys = ["pace", "shooting", "passing", "dribbling", "defending", "physicality", "weakFootStars"];
const attributeLabels = {
  pace: "Pace",
  shooting: "Shooting",
  passing: "Passing",
  dribbling: "Dribbling",
  defending: "Defending",
  physicality: "Physicality",
  weakFootStars: "Weak Foot"
};
const attributeShortLabels = {
  pace: "PAC",
  shooting: "SHO",
  passing: "PAS",
  dribbling: "DRI",
  defending: "DEF",
  physicality: "PHY",
  weakFootStars: "WF"
};
const starAttributeKeys = ["weakFootStars"];
const gkAttributeKeys = ["positioning", "goalKicks", "reflexes", "handling", "diving"];
const gkAttributeLabels = {
  positioning: "Positioning",
  goalKicks: "Goal Kicks",
  reflexes: "Reflexes",
  handling: "Handling",
  diving: "Diving"
};
const gkAttributeShortLabels = {
  positioning: "POS",
  goalKicks: "GK",
  reflexes: "REF",
  handling: "HAN",
  diving: "DIV"
};
let currentUser = null;
let apiAvailable = false;
let availabilityCache = null;

const seedPlayers = [
    {
        "id":  "5521e047-2d69-44a4-88d8-9b7712af2f8d",
        "name":  "Alex Wolf",
        "age":  28,
        "primaryPosition":  "GK",
        "secondaryPosition":  "",
        "rating":  90,
        "attributes":  {
                           "speed":  90,
                           "shooting":  85,
                           "defending":  95,
                           "passing":  70,
                           "weakFoot":  45
                       },
        "notes":  "Still Learning the game, quick off line.",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-05-17",
                                  "rating":  84,
                                  "note":  "Seed baseline"
                              },
                              {
                                  "date":  "2026-05-31",
                                  "rating":  86,
                                  "note":  "Current seed rating"
                              },
                              {
                                  "date":  "2026-06-09",
                                  "rating":  90,
                                  "note":  "Manual rating edit"
                              }
                          ],
        "createdOrder":  0
    },
    {
        "id":  "b8f727d1-56a8-4b5a-812d-cad0f08fb75b",
        "name":  "Eddy",
        "age":  40,
        "primaryPosition":  "GK",
        "secondaryPosition":  "",
        "rating":  80,
        "attributes":  {
                           "speed":  80,
                           "shooting":  70,
                           "defending":  80,
                           "passing":  75,
                           "weakFoot":  50
                       },
        "notes":  "Great positioning, Vocal Goalie.",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-05-17",
                                  "rating":  78,
                                  "note":  "Seed baseline"
                              },
                              {
                                  "date":  "2026-05-31",
                                  "rating":  80,
                                  "note":  "Current seed rating"
                              }
                          ],
        "createdOrder":  5
    },
    {
        "id":  "874dd4c9-6ea5-4f2c-8ddd-c3c8ad51ebf9",
        "name":  "Raja Rabat",
        "age":  35,
        "primaryPosition":  "Forward",
        "secondaryPosition":  "",
        "rating":  90,
        "attributes":  {
                           "speed":  93,
                           "shooting":  88,
                           "defending":  76,
                           "passing":  90,
                           "weakFoot":  60
                       },
        "notes":  "Direct runner. Poacher. Goal scorer.",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-05-17",
                                  "rating":  74,
                                  "note":  "Seed baseline"
                              },
                              {
                                  "date":  "2026-05-31",
                                  "rating":  76,
                                  "note":  "Current seed rating"
                              },
                              {
                                  "date":  "2026-06-09",
                                  "rating":  90,
                                  "note":  "Manual rating edit"
                              }
                          ],
        "createdOrder":  6
    },
    {
        "id":  "06074ed4-0717-4369-8396-da8af865a658",
        "name":  "Jospeh N",
        "age":  45,
        "primaryPosition":  "Forward",
        "secondaryPosition":  "Midfielder",
        "rating":  95,
        "attributes":  {
                           "speed":  90,
                           "shooting":  94,
                           "defending":  90,
                           "passing":  87,
                           "weakFoot":  88
                       },
        "notes":  "Game Changer.",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-05-17",
                                  "rating":  68,
                                  "note":  "Seed baseline"
                              },
                              {
                                  "date":  "2026-05-31",
                                  "rating":  70,
                                  "note":  "Current seed rating"
                              },
                              {
                                  "date":  "2026-06-09",
                                  "rating":  95,
                                  "note":  "Manual rating edit"
                              }
                          ],
        "createdOrder":  7
    },
    {
        "id":  "26f5cf0d-0187-460a-b287-321a31d9d40b",
        "name":  "Ramzi Rabat",
        "age":  44,
        "primaryPosition":  "Midfielder",
        "secondaryPosition":  "",
        "rating":  86,
        "attributes":  {
                           "speed":  86,
                           "shooting":  86,
                           "defending":  85,
                           "passing":  82,
                           "weakFoot":  88
                       },
        "notes":  "Two-way engine. Dangerous in the air.",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-05-17",
                                  "rating":  82,
                                  "note":  "Seed baseline"
                              },
                              {
                                  "date":  "2026-05-31",
                                  "rating":  84,
                                  "note":  "Current seed rating"
                              },
                              {
                                  "date":  "2026-06-09",
                                  "rating":  86,
                                  "note":  "Manual rating edit"
                              }
                          ],
        "createdOrder":  8
    },
    {
        "id":  "92426146-4aaa-4340-8749-60dea56f049c",
        "name":  "Rani Rabat",
        "age":  50,
        "primaryPosition":  "Midfielder",
        "secondaryPosition":  "",
        "rating":  86,
        "attributes":  {
                           "speed":  82,
                           "shooting":  85,
                           "defending":  85,
                           "passing":  90,
                           "weakFoot":  88
                       },
        "notes":  "two way player, versitile",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-05-17",
                                  "rating":  73,
                                  "note":  "Seed baseline"
                              },
                              {
                                  "date":  "2026-05-31",
                                  "rating":  75,
                                  "note":  "Current seed rating"
                              },
                              {
                                  "date":  "2026-06-09",
                                  "rating":  86,
                                  "note":  "Manual rating edit"
                              }
                          ],
        "createdOrder":  9
    },
    {
        "id":  "17dd6dfc-b609-4d85-a515-15a3659b9364",
        "name":  "Ramsey Othman",
        "age":  29,
        "primaryPosition":  "Midfielder",
        "secondaryPosition":  "Defender",
        "rating":  90,
        "attributes":  {
                           "speed":  84,
                           "shooting":  88,
                           "defending":  90,
                           "passing":  90,
                           "weakFoot":  70
                       },
        "notes":  "Overall versitile player, Positive impact everywhere.",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-05-17",
                                  "rating":  79,
                                  "note":  "Seed baseline"
                              },
                              {
                                  "date":  "2026-05-31",
                                  "rating":  81,
                                  "note":  "Current seed rating"
                              },
                              {
                                  "date":  "2026-06-09",
                                  "rating":  90,
                                  "note":  "Manual rating edit"
                              }
                          ],
        "createdOrder":  10
    },
    {
        "id":  "063d6904-d99d-4b85-aeda-28c934c6afae",
        "name":  "Ravi Singh",
        "age":  37,
        "primaryPosition":  "Defender",
        "secondaryPosition":  "Midfielder",
        "rating":  74,
        "attributes":  {
                           "speed":  74,
                           "shooting":  66,
                           "defending":  82,
                           "passing":  74,
                           "weakFoot":  62
                       },
        "notes":  "Calm, smart positioning.",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-05-17",
                                  "rating":  72,
                                  "note":  "Seed baseline"
                              },
                              {
                                  "date":  "2026-05-31",
                                  "rating":  74,
                                  "note":  "Current seed rating"
                              }
                          ],
        "createdOrder":  11
    },
    {
        "id":  "df49e69d-5650-48a9-bb40-ac9210802e31",
        "name":  "Tom Ellis",
        "age":  30,
        "primaryPosition":  "Midfielder",
        "secondaryPosition":  "",
        "rating":  69,
        "attributes":  {
                           "speed":  67,
                           "shooting":  69,
                           "defending":  69,
                           "passing":  76,
                           "weakFoot":  57
                       },
        "notes":  "Simple passes, steady.",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-05-17",
                                  "rating":  67,
                                  "note":  "Seed baseline"
                              },
                              {
                                  "date":  "2026-05-31",
                                  "rating":  69,
                                  "note":  "Current seed rating"
                              }
                          ],
        "createdOrder":  12
    },
    {
        "id":  "326f9096-a316-4557-90ab-b284fae295c8",
        "name":  "Alex Romero",
        "age":  21,
        "primaryPosition":  "Forward",
        "secondaryPosition":  "",
        "rating":  73,
        "attributes":  {
                           "speed":  73,
                           "shooting":  81,
                           "defending":  65,
                           "passing":  73,
                           "weakFoot":  61
                       },
        "notes":  "Pacey, improving first touch.",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-05-17",
                                  "rating":  71,
                                  "note":  "Seed baseline"
                              },
                              {
                                  "date":  "2026-05-31",
                                  "rating":  73,
                                  "note":  "Current seed rating"
                              }
                          ],
        "createdOrder":  13
    },
    {
        "id":  "24da956f-9491-4b79-8f3d-535f33fbca44",
        "name":  "Mike Johnson",
        "age":  41,
        "primaryPosition":  "Defender",
        "secondaryPosition":  "",
        "rating":  67,
        "attributes":  {
                           "speed":  67,
                           "shooting":  59,
                           "defending":  75,
                           "passing":  67,
                           "weakFoot":  55
                       },
        "notes":  "Good communicator.",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-05-17",
                                  "rating":  65,
                                  "note":  "Seed baseline"
                              },
                              {
                                  "date":  "2026-05-31",
                                  "rating":  67,
                                  "note":  "Current seed rating"
                              }
                          ],
        "createdOrder":  14
    },
    {
        "id":  "653f5f36-e6c7-4012-b34f-fb5e1ed1f105",
        "name":  "Diego Cruz",
        "age":  32,
        "primaryPosition":  "Midfielder",
        "secondaryPosition":  "Defender",
        "rating":  79,
        "attributes":  {
                           "speed":  77,
                           "shooting":  79,
                           "defending":  79,
                           "passing":  86,
                           "weakFoot":  67
                       },
        "notes":  "Balanced all-around player.",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-05-17",
                                  "rating":  77,
                                  "note":  "Seed baseline"
                              },
                              {
                                  "date":  "2026-05-31",
                                  "rating":  79,
                                  "note":  "Current seed rating"
                              }
                          ],
        "createdOrder":  15
    },
    {
        "id":  "edecc331-3161-49aa-8a6e-25679d8628f8",
        "name":  "Jad Othman",
        "age":  21,
        "primaryPosition":  "Midfielder",
        "secondaryPosition":  "Forward",
        "rating":  95,
        "attributes":  {
                           "speed":  96,
                           "shooting":  90,
                           "defending":  95,
                           "passing":  85,
                           "weakFoot":  84
                       },
        "notes":  "",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-06-09",
                                  "rating":  95,
                                  "note":  "Initial rating"
                              }
                          ],
        "createdOrder":  16
    },
    {
        "id":  "9b26de8e-0f6f-4aea-b0ce-e64f4ae96477",
        "name":  "Danny Othman",
        "age":  28,
        "primaryPosition":  "Forward",
        "secondaryPosition":  "Midfielder",
        "rating":  66,
        "attributes":  {
                           "speed":  87,
                           "shooting":  90,
                           "defending":  86,
                           "passing":  81,
                           "weakFoot":  86
                       },
        "notes":  "",
        "active":  true,
        "ratingHistory":  [
                              {
                                  "date":  "2026-06-09",
                                  "rating":  66,
                                  "note":  "Initial rating"
                              }
                          ],
        "createdOrder":  17
    }
];

const seedState = {
  players: seedPlayers,
  generatedTeams: [],
  games: [],
  selectedPlayerId: seedPlayers[0].id,
  view: "dashboard",
  accessRole: "",
  shuffleCount: 0
};

let state = loadState();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return seedState;
  try {
    return normalizeState({ ...seedState, ...JSON.parse(saved) });
  } catch {
    return seedState;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (apiAvailable && isAdmin()) {
    apiRequest("/api/state", {
      method: "POST",
      body: JSON.stringify({ state })
    }).catch(() => {});
  }
}

function setState(patch) {
  state = { ...state, ...patch };
  saveState();
  render();
}

function isAdmin() {
  return state.accessRole === "admin" || currentUser?.role === "admin";
}

function requireAdmin() {
  if (isAdmin()) return true;
  alert("Viewer access is read-only. Log in as admin to make changes.");
  return false;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    credentials: "same-origin",
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function exportCurrentData() {
  if (!requireAdmin()) return;
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "sunday-soccer-manager",
    version: 1,
    state: normalizeState(state)
  };
  const json = JSON.stringify(payload, null, 2);
  const output = document.getElementById("exportOutput");
  const textarea = document.getElementById("exportJson");
  const downloadLink = document.getElementById("downloadExportLink");
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  if (output && textarea && downloadLink) {
    output.hidden = false;
    textarea.value = json;
    textarea.focus();
    textarea.select();
    downloadLink.href = url;
    downloadLink.download = `sunday-soccer-data-${today()}.json`;
    downloadLink.textContent = `Download sunday-soccer-data-${today()}.json`;
  }
}

function importCurrentData(file) {
  if (!requireAdmin() || !file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedState = parsed.state || parsed;
      if (!Array.isArray(importedState.players)) throw new Error("Missing players array");
      state = normalizeState({
        ...seedState,
        ...importedState,
        accessRole: state.accessRole,
        view: "dashboard"
      });
      saveState();
      render();
    } catch (error) {
      alert("Could not import that file. Please use a Sunday Soccer export JSON file.");
    }
  });
  reader.readAsText(file);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function clampRating(value) {
  return Math.max(1, Math.min(100, Number(value) || 1));
}

function clampStarRating(value) {
  return Math.max(1, Math.min(5, Number(value) || 1));
}

function clampAttributeValue(key, value) {
  return starAttributeKeys.includes(key) ? clampStarRating(value) : clampRating(value);
}

function attributeAverage(attributes) {
  const keys = getAttributeKeys(attributes?.primaryPosition || attributes?.position || "")
    .filter((key) => !starAttributeKeys.includes(key));
  const total = keys.reduce((sum, key) => sum + clampRating(attributes?.[key]), 0);
  return Math.round(total / keys.length);
}

function isGoalkeeperPosition(primaryPosition) {
  return primaryPosition === "GK";
}

function getAttributeKeys(primaryPosition) {
  return isGoalkeeperPosition(primaryPosition) ? gkAttributeKeys : attributeKeys;
}

function getAttributeLabels(primaryPosition) {
  return isGoalkeeperPosition(primaryPosition) ? gkAttributeLabels : attributeLabels;
}

function getAttributeShortLabels(primaryPosition) {
  return isGoalkeeperPosition(primaryPosition) ? gkAttributeShortLabels : attributeShortLabels;
}

function buildDefaultAttributes(rating, primaryPosition) {
  const base = clampRating(rating);
  if (isGoalkeeperPosition(primaryPosition)) {
    return {
      positioning: clampRating(base + 4),
      goalKicks: clampRating(base - 4),
      reflexes: clampRating(base + 6),
      handling: clampRating(base + 2),
      diving: base
    };
  }
  const attributes = {
    pace: base,
    shooting: base,
    passing: base,
    dribbling: base,
    defending: base,
    physicality: base,
    weakFootStars: base >= 88 ? 5 : base >= 76 ? 4 : base >= 62 ? 3 : base >= 45 ? 2 : 1
  };
  if (primaryPosition === "Defender") {
    attributes.defending = clampRating(base + 8);
    attributes.physicality = clampRating(base + 5);
    attributes.shooting = clampRating(base - 8);
  }
  if (primaryPosition === "Forward") {
    attributes.shooting = clampRating(base + 8);
    attributes.dribbling = clampRating(base + 4);
    attributes.defending = clampRating(base - 8);
  }
  if (primaryPosition === "Midfielder") {
    attributes.passing = clampRating(base + 7);
    attributes.dribbling = clampRating(base + 3);
    attributes.pace = clampRating(base - 2);
  }
  return attributes;
}

function normalizePlayer(player) {
  const attributes = player.attributes || buildDefaultAttributes(player.rating, player.primaryPosition);
  const defaultAttributes = buildDefaultAttributes(player.rating, player.primaryPosition);
  const keys = getAttributeKeys(player.primaryPosition);
  const migratedAttributes = {
    ...attributes,
    pace: attributes.pace ?? attributes.speed,
    dribbling: attributes.dribbling ?? attributes.passing ?? player.rating,
    physicality: attributes.physicality ?? attributes.defending ?? player.rating,
    weakFootStars: attributes.weakFootStars ?? Math.ceil(clampRating(attributes.weakFoot ?? player.rating) / 20)
  };
  return {
    ...player,
    attributes: Object.fromEntries(keys.map((key) => [key, clampAttributeValue(key, migratedAttributes[key] ?? defaultAttributes[key] ?? player.rating)]))
  };
}

function normalizeState(nextState) {
  return {
    ...nextState,
    players: (nextState.players || []).map(normalizePlayer)
  };
}

function activePlayers() {
  return state.players.filter((player) => player.active);
}

function playerById(id) {
  return state.players.find((player) => player.id === id);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function positionBreakdown(players) {
  const counts = Object.fromEntries(positions.map((position) => [position, 0]));
  players.forEach((player) => counts[player.primaryPosition]++);
  return positions.map((position) => `${position}: ${counts[position]}`).join(" | ");
}

function teamMetrics(team) {
  const players = team.playerIds.map(playerById).filter(Boolean);
  const total = players.reduce((sum, player) => sum + Number(player.rating), 0);
  const avg = players.length ? Math.round(total / players.length) : 0;
  const ageAvg = players.length
    ? Math.round(players.reduce((sum, player) => sum + Number(player.age), 0) / players.length)
    : 0;
  return { players, total, avg, ageAvg, breakdown: positionBreakdown(players) };
}

function computePlayerStats(playerId) {
  const stats = {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    goals: 0,
    assists: 0,
    saves: 0,
    cleanSheets: 0,
    averageRating: 0
  };

  const player = playerById(playerId);
  if (!player) return stats;

  state.games.forEach((game) => {
    const team = game.teams.find((entry) => entry.playerIds.includes(playerId));
    if (!team) return;
    stats.gamesPlayed++;
    if (game.winningTeamId === team.id) stats.wins++;
    else if (game.winningTeamId) stats.losses++;
    const row = game.playerStats[playerId] || {};
    stats.goals += Number(row.goals || 0);
    stats.assists += Number(row.assists || 0);
    stats.saves += Number(row.saves || 0);
    stats.cleanSheets += row.cleanSheet ? 1 : 0;
  });

  const history = player.ratingHistory || [];
  stats.averageRating = history.length
    ? Math.round(history.reduce((sum, item) => sum + Number(item.rating), 0) / history.length)
    : player.rating;
  return stats;
}

function navButton(id, label) {
  return `<button class="${state.view === id ? "active" : ""}" data-view="${id}">${label}</button>`;
}

async function refreshSharedState() {
  const result = await apiRequest("/api/state");
  apiAvailable = true;
  currentUser = result.user;
  state = normalizeState({
    ...seedState,
    ...result.state,
    accessRole: currentUser?.role === "admin" ? "admin" : "player",
    selectedPlayerId: currentUser?.playerId || result.state.selectedPlayerId || seedState.selectedPlayerId
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
}

function renderLogin() {
  document.getElementById("app").innerHTML = `
    <main class="login-page">
      <section class="login-panel">
        <div class="brand-mark">Sunday Soccer</div>
        <h1>Sign in</h1>
        <p class="muted">Admin manages the roster and teams. Players can mark IN or OUT for Sunday.</p>
        <form id="loginForm" class="grid">
          <label>Email<input name="email" type="email" required autocomplete="username" value="admin@sundaysoccer.local" /></label>
          <label>Password<input name="password" type="password" required autocomplete="current-password" /></label>
          <button type="submit">Enter app</button>
          <div class="notice">Admin default: admin@sundaysoccer.local / sunday-admin. Admin can create player logins from Player Pool.</div>
        </form>
      </section>
    </main>
  `;
  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify({ email: data.email, password: data.password })
      });
      currentUser = result.user;
      state.accessRole = currentUser.role === "admin" ? "admin" : "player";
      if (currentUser.playerId) state.selectedPlayerId = currentUser.playerId;
      await refreshSharedState();
    } catch (error) {
      alert(error.message || "Could not sign in.");
    }
  });
}

function layout(content, title, actions = "") {
  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <strong>Sunday Soccer</strong>
          <span>Pickup manager MVP</span>
        </div>
        <nav class="nav">
          ${navButton("dashboard", "Dashboard")}
          ${navButton("availability", "Availability")}
          ${navButton("players", "Player Pool")}
          ${navButton("teams", "Create Teams")}
          ${navButton("score", "Game Day")}
          ${navButton("history", "Game History")}
          ${navButton("profile", "Player Profile")}
        </nav>
      </aside>
      <main class="main">
        <div class="topbar">
          <div>
            <h1>${title}</h1>
            <div class="muted">${activePlayers().length} active players | ${state.games.length} saved games</div>
          </div>
          <div class="actions">
            <span class="role-badge ${isAdmin() ? "admin" : "viewer"}">${isAdmin() ? "Admin" : "Player"}</span>
            ${actions}
            <button class="secondary" id="logoutButton">Log out</button>
          </div>
        </div>
        ${isAdmin() ? "" : `<div class="notice access-notice">Player mode: mark your Sunday availability and view roster, teams, stats, and history. Editing and team creation are admin-only.</div>`}
        ${content}
      </main>
    </div>
  `;
  bindGlobalEvents();
}

function bindGlobalEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setState({ view: button.dataset.view }));
  });
  document.getElementById("logoutButton")?.addEventListener("click", async () => {
    if (apiAvailable) await apiRequest("/api/logout", { method: "POST" }).catch(() => {});
    currentUser = null;
    setState({ accessRole: "" });
  });
}

function renderDashboard() {
  const players = state.players;
  const active = activePlayers();
  const latestGame = state.games.at(-1);
  const topScorers = players
    .map((player) => ({ player, stats: computePlayerStats(player.id) }))
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 5);

  layout(`
    <section class="grid four">
      <div class="card stat"><span class="muted">Total players</span><b>${players.length}</b></div>
      <div class="card stat"><span class="muted">Active pool</span><b>${active.length}</b></div>
      <div class="card stat"><span class="muted">Average rating</span><b>${active.length ? Math.round(active.reduce((sum, p) => sum + p.rating, 0) / active.length) : 0}</b></div>
      <div class="card stat"><span class="muted">Games saved</span><b>${state.games.length}</b></div>
    </section>
    <section class="grid two" style="margin-top:14px">
      <div class="panel">
        <div class="section-head"><h2>Latest Game</h2><button class="small secondary" data-view="score">New score sheet</button></div>
        ${latestGame ? renderGameSummary(latestGame) : `<div class="notice">No games saved yet. Create teams, then record your first Sunday score sheet.</div>`}
      </div>
      <div class="panel">
        <div class="section-head"><h2>Top Scorers</h2><button class="small secondary" data-view="profile">Profiles</button></div>
        <div class="history-list">
          ${topScorers.map(({ player, stats }) => `
            <div class="history-item">
              <strong>${escapeHtml(player.name)}</strong>
              <span class="pill green">${stats.goals} goals</span>
              <span class="pill blue">${stats.assists} assists</span>
              <span class="pill gray">${stats.gamesPlayed} games</span>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
    ${isAdmin() ? `
      <section class="panel" style="margin-top:14px">
        <div class="section-head"><h2>Admin Data Tools</h2><span class="muted">Use this to turn your edited roster into shared seed data.</span></div>
        <div class="actions">
          <button id="exportDataButton">Export current data</button>
          <label class="file-button secondary">Import data<input id="importDataInput" type="file" accept="application/json" /></label>
        </div>
        <p class="muted">After you finish entering the real player pool, export the JSON and send it here. I can bake it into the app so teammates see that roster when they open the link.</p>
        <div id="exportOutput" class="export-output" hidden>
          <div class="section-head"><h3>Export Ready</h3><a id="downloadExportLink" class="download-link" href="#">Download JSON</a></div>
          <textarea id="exportJson" readonly></textarea>
          <p class="muted">If the download does not start, copy everything in this box and send it here.</p>
        </div>
      </section>
    ` : ""}
  `, "Dashboard");

  document.getElementById("exportDataButton")?.addEventListener("click", exportCurrentData);
  document.getElementById("importDataInput")?.addEventListener("change", (event) => {
    importCurrentData(event.target.files?.[0]);
  });
}

function availabilityCounts(availability = availabilityCache) {
  const responses = availability?.responses || {};
  return activePlayers().reduce((counts, player) => {
    const status = responses[player.id]?.status || "unknown";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, { in: 0, out: 0, unknown: 0 });
}

function renderAvailability() {
  const counts = availabilityCounts();
  layout(`
    <section class="grid four">
      <div class="card stat"><span class="muted">Next Sunday</span><b>${availabilityCache?.date || "Loading"}</b></div>
      <div class="card stat"><span class="muted">IN</span><b id="availabilityIn">${counts.in || 0}</b></div>
      <div class="card stat"><span class="muted">OUT</span><b id="availabilityOut">${counts.out || 0}</b></div>
      <div class="card stat"><span class="muted">No reply</span><b id="availabilityUnknown">${counts.unknown || activePlayers().length}</b></div>
    </section>
    <section class="panel" style="margin-top:14px">
      <div class="section-head">
        <h2>Sunday Availability</h2>
        ${isAdmin() ? `<button class="small secondary" id="resetAvailability">Reset Sunday RSVPs</button>` : ""}
      </div>
      <div id="availabilityContent" class="history-list">
        <div class="notice">Loading shared availability...</div>
      </div>
    </section>
  `, "Availability");

  document.getElementById("resetAvailability")?.addEventListener("click", async () => {
    if (!requireAdmin()) return;
    await apiRequest("/api/availability/reset", { method: "POST" });
    await loadAvailability();
  });
  loadAvailability();
}

async function loadAvailability() {
  try {
    const result = await apiRequest("/api/availability");
    availabilityCache = result.availability;
    renderAvailabilityRows();
  } catch (error) {
    document.getElementById("availabilityContent").innerHTML = `<div class="notice">Could not load availability. ${escapeHtml(error.message)}</div>`;
  }
}

function renderAvailabilityRows() {
  const content = document.getElementById("availabilityContent");
  if (!content || !availabilityCache) return;
  const counts = availabilityCounts();
  document.getElementById("availabilityIn").textContent = counts.in || 0;
  document.getElementById("availabilityOut").textContent = counts.out || 0;
  document.getElementById("availabilityUnknown").textContent = counts.unknown || 0;
  const responses = availabilityCache.responses || {};
  const playerRows = activePlayers().map((player) => {
    const response = responses[player.id] || { status: "unknown", note: "" };
    const canEdit = isAdmin() || currentUser?.playerId === player.id;
    return `
      <div class="availability-row">
        <div>
          <strong>${escapeHtml(player.name)}</strong>
          <span class="pill ${response.status === "in" ? "green" : response.status === "out" ? "red" : "gray"}">${response.status === "unknown" ? "No reply" : response.status.toUpperCase()}</span>
          ${response.note ? `<div class="muted">${escapeHtml(response.note)}</div>` : ""}
        </div>
        <div class="actions">
          ${canEdit ? `
            <button class="small" data-rsvp="${player.id}" data-status="in">IN</button>
            <button class="small danger" data-rsvp="${player.id}" data-status="out">OUT</button>
            <button class="small secondary" data-rsvp="${player.id}" data-status="unknown">Clear</button>
          ` : ""}
        </div>
      </div>
    `;
  }).join("");
  content.innerHTML = playerRows;
  document.querySelectorAll("[data-rsvp]").forEach((button) => {
    button.addEventListener("click", async () => {
      await apiRequest("/api/availability", {
        method: "POST",
        body: JSON.stringify({ playerId: button.dataset.rsvp, status: button.dataset.status, note: "" })
      });
      await loadAvailability();
    });
  });
}

function renderPlayers() {
  layout(`
    ${isAdmin() ? `<section class="panel">
      <div class="section-head"><h2>Add or Edit Player</h2><button id="resetPlayers" class="small secondary">Reset sample data</button></div>
      <form id="playerForm" class="form-grid">
        <input type="hidden" name="id" />
        <label>Name<input name="name" required /></label>
        <label>Age<input name="age" type="number" min="1" max="90" required /></label>
        <label>Primary position<select name="primaryPosition">${positions.map(optionHtml).join("")}</select></label>
        <label>Secondary position<select name="secondaryPosition"><option value="">None</option>${positions.map(optionHtml).join("")}</select></label>
        <label>Rating<input name="rating" type="number" min="1" max="100" required /></label>
        <label>Active<select name="active"><option value="true">Active</option><option value="false">Inactive</option></select></label>
        <div class="wide attribute-editor">
          <div class="section-head">
            <h3>Player login</h3>
            <span class="muted">Optional account for RSVP access</span>
          </div>
          <div class="attribute-inputs">
            <label>Login email<input name="loginEmail" type="email" placeholder="player@email.com" autocomplete="off" /></label>
            <label>Temporary password<input name="loginPassword" type="text" placeholder="Give this to the player" autocomplete="off" /></label>
          </div>
        </div>
        <div class="wide attribute-editor">
          <div class="section-head">
            <h3>FIFA-style attributes</h3>
            <button type="button" class="small secondary" id="useAttributeAverage">Use average as rating</button>
          </div>
          <div class="attribute-inputs" id="playerAttributeInputs"></div>
        </div>
        <label class="wide">Notes<textarea name="notes"></textarea></label>
        <div class="actions wide">
          <button type="submit">Save player</button>
          <button type="button" class="secondary" id="clearPlayerForm">Clear</button>
        </div>
      </form>
    </section>` : ""}
    <section class="panel" style="margin-top:14px">
      <div class="toolbar">
        <label>Search<input id="playerSearch" placeholder="Name, position, notes" /></label>
        <label>Status<select id="statusFilter"><option value="all">All</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
        <label>Position<select id="positionFilter"><option value="all">All</option>${positions.map(optionHtml).join("")}</select></label>
        <button class="secondary" id="clearFilters">Clear</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Name</th><th>Age</th><th>Positions</th><th>Rating</th><th>Attributes</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
        <tbody id="playerRows"></tbody>
      </table></div>
    </section>
  `, "Player Pool");

  const form = document.getElementById("playerForm");
  const renderRows = () => {
    const q = document.getElementById("playerSearch").value.toLowerCase();
    const status = document.getElementById("statusFilter").value;
    const position = document.getElementById("positionFilter").value;
    const filtered = state.players.filter((player) => {
      const text = `${player.name} ${player.primaryPosition} ${player.secondaryPosition} ${player.notes}`.toLowerCase();
      return text.includes(q)
        && (status === "all" || String(player.active) === String(status === "active"))
        && (position === "all" || player.primaryPosition === position || player.secondaryPosition === position);
    });
    document.getElementById("playerRows").innerHTML = filtered.map((player) => `
      <tr>
        <td><strong>${escapeHtml(player.name)}</strong></td>
        <td>${player.age}</td>
        <td>${player.primaryPosition}${player.secondaryPosition ? ` / ${player.secondaryPosition}` : ""}</td>
        <td><span class="pill blue">${player.rating}</span></td>
        <td>${renderAttributePills(player.attributes, player.primaryPosition)}</td>
        <td><span class="pill ${player.active ? "green" : "gray"}">${player.active ? "Active" : "Inactive"}</span></td>
        <td>${escapeHtml(player.notes)}</td>
        <td class="actions">${isAdmin() ? `
          <button class="small secondary" data-edit-player="${player.id}">Edit</button>
          <button class="small danger" data-delete-player="${player.id}">Delete</button>
        ` : `<span class="muted">Read-only</span>`}</td>
      </tr>
    `).join("");

    document.querySelectorAll("[data-edit-player]").forEach((button) => {
      button.addEventListener("click", () => fillPlayerForm(playerById(button.dataset.editPlayer)));
    });
    document.querySelectorAll("[data-delete-player]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!requireAdmin()) return;
        const players = state.players.filter((player) => player.id !== button.dataset.deletePlayer);
        setState({ players });
      });
    });
  };

  if (!isAdmin()) {
    ["playerSearch", "statusFilter", "positionFilter"].forEach((id) => {
      document.getElementById(id).addEventListener("input", renderRows);
    });
    document.getElementById("clearFilters").addEventListener("click", () => {
      document.getElementById("playerSearch").value = "";
      document.getElementById("statusFilter").value = "all";
      document.getElementById("positionFilter").value = "all";
      renderRows();
    });
    renderRows();
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!requireAdmin()) return;
    const data = Object.fromEntries(new FormData(form));
    const existing = data.id ? playerById(data.id) : null;
    const currentAttributeKeys = getAttributeKeys(data.primaryPosition);
    const attributes = Object.fromEntries(currentAttributeKeys.map((key) => [key, clampAttributeValue(key, data[key])]));
    const rating = clampRating(data.rating);
    const player = {
      id: data.id || crypto.randomUUID(),
      name: data.name.trim(),
      age: Number(data.age),
      primaryPosition: data.primaryPosition,
      secondaryPosition: data.secondaryPosition,
      rating,
      attributes,
      notes: data.notes.trim(),
      active: data.active === "true",
      ratingHistory: existing?.ratingHistory || [{ date: today(), rating, note: "Initial rating" }],
      createdOrder: existing?.createdOrder ?? state.players.length
    };
    if (existing && Number(existing.rating) !== rating) {
      player.ratingHistory = [...player.ratingHistory, { date: today(), rating, note: "Manual rating edit" }];
    }
    const players = existing
      ? state.players.map((entry) => entry.id === player.id ? player : entry)
      : [...state.players, player];
    state.players = players;
    saveState();
    if (data.loginEmail && data.loginPassword) {
      try {
        await apiRequest("/api/users/player", {
          method: "POST",
          body: JSON.stringify({ playerId: player.id, email: data.loginEmail, password: data.loginPassword })
        });
      } catch (error) {
        alert(`Player saved, but login was not saved: ${error.message}`);
      }
    }
    form.reset();
    renderRows();
  });

  document.getElementById("clearPlayerForm").addEventListener("click", () => {
    form.reset();
    form.elements.primaryPosition.value = "Midfielder";
    renderAttributeInputs("Midfielder", form);
    fillAttributeInputs(buildDefaultAttributes(70, "Midfielder"), form);
  });
  document.getElementById("resetPlayers").addEventListener("click", () => {
    if (!requireAdmin()) return;
    setState({ ...seedState, accessRole: state.accessRole });
  });
  document.getElementById("useAttributeAverage").addEventListener("click", () => {
    const keys = getAttributeKeys(form.elements.primaryPosition.value);
    form.elements.rating.value = attributeAverage({ primaryPosition: form.elements.primaryPosition.value, ...Object.fromEntries(keys.map((key) => [key, form.elements[key].value])) });
  });
  form.elements.primaryPosition.addEventListener("change", () => {
    renderAttributeInputs(form.elements.primaryPosition.value, form);
    fillAttributeInputs(buildDefaultAttributes(form.elements.rating.value || 70, form.elements.primaryPosition.value), form);
  });
  form.elements.rating.addEventListener("input", () => {
    if (!form.elements.id.value) fillAttributeInputs(buildDefaultAttributes(form.elements.rating.value || 70, form.elements.primaryPosition.value), form);
  });
  ["playerSearch", "statusFilter", "positionFilter"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderRows);
  });
  document.getElementById("clearFilters").addEventListener("click", () => {
    document.getElementById("playerSearch").value = "";
    document.getElementById("statusFilter").value = "all";
    document.getElementById("positionFilter").value = "all";
    renderRows();
  });
  renderRows();
  form.elements.primaryPosition.value = "Midfielder";
  renderAttributeInputs("Midfielder", form);
  fillAttributeInputs(buildDefaultAttributes(70, "Midfielder"), form);
}

function fillPlayerForm(player) {
  const form = document.getElementById("playerForm");
  const normalized = normalizePlayer(player);
  Object.entries(player).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value;
  });
  renderAttributeInputs(normalized.primaryPosition, form);
  fillAttributeInputs(normalized.attributes, form);
  form.elements.active.value = String(player.active);
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fillAttributeInputs(attributes, form = document.getElementById("playerForm")) {
  const keys = getAttributeKeys(form?.elements?.primaryPosition?.value || "");
  keys.forEach((key) => {
    if (form?.elements[key]) form.elements[key].value = clampAttributeValue(key, attributes?.[key]);
  });
}

function renderAttributeInputs(primaryPosition, form = document.getElementById("playerForm")) {
  const container = document.getElementById("playerAttributeInputs");
  if (!container) return;
  const keys = getAttributeKeys(primaryPosition);
  const labels = getAttributeLabels(primaryPosition);
  container.innerHTML = keys.map((key) => {
    if (starAttributeKeys.includes(key)) {
      return `<label>${labels[key]}<select name="${key}" required>${[1, 2, 3, 4, 5].map((value) => `<option value="${value}">${value} / 5</option>`).join("")}</select></label>`;
    }
    return `<label>${labels[key]}<input name="${key}" type="number" min="1" max="100" required /></label>`;
  }).join("");
}

function renderAttributePills(attributes, primaryPosition = "") {
  const safeAttributes = attributes || {};
  const keys = getAttributeKeys(primaryPosition);
  const shortLabels = getAttributeShortLabels(primaryPosition);
  return `<div class="attribute-pills">${keys.map((key) => {
    const value = clampAttributeValue(key, safeAttributes[key]);
    return `<span class="pill gray">${shortLabels[key]} ${starAttributeKeys.includes(key) ? `${value}/5` : value}</span>`;
  }).join("")}</div>`;
}

function optionHtml(value) {
  return `<option value="${value}">${value}</option>`;
}

function renderTeams() {
  layout(`
    ${isAdmin() ? `<section class="panel">
      <form id="teamForm" class="form-grid">
        <label>Number of teams<input name="teamCount" type="number" min="2" max="6" value="${state.lastTeamSettings?.teamCount || 2}" /></label>
        <label>Players per team<input name="playersPerTeam" type="number" min="2" max="12" value="11" /></label>
        <label class="wide"><span><input name="separateGks" type="checkbox" ${state.lastTeamSettings?.separateGks === false ? "" : "checked"} style="width:auto" /> Separate goalkeepers evenly</span></label>
        <div class="actions wide">
          <button type="submit">Create balanced teams</button>
          <button type="button" id="reshuffle" class="secondary" ${state.generatedTeams.length ? "" : "disabled"}>Reshuffle</button>
        </div>
      </form>
    </section>` : ""}
    <section style="margin-top:14px">
      ${state.generatedTeams.length ? renderTeamBoard(state.generatedTeams) : `<div class="notice">${isAdmin() ? "Generate teams from the active player pool. You can drag players between teams after creation." : "No generated teams are available in this browser yet."}</div>`}
    </section>
  `, "Create Teams");

  if (!isAdmin()) return;

  document.getElementById("teamForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAdmin()) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const settings = {
      teamCount: Number(data.teamCount),
      playersPerTeam: Number(data.playersPerTeam),
      separateGks: Boolean(data.separateGks)
    };
    setState({ lastTeamSettings: settings, generatedTeams: createBalancedTeams(settings, state.shuffleCount + 1), shuffleCount: state.shuffleCount + 1 });
  });

  document.getElementById("reshuffle").addEventListener("click", () => {
    if (!requireAdmin()) return;
    const settings = state.lastTeamSettings || { teamCount: 2, playersPerTeam: 11, separateGks: true };
    setState({ generatedTeams: createBalancedTeams(settings, state.shuffleCount + 1), shuffleCount: state.shuffleCount + 1 });
  });
  bindDragAndDrop();
}

function createBalancedTeams(settings, salt) {
  const needed = settings.teamCount * settings.playersPerTeam;
  const pool = activePlayers()
    .slice()
    .sort((a, b) => b.rating - a.rating || seededSort(a.id, b.id, salt))
    .slice(0, needed);
  const teams = Array.from({ length: settings.teamCount }, (_, index) => ({
    id: crypto.randomUUID(),
    name: `Team ${index + 1}`,
    playerIds: []
  }));

  if (settings.separateGks) {
    const gks = pool.filter((player) => player.primaryPosition === "GK" || player.secondaryPosition === "GK");
    gks.slice(0, settings.teamCount).forEach((player, index) => {
      teams[index].playerIds.push(player.id);
    });
  }

  const assigned = new Set(teams.flatMap((team) => team.playerIds));
  const remaining = pool.filter((player) => !assigned.has(player.id));
  remaining.sort((a, b) => b.rating - a.rating || seededSort(a.id, b.id, salt));

  remaining.forEach((player) => {
    const candidates = teams.filter((team) => team.playerIds.length < settings.playersPerTeam);
    candidates.sort((a, b) => teamBalanceScore(a, player) - teamBalanceScore(b, player));
    candidates[0]?.playerIds.push(player.id);
  });

  return teams;
}

function teamBalanceScore(team, player) {
  const metrics = teamMetrics(team);
  const positionCount = metrics.players.filter((entry) => entry.primaryPosition === player.primaryPosition).length;
  const agePenalty = metrics.players.length ? Math.abs(metrics.ageAvg - player.age) * 0.15 : 0;
  return metrics.total + positionCount * 8 + agePenalty;
}

function seededSort(a, b, salt) {
  return pseudoRandom(`${a}${salt}`) - pseudoRandom(`${b}${salt}`);
}

function pseudoRandom(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return hash / 4294967295;
}

function renderTeamBoard(teams) {
  return `<div class="team-board">${teams.map((team) => {
    const metrics = teamMetrics(team);
    return `
      <div class="card team-card" data-team-id="${team.id}">
        <div class="section-head"><h2>${team.name}</h2><span class="pill green">${metrics.players.length} players</span></div>
        <div class="team-meta">
          <div class="mini-stat"><span class="muted">Avg</span><b>${metrics.avg}</b></div>
          <div class="mini-stat"><span class="muted">Total</span><b>${metrics.total}</b></div>
          <div class="mini-stat"><span class="muted">Age</span><b>${metrics.ageAvg}</b></div>
        </div>
        <div class="muted">${metrics.breakdown}</div>
        <div class="roster">
          ${metrics.players.map((player) => `
            <div class="player-chip" draggable="true" data-player-id="${player.id}">
              <span><strong>${escapeHtml(player.name)}</strong><small> ${player.primaryPosition}${player.secondaryPosition ? ` / ${player.secondaryPosition}` : ""}</small></span>
              <span class="pill blue">${player.rating}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }).join("")}</div>`;
}

function bindDragAndDrop() {
  if (!isAdmin()) return;
  document.querySelectorAll(".player-chip").forEach((chip) => {
    chip.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", chip.dataset.playerId);
    });
  });
  document.querySelectorAll(".team-card").forEach((card) => {
    card.addEventListener("dragover", (event) => {
      event.preventDefault();
      card.classList.add("drag-over");
    });
    card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
    card.addEventListener("drop", (event) => {
      event.preventDefault();
      card.classList.remove("drag-over");
      const playerId = event.dataTransfer.getData("text/plain");
      const targetTeamId = card.dataset.teamId;
      const generatedTeams = state.generatedTeams.map((team) => ({
        ...team,
        playerIds: team.id === targetTeamId
          ? [...new Set([...team.playerIds.filter((id) => id !== playerId), playerId])]
          : team.playerIds.filter((id) => id !== playerId)
      }));
      setState({ generatedTeams });
    });
  });
}

function renderScoreSheet() {
  const teams = state.generatedTeams;
  const allTeamPlayers = teams.flatMap((team) => team.playerIds);
  if (!isAdmin()) {
    layout(`
      <section class="panel">
        <div class="notice">Viewer access can review saved game history and player stats, but score entry is admin-only.</div>
      </section>
    `, "Game Day Score Sheet");
    return;
  }
  layout(`
    ${teams.length ? "" : `<div class="notice">Create teams first, then return here to save a game day score sheet.</div>`}
    <form id="scoreForm" class="grid">
      <section class="panel">
        <div class="score-grid">
          <label>Date<input name="date" type="date" value="${today()}" /></label>
          ${teams.map((team, index) => `<label>${team.name} score<input name="score_${team.id}" type="number" min="0" value="${index === 0 ? 3 : 2}" /></label>`).join("")}
          <label>Winning team<select name="winningTeamId"><option value="">Draw/none</option>${teams.map((team) => `<option value="${team.id}">${team.name}</option>`).join("")}</select></label>
        </div>
      </section>
      <section class="panel">
        <div class="section-head"><h2>Player Stats</h2><span class="muted">Adjustment changes current rating and history.</span></div>
        <div class="table-wrap">
          <div class="stat-row header">
            <span>Player</span><span>Goals</span><span>Assists</span><span>Saves</span><span>Clean</span><span>Yellow</span><span>Red</span><span>Adjust</span>
          </div>
          ${allTeamPlayers.map((id) => {
            const player = playerById(id);
            return `<div class="stat-row">
              <span><strong>${escapeHtml(player.name)}</strong><br><small class="muted">${player.primaryPosition} | rating ${player.rating}</small></span>
              <input name="goals_${id}" type="number" min="0" value="0" />
              <input name="assists_${id}" type="number" min="0" value="0" />
              <input name="saves_${id}" type="number" min="0" value="0" />
              <input name="clean_${id}" type="checkbox" style="width:auto" />
              <input name="yellow_${id}" type="number" min="0" value="0" />
              <input name="red_${id}" type="number" min="0" value="0" />
              <select name="adjust_${id}">
                ${[-5,-4,-3,-2,-1,0,1,2,3,4,5].map((value) => `<option value="${value}" ${value === 0 ? "selected" : ""}>${value > 0 ? "+" : ""}${value}</option>`).join("")}
              </select>
            </div>
            <label style="margin:8px 0 12px 0">Notes for ${escapeHtml(player.name)}<input name="notes_${id}" placeholder="Optional player notes" /></label>`;
          }).join("")}
        </div>
      </section>
      <div class="actions"><button type="submit" ${teams.length ? "" : "disabled"}>Save game day</button></div>
    </form>
  `, "Game Day Score Sheet");

  document.getElementById("scoreForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAdmin()) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const date = data.date || today();
    const game = {
      id: crypto.randomUUID(),
      date,
      teams: teams.map((team) => ({
        ...team,
        score: Number(data[`score_${team.id}`] || 0)
      })),
      winningTeamId: data.winningTeamId,
      playerStats: {}
    };

    allTeamPlayers.forEach((id) => {
      const adjustment = Number(data[`adjust_${id}`] || 0);
      game.playerStats[id] = {
        goals: Number(data[`goals_${id}`] || 0),
        assists: Number(data[`assists_${id}`] || 0),
        saves: Number(data[`saves_${id}`] || 0),
        cleanSheet: Boolean(data[`clean_${id}`]),
        yellowCards: Number(data[`yellow_${id}`] || 0),
        redCards: Number(data[`red_${id}`] || 0),
        adjustment,
        notes: data[`notes_${id}`] || ""
      };
    });

    const players = state.players.map((player) => {
      const adjustment = game.playerStats[player.id]?.adjustment || 0;
      if (!adjustment) return player;
      const rating = clampRating(player.rating + adjustment);
      return {
        ...player,
        rating,
        ratingHistory: [...(player.ratingHistory || []), { date, rating, note: `Game adjustment ${adjustment > 0 ? "+" : ""}${adjustment}` }]
      };
    });

    setState({ players, games: [...state.games, game], view: "history" });
  });
}

function renderHistory() {
  layout(`
    <section class="panel">
      <div class="history-list">
        ${state.games.length ? state.games.slice().reverse().map(renderGameSummary).join("") : `<div class="notice">No game history yet.</div>`}
      </div>
    </section>
  `, "Game History");
}

function renderGameSummary(game) {
  const winner = game.teams.find((team) => team.id === game.winningTeamId);
  return `<div class="history-item">
    <div class="section-head">
      <h3>${game.date}</h3>
      <span class="pill ${winner ? "green" : "gray"}">${winner ? `${winner.name} won` : "Draw/none"}</span>
    </div>
    <div class="grid two">
      ${game.teams.map((team) => `<div><strong>${team.name}</strong>: ${team.score}<br><span class="muted">${team.playerIds.map((id) => playerById(id)?.name).filter(Boolean).join(", ")}</span></div>`).join("")}
    </div>
  </div>`;
}

function renderProfile() {
  const selected = playerById(state.selectedPlayerId) || state.players[0];
  const stats = selected ? computePlayerStats(selected.id) : {};
  const selectedAttributes = selected ? normalizePlayer(selected).attributes : {};
  const selectedAttributeKeys = selected ? getAttributeKeys(selected.primaryPosition) : attributeKeys;
  const selectedAttributeLabels = selected ? getAttributeLabels(selected.primaryPosition) : attributeLabels;
  layout(`
    <section class="profile-layout">
      <div class="panel">
        <label>Player<select id="profileSelect">${state.players.map((player) => `<option value="${player.id}" ${selected?.id === player.id ? "selected" : ""}>${escapeHtml(player.name)}</option>`).join("")}</select></label>
        ${selected ? `
          <div class="fifa-card">
            <div>
              <span class="muted">Overall</span>
              <strong>${selected.rating}</strong>
            </div>
            <div>
              <h2>${escapeHtml(selected.name)}</h2>
              <p>${selected.primaryPosition}${selected.secondaryPosition ? ` / ${selected.secondaryPosition}` : ""}</p>
            </div>
          </div>
          <div style="margin-top:14px">
            <h2>${escapeHtml(selected.name)}</h2>
            <p class="muted">${selected.age} years old | ${selected.primaryPosition}${selected.secondaryPosition ? ` / ${selected.secondaryPosition}` : ""}</p>
            <p>${escapeHtml(selected.notes || "No notes yet.")}</p>
            <span class="pill blue">Current rating ${selected.rating}</span>
            <span class="pill ${selected.active ? "green" : "gray"}">${selected.active ? "Active" : "Inactive"}</span>
          </div>
          <div class="attribute-bars">
            ${selectedAttributeKeys.map((key) => `
              <div class="attribute-bar">
                <span>${selectedAttributeLabels[key]}</span>
                <div class="bar-track"><div class="bar-fill" style="width:${starAttributeKeys.includes(key) ? selectedAttributes[key] * 20 : selectedAttributes[key]}%"></div></div>
                <strong>${starAttributeKeys.includes(key) ? `${selectedAttributes[key]}/5` : selectedAttributes[key]}</strong>
              </div>
            `).join("")}
          </div>
          ${isAdmin() ? `<form id="profileRatingForm" class="profile-rating-form">
            <label>Overall rating<input name="rating" type="number" min="1" max="100" value="${selected.rating}" /></label>
            ${selectedAttributeKeys.map((key) => {
              if (starAttributeKeys.includes(key)) {
                return `<label>${selectedAttributeLabels[key]}<select name="${key}">${[1, 2, 3, 4, 5].map((value) => `<option value="${value}" ${Number(selectedAttributes[key]) === value ? "selected" : ""}>${value} / 5</option>`).join("")}</select></label>`;
              }
              return `<label>${selectedAttributeLabels[key]}<input name="${key}" type="number" min="1" max="100" value="${selectedAttributes[key]}" /></label>`;
            }).join("")}
            <div class="actions wide">
              <button type="button" class="secondary" id="profileUseAverage">Use attribute average</button>
              <button type="submit">Save ratings</button>
            </div>
          </form>` : ""}
        ` : ""}
      </div>
      <div class="grid">
        <section class="grid four">
          <div class="card stat"><span class="muted">Games</span><b>${stats.gamesPlayed || 0}</b></div>
          <div class="card stat"><span class="muted">Wins</span><b>${stats.wins || 0}</b></div>
          <div class="card stat"><span class="muted">Goals</span><b>${stats.goals || 0}</b></div>
          <div class="card stat"><span class="muted">Assists</span><b>${stats.assists || 0}</b></div>
          <div class="card stat"><span class="muted">Saves</span><b>${stats.saves || 0}</b></div>
          <div class="card stat"><span class="muted">Clean sheets</span><b>${stats.cleanSheets || 0}</b></div>
          <div class="card stat"><span class="muted">Losses</span><b>${stats.losses || 0}</b></div>
          <div class="card stat"><span class="muted">Avg rating</span><b>${stats.averageRating || 0}</b></div>
        </section>
        <section class="panel">
          <div class="section-head"><h2>Rating History</h2></div>
          <div class="rating-history">
            ${(selected?.ratingHistory || []).map((item) => `
              <div class="history-bar">
                <span>${item.date}</span>
                <div class="bar-track"><div class="bar-fill" style="width:${item.rating}%"></div></div>
                <strong>${item.rating}</strong>
              </div>
            `).join("")}
          </div>
        </section>
      </div>
    </section>
  `, "Player Stats/Profile");

  document.getElementById("profileSelect")?.addEventListener("change", (event) => {
    setState({ selectedPlayerId: event.target.value });
  });
  document.getElementById("profileUseAverage")?.addEventListener("click", () => {
    const form = document.getElementById("profileRatingForm");
    form.elements.rating.value = attributeAverage({ primaryPosition: selected.primaryPosition, ...Object.fromEntries(selectedAttributeKeys.map((key) => [key, form.elements[key].value])) });
  });
  document.getElementById("profileRatingForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAdmin()) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const rating = clampRating(data.rating);
    const attributes = Object.fromEntries(selectedAttributeKeys.map((key) => [key, clampAttributeValue(key, data[key])]));
    const players = state.players.map((player) => {
      if (player.id !== selected.id) return player;
      const ratingChanged = Number(player.rating) !== rating;
      return {
        ...player,
        rating,
        attributes,
        ratingHistory: ratingChanged
          ? [...(player.ratingHistory || []), { date: today(), rating, note: "Profile attribute edit" }]
          : player.ratingHistory
      };
    });
    setState({ players });
  });
}

function render() {
  if (!state.accessRole) {
    renderLogin();
    return;
  }
  const routes = {
    dashboard: renderDashboard,
    availability: renderAvailability,
    players: renderPlayers,
    teams: renderTeams,
    score: renderScoreSheet,
    history: renderHistory,
    profile: renderProfile
  };
  (routes[state.view] || renderDashboard)();
}

async function initApp() {
  try {
    const session = await apiRequest("/api/session");
    apiAvailable = true;
    currentUser = session.user;
    if (currentUser) {
      await refreshSharedState();
      return;
    }
    state = { ...state, accessRole: "" };
  } catch (error) {
    apiAvailable = false;
  }
  render();
}

initApp();
