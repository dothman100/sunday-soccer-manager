const STORAGE_KEY = "sunday-soccer-manager-v1";
const positions = ["GK", "Defender", "Midfielder", "Forward"];
const ADMIN_PASSCODE = "sunday-admin";
const VIEWER_PASSCODE = "soccer-viewer";
const attributeKeys = ["speed", "shooting", "defending", "passing", "weakFoot"];
const attributeLabels = {
  speed: "Speed",
  shooting: "Shooting",
  defending: "Defending",
  passing: "Passing",
  weakFoot: "Weak Foot"
};
const attributeShortLabels = {
  speed: "SPD",
  shooting: "SHO",
  defending: "DEF",
  passing: "PAS",
  weakFoot: "WF"
};

const seedPlayers = [
  ["Marco Silva", 31, "GK", "Defender", 86, "Vocal organizer, quick off line."],
  ["Andre King", 28, "Defender", "Midfielder", 78, "Reliable passer under pressure."],
  ["Sam Patel", 34, "Midfielder", "Defender", 82, "Controls tempo, strong stamina."],
  ["Luis Moreno", 24, "Forward", "Midfielder", 88, "Fast finisher, likes left channel."],
  ["Ben Carter", 39, "Defender", "", 72, "Physical, good in the air."],
  ["Omar Haddad", 27, "Midfielder", "Forward", 80, "Creative, high work rate."],
  ["Chris Nguyen", 22, "Forward", "", 76, "Direct runner."],
  ["David Ross", 45, "GK", "", 70, "Good hands, prefers shorter games."],
  ["Nico Alvarez", 29, "Midfielder", "Forward", 84, "Two-way engine."],
  ["Ethan Brooks", 33, "Defender", "GK", 75, "Can cover keeper if needed."],
  ["Jay Williams", 26, "Forward", "Midfielder", 81, "Strong shot from distance."],
  ["Ravi Singh", 37, "Defender", "Midfielder", 74, "Calm, smart positioning."],
  ["Tom Ellis", 30, "Midfielder", "", 69, "Simple passes, steady."],
  ["Alex Romero", 21, "Forward", "", 73, "Pacey, improving first touch."],
  ["Mike Johnson", 41, "Defender", "", 67, "Good communicator."],
  ["Diego Cruz", 32, "Midfielder", "Defender", 79, "Balanced all-around player."]
].map((p, index) => ({
  id: crypto.randomUUID(),
  name: p[0],
  age: p[1],
  primaryPosition: p[2],
  secondaryPosition: p[3],
  rating: p[4],
  attributes: buildDefaultAttributes(p[4], p[2]),
  notes: p[5],
  active: true,
  ratingHistory: [
    { date: "2026-05-17", rating: Math.max(1, p[4] - 2), note: "Seed baseline" },
    { date: "2026-05-31", rating: p[4], note: "Current seed rating" }
  ],
  createdOrder: index
}));

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
}

function setState(patch) {
  state = { ...state, ...patch };
  saveState();
  render();
}

function isAdmin() {
  return state.accessRole === "admin";
}

function requireAdmin() {
  if (isAdmin()) return true;
  alert("Viewer access is read-only. Log in as admin to make changes.");
  return false;
}

