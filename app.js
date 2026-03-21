const TEAM_DEFINITIONS = [
  { code: "CSK", name: "Chennai Super Kings", identity: "Powerplay Control", venue: "Chepauk spin control", colors: ["#f6d246", "#1f3256"] },
  { code: "MI", name: "Mumbai Indians", identity: "Star Core Explosiveness", venue: "Wankhede chase bias", colors: ["#58d4ff", "#0b2a70"] },
  { code: "RCB", name: "Royal Challengers Bengaluru", identity: "Pace and Launch Angles", venue: "High-scoring Chinnaswamy", colors: ["#ffbf4f", "#a50025"] },
  { code: "KKR", name: "Kolkata Knight Riders", identity: "Chaos and Matchups", venue: "Spin-to-pace handoff", colors: ["#c4a65a", "#341b5d"] },
  { code: "SRH", name: "Sunrisers Hyderabad", identity: "Volume Offense", venue: "Flat deck firepower", colors: ["#ffb15c", "#ef5b00"] },
  { code: "RR", name: "Rajasthan Royals", identity: "Top-Order Precision", venue: "Balanced with late seam", colors: ["#ff98bd", "#2042a7"] },
  { code: "GT", name: "Gujarat Titans", identity: "Balanced Match Control", venue: "Pace up front, grip late", colors: ["#9be4ff", "#112654"] },
  { code: "DC", name: "Delhi Capitals", identity: "Youth Burst and Wrist Spin", venue: "Pace-friendly start", colors: ["#57d1ff", "#0a2a88"] },
  { code: "LSG", name: "Lucknow Super Giants", identity: "Middle-Order Pressure", venue: "Slow surface matchup ball", colors: ["#77f7ff", "#0b4ea4"] },
  { code: "PBKS", name: "Punjab Kings", identity: "High Variance Shotmaking", venue: "Launchpad with dew", colors: ["#f6a4a4", "#b30d27"] }
];

const DEFAULT_IMPACT_PLAYERS = {
  RCB: ["Tim David", "Yash Dayal"],
  CSK: ["Sanju Samson", "Noor Ahmad"],
  MI: ["Rohit Sharma", "Trent Boult"],
  PBKS: ["Priyansh Arya", "Arshdeep Singh"],
  KKR: ["Angkrish Raghuvanshi", "Umran Malik"],
  DC: ["Prithvi Shaw", "Kuldeep Yadav"],
  RR: ["Vaibhav Suryavanshi", "Tushar Deshpande"],
  LSG: ["Aiden Markram", "Digvesh Rathi"],
  GT: ["Sai Sudharsan", "Prasidh Krishna"],
  SRH: ["Ishan Kishan", "Zeeshan Ansari"]
};

const CUSTOM_PLAYERS_STORAGE_KEY = "cricketsim.customPlayers";
const SAVE_STORAGE_VERSION = 1;
const SAVE_SLOT_COUNT = 3;
const SAVE_SLOT_PREFIX = "cricketsim.save.slot.";
const OFFSEASON_SALARY_CAP = 125;
const MAX_ROSTER_SIZE = 20;
const OFFSEASON_NEW_PLAYER_COUNT = 30;
const OFFSEASON_NEW_PLAYER_MIN_OVR = 64;
const OFFSEASON_NEW_PLAYER_MAX_OVR = 82;
const INDIAN_FIRST_NAMES = ["Aarav", "Aayush", "Aditya", "Akash", "Aniket", "Arjun", "Atharva", "Dev", "Dhruv", "Ishaan", "Karan", "Krish", "Manav", "Mayank", "Neel", "Nikhil", "Parth", "Pranav", "Raghav", "Rohan", "Sai", "Samarth", "Shivam", "Tanish", "Vedant", "Vihaan", "Yash", "Arnav", "Harsh", "Lakshya"];
const INDIAN_LAST_NAMES = ["Sharma", "Patel", "Singh", "Kumar", "Verma", "Reddy", "Iyer", "Nair", "Joshi", "Pillai", "Mehta", "Chopra", "Saxena", "Desai", "Kulkarni", "Bhat", "Pandey", "Dubey", "Gill", "Thakur", "Bisht", "Bora", "Mishra", "Jadeja", "Rana", "Rawat", "Pawar", "Tripathi", "Chaudhary", "Malhotra"];
const OVERSEAS_FIRST_NAMES = ["Oliver", "Harry", "Jack", "Thomas", "William", "Ben", "Noah", "Liam", "Ryan", "Sean", "Callum", "Finn", "Mitchell", "Jordan", "Corey", "Tristan", "Dewald", "Marco", "Kagiso", "Tendai", "Sikandar", "Rashid", "Babar", "Aiden", "Glenn", "Jason", "Nicholas", "Shai", "Joshua", "Sam"];
const OVERSEAS_LAST_NAMES = ["Smith", "Brown", "Taylor", "Anderson", "Miller", "Jones", "Clark", "Turner", "Campbell", "Morgan", "de Villiers", "van der Merwe", "Pretorius", "Coetzee", "Masakadza", "Ngarava", "Khan", "Afridi", "Shah", "Ali", "Williamson", "Phillips", "Chapman", "Allen", "Holder", "Joseph", "Lewis", "Neesham", "Conway", "Stirling"];

let teams = createEmptyTeams();
let openSimulatorHowToPlayStep = null;
let saveStatusState = { message: "Choose a slot to save or load your franchise.", tone: "neutral" };
let activeSaveSlot = null;

const state = {
  selectedTeam: "CSK",
  homeTeam: "CSK",
  awayTeam: "MI",
  franchiseTeam: "CSK",
  opponentTeam: "MI",
  ratingsFilter: "ALL",
  ratingsSort: "overall",
  seasonStat: "runs",
  seasonStatScope: "season",
  customOpponentMode: "league",
  customLeagueOpponent: "MI",
  matchLog: [],
  tickerLabel: "",
  tickerItems: [],
  lastCelebratedChampion: null,
  lastCelebratedTournamentMvp: null,
  lastSeasonLossChampion: null,
  season: resetSeason(),
  seasonHistory: [],
  draggedLineupIndex: null,
  selectedLineupSwap: null,
  lineupCardFlips: {},
  lineupCardViews: {},
  continueSimUnlocked: false,
  seasonYear: 2026,
  recordedAwardSeasonYear: null,
  offseason: null,
  tradeModal: {
    open: false,
    activeSlot: null
  },
  impactSubs: {},
  bowlingPlans: {},
  bowlingPlanValidationTeam: null,
  lineupValidationTeam: null,
  customSelections: {
    teamA: [],
    teamB: []
  },
  dataError: null
};

initApp();

function player(name, role, battingStyle, intent, composure, sixthArg, seventhArg = null, eighthArg = null, ninthArg = null, tenthArg = false, eleventhArg = false, twelfthArg = 78, thirteenthArg = 72) {
  if (typeof name === "object" && name !== null) {
    const row = name;
    const normalizedBowling = row.bowling === "" || row.bowling === undefined ? null : Number(row.bowling);
    const normalizedEcon = row.econ === "" || row.econ === undefined ? null : Number(row.econ);
    const normalizedWkts = row.wkts === "" || row.wkts === undefined ? null : Number(row.wkts);
    const { econ, wkts } = deriveBowlingTargets(normalizedBowling, normalizedEcon, normalizedWkts);

    const createdPlayer = player(
      row.playerName,
      row.sourceRole,
      row.battingStyle || (row.battingHand === "left" ? "LHB" : "RHB"),
      Number(row.intent),
      Number(row.composure),
      econ,
      wkts,
      row.bowlingType || (normalizedBowling && normalizedBowling > 25 ? "pacer" : "none"),
      row.bowlingHand || "none",
      toBoolean(row.opener),
      toBoolean(row.deathBowl),
      Number(row.fielding || 78),
      Number(row.leadership || 72)
    );
    createdPlayer.customId = row.customId || null;
    createdPlayer.isCustom = Boolean(row.customId || toBoolean(row.isCustom));
    createdPlayer.teamCode = row.teamCode || null;
    createdPlayer.age = Number(row.age) || null;
    createdPlayer.contract = row.contract === "" || row.contract === undefined ? null : Number(row.contract);
    createdPlayer.marketValue = createdPlayer.contract;
    return createdPlayer;
  }

  const econOverride = clamp(sixthArg ?? 25, 25, 99);
  const wktsOverride = clamp(seventhArg ?? 25, 25, 99);
  const bowlingRating = calculateBowlingRatingFromSkills(econOverride, wktsOverride);
  const fieldingRating = clamp(twelfthArg ?? 78, 70, 99);
  const leadershipRating = clamp(thirteenthArg ?? 72, 70, 99);

  const synthetic = buildSyntheticPlayerStats({
    intentTarget: intent,
    composureTarget: composure,
    econTarget: econOverride,
    wktsTarget: wktsOverride
  });
  return {
    name,
    role,
    battingStyle,
    battingHand: battingStyle === "LHB" ? "left" : "right",
    bowlingType: eighthArg || "none",
    bowlingHand: ninthArg || "none",
    opener: Boolean(tenthArg),
    deathBowl: Boolean(eleventhArg),
    fielding: fieldingRating,
    leadership: leadershipRating,
    customId: null,
    isCustom: false,
    teamCode: null,
    age: null,
    contract: null,
    marketValue: null,
    batting: synthetic.batting,
    bowling: synthetic.bowling,
    makePlayerTargets: {
      intent,
      composure,
      bowling: bowlingRating,
      econ: econOverride,
      wkts: wktsOverride,
      fielding: fieldingRating,
      leadership: leadershipRating
    }
  };
}

function deriveBowlingTargets(bowlingRating, econ, wkts) {
  if (econ !== null && wkts !== null) {
    return { econ, wkts };
  }

  const baseRating = clamp(bowlingRating ?? 25, 25, 99);
  return {
    econ: baseRating,
    wkts: baseRating
  };
}

function createEmptyTeams() {
  return TEAM_DEFINITIONS.map((team) => ({ ...team, players: [] }));
}

function deepCloneSerializable(value) {
  if (value === undefined) {
    return undefined;
  }
  return JSON.parse(JSON.stringify(value));
}

function getSaveSlotKey(slotNumber) {
  return `${SAVE_SLOT_PREFIX}${slotNumber}`;
}

function serializeRetainedMap(retainedMap = {}) {
  return Object.fromEntries(
    Object.entries(retainedMap).map(([teamCode, retainedIds]) => [teamCode, Array.from(retainedIds || [])])
  );
}

function hydrateRetainedMap(retainedMap = {}) {
  return Object.fromEntries(
    Object.entries(retainedMap).map(([teamCode, retainedIds]) => [teamCode, new Set(Array.isArray(retainedIds) ? retainedIds : [])])
  );
}

function serializeTeamForSave(team) {
  return {
    ...deepCloneSerializable({ ...team, teamRatings: undefined, attackProfile: undefined }),
    players: (team.players || []).map((playerData) => clonePlayer(playerData))
  };
}

function serializeTeamRef(team) {
  if (!team) {
    return null;
  }
  const definition = TEAM_DEFINITIONS.find((entry) => entry.code === team.code);
  return {
    code: team.code,
    name: team.name || definition?.name || team.code
  };
}

function hydrateTeamRef(teamRef) {
  if (!teamRef?.code) {
    return teamRef || null;
  }
  const definition = TEAM_DEFINITIONS.find((entry) => entry.code === teamRef.code);
  return {
    code: teamRef.code,
    name: teamRef.name || definition?.name || teamRef.code
  };
}

function serializeMatchResult(result) {
  if (!result) {
    return null;
  }
  return {
    ...deepCloneSerializable({
      ...result,
      home: undefined,
      away: undefined,
      winner: undefined
    }),
    home: serializeTeamRef(result.home),
    away: serializeTeamRef(result.away),
    winner: serializeTeamRef(result.winner)
  };
}

function hydrateMatchResult(result) {
  if (!result) {
    return null;
  }
  return {
    ...deepCloneSerializable(result),
    home: hydrateTeamRef(result.home),
    away: hydrateTeamRef(result.away),
    winner: hydrateTeamRef(result.winner)
  };
}

function serializeSeasonForSave(season) {
  if (!season) {
    return null;
  }
  return {
    ...deepCloneSerializable({
      ...season,
      table: undefined,
      schedule: undefined,
      featuredMatches: undefined,
      champion: undefined,
      playoffs: undefined
    }),
    table: (season.table || []).map((row) => ({
      wins: row.wins,
      losses: row.losses,
      points: row.points,
      netRunRate: row.netRunRate,
      teamCode: row.team?.code || row.teamCode
    })),
    schedule: (season.schedule || []).map((week) => ({
      ...deepCloneSerializable({ ...week, fixtures: undefined }),
      fixtures: (week.fixtures || []).map((fixture) => ({
        ...deepCloneSerializable({ ...fixture, result: undefined }),
        result: serializeMatchResult(fixture.result)
      }))
    })),
    featuredMatches: (season.featuredMatches || []).map((result) => serializeMatchResult(result)),
    champion: serializeTeamRef(season.champion),
    playoffs: season.playoffs
      ? {
          ...deepCloneSerializable({ ...season.playoffs, results: undefined }),
          results: Object.fromEntries(
            Object.entries(season.playoffs.results || {}).map(([key, result]) => [key, serializeMatchResult(result)])
          )
        }
      : null
  };
}

function hydrateSeasonFromSave(season) {
  if (!season) {
    return resetSeason();
  }
  return {
    ...deepCloneSerializable({ ...season, table: undefined, schedule: undefined, featuredMatches: undefined, playoffs: undefined, champion: undefined }),
    table: (season.table || []).map((row) => ({
      wins: row.wins,
      losses: row.losses,
      points: row.points,
      netRunRate: row.netRunRate,
      team: findTeam(row.teamCode) || hydrateTeamRef({ code: row.teamCode })
    })),
    schedule: (season.schedule || []).map((week) => ({
      ...deepCloneSerializable({ ...week, fixtures: undefined }),
      fixtures: (week.fixtures || []).map((fixture) => ({
        ...deepCloneSerializable({ ...fixture, result: undefined }),
        result: hydrateMatchResult(fixture.result)
      }))
    })),
    featuredMatches: (season.featuredMatches || []).map((result) => hydrateMatchResult(result)),
    champion: hydrateTeamRef(season.champion),
    playoffs: season.playoffs
      ? {
          ...deepCloneSerializable({ ...season.playoffs, results: undefined }),
          results: Object.fromEntries(
            Object.entries(season.playoffs.results || {}).map(([key, result]) => [key, hydrateMatchResult(result)])
          )
        }
      : null
  };
}

function serializeOffseasonForSave(offseason) {
  if (!offseason) {
    return null;
  }
  return {
    ...deepCloneSerializable({
      ...offseason,
      retainedMap: undefined,
      workingTeams: undefined,
      rookieClass: undefined,
      releasedPool: undefined,
      auctionPool: undefined,
      unsoldPool: undefined
    }),
    retainedMap: serializeRetainedMap(offseason.retainedMap),
    workingTeams: (offseason.workingTeams || []).map((team) => serializeTeamForSave(team)),
    rookieClass: (offseason.rookieClass || []).map((playerData) => clonePlayer(playerData)),
    releasedPool: (offseason.releasedPool || []).map((playerData) => clonePlayer(playerData)),
    auctionPool: (offseason.auctionPool || []).map((playerData) => clonePlayer(playerData)),
    unsoldPool: (offseason.unsoldPool || []).map((playerData) => clonePlayer(playerData))
  };
}

function serializeStateForSave() {
  return {
    selectedTeam: state.selectedTeam,
    homeTeam: state.homeTeam,
    awayTeam: state.awayTeam,
    franchiseTeam: state.franchiseTeam,
    opponentTeam: state.opponentTeam,
    ratingsFilter: state.ratingsFilter,
    ratingsSort: state.ratingsSort,
    seasonStat: state.seasonStat,
    seasonStatScope: state.seasonStatScope,
    customOpponentMode: state.customOpponentMode,
    customLeagueOpponent: state.customLeagueOpponent,
    matchLog: (state.matchLog || []).map((result) => serializeMatchResult(result)),
    tickerLabel: state.tickerLabel,
    tickerItems: (state.tickerItems || []).map((result) => serializeMatchResult(result)),
    lastCelebratedChampion: serializeTeamRef(state.lastCelebratedChampion),
    lastCelebratedTournamentMvp: state.lastCelebratedTournamentMvp,
    lastSeasonLossChampion: serializeTeamRef(state.lastSeasonLossChampion),
    season: serializeSeasonForSave(state.season),
    seasonHistory: deepCloneSerializable(state.seasonHistory),
    continueSimUnlocked: state.continueSimUnlocked,
    seasonYear: state.seasonYear,
    recordedAwardSeasonYear: state.recordedAwardSeasonYear,
    offseason: serializeOffseasonForSave(state.offseason),
    tradeModal: { open: false, activeSlot: null },
    impactSubs: deepCloneSerializable(state.impactSubs),
    bowlingPlans: deepCloneSerializable(state.bowlingPlans),
    bowlingPlanValidationTeam: state.bowlingPlanValidationTeam,
    lineupValidationTeam: state.lineupValidationTeam,
    customSelections: deepCloneSerializable(state.customSelections),
    teamLineups: deepCloneSerializable(state.teamLineups || {}),
    lineupCardViews: deepCloneSerializable(state.lineupCardViews || {})
  };
}

function buildSavePayload() {
  const franchise = findTeam(state.franchiseTeam);
  const phase = state.offseason?.phase || (state.season?.champion ? "season-complete" : "season");
  return {
    version: SAVE_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    meta: {
      franchiseTeam: state.franchiseTeam,
      franchiseName: franchise?.name || state.franchiseTeam,
      seasonYear: state.seasonYear,
      phase
    },
    customPlayerRows: loadCustomPlayerRows(),
    teams: teams.map((team) => serializeTeamForSave(team)),
    state: serializeStateForSave()
  };
}

function readSavePayload(storageKey) {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    console.warn("Could not read save from localStorage.", error);
    return null;
  }
}

function writeSavePayload(storageKey, payload) {
  window.localStorage.setItem(storageKey, JSON.stringify(payload));
}

function setSaveStatus(message, tone = "neutral") {
  saveStatusState = { message, tone };
  const status = document.getElementById("save-status");
  if (!status) {
    return;
  }
  status.textContent = message;
  status.classList.remove("is-error", "is-success");
  if (tone === "error") {
    status.classList.add("is-error");
  } else if (tone === "success") {
    status.classList.add("is-success");
  }
}

function formatSaveTimestamp(timestamp) {
  if (!timestamp) {
    return "Empty";
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }
  return date.toLocaleString();
}

function formatSavePhase(phase) {
  switch (phase) {
    case "retention":
      return "Offseason Retention";
    case "auction":
      return "Offseason Auction";
    case "trade":
      return "Offseason Trade";
    case "season-complete":
      return "Season Complete";
    default:
      return "In Season";
  }
}

function getSaveSummaryMarkup(payload) {
  const meta = payload?.meta || {};
  if (!payload) {
    return `<p class="save-slot-empty">No save stored in this slot yet.</p>`;
  }
  return `
    <p class="save-slot-meta">
      ${escapeHtml(meta.franchiseName || meta.franchiseTeam || "Franchise")}<br />
      Season ${escapeHtml(String(meta.seasonYear || "--"))} • ${escapeHtml(formatSavePhase(meta.phase))}<br />
      ${escapeHtml(formatSaveTimestamp(payload.savedAt))}
    </p>
  `;
}

function renderSavePanel() {
  const container = document.getElementById("save-slots");
  if (!container) {
    return;
  }

  const slotMarkup = Array.from({ length: SAVE_SLOT_COUNT }, (_, index) => {
    const slotNumber = index + 1;
    const payload = readSavePayload(getSaveSlotKey(slotNumber));
    const isActiveSlot = activeSaveSlot === slotNumber;
    return `
      <article class="save-slot">
        <div class="save-slot-header">
          <strong>Slot ${slotNumber}</strong>
          <span class="eyebrow">${isActiveSlot ? "Loaded" : payload ? "Saved" : "Open"}</span>
        </div>
        ${getSaveSummaryMarkup(payload)}
        <div class="save-slot-actions">
          <button class="ghost-btn" type="button" data-save-slot="${slotNumber}">Save</button>
          <button class="ghost-btn" type="button" data-load-slot="${slotNumber}" ${payload ? "" : "disabled"}>Load</button>
          <button class="ghost-btn" type="button" data-delete-slot="${slotNumber}" ${payload ? "" : "disabled"}>Clear</button>
        </div>
      </article>
    `;
  }).join("");

  container.innerHTML = slotMarkup;
  setSaveStatus(saveStatusState.message, saveStatusState.tone);

  container.querySelectorAll("[data-save-slot]").forEach((button) => {
    button.addEventListener("click", () => saveGameToSlot(Number(button.dataset.saveSlot)));
  });
  container.querySelectorAll("[data-load-slot]").forEach((button) => {
    button.addEventListener("click", () => loadGameFromSlot(Number(button.dataset.loadSlot)));
  });
  container.querySelectorAll("[data-delete-slot]").forEach((button) => {
    button.addEventListener("click", () => deleteSaveSlot(Number(button.dataset.deleteSlot)));
  });
}

function syncVisibleControlValues() {
  const franchiseSelect = document.getElementById("franchise-team-select");
  const opponentSelect = document.getElementById("opponent-team-select");
  const seasonStatSelect = document.getElementById("season-stat-select");
  const seasonStatScope = document.getElementById("season-stat-scope");
  const ratingsTeamFilter = document.getElementById("ratings-team-filter");
  const ratingsSort = document.getElementById("ratings-sort");
  const customLeagueOpponent = document.getElementById("league-opponent-select");

  if (franchiseSelect) franchiseSelect.value = state.franchiseTeam;
  if (opponentSelect) opponentSelect.value = state.opponentTeam;
  if (seasonStatSelect) seasonStatSelect.value = state.seasonStat;
  if (seasonStatScope) seasonStatScope.value = state.seasonStatScope;
  if (ratingsTeamFilter) ratingsTeamFilter.value = state.ratingsFilter;
  if (ratingsSort) ratingsSort.value = state.ratingsSort;
  if (customLeagueOpponent) customLeagueOpponent.value = state.customLeagueOpponent;
}

function hydrateSavedPlayer(playerData) {
  const restored = deepCloneSerializable(playerData) || {};
  restored.batting = restored.batting || { runs: [0, 0, 0], avg: [0, 0, 0], sr: [0, 0, 0] };
  restored.bowling = restored.bowling || { wkts: [0, 0, 0], eco: [0, 0, 0], avg: [0, 0, 0] };
  restored.makePlayerTargets = restored.makePlayerTargets || {
    intent: restored.ratings?.intent ?? 60,
    composure: restored.ratings?.composure ?? 60,
    econ: restored.ratings?.econ ?? 25,
    wkts: restored.ratings?.wkts ?? 25,
    fielding: restored.fielding ?? 78,
    leadership: restored.leadership ?? 72
  };
  restored.fielding = restored.fielding ?? restored.makePlayerTargets.fielding ?? 78;
  restored.leadership = restored.leadership ?? restored.makePlayerTargets.leadership ?? 72;
  restored.ratings = calculateRatings(restored);
  restored.roleProfile = inferRoleProfile(restored);
  restored.profile = inferPlayerProfile(restored);
  ensurePlayerRuntimeState(restored);
  return restored;
}

function hydrateSavedTeam(team) {
  const baseTeam = TEAM_DEFINITIONS.find((entry) => entry.code === team.code) || {};
  const players = (team.players || []).map((playerData) => {
    const restored = hydrateSavedPlayer(playerData);
    restored.teamCode = team.code;
    return restored;
  });
  return {
    ...baseTeam,
    ...deepCloneSerializable(team),
    players,
    teamRatings: calculateTeamRatings(players),
    attackProfile: buildAttackProfile(players)
  };
}

function hydrateSavedTeams(teamCollection) {
  return (teamCollection || []).map((team) => hydrateSavedTeam(team));
}

function hydrateSavedOffseason(offseason) {
  if (!offseason) {
    return null;
  }
  const restored = deepCloneSerializable(offseason);
  restored.workingTeams = hydrateSavedTeams(restored.workingTeams || []);
  restored.rookieClass = (restored.rookieClass || []).map((playerData) => hydrateSavedPlayer(playerData));
  restored.releasedPool = (restored.releasedPool || []).map((playerData) => hydrateSavedPlayer(playerData));
  restored.auctionPool = (restored.auctionPool || []).map((playerData) => hydrateSavedPlayer(playerData));
  restored.unsoldPool = (restored.unsoldPool || []).map((playerData) => hydrateSavedPlayer(playerData));
  restored.retainedMap = hydrateRetainedMap(restored.retainedMap || {});
  return restored;
}

function restoreSeasonTableReferences() {
  if (!state.season?.table?.length) {
    return;
  }
  state.season.table = state.season.table.map((row) => ({
    ...row,
    team: findTeam(row.team?.code) || row.team
  }));
}

function restoreLoadedState(payload) {
  if (!payload?.teams || !payload?.state) {
    throw new Error("Save file is missing team or state data.");
  }

  saveCustomPlayerRows(Array.isArray(payload.customPlayerRows) ? payload.customPlayerRows : []);
  teams = hydrateSavedTeams(payload.teams);

  const savedState = payload.state || {};
  Object.assign(state, {
    selectedTeam: savedState.selectedTeam || teams[0]?.code || "CSK",
    homeTeam: savedState.homeTeam || savedState.franchiseTeam || teams[0]?.code || "CSK",
    awayTeam: savedState.awayTeam || savedState.opponentTeam || teams[1]?.code || teams[0]?.code || "MI",
    franchiseTeam: savedState.franchiseTeam || teams[0]?.code || "CSK",
    opponentTeam: savedState.opponentTeam || teams[1]?.code || teams[0]?.code || "MI",
    ratingsFilter: savedState.ratingsFilter || "ALL",
    ratingsSort: savedState.ratingsSort || "overall",
    seasonStat: savedState.seasonStat || "runs",
    seasonStatScope: savedState.seasonStatScope || "season",
    customOpponentMode: savedState.customOpponentMode || "league",
    customLeagueOpponent: savedState.customLeagueOpponent || teams[1]?.code || teams[0]?.code || "MI",
    matchLog: (savedState.matchLog || []).map((result) => hydrateMatchResult(result)),
    tickerLabel: savedState.tickerLabel || "",
    tickerItems: (savedState.tickerItems || []).map((result) => hydrateMatchResult(result)),
    lastCelebratedChampion: hydrateTeamRef(savedState.lastCelebratedChampion || null),
    lastCelebratedTournamentMvp: savedState.lastCelebratedTournamentMvp || null,
    lastSeasonLossChampion: hydrateTeamRef(savedState.lastSeasonLossChampion || null),
    season: hydrateSeasonFromSave(savedState.season),
    seasonHistory: deepCloneSerializable(savedState.seasonHistory || []),
    draggedLineupIndex: null,
    selectedLineupSwap: null,
    lineupCardFlips: {},
    lineupCardViews: deepCloneSerializable(savedState.lineupCardViews || {}),
    continueSimUnlocked: Boolean(savedState.continueSimUnlocked),
    seasonYear: Number(savedState.seasonYear) || 2026,
    recordedAwardSeasonYear: savedState.recordedAwardSeasonYear ?? null,
    offseason: hydrateSavedOffseason(savedState.offseason),
    tradeModal: { open: false, activeSlot: null },
    impactSubs: deepCloneSerializable(savedState.impactSubs || {}),
    bowlingPlans: deepCloneSerializable(savedState.bowlingPlans || {}),
    bowlingPlanValidationTeam: savedState.bowlingPlanValidationTeam || null,
    lineupValidationTeam: savedState.lineupValidationTeam || null,
    customSelections: deepCloneSerializable(savedState.customSelections || buildDefaultCustomSelections()),
    dataError: null
  });
  state.teamLineups = deepCloneSerializable(savedState.teamLineups || {});

  teams.forEach((team) => {
    if (!Array.isArray(state.teamLineups[team.code]) || !state.teamLineups[team.code].length) {
      state.teamLineups[team.code] = team.players.map((playerData) => playerData.name);
    }
    if (!Array.isArray(state.impactSubs[team.code]) || state.impactSubs[team.code].length !== 2) {
      state.impactSubs[team.code] = getDefaultImpactSubNames(team.code);
    }
    if (!Array.isArray(state.bowlingPlans[team.code]) || state.bowlingPlans[team.code].length !== 20) {
      state.bowlingPlans[team.code] = buildDefaultBowlingPlan(team.code);
    }
  });
  syncFeaturedMatchToSeason();
  renderAll();
  syncVisibleControlValues();
}

function saveGameToSlot(slotNumber) {
  try {
    const existingPayload = readSavePayload(getSaveSlotKey(slotNumber));
    if (existingPayload && activeSaveSlot !== slotNumber) {
      setSaveStatus(`Load slot ${slotNumber} before overwriting it.`, "error");
      renderSavePanel();
      return;
    }
    const payload = buildSavePayload();
    writeSavePayload(getSaveSlotKey(slotNumber), payload);
    activeSaveSlot = slotNumber;
    setSaveStatus(`Saved to slot ${slotNumber}.`, "success");
  } catch (error) {
    console.error("Failed to save game to slot.", error);
    setSaveStatus("Could not save to that slot.", "error");
  }
  renderSavePanel();
}

function loadSavePayloadToRuntime(payload, successMessage = "Save loaded.", slotNumber = null) {
  restoreLoadedState(payload);
  activeSaveSlot = slotNumber;
  setSaveStatus(successMessage, "success");
  renderSavePanel();
  renderFeaturedResultMessage(successMessage);
}

function loadGameFromSlot(slotNumber) {
  try {
    const payload = readSavePayload(getSaveSlotKey(slotNumber));
    if (!payload) {
      setSaveStatus(`Slot ${slotNumber} is empty.`, "error");
      return;
    }
    if (!window.confirm(`Load slot ${slotNumber}? Your current unsaved progress will be replaced.`)) {
      return;
    }
    loadSavePayloadToRuntime(payload, `Loaded slot ${slotNumber}.`, slotNumber);
  } catch (error) {
    console.error("Failed to load save slot.", error);
    setSaveStatus("Could not load that save slot.", "error");
    renderSavePanel();
  }
}

function deleteSaveSlot(slotNumber) {
  try {
    if (!window.confirm(`Clear save slot ${slotNumber}?`)) {
      return;
    }
    window.localStorage.removeItem(getSaveSlotKey(slotNumber));
    if (activeSaveSlot === slotNumber) {
      activeSaveSlot = null;
    }
    setSaveStatus(`Cleared slot ${slotNumber}.`, "success");
  } catch (error) {
    console.error("Failed to clear save slot.", error);
    setSaveStatus("Could not clear that save slot.", "error");
  }
  renderSavePanel();
}

function exportCurrentSave() {
  try {
    const payload = buildSavePayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    const franchiseLabel = (state.franchiseTeam || "save").toLowerCase();
    link.href = URL.createObjectURL(blob);
    link.download = `cricketsim-${franchiseLabel}-season-${state.seasonYear}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    setSaveStatus("Exported current save.", "success");
  } catch (error) {
    console.error("Failed to export save.", error);
    setSaveStatus("Could not export the current save.", "error");
  }
  renderSavePanel();
}

function importSaveFile(file) {
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result || "{}"));
      if (!payload?.teams || !payload?.state) {
        throw new Error("This file does not look like a CricketSim save.");
      }
      loadSavePayloadToRuntime(payload, "Imported save loaded.", null);
    } catch (error) {
      console.error("Failed to import save.", error);
      setSaveStatus(error.message || "Could not import save.", "error");
      renderSavePanel();
    }
  };
  reader.readAsText(file);
}

async function initApp() {
  initHowToPlayModal();
  try {
    teams = await loadTeamsFromCsv();
    hydrateRatings();
    initializeStateFromTeams();
    initControls();
    renderAll();
  } catch (error) {
    console.error("Failed to initialize player database from CSV.", error);
    state.dataError = error;
    renderDataLoadError(error);
  }
}

async function fetchPlayersCsvText() {
  try {
    const response = await fetch("players2026.csv");
    if (!response.ok) {
      throw new Error(`Unable to load players2026.csv (${response.status})`);
    }
    return await response.text();
  } catch (error) {
    const fallbackCsv = window.PLAYERS_CSV_TEXT || "";
    if (!fallbackCsv) {
      throw error;
    }
    return fallbackCsv;
  }
}

async function loadTeamsFromCsv() {
  const csvText = await fetchPlayersCsvText();
  const rows = [
    ...parseCsv(csvText),
    ...loadCustomPlayerRows()
  ].map(normalizePlayerRow);
  const playersByTeam = new Map();

  rows.forEach((row) => {
    if (!playersByTeam.has(row.teamCode)) {
      playersByTeam.set(row.teamCode, []);
    }
    playersByTeam.get(row.teamCode).push(player(row));
  });

  return TEAM_DEFINITIONS.map((team) => ({
    ...team,
    players: playersByTeam.get(team.code) || []
  }));
}

function parseCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {});
  });
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === "\"") {
      if (insideQuotes && nextCharacter === "\"") {
        current += "\"";
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);
  return values;
}

function normalizePlayerRow(row) {
  const teamCode = row.teamCode || row.team || "";
  const playerName = row.playerName || row.name || "";
  const sourceRole = row.sourceRole || row.role || "";
  return {
    teamCode,
    playerName,
    sourceRole,
    team: teamCode,
    name: playerName,
    role: sourceRole,
    age: row.age === "" || row.age === undefined ? "" : String(row.age),
    contract: row.contract === "" || row.contract === undefined ? "" : String(row.contract),
    battingStyle: row.battingStyle || (row.battingHand === "left" ? "LHB" : "RHB"),
    battingHand: row.battingHand || (row.battingStyle === "LHB" ? "left" : "right"),
    bowlingType: row.bowlingType || "none",
    bowlingHand: row.bowlingHand || "none",
    opener: toBoolean(row.opener),
    deathBowl: toBoolean(row.deathBowl),
    intent: Number(row.intent),
    composure: Number(row.composure),
    bowling: row.bowling,
    econ: row.econ,
    wkts: row.wkts,
    fielding: Number(row.fielding || 78),
    leadership: Number(row.leadership || 72),
    customId: row.customId || null,
    isCustom: toBoolean(row.isCustom)
  };
}

function loadCustomPlayerRows() {
  try {
    const stored = window.localStorage.getItem(CUSTOM_PLAYERS_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Could not read custom players from localStorage.", error);
    return [];
  }
}

function initHowToPlayModal() {
  return;
}

function saveCustomPlayerRows(rows) {
  window.localStorage.setItem(CUSTOM_PLAYERS_STORAGE_KEY, JSON.stringify(rows));
}

function createCustomPlayerRow(teamCode) {
  const preview = buildMakePlayerPreviewData();
  const ratings = calculateRatings(preview);
  return {
    customId: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    isCustom: "TRUE",
    team: teamCode,
    teamCode,
    name: preview.name,
    playerName: preview.name,
    age: "",
    role: preview.role,
    sourceRole: preview.role,
    contract: "",
    battingStyle: preview.battingStyle,
    battingHand: preview.battingHand,
    bowlingType: preview.bowlingType,
    bowlingHand: preview.bowlingHand,
    opener: preview.opener ? "TRUE" : "FALSE",
    deathBowl: preview.deathBowl ? "TRUE" : "FALSE",
    intent: String(preview.makePlayerTargets.intent),
    composure: String(preview.makePlayerTargets.composure),
    bowling: String(ratings.bowling),
    econ: String(preview.makePlayerTargets.econ),
    wkts: String(preview.makePlayerTargets.wkts),
    fielding: String(preview.makePlayerTargets.fielding),
    leadership: String(preview.makePlayerTargets.leadership)
  };
}

function addCustomPlayerToRuntime(row) {
  const team = findTeam(row.teamCode);
  if (!team) {
    return;
  }
  const normalized = normalizePlayerRow(row);
  const customPlayer = player(normalized);
  ensurePlayerRuntimeState(customPlayer);
  customPlayer.teamCode = row.teamCode;
  customPlayer.contract = getFairMarketSalary(customPlayer);
  customPlayer.marketValue = customPlayer.contract;
  team.players = [...team.players, customPlayer];
  team.teamRatings = calculateTeamRatings(team.players);
  team.attackProfile = buildAttackProfile(team.players);
  if (!state.teamLineups?.[team.code]) {
    state.teamLineups[team.code] = team.players.map((playerData) => playerData.name);
  } else if (!state.teamLineups[team.code].includes(customPlayer.name)) {
    state.teamLineups[team.code] = [...state.teamLineups[team.code], customPlayer.name];
  }
}

function removeCustomPlayerFromRuntime(customId) {
  teams.forEach((team) => {
    const removedPlayers = team.players.filter((playerData) => playerData.customId === customId);
    if (!removedPlayers.length) {
      return;
    }
    const removedNames = new Set(removedPlayers.map((playerData) => playerData.name));
    team.players = team.players.filter((playerData) => playerData.customId !== customId);
    team.teamRatings = calculateTeamRatings(team.players);
    team.attackProfile = buildAttackProfile(team.players);
    if (state.teamLineups?.[team.code]) {
      state.teamLineups[team.code] = state.teamLineups[team.code].filter((name) => !removedNames.has(name));
    }
    if (state.impactSubs?.[team.code]) {
      state.impactSubs[team.code] = state.impactSubs[team.code].filter((name) => !removedNames.has(name));
      if (state.impactSubs[team.code].length < 2) {
        state.impactSubs[team.code] = getDefaultImpactSubNames(team.code);
      }
    }
    ["teamA", "teamB"].forEach((key) => {
      if (Array.isArray(state.customSelections?.[key])) {
        state.customSelections[key] = state.customSelections[key].filter((name) => !removedNames.has(name));
      }
    });
  });
}

function initializeStateFromTeams() {
  if (!teams.length || teams.some((team) => !team.players.length)) {
    throw new Error("Player data did not populate all teams from CSV.");
  }

  state.selectedTeam = findTeam(state.selectedTeam)?.code || teams[0].code;
  state.homeTeam = findTeam(state.homeTeam)?.code || teams[0].code;
  state.awayTeam = findTeam(state.awayTeam)?.code || teams[1]?.code || teams[0].code;
  state.franchiseTeam = findTeam(state.franchiseTeam)?.code || teams[0].code;
  state.opponentTeam = findTeam(state.opponentTeam)?.code || nextTeamCode(state.franchiseTeam);
  if (state.opponentTeam === state.franchiseTeam) {
    state.opponentTeam = nextTeamCode(state.franchiseTeam);
  }
  state.homeTeam = state.franchiseTeam;
  state.awayTeam = state.opponentTeam;
  state.selectedTeam = state.franchiseTeam;
  state.customLeagueOpponent = findTeam(state.customLeagueOpponent)?.code || teams[1]?.code || teams[0].code;
  refreshGeneratedContracts();
  state.recordedAwardSeasonYear = null;
  state.season = resetSeason();
  syncFeaturedMatchToSeason();
  state.customSelections = buildDefaultCustomSelections();
  state.teamLineups = buildDefaultTeamLineups();
  state.impactSubs = Object.fromEntries(
    teams.map((team) => [team.code, getDefaultImpactSubNames(team.code)])
  );
  state.bowlingPlans = Object.fromEntries(
    teams.map((team) => [team.code, buildDefaultBowlingPlan(team.code)])
  );
  state.offseason = null;
  state.bowlingPlanValidationTeam = null;
  state.lineupValidationTeam = null;
  state.lastSeasonLossChampion = null;
}

function buildDefaultTeamLineups() {
  return Object.fromEntries(
    teams.map((team) => [team.code, team.players.map((playerData) => playerData.name)])
  );
}

function buildDefaultCustomSelections() {
  return {
    teamA: Array.from({ length: 11 }, (_, index) => teams[Math.floor(index / 2)].players[index % teams[Math.floor(index / 2)].players.length].name),
    teamB: Array.from({ length: 11 }, (_, index) => teams[(index + 3) % teams.length].players[index % teams[(index + 3) % teams.length].players.length].name)
  };
}

function buildDefaultBowlingPlan(teamCode) {
  const team = findTeam(teamCode);
  return buildDefaultBowlingPlanForTeam(team);
}

function buildDefaultBowlingPlanForTeam(team, lineupNames = null) {
  if (!team) return Array(20).fill("");
  const lineupSource = Array.isArray(lineupNames) ? lineupNames : getLineupForTeam(team.code);
  const lineupPlayers = lineupSource
    .slice(0, 12)
    .map((name) => team.players.find((playerData) => playerData.name === name))
    .filter(Boolean);

  return buildAutoBowlingPlan(lineupPlayers);
}

function buildAutoBowlingPlan(players) {
  const rotation = getAutoBowlingRotation(players);
  if (!rotation.length) {
    return Array(20).fill("");
  }

  const plan = Array(20).fill("");
  const quotas = createBowlingRotationQuotas(rotation);
  const lockedLeaders = rotation.slice(0, Math.min(2, rotation.length)).filter((playerData) => quotas.get(playerData.name) === 4);
  const openingPacers = rotation.filter((playerData) => isPaceBowler(playerData));
  const anchorOversByLeader = [
    [16, 18],
    [17, 19]
  ];

  lockedLeaders.forEach((playerData, leaderIndex) => {
    anchorOversByLeader[leaderIndex].forEach((overIndex) => {
      if (canAssignBowlerToOver(plan, overIndex, playerData.name) && (quotas.get(playerData.name) || 0) > 0) {
        plan[overIndex] = playerData.name;
        quotas.set(playerData.name, (quotas.get(playerData.name) || 0) - 1);
      }
    });
  });

  const fillOrder = [...[0, 1, 2, 3], ...Array.from({ length: 12 }, (_, index) => index + 4), ...[16, 17, 18, 19]];
  fillOrder.forEach((overIndex) => {
    if (plan[overIndex]) {
      return;
    }
    const chosen = pickBowlerForAutoPlan(rotation, quotas, plan, overIndex, openingPacers);
    if (!chosen) {
      return;
    }
    plan[overIndex] = chosen.name;
    quotas.set(chosen.name, (quotas.get(chosen.name) || 0) - 1);
  });

  return plan;
}

function getTopBowlingPlanPlayers(players, maxBowlers = 5) {
  return (players || [])
    .filter((playerData) => playerData && isEligibleBowler(playerData))
    .sort((a, b) => (
      (b.ratings?.bowling || 0) - (a.ratings?.bowling || 0) ||
      (b.ratings?.econ || 0) - (a.ratings?.econ || 0) ||
      (b.ratings?.wkts || 0) - (a.ratings?.wkts || 0)
    ))
    .slice(0, Math.min(maxBowlers, players?.length || 0));
}

function getAutoBowlingRotation(players, maxBowlers = 5) {
  return getTopBowlingPlanPlayers(players, maxBowlers);
}

function createBowlingRotationQuotas(rotation) {
  const quotas = new Map(rotation.map((playerData) => [playerData.name, 0]));
  const lockedLeaders = rotation.slice(0, Math.min(2, rotation.length));
  let assignedOvers = 0;

  lockedLeaders.forEach((playerData) => {
    quotas.set(playerData.name, 4);
    assignedOvers += 4;
  });

  const supportBowlers = rotation.slice(lockedLeaders.length);
  let supportIndex = 0;
  while (assignedOvers < 20 && supportBowlers.length) {
    const playerData = supportBowlers[supportIndex % supportBowlers.length];
    const currentQuota = quotas.get(playerData.name) || 0;
    if (currentQuota < 4) {
      quotas.set(playerData.name, currentQuota + 1);
      assignedOvers += 1;
    }
    supportIndex += 1;
    if (supportIndex > supportBowlers.length * 20) {
      break;
    }
  }

  while (assignedOvers < 20) {
    const nextBowler = rotation.find((playerData) => (quotas.get(playerData.name) || 0) < 4);
    if (!nextBowler) {
      break;
    }
    quotas.set(nextBowler.name, (quotas.get(nextBowler.name) || 0) + 1);
    assignedOvers += 1;
  }

  return quotas;
}

function canAssignBowlerToOver(plan, overIndex, bowlerName) {
  return plan[overIndex] !== bowlerName &&
    plan[overIndex - 1] !== bowlerName &&
    plan[overIndex + 1] !== bowlerName;
}

function pickBowlerForAutoPlan(rotation, quotas, plan, overIndex, openingPacers = []) {
  const remainingPacers = openingPacers
    .filter((playerData) => (quotas.get(playerData.name) || 0) > 0)
    .filter((playerData) => canAssignBowlerToOver(plan, overIndex, playerData.name));
  const preferredPool = overIndex < 4 && remainingPacers.length ? remainingPacers : rotation;
  const candidates = preferredPool
    .filter((playerData) => (quotas.get(playerData.name) || 0) > 0)
    .filter((playerData) => canAssignBowlerToOver(plan, overIndex, playerData.name))
    .sort((a, b) => {
      const quotaDelta = (quotas.get(b.name) || 0) - (quotas.get(a.name) || 0);
      if (quotaDelta !== 0) return quotaDelta;
      return getAutoPlanPhasePriority(b, overIndex) - getAutoPlanPhasePriority(a, overIndex);
    });

  return candidates[0] || null;
}

function getAutoPlanPhasePriority(playerData, overIndex) {
  const deathBowler = Boolean(playerData.roleProfile?.deathBowler || inferRoleProfile(playerData).deathBowler);
  const paceBowler = isPaceBowler(playerData);
  const topRatedBoost = playerData.ratings.bowling / 100;

  if (overIndex >= 16) {
    return topRatedBoost + (deathBowler ? 1.2 : 0) + (paceBowler ? 0.25 : 0);
  }
  if (overIndex < 6) {
    return topRatedBoost + (paceBowler ? 0.6 : 0);
  }
  return topRatedBoost + (deathBowler ? 0.15 : 0);
}

function renderDataLoadError(error) {
  const message = error?.message || "Unknown error";
  document.body.innerHTML = `
    <div class="app-shell">
      <main class="dashboard-grid">
        <section class="panel panel-wide">
          <div class="panel-heading compact">
            <div>
            <p class="eyebrow">Database Load Error</p>
            <h2>Could not read players2026.csv</h2>
          </div>
        </div>
        <div class="scorecard-block">
          <p class="player-season-line">${message}</p>
            <p class="player-season-line">The app will use the CSV directly when available and fall back to bundled data if the browser blocks local file requests.</p>
        </div>
      </section>
    </main>
  </div>
  `;
}

function hydrateRatings() {
  teams.forEach((team) => {
    team.players.forEach((playerData) => {
      ensurePlayerRuntimeState(playerData);
    });
    team.teamRatings = calculateTeamRatings(team.players);
    team.attackProfile = buildAttackProfile(team.players);
  });
}

function ensurePlayerRuntimeState(playerData) {
  if (!playerData) {
    return null;
  }

  if (!playerData.ratings) {
    playerData.ratings = calculateRatings(playerData);
  }
  if (!playerData.roleProfile) {
    playerData.roleProfile = inferRoleProfile(playerData);
  }
  if (!playerData.archetype) {
    playerData.archetype = playerData.roleProfile.label;
  }
  if (!playerData.role) {
    playerData.role = playerData.roleProfile.label;
  }
  if (!playerData.profile) {
    playerData.profile = inferPlayerProfile(playerData);
  }
  if (!playerData.awardCounts) {
    playerData.awardCounts = {
      bestSubs: 0,
      mvps: 0,
      orangeCaps: 0,
      purpleCaps: 0
    };
  }
  if (!playerData.careerRecords) {
    playerData.careerRecords = {
      highestScore: 0,
      highestScoreBalls: 0,
      highestScoreNotOut: false,
      bestBowlingWickets: 0,
      bestBowlingRuns: 999,
      bestBowlingOversBalls: 0,
      bestBowlingEconomy: 99
    };
  }
  return playerData;
}

function refreshPlayerArchetype(playerData) {
  if (!playerData) {
    return null;
  }

  playerData.roleProfile = inferRoleProfile(playerData);
  playerData.role = playerData.roleProfile.label;
  playerData.archetype = playerData.roleProfile.label;
  playerData.profile = inferPlayerProfile(playerData);
  return playerData;
}

function applyRatingFloorDevelopmentBonus(playerData, ratingKey, targetRating) {
  if (!playerData?.ratings) {
    return;
  }

  let safety = 0;
  while ((playerData.ratings?.[ratingKey] || 0) < targetRating && safety < 20) {
    safety += 1;
    if (ratingKey === "batting") {
      playerData.makePlayerTargets.intent = clamp((playerData.makePlayerTargets.intent ?? 60) + 1.25, 25, 99);
      playerData.makePlayerTargets.composure = clamp((playerData.makePlayerTargets.composure ?? 60) + 1.05, 25, 99);
    } else if (ratingKey === "bowling") {
      playerData.makePlayerTargets.econ = clamp((playerData.makePlayerTargets.econ ?? 25) + 1.1, 25, 99);
      playerData.makePlayerTargets.wkts = clamp((playerData.makePlayerTargets.wkts ?? 25) + 1.1, 25, 99);
    } else {
      return;
    }
    playerData.ratings = calculateRatings(playerData);
  }
}

function applyLowOverallUsageBonuses(playerData, previousSnapshot, startingBatting, startingBowling) {
  if (!playerData?.ratings || !previousSnapshot) {
    return;
  }

  if (startingBatting < 55 && (previousSnapshot.seasonBallsFaced || 0) > 100) {
    applyRatingFloorDevelopmentBonus(playerData, "batting", Math.min(99, startingBatting + 4));
  }

  if (startingBowling < 55 && (previousSnapshot.seasonOversBalls || 0) > 270) {
    applyRatingFloorDevelopmentBonus(playerData, "bowling", Math.min(99, startingBowling + 4));
  }
}

function getFairMarketSalary(playerData) {
  ensurePlayerRuntimeState(playerData);
  const overall = playerData.ratings?.overall || 50;
  const batting = playerData.ratings?.batting || 25;
  const bowling = playerData.ratings?.bowling || 25;
  const allRound = playerData.ratings?.allRound || 38;
  const age = Number(playerData.age) || 27;
  const hasBowlingProfile = (playerData.bowlingType || "none") !== "none";

  let baseValue = 0.2;
  if (overall > 55) baseValue += (overall - 55) * 0.06;
  if (overall > 68) baseValue += (overall - 68) * 0.14;
  if (overall > 78) baseValue += (overall - 78) * 0.34;
  if (overall > 86) baseValue += (overall - 86) * 0.7;
  if (overall > 92) baseValue += (overall - 92) * 1.15;

  let multiplier = 1;

  if (age <= 24) multiplier += 0.015;
  else if (age <= 27) multiplier += 0.008;
  else if (age >= 34) multiplier -= 0.07;
  else if (age >= 31) multiplier -= 0.025;

  if (playerData.opener) multiplier += 0.012;
  if (playerData.deathBowl) multiplier += 0.018;
  if (batting >= 78) multiplier += 0.018;
  if (hasBowlingProfile && bowling >= 72) multiplier += 0.022;
  if (batting >= 68 && bowling >= 58) multiplier += 0.04;
  if (allRound >= 72) multiplier += 0.018;
  multiplier += Math.max(0, overall - 90) * 0.006;

  return roundToOneDecimal(clamp(baseValue * multiplier, 0.2, 18));
}

function refreshGeneratedContracts() {
  teams.forEach((team) => {
    team.players.forEach((playerData) => {
      const fairMarketSalary = getFairMarketSalary(playerData);
      playerData.marketValue = fairMarketSalary;
      if (playerData.contract === null || playerData.contract === undefined || playerData.contract === "") {
        playerData.contract = fairMarketSalary;
      }
    });
  });
}

function getPlayerAuctionValue(playerData) {
  if (!playerData) {
    return 0;
  }
  if (playerData.marketValue === null || playerData.marketValue === undefined || playerData.marketValue === "") {
    playerData.marketValue = getFairMarketSalary(playerData);
  }
  return Number(playerData.marketValue) || 0;
}

function calculateRatings(playerData) {
  const recentWeights = [0.2, 0.3, 0.5];
  const hasBowlingProfile = (playerData.bowlingType || "none") !== "none" && (playerData.bowlingHand || "none") !== "none";
  const noBowlingProfile = !hasBowlingProfile;
  const weightedRuns = weightedAverage(playerData.batting.runs, recentWeights);
  const weightedAvg = weightedAverage(playerData.batting.avg, recentWeights);
  const weightedSr = weightedAverage(playerData.batting.sr, recentWeights);
  const weightedWkts = weightedAverage(playerData.bowling.wkts, recentWeights);
  const weightedEco = weightedAverage(playerData.bowling.eco, recentWeights, true);
  const battingSample = playerData.batting.runs.reduce((sum, value) => sum + value, 0);
  const bowlingSample = playerData.bowling.wkts.reduce((sum, value) => sum + value, 0);
  const intent = playerData.makePlayerTargets?.intent ?? calculateIntent(playerData, weightedSr, weightedRuns);
  const composure = playerData.makePlayerTargets?.composure ?? calculateComposure(playerData, weightedAvg, battingSample, weightedWkts);
  const battingEliteBonus = Math.max(0, ((intent + composure) / 2) - 58) ** 1.4 * 0.35;

  const battingRating = clamp(
    getLogScaledContribution(intent, 25, 99, 51.48, 12) +
    getLogScaledContribution(composure, 25, 99, 39.6, 12) +
    battingEliteBonus,
    24,
    99
  );

  const econBase = bowlingSample > 0
    ? clamp((9.8 - weightedEco) * 7.5, 0, 42)
    : 0;
  const wktsBase = bowlingSample > 0
    ? clamp(weightedWkts * 2.2, 0, 42)
    : 0;
  const econ = playerData.makePlayerTargets?.econ ?? (bowlingSample > 0
    ? clamp(25 + Math.max(0, 10.5 - weightedEco) * 22, 25, 99)
    : 25);
  const wkts = playerData.makePlayerTargets?.wkts ?? (bowlingSample > 0
    ? clamp(25 + wktsBase * 1.55, 25, 99)
    : 25);
  const normalizedEcon = noBowlingProfile ? 25 : econ;
  const normalizedWkts = noBowlingProfile ? 25 : wkts;
  const bowlingRating = noBowlingProfile
    ? 25
    : bowlingSample > 0 || playerData.makePlayerTargets?.econ || playerData.makePlayerTargets?.wkts
    ? calculateBowlingRatingFromSkills(normalizedEcon, normalizedWkts)
    : 25;
  const bowlingOverallValue = noBowlingProfile ? 25 : clamp(22 + econBase + wktsBase, 22, 99);
  const allRoundValue = clamp((battingRating + bowlingOverallValue) / 2, 38, 99);
  const allRoundBonus = Math.max(0, allRoundValue - 55) * 0.12;
  const fielding = clamp(playerData.fielding ?? playerData.makePlayerTargets?.fielding ?? 78, 70, 99);
  const leadership = clamp(playerData.leadership ?? playerData.makePlayerTargets?.leadership ?? 72, 70, 99);
  const intangiblesBonus = (fielding + leadership) / 20;
  const clutch = clamp(
    (battingRating + bowlingOverallValue) / 2 +
    composure * 0.16 +
    intent * 0.08,
    55,
    99
  );
  const allRounder = battingRating > 60 && bowlingRating > 35;
  const battingAllRounder = allRounder && battingRating >= bowlingRating;
  const bowlingAllRounder = allRounder && bowlingRating > battingRating;

  const baseOverall = clamp(
    battingRating < 60
      ? bowlingRating * 0.9
      : battingAllRounder
      ? battingRating * 0.7 + bowlingOverallValue * 0.3 + allRoundBonus
      : bowlingAllRounder
      ? battingRating * 0.3 + bowlingOverallValue * 0.7 + allRoundBonus
      : bowlingRating < 35
      ? battingRating * 0.9
      : battingRating * 0.5 + bowlingOverallValue * 0.5,
    25,
    99
  );
  const overall = clamp(baseOverall + intangiblesBonus, 25, 99);

  return {
    batting: Math.round(battingRating),
    bowling: Math.round(bowlingRating),
    allRound: Math.round(allRoundValue),
    clutch: Math.round(clutch),
    intent: Math.round(intent),
    composure: Math.round(composure),
    econ: Math.round(normalizedEcon),
    wkts: Math.round(normalizedWkts),
    fielding: Math.round(fielding),
    leadership: Math.round(leadership),
    intangiblesBonus: Number(intangiblesBonus.toFixed(1)),
    overall: Math.round(overall)
  };
}

function calculateTeamRatings(players) {
  const ordered = [...players]
    .filter((playerData) => playerData?.ratings)
    .sort((a, b) => b.ratings.overall - a.ratings.overall)
    .slice(0, 11);
  if (!ordered.length) {
    return { batting: 0, bowling: 0, overall: 0 };
  }
  return {
    batting: Math.round(average(ordered.map((p) => p.ratings.batting))),
    bowling: Math.round(average(ordered.map((p) => p.ratings.bowling))),
    overall: Math.round(average(ordered.map((p) => p.ratings.overall)))
  };
}

function initControls() {
  const franchiseSelect = document.getElementById("franchise-team-select");
  const opponentSelect = document.getElementById("opponent-team-select");
  const homeSelect = franchiseSelect;
  const awaySelect = opponentSelect || {
    add() {},
    addEventListener() {},
    value: ""
  };
  const ratingsTeamFilter = document.getElementById("ratings-team-filter");
  const ratingsSort = document.getElementById("ratings-sort");
  const seasonStatSelect = document.getElementById("season-stat-select");
  const seasonStatScope = document.getElementById("season-stat-scope");
  const customLeagueOpponent = document.getElementById("league-opponent-select");
  const exportSaveButton = document.getElementById("export-save");
  const importSaveButton = document.getElementById("import-save");
  const importSaveInput = document.getElementById("import-save-input");

  if (exportSaveButton) {
    exportSaveButton.addEventListener("click", exportCurrentSave);
  }

  if (importSaveButton && importSaveInput) {
    importSaveButton.addEventListener("click", () => importSaveInput.click());
    importSaveInput.addEventListener("change", (event) => {
      const [file] = event.target.files || [];
      importSaveFile(file);
      event.target.value = "";
    });
  }

  if (ratingsTeamFilter) {
    ratingsTeamFilter.add(new Option("All Teams", "ALL"));
    teams.forEach((team) => {
      ratingsTeamFilter.add(new Option(`${team.code} • ${team.name}`, team.code));
    });
    ratingsTeamFilter.value = state.ratingsFilter;
    ratingsTeamFilter.addEventListener("change", (event) => {
      state.ratingsFilter = event.target.value;
      renderRatingsPage();
    });
  }

  if (ratingsSort) {
    ratingsSort.value = state.ratingsSort;
    ratingsSort.addEventListener("change", (event) => {
      state.ratingsSort = event.target.value;
      renderRatingsPage();
    });
  }

  if (seasonStatSelect) {
    seasonStatSelect.value = state.seasonStat;
    seasonStatSelect.addEventListener("change", (event) => {
      state.seasonStat = event.target.value;
      renderAwards();
    });
  }

  if (seasonStatScope) {
    seasonStatScope.value = state.seasonStatScope;
    seasonStatScope.addEventListener("change", (event) => {
      state.seasonStatScope = event.target.value;
      renderAwards();
    });
  }

  if (customLeagueOpponent) {
    teams.forEach((team) => {
      customLeagueOpponent.add(new Option(`${team.code} • ${team.name}`, team.code));
    });
    customLeagueOpponent.value = state.customLeagueOpponent;
    customLeagueOpponent.addEventListener("change", (event) => {
      state.customLeagueOpponent = event.target.value;
      renderCustomPage();
    });
    const simulateCustom = document.getElementById("simulate-custom-match");
    if (simulateCustom) {
      simulateCustom.addEventListener("click", () => simulateCustomMatch());
    }
  }

  if (!franchiseSelect) {
    return;
  }

  teams.forEach((team) => {
    homeSelect.add(new Option(`${team.code} • ${team.name}`, team.code));
    awaySelect.add(new Option(`${team.code} • ${team.name}`, team.code));
  });

  homeSelect.value = state.homeTeam;
  awaySelect.value = state.awayTeam;

  homeSelect.addEventListener("change", (event) => {
    state.homeTeam = event.target.value;
    state.franchiseTeam = state.homeTeam;
    state.selectedTeam = state.homeTeam;
    syncFeaturedMatchToSeason();
    renderFeaturedMatchup();
    renderTeamCards();
    renderRoster();
  });

  awaySelect.addEventListener("change", (event) => {
    state.awayTeam = event.target.value;
    state.opponentTeam = state.awayTeam;
    if (state.homeTeam === state.awayTeam) {
      state.homeTeam = nextTeamCode(state.awayTeam);
      state.franchiseTeam = state.homeTeam;
      state.selectedTeam = state.homeTeam;
      homeSelect.value = state.homeTeam;
    }
    renderFeaturedMatchup();
    renderTeamCards();
    renderRoster();
  });

  document.getElementById("simulate-next").addEventListener("click", () => {
    if (state.season.champion) {
      restartSeason();
      return;
    }
    if (!validateImpactSubsBeforeSimulation()) {
      renderFeaturedResultMessage("Select exactly two impact players from the active XII before simulating.");
      return;
    }
    if (!validateBowlingPlanBeforeSimulation()) {
      renderFeaturedResultMessage("Set a valid bowling plan before simulating.");
      return;
    }
    const result = simulateFranchiseGame();
    if (!result) {
      renderFeaturedMatchup();
      renderFeaturedResultMessage(state.season.champion
        ? `${state.season.champion.name} finished the year as champions.`
        : "No regular-season fixture remains for this team. Use Simulate Season to finish the playoffs.");
      renderTicker();
      updateSimulationControls();
      return;
    }
    renderFeaturedResult(result);
    renderMatchLog();
    renderLatestScorecard();
    renderStandings();
    renderAwards();
    renderRoster();
    renderFeaturedMatchup();
    renderTicker();
    updateSimulationControls();
    if (state.season.champion) {
      renderFeaturedResult(
        result,
        `Champions: ${state.season.champion ? state.season.champion.name : "Decided on tie-break"}.`,
        true
      );
    }
    maybeLaunchGameOutcomeSymbols(result);
    const launchedTournamentMvpEmojis = maybeLaunchTournamentMvpEmojis();
    if (!launchedTournamentMvpEmojis) {
      maybeLaunchChampionshipConfetti();
    }
    maybeLaunchSeasonLossEmojis();
  });

  document.getElementById("simulate-season").addEventListener("click", () => {
    if (state.season.champion) {
      continueSimulation();
      return;
    }
    if (!validateImpactSubsBeforeSimulation()) {
      renderFeaturedResultMessage("Select exactly two impact players from the active XII before simulating the season.");
      return;
    }
    if (!validateBowlingPlanBeforeSimulation()) {
      renderFeaturedResultMessage("Set a valid bowling plan before simulating the season.");
      return;
    }
    state.season = simulateSeason();
    recordCompletedSeasonAwards();
    state.matchLog = [...state.season.featuredMatches];
    renderStandings();
    renderAwards();
    renderMatchLog();
    renderLatestScorecard();
    renderRoster();
    renderFeaturedMatchup();
    renderTicker();
    const final = state.season.featuredMatches[0];
    if (final) {
      renderFeaturedResult(
        final,
        `Champions: ${state.season.champion ? state.season.champion.name : "Decided on tie-break"}.`,
        true
      );
      maybeLaunchGameOutcomeSymbols(final);
      const launchedTournamentMvpEmojis = maybeLaunchTournamentMvpEmojis();
      if (!launchedTournamentMvpEmojis) {
        maybeLaunchChampionshipConfetti();
      }
    }
    maybeLaunchSeasonLossEmojis();
    updateSimulationControls();
  });
}

function renderAll() {
  initContactOverlay();
  initSavesOverlay();
  initBowlingPlanModal();

  if (document.getElementById("franchise-team-select")) {
    initSimulatorHowToPlayOverlay();
    initOffseasonModals();
    renderFeaturedMatchup();
    renderTeamCards();
    renderRoster();
    renderMatchLog();
    renderStandings();
    renderAwards();
    renderLatestScorecard();
    renderTicker();
    updateSimulationControls();
    renderSavePanel();
    syncVisibleControlValues();
  }

  if (document.getElementById("ratings-grid")) {
    renderRatingsPage();
  }

  if (document.getElementById("custom-team-a")) {
    initCustomHowToPlayOverlay();
    renderCustomPage();
  }

  if (document.getElementById("make-player-name")) {
    initMakePlayerHowToPlayOverlay();
    initMakePlayerPage();
  }

}

function renderFeaturedMatchup() {
  syncFeaturedMatchToSeason();
  const seasonChip = document.getElementById("season-chip");
  const nextFixture = getNextFixtureForTeam(state.franchiseTeam);

  if (!nextFixture) {
    const playoffFixture = getFranchisePlayoffFixture();
    if (playoffFixture) {
      const home = buildLineupTeam(findTeam(playoffFixture.homeCode));
      const away = buildLineupTeam(findTeam(playoffFixture.awayCode));
      document.getElementById("featured-home-code").textContent = home.code;
      document.getElementById("featured-home-name").textContent = home.name;
      document.getElementById("featured-away-code").textContent = away.code;
      document.getElementById("featured-away-name").textContent = away.name;
      document.getElementById("featured-home-ovr").textContent = home.teamRatings.overall;
      document.getElementById("featured-away-ovr").textContent = away.teamRatings.overall;
      document.getElementById("featured-venue").textContent = "Playoff spotlight";
      if (seasonChip) {
        seasonChip.textContent = playoffFixture.label;
      }
      return;
    }

    const franchise = buildLineupTeam(findTeam(state.franchiseTeam));
    document.getElementById("featured-home-code").textContent = franchise.code;
    document.getElementById("featured-home-name").textContent = franchise.name;
    document.getElementById("featured-away-code").textContent = "--";
    document.getElementById("featured-away-name").textContent = state.season.champion ? "Season Complete" : isFranchisePlayoffEligible() ? "Awaiting Playoff Result" : "Awaiting Playoffs";
    document.getElementById("featured-home-ovr").textContent = franchise.teamRatings.overall;
    document.getElementById("featured-away-ovr").textContent = "--";
    document.getElementById("featured-venue").textContent = state.season.champion ? "Trophy Lift" : isFranchisePlayoffEligible() ? "Bracket in progress" : "Regular season finished";
    if (seasonChip) {
      seasonChip.textContent = state.season.champion
        ? `${state.season.champion.code} won the title`
        : isFranchisePlayoffEligible() ? "Playoffs" : "Regular Season Complete";
    }
    return;
  }

  const home = buildLineupTeam(findTeam(nextFixture.homeCode));
  const away = buildLineupTeam(findTeam(nextFixture.awayCode));

  document.getElementById("featured-home-code").textContent = home.code;
  document.getElementById("featured-home-name").textContent = home.name;
  document.getElementById("featured-away-code").textContent = away.code;
  document.getElementById("featured-away-name").textContent = away.name;
  document.getElementById("featured-home-ovr").textContent = home.teamRatings.overall;
  document.getElementById("featured-away-ovr").textContent = away.teamRatings.overall;
  document.getElementById("featured-venue").textContent = home.venue;
  if (seasonChip) {
    seasonChip.textContent = formatSeasonChipLabel(nextFixture.label);
  }
}

function initHowToPlayOverlay(steps) {
  const getSteps = typeof steps === "function" ? steps : () => steps;
  const trigger = document.getElementById("how-to-play-trigger");
  const overlay = document.getElementById("how-to-play-overlay");
  const backdrop = document.getElementById("how-to-play-backdrop");
  const panel = document.getElementById("how-to-play-panel");
  const closeButton = document.getElementById("how-to-play-close");
  const prevButton = document.getElementById("how-to-play-prev");
  const nextButton = document.getElementById("how-to-play-next");
  const label = document.getElementById("how-to-play-label");
  const title = document.getElementById("how-to-play-title");
  const content = document.getElementById("how-to-play-content");
  const dots = document.getElementById("how-to-play-dots");
  if (!trigger || !overlay || !backdrop || !panel || !closeButton || !prevButton || !nextButton || !label || !title || !content || !dots) {
    return;
  }

  if (trigger.dataset.bound === "true") {
    return {
      openAtStep: typeof overlay.__openAtStep === "function" ? overlay.__openAtStep : null
    };
  }

  let activeStep = 0;
  let previousScrollY = 0;

  function renderHowToPlayStep() {
    const currentSteps = getSteps();
    const step = currentSteps[activeStep];
    label.textContent = step.label;
    title.textContent = step.title;
    content.innerHTML = step.content;
    dots.innerHTML = currentSteps.map((_, index) => `<span class="how-to-play-dot ${index === activeStep ? "is-active" : ""}"></span>`).join("");
    prevButton.disabled = false;
    nextButton.disabled = false;
  }

  function scrollToHowToPlayStep() {
    const currentSteps = getSteps();
    const step = currentSteps[activeStep];
    if (!step.target) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = document.querySelector(step.target);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: step.block || "center" });
    }
  }

  function setHowToPlayStep(nextIndex) {
    const currentSteps = getSteps();
    activeStep = (nextIndex + currentSteps.length) % currentSteps.length;
    renderHowToPlayStep();
    scrollToHowToPlayStep();
  }

  function openHowToPlayAtStep(stepIndex = 0) {
    previousScrollY = window.scrollY;
    overlay.hidden = false;
    document.body.classList.add("how-to-play-open");
    setHowToPlayStep(stepIndex);
  }

  function openHowToPlay() {
    openHowToPlayAtStep(0);
  }

  function closeHowToPlay() {
    overlay.hidden = true;
    document.body.classList.remove("how-to-play-open");
    scrollToHowToPlayStep();
  }

  trigger.addEventListener("click", openHowToPlay);
  closeButton.addEventListener("click", closeHowToPlay);
  prevButton.addEventListener("click", () => setHowToPlayStep(activeStep - 1));
  nextButton.addEventListener("click", () => setHowToPlayStep(activeStep + 1));
  backdrop.addEventListener("click", closeHowToPlay);
  document.addEventListener("keydown", (event) => {
    if (overlay.hidden) {
      return;
    }
    if (event.key === "Escape") {
      closeHowToPlay();
    } else if (event.key === "ArrowLeft") {
      setHowToPlayStep(activeStep - 1);
    } else if (event.key === "ArrowRight") {
      setHowToPlayStep(activeStep + 1);
    }
  });

  trigger.dataset.bound = "true";
  overlay.__openAtStep = openHowToPlayAtStep;
  return {
    openAtStep: openHowToPlayAtStep
  };
}

function initContactOverlay() {
  const trigger = document.getElementById("contact-trigger");
  const overlay = document.getElementById("contact-overlay");
  const backdrop = document.getElementById("contact-backdrop");
  const closeButton = document.getElementById("contact-close");
  if (!trigger || !overlay || !backdrop || !closeButton) {
    return;
  }

  if (trigger.dataset.bound === "true") {
    return;
  }

  function openContact() {
    overlay.hidden = false;
    document.body.classList.add("how-to-play-open");
  }

  function closeContact() {
    overlay.hidden = true;
    document.body.classList.remove("how-to-play-open");
  }

  trigger.addEventListener("click", openContact);
  closeButton.addEventListener("click", closeContact);
  backdrop.addEventListener("click", closeContact);
  document.addEventListener("keydown", (event) => {
    if (overlay.hidden) {
      return;
    }
    if (event.key === "Escape") {
      closeContact();
    }
  });

  trigger.dataset.bound = "true";
}

function initSavesOverlay() {
  const trigger = document.getElementById("saves-trigger");
  const overlay = document.getElementById("saves-overlay");
  const backdrop = document.getElementById("saves-backdrop");
  const closeButton = document.getElementById("saves-close");
  if (!trigger || !overlay || !backdrop || !closeButton) {
    return;
  }

  if (trigger.dataset.bound === "true") {
    return;
  }

  function openSaves() {
    renderSavePanel();
    overlay.hidden = false;
    document.body.classList.add("how-to-play-open");
  }

  function closeSaves() {
    overlay.hidden = true;
    document.body.classList.remove("how-to-play-open");
  }

  trigger.addEventListener("click", openSaves);
  closeButton.addEventListener("click", closeSaves);
  backdrop.addEventListener("click", closeSaves);
  document.addEventListener("keydown", (event) => {
    if (overlay.hidden) {
      return;
    }
    if (event.key === "Escape") {
      closeSaves();
    }
  });

  trigger.dataset.bound = "true";
}

function openRetentionModal() {
  const overlay = document.getElementById("retention-overlay");
  const modal = document.getElementById("retention-modal");
  const panel = document.getElementById("retention-panel");
  const title = document.getElementById("retention-title");
  if (!overlay) {
    return;
  }
  overlay.hidden = false;
  document.body.classList.add("how-to-play-open");
  renderRetentionModal();
  if (modal) {
    modal.scrollTop = 0;
  }
  if (panel) {
    panel.scrollTop = 0;
  }
  window.requestAnimationFrame(() => {
    if (modal) {
      modal.scrollTop = 0;
      modal.focus({ preventScroll: true });
    }
    if (panel) {
      panel.scrollTop = 0;
    }
    if (title) {
      title.focus({ preventScroll: true });
    }
  });
}

function closeRetentionModal() {
  const overlay = document.getElementById("retention-overlay");
  if (!overlay) {
    return;
  }
  overlay.hidden = true;
  syncGlobalOverlayScrollLock();
}

function openAuctionModal() {
  const overlay = document.getElementById("auction-overlay");
  if (!overlay) {
    return;
  }
  renderAuctionModal();
  overlay.hidden = false;
  document.body.classList.add("how-to-play-open");
}

function closeAuctionModal() {
  const overlay = document.getElementById("auction-overlay");
  if (!overlay) {
    return;
  }
  overlay.hidden = true;
  syncGlobalOverlayScrollLock();
}

function createEmptyTradeState(seedPlayer = null) {
  return {
    userSlots: [seedPlayer ? seedPlayer.offseasonId : null, null, null],
    opponentSlots: [null, null, null],
    selectedOpponentTeamCode: null,
    lockedOpponentTeamCode: null,
    history: state.offseason?.tradeHistory || [],
    gmMessage: "Select a team and build the package.",
    officeMessage: "Select a team and see how the package looks.",
    negotiationState: "idle"
  };
}

function canOpenTradeWindow() {
  return Boolean(state.offseason && state.offseason.phase === "trade");
}

function openTradeModal(seedPlayerId) {
  if (!canOpenTradeWindow()) {
    return;
  }
  const overlay = document.getElementById("trade-overlay");
  if (!overlay) {
    return;
  }
  const userTeam = getWorkingOffseasonTeam(state.franchiseTeam);
  const seedPlayer = userTeam?.players.find((playerData) => playerData.offseasonId === seedPlayerId) || null;
  state.tradeModal.open = true;
  state.tradeModal.activeSlot = null;
  state.offseason.tradeState = createEmptyTradeState(seedPlayer);
  renderTradeModal();
  overlay.hidden = false;
  document.body.classList.add("how-to-play-open");
}

function syncGlobalOverlayScrollLock() {
  const overlayIds = [
    "how-to-play-overlay",
    "contact-overlay",
    "bowling-plan-overlay",
    "retention-overlay",
    "auction-overlay",
    "trade-overlay"
  ];
  const hasVisibleOverlay = overlayIds.some((id) => {
    const node = document.getElementById(id);
    return node && node.hidden === false;
  });
  document.body.classList.toggle("how-to-play-open", hasVisibleOverlay);
}

function closeTradeModal() {
  const overlay = document.getElementById("trade-overlay");
  if (!overlay) {
    return;
  }
  overlay.hidden = true;
  state.tradeModal.open = false;
  state.tradeModal.activeSlot = null;
  syncGlobalOverlayScrollLock();
}

function getPreviousSeasonSnapshotForPlayer(playerData) {
  if (!playerData || !state.season?.playerStats?.length) {
    return null;
  }
  const identifiers = [
    `${playerData.originalTeamCode || playerData.teamCode || ""}::${playerData.customId || playerData.name}`,
    `${playerData.teamCode || ""}::${playerData.customId || playerData.name}`
  ].filter(Boolean);
  const directMatch = state.season.playerStats.find((entry) => identifiers.includes(`${entry.teamCode}::${entry.customId || entry.name}`));
  if (directMatch) {
    return directMatch;
  }
  return state.season.playerStats.find((entry) => (entry.customId && playerData.customId && entry.customId === playerData.customId) || entry.name === playerData.name) || null;
}

function estimateProjectedSeasonImpact(playerData) {
  if (!playerData) {
    return 0;
  }
  ensurePlayerRuntimeState(playerData);
  const overall = playerData.ratings?.overall || 50;
  const batting = playerData.ratings?.batting || 25;
  const bowling = playerData.ratings?.bowling || 25;
  const clutch = playerData.ratings?.clutch || 25;
  const wkts = playerData.ratings?.wkts || 25;
  const econ = playerData.ratings?.econ || 25;
  const hasBowlingRole = (playerData.bowlingType || "none") !== "none";
  const battingImpactEstimate = Math.max(0, (batting - 50) * 1.15 + (clutch - 52) * 0.24);
  const bowlingImpactEstimate = hasBowlingRole
    ? Math.max(0, (bowling - 46) * 0.82 + (wkts - 48) * 0.48 + (econ - 48) * 0.2)
    : 0;
  const roleBonus = (playerData.opener ? 2.5 : 0) + (playerData.deathBowl ? 3 : 0);
  const baseProjection = Math.max(4, (overall - 48) * 0.72 + battingImpactEstimate + bowlingImpactEstimate + roleBonus);
  return roundToOneDecimal(baseProjection);
}

function getPlayerTradeValue(playerData) {
  if (!playerData) {
    return 0;
  }
  ensurePlayerRuntimeState(playerData);
  const snapshot = getPreviousSeasonSnapshotForPlayer(playerData);
  const playedGames = Number(snapshot?.matchesPlayed) || 0;
  const age = Number(playerData.age) || 27;
  const ageMultiplier = age >= 32 ? 0.98 : 1;
  const overall = Number(playerData.ratings?.overall) || 50;

  const fairTradeValue = (!snapshot || playedGames === 0)
    ? estimateProjectedSeasonImpact(playerData) * 2
    : Math.max(1, Number(snapshot.mvpScore) || 0) * ageMultiplier;

  return roundToOneDecimal(overall * 0.3 + fairTradeValue * 0.7);
}

function getTradeValueStarRating(playerData) {
  const tradePool = state.offseason?.workingTeams?.flatMap((team) => team.players || []) || [];
  if (!tradePool.length) {
    return 1;
  }

  const tradeValue = getPlayerTradeValue(playerData);
  const playersAbove = tradePool.filter((entry) => getPlayerTradeValue(entry) > tradeValue).length;
  const percentileFromTop = playersAbove / tradePool.length;

  if (percentileFromTop <= 0.05) return 5;
  if (percentileFromTop <= 0.125) return 4.5;
  if (percentileFromTop <= 0.2) return 4;
  if (percentileFromTop <= 0.35) return 3.5;
  if (percentileFromTop <= 0.5) return 3;
  if (percentileFromTop <= 0.625) return 2.5;
  if (percentileFromTop <= 0.75) return 2;
  if (percentileFromTop <= 0.875) return 1.5;
  return 1;
}

function renderTradeValueStars(starRating) {
  const fullStars = Math.floor(starRating);
  const hasHalfStar = starRating % 1 >= 0.5;

  return Array.from({ length: 5 }, (_, index) => {
    const stateClass = index < fullStars
      ? "is-full"
      : index === fullStars && hasHalfStar
      ? "is-half"
      : "is-empty";
    return `<span class="trade-star ${stateClass}" aria-hidden="true">★</span>`;
  }).join("");
}

function getTradeState() {
  if (!state.offseason?.tradeState) {
    state.offseason.tradeState = createEmptyTradeState();
  }
  return state.offseason.tradeState;
}

function getTradeSlotPlayers(slotIds = []) {
  return slotIds
    .map((offseasonId) => findTradePlayerById(offseasonId))
    .filter(Boolean);
}

function findTradePlayerById(offseasonId) {
  if (!offseasonId || !state.offseason?.workingTeams?.length) {
    return null;
  }
  for (const team of state.offseason.workingTeams) {
    const found = team.players.find((playerData) => playerData.offseasonId === offseasonId);
    if (found) {
      return found;
    }
  }
  return null;
}

function getLockedTradeOpponentTeamCode() {
  const tradeState = getTradeState();
  if (tradeState.selectedOpponentTeamCode) {
    return tradeState.selectedOpponentTeamCode;
  }
  if (tradeState.lockedOpponentTeamCode) {
    return tradeState.lockedOpponentTeamCode;
  }
  const opponentPlayer = getTradeSlotPlayers(tradeState.opponentSlots)[0];
  return opponentPlayer?.teamCode || null;
}

function getTradeSalaryRoom(teamCode, outgoingTotal = 0) {
  return (state.offseason?.budgets?.[teamCode] || 0) + outgoingTotal;
}

function getTradeAssessment() {
  if (!state.offseason) {
    return null;
  }
  const tradeState = getTradeState();
  const userTeam = getWorkingOffseasonTeam(state.franchiseTeam);
  const opponentTeamCode = getLockedTradeOpponentTeamCode();
  const opponentTeam = opponentTeamCode ? getWorkingOffseasonTeam(opponentTeamCode) : null;
  const userPlayers = getTradeSlotPlayers(tradeState.userSlots);
  const opponentPlayers = getTradeSlotPlayers(tradeState.opponentSlots);
  const userOutgoingSalary = userPlayers.reduce((total, playerData) => total + (Number(playerData.contract) || 0), 0);
  const opponentOutgoingSalary = opponentPlayers.reduce((total, playerData) => total + (Number(playerData.contract) || 0), 0);
  const userOutgoingValue = userPlayers.reduce((total, playerData) => total + getPlayerTradeValue(playerData), 0);
  const opponentOutgoingValue = opponentPlayers.reduce((total, playerData) => total + getPlayerTradeValue(playerData), 0);
  const opponentHasStarPlayer = opponentPlayers.some((playerData) => getTradeValueStarRating(playerData) >= 4);
  const requiredOpponentValueBonus = opponentHasStarPlayer ? 100 : 0;
  const userSalaryPass = opponentPlayers.length > 0 && opponentOutgoingSalary <= getTradeSalaryRoom(state.franchiseTeam, userOutgoingSalary);
  const opponentSalaryPass = opponentTeam && userOutgoingSalary <= getTradeSalaryRoom(opponentTeam.code, opponentOutgoingSalary);
  const userRosterAfter = (userTeam?.players.length || 0) - userPlayers.length + opponentPlayers.length;
  const opponentRosterAfter = opponentTeam ? opponentTeam.players.length - opponentPlayers.length + userPlayers.length : 0;
  const rosterPass = userRosterAfter <= MAX_ROSTER_SIZE && (!opponentTeam || opponentRosterAfter <= MAX_ROSTER_SIZE);
  const minimumRosterPass = userRosterAfter >= 14 && (!opponentTeam || opponentRosterAfter >= 14);
  const valueRatio = opponentOutgoingValue > 0 ? userOutgoingValue / opponentOutgoingValue : (userOutgoingValue > 0 ? Infinity : 1);
  const opponentNeedsMoreValue = opponentOutgoingValue > 0
    ? userOutgoingValue < Math.max(opponentOutgoingValue * 0.8, opponentOutgoingValue + requiredOpponentValueBonus)
    : userOutgoingValue <= 0;
  const userIsOverpaying = opponentOutgoingValue > 0 && userOutgoingValue > opponentOutgoingValue * 1.4;
  const valueStatus = opponentNeedsMoreValue
    ? "Rejected"
    : valueRatio >= 0.9 && valueRatio <= 1.28
    ? "Fair"
    : valueRatio >= 0.8 && valueRatio <= 1.4
    ? "Close"
    : "User Overpay";
  const valueDirection = opponentNeedsMoreValue
    ? "opponent_underpaid"
    : userIsOverpaying
    ? "opponent_overpay"
    : "balanced";
  const complete = userPlayers.length > 0 && opponentPlayers.length > 0 && opponentTeam;
  const feasible = Boolean(complete && userSalaryPass && opponentSalaryPass && rosterPass && minimumRosterPass && valueStatus !== "Rejected");
  return {
    complete,
    feasible,
    opponentTeam,
    opponentTeamCode,
    userPlayers,
    opponentPlayers,
    userOutgoingSalary,
    opponentOutgoingSalary,
    userOutgoingValue,
    opponentOutgoingValue,
    opponentHasStarPlayer,
    requiredOpponentValueBonus,
    userSalaryPass,
    opponentSalaryPass,
    rosterPass,
    minimumRosterPass,
    userRosterAfter,
    opponentRosterAfter,
    valueRatio,
    valueStatus,
    valueDirection
  };
}

function getTradePickerPool(activeSlot) {
  if (!activeSlot || !state.offseason) {
    return [];
  }
  const tradeState = getTradeState();
  if (activeSlot.side === "user") {
    const selectedIds = new Set(tradeState.userSlots.filter(Boolean));
    return (getWorkingOffseasonTeam(state.franchiseTeam)?.players || [])
      .filter((playerData) => !selectedIds.has(playerData.offseasonId));
  }
  const selectedIds = new Set(tradeState.opponentSlots.filter(Boolean));
  const lockedTeamCode = getLockedTradeOpponentTeamCode();
  if (!lockedTeamCode) {
    return [];
  }
  const candidateTeams = state.offseason.workingTeams.filter((team) => team.code === lockedTeamCode);
  return candidateTeams.flatMap((team) => team.players
    .filter((playerData) => !selectedIds.has(playerData.offseasonId))
    .map((playerData) => ({ ...playerData, pickerTeamCode: team.code })));
}

function setTradeActiveSlot(side, index) {
  const tradeState = getTradeState();
  if (tradeState.negotiationState === "accepted") {
    tradeState.negotiationState = "idle";
    tradeState.gmMessage = "Select a team and build the package.";
    tradeState.officeMessage = "Select a team and see how the package looks.";
  }
  state.tradeModal.activeSlot = { side, index };
  renderTradeModal();
}

function addPlayerToTrade(playerId) {
  if (!state.tradeModal.activeSlot || !state.offseason) {
    return;
  }
  const playerData = findTradePlayerById(playerId);
  if (!playerData) {
    return;
  }
  const tradeState = getTradeState();
  if (tradeState.negotiationState === "accepted") {
    tradeState.negotiationState = "idle";
  }
  const { side, index } = state.tradeModal.activeSlot;
  if (side === "user") {
    tradeState.userSlots[index] = playerData.offseasonId;
  } else {
    const lockedTeamCode = getLockedTradeOpponentTeamCode();
    if (lockedTeamCode && playerData.teamCode !== lockedTeamCode) {
      return;
    }
    tradeState.opponentSlots[index] = playerData.offseasonId;
    tradeState.lockedOpponentTeamCode = playerData.teamCode;
    tradeState.selectedOpponentTeamCode = playerData.teamCode;
  }
  tradeState.gmMessage = "Package updated. Send the offer when you're ready.";
  tradeState.officeMessage = getUserOfficeSuggestion(getTradeAssessment());
  state.tradeModal.activeSlot = null;
  renderTradeModal();
}

function removePlayerFromTrade(side, index) {
  if (!state.offseason) {
    return;
  }
  const tradeState = getTradeState();
  if (tradeState.negotiationState === "accepted") {
    tradeState.negotiationState = "idle";
  }
  if (side === "user") {
    tradeState.userSlots[index] = null;
  } else {
    tradeState.opponentSlots[index] = null;
    const remainingOpponentPlayers = getTradeSlotPlayers(tradeState.opponentSlots);
    tradeState.lockedOpponentTeamCode = remainingOpponentPlayers[0]?.teamCode || null;
    tradeState.selectedOpponentTeamCode = remainingOpponentPlayers[0]?.teamCode || tradeState.selectedOpponentTeamCode;
  }
  if (!tradeState.opponentSlots.some(Boolean)) {
    tradeState.lockedOpponentTeamCode = null;
  }
  tradeState.gmMessage = "Package updated. Send the offer when you're ready.";
  tradeState.officeMessage = getUserOfficeSuggestion(getTradeAssessment());
  renderTradeModal();
}

function setTradeOpponentTeam(teamCode) {
  const tradeState = getTradeState();
  tradeState.selectedOpponentTeamCode = teamCode || null;
  tradeState.lockedOpponentTeamCode = teamCode || null;
  tradeState.opponentSlots = [null, null, null];
  tradeState.negotiationState = "idle";
  tradeState.gmMessage = teamCode
    ? `Opening talks with ${findTeam(teamCode)?.name || teamCode}.`
    : "Select a team, build the package, and send the offer.";
  tradeState.officeMessage = teamCode
    ? "Build the package and decide if it's worth sending."
    : "Select a team and see how the package looks.";
  state.tradeModal.activeSlot = null;
  renderTradeModal();
}

function formatTradeCapDelta(delta) {
  const rounded = roundToOneDecimal(Math.abs(delta));
  if (delta > 0) {
    return `(+ ${rounded.toFixed(rounded % 1 === 0 ? 0 : 1)})`;
  }
  if (delta < 0) {
    return `(- ${rounded.toFixed(rounded % 1 === 0 ? 0 : 1)})`;
  }
  return "(0)";
}

function getUserOfficeSuggestion(assessment) {
  if (!assessment?.opponentTeam) {
    return "Pick a team and see how the package looks.";
  }
  if (!assessment.complete) {
    return "Build out both sides before sending the offer.";
  }
  if (!assessment.minimumRosterPass) {
    return "We need to keep enough bodies on the roster.";
  }
  if (assessment.valueDirection === "opponent_overpay") {
    return "Are we really getting back enough?";
  }
  if (!assessment.userSalaryPass || !assessment.opponentSalaryPass) {
    return "Cap-wise, this needs a little more work.";
  }
  return "Looks good!";
}

function getUserOfficeStatus(assessment) {
  if (!assessment?.opponentTeam || !assessment.complete) {
    return "is-neutral";
  }
  if (!assessment.minimumRosterPass || !assessment.userSalaryPass || !assessment.opponentSalaryPass || assessment.valueDirection === "opponent_overpay") {
    return "is-fail";
  }
  return "is-pass";
}

function syncTeamAfterTrade(teamCode) {
  const team = getWorkingOffseasonTeam(teamCode);
  if (!team) {
    return;
  }
  team.players.forEach((playerData, index) => {
    playerData.teamCode = teamCode;
    playerData.offseasonId = playerData.offseasonId || getOffseasonPlayerId(playerData, teamCode, index);
    ensurePlayerRuntimeState(playerData);
  });
  team.teamRatings = calculateTeamRatings(team.players);
  team.attackProfile = buildAttackProfile(team.players);
  applyAutoStartingLineup(teamCode, team);
}

function executeTrade() {
  const assessment = getTradeAssessment();
  const tradeState = getTradeState();
  tradeState.negotiationState = "rejected";
  tradeState.officeMessage = getUserOfficeSuggestion(assessment);
  if (!assessment?.complete || !assessment.opponentTeam) {
    tradeState.gmMessage = "We need a full offer on both sides before we can review it.";
    renderTradeModal();
    return;
  }
  if (!assessment.minimumRosterPass) {
    tradeState.gmMessage = "We need atleast 14 players!";
    renderTradeModal();
    return;
  }
  if (assessment.valueStatus === "Rejected") {
    tradeState.gmMessage = assessment.valueDirection === "opponent_underpaid"
      ? "We aren't getting enough back!"
      : "That's too much for us to give up!";
    renderTradeModal();
    return;
  }
  if (!assessment.userSalaryPass || !assessment.opponentSalaryPass) {
    tradeState.gmMessage = "The contracts don't match up!";
    renderTradeModal();
    return;
  }
  if (!assessment.rosterPass) {
    tradeState.gmMessage = "That would leave one team over the roster limit.";
    renderTradeModal();
    return;
  }
  if (!assessment.feasible) {
    tradeState.gmMessage = "This deal doesn't work for us.";
    renderTradeModal();
    return;
  }
  const userTeam = getWorkingOffseasonTeam(state.franchiseTeam);
  const opponentTeam = assessment.opponentTeam;
  const userSendIds = new Set(assessment.userPlayers.map((playerData) => playerData.offseasonId));
  const opponentSendIds = new Set(assessment.opponentPlayers.map((playerData) => playerData.offseasonId));
  const incomingToUser = assessment.opponentPlayers.map((playerData) => clonePlayer(playerData));
  const incomingToOpponent = assessment.userPlayers.map((playerData) => clonePlayer(playerData));

  userTeam.players = userTeam.players
    .filter((playerData) => !userSendIds.has(playerData.offseasonId))
    .concat(incomingToUser.map((playerData, index) => ({
      ...playerData,
      teamCode: userTeam.code,
      offseasonId: playerData.offseasonId || getOffseasonPlayerId(playerData, userTeam.code, userTeam.players.length + index)
    })));

  opponentTeam.players = opponentTeam.players
    .filter((playerData) => !opponentSendIds.has(playerData.offseasonId))
    .concat(incomingToOpponent.map((playerData, index) => ({
      ...playerData,
      teamCode: opponentTeam.code,
      offseasonId: playerData.offseasonId || getOffseasonPlayerId(playerData, opponentTeam.code, opponentTeam.players.length + index)
    })));

  state.offseason.budgets[userTeam.code] = Math.max(0, (state.offseason.budgets[userTeam.code] || 0) + assessment.userOutgoingSalary - assessment.opponentOutgoingSalary);
  state.offseason.budgets[opponentTeam.code] = Math.max(0, (state.offseason.budgets[opponentTeam.code] || 0) + assessment.opponentOutgoingSalary - assessment.userOutgoingSalary);
  state.offseason.tradeHistory = state.offseason.tradeHistory || [];
  state.offseason.tradeHistory.unshift({
    fromTeamCode: userTeam.code,
    toTeamCode: opponentTeam.code,
    summary: `${assessment.userPlayers.map((playerData) => playerData.name).join(", ")} for ${assessment.opponentPlayers.map((playerData) => playerData.name).join(", ")}`
  });
  syncTeamAfterTrade(userTeam.code);
  syncTeamAfterTrade(opponentTeam.code);
  launchChampionshipConfetti();
  state.offseason.tradeState = createEmptyTradeState();
  state.offseason.tradeState.selectedOpponentTeamCode = opponentTeam.code;
  state.offseason.tradeState.lockedOpponentTeamCode = opponentTeam.code;
  state.offseason.tradeState.gmMessage = "Pleasure doing business with you!";
  state.offseason.tradeState.officeMessage = "Trade completed!";
  state.offseason.tradeState.negotiationState = "accepted";
  state.selectedLineupSwap = null;
  state.draggedLineupIndex = null;
  state.lineupCardFlips = {};
  renderFeaturedMatchup();
  renderTeamCards();
  renderRoster();
  renderTradeModal();
  renderFeaturedResultMessage(`Trade completed with ${opponentTeam.name}. Continue Sim to begin Season ${state.seasonYear + 1}.`);
}

function renderTradeSlotSelector(side, index) {
  const tradeState = getTradeState();
  const currentValue = side === "user" ? tradeState.userSlots[index] : tradeState.opponentSlots[index];
  const formatTradeDropdownOption = (playerData) => `${escapeHtml(playerData.name)} | $${Number(playerData.contract || 0)} cr | OVR ${playerData.ratings?.overall || "--"}`;
  let options = [];
  if (side === "user") {
    const selectedIds = new Set(tradeState.userSlots.filter(Boolean));
    if (currentValue) {
      selectedIds.delete(currentValue);
    }
    options = (getWorkingOffseasonTeam(state.franchiseTeam)?.players || [])
      .filter((playerData) => !selectedIds.has(playerData.offseasonId))
      .sort((a, b) => (Number(b.contract) || 0) - (Number(a.contract) || 0) || (b.ratings?.overall || 0) - (a.ratings?.overall || 0) || a.name.localeCompare(b.name))
      .map((playerData) => `<option value="${escapeHtml(playerData.offseasonId)}" ${currentValue === playerData.offseasonId ? "selected" : ""}>${formatTradeDropdownOption(playerData)}</option>`);
  } else {
    const opponentTeamCode = getLockedTradeOpponentTeamCode();
    if (!opponentTeamCode) {
      return `
        <article class="player-card trade-slot trade-slot-empty trade-slot-select-card">
          <div class="trade-slot-select-wrap">
            <select data-trade-slot-select="${side}:${index}" disabled>
              <option value="">Choose team first</option>
            </select>
          </div>
        </article>
      `;
    }
    const selectedIds = new Set(tradeState.opponentSlots.filter(Boolean));
    if (currentValue) {
      selectedIds.delete(currentValue);
    }
    options = (getWorkingOffseasonTeam(opponentTeamCode)?.players || [])
      .filter((playerData) => !selectedIds.has(playerData.offseasonId))
      .sort((a, b) => (Number(b.contract) || 0) - (Number(a.contract) || 0) || (b.ratings?.overall || 0) - (a.ratings?.overall || 0) || a.name.localeCompare(b.name))
      .map((playerData) => `<option value="${escapeHtml(playerData.offseasonId)}" ${currentValue === playerData.offseasonId ? "selected" : ""}>${formatTradeDropdownOption(playerData)}</option>`);
  }

  return `
    <article class="player-card trade-slot trade-slot-empty trade-slot-select-card">
      <div class="trade-slot-select-wrap">
        <select data-trade-slot-select="${side}:${index}">
          <option value="">Choose player</option>
          ${options.join("")}
        </select>
      </div>
    </article>
  `;
}

function renderTradeAssetCard(playerData, side, index) {
  if (!playerData) {
    return renderTradeSlotSelector(side, index);
  }
  ensurePlayerRuntimeState(playerData);
  const tradeValue = getPlayerTradeValue(playerData);
  const tradeStars = getTradeValueStarRating(playerData);
  const starsMarkup = renderTradeValueStars(tradeStars);
  return `
    <article class="player-card trade-slot trade-slot-filled trade-player-card">
      <button class="trade-slot-remove" type="button" data-trade-remove="${side}:${index}" aria-label="Remove ${escapeHtml(playerData.name)} from trade">&times;</button>
      <div class="player-header">
        <div>
          <h3>${escapeHtml(playerData.name)}</h3>
          <p class="player-meta">${escapeHtml(playerData.role)} &bull; ${escapeHtml(playerData.battingStyle || "--")}</p>
        </div>
        <span class="rating-badge">${playerData.ratings?.overall || "--"}</span>
      </div>
      <div class="player-ratings">
        <span>Bat<strong>${playerData.ratings?.batting || "--"}</strong></span>
        <span>Bowl<strong>${playerData.ratings?.bowling || "--"}</strong></span>
        <span>AR<strong>${playerData.ratings?.allRound || "--"}</strong></span>
        <span>Cltch<strong>${playerData.ratings?.clutch || "--"}</strong></span>
        <span>Fld<strong>${playerData.ratings?.fielding || "--"}</strong></span>
        <span>Lead<strong>${playerData.ratings?.leadership || "--"}</strong></span>
        <span>Int<strong>${playerData.ratings?.intent || "--"}</strong></span>
        <span>Comp<strong>${playerData.ratings?.composure || "--"}</strong></span>
        <span>Econ<strong>${playerData.ratings?.econ || "--"}</strong></span>
        <span>Wkts<strong>${playerData.ratings?.wkts || "--"}</strong></span>
      </div>
      <div class="trade-player-stars" aria-label="Trade value ${tradeValue}, rated ${tradeStars} out of 5 stars" title="Trade value ${tradeValue}">
        <span class="trade-player-stars-label">Trade Value</span>
        <span class="trade-player-stars-row">${starsMarkup}</span>
      </div>
    </article>
  `;
}

function renderTradeModal() {
  const panel = document.getElementById("trade-panel");
  if (!panel || !canOpenTradeWindow()) {
    return;
  }
  const tradeState = getTradeState();
  const assessment = getTradeAssessment();
  const tradeStateMessage = tradeState.gmMessage || "Select a team and build the package.";
  const officeMessage = tradeState.negotiationState === "accepted"
    ? (tradeState.officeMessage || "Trade completed!")
    : getUserOfficeSuggestion(assessment);
  const officeStatusClass = tradeState.negotiationState === "accepted"
    ? "is-pass"
    : getUserOfficeStatus(assessment);
  const opponentTeam = assessment?.opponentTeam || null;
  const userPlayers = tradeState.userSlots.map((playerId) => findTradePlayerById(playerId));
  const opponentPlayers = tradeState.opponentSlots.map((playerId) => findTradePlayerById(playerId));
  const teamOptions = state.offseason.workingTeams
    .filter((team) => team.code !== state.franchiseTeam)
    .map((team) => `<option value="${escapeHtml(team.code)}" ${getLockedTradeOpponentTeamCode() === team.code ? "selected" : ""}>${escapeHtml(team.code)} | ${escapeHtml(team.name)}</option>`)
    .join("");
  const userCapDelta = (assessment?.userOutgoingSalary || 0) - (assessment?.opponentOutgoingSalary || 0);
  const opponentCapDelta = (assessment?.opponentOutgoingSalary || 0) - (assessment?.userOutgoingSalary || 0);
  const userCapClass = userCapDelta < 0 && Math.abs(userCapDelta) > (state.offseason.budgets[state.franchiseTeam] || 0) ? "is-negative" : "is-positive";
  const opponentCapClass = opponentTeam && opponentCapDelta < 0 && Math.abs(opponentCapDelta) > (state.offseason.budgets[opponentTeam.code] || 0) ? "is-negative" : "is-positive";
  const userRosterUsed = assessment?.opponentTeam ? assessment.userRosterAfter : (getWorkingOffseasonTeam(state.franchiseTeam)?.players.length || 0);
  const opponentRosterUsed = assessment?.opponentTeam ? assessment.opponentRosterAfter : (opponentTeam ? opponentTeam.players.length : null);
  const userRosterClass = userRosterUsed > MAX_ROSTER_SIZE ? "is-negative" : "is-neutral";
  const opponentRosterClass = opponentRosterUsed !== null && opponentRosterUsed > MAX_ROSTER_SIZE ? "is-negative" : "is-neutral";

  panel.innerHTML = `
    <div class="offseason-summary-grid trade-summary-grid">
      <article class="offseason-summary-card">
        <span>Your Cap Space</span>
        <strong>${formatCrores(state.offseason.budgets[state.franchiseTeam] || 0)} <em class="trade-cap-delta ${userCapClass}">${formatTradeCapDelta(userCapDelta)} cr</em></strong>
      </article>
      <article class="offseason-summary-card">
        <span>Your Roster Space</span>
        <strong class="${userRosterClass === "is-negative" ? "trade-summary-negative" : ""}">${userRosterUsed}/${MAX_ROSTER_SIZE}</strong>
      </article>
      <article class="offseason-summary-card">
        <span>${escapeHtml(opponentTeam?.name || "Opponent")} Cap Space</span>
        <strong>${opponentTeam ? `${formatCrores(state.offseason.budgets[opponentTeam.code] || 0)} <em class="trade-cap-delta ${opponentCapClass}">${formatTradeCapDelta(opponentCapDelta)} cr</em>` : "--"}</strong>
      </article>
      <article class="offseason-summary-card">
        <span>${escapeHtml(opponentTeam?.code || "Opponent")} Roster Space</span>
        <strong class="${opponentRosterClass === "is-negative" ? "trade-summary-negative" : ""}">${opponentRosterUsed === null ? "--" : `${opponentRosterUsed}/${MAX_ROSTER_SIZE}`}</strong>
      </article>
    </div>
    <div class="trade-team-select-row">
      <label>
        <select data-trade-team-select>
          <option value="">Choose team</option>
          ${teamOptions}
        </select>
      </label>
    </div>
    <div class="trade-machine">
      <div class="trade-column">
        <div class="trade-side">
          ${[0, 1, 2].map((index) => renderTradeAssetCard(userPlayers[index] || null, "user", index)).join("")}
        </div>
      </div>
      <div class="trade-divider" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M7 7h10l-3.5-3.5M17 17H7l3.5 3.5M17 7l-3.5-3.5M7 17l3.5 3.5" />
        </svg>
      </div>
      <div class="trade-column">
        <div class="trade-side">
          ${[0, 1, 2].map((index) => renderTradeAssetCard(opponentPlayers[index] || null, "opponent", index)).join("")}
        </div>
      </div>
    </div>
    <div class="trade-status-panel trade-status-panel-dual">
      <div class="trade-status-row ${officeStatusClass}">
        <strong>Your Office</strong>
        <span>${officeMessage}</span>
      </div>
      <div class="trade-status-row ${tradeState.negotiationState === "accepted" ? "is-pass" : tradeState.negotiationState === "rejected" ? "is-fail" : "is-neutral"}">
        <strong>${escapeHtml(opponentTeam?.code || "GM")}</strong>
        <span>${tradeStateMessage}</span>
      </div>
    </div>
    <div class="offseason-footer">
      <div class="offseason-actions">
        <button class="ghost-btn" type="button" data-trade-reset>Reset Trade</button>
        <button class="primary-btn" type="button" data-trade-submit ${assessment?.complete ? "" : "disabled"}>Trade</button>
      </div>
    </div>
  `;
}

function renderRetentionModal() {
  const panel = document.getElementById("retention-panel");
  const team = getWorkingOffseasonTeam(state.franchiseTeam);
  if (!panel || !team || !state.offseason) {
    return;
  }
  const retainedSet = state.offseason.retainedMap[state.franchiseTeam];
  const retainedPlayers = team.players.filter((playerData) => retainedSet.has(playerData.offseasonId));
  const releasedPlayers = team.players.filter((playerData) => !retainedSet.has(playerData.offseasonId));
  const retainedSalary = retainedPlayers.reduce((total, playerData) => total + (Number(playerData.contract) || 0), 0);
  const remainingPurse = Math.max(0, state.offseason.salaryCap - retainedSalary);

  panel.innerHTML = `
    <div class="offseason-summary-grid">
      <article class="offseason-summary-card">
        <span>Next Season</span>
        <strong>${state.offseason.year}</strong>
      </article>
      <article class="offseason-summary-card">
        <span>Retained Salary</span>
        <strong>${formatCrores(retainedSalary)}</strong>
      </article>
      <article class="offseason-summary-card">
        <span>Purse After Retentions</span>
        <strong>${formatCrores(remainingPurse)}</strong>
      </article>
    </div>
    <p class="player-season-line offseason-helper">Choose who to retain for ${findTeam(state.franchiseTeam)?.name || state.franchiseTeam}. Released players go straight into the auction pool.</p>
    <div class="offseason-roster-list">
      ${team.players.map((playerData) => {
        const retained = retainedSet.has(playerData.offseasonId);
        return `
          <label class="offseason-player-row ${retained ? "is-retained" : "is-released"}">
            <input type="checkbox" data-retention-toggle="${escapeHtml(playerData.offseasonId)}" ${retained ? "checked" : ""} />
            <div class="offseason-player-main">
              <strong>${escapeHtml(playerData.name)}</strong>
              <span>${escapeHtml(playerData.role)} | OVR ${playerData.ratings.overall}</span>
            </div>
            <span class="offseason-player-tag">${retained ? "Retained" : "Released"}</span>
            <span class="offseason-player-salary">${formatCrores(playerData.contract)}</span>
          </label>
        `;
      }).join("")}
    </div>
    <div class="offseason-footer">
      <p class="player-season-line">${retainedPlayers.length} retained | ${releasedPlayers.length} released</p>
      <div class="offseason-actions">
        <button class="ghost-btn" type="button" data-retention-auto-pick>Auto Retain Core</button>
        <button class="primary-btn" type="button" data-retention-confirm>Confirm Retentions</button>
      </div>
    </div>
  `;
}

function renderAuctionModal() {
  const panel = document.getElementById("auction-panel");
  if (!panel || !state.offseason) {
    return;
  }
  const currentPlayer = state.offseason.auctionPool[0];
  const userTeam = getWorkingOffseasonTeam(state.franchiseTeam);
  const purse = state.offseason.budgets[state.franchiseTeam] || 0;
  const recentDeals = state.offseason.auctionHistory.slice(0, 8);
  const userDeals = state.offseason.auctionHistory.filter((entry) => entry.teamCode === state.franchiseTeam);
  const currentPlayerAuctionValue = getPlayerAuctionValue(currentPlayer);
  const userRosterSize = userTeam?.players.length || 0;
  const rosterFull = userRosterSize >= MAX_ROSTER_SIZE;
  const canAffordCurrentPlayer = purse >= currentPlayerAuctionValue;

  if (!currentPlayer) {
    panel.innerHTML = `
      <div class="offseason-history">
        <p class="how-to-play-item-label">Your Auction Signings</p>
        ${userDeals.length ? userDeals.map((entry) => `
          <div class="offseason-history-row">
            <strong>${escapeHtml(entry.playerName)}</strong>
            <span>${escapeHtml(entry.teamCode)}</span>
            <span>${formatCrores(entry.contract)}</span>
          </div>
        `).join("") : `<p class="player-season-line">Your team did not buy any players in this auction.</p>`}
      </div>
      <div class="offseason-footer">
        <p class="player-season-line">${userTeam?.players.length || 0} players on your roster | ${formatCrores(purse)} remaining</p>
        <div class="offseason-actions">
          <button class="primary-btn" type="button" data-auction-finish>Open Trade Window</button>
        </div>
      </div>
    `;
    return;
  }

  panel.innerHTML = `
    <div class="offseason-summary-grid">
      <article class="offseason-summary-card">
        <span>Your Purse</span>
        <strong>${formatCrores(purse)}</strong>
      </article>
      <article class="offseason-summary-card">
        <span>Your Squad</span>
        <strong>${userRosterSize}/${MAX_ROSTER_SIZE}</strong>
      </article>
      <article class="offseason-summary-card">
        <span>Players Left</span>
        <strong>${state.offseason.auctionPool.length}</strong>
      </article>
    </div>
    <article class="offseason-auction-card">
      <div class="player-header">
        <div>
          <p class="eyebrow">Auction Pool</p>
          <h3>${escapeHtml(currentPlayer.name)}</h3>
          <p class="player-meta">${escapeHtml(currentPlayer.role)} | ${escapeHtml(currentPlayer.originalTeamCode || currentPlayer.teamCode || "FA")}</p>
        </div>
        <span class="rating-badge">${currentPlayer.ratings.overall}</span>
      </div>
      <div class="player-ratings">
        <span>Age<strong>${currentPlayer.age || "--"}</strong></span>
        <span>Cost<strong>${formatCrores(currentPlayerAuctionValue)}</strong></span>
        <span>Bat<strong>${currentPlayer.ratings.batting}</strong></span>
        <span>Bowl<strong>${currentPlayer.ratings.bowling}</strong></span>
      </div>
      ${rosterFull ? `<p class="player-season-line">Squad full at ${MAX_ROSTER_SIZE} players. Release someone in retentions to buy again next year.</p>` : ""}
      <div class="offseason-actions offseason-actions-wide">
        <button class="primary-btn" type="button" data-auction-buy ${!canAffordCurrentPlayer || rosterFull ? "disabled" : ""} title="${rosterFull ? `Squad full (${MAX_ROSTER_SIZE}/${MAX_ROSTER_SIZE})` : !canAffordCurrentPlayer ? "Not enough purse" : "Buy this player"}">${rosterFull ? `Squad Full (${MAX_ROSTER_SIZE}/${MAX_ROSTER_SIZE})` : "Buy Player"}</button>
        <button class="ghost-btn" type="button" data-auction-pass>Pass to AI</button>
        <button class="ghost-btn" type="button" data-auction-auto>Auto Complete Auction</button>
      </div>
    </article>
    <div class="offseason-history">
      <p class="how-to-play-item-label">Recent Auction Results</p>
      ${recentDeals.length ? recentDeals.map((entry) => `
        <div class="offseason-history-row">
          <strong>${escapeHtml(entry.playerName)}</strong>
          <span>${escapeHtml(entry.teamCode)}</span>
          <span>${formatCrores(entry.contract)}</span>
        </div>
      `).join("") : `<p class="player-season-line">No bids yet. Start the auction to populate this feed.</p>`}
    </div>
  `;
}

function initOffseasonModals() {
  const retentionOverlay = document.getElementById("retention-overlay");
  const retentionBackdrop = document.getElementById("retention-backdrop");
  const retentionClose = document.getElementById("retention-close");
  const retentionPanel = document.getElementById("retention-panel");
  const auctionOverlay = document.getElementById("auction-overlay");
  const auctionBackdrop = document.getElementById("auction-backdrop");
  const auctionClose = document.getElementById("auction-close");
  const auctionPanel = document.getElementById("auction-panel");
  const tradeOverlay = document.getElementById("trade-overlay");
  const tradeBackdrop = document.getElementById("trade-backdrop");
  const tradeClose = document.getElementById("trade-close");
  const tradePanel = document.getElementById("trade-panel");
  if (!retentionOverlay || !retentionBackdrop || !retentionClose || !retentionPanel || !auctionOverlay || !auctionBackdrop || !auctionClose || !auctionPanel || !tradeOverlay || !tradeBackdrop || !tradeClose || !tradePanel) {
    return;
  }

  if (retentionOverlay.dataset.bound === "true") {
    return;
  }

  retentionClose.addEventListener("click", closeRetentionModal);
  retentionBackdrop.addEventListener("click", closeRetentionModal);
  auctionClose.addEventListener("click", closeAuctionModal);
  auctionBackdrop.addEventListener("click", closeAuctionModal);
  tradeClose.addEventListener("click", closeTradeModal);
  tradeBackdrop.addEventListener("click", closeTradeModal);

  retentionPanel.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-retention-toggle]");
    if (toggle) {
      return;
    }
    if (event.target.closest("[data-retention-auto-pick]")) {
      const team = getWorkingOffseasonTeam(state.franchiseTeam);
      if (!team || !state.offseason) {
        return;
      }
      state.offseason.retainedMap[state.franchiseTeam] = getAutoRetainedIds(team.players, 0.7, team.players.length);
      renderRetentionModal();
      return;
    }
    if (event.target.closest("[data-retention-confirm]")) {
      finalizeRetentionPhase();
      closeRetentionModal();
      openAuctionModal();
    }
  });

  retentionPanel.addEventListener("change", (event) => {
    const toggle = event.target.closest("[data-retention-toggle]");
    if (!toggle || !state.offseason) {
      return;
    }
    const retainedSet = state.offseason.retainedMap[state.franchiseTeam];
    if (toggle.checked) {
      if (!retainedSet.has(toggle.dataset.retentionToggle) && retainedSet.size >= MAX_ROSTER_SIZE) {
        toggle.checked = false;
        renderRetentionModal();
        return;
      }
      retainedSet.add(toggle.dataset.retentionToggle);
    } else {
      retainedSet.delete(toggle.dataset.retentionToggle);
    }
    renderRetentionModal();
  });

  auctionPanel.addEventListener("click", (event) => {
    if (!state.offseason) {
      return;
    }
    const currentPlayer = state.offseason.auctionPool[0];
    if (event.target.closest("[data-auction-finish]")) {
      state.offseason.phase = "trade";
      state.offseason.tradeHistory = state.offseason.tradeHistory || [];
      state.offseason.tradeState = createEmptyTradeState();
      closeAuctionModal();
      renderAll();
      renderFeaturedResultMessage(`Auction complete. Use the new trade button on your player cards, then click Continue Sim to start Season ${state.seasonYear + 1}.`);
      return;
    }
    if (!currentPlayer) {
      return;
    }
    if (event.target.closest("[data-auction-buy]")) {
      resolveAuctionPlayer(currentPlayer, true);
      renderAuctionModal();
      return;
    }
    if (event.target.closest("[data-auction-pass]")) {
      resolveAuctionPlayer(currentPlayer, false);
      renderAuctionModal();
      return;
    }
    if (event.target.closest("[data-auction-auto]")) {
      while (state.offseason.auctionPool.length) {
        autoResolveAuctionPlayer(state.offseason.auctionPool[0]);
      }
      renderAuctionModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    if (!retentionOverlay.hidden) {
      closeRetentionModal();
    }
    if (!auctionOverlay.hidden) {
      closeAuctionModal();
    }
    if (!tradeOverlay.hidden) {
      closeTradeModal();
    }
  });

  tradePanel.addEventListener("click", (event) => {
    if (!canOpenTradeWindow()) {
      return;
    }
    const openSlot = event.target.closest("[data-trade-open-slot]");
    if (openSlot) {
      const [side, index] = openSlot.dataset.tradeOpenSlot.split(":");
      setTradeActiveSlot(side, Number(index));
      return;
    }
    const remove = event.target.closest("[data-trade-remove]");
    if (remove) {
      const [side, index] = remove.dataset.tradeRemove.split(":");
      removePlayerFromTrade(side, Number(index));
      return;
    }
    const pick = event.target.closest("[data-trade-pick]");
    if (pick) {
      addPlayerToTrade(pick.dataset.tradePick);
      return;
    }
    if (event.target.closest("[data-trade-cancel-pick]")) {
      state.tradeModal.activeSlot = null;
      renderTradeModal();
      return;
    }
    if (event.target.closest("[data-trade-reset]")) {
      state.offseason.tradeState = createEmptyTradeState();
      state.tradeModal.activeSlot = null;
      renderTradeModal();
      return;
    }
    if (event.target.closest("[data-trade-submit]")) {
      executeTrade();
    }
  });

  tradePanel.addEventListener("change", (event) => {
    const slotSelect = event.target.closest("[data-trade-slot-select]");
    if (slotSelect) {
      const [side, index] = slotSelect.dataset.tradeSlotSelect.split(":");
      if (slotSelect.value) {
        state.tradeModal.activeSlot = { side, index: Number(index) };
        addPlayerToTrade(slotSelect.value);
      } else {
        removePlayerFromTrade(side, Number(index));
      }
      return;
    }
    const select = event.target.closest("[data-trade-team-select]");
    if (!select) {
      return;
    }
    setTradeOpponentTeam(select.value);
  });

  retentionOverlay.dataset.bound = "true";
}

function initSimulatorHowToPlayOverlay() {
  const getSteps = () => {
    const steps = [
      {
        label: "HOW TO PLAY",
        title: "Simulating Games",
        content: `
          <div class="how-to-play-sections">
            <article class="how-to-play-item">
              <p class="how-to-play-item-label">Simulate Game</p>
              <h3>Play the next scheduled match</h3>
              <p>Run your franchise's next fixture, update the standings, and move the season forward one result at a time.</p>
            </article>
            <article class="how-to-play-item">
              <p class="how-to-play-item-label">Simulate Season</p>
              <h3>Fast-forward the campaign</h3>
              <p>Resolve the remaining regular season and playoffs in one pass using your current lineup and impact-player choices.</p>
            </article>
            <article class="how-to-play-item">
              <p class="how-to-play-item-label">Matchup</p>
              <h3>Use the match card as your preview</h3>
              <p>Check the next opponent, team overalls, venue context, and week before you simulate, then use the same card to review match results once a game has been played.</p>
            </article>
          </div>
        `,
        target: null
      },
      {
        label: "HOW TO PLAY",
        title: "Pick the franchise you want to run",
        content: `
          <article class="how-to-play-item how-to-play-item-single">
            <p class="how-to-play-item-label">Team Hub</p>
            <h3>Choose Your Team</h3>
            <p>Use the Team Hub to switch franchises and compare each side's XI strength, batting, and bowling before you commit to a season path.</p>
          </article>
        `,
        target: "#team-hub-section"
      },
      {
        label: "HOW TO PLAY",
        title: "Tune your active XII before simming",
        content: `
          <div class="how-to-play-sections">
            <article class="how-to-play-item">
              <p class="how-to-play-item-label">Lineup Builder</p>
              <h3>Set the order of your active group</h3>
              <p>Use the Lineup Builder to shape your active XII, reorder the cards, and decide how you want your franchise set up before the next sim.</p>
            </article>
            <article class="how-to-play-item">
              <p class="how-to-play-item-label">Impact Subs</p>
              <h3>Choose flexible matchup options</h3>
              <p>Pick the impact-player options from the active group so the simulator can balance batting and bowling changes during a match.</p>
            </article>
            <article class="how-to-play-item">
              <p class="how-to-play-item-label">Bowling Plan</p>
              <h3>Map out who bowls each over</h3>
              <p>Open the Bowling Plan from the lineup helper to assign overs manually. Stuck? Click Auto Plan to restore the original bowling plan.</p>
            </article>
          </div>
        `,
        target: "#lineup-builder-section"
      },
      {
        label: "HOW TO PLAY",
        title: "Track the race across the league",
        content: `
          <div class="how-to-play-sections how-to-play-sections-double">
            <article class="how-to-play-item">
              <p class="how-to-play-item-label">League Leaders</p>
              <h3>Watch awards and season races</h3>
              <p>Follow the major award battles and season leaders here as the table and individual races change over the course of your sim.</p>
            </article>
            <article class="how-to-play-item">
              <p class="how-to-play-item-label">Top 5 Tracker</p>
              <h3>Check in with the top 5 across the league</h3>
              <p>Use the stat selector to check who is leading each category and keep tabs on the current top 5 in runs, wickets, averages, economy, impact, and other leaderboard races.</p>
            </article>
          </div>
        `,
        target: "#awards-watch-section"
      }
    ];

    steps.push({
      label: "HOW TO PLAY",
      title: "Carry your franchise into the next year",
      content: `
        <div class="how-to-play-sections how-to-play-sections-double">
          <article class="how-to-play-item">
            <p class="how-to-play-item-label">Continue Sim</p>
            <h3>Move into the offseason</h3>
            <p>After a full season ends, Continue Sim pushes your franchise into the offseason instead of simply replaying the same campaign.</p>
          </article>
          <article class="how-to-play-item">
            <p class="how-to-play-item-label">What Changes</p>
            <h3>Releases, mini-auction, trades</h3>
            <p>Continue your franchise's story by releasing players, buying new players in the mini-auction, and trading for other players across the league.</p>
          </article>
        </div>
      `,
      target: null
    });

    return steps;
  };
  const controls = initHowToPlayOverlay(getSteps);
  openSimulatorHowToPlayStep = controls?.openAtStep
    ? (stepIndex) => controls.openAtStep(stepIndex)
    : null;
}

function initCustomHowToPlayOverlay() {
  initHowToPlayOverlay([
    {
      label: "HOW TO PLAY",
      title: "Set up the opponent first",
      content: `
        <article class="how-to-play-item how-to-play-item-single">
          <p class="how-to-play-item-label">Opponent Setup</p>
          <h3>Choose the league team you want to face</h3>
          <p>Pick the opponent from the setup card first so the rest of the page can build the correct league XI for your custom matchup.</p>
        </article>
      `,
      target: null
    },
    {
      label: "HOW TO PLAY",
      title: "Build both sides of the matchup view",
      content: `
        <div class="how-to-play-sections how-to-play-sections-double">
          <article class="how-to-play-item">
            <p class="how-to-play-item-label">Your Team</p>
            <h3>Make your own team on the left</h3>
            <p>Use the Custom XI A section to build your own side player by player and shape the exact eleven you want to test.</p>
          </article>
          <article class="how-to-play-item">
            <p class="how-to-play-item-label">Opposing Team</p>
            <h3>See the picked league side on the right</h3>
            <p>The opponent you selected is shown on the right so you can compare your custom team against their current league XI.</p>
          </article>
        </div>
      `,
      target: "#custom-team-a"
    },
    {
      label: "HOW TO PLAY",
      title: "Check the simulation result at the bottom",
      content: `
        <article class="how-to-play-item how-to-play-item-single">
          <p class="how-to-play-item-label">Simulation Result</p>
          <h3>Check the scorecard in the bottom panel</h3>
          <p>After the sim runs, the full result appears in the bottom scorecard area with the complete match breakdown.</p>
        </article>
      `,
      target: "#custom-scorecard-section"
    },
    {
      label: "HOW TO PLAY",
      title: "Run the custom match",
      content: `
        <article class="how-to-play-item how-to-play-item-single">
          <p class="how-to-play-item-label">Simulate Match</p>
          <h3>Play the fixture once both teams are ready</h3>
          <p>Use Simulate Custom Match to run the game, then jump straight to the result and scorecard to review what happened.</p>
        </article>
      `,
      target: null
    }
  ]);
}

function initMakePlayerHowToPlayOverlay() {
  initHowToPlayOverlay([
    {
      label: "HOW TO PLAY",
      title: "Set up the player with the inputs",
      content: `
        <article class="how-to-play-item how-to-play-item-single">
          <p class="how-to-play-item-label">Inputs</p>
          <h3>Shape the player from the setup controls</h3>
          <p>Use the input fields and sliders to define the player's name, role traits, team, and attributes before you save them.</p>
        </article>
      `,
      target: ".make-player-grid"
    },
    {
      label: "HOW TO PLAY",
      title: "Manage the saved custom players",
      content: `
        <div class="how-to-play-sections how-to-play-sections-double">
          <article class="how-to-play-item">
            <p class="how-to-play-item-label">Custom Players</p>
            <h3>See where saved players are stored on the page</h3>
            <p>Your created players show up in the Custom Players section, and you can delete them from that list at any time.</p>
          </article>
          <article class="how-to-play-item">
            <p class="how-to-play-item-label">Browser Storage</p>
            <h3>They live in this browser's local storage</h3>
            <p>These custom players are stored in the browser's local storage, so they stay available here until you remove them.</p>
          </article>
        </div>
      `,
      target: "#make-player-custom-list"
    },
    {
      label: "HOW TO PLAY",
      title: "Preview the card and add the player to a team",
      content: `
        <article class="how-to-play-item how-to-play-item-single">
          <p class="how-to-play-item-label">Preview</p>
          <h3>Review the player card and add them to the league</h3>
          <p>Use the preview card at the top to see the generated player card, then hit Add To Team when you're ready to place them into the selected side.</p>
        </article>
      `,
      target: null
    }
  ]);
}

function formatSeasonChipLabel(baseLabel) {
  if (!state.season?.table?.length) {
    return baseLabel;
  }

  const franchiseRow = state.season.table.find((row) => row.team.code === state.franchiseTeam);
  const completedWeeks = state.season.currentRound || 0;
  if (!franchiseRow || completedWeeks <= 0) {
    return baseLabel;
  }

  const ties = Math.max(0, franchiseRow.points - franchiseRow.wins * 2);
  const record = ties > 0
    ? `${franchiseRow.wins}-${franchiseRow.losses}-${ties}`
    : `${franchiseRow.wins}-${franchiseRow.losses}`;

  return `${baseLabel} | After WEEK ${completedWeeks}: ${record}`;
}

function updateSimulationControls() {
  const nextButton = document.getElementById("simulate-next");
  const seasonButton = document.getElementById("simulate-season");
  if (!nextButton || !seasonButton) {
    return;
  }

  if (state.season.champion) {
    nextButton.textContent = "Restart Sim";
    nextButton.className = "primary-btn";
    seasonButton.textContent = "Continue Sim";
    seasonButton.hidden = false;
    seasonButton.style.display = "";
    return;
  }

  nextButton.textContent = "Simulate Game";
  nextButton.className = "primary-btn";
  seasonButton.textContent = "Simulate Season";
  seasonButton.hidden = false;
  seasonButton.style.display = "";
}

function renderTeamCards() {
  const container = document.getElementById("team-cards");
  const nextFixture = getNextFixtureForTeam(state.franchiseTeam);
  const opponentCode = nextFixture
    ? (nextFixture.homeCode === state.franchiseTeam ? nextFixture.awayCode : nextFixture.homeCode)
    : null;
  const activeTeams = getActiveTeams();
  container.innerHTML = activeTeams.map((team) => {
    const selectedClass = team.code === state.franchiseTeam ? "selected" : "";
    const opponentClass = team.code === opponentCode ? "opponent" : "";
    const lineupTeam = buildLineupTeam(team);
    return `
      <button class="team-card ${selectedClass} ${opponentClass}" data-team="${team.code}" style="background:
        linear-gradient(135deg, ${hexToRgba(team.colors[0], 0.18)}, rgba(255,255,255,0.03)),
        linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));">
        <div class="team-card-top">
          <div>
            <p class="eyebrow">${team.code}</p>
            <h3>${team.name}</h3>
          </div>
          <span class="rating-badge">${lineupTeam.teamRatings.overall}</span>
        </div>
        <p class="team-subtitle">${team.identity} built around ${team.venue.toLowerCase()}.</p>
        <div class="team-metrics">
          <div class="metric"><strong>${lineupTeam.teamRatings.batting}</strong><span>Bat</span></div>
          <div class="metric"><strong>${lineupTeam.teamRatings.bowling}</strong><span>Bowl</span></div>
          <div class="metric"><strong>${lineupTeam.teamRatings.overall}</strong><span>XI OVR</span></div>
        </div>
      </button>
    `;
  }).join("");

  container.querySelectorAll(".team-card").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedTeam = button.dataset.team;
      state.franchiseTeam = state.selectedTeam;
      state.homeTeam = state.selectedTeam;
      syncFeaturedMatchToSeason();
      const franchiseSelect = document.getElementById("franchise-team-select");
      const opponentSelect = document.getElementById("opponent-team-select");
      if (franchiseSelect) franchiseSelect.value = state.homeTeam;
      if (opponentSelect) opponentSelect.value = state.awayTeam;
      renderFeaturedMatchup();
      renderTeamCards();
      renderRoster();
    });
  });
}

function getLineupCardPlayerKey(teamCode, playerData) {
  return `${teamCode}:${playerData.customId || playerData.name}`;
}

function isLineupCardFlipped(teamCode, playerData) {
  return Boolean(state.lineupCardFlips[getLineupCardPlayerKey(teamCode, playerData)]);
}

function toggleLineupCardFlip(teamCode, playerData) {
  const key = getLineupCardPlayerKey(teamCode, playerData);
  if (state.lineupCardFlips[key]) {
    delete state.lineupCardFlips[key];
    return;
  }
  state.lineupCardFlips[key] = true;
}

function getLineupCardView(teamCode, playerData) {
  return state.lineupCardViews[getLineupCardPlayerKey(teamCode, playerData)] || "stats";
}

function setLineupCardView(teamCode, playerData, view) {
  state.lineupCardViews[getLineupCardPlayerKey(teamCode, playerData)] = view;
}

function getSeasonSnapshotForPlayer(teamCode, playerData) {
  const seasonStats = state.season?.playerStats?.find((entry) => (
    entry.teamCode === teamCode &&
    ((playerData.customId && entry.customId === playerData.customId) || entry.name === playerData.name)
  ));
  return seasonStats || createSeasonPlayerSnapshot(playerData, teamCode);
}

function getHistoricHighestScore(playerData, seasonStats) {
  ensurePlayerRuntimeState(playerData);
  const career = playerData.careerRecords;
  const useSeasonValue = (seasonStats.highestScore || 0) > (career.highestScore || 0)
    || (
      (seasonStats.highestScore || 0) === (career.highestScore || 0) &&
      (seasonStats.highestScore || 0) > 0 &&
      (seasonStats.highestScoreBalls || 0) > 0 &&
      ((career.highestScoreBalls || 0) === 0 || (seasonStats.highestScoreBalls || 0) < (career.highestScoreBalls || 0))
    );
  const score = useSeasonValue ? (seasonStats.highestScore || 0) : (career.highestScore || 0);
  const notOut = useSeasonValue ? Boolean(seasonStats.highestScoreNotOut) : Boolean(career.highestScoreNotOut);
  return score > 0 ? `${score}${notOut ? "*" : ""}` : "--";
}

function getHistoricBestBowling(playerData, seasonStats) {
  ensurePlayerRuntimeState(playerData);
  const career = playerData.careerRecords;
  const seasonWickets = seasonStats.bestBowlingWickets || 0;
  const seasonEconomy = seasonStats.bestBowlingEconomy ?? 99;
  const seasonRuns = seasonStats.bestBowlingRuns ?? 999;
  const useSeasonValue = seasonWickets > (career.bestBowlingWickets || 0)
    || (
      seasonWickets === (career.bestBowlingWickets || 0) &&
      seasonEconomy < (career.bestBowlingEconomy ?? 99)
    )
    || (
      seasonWickets === (career.bestBowlingWickets || 0) &&
      seasonEconomy === (career.bestBowlingEconomy ?? 99) &&
      seasonRuns < (career.bestBowlingRuns ?? 999)
    );
  const wickets = useSeasonValue ? seasonWickets : (career.bestBowlingWickets || 0);
  const runs = useSeasonValue ? seasonRuns : (career.bestBowlingRuns ?? 999);
  return wickets > 0 ? `${wickets}/${runs}` : "--";
}

function buildLineupBackStats(playerData, teamCode) {
  const seasonStats = getSeasonSnapshotForPlayer(teamCode, playerData);
  const matches = seasonStats.matchesPlayed || 0;
  const highestScore = seasonStats.highestScore > 0
    ? `${seasonStats.highestScore}${seasonStats.highestScoreNotOut ? "*" : ""}`
    : "--";
  const battingAverage = seasonStats.seasonDismissals > 0
    ? seasonStats.seasonBattingAverage.toFixed(2)
    : (seasonStats.seasonRuns > 0 ? "NO" : "--");
  const strikeRate = seasonStats.seasonBallsFaced > 0
    ? seasonStats.seasonStrikeRate.toFixed(1)
    : "--";
  const bowlingAverage = seasonStats.seasonWickets > 0
    ? seasonStats.seasonBowlingAverage.toFixed(2)
    : "--";
  const economy = seasonStats.seasonOversBalls > 0
    ? seasonStats.seasonEconomy.toFixed(2)
    : "--";
  const bestBowling = seasonStats.bestBowlingWickets > 0
    ? `${seasonStats.bestBowlingWickets}/${seasonStats.bestBowlingRuns}`
    : "--";
  const overs = seasonStats.seasonOversBalls > 0
    ? formatOversFromBalls(seasonStats.seasonOversBalls)
    : "--";

  return {
    summary: `${matches} match${matches === 1 ? "" : "es"} played`,
    batting: [
      { label: "Runs", value: `${seasonStats.seasonRuns}` },
      { label: "HS", value: highestScore },
      { label: "Avg", value: battingAverage },
      { label: "SR", value: strikeRate }
    ],
    bowling: [
      { label: "Wkts", value: `${Math.round(seasonStats.seasonWickets)}` },
      { label: "BBF", value: bestBowling },
      { label: "Econ", value: economy },
      { label: "Bowl Avg", value: bowlingAverage }
    ]
  };
}

function buildLineupBackProfile(playerData, teamCode) {
  const seasonStats = getSeasonSnapshotForPlayer(teamCode, playerData);
  const highestScore = getHistoricHighestScore(playerData, seasonStats);
  const bestBowling = getHistoricBestBowling(playerData, seasonStats);
  const age = playerData.age || seasonStats.age || "--";
  const contractValue = playerData.contract ?? seasonStats.contract;
  const contract = contractValue !== null && contractValue !== undefined && contractValue !== ""
    ? `${Number(contractValue).toFixed(Number(contractValue) % 1 === 0 ? 0 : 1)} cr`
    : "--";
  const awardCounts = ensurePlayerRuntimeState(playerData).awardCounts;

  return {
    summary: "Player Details",
    details: [
      { label: "Age", value: `${age}` },
      { label: "Contract", value: contract },
      { label: "HS", value: highestScore },
      { label: "BBF", value: bestBowling },
      { label: "Best Subs", value: `${awardCounts.bestSubs || 0}` },
      { label: "MVPs", value: `${awardCounts.mvps || 0}` },
      { label: "Orange Caps", value: `${awardCounts.orangeCaps || 0}` },
      { label: "Purple Caps", value: `${awardCounts.purpleCaps || 0}` }
    ]
  };
}

function renderRoster() {
  return renderRosterWithStatsCard();
  const team = findTeam(state.franchiseTeam);
  const lineupTeam = buildLineupTeam(team);
  document.getElementById("roster-title").textContent = `${team.name} XI`;
  document.getElementById("roster-team-style").textContent = team.identity;
  document.getElementById("roster-team-ovr").textContent = `XI OVR ${lineupTeam.teamRatings.overall}`;
  renderImpactSubWarning(team.code);

  const roster = getLineupForTeam(team.code)
    .map((name) => team.players.find((playerData) => playerData.name === name))
    .filter(Boolean)
    .map((playerData, index) => ({ ...playerData, lineupIndex: index, inStartingXi: index < 12 }));
  document.getElementById("player-grid").innerHTML = roster.map((playerData) => `
    <article class="player-card lineup-card ${playerData.inStartingXi ? "is-starting-xi" : "is-bench"} ${state.selectedLineupSwap?.teamCode === team.code && state.selectedLineupSwap?.index === playerData.lineupIndex ? "is-selected" : ""}" draggable="true" data-lineup-card="${playerData.lineupIndex}">
      <div class="player-header">
        <div>
          <h3>${playerData.name}</h3>
          <p class="player-meta">${playerData.role} • ${playerData.battingStyle}</p>
        </div>
        <span class="rating-badge">${playerData.ratings.overall}</span>
      </div>
      <div class="lineup-card-controls">
        <button class="ghost-btn impact-sub-btn ${isImpactSubSelected(team.code, playerData.lineupIndex) ? "is-active" : ""}" type="button" data-impact-sub data-lineup-index="${playerData.lineupIndex}">${isImpactSubSelected(team.code, playerData.lineupIndex) ? "Impact Player" : "Make Impact Player"}</button>
      </div>
      <div class="player-ratings">
        <span>Bat<strong>${playerData.ratings.batting}</strong></span>
        <span>Bowl<strong>${playerData.ratings.bowling}</strong></span>
        <span>AR<strong>${playerData.ratings.allRound}</strong></span>
        <span>Cltch<strong>${playerData.ratings.clutch}</strong></span>
        <span>Fld<strong>${playerData.ratings.fielding}</strong></span>
        <span>Lead<strong>${playerData.ratings.leadership}</strong></span>
        <span>Intent<strong>${playerData.ratings.intent}</strong></span>
        <span>Comp<strong>${playerData.ratings.composure}</strong></span>
        <span>Econ<strong>${playerData.ratings.econ}</strong></span>
        <span>WktTk<strong>${playerData.ratings.wkts}</strong></span>
      </div>
      <p class="player-season-line">${playerData.inStartingXi ? "Inside the active playing XII for the next game." : "Currently outside the XII. Move this card above slot 13 to activate it."}</p>
    </article>
  `).join("");
  document.querySelectorAll("[data-impact-sub]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleImpactSub(team.code, Number(button.dataset.lineupIndex));
    });
  });
  document.querySelectorAll("[data-lineup-card]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("[data-impact-sub]")) {
        return;
      }
      const clickedIndex = Number(card.dataset.lineupCard);
      const currentSelection = state.selectedLineupSwap;
      if (!currentSelection || currentSelection.teamCode !== team.code) {
        state.selectedLineupSwap = { teamCode: team.code, index: clickedIndex };
        renderRoster();
        return;
      }
      if (currentSelection.index === clickedIndex) {
        state.selectedLineupSwap = null;
        renderRoster();
        return;
      }
      state.selectedLineupSwap = null;
      reorderLineupPlayer(team.code, currentSelection.index, clickedIndex);
    });
  });
  document.querySelectorAll("[data-lineup-card]").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      state.draggedLineupIndex = Number(card.dataset.lineupCard);
      state.selectedLineupSwap = null;
      card.classList.add("is-dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", card.dataset.lineupCard);
      }
    });
    card.addEventListener("dragend", () => {
      state.draggedLineupIndex = null;
      card.classList.remove("is-dragging");
      document.querySelectorAll("[data-lineup-card]").forEach((node) => node.classList.remove("is-drop-target"));
    });
    card.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (state.draggedLineupIndex === null) return;
      card.classList.add("is-drop-target");
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    });
    card.addEventListener("dragleave", () => {
      card.classList.remove("is-drop-target");
    });
    card.addEventListener("drop", (event) => {
      event.preventDefault();
      const fromIndex = state.draggedLineupIndex;
      const toIndex = Number(card.dataset.lineupCard);
      card.classList.remove("is-drop-target");
      if (fromIndex === null || Number.isNaN(toIndex) || fromIndex === toIndex) return;
      reorderLineupPlayer(team.code, fromIndex, toIndex);
    });
  });
}

function renderRosterWithStatsCard() {
  const team = findTeam(state.franchiseTeam);
  const lineupTeam = buildLineupTeam(team);
  const tradeWindowOpen = canOpenTradeWindow();
  document.getElementById("roster-title").textContent = `${team.name} XI`;
  document.getElementById("roster-team-style").textContent = team.identity;
  document.getElementById("roster-team-ovr").textContent = `XI OVR ${lineupTeam.teamRatings.overall}`;
  renderImpactSubWarning(team.code);
  renderBowlingPlanEditor(team.code);

  const roster = getLineupForTeam(team.code)
    .map((name) => team.players.find((playerData) => playerData.name === name))
    .filter(Boolean)
    .map((playerData, index) => ({ ...playerData, lineupIndex: index, inStartingXi: index < 12 }));

  document.getElementById("player-grid").innerHTML = roster.map((playerData) => {
    const stats = buildLineupBackStats(playerData, team.code);
    const profile = buildLineupBackProfile(playerData, team.code);
    const playerKey = getLineupCardPlayerKey(team.code, playerData);
    const isFlipped = isLineupCardFlipped(team.code, playerData);
    const activeBackView = getLineupCardView(team.code, playerData);

    return `
      <article class="player-card lineup-card ${playerData.inStartingXi ? "is-starting-xi" : "is-bench"} ${state.selectedLineupSwap?.teamCode === team.code && state.selectedLineupSwap?.index === playerData.lineupIndex ? "is-selected" : ""} ${isFlipped ? "is-flipped" : ""}" draggable="true" data-lineup-card="${playerData.lineupIndex}">
        <div class="lineup-card-inner">
          <section class="lineup-card-face lineup-card-front">
            <div class="player-header">
              <div>
                <h3>${playerData.name}</h3>
                <p class="player-meta">${playerData.role} &bull; ${playerData.battingStyle}</p>
              </div>
              <span class="rating-badge">${playerData.ratings.overall}</span>
            </div>
            <div class="lineup-card-controls">
              <button class="ghost-btn impact-sub-btn ${isImpactSubSelected(team.code, playerData.lineupIndex) ? "is-active" : ""}" type="button" data-impact-sub data-lineup-index="${playerData.lineupIndex}">${isImpactSubSelected(team.code, playerData.lineupIndex) ? "Impact Player" : "Make Impact Player"}</button>
            </div>
            <div class="player-ratings">
              <span>Bat<strong>${playerData.ratings.batting}</strong></span>
              <span>Bowl<strong>${playerData.ratings.bowling}</strong></span>
              <span>AR<strong>${playerData.ratings.allRound}</strong></span>
              <span>Cltch<strong>${playerData.ratings.clutch}</strong></span>
              <span>Fld<strong>${playerData.ratings.fielding}</strong></span>
              <span>Lead<strong>${playerData.ratings.leadership}</strong></span>
              <span>Intent<strong>${playerData.ratings.intent}</strong></span>
              <span>Comp<strong>${playerData.ratings.composure}</strong></span>
              <span>Econ<strong>${playerData.ratings.econ}</strong></span>
              <span>WktTk<strong>${playerData.ratings.wkts}</strong></span>
            </div>
            <div class="lineup-card-toggle-row">
              ${tradeWindowOpen ? `
                <button class="lineup-trade-trigger" type="button" data-trade-trigger="${escapeHtml(playerData.offseasonId || getOffseasonPlayerId(playerData, team.code, playerData.lineupIndex))}" aria-label="Open trade for ${escapeHtml(playerData.name)}">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M7 7h9l-3-3M17 17H8l3 3M17 7l-4-3M7 17l4 3" />
                  </svg>
                </button>
              ` : ""}
              <button class="player-ratings-toggle lineup-card-front-toggle ${activeBackView === "profile" && isFlipped ? "is-active" : ""}" type="button" data-lineup-profile-toggle data-lineup-player-key="${escapeHtml(playerKey)}" aria-label="Show player card details" aria-pressed="${activeBackView === "profile" && isFlipped ? "true" : "false"}">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <circle cx="11" cy="11" r="5.5" />
                  <path d="M16 16L21 21" />
                </svg>
              </button>
              <button class="player-ratings-toggle lineup-card-front-toggle ${activeBackView === "stats" && isFlipped ? "is-active" : ""}" type="button" data-lineup-stats-toggle data-lineup-player-key="${escapeHtml(playerKey)}" aria-label="Show player stats" aria-pressed="${activeBackView === "stats" && isFlipped ? "true" : "false"}">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M5 18V11M12 18V7M19 18V13" />
                </svg>
              </button>
            </div>
          </section>
          <section class="lineup-card-face lineup-card-back">
            <div class="player-header">
              <div>
                <h3>${playerData.name}</h3>
                <p class="player-meta">${playerData.role} &bull; ${playerData.battingStyle}</p>
              </div>
              <span class="rating-badge">${playerData.ratings.overall}</span>
            </div>
            <div class="lineup-card-stats-summary">${activeBackView === "profile" ? profile.summary : stats.summary}</div>
            ${activeBackView === "profile" ? `
              <div class="lineup-card-stats-block">
                <p class="lineup-card-stats-label">Profile</p>
                <div class="lineup-card-stats-grid">
                  ${profile.details.map((item) => `
                    <span><small>${item.label}</small><strong>${item.value}</strong></span>
                  `).join("")}
                </div>
              </div>
            ` : `
              <div class="lineup-card-stats-block">
                <p class="lineup-card-stats-label">Batting</p>
                <div class="lineup-card-stats-grid">
                  ${stats.batting.map((item) => `
                    <span><small>${item.label}</small><strong>${item.value}</strong></span>
                  `).join("")}
                </div>
              </div>
              <div class="lineup-card-stats-block">
                <p class="lineup-card-stats-label">Bowling</p>
                <div class="lineup-card-stats-grid">
                  ${stats.bowling.map((item) => `
                    <span><small>${item.label}</small><strong>${item.value}</strong></span>
                  `).join("")}
                </div>
              </div>
            `}
            <div class="lineup-card-toggle-row lineup-card-toggle-row-back">
              ${tradeWindowOpen ? `
                <button class="lineup-trade-trigger" type="button" data-trade-trigger="${escapeHtml(playerData.offseasonId || getOffseasonPlayerId(playerData, team.code, playerData.lineupIndex))}" aria-label="Open trade for ${escapeHtml(playerData.name)}">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M7 7h9l-3-3M17 17H8l3 3M17 7l-4-3M7 17l4 3" />
                  </svg>
                </button>
              ` : ""}
              <button class="player-ratings-toggle lineup-card-back-toggle ${activeBackView === "profile" ? "is-active" : ""}" type="button" data-lineup-profile-toggle data-lineup-player-key="${escapeHtml(playerKey)}" aria-label="Show player card details" aria-pressed="${activeBackView === "profile" ? "true" : "false"}">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <circle cx="11" cy="11" r="5.5" />
                  <path d="M16 16L21 21" />
                </svg>
              </button>
              <button class="player-ratings-toggle lineup-card-back-toggle ${activeBackView === "stats" ? "is-active" : ""}" type="button" data-lineup-stats-toggle data-lineup-player-key="${escapeHtml(playerKey)}" aria-label="Show player stats" aria-pressed="${activeBackView === "stats" ? "true" : "false"}">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M5 18V11M12 18V7M19 18V13" />
                </svg>
              </button>
            </div>
          </section>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-impact-sub]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleImpactSub(team.code, Number(button.dataset.lineupIndex));
    });
  });

  document.querySelectorAll("[data-trade-trigger]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openTradeModal(button.dataset.tradeTrigger);
    });
  });

  document.querySelectorAll("[data-lineup-stats-toggle]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const playerKey = button.dataset.lineupPlayerKey;
      const targetPlayer = roster.find((entry) => getLineupCardPlayerKey(team.code, entry) === playerKey);
      if (!targetPlayer) {
        return;
      }
      if (isLineupCardFlipped(team.code, targetPlayer) && getLineupCardView(team.code, targetPlayer) === "stats") {
        delete state.lineupCardFlips[playerKey];
        renderRosterWithStatsCard();
        return;
      }
      setLineupCardView(team.code, targetPlayer, "stats");
      state.lineupCardFlips[playerKey] = true;
      renderRosterWithStatsCard();
    });
  });

  document.querySelectorAll("[data-lineup-profile-toggle]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const playerKey = button.dataset.lineupPlayerKey;
      const targetPlayer = roster.find((entry) => getLineupCardPlayerKey(team.code, entry) === playerKey);
      if (!targetPlayer) {
        return;
      }
      if (isLineupCardFlipped(team.code, targetPlayer) && getLineupCardView(team.code, targetPlayer) === "profile") {
        delete state.lineupCardFlips[playerKey];
        renderRosterWithStatsCard();
        return;
      }
      setLineupCardView(team.code, targetPlayer, "profile");
      state.lineupCardFlips[playerKey] = true;
      renderRosterWithStatsCard();
    });
  });

  document.querySelectorAll("[data-lineup-card]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (
        event.target.closest("[data-impact-sub]") ||
        event.target.closest("[data-trade-trigger]") ||
        event.target.closest("[data-lineup-stats-toggle]") ||
        event.target.closest("[data-lineup-profile-toggle]")
      ) {
        return;
      }
      const clickedIndex = Number(card.dataset.lineupCard);
      const currentSelection = state.selectedLineupSwap;
      if (!currentSelection || currentSelection.teamCode !== team.code) {
        state.selectedLineupSwap = { teamCode: team.code, index: clickedIndex };
        renderRosterWithStatsCard();
        return;
      }
      if (currentSelection.index === clickedIndex) {
        state.selectedLineupSwap = null;
        renderRosterWithStatsCard();
        return;
      }
      state.selectedLineupSwap = null;
      reorderLineupPlayer(team.code, currentSelection.index, clickedIndex);
    });
  });

  document.querySelectorAll("[data-lineup-card]").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      state.draggedLineupIndex = Number(card.dataset.lineupCard);
      state.selectedLineupSwap = null;
      card.classList.add("is-dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", card.dataset.lineupCard);
      }
    });
    card.addEventListener("dragend", () => {
      state.draggedLineupIndex = null;
      card.classList.remove("is-dragging");
      document.querySelectorAll("[data-lineup-card]").forEach((node) => node.classList.remove("is-drop-target"));
    });
    card.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (state.draggedLineupIndex === null) return;
      card.classList.add("is-drop-target");
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    });
    card.addEventListener("dragleave", () => {
      card.classList.remove("is-drop-target");
    });
    card.addEventListener("drop", (event) => {
      event.preventDefault();
      const fromIndex = state.draggedLineupIndex;
      const toIndex = Number(card.dataset.lineupCard);
      card.classList.remove("is-drop-target");
      if (fromIndex === null || Number.isNaN(toIndex) || fromIndex === toIndex) return;
      reorderLineupPlayer(team.code, fromIndex, toIndex);
    });
  });
}

function renderLineupEditor(team) {
  const container = document.getElementById("lineup-editor");
  if (!container) return;
  const lineup = getLineupForTeam(team.code);
  const options = team.players.map((playerData) =>
    `<option value="${escapeHtml(playerData.name)}">${escapeHtml(playerData.name)} • ${playerData.ratings.overall}</option>`
  ).join("");

  container.innerHTML = `
    <div class="scorecard-block">
      <p class="player-season-line">Choose the active XII and batting order for ${team.name}. Slots 1 and 12 default to the impact-player pool for single-game sims.</p>
    </div>
    <div class="lineup-grid">
      ${lineup.map((playerName, index) => `
        <label class="lineup-slot">
          <span>Batting Slot ${index + 1}</span>
          <select data-lineup-slot="${index}">
            ${options.replace(`value="${escapeHtml(playerName)}"`, `value="${escapeHtml(playerName)}" selected`)}
          </select>
        </label>
      `).join("")}
    </div>
  `;

  container.querySelectorAll("[data-lineup-slot]").forEach((select) => {
    select.addEventListener("change", (event) => {
      updateLineupSlot(team.code, Number(event.target.dataset.lineupSlot), event.target.value);
    });
  });
}

function getLineupForTeam(teamCode) {
  const team = findTeam(teamCode);
  const fallback = team.players.map((playerData) => playerData.name);
  const existing = state.teamLineups?.[teamCode];
  if (!existing?.length) {
    state.teamLineups[teamCode] = fallback;
    return fallback;
  }

  const validNames = team.players.map((playerData) => playerData.name);
  const filtered = existing.filter((name) => validNames.includes(name));
  validNames.forEach((name) => {
    if (!filtered.includes(name)) {
      filtered.push(name);
    }
  });
  state.teamLineups[teamCode] = filtered;
  return state.teamLineups[teamCode];
}

function isPlayerInStartingXi(teamCode, playerName) {
  return getLineupForTeam(teamCode).slice(0, 12).includes(playerName);
}

function isImpactSubSelected(teamCode, lineupIndex) {
  const lineup = getLineupForTeam(teamCode);
  return getImpactSubNames(teamCode).includes(lineup[lineupIndex]);
}

function toggleImpactSub(teamCode, lineupIndex) {
  const lineup = [...getLineupForTeam(teamCode)];
  let targetIndex = lineupIndex;
  if (lineupIndex >= 12) {
    const twelfthIndex = Math.min(11, lineup.length - 1);
    if (twelfthIndex < 0 || lineupIndex >= lineup.length) return;
    [lineup[twelfthIndex], lineup[lineupIndex]] = [lineup[lineupIndex], lineup[twelfthIndex]];
    state.teamLineups[teamCode] = lineup;
    targetIndex = twelfthIndex;
  }

  const targetName = lineup[targetIndex];
  if (!targetName) return;
  const selected = new Set(getImpactSubNames(teamCode));
  if (selected.has(targetName)) {
    selected.delete(targetName);
  } else if (selected.size >= 2) {
    selected.clear();
    selected.add(targetName);
  } else {
    selected.add(targetName);
  }
  state.impactSubs[teamCode] = [...selected];
  if (getImpactSubNames(teamCode).length === 2) {
    state.lineupValidationTeam = null;
  }
  renderRoster();
}

function getDefaultImpactSubNames(teamCode) {
  const lineup = getLineupForTeam(teamCode);
  if (!lineup.length) return [];
  const activeTwelve = lineup.slice(0, 12);
  const preferred = DEFAULT_IMPACT_PLAYERS[teamCode] || [];
  const selected = preferred.filter((name) => activeTwelve.includes(name));
  if (selected.length === 2) {
    return selected;
  }
  return [...new Set([activeTwelve[0], activeTwelve[Math.min(11, activeTwelve.length - 1)]]).values()].filter(Boolean);
}

function getImpactSubIndices(teamCode) {
  const lineup = getLineupForTeam(teamCode);
  const activeTwelve = lineup.slice(0, 12);
  return getImpactSubNames(teamCode)
    .map((name) => activeTwelve.indexOf(name))
    .filter((index) => index !== -1)
    .sort((a, b) => a - b);
}

function getImpactSubNames(teamCode) {
  const lineup = getLineupForTeam(teamCode);
  const activeTwelve = lineup.slice(0, 12);
  const saved = state.impactSubs?.[teamCode];
  if (!Array.isArray(saved)) {
    const defaults = getDefaultImpactSubNames(teamCode);
    state.impactSubs[teamCode] = defaults;
    return defaults;
  }

  const normalized = [...new Set(saved)]
    .filter((name) => typeof name === "string" && activeTwelve.includes(name));
  const defaults = getDefaultImpactSubNames(teamCode);
  if (!normalized.length && defaults.length) {
    state.impactSubs[teamCode] = defaults;
    return defaults;
  }
  if (normalized.length !== saved.length || normalized.some((value, index) => value !== saved[index])) {
    state.impactSubs[teamCode] = normalized;
  }
  return normalized;
}

function renderImpactSubWarning(teamCode) {
  const container = document.getElementById("lineup-impact-warning");
  if (!container) return;
  if (state.lineupValidationTeam === teamCode && getImpactSubNames(teamCode).length !== 2) {
    container.innerHTML = `
      <div class="lineup-warning lineup-helper-row">
        <div>
          <strong>Choose 2 impact players before simulating.</strong>
          <span>Select exactly two players from the first 12 cards using the Impact Player button.</span>
        </div>
        <div class="lineup-helper-actions">
          <button id="auto-starting-xii" class="ghost-btn lineup-helper-action" type="button">Auto XII</button>
          <button id="open-bowling-plan" class="ghost-btn lineup-helper-action" type="button">Bowling Plan</button>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="lineup-helper lineup-helper-row">
        <div>
          <strong>Impact Players</strong>
          <span>The active XII is the first 12 players. Select 2 impact players from that group.</span>
        </div>
        <div class="lineup-helper-actions">
          <button id="auto-starting-xii" class="ghost-btn lineup-helper-action" type="button">Auto XII</button>
          <button id="open-bowling-plan" class="ghost-btn lineup-helper-action" type="button">Bowling Plan</button>
        </div>
      </div>
    `;
  }
  document.getElementById("auto-starting-xii")?.addEventListener("click", () => autoAssignStartingLineup(teamCode));
  document.getElementById("open-bowling-plan")?.addEventListener("click", () => openBowlingPlanModal());
}

function getEligibleBowlingPlanPlayers(teamCode) {
  const team = findTeam(teamCode);
  if (!team) return [];
  const activeTwelve = getLineupForTeam(teamCode)
    .slice(0, 12)
    .map((name) => team.players.find((playerData) => playerData.name === name))
    .filter(Boolean)
    .map((playerData) => clonePlayer(playerData))
    .filter((playerData) => playerData?.ratings);
  const impactIndices = getImpactSubIndices(teamCode)
    .filter((index) => index >= 0 && index < activeTwelve.length);
  const [firstImpactIndex, secondImpactIndex] = impactIndices;
  const firstImpactPlayer = activeTwelve[firstImpactIndex] || null;
  const secondImpactPlayer = activeTwelve[secondImpactIndex] || null;
  const bowlingImpactPlayer = !firstImpactPlayer || !secondImpactPlayer
    ? firstImpactPlayer || secondImpactPlayer
    : firstImpactPlayer.ratings.bowling >= secondImpactPlayer.ratings.bowling
      ? firstImpactPlayer
      : secondImpactPlayer;
  const bowlingPlanPlayers = buildImpactAdjustedLineup(activeTwelve, impactIndices, bowlingImpactPlayer);

  return bowlingPlanPlayers
    .filter((playerData) => playerData && isEligibleBowler(playerData))
    .sort((a, b) => (
      (b.ratings?.bowling || 0) - (a.ratings?.bowling || 0) ||
      (b.ratings?.econ || 0) - (a.ratings?.econ || 0) ||
      (b.ratings?.wkts || 0) - (a.ratings?.wkts || 0)
    ));
}

function getBowlingPlan(teamCode) {
  const eligibleNames = new Set(getEligibleBowlingPlanPlayers(teamCode).map((playerData) => playerData.name));
  const existing = Array.isArray(state.bowlingPlans?.[teamCode]) ? state.bowlingPlans[teamCode].slice(0, 20) : [];
  const filled = Array.from({ length: 20 }, (_, index) => {
    const candidate = existing[index] || "";
    return eligibleNames.has(candidate) ? candidate : "";
  });
  if (filled.some((name) => !name)) {
    const defaults = buildDefaultBowlingPlan(teamCode);
    for (let index = 0; index < 20; index += 1) {
      if (!filled[index] && defaults[index] && eligibleNames.has(defaults[index])) {
        filled[index] = defaults[index];
      }
    }
  }
  state.bowlingPlans[teamCode] = filled;
  return filled;
}

function getBowlingPlanValidation(teamCode) {
  const plan = getBowlingPlan(teamCode);
  const eligibleNames = new Set(getEligibleBowlingPlanPlayers(teamCode).map((playerData) => playerData.name));
  const counts = {};
  const errors = [];

  plan.forEach((name, index) => {
    if (!name) {
      errors.push(`Assign a bowler for over ${index + 1}.`);
      return;
    }
    if (!eligibleNames.has(name)) {
      errors.push(`${name} is no longer an eligible bowler in the active XII.`);
      return;
    }
    counts[name] = (counts[name] || 0) + 1;
    if (counts[name] > 4) {
      errors.push(`${name} is assigned more than 4 overs.`);
    }
    if (index > 0 && plan[index - 1] === name) {
      errors.push(`${name} is assigned back-to-back overs ${index} and ${index + 1}.`);
    }
  });

  return {
    counts,
    errors: [...new Set(errors)]
  };
}

function renderBowlingPlanEditor(teamCode) {
  const container = document.getElementById("bowling-plan-panel");
  if (!container) return;
  const bowlers = getEligibleBowlingPlanPlayers(teamCode);
  if (!bowlers.length) {
    container.innerHTML = "";
    return;
  }

  const team = findTeam(teamCode);
  const plan = getBowlingPlan(teamCode);
  const validation = getBowlingPlanValidation(teamCode);
  const summary = bowlers.map((playerData) => `
    <button class="bowling-plan-chip ${getBowlingPlanChipClass(validation.counts[playerData.name] || 0)}" type="button" data-bowling-plan-chip="${escapeHtml(playerData.name)}">
      ${escapeHtml(playerData.name)} <strong>${validation.counts[playerData.name] || 0}/4</strong>
    </button>
  `).join("");

  container.innerHTML = `
    <section class="bowling-plan-card">
      <div class="bowling-plan-summary">${summary}</div>
      ${state.bowlingPlanValidationTeam === teamCode && validation.errors.length ? `
        <div class="lineup-warning lineup-helper-row">
          <div>
            <strong>Fix the bowling plan before simulating.</strong>
            <span>${escapeHtml(validation.errors[0])}</span>
          </div>
          <button class="ghost-btn lineup-helper-action" type="button" id="auto-bowling-plan">Auto Plan</button>
        </div>
      ` : `
        <div class="lineup-helper lineup-helper-row">
          <div>
            <strong>Plan Rules</strong>
            <span>No bowler can exceed 4 overs or bowl consecutive overs.</span>
          </div>
          <button class="ghost-btn lineup-helper-action" type="button" id="auto-bowling-plan">Auto Plan</button>
        </div>
      `}
      <div class="bowling-plan-grid">
        ${plan.map((assignedName, index) => `
          <label class="lineup-slot bowling-plan-slot" data-bowling-plan-slot="${index}" data-assigned-bowler="${escapeHtml(assignedName)}">
            <span>Over ${index + 1}</span>
            <select data-bowling-plan-over="${index}">
              ${bowlers.map((playerData) => `
                <option value="${escapeHtml(playerData.name)}" ${playerData.name === assignedName ? "selected" : ""}>
                  ${escapeHtml(playerData.name)}${playerData.name === assignedName ? "" : ` • Bowl ${playerData.ratings.bowling}`}
                </option>
              `).join("")}
            </select>
          </label>
        `).join("")}
      </div>
    </section>
  `;

  container.querySelectorAll("[data-bowling-plan-over]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const overIndex = Number(event.target.dataset.bowlingPlanOver);
      updateBowlingPlanOver(teamCode, overIndex, event.target.value);
    });
  });

  container.querySelectorAll("[data-bowling-plan-chip]").forEach((chip) => {
    const bowlerName = chip.dataset.bowlingPlanChip;
    const flashColor = getBowlingPlanChipFlashColor(chip);

    chip.addEventListener("mousedown", () => {
      holdBowlingPlanAssignments(container, bowlerName, flashColor);
      const releaseHeldAssignments = () => clearHeldBowlingPlanAssignments(container);
      window.addEventListener("mouseup", releaseHeldAssignments, { once: true });
    });
    chip.addEventListener("mouseleave", () => {
      clearHeldBowlingPlanAssignments(container);
    });
    chip.addEventListener("click", () => {
      flashBowlingPlanAssignments(container, bowlerName, flashColor);
    });
    chip.addEventListener("touchstart", () => {
      holdBowlingPlanAssignments(container, bowlerName, flashColor);
      const releaseHeldAssignments = () => clearHeldBowlingPlanAssignments(container);
      window.addEventListener("touchend", releaseHeldAssignments, { once: true });
      window.addEventListener("touchcancel", releaseHeldAssignments, { once: true });
    }, { passive: true });
    chip.addEventListener("touchend", () => {
      clearHeldBowlingPlanAssignments(container);
    });
    chip.addEventListener("touchcancel", () => {
      clearHeldBowlingPlanAssignments(container);
    });
  });

  document.getElementById("auto-bowling-plan")?.addEventListener("click", () => {
    state.bowlingPlans[teamCode] = buildDefaultBowlingPlan(teamCode);
    state.bowlingPlanValidationTeam = null;
    renderBowlingPlanEditor(teamCode);
  });
}

function getBowlingPlanChipClass(overCount) {
  if (overCount > 4) return "is-over-limit";
  if (overCount === 4) return "is-maxed";
  if (overCount === 0) return "is-unused";
  return "";
}

function getBowlingPlanChipFlashColor(chip) {
  if (!chip) {
    return "";
  }
  const styles = window.getComputedStyle(chip);
  const preferredColor = styles.getPropertyValue("--bowling-plan-chip-accent").trim();
  return preferredColor || styles.color;
}

function flashBowlingPlanAssignments(container, bowlerName, flashColor = "") {
  if (!container || !bowlerName) {
    return;
  }

  container.querySelectorAll(".bowling-plan-slot.is-flashing").forEach((slot) => {
    slot.classList.remove("is-flashing");
    slot.style.removeProperty("--bowling-plan-flash-color");
  });

  const matchingSlots = [...container.querySelectorAll("[data-bowling-plan-slot]")].filter((slot) => {
    const select = slot.querySelector("[data-bowling-plan-over]");
    return select?.value === bowlerName;
  });

  matchingSlots.forEach((slot) => {
    // Restart the flash animation on repeated clicks.
    void slot.offsetWidth;
    if (flashColor) {
      slot.style.setProperty("--bowling-plan-flash-color", flashColor);
    }
    slot.classList.add("is-flashing");
    window.setTimeout(() => {
      slot.classList.remove("is-flashing");
      slot.style.removeProperty("--bowling-plan-flash-color");
    }, 1200);
  });
}

function holdBowlingPlanAssignments(container, bowlerName, flashColor = "") {
  if (!container || !bowlerName) {
    return;
  }

  clearHeldBowlingPlanAssignments(container);

  const matchingSlots = [...container.querySelectorAll("[data-bowling-plan-slot]")].filter((slot) => {
    const select = slot.querySelector("[data-bowling-plan-over]");
    return select?.value === bowlerName;
  });

  matchingSlots.forEach((slot) => {
    if (flashColor) {
      slot.style.setProperty("--bowling-plan-flash-color", flashColor);
    }
    slot.classList.add("is-held");
  });
}

function clearHeldBowlingPlanAssignments(container = document) {
  if (!container) {
    return;
  }

  container.querySelectorAll(".bowling-plan-slot.is-held").forEach((slot) => {
    slot.classList.remove("is-held");
    if (!slot.classList.contains("is-flashing")) {
      slot.style.removeProperty("--bowling-plan-flash-color");
    }
  });
}

function validateBowlingPlanBeforeSimulation(teamCode = state.franchiseTeam) {
  const validation = getBowlingPlanValidation(teamCode);
  if (!validation.errors.length) {
    state.bowlingPlanValidationTeam = null;
    return true;
  }
  state.bowlingPlanValidationTeam = teamCode;
  renderRoster();
  openBowlingPlanModal();
  return false;
}

function updateBowlingPlanOver(teamCode, overIndex, playerName) {
  const plan = [...getBowlingPlan(teamCode)];
  if (overIndex < 0 || overIndex >= plan.length) {
    return;
  }
  plan[overIndex] = playerName;
  state.bowlingPlans[teamCode] = plan;
  if (!getBowlingPlanValidation(teamCode).errors.length) {
    state.bowlingPlanValidationTeam = null;
  }
  renderRoster();
}

function initBowlingPlanModal() {
  const overlay = document.getElementById("bowling-plan-overlay");
  const backdrop = document.getElementById("bowling-plan-backdrop");
  const closeButton = document.getElementById("bowling-plan-close");
  if (!overlay || !backdrop || !closeButton) {
    return;
  }

  if (overlay.dataset.bound === "true") {
    return;
  }

  const close = () => {
    overlay.hidden = true;
    document.body.classList.remove("bowling-plan-open");
  };

  backdrop.addEventListener("click", close);
  closeButton.addEventListener("click", close);
  window.addEventListener("keydown", (event) => {
    if (!overlay.hidden && event.key === "Escape") {
      close();
    }
  });

  overlay.dataset.bound = "true";
}

function openBowlingPlanModal() {
  const overlay = document.getElementById("bowling-plan-overlay");
  if (!overlay) {
    return;
  }
  renderBowlingPlanEditor(state.franchiseTeam);
  overlay.hidden = false;
  document.body.classList.add("bowling-plan-open");
}

function validateImpactSubsBeforeSimulation(teamCode = state.franchiseTeam) {
  if (getImpactSubNames(teamCode).length === 2) {
    state.lineupValidationTeam = null;
    return true;
  }
  state.lineupValidationTeam = teamCode;
  renderRoster();
  document.getElementById("roster-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
  return false;
}

function getLineupOpeningScore(playerData) {
  return (playerData.opener ? 22 : 0) + (playerData.ratings?.batting || 25) + (playerData.ratings?.composure || 25) * 0.32;
}

function getLineupTopOrderScore(playerData) {
  return (playerData.ratings?.batting || 25) + (playerData.ratings?.composure || 25) * 0.35 + (playerData.opener ? 8 : 0);
}

function getLineupMiddleOrderScore(playerData) {
  return (playerData.ratings?.batting || 25) + (playerData.ratings?.allRound || 38) * 0.22 + (playerData.ratings?.composure || 25) * 0.18;
}

function getLineupFinisherScore(playerData) {
  return (playerData.ratings?.batting || 25) + (playerData.ratings?.intent || 25) * 0.38 + (playerData.ratings?.allRound || 38) * 0.18 - (playerData.opener ? 5 : 0);
}

function getLineupBowlerScore(playerData) {
  return playerData.ratings?.bowling || 25;
}

function pickLineupCandidates(remainingPlayers, count, scorer, selectedIds, predicate = () => true) {
  return [...remainingPlayers]
    .filter((playerData) => !selectedIds.has(playerData.customId || playerData.name))
    .filter(predicate)
    .sort((a, b) => scorer(b) - scorer(a))
    .slice(0, count);
}

function ensureMinimumBowlingOptions(players, selectedPlayers, minimumBowlingOptions = 5) {
  const maxBowlingOptions = Math.min(
    minimumBowlingOptions,
    selectedPlayers.length,
    players.filter((playerData) => isEligibleBowler(playerData)).length
  );
  if (!maxBowlingOptions) {
    return selectedPlayers;
  }

  const chosenIds = new Set(selectedPlayers.map((playerData) => playerData.customId || playerData.name));
  const eligibleChosen = selectedPlayers.filter((playerData) => isEligibleBowler(playerData));
  if (eligibleChosen.length >= maxBowlingOptions) {
    return selectedPlayers;
  }

  const incomingBowlers = players
    .filter((playerData) => !chosenIds.has(playerData.customId || playerData.name))
    .filter((playerData) => isEligibleBowler(playerData))
    .sort((a, b) => (
      getLineupBowlerScore(b) - getLineupBowlerScore(a) ||
      (b.ratings?.allRound || 38) - (a.ratings?.allRound || 38) ||
      (b.ratings?.batting || 25) - (a.ratings?.batting || 25)
    ));
  const replaceablePlayers = [...selectedPlayers]
    .filter((playerData) => !isEligibleBowler(playerData))
    .sort((a, b) => (
      getLineupMiddleOrderScore(a) - getLineupMiddleOrderScore(b) ||
      (a.ratings?.batting || 25) - (b.ratings?.batting || 25)
    ));

  const adjustedPlayers = [...selectedPlayers];
  while (adjustedPlayers.filter((playerData) => isEligibleBowler(playerData)).length < maxBowlingOptions && incomingBowlers.length && replaceablePlayers.length) {
    const nextBowler = incomingBowlers.shift();
    const replacement = replaceablePlayers.shift();
    const replacementIndex = adjustedPlayers.findIndex((playerData) => (playerData.customId || playerData.name) === (replacement.customId || replacement.name));
    if (!nextBowler || replacementIndex === -1) {
      continue;
    }
    adjustedPlayers[replacementIndex] = nextBowler;
  }

  return adjustedPlayers;
}

function getAutoStartingLineupPlanForTeam(team) {
  if (!team) {
    return { lineupNames: [], battingGroupNames: [], bowlingGroupNames: [] };
  }

  const players = team.players.map((playerData) => ensurePlayerRuntimeState(playerData));
  const selectedIds = new Set();
  const selectedPlayers = [];
  const addPlayers = (candidates) => {
    candidates.forEach((playerData) => {
      const key = playerData.customId || playerData.name;
      if (selectedIds.has(key) || selectedPlayers.length >= Math.min(12, players.length)) {
        return;
      }
      selectedIds.add(key);
      selectedPlayers.push(playerData);
    });
  };

  addPlayers(pickLineupCandidates(players, 2, getLineupOpeningScore, selectedIds));
  addPlayers(pickLineupCandidates(players, 2, getLineupTopOrderScore, selectedIds, (playerData) => (playerData.ratings?.batting || 25) >= 55));
  addPlayers(pickLineupCandidates(players, 2, getLineupMiddleOrderScore, selectedIds));
  addPlayers(pickLineupCandidates(players, 1, getLineupFinisherScore, selectedIds));
  addPlayers(pickLineupCandidates(players, 4, getLineupBowlerScore, selectedIds, (playerData) => (playerData.bowlingType || "none") !== "none" || (playerData.ratings?.bowling || 25) >= 42));
  addPlayers(pickLineupCandidates(players, 12, (playerData) => (playerData.ratings?.overall || 50), selectedIds));

  const chosenTwelve = ensureMinimumBowlingOptions(
    players,
    selectedPlayers.slice(0, Math.min(12, players.length)),
    5
  );
  const openingPair = [...chosenTwelve].sort((a, b) => getLineupOpeningScore(b) - getLineupOpeningScore(a)).slice(0, 2);
  const openingIds = new Set(openingPair.map((playerData) => playerData.customId || playerData.name));
  const remainingChosen = chosenTwelve.filter((playerData) => !openingIds.has(playerData.customId || playerData.name));
  const bowlingCore = [...remainingChosen]
    .sort((a, b) => getLineupBowlerScore(b) - getLineupBowlerScore(a))
    .slice(0, Math.min(4, remainingChosen.length));
  const bowlingIds = new Set(bowlingCore.map((playerData) => playerData.customId || playerData.name));
  const battingCore = remainingChosen.filter((playerData) => !bowlingIds.has(playerData.customId || playerData.name));
  const orderedBowlingCore = [...bowlingCore]
    .sort((a, b) => (b.ratings?.batting || 25) - (a.ratings?.batting || 25) || getLineupBowlerScore(b) - getLineupBowlerScore(a));
  const orderedBattingCore = [
    ...battingCore
      .sort((a, b) => getLineupTopOrderScore(b) - getLineupTopOrderScore(a))
      .slice(0, Math.min(2, battingCore.length)),
    ...battingCore
      .sort((a, b) => getLineupMiddleOrderScore(b) - getLineupMiddleOrderScore(a))
      .filter((playerData, index, array) => index < array.length)
  ];
  const seenOrderedIds = new Set();
  const orderedTwelve = [...openingPair, ...orderedBattingCore, ...orderedBowlingCore]
    .filter((playerData) => {
      const key = playerData.customId || playerData.name;
      if (seenOrderedIds.has(key)) {
        return false;
      }
      seenOrderedIds.add(key);
      return true;
    })
    .slice(0, chosenTwelve.length);

  const remainingBench = players
    .filter((playerData) => !seenOrderedIds.has(playerData.customId || playerData.name))
    .sort((a, b) => (b.ratings?.overall || 50) - (a.ratings?.overall || 50));

  return {
    lineupNames: [...orderedTwelve, ...remainingBench].map((playerData) => playerData.name),
    battingGroupNames: [...openingPair, ...orderedBattingCore].map((playerData) => playerData.name),
    bowlingGroupNames: orderedBowlingCore.map((playerData) => playerData.name)
  };
}

function getAutoStartingLineupPlan(teamCode) {
  return getAutoStartingLineupPlanForTeam(findTeam(teamCode));
}

function getAutoImpactSubNamesForTeam(team, autoPlan) {
  if (!team) {
    return [];
  }

  const byName = new Map(team.players.map((playerData) => [playerData.name, ensurePlayerRuntimeState(playerData)]));
  const bowlingGroup = autoPlan.bowlingGroupNames
    .map((name) => byName.get(name))
    .filter(Boolean);
  const battingGroup = autoPlan.battingGroupNames
    .map((name) => byName.get(name))
    .filter(Boolean);

  const weakestBattingBowler = [...bowlingGroup]
    .sort((a, b) => (a.ratings?.batting || 25) - (b.ratings?.batting || 25) || (a.ratings?.bowling || 25) - (b.ratings?.bowling || 25))[0];
  const weakestBowlingBatter = [...battingGroup]
    .sort((a, b) => (a.ratings?.bowling || 25) - (b.ratings?.bowling || 25) || (a.ratings?.batting || 25) - (b.ratings?.batting || 25))[0];

  return [...new Set([weakestBattingBowler?.name, weakestBowlingBatter?.name].filter(Boolean))].slice(0, 2);
}

function getAutoImpactSubNames(teamCode, autoPlan) {
  return getAutoImpactSubNamesForTeam(findTeam(teamCode), autoPlan);
}

function positionImpactPlayersForAutoXii(teamCode, lineup, impactNames, teamOverride = null) {
  if (impactNames.length !== 2) {
    return lineup;
  }

  const team = teamOverride || findTeam(teamCode);
  if (!team) {
    return lineup;
  }

  const adjusted = [...lineup];
  const battingByName = Object.fromEntries(
    team.players.map((playerData) => [playerData.name, ensurePlayerRuntimeState(playerData).ratings?.batting || 25])
  );
  const [firstImpact, secondImpact] = impactNames;
  const weakerBatter = (battingByName[firstImpact] || 25) <= (battingByName[secondImpact] || 25) ? firstImpact : secondImpact;
  const strongerBatter = weakerBatter === firstImpact ? secondImpact : firstImpact;
  const movePlayerToIndex = (playerName, targetIndex) => {
    const currentIndex = adjusted.indexOf(playerName);
    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= adjusted.length || currentIndex === targetIndex) {
      return;
    }
    [adjusted[targetIndex], adjusted[currentIndex]] = [adjusted[currentIndex], adjusted[targetIndex]];
  };

  if (adjusted.indexOf(strongerBatter) >= 12) {
    movePlayerToIndex(strongerBatter, Math.min(10, adjusted.length - 1));
  }
  movePlayerToIndex(weakerBatter, Math.min(11, adjusted.length - 1));
  return adjusted;
}

function applyAutoStartingLineup(teamCode, teamOverride = null) {
  const team = teamOverride || findTeam(teamCode);
  const autoPlan = getAutoStartingLineupPlanForTeam(team);
  let lineup = autoPlan.lineupNames;
  if (!lineup.length) {
    return false;
  }
  const autoImpactNames = getAutoImpactSubNamesForTeam(team, autoPlan);
  if (autoImpactNames.length === 2) {
    lineup = positionImpactPlayersForAutoXii(teamCode, lineup, autoImpactNames, team);
  }
  state.teamLineups[teamCode] = lineup;
  state.impactSubs[teamCode] = autoImpactNames.length === 2 ? autoImpactNames : getDefaultImpactSubNames(teamCode);
  state.bowlingPlans[teamCode] = buildDefaultBowlingPlanForTeam(team, lineup);
  state.bowlingPlanValidationTeam = null;
  state.lineupValidationTeam = null;
  state.selectedLineupSwap = null;
  return true;
}

function autoAssignStartingLineup(teamCode) {
  if (!applyAutoStartingLineup(teamCode)) {
    return;
  }
  renderFeaturedMatchup();
  renderTeamCards();
  renderRoster();
}

function updateLineupSlot(teamCode, slotIndex, playerName) {
  const lineup = [...getLineupForTeam(teamCode)];
  const existingIndex = lineup.indexOf(playerName);
  if (existingIndex !== -1) {
    [lineup[slotIndex], lineup[existingIndex]] = [lineup[existingIndex], lineup[slotIndex]];
  } else {
    lineup[slotIndex] = playerName;
  }
  state.teamLineups[teamCode] = lineup;
  state.bowlingPlans[teamCode] = buildDefaultBowlingPlan(teamCode);
  state.bowlingPlanValidationTeam = null;
  renderFeaturedMatchup();
  renderTeamCards();
  renderRoster();
}

function moveLineupPlayer(teamCode, slotIndex, direction) {
  const lineup = [...getLineupForTeam(teamCode)];
  const swapIndex = direction === "up" ? slotIndex - 1 : slotIndex + 1;
  if (swapIndex < 0 || swapIndex >= lineup.length) return;
  [lineup[slotIndex], lineup[swapIndex]] = [lineup[swapIndex], lineup[slotIndex]];
  state.teamLineups[teamCode] = lineup;
  state.bowlingPlans[teamCode] = buildDefaultBowlingPlan(teamCode);
  state.bowlingPlanValidationTeam = null;
  state.selectedLineupSwap = null;
  renderFeaturedMatchup();
  renderTeamCards();
  renderRoster();
}

function reorderLineupPlayer(teamCode, fromIndex, toIndex) {
  const lineup = [...getLineupForTeam(teamCode)];
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= lineup.length ||
    toIndex >= lineup.length
  ) {
    return;
  }
  [lineup[fromIndex], lineup[toIndex]] = [lineup[toIndex], lineup[fromIndex]];
  state.teamLineups[teamCode] = lineup;
  state.bowlingPlans[teamCode] = buildDefaultBowlingPlan(teamCode);
  state.bowlingPlanValidationTeam = null;
  state.selectedLineupSwap = null;
  renderFeaturedMatchup();
  renderTeamCards();
  renderRoster();
}

function buildLineupTeam(team) {
  if (!team) {
    return {
      code: "--",
      name: "Unavailable Team",
      venue: "Unavailable",
      colors: ["#6f7a8c", "#253248"],
      players: [],
      teamRatings: { batting: 0, bowling: 0, overall: 0 },
      attackProfile: buildAttackProfile([])
    };
  }
  const activeTwelve = getLineupForTeam(team.code)
    .slice(0, 12)
    .map((name) => team.players.find((playerData) => playerData.name === name))
    .filter(Boolean)
    .map((playerData) => clonePlayer(playerData))
    .filter((playerData) => playerData?.ratings);
  const impactIndices = getImpactSubIndices(team.code)
    .filter((index) => index >= 0 && index < activeTwelve.length);
  const [firstImpactIndex, secondImpactIndex] = impactIndices;
  const firstImpactPlayer = activeTwelve[firstImpactIndex] || null;
  const secondImpactPlayer = activeTwelve[secondImpactIndex] || null;
  const battingImpactPlayer = !firstImpactPlayer || !secondImpactPlayer
    ? firstImpactPlayer || secondImpactPlayer
    : firstImpactPlayer.ratings.batting >= secondImpactPlayer.ratings.batting
      ? firstImpactPlayer
      : secondImpactPlayer;
  const bowlingImpactPlayer = !firstImpactPlayer || !secondImpactPlayer
    ? firstImpactPlayer || secondImpactPlayer
    : firstImpactPlayer.ratings.bowling >= secondImpactPlayer.ratings.bowling
      ? firstImpactPlayer
      : secondImpactPlayer;
  const battingPlayers = buildImpactAdjustedLineup(activeTwelve, impactIndices, battingImpactPlayer);
  const bowlingPlayers = buildImpactAdjustedLineup(activeTwelve, impactIndices, bowlingImpactPlayer);
  const battingRatings = calculateTeamRatings(battingPlayers);
  const bowlingRatings = calculateTeamRatings(bowlingPlayers);
  const lineupTeam = {
    ...team,
    activeTwelve,
    players: battingPlayers,
    battingPlayers,
    bowlingPlayers,
    bowlingPlan: getBowlingPlan(team.code)
  };
  lineupTeam.teamRatings = {
    batting: battingRatings.batting,
    bowling: bowlingRatings.bowling,
    overall: Math.round((battingRatings.overall + bowlingRatings.overall) / 2)
  };
  lineupTeam.attackProfile = buildAttackProfile(bowlingPlayers);
  return lineupTeam;
}

function buildImpactAdjustedLineup(activeTwelve, impactIndices, chosenImpactPlayer) {
  if (!impactIndices.length || !chosenImpactPlayer) {
    return activeTwelve.slice(0, 11);
  }

  const anchorIndex = Math.min(...impactIndices);
  const impactIndexSet = new Set(impactIndices);
  const baseLineup = activeTwelve.filter((_, index) => !impactIndexSet.has(index));
  baseLineup.splice(anchorIndex, 0, chosenImpactPlayer);
  return baseLineup.slice(0, 11);
}

function simulateFranchiseGame() {
  const nextFixture = getNextFixtureForTeam(state.franchiseTeam);
  if (!nextFixture) {
    if (isFranchisePlayoffEligible()) {
      return simulateNextPlayoffGame();
    }
    return null;
  }

  const round = state.season.schedule[nextFixture.roundIndex];
  const roundResults = round.fixtures.map((fixture) => {
    const result = simulateMatch(
      buildLineupTeam(findTeam(fixture.homeCode)),
      buildLineupTeam(findTeam(fixture.awayCode))
    );
    fixture.played = true;
    fixture.result = result;
    updateTable(state.season.table, result);
    updatePlayers(state.season.playerStats, result);
    return result;
  });

  state.season.currentRound = Math.min(state.season.currentRound + 1, state.season.schedule.length);
  state.season.featuredMatches = [...roundResults, ...state.season.featuredMatches].slice(0, 10);
  state.season.awards = calculateSeasonAwards(state.season.playerStats);
  state.tickerLabel = round.label;
  state.tickerItems = roundResults
    .filter((result) => result.home.code !== state.franchiseTeam && result.away.code !== state.franchiseTeam)
    .map((result) => result);

  state.matchLog = [getFeaturedRoundResult(roundResults), ...roundResults.filter((result) => result !== getFeaturedRoundResult(roundResults)), ...state.matchLog]
    .filter(Boolean)
    .slice(0, 10);

  return getFeaturedRoundResult(roundResults);
}

function simulateNextPlayoffGame() {
  const playoffFixture = getCurrentPlayoffFixture();
  if (!playoffFixture) {
    return null;
  }

  const result = resolveKnockoutResult(
    simulateMatch(
      buildLineupTeam(findTeam(playoffFixture.homeCode)),
      buildLineupTeam(findTeam(playoffFixture.awayCode))
    )
  );

  state.season.playoffs.results[playoffFixture.key] = result;
  updatePlayers(state.season.playerStats, result);
  state.season.awards = calculateSeasonAwards(state.season.playerStats);
  state.season.featuredMatches = [result, ...state.season.featuredMatches].slice(0, 10);
  state.tickerLabel = playoffFixture.label;
  state.tickerItems = [result];
  state.matchLog = [result, ...state.matchLog].slice(0, 10);

  if (playoffFixture.key === "final") {
    state.season.champion = result.winner;
    state.season.featuredMatches = [
      result,
      state.season.playoffs.results.qualifier2,
      state.season.playoffs.results.eliminator,
      state.season.playoffs.results.qualifier1,
      ...state.season.featuredMatches
    ].filter(Boolean).slice(0, 10);
    recordCompletedSeasonAwards();
  }

  return result;
}

function restartSeason() {
  startFreshSimulation("Season reset. Set your lineup and simulate the next game on the schedule.");
}

function continueSimulation() {
  state.continueSimUnlocked = true;
  if (!state.offseason) {
    state.offseason = buildOffseasonState();
  }
  if (state.offseason.phase === "retention") {
    openRetentionModal();
    return;
  }
  if (state.offseason.phase === "auction" && !state.offseason.auctionPool.length) {
    state.offseason.phase = "trade";
    state.offseason.tradeHistory = state.offseason.tradeHistory || [];
    state.offseason.tradeState = createEmptyTradeState();
    renderAll();
    renderFeaturedResultMessage(`Auction complete. Use the trade button on your player cards, then click Continue Sim to begin Season ${state.seasonYear + 1}.`);
    return;
  }
  if (state.offseason.phase === "trade") {
    completeOffseasonAndStartNextSeason();
    return;
  }
  openAuctionModal();
}

function startFreshSimulation(message) {
  resetPersistentAwardCounts();
  state.season = resetSeason();
  state.offseason = null;
  state.tradeModal.open = false;
  state.tradeModal.activeSlot = null;
  ["retention-overlay", "auction-overlay", "trade-overlay"].forEach((id) => {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.hidden = true;
    }
  });
  document.body.classList.remove("how-to-play-open");
  state.matchLog = [];
  state.tickerLabel = "";
  state.tickerItems = [];
  state.lastCelebratedChampion = null;
  state.lastCelebratedTournamentMvp = null;
  state.lastSeasonLossChampion = null;
  syncFeaturedMatchToSeason();
  renderAll();
  renderFeaturedResultMessage(message);
}

function renderRatingsPage() {
  const players = getFilteredPlayers();
  const visiblePlayers = players.slice(0, 25);
  const ratingsGrid = document.getElementById("ratings-grid");
  if (!ratingsGrid) {
    return;
  }

  ratingsGrid.innerHTML = visiblePlayers.map((playerData) => `
    <article class="player-card">
      <div class="player-header">
        <div>
          <h3>${playerData.name}</h3>
          <p class="player-meta">${playerData.teamCode} • ${playerData.role} • ${playerData.battingStyle}</p>
        </div>
        <span class="rating-badge">${playerData.ratings.overall}</span>
      </div>
      <div class="player-ratings">
        <span>Bat<strong>${playerData.ratings.batting}</strong></span>
        <span>Bowl<strong>${playerData.ratings.bowling}</strong></span>
        <span>AR<strong>${playerData.ratings.allRound}</strong></span>
        <span>Cltch<strong>${playerData.ratings.clutch}</strong></span>
        <span>Fld<strong>${playerData.ratings.fielding}</strong></span>
        <span>Lead<strong>${playerData.ratings.leadership}</strong></span>
        <span>Intent<strong>${playerData.ratings.intent}</strong></span>
        <span>Comp<strong>${playerData.ratings.composure}</strong></span>
        <span>Econ<strong>${playerData.ratings.econ}</strong></span>
        <span>WktTk<strong>${playerData.ratings.wkts}</strong></span>
      </div>
      <p class="player-season-line">Overall ${playerData.ratings.overall} | Bat ${playerData.ratings.batting} | Bowl ${playerData.ratings.bowling}</p>
    </article>
  `).join("");

  renderRatingsLeaders(players);
}

function renderRatingsLeaders(players) {
  const container = document.getElementById("ratings-leaders");
  if (!container) {
    return;
  }

  container.innerHTML = players.slice(0, 4).map((playerData, index) => `
    <article class="top-player-card">
      <div class="player-header">
        <div>
          <p class="eyebrow">Rank ${index + 1}</p>
          <h3>${playerData.name}</h3>
        </div>
        <span class="rating-badge">${getRatingsSortValue(playerData, state.ratingsSort)}</span>
      </div>
      <p class="player-meta">${playerData.teamCode} • ${playerData.role}</p>
      <p class="player-season-line">OVR ${playerData.ratings.overall}</p>
    </article>
  `).join("");
}

function getFilteredPlayers() {
  return teams
    .flatMap((team) => team.players.map((playerData) => ({ ...playerData, teamCode: team.code })))
    .filter((playerData) => state.ratingsFilter === "ALL" || playerData.teamCode === state.ratingsFilter)
    .sort((a, b) => {
      const primary = getRatingsSortValue(b, state.ratingsSort) - getRatingsSortValue(a, state.ratingsSort);
      if (primary !== 0) return primary;
      return b.ratings.overall - a.ratings.overall;
    });
}

function getRatingsSortValue(playerData, sortKey) {
  return playerData.ratings[sortKey] ?? playerData.ratings.overall;
}

function renderCustomPage() {
  const teamAContainer = document.getElementById("custom-team-a");
  const teamBContainer = document.getElementById("custom-team-b");
  const leagueWrapper = document.getElementById("league-opponent-wrapper");
  const resultContainer = document.getElementById("custom-match-result");
  if (!teamAContainer || !teamBContainer || !leagueWrapper || !resultContainer) {
    return;
  }

  const opponentTeam = buildLineupTeam(findTeam(state.customLeagueOpponent));
  leagueWrapper.style.display = "grid";
  teamAContainer.innerHTML = renderCustomSelectors("teamA");
  teamBContainer.innerHTML = renderLeagueLineupSlots(opponentTeam);

  attachCustomSelectorListeners("teamA");

  resultContainer.innerHTML = `<div class="scorecard-block"><p class="player-season-line">Pick 11 players for your side, then run the custom match against the selected league XI.</p></div>`;
}

function renderCustomSelectors(teamKey) {
  return state.customSelections[teamKey].map((selectedName, index) => `
    <div class="custom-slot">
      <label for="${teamKey}-slot-${index}">Slot ${index + 1}</label>
      <select id="${teamKey}-slot-${index}" data-team-key="${teamKey}" data-slot-index="${index}">
        ${getAllPlayers().map((playerData) => `
          <option value="${playerData.name}" ${playerData.name === selectedName ? "selected" : ""}>${playerData.name} • ${playerData.teamCode}</option>
        `).join("")}
      </select>
    </div>
  `).join("");
}

function renderLeagueLineupSlots(team) {
  return team.players.map((playerData, index) => `
    <div class="custom-slot custom-slot-static">
      <label>Slot ${index + 1}</label>
      <div class="custom-slot-display">
        <strong>${escapeHtml(playerData.name)}</strong>
        <span>${escapeHtml(playerData.role)} • ${escapeHtml(playerData.battingStyle)}</span>
      </div>
    </div>
  `).join("");
}

function attachCustomSelectorListeners(teamKey) {
  document.querySelectorAll(`[data-team-key="${teamKey}"]`).forEach((select) => {
    select.addEventListener("change", (event) => {
      const slotIndex = Number(event.target.dataset.slotIndex);
      state.customSelections[teamKey][slotIndex] = event.target.value;
    });
  });
}

function simulateCustomMatch() {
  const teamA = buildCustomTeam("Custom XI A", state.customSelections.teamA);
  const teamB = buildLineupTeam(findTeam(state.customLeagueOpponent));
  const result = simulateMatch(teamA, teamB);
  const summary = document.getElementById("custom-summary");
  const resultContainer = document.getElementById("custom-match-result");
  if (summary) {
    summary.innerHTML = renderMatchSummaryHTML(result, {
      scorecardAnchor: "#custom-scorecard-section",
      includeLeagueTableLink: false
    });
  }
  if (resultContainer) {
    resultContainer.innerHTML = renderScorecardMarkup(result);
  }

  scrollToCustomScorecard();
  launchCustomMatchOutcomeSymbols(result, teamA.code);
}

function buildCustomTeam(name, selectedNames) {
  const players = selectedNames.map((playerName) => clonePlayer(getAllPlayers().find((playerData) => playerData.name === playerName))).filter(Boolean);
  const code = name === "Custom XI A" ? "CXA" : "CXB";
  const bowlingPlan = buildFallbackBowlingPlan(players);
  const team = {
    code,
    name,
    identity: "Handcrafted Matchup XI",
    venue: "Neutral custom venue",
    colors: code === "CXA" ? ["#f5c451", "#0d3157"] : ["#5ce1e6", "#3b194a"],
    players,
    battingPlayers: players,
    bowlingPlayers: players,
    bowlingPlan
  };
  team.teamRatings = calculateTeamRatings(players);
  team.attackProfile = buildAttackProfile(players);
  return team;
}

function scrollToCustomScorecard() {
  const scorecardSection = document.getElementById("custom-scorecard-section");
  if (!scorecardSection) {
    return;
  }

  window.requestAnimationFrame(() => {
    scorecardSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

function launchCustomMatchOutcomeSymbols(result, customTeamCode) {
  if (!result || result.isTie || !result.winner?.code) {
    return;
  }

  const didCustomTeamWin = result.winner.code === customTeamCode;
  launchOutcomeSymbolBurst({
    isWin: didCustomTeamWin,
    pieces: 34,
    symbol: didCustomTeamWin ? "\u2705" : "\u274C",
    durationMin: 2200,
    durationRange: 1100,
    horizontalInset: 8,
    driftRange: 220,
    delayRange: 220
  });
}

function getAllPlayers() {
  return teams.flatMap((team) => team.players.map((playerData) => ({ ...ensurePlayerRuntimeState(playerData), teamCode: team.code })));
}

function clonePlayer(playerData) {
  if (!playerData) return null;
  ensurePlayerRuntimeState(playerData);
  return {
    ...playerData,
    batting: { ...playerData.batting, runs: [...playerData.batting.runs], avg: [...playerData.batting.avg], sr: [...playerData.batting.sr] },
    bowling: { ...playerData.bowling, wkts: [...playerData.bowling.wkts], eco: [...playerData.bowling.eco], avg: [...playerData.bowling.avg] },
    ratings: { ...playerData.ratings },
    profile: {
      ...playerData.profile,
      strengths: [...playerData.profile.strengths],
      weaknesses: [...playerData.profile.weaknesses],
      bowlingStrengths: [...playerData.profile.bowlingStrengths],
      bowlingWeaknesses: [...playerData.profile.bowlingWeaknesses]
    },
    awardCounts: { ...playerData.awardCounts },
    careerRecords: { ...playerData.careerRecords },
    marketValue: playerData.marketValue
  };
}

function pickRandom(array) {
  return array[randomInt(0, array.length - 1)];
}

function generateWeightedRookieAge() {
  const ageWeights = [
    { age: 19, weight: 2 },
    { age: 20, weight: 4 },
    { age: 21, weight: 7 },
    { age: 22, weight: 10 },
    { age: 23, weight: 13 },
    { age: 24, weight: 16 },
    { age: 25, weight: 13 },
    { age: 26, weight: 10 },
    { age: 27, weight: 7 },
    { age: 28, weight: 5 },
    { age: 29, weight: 3 },
    { age: 30, weight: 2 }
  ];
  const totalWeight = ageWeights.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of ageWeights) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.age;
    }
  }
  return 24;
}

function generateRookieName(existingNames) {
  const indianOrigin = Math.random() < 0.7;
  const firstNames = indianOrigin ? INDIAN_FIRST_NAMES : OVERSEAS_FIRST_NAMES;
  const lastNames = indianOrigin ? INDIAN_LAST_NAMES : OVERSEAS_LAST_NAMES;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const candidate = `${pickRandom(firstNames)} ${pickRandom(lastNames)}`;
    if (!existingNames.has(candidate)) {
      existingNames.add(candidate);
      return candidate;
    }
  }
  const fallback = `${pickRandom(firstNames)} ${pickRandom(lastNames)} ${randomInt(2, 99)}`;
  existingNames.add(fallback);
  return fallback;
}

function getRookieOverallTargets() {
  const values = [];
  for (let index = 0; index < OFFSEASON_NEW_PLAYER_COUNT; index += 1) {
    const shaped = Math.pow(Math.random(), 0.82);
    values.push(Math.round(OFFSEASON_NEW_PLAYER_MIN_OVR + shaped * (OFFSEASON_NEW_PLAYER_MAX_OVR - OFFSEASON_NEW_PLAYER_MIN_OVR)));
  }
  values.sort((a, b) => b - a);
  values[0] = Math.min(OFFSEASON_NEW_PLAYER_MAX_OVR, values[0]);
  values[values.length - 1] = OFFSEASON_NEW_PLAYER_MIN_OVR;
  return values;
}

function getRandomRookieBlueprint() {
  const templates = [
    { type: "opener", role: "Technical Opener", battingStyle: Math.random() < 0.26 ? "LHB" : "RHB", bowlingType: "none", bowlingHand: "none", opener: true, deathBowl: false },
    { type: "batter", role: "Shotmaker", battingStyle: Math.random() < 0.23 ? "LHB" : "RHB", bowlingType: "none", bowlingHand: "none", opener: false, deathBowl: false },
    { type: "anchor", role: "Run Bank Anchor", battingStyle: Math.random() < 0.2 ? "LHB" : "RHB", bowlingType: "none", bowlingHand: "none", opener: false, deathBowl: false },
    { type: "finisher", role: "Finishing Closer", battingStyle: Math.random() < 0.18 ? "LHB" : "RHB", bowlingType: "none", bowlingHand: "none", opener: false, deathBowl: false },
    { type: "pace-bowler", role: "Seam Bowler", battingStyle: Math.random() < 0.16 ? "LHB" : "RHB", bowlingType: "pacer", bowlingHand: Math.random() < 0.22 ? "left" : "right", opener: false, deathBowl: Math.random() < 0.42 },
    { type: "spinner", role: "Wrist Spinner", battingStyle: Math.random() < 0.18 ? "LHB" : "RHB", bowlingType: "spinner", bowlingHand: Math.random() < 0.18 ? "left" : "right", opener: false, deathBowl: false },
    { type: "seam-allrounder", role: "Seam All-Rounder", battingStyle: Math.random() < 0.22 ? "LHB" : "RHB", bowlingType: "pacer", bowlingHand: Math.random() < 0.2 ? "left" : "right", opener: false, deathBowl: Math.random() < 0.28 },
    { type: "spin-allrounder", role: "Control All-Rounder", battingStyle: Math.random() < 0.2 ? "LHB" : "RHB", bowlingType: "spinner", bowlingHand: Math.random() < 0.18 ? "left" : "right", opener: false, deathBowl: false }
  ];
  const weights = [5, 7, 3, 3, 5, 3, 2, 2];
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  let roll = Math.random() * totalWeight;
  for (let index = 0; index < templates.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) {
      return templates[index];
    }
  }
  return templates[1];
}

function buildRookieTargetsFromBlueprint(blueprint, age, targetOverall) {
  const ageBonus = age <= 22 ? 2 : age <= 24 ? 1 : age >= 29 ? -1 : 0;
  const quality = targetOverall + ageBonus;
  let intent = 60;
  let composure = 60;
  let econ = 25;
  let wkts = 25;
  let fielding = clamp(70 + Math.round((quality - 60) * 0.5) + randomInt(-3, 4), 70, 92);
  let leadership = clamp(70 + Math.round((quality - 64) * 0.35) + randomInt(-3, 3), 70, 90);

  switch (blueprint.type) {
    case "opener":
      intent = clamp(quality + randomInt(-2, 4), 58, 84);
      composure = clamp(quality + randomInt(0, 6), 60, 88);
      break;
    case "batter":
      intent = clamp(quality + randomInt(1, 7), 60, 86);
      composure = clamp(quality + randomInt(-2, 4), 58, 84);
      break;
    case "anchor":
      intent = clamp(quality + randomInt(-5, 1), 54, 78);
      composure = clamp(quality + randomInt(2, 8), 62, 88);
      break;
    case "finisher":
      intent = clamp(quality + randomInt(4, 9), 64, 90);
      composure = clamp(quality + randomInt(-4, 2), 54, 80);
      break;
    case "pace-bowler":
      intent = clamp(45 + Math.round((quality - 64) * 0.45) + randomInt(-3, 3), 42, 72);
      composure = clamp(46 + Math.round((quality - 64) * 0.42) + randomInt(-3, 3), 42, 74);
      econ = clamp(quality + randomInt(-2, 4), 58, 86);
      wkts = clamp(quality + randomInt(-1, 5), 58, 88);
      break;
    case "spinner":
      intent = clamp(44 + Math.round((quality - 64) * 0.4) + randomInt(-3, 2), 42, 70);
      composure = clamp(48 + Math.round((quality - 64) * 0.45) + randomInt(-2, 4), 44, 78);
      econ = clamp(quality + randomInt(0, 5), 58, 88);
      wkts = clamp(quality + randomInt(-3, 3), 56, 84);
      break;
    case "seam-allrounder":
      intent = clamp(quality + randomInt(-1, 5), 58, 82);
      composure = clamp(quality + randomInt(-2, 4), 56, 80);
      econ = clamp(quality - 4 + randomInt(-3, 3), 52, 78);
      wkts = clamp(quality - 5 + randomInt(-3, 4), 50, 78);
      break;
    case "spin-allrounder":
      intent = clamp(quality + randomInt(-2, 4), 56, 80);
      composure = clamp(quality + randomInt(0, 5), 58, 82);
      econ = clamp(quality - 4 + randomInt(-2, 4), 52, 78);
      wkts = clamp(quality - 6 + randomInt(-3, 3), 50, 76);
      break;
    default:
      break;
  }

  return { intent, composure, econ, wkts, fielding, leadership };
}

function tuneRookieToOverall(playerData, targetOverall) {
  ensurePlayerRuntimeState(playerData);
  let safety = 0;
  while (safety < 18 && playerData.ratings.overall !== targetOverall) {
    safety += 1;
    const difference = targetOverall - playerData.ratings.overall;
    const battingLean = (playerData.bowlingType || "none") === "none" ? 1 : isAllRounder(playerData) ? 0.75 : 0.45;
    playerData.makePlayerTargets.intent = clamp(playerData.makePlayerTargets.intent + difference * battingLean, 25, 99);
    playerData.makePlayerTargets.composure = clamp(playerData.makePlayerTargets.composure + difference * Math.max(0.35, battingLean * 0.85), 25, 99);
    if ((playerData.bowlingType || "none") !== "none") {
      const bowlingLean = isBowler(playerData) ? 0.95 : isAllRounder(playerData) ? 0.68 : 0.4;
      playerData.makePlayerTargets.econ = clamp(playerData.makePlayerTargets.econ + difference * bowlingLean, 25, 99);
      playerData.makePlayerTargets.wkts = clamp(playerData.makePlayerTargets.wkts + difference * bowlingLean, 25, 99);
    }
    playerData.fielding = clamp((playerData.fielding ?? 78) + difference * 0.18, 70, 94);
    playerData.leadership = clamp((playerData.leadership ?? 72) + difference * 0.12, 70, 92);
    playerData.ratings = calculateRatings(playerData);
  }

  while (playerData.ratings.overall > OFFSEASON_NEW_PLAYER_MAX_OVR && safety < 32) {
    safety += 1;
    playerData.makePlayerTargets.intent = clamp(playerData.makePlayerTargets.intent - 0.9, 25, 99);
    playerData.makePlayerTargets.composure = clamp(playerData.makePlayerTargets.composure - 0.9, 25, 99);
    if ((playerData.bowlingType || "none") !== "none") {
      playerData.makePlayerTargets.econ = clamp(playerData.makePlayerTargets.econ - 0.8, 25, 99);
      playerData.makePlayerTargets.wkts = clamp(playerData.makePlayerTargets.wkts - 0.8, 25, 99);
    }
    playerData.ratings = calculateRatings(playerData);
  }
  while (playerData.ratings.overall < OFFSEASON_NEW_PLAYER_MIN_OVR && safety < 46) {
    safety += 1;
    playerData.makePlayerTargets.intent = clamp(playerData.makePlayerTargets.intent + 0.9, 25, 99);
    playerData.makePlayerTargets.composure = clamp(playerData.makePlayerTargets.composure + 0.9, 25, 99);
    if ((playerData.bowlingType || "none") !== "none") {
      playerData.makePlayerTargets.econ = clamp(playerData.makePlayerTargets.econ + 0.8, 25, 99);
      playerData.makePlayerTargets.wkts = clamp(playerData.makePlayerTargets.wkts + 0.8, 25, 99);
    }
    playerData.ratings = calculateRatings(playerData);
  }
}

function generateOffseasonRookieClass() {
  const existingNames = new Set(getAllPlayers().map((playerData) => playerData.name));
  const targetOveralls = getRookieOverallTargets();
  return targetOveralls.map((targetOverall, index) => {
    const blueprint = getRandomRookieBlueprint();
    const age = generateWeightedRookieAge();
    const targets = buildRookieTargetsFromBlueprint(blueprint, age, targetOverall);
    const rookie = player(
      generateRookieName(existingNames),
      blueprint.role,
      blueprint.battingStyle,
      targets.intent,
      targets.composure,
      targets.econ,
      targets.wkts,
      blueprint.bowlingType,
      blueprint.bowlingHand,
      blueprint.opener,
      blueprint.deathBowl,
      targets.fielding,
      targets.leadership
    );
    rookie.teamCode = "FA";
    rookie.originalTeamCode = "ROOKIE";
    rookie.age = age;
    rookie.contract = null;
    rookie.marketValue = null;
    rookie.customId = `rookie-${state.seasonYear + 1}-${index}-${stableHash(`${rookie.name}-${age}-${blueprint.role}`)}`;
    rookie.offseasonId = rookie.customId;
    ensurePlayerRuntimeState(rookie);
    tuneRookieToOverall(rookie, targetOverall);
    rookie.role = determinePlayerArchetype(rookie);
    rookie.archetype = rookie.role;
    rookie.roleProfile = inferRoleProfile(rookie);
    rookie.profile = inferPlayerProfile(rookie);
    rookie.marketValue = getFairMarketSalary(rookie);
    return rookie;
  });
}

function isSamePlayerRecord(playerData, awardPlayer) {
  return Boolean(
    playerData &&
    awardPlayer &&
    playerData.name === awardPlayer.name &&
    (playerData.customId || null) === (awardPlayer.customId || null) &&
    (playerData.teamCode || null) === (awardPlayer.teamCode || null)
  );
}

function findAwardWinningPlayer(awardPlayer) {
  if (!awardPlayer?.teamCode) {
    return null;
  }
  const team = findTeam(awardPlayer.teamCode);
  return team?.players.find((playerData) => isSamePlayerRecord(playerData, awardPlayer)) || null;
}

function recordCompletedSeasonAwards() {
  if (!state.season?.champion || state.recordedAwardSeasonYear === state.seasonYear) {
    return;
  }

  const awards = state.season.awards || {};
  const mappings = [
    { awardPlayer: awards.impactPlayer, key: "bestSubs" },
    { awardPlayer: awards.mvp, key: "mvps" },
    { awardPlayer: awards.bestBatter, key: "orangeCaps" },
    { awardPlayer: awards.bestBowler, key: "purpleCaps" }
  ];

  mappings.forEach(({ awardPlayer, key }) => {
    const winner = findAwardWinningPlayer(awardPlayer);
    if (!winner) {
      return;
    }
    ensurePlayerRuntimeState(winner);
    winner.awardCounts[key] = (winner.awardCounts[key] || 0) + 1;
  });

  const completedSeasonEntries = (state.season.playerStats || []).map((playerData) =>
    createSeasonHistoryEntry(playerData, state.seasonYear)
  );
  state.seasonHistory = [
    ...(state.seasonHistory || []).filter((entry) => entry.seasonYear !== state.seasonYear),
    ...completedSeasonEntries
  ];

  state.recordedAwardSeasonYear = state.seasonYear;
}

function resetPersistentAwardCounts() {
  teams.forEach((team) => {
    team.players.forEach((playerData) => {
      ensurePlayerRuntimeState(playerData);
      playerData.awardCounts = {
        bestSubs: 0,
        mvps: 0,
        orangeCaps: 0,
        purpleCaps: 0
      };
      playerData.careerRecords = {
        highestScore: 0,
        highestScoreBalls: 0,
        highestScoreNotOut: false,
        bestBowlingWickets: 0,
        bestBowlingRuns: 999,
        bestBowlingOversBalls: 0,
        bestBowlingEconomy: 99
      };
    });
  });
  state.recordedAwardSeasonYear = null;
  state.seasonHistory = [];
}

function getOffseasonPlayerId(playerData, fallbackTeamCode, index = 0) {
  return playerData.offseasonId || `${fallbackTeamCode}:${playerData.customId || playerData.name}:${index}`;
}

function cloneTeamForOffseason(team) {
  return {
    ...team,
    players: team.players.map((playerData, index) => {
      const cloned = clonePlayer(playerData);
      cloned.teamCode = team.code;
      cloned.offseasonId = getOffseasonPlayerId(cloned, team.code, index);
      return cloned;
    })
  };
}

function buildOffseasonState() {
  const workingTeams = teams.map((team) => cloneTeamForOffseason(team));
  const userTeam = workingTeams.find((team) => team.code === state.franchiseTeam);
  const retainedMap = {};
  workingTeams.forEach((team) => {
    retainedMap[team.code] = team.code === state.franchiseTeam
      ? getAutoRetainedIds(team.players, 0.7, team.players.length)
      : getAutoRetainedIds(team.players, 0.62, 14);
  });

  return {
    phase: "retention",
    year: state.seasonYear + 1,
    salaryCap: OFFSEASON_SALARY_CAP,
    workingTeams,
    rookieClass: generateOffseasonRookieClass(),
    retainedMap,
    budgets: Object.fromEntries(workingTeams.map((team) => [team.code, OFFSEASON_SALARY_CAP])),
    releasedPool: [],
    auctionPool: [],
    unsoldPool: [],
    auctionIndex: 0,
    auctionHistory: [],
    tradeHistory: [],
    tradeState: createEmptyTradeState(),
    userTeamCode: state.franchiseTeam,
    userTargetRosterSize: Math.min(MAX_ROSTER_SIZE, Math.max(18, userTeam ? userTeam.players.length : 18))
  };
}

function getWorkingOffseasonTeam(teamCode) {
  return state.offseason?.workingTeams?.find((team) => team.code === teamCode) || null;
}

function getRetainedSalaryForTeam(teamCode) {
  const team = getWorkingOffseasonTeam(teamCode);
  const retainedSet = state.offseason?.retainedMap?.[teamCode];
  if (!team || !retainedSet) {
    return 0;
  }
  return team.players
    .filter((playerData) => retainedSet.has(playerData.offseasonId))
    .reduce((total, playerData) => total + (Number(playerData.contract) || 0), 0);
}

function getRemainingPurse(teamCode) {
  return Math.max(0, OFFSEASON_SALARY_CAP - getRetainedSalaryForTeam(teamCode) - (state.offseason?.budgets?.[teamCode] !== undefined
    ? OFFSEASON_SALARY_CAP - state.offseason.budgets[teamCode]
    : 0));
}

function getDisplayedOffseasonBudget(teamCode) {
  return state.offseason?.budgets?.[teamCode] ?? Math.max(0, OFFSEASON_SALARY_CAP - getRetainedSalaryForTeam(teamCode));
}

function formatCrores(value) {
  const numeric = Number(value) || 0;
  return `${numeric.toFixed(numeric % 1 === 0 ? 0 : 1)} cr`;
}

function scoreRetentionCandidate(playerData) {
  const overall = playerData.ratings?.overall || 50;
  const age = Number(playerData.age) || 28;
  const contract = Number(playerData.contract) || 0;
  const ageBonus = age <= 24 ? 6 : age <= 28 ? 3 : age >= 34 ? -6 : 0;
  const roleBonus = playerData.opener || playerData.deathBowl ? 2 : 0;
  return overall + ageBonus + roleBonus - contract * 1.15;
}

function getGuaranteedRetentionIds(players) {
  return new Set(
    players
      .filter((playerData) => {
        const overall = playerData.ratings?.overall || 0;
        const age = Number(playerData.age) || 99;
        return overall >= 86 || (overall >= 85 && age <= 27);
      })
      .map((playerData) => playerData.offseasonId)
  );
}

function getAutoRetainedIds(players, retentionRate = 0.7, maxPlayers = players.length) {
  const ranked = [...players].sort((a, b) => scoreRetentionCandidate(b) - scoreRetentionCandidate(a));
  const guaranteedIds = getGuaranteedRetentionIds(players);
  const retainCount = clamp(Math.round(players.length * retentionRate), 9, Math.min(players.length, maxPlayers, MAX_ROSTER_SIZE));
  const retained = new Set();

  ranked.forEach((playerData) => {
    if (retained.size >= retainCount || !guaranteedIds.has(playerData.offseasonId)) {
      return;
    }
    retained.add(playerData.offseasonId);
  });

  ranked.forEach((playerData) => {
    if (retained.size >= retainCount) {
      return;
    }
    retained.add(playerData.offseasonId);
  });

  return retained;
}

function applyAiRetentions() {
  state.offseason.workingTeams.forEach((team) => {
    if (team.code === state.franchiseTeam) {
      return;
    }
    state.offseason.retainedMap[team.code] = getAutoRetainedIds(team.players, 0.62, 14);
  });
}

function finalizeRetentionPhase() {
  applyAiRetentions();
  const releasedPool = [];
  const rookieClass = (state.offseason.rookieClass || []).map((playerData) => clonePlayer(playerData));
  state.teamLineups = state.teamLineups || {};
  state.impactSubs = state.impactSubs || {};
  state.bowlingPlans = state.bowlingPlans || {};
  state.offseason.workingTeams.forEach((team) => {
    const retainedSet = state.offseason.retainedMap[team.code];
    const retainedPlayers = [];
    team.players.forEach((playerData) => {
      if (retainedSet.has(playerData.offseasonId)) {
        retainedPlayers.push(playerData);
      } else {
        const released = clonePlayer(playerData);
        released.offseasonId = playerData.offseasonId;
        released.originalTeamCode = team.code;
        releasedPool.push(released);
      }
    });
    team.players = retainedPlayers;
    team.teamRatings = calculateTeamRatings(team.players);
    team.attackProfile = buildAttackProfile(team.players);
    state.offseason.budgets[team.code] = Math.max(0, OFFSEASON_SALARY_CAP - retainedPlayers.reduce((total, playerData) => total + (Number(playerData.contract) || 0), 0));
    applyAutoStartingLineup(team.code, team);
  });

  state.offseason.phase = "auction";
  state.offseason.releasedPool = [...releasedPool, ...rookieClass];
  state.offseason.auctionPool = [...releasedPool, ...rookieClass].sort((a, b) => {
    const valueDiff = getPlayerAuctionValue(b) - getPlayerAuctionValue(a);
    if (valueDiff !== 0) return valueDiff;
    return (b.ratings?.overall || 0) - (a.ratings?.overall || 0);
  });
  state.offseason.unsoldPool = [];
  state.offseason.auctionIndex = 0;
  state.offseason.auctionHistory = [];
}

function getAuctionRosterNeedScore(team, playerData) {
  const rosterSizePenalty = Math.max(0, MAX_ROSTER_SIZE - team.players.length) * 4;
  const openerNeed = playerData.opener && !team.players.some((entry) => entry.opener) ? 6 : 0;
  const deathNeed = playerData.deathBowl && !team.players.some((entry) => entry.deathBowl) ? 6 : 0;
  const bowlingNeed = (playerData.bowlingType || "none") !== "none" && team.players.filter((entry) => (entry.bowlingType || "none") !== "none").length < 6 ? 4 : 0;
  return rosterSizePenalty + openerNeed + deathNeed + bowlingNeed;
}

function getBestAuctionBidder(playerData, excludedTeamCode = null) {
  const auctionValue = getPlayerAuctionValue(playerData);
  const bidders = state.offseason.workingTeams
    .filter((team) => team.code !== excludedTeamCode)
    .filter((team) => team.players.length < MAX_ROSTER_SIZE)
    .filter((team) => (state.offseason.budgets[team.code] || 0) >= auctionValue)
    .map((team) => ({
      team,
      score: getAuctionRosterNeedScore(team, playerData) + (team.code === state.franchiseTeam ? 0 : 2) + (100 - Math.abs((team.teamRatings?.overall || 75) - (playerData.ratings?.overall || 75))) * 0.03
    }))
    .sort((a, b) => b.score - a.score);
  return bidders[0]?.team || null;
}

function assignAuctionPlayer(teamCode, playerData) {
  const team = getWorkingOffseasonTeam(teamCode);
  if (!team || team.players.length >= MAX_ROSTER_SIZE) {
    return;
  }
  const auctionValue = getPlayerAuctionValue(playerData);
  const purchased = clonePlayer(playerData);
  purchased.teamCode = teamCode;
  purchased.offseasonId = playerData.offseasonId || getOffseasonPlayerId(playerData, teamCode, team.players.length);
  purchased.contract = auctionValue;
  purchased.marketValue = auctionValue;
  team.players = [...team.players, purchased];
  team.teamRatings = calculateTeamRatings(team.players);
  team.attackProfile = buildAttackProfile(team.players);
  state.offseason.budgets[teamCode] = Math.max(0, (state.offseason.budgets[teamCode] || 0) - auctionValue);
  state.offseason.auctionHistory.unshift({
    teamCode,
    playerName: playerData.name,
    contract: auctionValue
  });
}

function resolveAuctionPlayer(playerData, userBuysPlayer = false) {
  const poolIndex = state.offseason.auctionPool.findIndex((entry) => entry.offseasonId === playerData.offseasonId);
  if (poolIndex === -1) {
    return;
  }
  const auctionValue = getPlayerAuctionValue(playerData);
  let winningTeam = null;
  if (userBuysPlayer) {
    winningTeam = getWorkingOffseasonTeam(state.franchiseTeam) && (state.offseason.budgets[state.franchiseTeam] || 0) >= auctionValue
      ? getWorkingOffseasonTeam(state.franchiseTeam)
      : null;
  }
  if (!winningTeam) {
    winningTeam = getBestAuctionBidder(playerData, userBuysPlayer ? null : state.franchiseTeam);
  }
  if (winningTeam) {
    assignAuctionPlayer(winningTeam.code, playerData);
  } else {
    state.offseason.unsoldPool.push(clonePlayer(playerData));
    state.offseason.auctionHistory.unshift({
      teamCode: "UNSOLD",
      playerName: playerData.name,
      contract: auctionValue
    });
  }
  state.offseason.auctionPool.splice(poolIndex, 1);
}

function autoResolveAuctionPlayer(playerData) {
  const poolIndex = state.offseason.auctionPool.findIndex((entry) => entry.offseasonId === playerData.offseasonId);
  if (poolIndex === -1) {
    return;
  }
  const auctionValue = getPlayerAuctionValue(playerData);

  const winningTeam = getBestAuctionBidder(playerData, null);
  if (winningTeam) {
    assignAuctionPlayer(winningTeam.code, playerData);
  } else {
    state.offseason.unsoldPool.push(clonePlayer(playerData));
    state.offseason.auctionHistory.unshift({
      teamCode: "UNSOLD",
      playerName: playerData.name,
      contract: auctionValue
    });
  }

  state.offseason.auctionPool.splice(poolIndex, 1);
}

function getOffseasonFillOrder() {
  const seasonTable = Array.isArray(state.season?.table) ? state.season.table : [];
  if (seasonTable.length) {
    return [...seasonTable]
      .sort((a, b) => a.points - b.points || a.netRunRate - b.netRunRate || (a.team.teamRatings?.overall || 0) - (b.team.teamRatings?.overall || 0))
      .map((entry) => entry.team.code);
  }
  return [...state.offseason.workingTeams]
    .sort((a, b) => (a.teamRatings?.overall || 0) - (b.teamRatings?.overall || 0))
    .map((team) => team.code);
}

function fillShortRostersFromUnsoldPool() {
  if (!state.offseason?.unsoldPool?.length) {
    return;
  }

  const teamOrder = getOffseasonFillOrder();
  const MIN_OFFSEASON_ROSTER_SIZE = 14;
  let madeSelection = true;

  while (madeSelection) {
    madeSelection = false;

    teamOrder.forEach((teamCode) => {
      const team = getWorkingOffseasonTeam(teamCode);
      if (!team || team.players.length >= Math.min(MIN_OFFSEASON_ROSTER_SIZE, MAX_ROSTER_SIZE)) {
        return;
      }

      const remainingPurse = state.offseason.budgets[teamCode] || 0;
      const affordableCandidates = state.offseason.unsoldPool
        .map((playerData, index) => ({ playerData, index, value: getPlayerAuctionValue(playerData) }))
        .filter((entry) => entry.value <= remainingPurse)
        .sort((a, b) => b.value - a.value || (b.playerData.ratings?.overall || 0) - (a.playerData.ratings?.overall || 0));

      const selection = affordableCandidates[0];
      if (!selection) {
        return;
      }

      const playerCopy = clonePlayer(selection.playerData);
      playerCopy.teamCode = teamCode;
      playerCopy.offseasonId = getOffseasonPlayerId(playerCopy, teamCode, team.players.length);
      playerCopy.contract = selection.value;
      playerCopy.marketValue = selection.value;
      team.players = [...team.players, playerCopy];
      team.teamRatings = calculateTeamRatings(team.players);
      team.attackProfile = buildAttackProfile(team.players);
      state.offseason.budgets[teamCode] = Math.max(0, remainingPurse - selection.value);
      state.offseason.unsoldPool.splice(selection.index, 1);
      madeSelection = true;
    });

    if (!state.offseason.unsoldPool.length) {
      return;
    }
  }
}

function seedPlayerProgressionTargets(playerData) {
  if (!playerData.makePlayerTargets) {
    playerData.makePlayerTargets = {
      intent: playerData.ratings?.intent ?? 60,
      composure: playerData.ratings?.composure ?? 60,
      econ: playerData.ratings?.econ ?? 25,
      wkts: playerData.ratings?.wkts ?? 25,
      fielding: playerData.fielding ?? 78,
      leadership: playerData.leadership ?? 72
    };
  }
}

function applyOffseasonProgressionToPlayer(playerData, previousSnapshot) {
  seedPlayerProgressionTargets(playerData);
  const currentAge = Number(playerData.age) || 27;
  const nextAge = currentAge + 1;
  const currentBatting = playerData.ratings?.batting ?? 60;
  const currentBowling = playerData.ratings?.bowling ?? 25;
  const ageDelta = nextAge <= 24 ? 2 : nextAge <= 29 ? 1 : nextAge <= 33 ? 0 : -2;
  const volatility = randomInt(-2, 2);
  const battingPerformanceDelta = previousSnapshot
    ? clamp((previousSnapshot.seasonRuns || 0) / 180, -4, 6)
    : 0;
  const bowlingPerformanceDelta = previousSnapshot
    ? clamp((previousSnapshot.seasonWickets || 0) / 14, -4, 6)
    : 0;
  const battingWeightedDelta = nextAge > 34
    ? 0
    : nextAge > 32
    ? clamp(battingPerformanceDelta, -1.5, 1.5)
    : battingPerformanceDelta;
  const bowlingWeightedDelta = nextAge > 34
    ? 0
    : nextAge > 32
    ? clamp(bowlingPerformanceDelta, -1.5, 1.5)
    : bowlingPerformanceDelta;
  const battingPerformanceWeight = nextAge < 30 ? 0.85 : 0.35;
  const bowlingPerformanceWeight = nextAge < 30 ? 0.85 : 0.35;
  const ageWeight = nextAge < 30 ? 0.7 : 1;
  const battingTotalDelta = clamp(
    ageDelta * ageWeight + battingWeightedDelta * battingPerformanceWeight + volatility * 0.35,
    -4,
    4
  );
  const bowlingTotalDelta = clamp(
    ageDelta * ageWeight + bowlingWeightedDelta * bowlingPerformanceWeight + volatility * 0.35,
    -4,
    4
  );
  const battingDelta = battingTotalDelta - getEliteRegressionPenalty(currentBatting);
  const bowlingDelta = bowlingTotalDelta - getEliteRegressionPenalty(currentBowling);
  playerData.age = nextAge;
  playerData.fielding = clamp(
    (playerData.fielding ?? playerData.makePlayerTargets.fielding ?? 78) + ((battingTotalDelta + bowlingTotalDelta) / 2) * 0.4,
    70,
    99
  );
  playerData.leadership = clamp((playerData.leadership ?? playerData.makePlayerTargets.leadership ?? 72) + (nextAge >= 30 ? 0.8 : 0.2), 70, 99);
  playerData.makePlayerTargets.intent = applyProgressionSoftCap(playerData.makePlayerTargets.intent, battingDelta, currentBatting);
  playerData.makePlayerTargets.composure = applyProgressionSoftCap(playerData.makePlayerTargets.composure, battingDelta * 0.8, currentBatting);
  if ((playerData.bowlingType || "none") !== "none") {
    playerData.makePlayerTargets.econ = applyProgressionSoftCap(playerData.makePlayerTargets.econ, bowlingDelta * 0.7, currentBowling);
    playerData.makePlayerTargets.wkts = applyProgressionSoftCap(playerData.makePlayerTargets.wkts, bowlingDelta * 0.7, currentBowling);
  }
  playerData.ratings = calculateRatings(playerData);
  applyLowOverallUsageBonuses(playerData, previousSnapshot, currentBatting, currentBowling);
  refreshPlayerArchetype(playerData);
  ensurePlayerRuntimeState(playerData);
}

function refreshAllTeamDerivedState() {
  teams.forEach((team) => {
    team.players.forEach((playerData) => {
      playerData.teamCode = team.code;
      ensurePlayerRuntimeState(playerData);
    });
    team.teamRatings = calculateTeamRatings(team.players);
    team.attackProfile = buildAttackProfile(team.players);
  });
}

function completeOffseasonAndStartNextSeason() {
  fillShortRostersFromUnsoldPool();
  state.tradeModal.open = false;
  state.tradeModal.activeSlot = null;
  ["retention-overlay", "auction-overlay", "trade-overlay"].forEach((id) => {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.hidden = true;
    }
  });
  document.body.classList.remove("how-to-play-open");
  state.teamLineups = {};
  state.impactSubs = {};
  state.bowlingPlans = {};
  state.offseason.workingTeams.forEach((team) => {
    applyAutoStartingLineup(team.code, team);
  });
  const previousStats = new Map(
    (state.season?.playerStats || []).map((entry) => [`${entry.teamCode}::${entry.customId || entry.name}`, entry])
  );

  teams = state.offseason.workingTeams.map((team) => ({
    ...team,
    players: team.players.map((playerData, index) => {
      const cloned = clonePlayer(playerData);
      cloned.teamCode = team.code;
      cloned.offseasonId = getOffseasonPlayerId(cloned, team.code, index);
      const previousSnapshot = previousStats.get(`${playerData.originalTeamCode || playerData.teamCode || team.code}::${playerData.customId || playerData.name}`)
        || previousStats.get(`${team.code}::${playerData.customId || playerData.name}`);
      applyOffseasonProgressionToPlayer(cloned, previousSnapshot);
      return cloned;
    })
  }));

  refreshAllTeamDerivedState();
  refreshGeneratedContracts();
  state.seasonYear += 1;
  state.recordedAwardSeasonYear = null;
  state.offseason = null;
  state.season = resetSeason();
  state.matchLog = [];
  state.tickerLabel = "";
  state.tickerItems = [];
  state.lastCelebratedChampion = null;
  state.lastCelebratedTournamentMvp = null;
  state.lastSeasonLossChampion = null;
  state.teamLineups = {};
  state.impactSubs = {};
  state.bowlingPlans = {};
  teams.forEach((team) => {
    applyAutoStartingLineup(team.code, team);
  });
  syncFeaturedMatchToSeason();
  renderAll();
  renderFeaturedResultMessage(`Season ${state.seasonYear} is ready. Retentions, auction results, and rating changes have been applied.`);
}

function renderMatchLog() {
  const container = document.getElementById("match-log");
  if (!state.matchLog.length) {
    container.innerHTML = `<div class="match-item"><h3>No simulations yet</h3><p>Run a featured matchup or a full season to populate the feed.</p></div>`;
    return;
  }

  container.innerHTML = state.matchLog.map((match) => `
    <article class="match-item">
      <div class="match-pill">
        <strong>${match.scorecard.first.teamCode} ${renderScoreLink(match.scorecard.first, "#live-scorecard-section")}</strong>
        <span>${match.venue}</span>
      </div>
      <p>${match.scorecard.second.teamCode} ${renderScoreLink(match.scorecard.second, "#live-scorecard-section")}</p>
      <p><strong>${match.isTie ? "Match tied" : `${match.winner.code} won by ${match.margin}`}</strong>. Player of the Match: ${formatMatchMvp(match)}.</p>
      <div class="scorecard-block">
        ${renderScorecardMarkup(match)}
      </div>
    </article>
  `).join("");
}

function renderTicker() {
  const container = document.getElementById("results-ticker");
  if (!container) {
    return;
  }

  if (!state.tickerItems.length) {
    const upcoming = getUpcomingTickerWeek();
    if (upcoming) {
      const joined = upcoming.fixtures
        .map((fixture) => `<span class="ticker-result">${renderUpcomingTickerMarkup(fixture)}</span>`)
        .join('<span class="ticker-separator">•</span>');
      const sequence = `<span class="ticker-label">${escapeHtml(upcoming.label)}:</span><span class="ticker-result-list">${joined}</span>`;
      container.innerHTML = buildTickerTrackMarkup(sequence);
      return;
    }

    const placeholder = escapeHtml("League results will scroll here on simulation");
    container.innerHTML = buildTickerTrackMarkup(`<span>${placeholder}</span>`);
    return;
  }

  const label = escapeHtml(state.tickerLabel || "WEEK");
  const joined = state.tickerItems
    .map((item) => `<span class="ticker-result">${renderTickerResultMarkup(item)}</span>`)
    .join('<span class="ticker-separator">•</span>');
  const sequence = `<span class="ticker-label">${label}:</span><span class="ticker-result-list">${joined}</span>`;
  container.innerHTML = buildTickerTrackMarkup(sequence);
}

function buildTickerTrackMarkup(sequence) {
  return `
    <div class="ticker-track">
      <div class="ticker-sequence">${sequence}</div>
      <div class="ticker-sequence" aria-hidden="true">${sequence}</div>
      <div class="ticker-sequence" aria-hidden="true">${sequence}</div>
      <div class="ticker-sequence" aria-hidden="true">${sequence}</div>
    </div>
  `;
}
function renderStandings() {
  const rows = [...state.season.table].sort((a, b) => b.points - a.points || b.netRunRate - a.netRunRate);
  document.getElementById("standings").innerHTML = `
    <table>
      <thead>
        <tr><th>Team</th><th>W</th><th>L</th><th>Pts</th><th>NRR</th></tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td>${row.team.code}</td>
            <td>${row.wins}</td>
            <td>${row.losses}</td>
            <td>${row.points}</td>
            <td>${row.netRunRate.toFixed(2)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderAwards() {
  const races = [
    {
      label: "Best Impact Sub",
      player: state.season.awards.impactPlayer,
      stat: state.season.awards.impactPlayer
        ? `${state.season.awards.impactPlayer.mvpScore || 0} impact`
        : "Need 75% impact usage"
    },
    { label: "Purple Cap Holder", player: state.season.awards.bestBowler, stat: `${Math.round(state.season.awards.bestBowler?.seasonWickets || 0)} wickets` },
    { label: "Orange Cap Holder", player: state.season.awards.bestBatter, stat: `${state.season.awards.bestBatter?.seasonRuns || 0} runs` },
    { label: "MVP", player: state.season.awards.mvp, stat: `${state.season.awards.mvp?.mvpScore || 0} impact score` }
  ];

  document.getElementById("award-races").innerHTML = races.map((race) => `
    <article class="award-item">
      <div>
        <p class="eyebrow">${race.label}</p>
        <strong>${race.player ? race.player.name : "Waiting on simulation"}</strong>
        <span>${race.player ? `${race.player.teamCode} • ${race.player.role}` : "Simulate a season to populate awards."}</span>
      </div>
      <span>${race.stat}</span>
    </article>
  `).join("");

  renderSeasonStatLeaders();
}

function renderLatestScorecard() {
  const container = document.getElementById("latest-scorecard");
  if (!container) {
    return;
  }

  const latestMatch = state.matchLog[0];
  if (!latestMatch) {
    container.innerHTML = `<div class="scorecard-block"><p class="player-season-line">Simulate a match to see a full batting and bowling scorecard here.</p></div>`;
    return;
  }

  container.innerHTML = renderScorecardMarkup(latestMatch);
}

function renderScorecardMarkup(match) {
  return `
    <div class="scorecard-block">
      <div class="scorecard-meta">
        <span>${match.venue}</span>
        <span>${match.pitch}</span>
        <span>Toss: ${match.tossWinner}</span>
        <span>${match.isTie ? "Match tied" : `${match.winner.code} won by ${match.margin}`}</span>
        <span>POTM: ${formatMatchMvp(match)}</span>
      </div>
      ${match.superOvers?.length ? `
        <div class="scorecard-table">
          ${match.superOvers.map((superOver) => `
            <div class="scorecard-entry">
              <span>Super Over ${superOver.overNumber}</span>
              <span>${superOver.homeCode} ${superOver.homeScore} - ${superOver.awayScore} ${superOver.awayCode}</span>
            </div>
          `).join("")}
        </div>
      ` : ""}
      ${renderInningsMarkup(match.scorecard.first)}
      ${renderInningsMarkup(match.scorecard.second)}
    </div>
  `;
}

function renderInningsMarkup(innings) {
  return `
    <div class="scorecard-block">
      <div class="scorecard-innings-head">
        <strong>${innings.teamCode} Innings</strong>
        <span>${innings.total}/${innings.wickets} (${innings.overs})</span>
      </div>
      <div class="scorecard-table">
        ${innings.batting.map((entry) => `
          <div class="scorecard-entry">
            <span>${entry.name}${entry.notOut ? "*" : ""}</span>
            <span>${entry.didBat ? `${entry.runs}${entry.notOut ? "*" : ""} (${entry.balls})` : "DNB"}</span>
          </div>
        `).join("")}
      </div>
      <div class="scorecard-table">
        ${innings.bowling.map((entry) => `
          <div class="scorecard-entry">
            <span>${entry.name}</span>
            <span>${entry.overs} ov • ${entry.runs} r • ${entry.wickets} w</span>
          </div>
        `).join("")}
        <div class="scorecard-entry">
          <span>Extras</span>
          <span>${formatExtrasSummary(innings.extrasBreakdown || { total: innings.extras || 0, wides: 0, noBalls: 0, byes: 0, legByes: 0 })}</span>
        </div>
      </div>
    </div>
  `;
}

function simulateMatch(home, away) {
  const pitch = getPitchProfile(home);
  const tossWinner = Math.random() < 0.5 ? home : away;
  const bowlFirst = pitch.chaseBias + randomBetween(-0.12, 0.12) > 0.18;
  const battingFirst = bowlFirst ? (tossWinner.code === home.code ? away : home) : tossWinner;
  const battingSecond = battingFirst.code === home.code ? away : home;
  const firstInnings = generateInningsBreakdown(battingFirst, battingSecond, {
    pitch,
    inningsNumber: 1,
    target: null
  });
  const secondInnings = generateInningsBreakdown(battingSecond, battingFirst, {
    pitch,
    inningsNumber: 2,
    target: firstInnings.total + 1
  });

  const homeInnings = battingFirst.code === home.code ? firstInnings : secondInnings;
  const awayInnings = battingFirst.code === away.code ? firstInnings : secondInnings;
  const isTie = secondInnings.total === firstInnings.total;
  const winner = isTie ? null : (secondInnings.total > firstInnings.total ? battingSecond : battingFirst);
  const margin = isTie
    ? "tie"
    : winner.code === battingFirst.code
      ? `${firstInnings.total - secondInnings.total} runs`
      : `${10 - secondInnings.wickets} wickets`;
  const motm = determinePlayerOfMatch(firstInnings, secondInnings, winner);

  const result = {
    home,
    away,
    homeScore: homeInnings.total,
    awayScore: awayInnings.total,
    homeWkts: homeInnings.wickets,
    awayWkts: awayInnings.wickets,
    winner,
    isTie,
    margin,
    mvp: motm.name,
    mvpBreakdown: motm,
    venue: home.venue,
    pitch: pitch.label,
    tossWinner: tossWinner.code,
    battingFirst: battingFirst.code,
    scorecard: {
      first: firstInnings,
      second: secondInnings,
      home: homeInnings,
      away: awayInnings
    }
  };

  return isTie ? resolveMatchTieWithSuperOvers(result, pitch) : result;
}

function simulateSeason() {
  const season = state.season?.schedule?.length ? state.season : resetSeason();
  if (season.champion) {
    return season;
  }
  const results = [];

  for (let roundIndex = season.currentRound; roundIndex < season.schedule.length; roundIndex += 1) {
    const round = season.schedule[roundIndex];
    round.fixtures.forEach((fixture) => {
      if (fixture.played && fixture.result) {
        results.push(fixture.result);
        return;
      }
      const result = simulateMatch(
        buildLineupTeam(findTeam(fixture.homeCode)),
        buildLineupTeam(findTeam(fixture.awayCode))
      );
      fixture.played = true;
      fixture.result = result;
      updateTable(season.table, result);
      updatePlayers(season.playerStats, result);
      results.push(result);
    });
  }

  season.currentRound = season.schedule.length;
  initializePlayoffs(season);
  const qualifier1 = playOrReplayPlayoffFixture(season, "qualifier1");
  const eliminator = playOrReplayPlayoffFixture(season, "eliminator");
  const qualifier2 = playOrReplayPlayoffFixture(season, "qualifier2");
  const final = playOrReplayPlayoffFixture(season, "final");
  state.tickerLabel = "SEASON";
  state.tickerItems = results.slice(-4);
  const playoffTeamCodes = new Set(season.playoffs.seedOrder);

  return {
    ...season,
    table: season.table,
    champion: final.winner,
    featuredMatches: [final, qualifier2, eliminator, qualifier1, ...results.slice(-6).reverse()].slice(0, 10),
    playerStats: season.playerStats,
    awards: calculateSeasonAwards(season.playerStats)
  };
}

function updateTable(table, result) {
  const homeRow = table.find((row) => row.team.code === result.home.code);
  const awayRow = table.find((row) => row.team.code === result.away.code);
  const delta = (result.homeScore - result.awayScore) / 100;

  if (result.isTie) {
    homeRow.points += 1;
    awayRow.points += 1;
  } else if (result.winner.code === result.home.code) {
    homeRow.wins += 1;
    homeRow.points += 2;
    awayRow.losses += 1;
  } else {
    awayRow.wins += 1;
    awayRow.points += 2;
    homeRow.losses += 1;
  }

  homeRow.netRunRate += delta;
  awayRow.netRunRate -= delta;
}

function updatePlayers(playerBook, result) {
  const impactEntries = calculateMatchImpactEntries(result.scorecard.first, result.scorecard.second);
  const impactMap = new Map(impactEntries.map((entry) => [`${entry.teamCode}::${entry.name}`, entry]));
  [result.home, result.away].forEach((team) => {
    const persistentTeam = findTeam(team.code);
    const impactAppearanceNames = new Set(getActiveImpactAppearanceNames(team));
    const seasonParticipants = [
      ...(team.players || []),
      ...((team.bowlingPlayers || []).filter((playerData) => !team.players?.some((entry) => entry.name === playerData.name)))
    ];
    seasonParticipants.forEach((playerData) => {
      const found = playerBook.find((entry) => entry.name === playerData.name && entry.teamCode === team.code);
      if (!found) return;
      const battingEntry = getSeasonBattingEntry(result, team.code, playerData.name);
      const bowlingEntry = getSeasonBowlingEntry(result, team.code, playerData.name);
      const boundaryEstimate = estimateBattingBoundaries(battingEntry);
      found.matchesPlayed += 1;
      found.seasonRuns += battingEntry?.runs || 0;
      found.seasonBallsFaced += battingEntry?.balls || 0;
      updateHighestScore(found, battingEntry);
      const persistentPlayer = persistentTeam?.players?.find((entry) => (
        ((playerData.customId || null) && entry.customId === playerData.customId) || entry.name === playerData.name
      )) || null;
      updateCareerHighestScore(persistentPlayer, battingEntry);
      if (battingEntry?.didBat && !battingEntry.notOut) {
        found.seasonDismissals = Math.min(found.seasonDismissals + 1, found.matchesPlayed);
      }
      found.seasonFours += boundaryEstimate.fours;
      found.seasonSixes += boundaryEstimate.sixes;
      found.seasonWickets += bowlingEntry?.wickets || 0;
      found.seasonOversBalls += bowlingEntry ? oversToBalls(bowlingEntry.overs) : 0;
      found.seasonRunsConceded += bowlingEntry?.runs || 0;
      updateBestBowlingFigures(found, bowlingEntry);
      updateCareerBestBowling(persistentPlayer, bowlingEntry);
      found.seasonCatches += Math.max(0, Math.round((playerData.fielding - 72) / 18));
      found.mvpScore += impactMap.get(`${team.code}::${playerData.name}`)?.totalImpact || 0;
      if (impactAppearanceNames.has(playerData.name)) {
        found.impactAppearances += 1;
      }
      hydrateSeasonRateStats(found);
    });
  });
}

function getAverageOfTopSeasonValues(playerBook, key, limit = 20) {
  const topValues = (playerBook || [])
    .map((playerData) => Number(playerData?.[key]) || 0)
    .filter((value) => value > 0)
    .sort((a, b) => b - a)
    .slice(0, limit);

  if (!topValues.length) {
    return 0;
  }

  return topValues.reduce((sum, value) => sum + value, 0) / topValues.length;
}

function getActiveImpactAppearanceNames(team) {
  if (!team?.activeTwelve?.length) {
    return [];
  }

  const impactIndices = getImpactSubIndices(team.code)
    .filter((index) => index >= 0 && index < team.activeTwelve.length);
  const impactCandidates = impactIndices
    .map((index) => team.activeTwelve[index])
    .filter(Boolean);
  const battingNames = new Set((team.players || []).map((playerData) => playerData.name));
  const bowlingNames = new Set((team.bowlingPlayers || []).map((playerData) => playerData.name));

  return impactCandidates
    .filter((playerData) => battingNames.has(playerData.name) || bowlingNames.has(playerData.name))
    .map((playerData) => playerData.name);
}

function updateHighestScore(playerData, battingEntry) {
  if (!battingEntry?.didBat) {
    return;
  }

  const isBetterScore = battingEntry.runs > playerData.highestScore;
  const isSameScoreFaster = battingEntry.runs === playerData.highestScore
    && battingEntry.balls > 0
    && (playerData.highestScoreBalls === 0 || battingEntry.balls < playerData.highestScoreBalls);

  if (!isBetterScore && !isSameScoreFaster) {
    return;
  }

  playerData.highestScore = battingEntry.runs;
  playerData.highestScoreBalls = battingEntry.balls || 0;
  playerData.highestScoreNotOut = Boolean(battingEntry.notOut);
}

function updateBestBowlingFigures(playerData, bowlingEntry) {
  if (!bowlingEntry || oversToBalls(bowlingEntry.overs) <= 0) {
    return;
  }

  const oversBalls = oversToBalls(bowlingEntry.overs);
  const economy = oversBalls > 0 ? bowlingEntry.runs / (oversBalls / 6) : 99;
  const isBetterWicketHaul = bowlingEntry.wickets > playerData.bestBowlingWickets;
  const isSameWicketsBetterEconomy = bowlingEntry.wickets === playerData.bestBowlingWickets
    && economy < playerData.bestBowlingEconomy;
  const isSameFiguresBetterRuns = bowlingEntry.wickets === playerData.bestBowlingWickets
    && economy === playerData.bestBowlingEconomy
    && bowlingEntry.runs < playerData.bestBowlingRuns;

  if (!isBetterWicketHaul && !isSameWicketsBetterEconomy && !isSameFiguresBetterRuns) {
    return;
  }

  playerData.bestBowlingWickets = bowlingEntry.wickets;
  playerData.bestBowlingRuns = bowlingEntry.runs;
  playerData.bestBowlingOversBalls = oversBalls;
  playerData.bestBowlingEconomy = economy;
}

function updateCareerHighestScore(playerData, battingEntry) {
  if (!playerData || !battingEntry?.didBat) {
    return;
  }
  ensurePlayerRuntimeState(playerData);
  const record = playerData.careerRecords;
  const isBetterScore = battingEntry.runs > record.highestScore;
  const isSameScoreFaster = battingEntry.runs === record.highestScore
    && battingEntry.balls > 0
    && (record.highestScoreBalls === 0 || battingEntry.balls < record.highestScoreBalls);

  if (!isBetterScore && !isSameScoreFaster) {
    return;
  }

  record.highestScore = battingEntry.runs;
  record.highestScoreBalls = battingEntry.balls || 0;
  record.highestScoreNotOut = Boolean(battingEntry.notOut);
}

function updateCareerBestBowling(playerData, bowlingEntry) {
  if (!playerData || !bowlingEntry || oversToBalls(bowlingEntry.overs) <= 0) {
    return;
  }
  ensurePlayerRuntimeState(playerData);
  const record = playerData.careerRecords;
  const oversBalls = oversToBalls(bowlingEntry.overs);
  const economy = oversBalls > 0 ? bowlingEntry.runs / (oversBalls / 6) : 99;
  const isBetterWicketHaul = bowlingEntry.wickets > record.bestBowlingWickets;
  const isSameWicketsBetterEconomy = bowlingEntry.wickets === record.bestBowlingWickets
    && economy < record.bestBowlingEconomy;
  const isSameFiguresBetterRuns = bowlingEntry.wickets === record.bestBowlingWickets
    && economy === record.bestBowlingEconomy
    && bowlingEntry.runs < record.bestBowlingRuns;

  if (!isBetterWicketHaul && !isSameWicketsBetterEconomy && !isSameFiguresBetterRuns) {
    return;
  }

  record.bestBowlingWickets = bowlingEntry.wickets;
  record.bestBowlingRuns = bowlingEntry.runs;
  record.bestBowlingOversBalls = oversBalls;
  record.bestBowlingEconomy = economy;
}

function getSeasonBattingEntry(result, teamCode, playerName) {
  const innings = [result.scorecard.first, result.scorecard.second].find((entry) => entry.teamCode === teamCode);
  return innings?.batting?.find((entry) => entry.name === playerName) || null;
}

function getSeasonBowlingEntry(result, teamCode, playerName) {
  const innings = [result.scorecard.first, result.scorecard.second].find((entry) => entry.teamCode !== teamCode);
  return innings?.bowling?.find((entry) => entry.name === playerName) || null;
}

function estimateBattingBoundaries(entry) {
  if (!entry?.didBat) {
    return { fours: 0, sixes: 0 };
  }

  const sixes = Math.max(0, Math.round(entry.runs / 19));
  const fours = Math.max(0, Math.round((entry.runs - sixes * 6) / 9));
  return { fours, sixes };
}

function resolveKnockoutResult(result) {
  return result;
}

function resolveMatchTieWithSuperOvers(result, pitch) {
  const superOvers = [];
  let winner = null;

  while (!winner) {
    const superOver = simulateSuperOver(result.home, result.away, pitch, superOvers.length + 1);
    superOvers.push(superOver);
    if (superOver.homeScore !== superOver.awayScore) {
      winner = superOver.homeScore > superOver.awayScore ? result.home : result.away;
    }
  }

  return {
    ...result,
    isTie: false,
    winner,
    margin: superOvers.length === 1 ? "super over" : `${superOvers.length} super overs`,
    superOvers
  };
}

function simulateSuperOver(home, away, pitch, overNumber) {
  const battingStrength = (team) => average(team.players.slice(0, 3).map((playerData) => playerData.ratings.batting + playerData.ratings.clutch * 0.2));
  const bowlingStrength = (team) => average(
    [...team.players]
      .sort((a, b) => b.ratings.bowling - a.ratings.bowling)
      .slice(0, 2)
      .map((playerData) => playerData.ratings.bowling + playerData.ratings.wkts * 0.15)
  );
  const scoreFor = (battingTeam, bowlingTeam) => Math.round(clamp(
    9 +
    pitch.scoringBoost * 0.08 +
    (battingStrength(battingTeam) - bowlingStrength(bowlingTeam)) * 0.12 +
    randomBetween(-3.4, 3.4),
    2,
    22
  ));

  const homeScore = scoreFor(home, away);
  const awayScore = scoreFor(away, home);
  return {
    overNumber,
    homeCode: home.code,
    awayCode: away.code,
    homeScore,
    awayScore
  };
}

function determinePlayerOfMatch(firstInnings, secondInnings, winner) {
  const ranked = calculateMatchImpactEntries(firstInnings, secondInnings)
    .filter((entry) => !winner || entry.teamCode === winner.code)
    .sort((a, b) => b.totalImpact - a.totalImpact || b.battingImpact - a.battingImpact || b.bowlingImpact - a.bowlingImpact);

  return ranked[0] || createImpactEntry(winner ? winner.players[0].name : firstInnings.batting[0].name, winner ? winner.code : firstInnings.teamCode);
}

function calculateMatchImpactEntries(firstInnings, secondInnings) {
  const inningsList = [firstInnings, secondInnings];
  const playerImpacts = new Map();

  inningsList.forEach((innings) => {
    const bowlingTeamCode = innings.teamCode === firstInnings.teamCode ? secondInnings.teamCode : firstInnings.teamCode;

    innings.batting.forEach((entry) => {
      if (!entry.didBat) return;
      const strikeRate = entry.balls > 0 ? (entry.runs / entry.balls) * 100 : 0;
      const runsImpact = entry.runs * 1;
      const strikeRateImpact = entry.balls >= 8
        ? Math.max(-12, Math.min(20, (strikeRate - 125) * 0.18))
        : Math.max(-4, Math.min(8, (strikeRate - 125) * 0.08));
      const battingImpact = runsImpact + strikeRateImpact;
      const playerKey = getMatchImpactKey(entry.name, innings.teamCode);
      const existing = playerImpacts.get(playerKey) || createImpactEntry(entry.name, innings.teamCode);
      existing.battingImpact += battingImpact;
      existing.totalImpact += battingImpact;
      playerImpacts.set(playerKey, existing);
    });

    innings.bowling.forEach((entry) => {
      const oversValue = oversToBalls(entry.overs) / 6;
      if (oversValue <= 0) return;
      const economy = oversValue > 0 ? entry.runs / oversValue : 99;
      const wicketsImpact = entry.wickets * 36;
      const economyImpact = Math.max(-10, Math.min(18, (7.2 - economy) * oversValue * 1.5));
      const bowlingImpact = wicketsImpact + economyImpact;
      const playerKey = getMatchImpactKey(entry.name, bowlingTeamCode);
      const existing = playerImpacts.get(playerKey) || createImpactEntry(entry.name, bowlingTeamCode);
      existing.bowlingImpact += bowlingImpact;
      existing.totalImpact += bowlingImpact;
      playerImpacts.set(playerKey, existing);
    });
  });

  return [...playerImpacts.values()].map((entry) => ({
    ...entry,
    battingImpact: Math.round(entry.battingImpact),
    bowlingImpact: Math.round(entry.bowlingImpact),
    totalImpact: Math.round(entry.totalImpact)
  }));
}

function createImpactEntry(name, teamCode) {
  return {
    name,
    teamCode,
    battingImpact: 0,
    bowlingImpact: 0,
    totalImpact: 0
  };
}

function getMatchImpactKey(name, teamCode) {
  return `${teamCode}::${name}`;
}

function generateInningsBreakdown(battingTeam, bowlingTeam, context) {
  const pitch = context.pitch;
  const battingOrder = (battingTeam.battingPlayers || battingTeam.players).map((playerData, index) => ({ ...playerData, position: index + 1 }));
  const batting = battingOrder.map((playerData) => ({
    name: playerData.name,
    didBat: false,
    runs: 0,
    balls: 0,
    notOut: false
  }));
  const extrasBreakdown = { total: 0, wides: 0, noBalls: 0, byes: 0, legByes: 0 };
  const bowlingCard = new Map();
  const oversByBowler = {};
  let wicketsLost = 0;
  let total = 0;
  let oversBalls = 0;
  const target = context.target;
  const chasing = context.inningsNumber === 2;
  let strikerIndex = 0;
  let nonStrikerIndex = Math.min(1, battingOrder.length - 1);
  let nextBatterIndex = battingOrder.length > 1 ? 2 : 1;

  markBatterActive(batting, strikerIndex);
  if (nonStrikerIndex !== strikerIndex) {
    markBatterActive(batting, nonStrikerIndex);
  }

  for (let overIndex = 0; overIndex < 20; overIndex += 1) {
    if (wicketsLost >= 10 || (chasing && target && total >= target)) {
      break;
    }

    const currentBowler = resolveBowlerForOver(bowlingTeam, overIndex, oversByBowler, pitch, battingOrder);
    if (!currentBowler) {
      break;
    }

    const bowlerCard = ensureBowlingCardEntry(bowlingCard, currentBowler.name);
    let legalBallsThisOver = 0;

    while (legalBallsThisOver < 6) {
      if (wicketsLost >= 10 || (chasing && target && total >= target)) {
        break;
      }

      const striker = battingOrder[strikerIndex];
      const strikerEntry = batting[strikerIndex];
      const deathShare = overIndex >= 16 ? 1 : overIndex >= 14 ? 0.65 : overIndex >= 6 ? 0.28 : 0.12;
      const phaseBoost = overIndex < 6 ? 0.08 : overIndex >= 15 ? 0.12 : 0;
      const wicketsInHand = Math.max(0, 10 - wicketsLost);
      const battingComposition = buildBattingComposition(battingOrder.slice(strikerIndex, Math.min(battingOrder.length, nextBatterIndex + 3)));
      const battingModifier = getBattingConditionsModifier(striker, bowlingTeam.attackProfile, pitch, strikerIndex);
      const bowlingModifier = getBowlingConditionsModifier(currentBowler, pitch, battingComposition);
      const deathFactor = getDeathBowlingFactor(currentBowler, deathShare);
      const oversRemaining = Math.max(1, 20 - overIndex - (legalBallsThisOver / 6));
      const requiredRate = chasing && target ? Math.max(0, (target - total) / oversRemaining) : 0;
      const intentPressure = chasing && target
        ? Math.max(0, (requiredRate - 8) * 0.045)
        : 0;
      const battingEdge = (
        (striker.ratings.batting - currentBowler.ratings.bowling) * 0.012 +
        (striker.ratings.intent - 55) * 0.0035 +
        (striker.ratings.composure - 55) * 0.0025 +
        (battingModifier - 1) * 0.75 +
        phaseBoost +
        intentPressure +
        Math.max(0, wicketsInHand - 4) * 0.01
      );
      const bowlingEdge = (
        (bowlingModifier - 1) * 0.55 +
        (deathFactor.economyBoost - 1) * 0.42 +
        (currentBowler.ratings.econ - 55) * 0.0025
      );
      const extrasChance = clamp(
        0.02 +
        Math.max(0, 58 - currentBowler.ratings.econ) * 0.0008 +
        Math.max(0, pitch.scoringBoost) * 0.0004,
        0.012,
        0.065
      );

      if (Math.random() < extrasChance) {
        const isWide = Math.random() < 0.72;
        total += 1;
        bowlerCard.runs += 1;
        extrasBreakdown.total += 1;
        if (isWide) {
          extrasBreakdown.wides += 1;
        } else {
          extrasBreakdown.noBalls += 1;
        }
        continue;
      }

      legalBallsThisOver += 1;
      oversBalls += 1;
      strikerEntry.didBat = true;
      strikerEntry.balls += 1;
      bowlerCard.balls += 1;

      const dismissalChance = clamp(
        0.016 +
        getDismissalRisk(striker, bowlingTeam.attackProfile, pitch, strikerIndex) * 0.05 +
        Math.max(0, currentBowler.ratings.wkts - 60) * 0.00115 +
        (deathFactor.wicketBoost - 1) * 0.045 -
        Math.max(0, striker.ratings.composure - 65) * 0.00038 -
        Math.max(0, striker.ratings.batting - 78) * 0.00022 +
        (requiredRate > 10.5 ? 0.01 : 0),
        0.012,
        0.16
      );

      if (Math.random() < dismissalChance) {
        wicketsLost += 1;
        bowlerCard.wickets += 1;
        if (wicketsLost >= 10) {
          break;
        }
        strikerIndex = nextBatterIndex;
        nextBatterIndex += 1;
        markBatterActive(batting, strikerIndex);
        continue;
      }

      const shotRuns = resolveBallRuns({
        striker,
        currentBowler,
        pitch,
        battingEdge,
        bowlingEdge,
        deathShare,
        requiredRate,
        wicketsLost
      });

      total += shotRuns;
      strikerEntry.runs += shotRuns;
      bowlerCard.runs += shotRuns;

      if (shotRuns % 2 === 1) {
        [strikerIndex, nonStrikerIndex] = [nonStrikerIndex, strikerIndex];
      }
    }

    if (legalBallsThisOver > 0) {
      oversByBowler[currentBowler.name] = (oversByBowler[currentBowler.name] || 0) + 1;
    }

    if (wicketsLost < 10 && !(chasing && target && total >= target)) {
      [strikerIndex, nonStrikerIndex] = [nonStrikerIndex, strikerIndex];
    }
  }

  if (wicketsLost < 10) {
    if (batting[strikerIndex]) {
      batting[strikerIndex].didBat = true;
      batting[strikerIndex].notOut = true;
    }
    if (batting[nonStrikerIndex] && nonStrikerIndex !== strikerIndex) {
      batting[nonStrikerIndex].didBat = true;
      batting[nonStrikerIndex].notOut = true;
    }
  }

  const bowling = [...bowlingCard.values()]
    .map((entry) => ({
      name: entry.name,
      overs: formatOversFromBalls(entry.balls),
      runs: entry.runs,
      wickets: entry.wickets
    }))
    .filter((entry) => oversToBalls(entry.overs) > 0);

  return {
    teamCode: battingTeam.code,
    total,
    extras: extrasBreakdown.total,
    extrasBreakdown,
    wickets: wicketsLost,
    overs: formatOversFromBalls(oversBalls),
    batting,
    bowling
  };
}

function markBatterActive(batting, batterIndex) {
  if (batterIndex < 0 || batterIndex >= batting.length) {
    return;
  }
  batting[batterIndex].didBat = true;
}

function buildFallbackBowlingPlan(players) {
  return buildAutoBowlingPlan(players);
}

function isPaceBowler(playerData) {
  const bowlingTypes = getBowlingTypes(playerData);
  return bowlingTypes.includes("leftArmPace") || bowlingTypes.includes("rightArmPace") || bowlingTypes.includes("hitTheDeck");
}

function isPrimaryBowler(playerData) {
  return (playerData?.ratings?.bowling || 0) >= 40 || isBowler(playerData) || isAllRounder(playerData);
}

function isEligibleBowler(playerData) {
  return isPrimaryBowler(playerData) || (playerData?.ratings?.bowling || 0) > 25;
}

function ensureBowlingCardEntry(bowlingCard, bowlerName) {
  if (!bowlingCard.has(bowlerName)) {
    bowlingCard.set(bowlerName, {
      name: bowlerName,
      balls: 0,
      runs: 0,
      wickets: 0
    });
  }
  return bowlingCard.get(bowlerName);
}

function resolveBowlerForOver(bowlingTeam, overIndex, oversByBowler, pitch, battingOrder) {
  const bowlersAvailable = getTopBowlingPlanPlayers(bowlingTeam.bowlingPlayers || bowlingTeam.players || []);
  if (!bowlersAvailable.length) {
    return null;
  }

  const bowlingPlan = Array.isArray(bowlingTeam.bowlingPlan) ? bowlingTeam.bowlingPlan : [];
  const plannedBowlerName = bowlingPlan[overIndex];
  const plannedBowler = bowlersAvailable.find((playerData) => playerData.name === plannedBowlerName);
  if (plannedBowler) {
    return plannedBowler;
  }

  const recentName = overIndex > 0 ? bowlingPlan[overIndex - 1] : null;
  const battingComposition = buildBattingComposition(battingOrder.slice(0, 7));
  return bowlersAvailable.find((playerData) => (
    (oversByBowler[playerData.name] || 0) < 4 &&
    playerData.name !== recentName
  )) || [...bowlersAvailable].sort((a, b) => (
    getBowlingConditionsModifier(b, pitch, battingComposition) - getBowlingConditionsModifier(a, pitch, battingComposition)
  ))[0];
}

function resolveBallRuns({ striker, currentBowler, pitch, battingEdge, bowlingEdge, deathShare, requiredRate, wicketsLost }) {
  const baseRunRate = clamp(
    0.72 +
    pitch.scoringBoost / 42 +
    battingEdge -
    bowlingEdge +
    Math.max(0, requiredRate - 7.5) * 0.04 -
    Math.max(0, 6 - wicketsLost) * 0.008,
    0.35,
    2.6
  );
  const boundaryBias = clamp(
    0.12 +
    (striker.ratings.intent - 50) * 0.0034 +
    (striker.ratings.batting - 55) * 0.0022 +
    deathShare * 0.1 +
    Math.max(0, requiredRate - 9) * 0.018,
    0.08,
    0.48
  );
  const sixBias = clamp(
    0.16 +
    (striker.ratings.intent - 55) * 0.003 +
    deathShare * 0.14 -
    Math.max(0, currentBowler.ratings.bowling - 78) * 0.0022,
    0.08,
    0.58
  );
  const dotBias = clamp(
    0.32 +
    Math.max(0, currentBowler.ratings.bowling - striker.ratings.batting) * 0.0045 -
    (striker.ratings.composure - 55) * 0.0022 -
    Math.max(0, requiredRate - 8.5) * 0.02,
    0.14,
    0.6
  );
  const roll = Math.random();

  if (roll < dotBias) {
    return 0;
  }
  if (roll < dotBias + 0.34) {
    return 1;
  }
  if (roll < dotBias + 0.5) {
    return 2;
  }
  if (roll < dotBias + 0.53) {
    return 3;
  }
  if (roll < dotBias + 0.53 + boundaryBias) {
    return Math.random() < sixBias ? 6 : 4;
  }

  return baseRunRate > 1.55 ? 2 : 1;
}

function adjustInningsTotal(batting, extrasBreakdown, delta) {
  if (delta === 0) {
    return;
  }

  if (delta < 0) {
    trimInningsRuns(batting, extrasBreakdown, Math.abs(delta));
    return;
  }

  const lastBatter = [...batting].reverse().find((entry) => entry.didBat);
  if (lastBatter) {
    lastBatter.runs += delta;
    lastBatter.balls = Math.max(lastBatter.balls, Math.ceil(lastBatter.runs / 6));
  } else {
    extrasBreakdown.byes = (extrasBreakdown.byes || 0) + delta;
    extrasBreakdown.total += delta;
  }
}

function trimInningsRuns(batting, extrasBreakdown, runsToTrim) {
  let remaining = runsToTrim;
  const extraFields = ["wides", "noBalls", "legByes", "byes"];

  extraFields.forEach((field) => {
    if (remaining <= 0) return;
    const current = extrasBreakdown[field] || 0;
    const reduction = Math.min(current, remaining);
    extrasBreakdown[field] = current - reduction;
    extrasBreakdown.total = Math.max(0, extrasBreakdown.total - reduction);
    remaining -= reduction;
  });

  for (let index = batting.length - 1; index >= 0 && remaining > 0; index -= 1) {
    const entry = batting[index];
    if (!entry.didBat || entry.runs <= 0) {
      continue;
    }
    const reduction = Math.min(entry.runs, remaining);
    entry.runs -= reduction;
    remaining -= reduction;
  }
}

function pickChaseWinningBuffer() {
  const roll = Math.random();
  if (roll < 0.3) return 0;
  if (roll < 0.55) return 1;
  if (roll < 0.75) return 2;
  if (roll < 0.89) return 3;
  if (roll < 0.97) return 4;
  return 5;
}

function estimateInningsExtras(oversBalls, wicketsLost, pitch) {
  const total = Math.round(clamp(
    4 +
    oversBalls / 30 +
    wicketsLost * 0.35 +
    pitch.scoringBoost / 28 +
    randomBetween(-2, 3),
    2,
    18
  ));
  let remaining = total;
  const wides = Math.min(remaining, Math.max(0, Math.round(total * randomBetween(0.3, 0.5))));
  remaining -= wides;
  const noBalls = Math.min(remaining, Math.max(0, Math.round(total * randomBetween(0.05, 0.15))));
  remaining -= noBalls;
  const byes = Math.min(remaining, Math.max(0, Math.round(total * randomBetween(0.1, 0.25))));
  remaining -= byes;
  const legByes = Math.max(0, remaining);
  return {
    total,
    wides,
    noBalls,
    byes,
    legByes
  };
}

function reconcileBattingBalls(batting, targetBalls) {
  const activeEntries = batting.filter((entry) => entry.didBat);
  if (!activeEntries.length) {
    return;
  }

  const currentBalls = activeEntries.reduce((sum, entry) => sum + entry.balls, 0);
  if (currentBalls === targetBalls) {
    return;
  }

  const orderedEntries = [...activeEntries].sort((a, b) => {
    if (a.notOut !== b.notOut) return a.notOut ? -1 : 1;
    return b.balls - a.balls;
  });

  if (currentBalls < targetBalls) {
    let remaining = targetBalls - currentBalls;
    let index = 0;
    while (remaining > 0) {
      orderedEntries[index % orderedEntries.length].balls += 1;
      remaining -= 1;
      index += 1;
    }
    return;
  }

  let removable = currentBalls - targetBalls;
  let index = 0;
  while (removable > 0 && index < orderedEntries.length * targetBalls) {
    const entry = orderedEntries[index % orderedEntries.length];
    const minimumBalls = Math.max(1, Math.ceil(entry.runs / 6));
    if (entry.balls > minimumBalls) {
      entry.balls -= 1;
      removable -= 1;
    }
    index += 1;
  }
}

function formatExtrasSummary(extrasBreakdown) {
  const total = extrasBreakdown?.total || 0;
  const parts = [];
  if (extrasBreakdown?.wides) parts.push(`Wd ${extrasBreakdown.wides}`);
  if (extrasBreakdown?.noBalls) parts.push(`Nb ${extrasBreakdown.noBalls}`);
  if (extrasBreakdown?.byes) parts.push(`B ${extrasBreakdown.byes}`);
  if (extrasBreakdown?.legByes) parts.push(`Lb ${extrasBreakdown.legByes}`);
  return parts.length ? `${total} (${parts.join(", ")})` : `${total}`;
}

function renderFeaturedResult(result, prefix = "", includeSeasonAwards = false) {
  document.getElementById("featured-result").innerHTML = renderMatchSummaryHTML(result, {
    prefix,
    scorecardAnchor: "#live-scorecard-section",
    includeSeasonAwards
  });
}

function renderMatchSummaryHTML(result, options = {}) {
  const {
    prefix = "",
    scorecardAnchor = "#live-scorecard-section",
    includeSeasonAwards = false,
    awardsAnchor = "#awards-watch-section",
    includeLeagueTableLink = true
  } = options;
  const sentences = [];

  if (prefix) {
    sentences.push(includeSeasonAwards ? `<a class="inline-award-link" href="${awardsAnchor}">Season simulated</a>. ${prefix}` : prefix);
  }

  sentences.push(
    `${result.scorecard.first.teamCode} made ${renderScoreLink(result.scorecard.first, scorecardAnchor)} in ${result.scorecard.first.overs}.`
  );
  sentences.push(
    `${result.scorecard.second.teamCode} replied with ${renderScoreLink(result.scorecard.second, scorecardAnchor)} in ${result.scorecard.second.overs}.`
  );
  sentences.push(result.isTie ? "The match finished tied." : `${result.winner.name} won by ${result.margin}.`);
  sentences.push(includeLeagueTableLink
    ? `${formatMatchMvp(result)} earned Player of the Match. <a class="inline-award-link" href="#standings-section">League Table</a>.`
    : `${formatMatchMvp(result)} earned Player of the Match.`);

  if (includeSeasonAwards && state.season?.awards?.mvp) {
    sentences.push(
      `Man of the Tournament: <a class="inline-award-link" href="${awardsAnchor}">${state.season.awards.mvp.name}</a>.`
    );
  }

  return sentences.join(" ");
}

function renderScoreLink(innings, anchor) {
  return `<a class="inline-score-link" href="${anchor}">${innings.total}/${innings.wickets}</a>`;
}

function initMakePlayerPage() {
  const fields = [
    "make-player-name",
    "make-player-style",
    "make-player-bowling-type",
    "make-player-bowling-hand",
    "make-player-opener",
    "make-player-death-bowl",
    "make-player-team",
    "target-fielding",
    "leadership",
    "target-intent",
    "target-composure",
    "target-econ",
    "target-wkts"
  ];

  fields.forEach((id) => {
    const element = document.getElementById(id);
    if (!element || element.dataset.bound === "true") return;
    const eventName = element.tagName === "SELECT" || element.type === "text" ? "input" : "input";
    element.addEventListener(eventName, renderMakePlayerPreview);
    element.addEventListener("change", renderMakePlayerPreview);
    element.dataset.bound = "true";
  });

  const teamSelect = document.getElementById("make-player-team");
  if (teamSelect && !teamSelect.options.length) {
    teams.forEach((team) => {
      teamSelect.add(new Option(`${team.code} • ${team.name}`, team.code));
    });
    teamSelect.value = state.homeTeam || teams[0]?.code || "";
  }

  const addButton = document.getElementById("add-player-to-team");
  if (addButton && addButton.dataset.bound !== "true") {
    addButton.addEventListener("click", () => {
      const status = document.getElementById("make-player-status");
      const teamCode = document.getElementById("make-player-team")?.value;
      const preview = buildMakePlayerPreviewData();
      if (!teamCode) {
        if (status) status.textContent = "Choose a team before adding the player.";
        return;
      }
      if (!preview.name) {
        if (status) status.textContent = "Choose a name before adding the player.";
        return;
      }
      if (teams.some((team) => team.players.some((playerData) => playerData.name.toLowerCase() === preview.name.toLowerCase()))) {
        if (status) status.textContent = `${preview.name} already exists. Choose a unique player name.`;
        return;
      }

      addButton.disabled = true;
      if (status) {
        status.textContent = `Adding ${preview.name} to ${teamCode}...`;
      }

      try {
        const row = createCustomPlayerRow(teamCode);
        const customRows = loadCustomPlayerRows();
        customRows.push(row);
        saveCustomPlayerRows(customRows);
        addCustomPlayerToRuntime(row);
        if (status) {
          status.textContent = `Added ${preview.name} to ${teamCode}. Saved in this browser.`;
        }
        renderMakePlayerCustomList();
        renderAll();
        renderMakePlayerPreview();
      } catch (error) {
        if (status) {
          status.textContent = `Could not add ${preview.name}. ${error.message}`;
        }
      } finally {
        addButton.disabled = false;
      }
    });
    addButton.dataset.bound = "true";
  }

  const customList = document.getElementById("make-player-custom-list");
  if (customList && customList.dataset.bound !== "true") {
    customList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-delete-custom-player]");
      if (!button) {
        return;
      }
      const customId = button.dataset.deleteCustomPlayer;
      const customRows = loadCustomPlayerRows();
      const row = customRows.find((entry) => entry.customId === customId);
      if (!row) {
        return;
      }
      saveCustomPlayerRows(customRows.filter((entry) => entry.customId !== customId));
      removeCustomPlayerFromRuntime(customId);
      const status = document.getElementById("make-player-status");
      if (status) {
        const normalizedRow = normalizePlayerRow(row);
        status.textContent = `Removed ${normalizedRow.playerName} from ${normalizedRow.teamCode}.`;
      }
      renderMakePlayerCustomList();
      renderAll();
    });
    customList.dataset.bound = "true";
  }

  renderMakePlayerCustomList();
  renderMakePlayerPreview();
}

function renderMakePlayerPreview() {
  document.querySelectorAll("[data-output-for]").forEach((node) => {
    const source = document.getElementById(node.dataset.outputFor);
    if (source) {
      node.textContent = source.value;
    }
  });

  const ratingsContainer = document.getElementById("make-player-ratings");
  if (ratingsContainer) {
    const preview = buildMakePlayerPreviewData();
    const ratings = calculateRatings(preview);
    const archetype = determinePlayerArchetype({ ...preview, ratings });
    ratingsContainer.innerHTML = `
        <article class="top-player-card">
        <div class="player-header">
          <div>
            <p class="eyebrow">PLAYER CARD</p>
            <h3>${preview.name}</h3>
          </div>
          <span class="rating-badge">${ratings.overall}</span>
        </div>
          <p class="player-season-line">${archetype}</p>
          <p class="player-season-line">Fielding ${ratings.fielding} | Leadership ${ratings.leadership}</p>
          <p class="player-season-line">Bat ${ratings.batting} | Bowl ${ratings.bowling} | AR ${ratings.allRound}</p>
          <p class="player-season-line">Clutch ${ratings.clutch} | Intent ${ratings.intent} | Composure ${ratings.composure}</p>
          <p class="player-season-line">Economy ${ratings.econ} | Wicket Taking ${ratings.wkts}</p>
      </article>
    `;
  }
}

function buildMakePlayerPreviewData() {
  const targetIntent = Number(document.getElementById("target-intent").value);
  const targetComposure = Number(document.getElementById("target-composure").value);
  const targetEcon = Number(document.getElementById("target-econ").value);
  const targetWkts = Number(document.getElementById("target-wkts").value);
  const targetFielding = Number(document.getElementById("target-fielding").value);
  const targetLeadership = Number(document.getElementById("leadership").value);
  const inferredSourceRole = inferMakePlayerSourceRole({
    battingStyle: document.getElementById("make-player-style").value,
    bowlingType: document.getElementById("make-player-bowling-type").value,
    bowlingHand: document.getElementById("make-player-bowling-hand").value,
    opener: toBoolean(document.getElementById("make-player-opener").value),
    deathBowl: toBoolean(document.getElementById("make-player-death-bowl").value),
    intent: targetIntent,
    composure: targetComposure,
    econ: targetEcon,
    wkts: targetWkts
  });
  return player(
    document.getElementById("make-player-name").value.trim() || "Custom Prospect",
    inferredSourceRole,
    document.getElementById("make-player-style").value,
    targetIntent,
    targetComposure,
    targetEcon,
    targetWkts,
    document.getElementById("make-player-bowling-type").value,
    document.getElementById("make-player-bowling-hand").value,
    toBoolean(document.getElementById("make-player-opener").value),
    toBoolean(document.getElementById("make-player-death-bowl").value),
    targetFielding,
    targetLeadership
  );
}

function renderMakePlayerCustomList() {
  const container = document.getElementById("make-player-custom-list");
  if (!container) {
    return;
  }
  const customRows = loadCustomPlayerRows();
  if (!customRows.length) {
    container.innerHTML = `
      <div class="scorecard-block">
        <p class="player-season-line">No custom players added yet. New players will appear here after you add them.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="custom-player-list">
      ${customRows.map((row) => {
        const normalizedRow = normalizePlayerRow(row);
        return `
        <article class="custom-player-row">
          <div>
            <strong>${escapeHtml(normalizedRow.playerName)}</strong>
            <p class="player-season-line">${escapeHtml(row.teamCode)} • ${escapeHtml(row.sourceRole)} • ${escapeHtml(row.battingStyle)}</p>
          </div>
          <button class="ghost-btn custom-player-delete" type="button" data-delete-custom-player="${escapeHtml(normalizedRow.customId)}" aria-label="Delete ${escapeHtml(normalizedRow.playerName)}">
            <span aria-hidden="true">🗑</span>
          </button>
        </article>
      `;
      }).join("")}
    </div>
  `;
}

function renderMakePlayerCustomList() {
  const container = document.getElementById("make-player-custom-list");
  if (!container) {
    return;
  }
  const customRows = loadCustomPlayerRows();
  if (!customRows.length) {
    container.innerHTML = `
      <div class="scorecard-block">
        <p class="player-season-line">No custom players added yet. New players will appear here after you add them.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="custom-player-list">
      ${customRows.map((row) => {
        const normalizedRow = normalizePlayerRow(row);
        return `
        <article class="custom-player-row">
          <div>
            <strong>${escapeHtml(normalizedRow.playerName)}</strong>
            <p class="player-season-line">${escapeHtml(normalizedRow.teamCode)} | ${escapeHtml(normalizedRow.sourceRole)} | ${escapeHtml(normalizedRow.battingStyle)}</p>
          </div>
          <button class="ghost-btn custom-player-delete" type="button" data-delete-custom-player="${escapeHtml(normalizedRow.customId)}" aria-label="Delete ${escapeHtml(normalizedRow.playerName)}">
            <span aria-hidden="true">🗑</span>
          </button>
        </article>
      `;
      }).join("")}
    </div>
  `;
}

function inferMakePlayerSourceRole({ battingStyle, bowlingType, bowlingHand, opener, deathBowl, intent, composure, econ, wkts }) {
  const bowlingAverage = (econ + wkts) / 2;
  const battingProxy = composure * 0.55 + intent * 0.45;
  const qualifiesAsBattingAllRounder = battingProxy >= 60;

  if (bowlingType === "spinner") {
    if (bowlingAverage >= 72) return wkts >= econ ? "Wrist Spinner" : "Mystery Spinner";
    if (bowlingAverage >= 52) return intent >= 70 ? "Batting All-Rounder" : "Spin All-Rounder";
  }

  if (bowlingType === "pacer") {
    if (deathBowl && bowlingAverage >= 60) return "Death Pacer";
    if (bowlingHand === "left" && bowlingAverage >= 62) return "Left-Arm Pacer";
    if (bowlingAverage >= 72) return econ >= wkts ? "Swing Pacer" : "Death Pacer";
    if (bowlingAverage >= 62) return "Seam Bowler";
    if (bowlingAverage >= 52) {
      if (!qualifiesAsBattingAllRounder) return "Seam Bowler";
      return intent >= 70 ? "Power All-Rounder" : "Seam All-Rounder";
    }
  }

  if (bowlingAverage >= 72) {
    return econ >= wkts ? "Swing Pacer" : "Death Pacer";
  }
  if (bowlingAverage >= 62) {
    return wkts >= econ ? "Leg Spinner" : "Seam Bowler";
  }
  if (bowlingAverage >= 52) {
    if (intent >= 70) return "Power All-Rounder";
    if (composure >= 70) return "Spin All-Rounder";
    return "Batting All-Rounder";
  }
  if (intent >= 78) return "Finisher";
  if (composure >= 78) return "Anchor Batter";
  if (opener) return "Power Opener";
  if (battingStyle === "LHB" && composure >= 68) return "Top-Order Batter";
  return "Middle-Order Batter";
}

function buildSyntheticPlayerStats({ intentTarget, composureTarget, econTarget, wktsTarget }) {
  const baseStrikeRate = roundToOneDecimal(clamp(78 + intentTarget * 0.96, 95, 176));
  const baseAverage = roundToOneDecimal(clamp(
    11 +
    Math.max(0, composureTarget - 40) * 0.68 -
    Math.max(0, intentTarget - 40) * 0.06 +
    Math.max(0, Math.min(composureTarget, intentTarget) - 60) * 0.14,
    8,
    58
  ));
  const baseRuns = Math.round(clamp(
    Math.max(5, (baseAverage - 8) * 8.5 + Math.max(0, baseStrikeRate - 115) * 2),
    5,
    520
  ));

  const batting = {
    runs: [0.7, 0.88, 1].map((factor) => Math.round(baseRuns * factor)),
    avg: [0.8, 0.92, 1].map((factor) => roundToOneDecimal(baseAverage * factor)),
    sr: [0.92, 0.98, 1.04].map((factor) => roundToOneDecimal(baseStrikeRate * factor))
  };

  const bowlingRating = calculateBowlingRatingFromSkills(econTarget ?? 25, wktsTarget ?? 25);
  const bowling = bowlingRating <= 25
    ? { wkts: [0, 0, 0], eco: [0, 0, 0], avg: [0, 0, 0] }
    : {
        wkts: [0.72, 0.88, 1].map((factor) => Math.round(Math.max(0, (wktsTarget - 20) * 0.42 * factor))),
        eco: [1.08, 1.02, 0.96].map((factor) => roundToOneDecimal(clamp((11.8 - econTarget * 0.05) * factor, 5.4, 12.5))),
        avg: [1.08, 1.02, 0.96].map((factor) => roundToOneDecimal(clamp((36 - bowlingRating * 0.2) * factor, 10, 45)))
      };

  return { batting, bowling };
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

function renderSeasonStatLeaders() {
  const container = document.getElementById("season-stat-leaders");
  if (!container) {
    return;
  }

  const isAllTime = state.seasonStatScope === "allTime";
  const leaderboard = isAllTime
    ? getAllTimeLeaderboardDefinition(state.seasonStat)
    : getSeasonLeaderboardDefinition(state.seasonStat);
  const source = isAllTime ? getAllTimeLeaderboardEntries() : (state.season.playerStats || []);

  if (!source.length) {
    container.innerHTML = `<div class="scorecard-block"><p class="player-season-line">Simulate a season to unlock the top-five batting and bowling tables.</p></div>`;
    return;
  }

  const sorted = [...source]
    .filter((playerData) => leaderboard.eligible(playerData))
    .sort(leaderboard.sort)
    .slice(0, 5);

  if (!sorted.length) {
    container.innerHTML = `<div class="scorecard-block"><p class="player-season-line">No qualifying ${isAllTime ? "all-time" : "season"} performances yet for this stat.</p></div>`;
    return;
  }

  container.innerHTML = sorted.map((playerData, index) => `
    <article class="season-stat-row">
      <div class="season-stat-rank">${index + 1}</div>
      <div class="season-stat-player">
        <strong>${playerData.name}</strong>
        <span>${playerData.teamCode} | ${playerData.role}${isAllTime ? ` | ${playerData.seasonYear}` : ""}</span>
      </div>
      <div class="season-stat-value">
        <strong>${leaderboard.value(playerData)}</strong>
        <span>${leaderboard.secondary(playerData)}</span>
      </div>
    </article>
  `).join("");
}

function getSeasonLeaderboardDefinition(key) {
  const thresholds = getRollingLeaderboardThresholds();
  const definitions = {
    runs: {
      eligible: () => true,
      sort: (a, b) => b.seasonRuns - a.seasonRuns || b.seasonStrikeRate - a.seasonStrikeRate,
      value: (playerData) => `${playerData.seasonRuns} runs`,
      secondary: (playerData) => `Avg ${playerData.seasonBattingAverage.toFixed(1)} | SR ${playerData.seasonStrikeRate.toFixed(1)}`
    },
    wickets: {
      eligible: () => true,
      sort: (a, b) => b.seasonWickets - a.seasonWickets || a.seasonEconomy - b.seasonEconomy,
      value: (playerData) => `${Math.round(playerData.seasonWickets)} wickets`,
      secondary: (playerData) => `Econ ${playerData.seasonEconomy.toFixed(2)} | Avg ${playerData.seasonBowlingAverage.toFixed(1)}`
    },
    highestScore: {
      eligible: (playerData) => playerData.highestScore > 0,
      sort: (a, b) => b.highestScore - a.highestScore || a.highestScoreBalls - b.highestScoreBalls || b.seasonRuns - a.seasonRuns,
      value: (playerData) => `${playerData.highestScore}${playerData.highestScoreNotOut ? "*" : ""}`,
      secondary: (playerData) => `${playerData.highestScoreBalls} balls | SR ${playerData.highestScoreBalls > 0 ? ((playerData.highestScore / playerData.highestScoreBalls) * 100).toFixed(1) : "0.0"}`
    },
    bestBowlingFigures: {
      eligible: (playerData) => playerData.bestBowlingWickets > 0,
      sort: (a, b) => b.bestBowlingWickets - a.bestBowlingWickets || a.bestBowlingEconomy - b.bestBowlingEconomy || a.bestBowlingRuns - b.bestBowlingRuns,
      value: (playerData) => `${playerData.bestBowlingWickets}/${playerData.bestBowlingRuns}`,
      secondary: (playerData) => `${formatOversFromBalls(playerData.bestBowlingOversBalls)} overs | Econ ${playerData.bestBowlingEconomy.toFixed(2)}`
    },
    battingAverage: {
    eligible: (playerData) => playerData.seasonRuns >= thresholds.battingAverageRuns && playerData.seasonDismissals >= thresholds.battingAverageDismissals,
      sort: (a, b) => b.seasonBattingAverage - a.seasonBattingAverage || b.seasonRuns - a.seasonRuns,
      value: (playerData) => playerData.seasonBattingAverage.toFixed(2),
      secondary: (playerData) => `${playerData.seasonRuns} runs | ${playerData.seasonDismissals} dismissals`
    },
    strikeRate: {
      eligible: (playerData) => playerData.seasonRuns >= thresholds.strikeRateRuns && playerData.seasonBallsFaced >= thresholds.strikeRateBalls,
      sort: (a, b) => b.seasonStrikeRate - a.seasonStrikeRate || b.seasonRuns - a.seasonRuns,
      value: (playerData) => playerData.seasonStrikeRate.toFixed(2),
      secondary: (playerData) => `${playerData.seasonRuns} runs | ${playerData.seasonBallsFaced} balls`
    },
    economy: {
      eligible: (playerData) => playerData.seasonOversBalls >= thresholds.economyBalls,
      sort: (a, b) => a.seasonEconomy - b.seasonEconomy || b.seasonWickets - a.seasonWickets,
      value: (playerData) => playerData.seasonEconomy.toFixed(2),
      secondary: (playerData) => `${formatOversFromBalls(playerData.seasonOversBalls)} overs | ${Math.round(playerData.seasonWickets)} wickets`
    },
    bowlingAverage: {
      eligible: (playerData) => playerData.seasonWickets >= thresholds.bowlingAverageWickets,
      sort: (a, b) => a.seasonBowlingAverage - b.seasonBowlingAverage || b.seasonWickets - a.seasonWickets,
      value: (playerData) => playerData.seasonBowlingAverage.toFixed(2),
      secondary: (playerData) => `${Math.round(playerData.seasonWickets)} wickets | Econ ${playerData.seasonEconomy.toFixed(2)}`
    },
    sixes: {
      eligible: (playerData) => playerData.seasonSixes > 0,
      sort: (a, b) => b.seasonSixes - a.seasonSixes || b.seasonRuns - a.seasonRuns,
      value: (playerData) => `${playerData.seasonSixes} sixes`,
      secondary: (playerData) => `${playerData.seasonFours} fours | SR ${playerData.seasonStrikeRate.toFixed(1)}`
    },
    impact: {
      eligible: () => true,
      sort: (a, b) => b.mvpScore - a.mvpScore || b.seasonRuns - a.seasonRuns,
      value: (playerData) => `${playerData.mvpScore} impact`,
      secondary: (playerData) => `${playerData.seasonRuns} runs | ${playerData.seasonWickets} wickets`
    }
  };

  return definitions[key] || definitions.runs;
}

function getAllTimeLeaderboardEntries() {
  const completedSeasons = state.seasonHistory || [];
  const hasRecordedCurrentSeason = completedSeasons.some((entry) => entry.seasonYear === state.seasonYear);
  const currentSeasonEntries = (state.season?.playerStats || []).map((playerData) => ({
    ...playerData,
    seasonYear: state.seasonYear
  }));
  return hasRecordedCurrentSeason ? completedSeasons : [...completedSeasons, ...currentSeasonEntries];
}

function getAllTimeLeaderboardDefinition(key) {
  const definitions = {
    runs: {
      eligible: (playerData) => playerData.seasonRuns > 0,
      sort: (a, b) => b.seasonRuns - a.seasonRuns || b.seasonStrikeRate - a.seasonStrikeRate,
      value: (playerData) => `${playerData.seasonRuns} runs`,
      secondary: (playerData) => `Avg ${playerData.seasonBattingAverage.toFixed(1)} | SR ${playerData.seasonStrikeRate.toFixed(1)}`
    },
    wickets: {
      eligible: (playerData) => playerData.seasonWickets > 0,
      sort: (a, b) => b.seasonWickets - a.seasonWickets || a.seasonEconomy - b.seasonEconomy,
      value: (playerData) => `${Math.round(playerData.seasonWickets)} wickets`,
      secondary: (playerData) => `Econ ${playerData.seasonEconomy.toFixed(2)} | Avg ${playerData.seasonBowlingAverage.toFixed(1)}`
    },
    highestScore: {
      eligible: (playerData) => playerData.highestScore > 0,
      sort: (a, b) => b.highestScore - a.highestScore || a.highestScoreBalls - b.highestScoreBalls || b.seasonRuns - a.seasonRuns,
      value: (playerData) => `${playerData.highestScore}${playerData.highestScoreNotOut ? "*" : ""}`,
      secondary: (playerData) => `${playerData.highestScoreBalls} balls | SR ${playerData.highestScoreBalls > 0 ? ((playerData.highestScore / playerData.highestScoreBalls) * 100).toFixed(1) : "0.0"}`
    },
    bestBowlingFigures: {
      eligible: (playerData) => playerData.bestBowlingWickets > 0,
      sort: (a, b) => b.bestBowlingWickets - a.bestBowlingWickets || a.bestBowlingEconomy - b.bestBowlingEconomy || a.bestBowlingRuns - b.bestBowlingRuns,
      value: (playerData) => `${playerData.bestBowlingWickets}/${playerData.bestBowlingRuns}`,
      secondary: (playerData) => `${formatOversFromBalls(playerData.bestBowlingOversBalls)} overs | Econ ${playerData.bestBowlingEconomy.toFixed(2)}`
    },
    battingAverage: {
      eligible: (playerData) => playerData.seasonRuns >= 200 && playerData.seasonDismissals >= 5,
      sort: (a, b) => b.seasonBattingAverage - a.seasonBattingAverage || b.seasonRuns - a.seasonRuns,
      value: (playerData) => playerData.seasonBattingAverage.toFixed(2),
      secondary: (playerData) => `${playerData.seasonRuns} runs | ${playerData.seasonDismissals} dismissals`
    },
    strikeRate: {
      eligible: (playerData) => playerData.seasonRuns >= 100 && playerData.seasonBallsFaced >= 60,
      sort: (a, b) => b.seasonStrikeRate - a.seasonStrikeRate || b.seasonRuns - a.seasonRuns,
      value: (playerData) => playerData.seasonStrikeRate.toFixed(2),
      secondary: (playerData) => `${playerData.seasonRuns} runs | ${playerData.seasonBallsFaced} balls`
    },
    economy: {
      eligible: (playerData) => playerData.seasonOversBalls >= 60,
      sort: (a, b) => a.seasonEconomy - b.seasonEconomy || b.seasonWickets - a.seasonWickets,
      value: (playerData) => playerData.seasonEconomy.toFixed(2),
      secondary: (playerData) => `${formatOversFromBalls(playerData.seasonOversBalls)} overs | ${Math.round(playerData.seasonWickets)} wickets`
    },
    bowlingAverage: {
      eligible: (playerData) => playerData.seasonWickets >= 8,
      sort: (a, b) => a.seasonBowlingAverage - b.seasonBowlingAverage || b.seasonWickets - a.seasonWickets,
      value: (playerData) => playerData.seasonBowlingAverage.toFixed(2),
      secondary: (playerData) => `${Math.round(playerData.seasonWickets)} wickets | Econ ${playerData.seasonEconomy.toFixed(2)}`
    },
    sixes: {
      eligible: (playerData) => playerData.seasonSixes > 0,
      sort: (a, b) => b.seasonSixes - a.seasonSixes || b.seasonRuns - a.seasonRuns,
      value: (playerData) => `${playerData.seasonSixes} sixes`,
      secondary: (playerData) => `${playerData.seasonFours} fours | SR ${playerData.seasonStrikeRate.toFixed(1)}`
    },
    impact: {
      eligible: (playerData) => playerData.mvpScore > 0,
      sort: (a, b) => b.mvpScore - a.mvpScore || b.seasonRuns - a.seasonRuns,
      value: (playerData) => `${playerData.mvpScore} impact`,
      secondary: (playerData) => `${playerData.seasonRuns} runs | ${playerData.seasonWickets} wickets`
    }
  };

  return definitions[key] || definitions.runs;
}

function getRollingLeaderboardThresholds() {
  const totalWeeks = state.season?.schedule?.length || 18;
  const completedWeeks = clamp(state.season?.currentRound || 0, 0, totalWeeks);
  const progress = totalWeeks > 0 ? Math.max(1 / totalWeeks, completedWeeks / totalWeeks) : 1;
  const scaled = (fullSeasonValue, minimumValue = 1) => Math.max(minimumValue, Math.ceil(fullSeasonValue * progress));

  return {
    battingAverageRuns: scaled(300, 20),
    battingAverageDismissals: scaled(10, 1),
    strikeRateRuns: scaled(150, 15),
    strikeRateBalls: scaled(90, 12),
    economyBalls: scaled(60, 6),
    bowlingAverageWickets: scaled(6, 1)
  };
}

function createSeasonPlayerSnapshot(playerData, teamCode) {
  ensurePlayerRuntimeState(playerData);
  const overallRating = playerData?.ratings?.overall ?? 50;
  const snapshot = {
    ...playerData,
    teamCode,
    matchesPlayed: 0,
    seasonRuns: 0,
    seasonWickets: 0,
    seasonBallsFaced: 0,
    seasonDismissals: 0,
    seasonRunsConceded: 0,
    seasonOversBalls: 0,
    seasonFours: 0,
    seasonSixes: 0,
    seasonCatches: Math.max(0, Math.round((overallRating - 50) / 14)),
    mvpScore: 0,
    impactAppearances: 0,
    highestScore: 0,
    highestScoreBalls: 0,
    highestScoreNotOut: false,
    bestBowlingWickets: 0,
    bestBowlingRuns: 999,
    bestBowlingOversBalls: 0,
    bestBowlingEconomy: 99,
    seasonStrikeRate: 0,
    seasonBattingAverage: 0,
    seasonEconomy: 99,
    seasonBowlingAverage: 999
  };

  hydrateSeasonRateStats(snapshot);
  return snapshot;
}

function createSeasonHistoryEntry(playerData, seasonYear) {
  return {
    ...playerData,
    seasonYear
  };
}

function hydrateSeasonRateStats(playerData) {
  playerData.seasonStrikeRate = playerData.seasonBallsFaced > 0 ? (playerData.seasonRuns / playerData.seasonBallsFaced) * 100 : 0;
  playerData.seasonBattingAverage = playerData.seasonDismissals > 0 ? playerData.seasonRuns / playerData.seasonDismissals : playerData.seasonRuns;
  playerData.seasonEconomy = playerData.seasonOversBalls > 0 ? playerData.seasonRunsConceded / (playerData.seasonOversBalls / 6) : 99;
  playerData.seasonBowlingAverage = playerData.seasonWickets > 0 ? playerData.seasonRunsConceded / playerData.seasonWickets : 999;
}

function resetSeason() {
  return {
    table: teams.map((team) => ({ team, wins: 0, losses: 0, points: 0, netRunRate: 0 })),
    schedule: buildSeasonSchedule(),
    currentRound: 0,
    playoffs: null,
    champion: null,
    featuredMatches: [],
    playerStats: teams.flatMap((team) => team.players.map((playerData) => createSeasonPlayerSnapshot(playerData, team.code))),
    awards: { bestBatter: null, bestBowler: null, mvp: null, impactPlayer: null }
  };
}

function weightedAverage(values, weights, ignoreZeros = false) {
  let total = 0;
  let weightTotal = 0;
  values.forEach((value, index) => {
    if (ignoreZeros && !value) return;
    total += value * weights[index];
    weightTotal += weights[index];
  });
  return weightTotal ? total / weightTotal : 0;
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getLogScaledContribution(value, minInput, maxInput, maxContribution, curveFactor = Math.E - 1) {
  const clampedValue = clamp(value, minInput, maxInput);
  const normalized = (clampedValue - minInput) / Math.max(1, maxInput - minInput);
  return (Math.log1p(normalized * curveFactor) / Math.log1p(curveFactor)) * maxContribution;
}

function getProgressionGainMultiplier(currentRating) {
  if (currentRating >= 95) return 0.14;
  if (currentRating >= 92) return 0.24;
  if (currentRating >= 88) return 0.4;
  if (currentRating >= 82) return 0.68;
  return 1;
}

function getEliteRegressionPenalty(currentRating) {
  if (currentRating >= 96) return 0.55;
  if (currentRating >= 93) return 0.28;
  if (currentRating >= 90) return 0.12;
  return 0;
}

function applyProgressionSoftCap(targetValue, delta, currentRating) {
  if (delta > 0) {
    return clamp(targetValue + delta * getProgressionGainMultiplier(currentRating), 25, 99);
  }
  if (delta < 0) {
    const declineMultiplier = currentRating >= 95 ? 1.07 : currentRating >= 90 ? 1.03 : 1;
    return clamp(targetValue + delta * declineMultiplier, 25, 99);
  }
  return clamp(targetValue, 25, 99);
}

function calculateBowlingRatingFromSkills(econ, wkts) {
  const weightedBase = econ * 0.45 + wkts * 0.55;
  const eliteCurveBonus = Math.max(0, weightedBase - 60) ** 1.5 * 0.0975;
  return clamp(weightedBase + eliteCurveBonus, 25, 99);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getActiveTeams() {
  return state.offseason?.workingTeams?.length ? state.offseason.workingTeams : teams;
}

function findTeam(code) {
  return getActiveTeams().find((team) => team.code === code);
}

function nextTeamCode(current) {
  const activeTeams = getActiveTeams();
  const index = activeTeams.findIndex((team) => team.code === current);
  return activeTeams[(index + 1) % activeTeams.length].code;
}

function buildSeasonSchedule() {
  if (teams.length < 2) {
    return [];
  }

  const regularSeasonRounds = 14;
  const rotation = teams.map((team) => team.code);
  const firstLeg = [];

  for (let roundIndex = 0; roundIndex < rotation.length - 1; roundIndex += 1) {
    const fixtures = [];
    for (let slotIndex = 0; slotIndex < rotation.length / 2; slotIndex += 1) {
      const left = rotation[slotIndex];
      const right = rotation[rotation.length - 1 - slotIndex];
      fixtures.push({
        homeCode: roundIndex % 2 === 0 ? left : right,
        awayCode: roundIndex % 2 === 0 ? right : left,
        played: false,
        result: null
      });
    }
    firstLeg.push(fixtures);
    rotation.splice(1, 0, rotation.pop());
  }

  return [...firstLeg, ...firstLeg.map((fixtures) => fixtures.map((fixture) => ({
    homeCode: fixture.awayCode,
    awayCode: fixture.homeCode,
    played: false,
    result: null
  })))]
    .slice(0, regularSeasonRounds)
    .map((fixtures, index) => ({
    label: `WEEK ${index + 1}`,
    fixtures
  }));
}

function getNextFixtureForTeam(teamCode) {
  const schedule = state.season?.schedule || [];
  for (let roundIndex = state.season?.currentRound || 0; roundIndex < schedule.length; roundIndex += 1) {
    const fixtureIndex = schedule[roundIndex].fixtures.findIndex((fixture) =>
      !fixture.played && (fixture.homeCode === teamCode || fixture.awayCode === teamCode)
    );
    if (fixtureIndex !== -1) {
      return {
        ...schedule[roundIndex].fixtures[fixtureIndex],
        roundIndex,
        label: schedule[roundIndex].label,
        slot: fixtureIndex + 1
      };
    }
  }
  return null;
}

function initializePlayoffs(season = state.season) {
  if (!season || season.playoffs || season.currentRound < season.schedule.length) {
    return season?.playoffs || null;
  }

  const ordered = [...season.table].sort((a, b) => b.points - a.points || b.netRunRate - a.netRunRate);
  season.playoffs = {
    seedOrder: ordered.slice(0, 4).map((entry) => entry.team.code),
    results: {
      qualifier1: null,
      eliminator: null,
      qualifier2: null,
      final: null
    }
  };
  return season.playoffs;
}

function getCurrentPlayoffFixture(season = state.season) {
  const playoffs = initializePlayoffs(season);
  if (!playoffs?.seedOrder?.length) {
    return null;
  }

  if (!playoffs.results.qualifier1) {
    return {
      key: "qualifier1",
      label: "Qualifier 1",
      homeCode: playoffs.seedOrder[0],
      awayCode: playoffs.seedOrder[1]
    };
  }

  if (!playoffs.results.eliminator) {
    return {
      key: "eliminator",
      label: "Eliminator",
      homeCode: playoffs.seedOrder[2],
      awayCode: playoffs.seedOrder[3]
    };
  }

  if (!playoffs.results.qualifier2) {
    const qualifier1Loser = playoffs.results.qualifier1.winner.code === playoffs.seedOrder[0] ? playoffs.seedOrder[1] : playoffs.seedOrder[0];
    return {
      key: "qualifier2",
      label: "Qualifier 2",
      homeCode: qualifier1Loser,
      awayCode: playoffs.results.eliminator.winner.code
    };
  }

  if (!playoffs.results.final) {
    return {
      key: "final",
      label: "Final",
      homeCode: playoffs.results.qualifier1.winner.code,
      awayCode: playoffs.results.qualifier2.winner.code
    };
  }

  return null;
}

function playOrReplayPlayoffFixture(season, key) {
  initializePlayoffs(season);
  if (season.playoffs.results[key]) {
    return season.playoffs.results[key];
  }

  const fixture = getCurrentPlayoffFixture(season);
  if (!fixture || fixture.key !== key) {
    return null;
  }

  const result = resolveKnockoutResult(
    simulateMatch(
      buildLineupTeam(findTeam(fixture.homeCode)),
      buildLineupTeam(findTeam(fixture.awayCode))
    )
  );
  season.playoffs.results[key] = result;
  updatePlayers(season.playerStats, result);
  if (key === "final") {
    season.champion = result.winner;
  }
  return result;
}

function isFranchisePlayoffEligible() {
  const playoffs = initializePlayoffs(state.season);
  return Boolean(playoffs?.seedOrder?.includes(state.franchiseTeam));
}

function getFranchisePlayoffFixture() {
  const fixture = getCurrentPlayoffFixture();
  if (!fixture || !isFranchisePlayoffEligible()) {
    return null;
  }
  if (fixture.homeCode === state.franchiseTeam || fixture.awayCode === state.franchiseTeam) {
    return fixture;
  }
  return null;
}

function syncFeaturedMatchToSeason() {
  const nextFixture = getNextFixtureForTeam(state.franchiseTeam);
  if (!nextFixture) {
    state.homeTeam = state.franchiseTeam;
    return;
  }
  state.homeTeam = nextFixture.homeCode;
  state.awayTeam = nextFixture.awayCode;
  state.opponentTeam = nextFixture.homeCode === state.franchiseTeam ? nextFixture.awayCode : nextFixture.homeCode;
}

function calculateSeasonAwards(playerBook) {
  if (!playerBook?.length || !playerBook.some((playerData) => playerData.matchesPlayed > 0)) {
    return { bestBatter: null, bestBowler: null, mvp: null, impactPlayer: null };
  }

  const seasonAwardImpactBook = buildSeasonAwardImpactBook(playerBook);
  const impactEligibleAwardBook = seasonAwardImpactBook.filter((playerData) =>
    playerData.matchesPlayed > 0 &&
    playerData.impactAppearances / playerData.matchesPlayed >= 0.75
  );

  return {
    bestBatter: [...playerBook].sort((a, b) => b.seasonRuns - a.seasonRuns || b.seasonStrikeRate - a.seasonStrikeRate)[0],
    bestBowler: [...playerBook].sort((a, b) => b.seasonWickets - a.seasonWickets || a.seasonEconomy - b.seasonEconomy)[0],
    mvp: [...seasonAwardImpactBook].sort((a, b) => b.awardMvpScore - a.awardMvpScore || b.mvpScore - a.mvpScore || b.seasonRuns - a.seasonRuns)[0],
    impactPlayer: impactEligibleAwardBook.length
      ? [...impactEligibleAwardBook].sort((a, b) => b.awardMvpScore - a.awardMvpScore || b.mvpScore - a.mvpScore || b.impactAppearances - a.impactAppearances || b.seasonRuns - a.seasonRuns)[0]
      : null
  };
}

function buildSeasonAwardImpactBook(playerBook) {
  const top20RunAverage = getAverageOfTopSeasonValues(playerBook, "seasonRuns", 20);
  const top20WicketAverage = getAverageOfTopSeasonValues(playerBook, "seasonWickets", 20);

  return (playerBook || []).map((playerData) => ({
    ...playerData,
    awardMvpScore: getEndOfSeasonMvpScore(playerData, top20RunAverage, top20WicketAverage)
  }));
}

function getEndOfSeasonMvpScore(playerData, top20RunAverage, top20WicketAverage) {
  const baseImpact = Number(playerData?.mvpScore) || 0;
  const seasonRuns = Number(playerData?.seasonRuns) || 0;
  const seasonWickets = Number(playerData?.seasonWickets) || 0;
  const exceedsRunAverage = top20RunAverage > 0 && seasonRuns > top20RunAverage;
  const exceedsWicketAverage = top20WicketAverage > 0 && seasonWickets > top20WicketAverage;

  if (!exceedsRunAverage && !exceedsWicketAverage) {
    return baseImpact;
  }

  const qualifyingMultipliers = [];
  if (exceedsRunAverage && top20RunAverage > 0) {
    qualifyingMultipliers.push(seasonRuns / top20RunAverage);
  }
  if (exceedsWicketAverage && top20WicketAverage > 0) {
    qualifyingMultipliers.push(seasonWickets / top20WicketAverage);
  }

  if (!qualifyingMultipliers.length) {
    return baseImpact;
  }

  return Math.round(baseImpact * average(qualifyingMultipliers));
}

function renderTickerResultMarkup(result) {
  const homeClass = result.isTie ? "ticker-team is-tie" : result.winner?.code === result.home.code ? "ticker-team is-win" : "ticker-team is-loss";
  const awayClass = result.isTie ? "ticker-team is-tie" : result.winner?.code === result.away.code ? "ticker-team is-win" : "ticker-team is-loss";
  return `<span class="${homeClass}">${escapeHtml(result.home.code)} ${result.homeScore}-${result.homeWkts}</span> <span class="ticker-vs">vs</span> <span class="${awayClass}">${escapeHtml(result.away.code)} ${result.awayScore}-${result.awayWkts}</span>`;
}

function formatMatchMvp(result) {
  const name = result?.mvp || "Unknown";
  const teamCode = result?.mvpBreakdown?.teamCode;
  return teamCode ? `${name} (${teamCode})` : name;
}

function renderUpcomingTickerMarkup(fixture) {
  return `<span class="ticker-team is-upcoming">${escapeHtml(fixture.homeCode)}</span> <span class="ticker-vs">vs</span> <span class="ticker-team is-upcoming">${escapeHtml(fixture.awayCode)}</span>`;
}

function getUpcomingTickerWeek() {
  const schedule = state.season?.schedule || [];
  const currentRound = state.season?.currentRound || 0;
  const week = schedule[currentRound];
  if (!week?.fixtures?.length) {
    return null;
  }

  return {
    label: week.label,
    fixtures: week.fixtures.filter((fixture) => !fixture.played)
  };
}

function getFeaturedRoundResult(roundResults) {
  return roundResults.find((result) => result.home.code === state.franchiseTeam || result.away.code === state.franchiseTeam) || roundResults[0] || null;
}

function renderFeaturedResultMessage(message) {
  document.getElementById("featured-result").innerHTML = `<p>${message}</p>`;
}

function maybeLaunchChampionshipConfetti() {
  const championCode = state.season?.champion?.code;
  if (!championCode || championCode !== state.franchiseTeam || state.lastCelebratedChampion === championCode) {
    return;
  }

  state.lastCelebratedChampion = championCode;
  launchChampionshipConfetti();
}

function maybeLaunchSeasonLossEmojis() {
  const championCode = state.season?.champion?.code;
  if (!championCode || championCode === state.franchiseTeam || state.lastSeasonLossChampion === championCode) {
    return;
  }

  state.lastSeasonLossChampion = championCode;
  launchSeasonLossEmojis();
}

function maybeLaunchTournamentMvpEmojis() {
  const tournamentMvp = state.season?.awards?.mvp;
  if (!state.season?.champion || !tournamentMvp?.teamCode || tournamentMvp.teamCode !== state.franchiseTeam) {
    return false;
  }

  const celebrationKey = `${tournamentMvp.teamCode}::${tournamentMvp.name}`;
  if (state.lastCelebratedTournamentMvp === celebrationKey) {
    return false;
  }

  state.lastCelebratedTournamentMvp = celebrationKey;
  launchFranchiseMvpEmojis();
  return true;
}

function maybeLaunchGameOutcomeSymbols(result) {
  if (!result || result.isTie || !result.winner?.code) {
    return;
  }

  launchGameOutcomeSymbols(result.winner.code === state.franchiseTeam);
}

function launchChampionshipConfetti() {
  const layer = document.getElementById("confetti-layer");
  if (!layer) {
    return;
  }

  const batch = createCelebrationBatch(layer);
  const colors = ["#f5c451", "#5ce1e6", "#81ffb1", "#ff8e8e", "#ecf4ff", "#ffd86f"];
  const pieces = 180;

  for (let index = 0; index < pieces; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.width = `${8 + Math.random() * 8}px`;
    piece.style.height = `${14 + Math.random() * 16}px`;
    piece.style.animationDelay = `${Math.random() * 280}ms`;
    piece.style.setProperty("--duration", `${1900 + Math.random() * 1800}ms`);
    piece.style.setProperty("--drift-x", `${-180 + Math.random() * 360}px`);
    piece.style.setProperty("--spin", `${360 + Math.random() * 1080}deg`);
    batch.appendChild(piece);
  }

  window.setTimeout(() => {
    batch.remove();
  }, 4300);
}

function launchSeasonLossEmojis() {
  const layer = document.getElementById("confetti-layer");
  if (!layer) {
    return;
  }

  const batch = createCelebrationBatch(layer);
  const pieces = 120;
  const symbols = ["❌", "👎"];

  for (let index = 0; index < pieces; index += 1) {
    const symbol = symbols[index % symbols.length];
    const piece = document.createElement("span");
    piece.className = "confetti-piece loss-piece";
    piece.textContent = symbol;
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 320}ms`;
    piece.style.setProperty("--duration", `${2600 + Math.random() * 1800}ms`);
    piece.style.setProperty("--drift-x", `${-140 + Math.random() * 280}px`);
    piece.style.setProperty("--spin", symbol === "👎" ? "0deg" : `${180 + Math.random() * 480}deg`);
    batch.appendChild(piece);
  }

  window.setTimeout(() => {
    batch.remove();
  }, 5200);
}

function launchFranchiseMvpEmojis() {
  const layer = document.getElementById("mvp-layer");
  if (!layer) {
    return;
  }

  const batch = createCelebrationBatch(layer);
  const pieces = 64;
  const symbols = ["🏅", "🏅", "🏅"];

  for (let index = 0; index < pieces; index += 1) {
    const symbol = symbols[index % symbols.length];
    const piece = document.createElement("span");
    piece.className = "confetti-piece mvp-piece";
    piece.textContent = symbol;
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 220}ms`;
    piece.style.setProperty("--duration", `${2200 + Math.random() * 1200}ms`);
    piece.style.setProperty("--drift-x", `${-120 + Math.random() * 240}px`);
    piece.style.setProperty("--spin", symbol === "MVP" ? "0deg" : `${180 + Math.random() * 420}deg`);
    batch.appendChild(piece);
  }

  window.setTimeout(() => {
    batch.remove();
  }, 4200);
}

function launchGameOutcomeSymbols(isWin) {
  launchOutcomeSymbolBurst({
    isWin,
    pieces: 18,
    symbol: isWin ? "\u2705" : "\u274C",
    durationMin: 1800,
    durationRange: 900,
    horizontalInset: 12,
    driftRange: 180,
    delayRange: 160
  });
}

function launchOutcomeSymbolBurst({
  isWin,
  pieces,
  symbol,
  durationMin,
  durationRange,
  horizontalInset,
  driftRange,
  delayRange
}) {
  const layer = document.getElementById("confetti-layer");
  if (!layer) {
    return;
  }

  const batch = createCelebrationBatch(layer);
  const className = isWin ? "confetti-piece game-win-piece" : "confetti-piece game-loss-piece";

  for (let index = 0; index < pieces; index += 1) {
    const piece = document.createElement("span");
    piece.className = className;
    piece.textContent = symbol;
    piece.style.left = `${horizontalInset + Math.random() * (100 - horizontalInset * 2)}%`;
    piece.style.animationDelay = `${Math.random() * delayRange}ms`;
    piece.style.setProperty("--duration", `${durationMin + Math.random() * durationRange}ms`);
    piece.style.setProperty("--drift-x", `${-(driftRange / 2) + Math.random() * driftRange}px`);
    piece.style.setProperty("--spin", "0deg");
    batch.appendChild(piece);
  }

  window.setTimeout(() => {
    batch.remove();
  }, durationMin + durationRange + delayRange + 400);
}

function createCelebrationBatch(layer) {
  const batch = document.createElement("div");
  batch.className = "confetti-batch";
  layer.appendChild(batch);
  return batch;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function normalizeShares(values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return values.map((value) => value / total);
}

function roundDownToOver(balls) {
  return Math.max(6, Math.floor(balls / 6) * 6);
}

function formatOversFromBalls(balls) {
  const overs = Math.floor(balls / 6);
  const remainder = balls % 6;
  return `${overs}.${remainder}`;
}

function oversToBalls(overs) {
  const [whole, part] = String(overs).split(".");
  return Number(whole) * 6 + Number(part || 0);
}

function inferPlayerProfile(playerData) {
  const matchupTypes = ["leftArmPace", "rightArmPace", "hitTheDeck", "leftArmOrthodox", "rightArmOffSpin", "wristSpin"];
  const roleProfile = playerData.roleProfile || inferRoleProfile(playerData);
  const hash = stableHash(`${playerData.name}-${roleProfile.label}-${playerData.battingStyle}`);
  const preferred = [];
  const vulnerable = [];

  if (roleProfile.power || roleProfile.finisher) preferred.push("leftArmPace", "hitTheDeck");
  if (roleProfile.anchor || roleProfile.opener) preferred.push("rightArmPace");
  if (roleProfile.opener) preferred.push(playerData.battingStyle === "LHB" ? "rightArmOffSpin" : "leftArmOrthodox");
  if (roleProfile.battingBand === "middle") preferred.push("wristSpin");

  if (roleProfile.anchor) vulnerable.push("wristSpin");
  if (roleProfile.power) vulnerable.push(playerData.battingStyle === "LHB" ? "leftArmOrthodox" : "rightArmOffSpin");
  if (roleProfile.finisher) vulnerable.push("leftArmPace");
  if (roleProfile.battingBand === "middle" && !roleProfile.power) vulnerable.push("hitTheDeck");

  const rotatedTypes = matchupTypes.map((_, index) => matchupTypes[(index + (hash % matchupTypes.length)) % matchupTypes.length]);
  rotatedTypes.forEach((type) => {
    if (preferred.length < 2 && !preferred.includes(type) && !vulnerable.includes(type)) preferred.push(type);
    if (vulnerable.length < 2 && !vulnerable.includes(type) && !preferred.includes(type)) vulnerable.push(type);
  });

  const bowlingPreferences = inferBowlingPreferences(playerData);

  return {
    strengths: preferred.slice(0, 2),
    weaknesses: vulnerable.slice(0, 2),
    bowlingStrengths: bowlingPreferences.strengths,
    bowlingWeaknesses: bowlingPreferences.weaknesses,
    pitchBias: roleProfile.pitchBias
  };
}

function buildAttackProfile(players) {
  const bowlers = players
    .filter((playerData) => isEligibleBowler(playerData))
    .sort((a, b) => b.ratings.bowling - a.ratings.bowling)
    .slice(0, 6);
  const types = {
    leftArmPace: 0,
    rightArmPace: 0,
    hitTheDeck: 0,
    leftArmOrthodox: 0,
    rightArmOffSpin: 0,
    wristSpin: 0
  };

  bowlers.forEach((playerData, index) => {
    const weight = Math.max(0.15, playerData.ratings.bowling / 100 - index * 0.04);
    getBowlingTypes(playerData).forEach((type) => {
      types[type] += weight / getBowlingTypes(playerData).length;
    });
  });

  const total = Object.values(types).reduce((sum, value) => sum + value, 0) || 1;
  Object.keys(types).forEach((type) => {
    types[type] /= total;
  });

  return types;
}

function getBowlingTypes(playerData) {
  return (playerData.roleProfile || inferRoleProfile(playerData)).bowlingTypes;
}

function determinePlayerArchetype(playerData) {
  return inferRoleProfile(playerData).label;
}

function getBowlingStyleFamily(playerData) {
  return (playerData.roleProfile || inferRoleProfile(playerData)).bowlingFamily;
}

function inferRoleProfile(playerData) {
  const ratings = playerData.ratings || calculateRatings(playerData);
  const battingEdge = ratings.batting - ratings.bowling;
  const bowlingEdge = ratings.bowling - ratings.batting;
  const hasRealBowling = ratings.bowling >= 52 || ratings.econ >= 45 || ratings.wkts >= 45;
  const qualifiesAsAllRounder = ratings.batting > 60 && ratings.bowling > 35;
  const bowlingTypes = inferBowlingTypesFromStats(playerData, ratings, hasRealBowling);
  const bowlingFamily = playerData.bowlingType === "spinner" ? "spin" :
    playerData.bowlingType === "pacer" ? "pace" :
      bowlingTypes.some((type) => type.includes("Spin") || type.includes("Orthodox")) ? "spin" :
        bowlingTypes.length ? "pace" : "none";
  const roleGroup = qualifiesAsAllRounder ? "allRounder" :
    hasRealBowling && ratings.bowling >= 60 && (bowlingEdge >= 6 || ratings.batting <= 55) ? "bowler" :
      "batter";
  const explicitOpener = Boolean(playerData.opener);
  const explicitDeathBowler = Boolean(playerData.deathBowl);
  const opener = explicitOpener;
  const anchor = ratings.composure >= 72 && ratings.intent <= 78;
  const power = ratings.intent >= 69;
  const finisher = ratings.intent >= 76 && ratings.composure <= 72;
  const battingBand = finisher ? "finish" : opener ? "top" : ratings.batting >= 66 ? "middle" : "support";
  const pitchBias = bowlingFamily === "spin" || anchor ? "slow" :
    power || finisher || bowlingTypes.includes("hitTheDeck") ? "flat" : "balanced";

  let label = "Utility Batter";
  if (roleGroup === "bowler") {
    if (bowlingFamily === "spin") {
      label = "Attack Spinner";
    } else {
      label = ratings.econ >= ratings.wkts ? "New-Ball Seamer" : "Pace Enforcer";
    }
  } else if (roleGroup === "allRounder") {
    if (bowlingFamily === "spin" || (ratings.composure >= 72 && ratings.econ >= ratings.wkts)) {
      label = "Control All-Rounder";
    } else if (power && ratings.batting >= 68) {
      label = "Power All-Round Force";
    } else if (bowlingFamily === "pace" && ratings.bowling >= 60) {
      label = "Seam All-Round Engine";
    } else {
      label = "Batting All-Round Link";
    }
  } else if (opener && power && !anchor) {
    label = "Explosive Opener";
  } else if (opener && anchor) {
    label = "Technical Opener";
  } else if (finisher && ratings.batting >= 68) {
    label = "Finishing Closer";
  } else if (anchor && ratings.composure >= 80) {
    label = "Run Bank Anchor";
  } else if (ratings.batting >= 70 && power) {
    label = "Shotmaker";
  } else if (anchor) {
    label = "Run Bank Anchor";
  } else if (power) {
    label = "Boundary Hunter";
  } else {
    label = ratings.batting >= 66 ? "Shotmaker" : "Utility Batter";
  }

  return {
    label,
    roleGroup,
    battingBand,
    opener,
    anchor,
    power,
    finisher,
    deathBowler: explicitDeathBowler || (roleGroup !== "batter" && ratings.wkts >= ratings.econ + 6 && bowlingFamily === "pace"),
    bowlingFamily,
    bowlingTypes,
    pitchBias
  };
}

function inferBowlingTypesFromStats(playerData, ratings, hasRealBowling) {
  if (!hasRealBowling) return [];

  const wicketBias = ratings.wkts - ratings.econ;
  const controlBias = ratings.econ - ratings.wkts;
  const spinLean = ratings.composure + Math.max(0, ratings.econ - 55) * 0.3;
  const paceLean = ratings.intent + Math.max(0, ratings.wkts - 55) * 0.35 + Math.max(0, ratings.bowling - 60) * 0.14;
  const hash = stableHash(`${playerData.name}-${playerData.battingStyle}-${ratings.bowling}-${ratings.econ}-${ratings.wkts}`);
  const bowlingType = playerData.bowlingType || "none";
  const bowlingHand = playerData.bowlingHand || "none";

  if (bowlingType === "spinner") {
    if (wicketBias >= 5) return ["wristSpin"];
    return [bowlingHand === "left" ? "leftArmOrthodox" : "rightArmOffSpin"];
  }

  if (bowlingType === "pacer") {
    if (bowlingHand === "left") return ["leftArmPace"];
    if (wicketBias >= 7) return ["hitTheDeck", "rightArmPace"];
    return ["rightArmPace"];
  }

  if (ratings.bowling >= 68 && wicketBias >= 8) {
    return ["hitTheDeck", "rightArmPace"];
  }

  if (spinLean >= paceLean + 10) {
    if (wicketBias >= 6) return ["wristSpin"];
    return [hash % 2 === 0 ? "leftArmOrthodox" : "rightArmOffSpin"];
  }

  if (paceLean >= spinLean + 8) {
    if (wicketBias >= 8) return ["hitTheDeck", "rightArmPace"];
    if (controlBias >= 6 && hash % 3 === 0) return ["leftArmPace"];
    return ["rightArmPace"];
  }

  if (controlBias >= 7 && ratings.composure >= 58) {
    return hash % 2 === 0 ? ["leftArmOrthodox"] : ["rightArmOffSpin"];
  }

  if (wicketBias >= 7) {
    return hash % 2 === 0 ? ["hitTheDeck", "rightArmPace"] : ["wristSpin"];
  }

  if (bowlingHand === "left") return ["leftArmPace"];
  return hash % 2 === 0 ? ["rightArmPace"] : ["rightArmOffSpin"];
}

function getPitchProfile(homeTeam) {
  const profiles = {
    CSK: { label: "Slow Turn", scoringBoost: -8, wicketPressure: 0.6, chaseBias: -0.08, volatility: 0.32, boosts: ["leftArmOrthodox", "wristSpin"] },
    MI: { label: "Flat with Dew", scoringBoost: 14, wicketPressure: -0.45, chaseBias: 0.35, volatility: 0.62, boosts: ["leftArmPace", "rightArmPace"] },
    RCB: { label: "Small Ground Launchpad", scoringBoost: 16, wicketPressure: -0.3, chaseBias: 0.18, volatility: 0.68, boosts: ["hitTheDeck"] },
    KKR: { label: "Grip Then Skid", scoringBoost: 2, wicketPressure: 0.18, chaseBias: 0.05, volatility: 0.46, boosts: ["wristSpin", "rightArmPace"] },
    SRH: { label: "True Batting Strip", scoringBoost: 18, wicketPressure: -0.52, chaseBias: 0.28, volatility: 0.7, boosts: ["rightArmPace"] },
    RR: { label: "Balanced Surface", scoringBoost: 4, wicketPressure: 0.04, chaseBias: 0.1, volatility: 0.42, boosts: ["leftArmPace", "wristSpin"] },
    GT: { label: "Two-Paced Surface", scoringBoost: -1, wicketPressure: 0.16, chaseBias: -0.02, volatility: 0.38, boosts: ["hitTheDeck", "leftArmOrthodox"] },
    DC: { label: "Pace Early, Better Later", scoringBoost: 3, wicketPressure: 0.15, chaseBias: 0.14, volatility: 0.44, boosts: ["rightArmPace", "hitTheDeck"] },
    LSG: { label: "Slow and Grippy", scoringBoost: -10, wicketPressure: 0.72, chaseBias: -0.1, volatility: 0.34, boosts: ["leftArmOrthodox", "rightArmOffSpin"] },
    PBKS: { label: "Dewy Hitting Surface", scoringBoost: 12, wicketPressure: -0.2, chaseBias: 0.26, volatility: 0.6, boosts: ["leftArmPace"] }
  };
  return profiles[homeTeam.code] || { label: "Balanced", scoringBoost: 0, wicketPressure: 0, chaseBias: 0.1, volatility: 0.45, boosts: [] };
}

function getBattingConditionsModifier(playerData, attackProfile, pitch, index) {
  let modifier = 1;
  playerData.profile.strengths.forEach((type) => {
    modifier += (attackProfile[type] || 0) * 0.28;
  });
  playerData.profile.weaknesses.forEach((type) => {
    modifier -= (attackProfile[type] || 0) * 0.3;
  });
  if (pitch.boosts.some((type) => playerData.profile.strengths.includes(type))) modifier += 0.08;
  if (pitch.boosts.some((type) => playerData.profile.weaknesses.includes(type))) modifier -= 0.08;
  if (playerData.profile.pitchBias === "flat" && pitch.scoringBoost > 8) modifier += 0.05;
  if (playerData.profile.pitchBias === "slow" && pitch.wicketPressure > 0.3) modifier += 0.05;
  if (index >= 5 && (playerData.roleProfile?.finisher || inferRoleProfile(playerData).finisher)) modifier += 0.06;
  if (index < 2 && (playerData.roleProfile?.opener || inferRoleProfile(playerData).opener) && attackProfile.leftArmPace > 0.28 && playerData.profile.weaknesses.includes("leftArmPace")) modifier -= 0.07;
  return clamp(modifier, 0.7, 1.32);
}

function getDismissalRisk(playerData, attackProfile, pitch, index) {
  let risk = 0.18;
  playerData.profile.weaknesses.forEach((type) => {
    risk += (attackProfile[type] || 0) * 0.24;
  });
  playerData.profile.strengths.forEach((type) => {
    risk -= (attackProfile[type] || 0) * 0.14;
  });
  if (playerData.ratings.composure < 70) {
    risk += 0.06 + Math.max(0, 70 - playerData.ratings.composure) * 0.0085;
  }
  if (playerData.ratings.composure < 62) {
    risk += 0.04;
  }
  if (playerData.ratings.composure < 55) {
    risk += 0.05;
  }
  if (pitch.wicketPressure > 0.4 && playerData.profile.pitchBias === "flat") risk += 0.05;
  if (index < 3 && attackProfile.hitTheDeck > 0.22) risk += 0.03;
  return clamp(risk, 0.06, 0.72);
}

function getBowlingConditionsModifier(playerData, pitch, battingComposition) {
  const bowlingTypes = getBowlingTypes(playerData);
  let modifier = 1;
  bowlingTypes.forEach((type) => {
    if (pitch.boosts.includes(type)) modifier += 0.12;
  });
  (playerData.profile?.bowlingStrengths || []).forEach((type) => {
    modifier += (battingComposition[type] || 0) * 0.18;
  });
  (playerData.profile?.bowlingWeaknesses || []).forEach((type) => {
    modifier -= (battingComposition[type] || 0) * 0.16;
  });
  if ((playerData.roleProfile?.deathBowler || inferRoleProfile(playerData).deathBowler) && pitch.scoringBoost > 10) modifier += 0.04;
  return clamp(modifier, 0.84, 1.26);
}

function allocateBowlingBalls(totalBalls, bowlerCount, weights) {
  const allocations = new Array(bowlerCount).fill(0);
  let remainingBalls = totalBalls;
  for (let index = 0; index < bowlerCount; index += 1) {
    const remainingBowlers = bowlerCount - index;
    const minForThis = Math.max(0, remainingBalls - (remainingBowlers - 1) * 24);
    const maxForThis = Math.min(24, remainingBalls - (remainingBowlers - 1) * 6);
    if (remainingBowlers === 1) {
      allocations[index] = remainingBalls;
      break;
    }
    const rawBalls = roundDownToOver(Math.round(totalBalls * (weights[index] || 0)));
    const boundedBalls = clamp(rawBalls, Math.max(6, minForThis), Math.max(6, maxForThis));
    allocations[index] = Math.min(24, boundedBalls);
    remainingBalls -= allocations[index];
  }
  return allocations;
}

function allocateDeathOversBalls(bowlingCore, bowlingSpellBalls, oversBalls) {
  const deathBallsTotal = Math.min(24, oversBalls);
  const allocations = new Array(bowlingCore.length).fill(0);
  let remainingDeathBalls = deathBallsTotal;

  const priorities = bowlingCore.map((playerData, index) => ({
    index,
    available: bowlingSpellBalls[index],
    priority:
      ((playerData.roleProfile?.deathBowler || inferRoleProfile(playerData).deathBowler) ? 2.2 : 1) *
      (playerData.ratings.bowling / 100)
  })).sort((a, b) => b.priority - a.priority);

  priorities.forEach((entry) => {
    if (remainingDeathBalls <= 0) return;
    const maxAssignable = Math.min(entry.available, 12);
    const desired = entry.priority > 1.5 ? 12 : 6;
    const assigned = Math.min(maxAssignable, desired, remainingDeathBalls);
    allocations[entry.index] = assigned;
    remainingDeathBalls -= assigned;
  });

  if (remainingDeathBalls > 0) {
    priorities.forEach((entry) => {
      if (remainingDeathBalls <= 0) return;
      const extraCapacity = Math.max(0, Math.min(entry.available, 24) - allocations[entry.index]);
      if (!extraCapacity) return;
      const extra = Math.min(extraCapacity, remainingDeathBalls);
      allocations[entry.index] += extra;
      remainingDeathBalls -= extra;
    });
  }

  return allocations;
}

function getDeathBowlingFactor(playerData, deathShare) {
  const isDeathBowler = playerData.roleProfile?.deathBowler || inferRoleProfile(playerData).deathBowler;
  if (deathShare <= 0) {
    return { economyBoost: 1, wicketBoost: 1 };
  }

  if (isDeathBowler) {
    return {
      economyBoost: 1 + deathShare * 0.16,
      wicketBoost: 1 + deathShare * 0.14
    };
  }

  return {
    economyBoost: Math.max(0.88, 1 - deathShare * 0.08),
    wicketBoost: Math.max(0.94, 1 - deathShare * 0.04)
  };
}

function stableHash(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function inferBowlingPreferences(playerData) {
  const bowlingTypes = getBowlingTypes(playerData);
  const strengths = [];
  const weaknesses = [];

  if (bowlingTypes.includes("leftArmPace")) {
    strengths.push("rightHanders", "anchors");
    weaknesses.push("leftHanders", "finishers");
  }
  if (bowlingTypes.includes("rightArmPace")) {
    strengths.push("leftHanders", "anchors");
    weaknesses.push("rightHanders", "finishers");
  }
  if (bowlingTypes.includes("hitTheDeck")) {
    strengths.push("powerBatters", "finishers");
    weaknesses.push("anchors", "leftHanders");
  }
  if (bowlingTypes.includes("leftArmOrthodox")) {
    strengths.push("rightHanders", "anchors");
    weaknesses.push("leftHanders", "finishers");
  }
  if (bowlingTypes.includes("rightArmOffSpin")) {
    strengths.push("leftHanders", "powerBatters");
    weaknesses.push("rightHanders", "finishers");
  }
  if (bowlingTypes.includes("wristSpin")) {
    strengths.push("anchors", "rightHanders");
    weaknesses.push("leftHanders", "finishers");
  }

  return {
    strengths: [...new Set(strengths)].slice(0, 2),
    weaknesses: [...new Set(weaknesses)].slice(0, 2)
  };
}

function buildBattingComposition(players) {
  const activePlayers = players.slice(0, 7);
  const total = activePlayers.length || 1;
  return {
    leftHanders: activePlayers.filter((playerData) => playerData.battingStyle === "LHB").length / total,
    rightHanders: activePlayers.filter((playerData) => playerData.battingStyle === "RHB").length / total,
    powerBatters: activePlayers.filter((playerData) => playerData.roleProfile?.power || inferRoleProfile(playerData).power).length / total,
    anchors: activePlayers.filter((playerData) => playerData.roleProfile?.anchor || inferRoleProfile(playerData).anchor).length / total,
    finishers: activePlayers.filter((playerData) => playerData.roleProfile?.finisher || inferRoleProfile(playerData).finisher).length / total
  };
}

function pickNotOutIndices(entries, battingModifiers, notOutCount, wicketsLost) {
  const lastIndex = entries.length - 1;

  if (wicketsLost < 10) {
    if (notOutCount === 1) return [lastIndex];
    const partnerPool = entries.slice(0, -1).map((entry, index) => ({
      index,
      score:
        index * 7 +
        Math.max(0, 18 - entry.balls) * 0.85 +
        Math.max(0, 22 - entry.runs) * 0.45 +
        (battingModifiers[index] || 1) * 6 +
        (index >= Math.max(0, entries.length - 4) ? 12 : 0) +
        randomBetween(-2, 4)
    }));
    const partner = partnerPool.sort((a, b) => b.score - a.score)[0];
    return partner ? [partner.index, lastIndex] : [lastIndex];
  }

  const allOutPool = entries.map((entry, index) => ({
    index,
    score:
      entry.runs * 0.45 +
      entry.balls * 0.1 +
      (battingModifiers[index] || 1) * 10 +
      (index >= Math.max(0, entries.length - 2) ? 10 : 0) +
      (index >= Math.max(0, entries.length - 3) ? 4 : 0) +
      randomBetween(-2, 3)
  }));
  return [allOutPool.sort((a, b) => b.score - a.score)[0].index];
}

function calculateIntent(playerData, weightedSr, weightedRuns) {
  let value =
    48 +
    Math.max(0, weightedSr - 120) * 0.34 +
    Math.max(0, weightedRuns - 180) * 0.025;
  return clamp(value, 45, 96);
}

function calculateComposure(playerData, weightedAvg, battingSample, weightedWkts) {
  let value =
    46 +
    weightedAvg * 0.42 +
    Math.max(0, battingSample - 650) * 0.01;
  return clamp(value, 42, 94);
}

function estimatePhaseBalls(index, didBatCount, oversBalls) {
  const openerShare = index < 2 ? 0.29 : index < 4 ? 0.22 : 0.15;
  return Math.round(oversBalls * openerShare * Math.max(0.5, (didBatCount - index) / didBatCount));
}

function formatMatchupTypes(types) {
  const labels = {
    leftArmPace: "left-arm pace",
    rightArmPace: "right-arm pace",
    hitTheDeck: "hit-the-deck pace",
    leftArmOrthodox: "left-arm orthodox",
    rightArmOffSpin: "right-arm off-spin",
    wristSpin: "wrist spin"
  };
  return types.map((type) => labels[type] || type).join(", ");
}

function formatBatterTypes(types) {
  const labels = {
    leftHanders: "left-hand batters",
    rightHanders: "right-hand batters",
    powerBatters: "power batters",
    anchors: "anchors",
    finishers: "finishers"
  };
  return types.map((type) => labels[type] || type).join(", ");
}

function randomInt(min, max) {
  if (max < min) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isBatterRole(role) {
  return role.includes("Opener") || role.includes("Anchor") || role.includes("Shotmaker") || role.includes("Engine") ||
    role.includes("Hunter") || role.includes("Closer") || role.includes("Batter");
}

function isBowlerRole(role) {
  return role.includes("Seamer") || role.includes("Spinner") || role.includes("Enforcer") || role.includes("Bowler");
}

function isAllRounder(playerData) {
  return (playerData.roleProfile || inferRoleProfile(playerData)).roleGroup === "allRounder";
}

function isBowler(playerData) {
  return (playerData.roleProfile || inferRoleProfile(playerData)).roleGroup === "bowler";
}

function toBoolean(value) {
  return value === true || value === "true" || value === "TRUE" || value === "1" || value === 1;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


