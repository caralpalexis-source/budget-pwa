function recalculerEngagesSelonDepenses() {

    // Toujours REcharger depuis localStorage
    let chargesVariables = JSON.parse(localStorage.getItem("chargesVariables") || "[]");
    let depenses = JSON.parse(localStorage.getItem("depenses") || "[]");

    // Sécurité : si liste vide, rien à faire
    if (!Array.isArray(chargesVariables)) return;

    chargesVariables.forEach(item => {
        const totalCat = depenses
            .filter(d => d.categorie === item.nom)
            .reduce((sum, d) => sum + Number(d.montant), 0);

        item.engage = totalCat;
    });

    localStorage.setItem("chargesVariables", JSON.stringify(chargesVariables));
}

// Sauvegarde centralisée (ici on recharge tout avant de sauver)
function sauvegarder() {
    let chargesFixes = JSON.parse(localStorage.getItem("chargesFixes") || "[]");
    let chargesVariables = JSON.parse(localStorage.getItem("chargesVariables") || "[]");
    let revsFixes = JSON.parse(localStorage.getItem("revsFixes") || "[]");
    let revsVariables = JSON.parse(localStorage.getItem("revsVariables") || "[]");

    localStorage.setItem("chargesFixes", JSON.stringify(chargesFixes));
    localStorage.setItem("chargesVariables", JSON.stringify(chargesVariables));
    localStorage.setItem("revsFixes", JSON.stringify(revsFixes));
    localStorage.setItem("revsVariables", JSON.stringify(revsVariables));
}

function exporterDonnees() {
    const choix = prompt("Exporter en JSON ou XLS ? (tapez json ou xls)").toLowerCase();
    if (!choix) return;

    if (choix === "json") {
        exporterJSON();
    } else if (choix === "xls") {
        exporterXLS();
    } else {
        alert("Choix invalide.");
    }
}

function exporterJSON() {
    const data = { ...localStorage };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "donnees_budget.json";
    a.click();
}

function exporterXLS() {
    if (typeof XLSX === "undefined") {
        alert("La librairie XLSX n’est pas chargée.");
        return;
    }

    // Récupération des totaux block 4 et block 5
    const bloc4 = JSON.parse(localStorage.getItem("totalParLigne") || "{}");
    const bloc5 = JSON.parse(localStorage.getItem("totauxParLigne") || "{}");

    const lignes = [];

    for (const ligne in bloc4) {
        lignes.push({
            Semaine: ligne,
            Produit: "Heures",
            Valeur: bloc4[ligne].heures || 0
        });
        lignes.push({
            Semaine: ligne,
            Produit: "NB",
            Valeur: bloc4[ligne].nb || 0
        });
    }

    for (const ligne in bloc5) {
        lignes.push({
            Semaine: ligne,
            Produit: "Objectif",
            Valeur: bloc5[ligne].objectif || 0
        });
        lignes.push({
            Semaine: ligne,
            Produit: "Réalisé",
            Valeur: bloc5[ligne].realise || 0
        });
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(lignes);
    XLSX.utils.book_append_sheet(wb, ws, "Totaux");
    XLSX.writeFile(wb, "export_budget.xlsx");
}

function importerDonnees(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            // On écrase tout le localStorage actuel
            localStorage.clear();
            for (const key in data) {
                localStorage.setItem(key, data[key]);
            }

            alert("Import terminé !");
            location.reload(); // 🔄 refresh général
        } catch (err) {
            alert("Erreur: fichier JSON invalide.");
        }
    };

    reader.readAsText(file);
}

function resetFinDeMois() {
    if (!confirm("⚠️ Avant de confirmer la remise à zéro de fin de mois, avez-vous pensé à archiver vos données ? (bouton 'Exporter')")) return;
    // =========================
    // Charges fixes
    // =========================
    let chargesFixes = JSON.parse(localStorage.getItem("chargesFixes") || "[]");
    chargesFixes.forEach(c => c.engage = false);
    localStorage.setItem("chargesFixes", JSON.stringify(chargesFixes));

    // =========================
    // Charges variables
    // =========================
    let chargesVariables = JSON.parse(localStorage.getItem("chargesVariables") || "[]");
    chargesVariables.forEach(c => c.engage = 0);
    localStorage.setItem("chargesVariables", JSON.stringify(chargesVariables));

    // =========================
    // Revenus prévisionnels
    // =========================
    let revsFixes = JSON.parse(localStorage.getItem("revsFixes") || "[]");
    revsFixes.forEach(r => r.engage = false);
    localStorage.setItem("revsFixes", JSON.stringify(revsFixes));

    // =========================
    // Revenus variables → purge
    // =========================
    localStorage.removeItem("revsVariables");

    // =========================
    // Dépenses → purge
    // =========================
    localStorage.removeItem("depenses");

    // =========================
    // Rafraîchissement UI
    // =========================
    if (typeof lancerProgrammeBloc2 === "function") lancerProgrammeBloc2();
    if (typeof lancerProgrammeBloc3 === "function") lancerProgrammeBloc3();
    if (typeof lancerProgrammeBloc4 === "function") lancerProgrammeBloc4();
    if (typeof lancerProgrammeBloc5 === "function") lancerProgrammeBloc5();

    console.log("🔄 Reset fin de mois effectué");
}


window.recalculerEngagesSelonDepenses = recalculerEngagesSelonDepenses;
window.sauvegarder = sauvegarder;

