function lancerProgrammeBloc3() {
    const blocListe = document.getElementById("SousBloc3A");
    const blocCourbe = document.getElementById("SousBloc3B");
    if (!blocListe || !blocCourbe) return;

    // Catégories depuis charges variables (Bloc 1)
    let categories = JSON.parse(localStorage.getItem("chargesVariables") || "[]")
        .map(c => c.nom);

    // Dépenses (avec fallback pour générer un ID si manquant)
    let depenses = JSON.parse(localStorage.getItem("depenses") || "[]")
        .map(d => ({ ...d, id: d.id || crypto.randomUUID() }));

    // 🔹 Sauvegarde locale
    function saveDepenses() {
        localStorage.setItem("depenses", JSON.stringify(depenses));
    }
    // 🔹 Refresh
    function rafraichirApresDepense() {
    lancerProgrammeBloc1();
    lancerProgrammeBloc3(); // recharge A + B
    if (typeof lancerProgrammeBloc4 === "function") {
        lancerProgrammeBloc4();
        lancerProgrammeBloc4A();
    }
}

    // ============================
    // 🔹 Affichage sous-bloc A
    // ============================
    blocListe.innerHTML = `
        <h3>Dépenses</h3>
        <button id="btnAddDepense" style="margin-bottom:10px;">Ajouter dépense</button>
        <div id="formDepense" style="display:none; margin-bottom:15px;">
            <input type="date" id="depDate">
            <input type="text" id="depLabel" placeholder="Libellé">
            <select id="depCategorie">
                ${categories.map(c => `<option value="${c}">${c}</option>`).join("")}
            </select>
            <input type="number" id="depMontant" placeholder="Montant €" step="0.01">
            <button id="btnSaveDepense">Enregistrer</button>
        </div>

        <div id="listeDepenses" style="max-height:300px; overflow-y:auto; padding-right:5px;"></div>
    `;

    document.getElementById("depDate").value = new Date().toISOString().split("T")[0];

    document.getElementById("btnAddDepense").onclick = () => {
        const f = document.getElementById("formDepense");
        f.style.display = f.style.display === "none" ? "block" : "none";
    };

    // ============================
    // 🔹 Ajouter dépense
    // ============================
    document.getElementById("btnSaveDepense").onclick = () => {
        const d = {
            id: crypto.randomUUID(),
            date: document.getElementById("depDate").value,
            label: document.getElementById("depLabel").value.trim(),
            categorie: document.getElementById("depCategorie").value,
            montant: Number(document.getElementById("depMontant").value)
        };

        if (!d.label || !d.montant) {
            alert("Libellé + montant obligatoires");
            return;
        }

        depenses.push(d);
        saveDepenses();
    recalculerEngagesSelonDepenses();
    sauvegarder();
    rafraichirApresDepense();
        document.getElementById("formDepense").style.display = "none";
    };

    // ============================
    // 🔹 Afficher liste
    // ============================
    function afficherDepenses() {
        const zone = document.getElementById("listeDepenses");

        if (depenses.length === 0) {
            zone.innerHTML = "<i>Aucune dépense</i>";
            return;
        }

        zone.innerHTML = "";

        depenses.forEach(d => {
            const ligne = document.createElement("div");
            ligne.className = "ligne-charge";
            ligne.dataset.id = d.id;

            ligne.innerHTML = `
                <span class="nom">${d.date} — ${d.label} (${d.categorie})</span>
                <span class="montant">${d.montant.toFixed(2)} €</span>
                <button class="btn-modifier">✎</button>
                <button class="btn-supprimer">✖</button>
            `;

            // 🔥 SUPPRESSION PAR ID (fiable)
            ligne.querySelector(".btn-supprimer").onclick = () => {
                const id = ligne.dataset.id;
                depenses = depenses.filter(x => x.id !== id);
                saveDepenses();
                recalculerEngagesSelonDepenses();
                sauvegarder();
                rafraichirApresDepense();
            };

            // 🔥 MODIFICATION
            ligne.querySelector(".btn-modifier").onclick = () => {
                const spanMontant = ligne.querySelector(".montant");

                spanMontant.innerHTML = `
                    <input type="number" value="${d.montant}" class="edit-montant">
                    <button class="btn-valider">OK</button>
                `;

                const input = spanMontant.querySelector(".edit-montant");
                const btnValider = spanMontant.querySelector(".btn-valider");

                btnValider.onclick = () => {
                    const newVal = Number(input.value);
                    if (isNaN(newVal) || newVal < 0) return;
                    d.montant = newVal;
                    saveDepenses();
                    recalculerEngagesSelonDepenses();
                    sauvegarder();
                    rafraichirApresDepense();
                };
            };

            zone.appendChild(ligne);
        });
    }

    afficherDepenses();

    // ============================
// 🔹 Bloc 3B : Courbe avancée
// ============================

// Ajout sélecteur de mois (non destructif)
if (!document.getElementById("selectMoisDepenses")) {
    const select = document.createElement("input");
    select.type = "month";
    select.id = "selectMoisDepenses";
    select.style.marginBottom = "10px";
    blocCourbe.prepend(select);
}

// ============================
// 🔹 Mois sélectionné
// ============================
const inputMois = document.getElementById("selectMoisDepenses");
const now = new Date();

if (!inputMois.value) {
    inputMois.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const [year, month] = inputMois.value.split("-").map(Number);
const nbJours = new Date(year, month, 0).getDate();

// ============================
// 🔹 Données de départ
// ============================
// Revenus fixes
let revenusFixes = 0;
const revsFixesLS = JSON.parse(localStorage.getItem("revsFixes") || "[]");

revsFixesLS.forEach(r => {
    revenusFixes += Number(r.montant || 0);
});

// Charges fixes
let chargesFixes = 0;
const chargesFixesLS = JSON.parse(localStorage.getItem("chargesFixes") || "[]");

chargesFixesLS.forEach(c => {
    chargesFixes += Number(c.montant || 0);
});

// Solde de départ du mois
const soldeInitial = revenusFixes - chargesFixes;

// ============================
// 🔹 Dépenses par jour (mois sélectionné)
// ============================
let depensesParJour = {};

depenses.forEach(d => {
    if (!d.date.startsWith(inputMois.value)) return;

    if (!depensesParJour[d.date]) depensesParJour[d.date] = 0;
    depensesParJour[d.date] += Number(d.montant);
});

// ============================
// 🔹 Construction des courbes
// ============================
let labels = [];
let soldeReel = [];
let budgetIdeal = [];
let ligneZero = [];

let solde = soldeInitial;
let alerteNegative = false;


for (let jour = 1; jour <= nbJours; jour++) {

    // Date du jour (YYYY-MM-DD)
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;

    // Dépenses réelles du jour
    const depenseDuJour = depensesParJour[dateStr] || 0;
    solde -= depenseDuJour;

    if (solde < 0) alerteNegative = true;

    // Budget idéal : droite soldeInitial -> 0
    const ratio = (jour - 1) / (nbJours - 1); // 0 → 1
    const soldeIdeal = soldeInitial * (1 - ratio);

    // Remplissage des tableaux
    labels.push(jour);
    soldeReel.push(solde);
    budgetIdeal.push(soldeIdeal);
    ligneZero.push(0);
}

// ============================
// 🔹 Alerte visuelle
// ============================
blocCourbe.style.border = alerteNegative
    ? "2px solid red"
    : "";

// ============================
// 🔹 Tracé Chart.js
// ============================
const ctx = document.getElementById("courbeDepenses");

if (window.courbeDepensesChart) {
    window.courbeDepensesChart.destroy();
}

window.courbeDepensesChart = new Chart(ctx, {
    type: "line",
    data: {
        labels,
        datasets: [
            {
                label: "Solde réel (€)",
                data: soldeReel,
                tension: 0.3
            },
            {
                label: "Budget idéal",
                data: budgetIdeal,
                borderDash: [6, 6],
                tension: 0
            },
            {
                label: "Zéro",
                data: ligneZero,
                borderWidth: 1,
                pointRadius: 0
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRaio: false,
        plugins: {
            legend: { display: true }
        },
        scales: {
            y: {
                beginAtZero: false
            }
        }
    }
});

// ============================
// 🔹 Recalcul au changement de mois
// ============================
inputMois.onchange = () => lancerProgrammeBloc3();


}
window.lancerProgrammeBloc3 = lancerProgrammeBloc3;
