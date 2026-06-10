// ============================================================
//  Bloc 5 — Épargne (refonte simplifiée)
//  Modèle :
//    savings = {
//      total: number,
//      supports: { pea, saisonnier, matelas, projets },
//      history: [ { id, date, amount, support } ]
//    }
//  - Bouton unique "Épargner" → parcours en 4 étapes (montant, support,
//    confirmation, sauvegarde).
//  - Reset fin de mois conserve les cumuls (total + supports).
// ============================================================

const BLOC5_STORAGE_KEY = "bloc5Savings";
const BLOC5_LEGACY_KEY  = "bloc5Epargne";

const BLOC5_SUPPORTS = [
    { key: "pea",        label: "PEA",        emoji: "📈" },
    { key: "saisonnier", label: "Saisonnier", emoji: "🌴" },
    { key: "matelas",    label: "Matelas",    emoji: "🛟" },
    { key: "projets",    label: "Projets",    emoji: "🚀" }
];

// ---------- Persistance ----------
function bloc5DefaultState() {
    return {
        total: 0,
        supports: { pea: 0, saisonnier: 0, matelas: 0, projets: 0 },
        history: []
    };
}

function bloc5LoadState() {
    try {
        const raw = localStorage.getItem(BLOC5_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return bloc5NormalizeState(parsed);
        }
    } catch (e) {
        console.warn("[Bloc5] state illisible, reset :", e);
    }
    // Migration depuis l'ancien modèle si présent
    const migrated = bloc5MigrateFromLegacy();
    if (migrated) {
        bloc5SaveState(migrated);
        return migrated;
    }
    return bloc5DefaultState();
}

function bloc5NormalizeState(s) {
    const base = bloc5DefaultState();
    if (!s || typeof s !== "object") return base;
    const supports = { ...base.supports };
    if (s.supports && typeof s.supports === "object") {
        for (const k of Object.keys(supports)) {
            const v = Number(s.supports[k]);
            supports[k] = Number.isFinite(v) ? v : 0;
        }
    }
    const total = Number.isFinite(Number(s.total))
        ? Number(s.total)
        : supports.pea + supports.saisonnier + supports.matelas + supports.projets;
    const history = Array.isArray(s.history) ? s.history.filter(h =>
        h && typeof h === "object" &&
        Number.isFinite(Number(h.amount)) &&
        BLOC5_SUPPORTS.some(sup => sup.key === h.support)
    ) : [];
    return { total, supports, history };
}

function bloc5MigrateFromLegacy() {
    try {
        const raw = localStorage.getItem(BLOC5_LEGACY_KEY);
        if (!raw) return null;
        const old = JSON.parse(raw);
        if (!old || typeof old !== "object") return null;
        const num = (id) => {
            const v = parseFloat(old[id]);
            return Number.isFinite(v) ? v : 0;
        };
        const supports = {
            pea:        num("peaCumulInjection"),
            saisonnier: num("saisonnierCumulInjection"),
            matelas:    num("matelasCumulInjection"),
            projets:    num("projetsCumulInjection")
        };
        const total = supports.pea + supports.saisonnier + supports.matelas + supports.projets;
        if (total === 0) return null;
        console.info("[Bloc5] migration depuis bloc5Epargne :", supports);
        return { total, supports, history: [] };
    } catch (e) {
        console.warn("[Bloc5] migration impossible :", e);
        return null;
    }
}

function bloc5SaveState(state) {
    localStorage.setItem(BLOC5_STORAGE_KEY, JSON.stringify(state));
    // Compat export XLS : on alimente l'ancienne clé avec les cumuls par support.
    try {
        const legacy = {
            epargneTotalCumulInjection: state.total,
            epargneTotalMoisPrecedent: 0,
            epargneTotalObjMois: 0,
            peaCumulInjection:        state.supports.pea,
            peaMoisPrecedent: 0, peaObjMois: 0,
            saisonnierCumulInjection: state.supports.saisonnier,
            saisonnierMoisPrecedent: 0, saisonnierObjMois: 0,
            matelasCumulInjection:    state.supports.matelas,
            matelasMoisPrecedent: 0, matelasObjMois: 0,
            projetsCumulInjection:    state.supports.projets,
            projetsMoisPrecedent: 0, projetsObjMois: 0
        };
        localStorage.setItem(BLOC5_LEGACY_KEY, JSON.stringify(legacy));
    } catch (e) { /* noop */ }
}

