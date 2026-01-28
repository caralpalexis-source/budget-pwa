// Fonction utilitaire pour formater à 2 décimales
window.format2 = function (n) {
    return Number(n).toFixed(2);
};

// ⚠️ Vérification de l'équilibre financier global
window.verifierEquilibreFinancier = function () {

    // 👉 Totaux prévisionnels du Bloc 1
    const totalFixes = window.getTotalFixes ? window.getTotalFixes() : 0;
    const totalVariables = window.getTotalVariables ? window.getTotalVariables() : 0;
    const totalChargesPrevisionnelles = totalFixes + totalVariables;

    // 👉 Totaux engagés (si présents)
    const totalFixesEng = window.getTotalFixesEngage ? window.getTotalFixesEngage() : 0;
    const totalVarEng = window.getTotalVariablesEngage ? window.getTotalVariablesEngage() : 0;
    const totalChargesEngagees = totalFixesEng + totalVarEng;

    // 👉 Totaux prévisionnels du Bloc 2
    const totalRFixes = window.getTotalRFixes ? window.getTotalRFixes() : 0;
    const totalRVariables = window.getTotalRVariables ? window.getTotalRVariables() : 0;
    const totalRevenusPrevisionnels = totalRFixes + totalRVariables;

    // 👉 Totaux Perçus (si présents)
    const totalRFixesPercus = window.getTotalRFixesPercus ? window.getTotalRFixesPercus() : 0;
    const totalRVariablesPercus = window.getTotalRVariablesPercus ? window.getTotalRVariablesPercus() : 0;
    const totalRevenusPercus = totalRFixesPercus + totalRVariablesPercus;

  
    
    // 👉 Zone d’avertissement
    const warningDiv = document.getElementById("warningBloc1");
    if (!warningDiv) return; // sécurité

    let message = "";

    // ⚠️ 1) Vérification prévisionnel (principal warning)
    if (totalChargesPrevisionnelles > totalRevenusPrevisionnels) {
        message += `⚠️ Vos charges prévisionnelles (${format2(totalChargesPrevisionnelles)} €) `
                + `dépassent vos revenus (${format2(totalRevenusPrevisionnels)} €).`;
    }

    // ⚠️ 2) Vérification engagé (second niveau de warning)
    if (totalChargesEngagees > totalRevenusPercus) {
        if (message !== "") message += "\n";
        message += `⚠️ Vos charges engagées (${format2(totalChargesEngagees)} €) `
                + `dépassent vos revenus (${format2(totalRevenusPercus)} €).`;
    }

    // 👉 Affichage / masquage
    if (message !== "") {
        warningDiv.style.display = "block";
        warningDiv.textContent = message;
    } else {
        warningDiv.style.display = "none";
        warningDiv.textContent = "";
    }
};
