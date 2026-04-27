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
    let bloc5Epargne = JSON.parse(localStorage.getItem("bloc5Epargne") || "{}");

    localStorage.setItem("chargesFixes", JSON.stringify(chargesFixes));
    localStorage.setItem("chargesVariables", JSON.stringify(chargesVariables));
    localStorage.setItem("revsFixes", JSON.stringify(revsFixes));
    localStorage.setItem("revsVariables", JSON.stringify(revsVariables));
    localStorage.setItem("bloc5Epargne", JSON.stringify(bloc5Epargne));
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

    const wb = XLSX.utils.book_new();

    // =========================
    // Onglet Totaux existants
    // =========================
    const bloc4 = JSON.parse(localStorage.getItem("totalParLigne") || "{}");
    const bloc5Old = JSON.parse(localStorage.getItem("totauxParLigne") || "{}");

    const lignesTotaux = [];

    for (const ligne in bloc4) {
        lignesTotaux.push({
            Source: "Bloc4",
            Semaine: ligne,
            Produit: "Heures",
            Valeur: bloc4[ligne].heures || 0
        });

        lignesTotaux.push({
            Source: "Bloc4",
            Semaine: ligne,
            Produit: "NB",
            Valeur: bloc4[ligne].nb || 0
        });
    }

    for (const ligne in bloc5Old) {
        lignesTotaux.push({
            Source: "Ancien Bloc5",
            Semaine: ligne,
            Produit: "Objectif",
            Valeur: bloc5Old[ligne].objectif || 0
        });

        lignesTotaux.push({
            Source: "Ancien Bloc5",
            Semaine: ligne,
            Produit: "Réalisé",
            Valeur: bloc5Old[ligne].realise || 0
        });
    }

    const wsTotaux = XLSX.utils.json_to_sheet(lignesTotaux);
    XLSX.utils.book_append_sheet(wb, wsTotaux, "Totaux");

    // =========================
    // Onglet Épargne Bloc5
    // =========================
    const epargne = JSON.parse(localStorage.getItem("bloc5Epargne") || "{}");

    const getVal = (id) => Number(epargne[id] || 0);

    const lignesEpargne = [
        {
            Type: "Total",
            Categorie: "EPARGNE",
            CumulInjection: getVal("epargneTotalCumulInjection"),
            MoisPrecedent: getVal("epargneTotalMoisPrecedent"),
            ObjectifMois: getVal("epargneTotalObjMois")
        },
        {
            Type: "Catégorie",
            Categorie: "PEA",
            CumulInjection: getVal("peaCumulInjection"),
            MoisPrecedent: getVal("peaMoisPrecedent"),
            ObjectifMois: getVal("peaObjMois")
        },
        {
            Type: "Catégorie",
            Categorie: "Saisonnier",
            CumulInjection: getVal("saisonnierCumulInjection"),
            MoisPrecedent: getVal("saisonnierMoisPrecedent"),
            ObjectifMois: getVal("saisonnierObjMois")
        },
        {
            Type: "Catégorie",
            Categorie: "Matelas",
            CumulInjection: getVal("matelasCumulInjection"),
            MoisPrecedent: getVal("matelasMoisPrecedent"),
            ObjectifMois: getVal("matelasObjMois")
        },
        {
            Type: "Catégorie",
            Categorie: "Projets",
            CumulInjection: getVal("projetsCumulInjection"),
            MoisPrecedent: getVal("projetsMoisPrecedent"),
            ObjectifMois: getVal("projetsObjMois")
        }
    ];

    const wsEpargne = XLSX.utils.json_to_sheet(lignesEpargne);
    XLSX.utils.book_append_sheet(wb, wsEpargne, "Epargne");

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
    // Bloc 5 Épargne
    // On garde les cumuls injection
    // On remet les répartitions mensuelles à 0
    // =========================
    let bloc5Epargne = JSON.parse(localStorage.getItem("bloc5Epargne") || "{}");

    bloc5Epargne.epargneTotalMoisPrecedent = 0;
    bloc5Epargne.epargneTotalObjMois = 0;

    bloc5Epargne.peaMoisPrecedent = 0;
    bloc5Epargne.saisonnierMoisPrecedent = 0;
    bloc5Epargne.matelasMoisPrecedent = 0;
    bloc5Epargne.projetsMoisPrecedent = 0;

    bloc5Epargne.peaObjMois = 0;
    bloc5Epargne.saisonnierObjMois = 0;
    bloc5Epargne.matelasObjMois = 0;
    bloc5Epargne.projetsObjMois = 0;

    localStorage.setItem("bloc5Epargne", JSON.stringify(bloc5Epargne));

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