// ---------- Format ----------
function bloc5FormatEuro(n) {
    const v = Number(n) || 0;
    return v.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " €";
}

function bloc5Uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
}

// ---------- Rendu ----------
function bloc5Render() {
    const root = document.getElementById("Bloc5");
    if (!root) return;
    const state = bloc5LoadState();

    const img = root.querySelector("img.image-fixe");
    const imgHtml = img ? img.outerHTML : "";

    const supportsHtml = BLOC5_SUPPORTS.map(s => `
        <div class="sous-bloc sous-bloc-epargne" data-epargne-categorie="${s.key}">
            <h3>${s.emoji} ${s.label}</h3>
            <div class="ligne-epargne">
                <label>Cumul</label>
                <input type="number" value="${state.supports[s.key]}" readonly>
            </div>
        </div>
    `).join("");

    root.innerHTML = `
        ${imgHtml}
        <h2>Épargne</h2>

        <div class="sous-blocs-ligne">
            <div class="sous-bloc bloc-epargne-total">
                <h3>EPARGNE</h3>
                <div class="ligne-epargne">
                    <label>Total épargné</label>
                    <input id="epargneTotalCumulInjection" type="number" value="${state.total}" readonly>
                </div>
                <div style="margin-top:12px;">
                    <button type="button" id="btnEpargner" class="btn-utils"
                        style="background:#2e7d32;color:#fff;font-weight:bold;
                               padding:10px 20px;border-radius:8px;border:none;
                               cursor:pointer;font-size:1rem;">
                        💰 Épargner
                    </button>
                </div>
            </div>
        </div>

        <div class="sous-blocs-ligne">
            ${supportsHtml}
        </div>
    `;

    const btn = document.getElementById("btnEpargner");
    if (btn) btn.addEventListener("click", bloc5StartFlow);
}

// ---------- Parcours "Épargner" en 4 étapes ----------
function bloc5StartFlow() {
    // 1) Montant
    const raw = window.prompt("Montant à épargner (€) :", "");
    if (raw === null) return; // annulé
    const trimmed = String(raw).replace(",", ".").trim();
    const amount = Number(trimmed);
    if (!trimmed || !Number.isFinite(amount) || amount <= 0) {
        window.alert("❌ Montant invalide. Saisis un nombre strictement positif.");
        return;
    }

    // 2) Support
    const menu = BLOC5_SUPPORTS.map((s, i) => `${i + 1}. ${s.emoji} ${s.label}`).join("\n");
    const choiceRaw = window.prompt(
        `Sur quel support épargner ?\n\n${menu}\n\nTape 1, 2, 3 ou 4 :`,
        "1"
    );
    if (choiceRaw === null) return;
    const idx = parseInt(String(choiceRaw).trim(), 10) - 1;
    if (!Number.isInteger(idx) || idx < 0 || idx >= BLOC5_SUPPORTS.length) {
        window.alert("❌ Choix invalide.");
        return;
    }
    const support = BLOC5_SUPPORTS[idx];

    // 3) Confirmation
    const ok = window.confirm(
        `Confirmer l'épargne de ${bloc5FormatEuro(amount)} vers ${support.label} ${support.emoji} ?`
    );
    if (!ok) return;

    // 4) Validation
    bloc5AddSaving(amount, support.key);
    window.alert(`✅ ${bloc5FormatEuro(amount)} ajoutés à ${support.label} ${support.emoji}.`);
}

function bloc5AddSaving(amount, supportKey) {
    const state = bloc5LoadState();
    state.supports[supportKey] = (Number(state.supports[supportKey]) || 0) + amount;
    state.total = (Number(state.total) || 0) + amount;
    state.history.push({
        id: bloc5Uuid(),
        date: new Date().toISOString(),
        amount: amount,
        support: supportKey
    });
    bloc5SaveState(state);
    bloc5Render();
}

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", bloc5Render);

// Appelé par utils.js après reset fin de mois et au boot global.
// On se contente de re-rendre depuis l'état stocké ; les cumuls sont préservés.
function lancerProgrammeBloc5() {
    bloc5Render();
}
window.lancerProgrammeBloc5 = lancerProgrammeBloc5;