function exportCurrentData() {
  if (!requireAdmin()) return;
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "sunday-soccer-manager",
    version: 1,
    state: normalizeState(state)
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sunday-soccer-data-${today()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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

function attributeAverage(attributes) {
  const total = attributeKeys.reduce((sum, key) => sum + clampRating(attributes?.[key]), 0);
  return Math.round(total / attributeKeys.length);
}

function buildDefaultAttributes(rating, primaryPosition) {
  const base = clampRating(rating);
  const attributes = {
    speed: base,
    shooting: base,
    defending: base,
    passing: base,
    weakFoot: Math.max(35, base - 12)
  };
  if (primaryPosition === "GK" || primaryPosition === "Defender") {
    attributes.defending = clampRating(base + 8);
    attributes.shooting = clampRating(base - 8);
  }
  if (primaryPosition === "Forward") {
    attributes.shooting = clampRating(base + 8);
    attributes.defending = clampRating(base - 8);
  }
  if (primaryPosition === "Midfielder") {
    attributes.passing = clampRating(base + 7);
    attributes.speed = clampRating(base - 2);
  }
  return attributes;
}

function normalizePlayer(player) {
  const attributes = player.attributes || buildDefaultAttributes(player.rating, player.primaryPosition);
  return {
    ...player,
    attributes: Object.fromEntries(attributeKeys.map((key) => [key, clampRating(attributes[key] ?? player.rating)]))
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

function renderLogin() {
  document.getElementById("app").innerHTML = `
    <main class="login-page">
      <section class="login-panel">
        <div class="brand-mark">Sunday Soccer</div>
        <h1>Sign in</h1>
        <p class="muted">Choose admin for full control or viewer for read-only teammate access.</p>
        <form id="loginForm" class="grid">
          <label>Access level
            <select name="role">
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>Passcode<input name="passcode" type="password" required autocomplete="current-password" /></label>
          <button type="submit">Enter app</button>
          <div class="notice">Static MVP note: this is a simple front-end access gate. Use the upcoming database/auth version for real security.</div>
        </form>
      </section>
    </main>
  `;
  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const valid = (data.role === "admin" && data.passcode === ADMIN_PASSCODE)
      || (data.role === "viewer" && data.passcode === VIEWER_PASSCODE);
    if (!valid) {
      alert("That passcode does not match the selected access level.");
      return;
    }
    setState({ accessRole: data.role });
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
            <span class="role-badge ${isAdmin() ? "admin" : "viewer"}">${isAdmin() ? "Admin" : "Viewer"}</span>
            ${actions}
            <button class="secondary" id="logoutButton">Log out</button>
          </div>
        </div>
        ${isAdmin() ? "" : `<div class="notice access-notice">Viewer mode: you can view players, teams, stats, and history. Editing and team creation are admin-only.</div>`}
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
  document.getElementById("logoutButton")?.addEventListener("click", () => setState({ accessRole: "" }));
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
      </section>
    ` : ""}
  `, "Dashboard");

  document.getElementById("exportDataButton")?.addEventListener("click", exportCurrentData);
  document.getElementById("importDataInput")?.addEventListener("change", (event) => {
    importCurrentData(event.target.files?.[0]);
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
            <h3>FIFA-style attributes</h3>
            <button type="button" class="small secondary" id="useAttributeAverage">Use average as rating</button>
          </div>
          <div class="attribute-inputs">
            ${attributeKeys.map((key) => `<label>${attributeLabels[key]}<input name="${key}" type="number" min="1" max="100" required /></label>`).join("")}
          </div>
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
        <td>${renderAttributePills(player.attributes)}</td>
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

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAdmin()) return;
    const data = Object.fromEntries(new FormData(form));
    const existing = data.id ? playerById(data.id) : null;
    const attributes = Object.fromEntries(attributeKeys.map((key) => [key, clampRating(data[key])]));
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
    form.reset();
    renderRows();
  });

  document.getElementById("clearPlayerForm").addEventListener("click", () => {
    form.reset();
    fillAttributeInputs(buildDefaultAttributes(70, "Midfielder"), form);
  });
  document.getElementById("resetPlayers").addEventListener("click", () => {
    if (!requireAdmin()) return;
    setState({ ...seedState, accessRole: state.accessRole });
  });
  document.getElementById("useAttributeAverage").addEventListener("click", () => {
    form.elements.rating.value = attributeAverage(Object.fromEntries(attributeKeys.map((key) => [key, form.elements[key].value])));
  });
  form.elements.primaryPosition.addEventListener("change", () => {
    if (!form.elements.id.value) fillAttributeInputs(buildDefaultAttributes(form.elements.rating.value || 70, form.elements.primaryPosition.value), form);
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
  fillAttributeInputs(buildDefaultAttributes(70, "Midfielder"), form);
}

function fillPlayerForm(player) {
  const form = document.getElementById("playerForm");
  const normalized = normalizePlayer(player);
  Object.entries(player).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value;
  });
  fillAttributeInputs(normalized.attributes, form);
  form.elements.active.value = String(player.active);
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fillAttributeInputs(attributes, form = document.getElementById("playerForm")) {
  attributeKeys.forEach((key) => {
    if (form?.elements[key]) form.elements[key].value = clampRating(attributes?.[key]);
  });
}

function renderAttributePills(attributes) {
  const safeAttributes = attributes || {};
  return `<div class="attribute-pills">${attributeKeys.map((key) => `<span class="pill gray">${attributeShortLabels[key]} ${clampRating(safeAttributes[key])}</span>`).join("")}</div>`;
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
            ${attributeKeys.map((key) => `
              <div class="attribute-bar">
                <span>${attributeLabels[key]}</span>
                <div class="bar-track"><div class="bar-fill" style="width:${selectedAttributes[key]}%"></div></div>
                <strong>${selectedAttributes[key]}</strong>
              </div>
            `).join("")}
          </div>
          ${isAdmin() ? `<form id="profileRatingForm" class="profile-rating-form">
            <label>Overall rating<input name="rating" type="number" min="1" max="100" value="${selected.rating}" /></label>
            ${attributeKeys.map((key) => `<label>${attributeLabels[key]}<input name="${key}" type="number" min="1" max="100" value="${selectedAttributes[key]}" /></label>`).join("")}
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
    form.elements.rating.value = attributeAverage(Object.fromEntries(attributeKeys.map((key) => [key, form.elements[key].value])));
  });
  document.getElementById("profileRatingForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAdmin()) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const rating = clampRating(data.rating);
    const attributes = Object.fromEntries(attributeKeys.map((key) => [key, clampRating(data[key])]));
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
    players: renderPlayers,
    teams: renderTeams,
    score: renderScoreSheet,
    history: renderHistory,
    profile: renderProfile
  };
  (routes[state.view] || renderDashboard)();
}

render();
