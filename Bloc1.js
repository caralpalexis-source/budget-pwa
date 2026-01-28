function lancerProgrammeBloc1() {

    const blocFixes = document.getElementById("SousBloc1");
    const blocVariables = document.getElementById("SousBloc2");

    if (!blocFixes || !blocVariables) return;

    // ================
    // 🔹 LocalStorage
    // ================
    let chargesFixes = JSON.parse(localStorage.getItem("chargesFixes") || "[]");
    let chargesVariables = JSON.parse(localStorage.getItem("chargesVariables") || "[]");

    // Ajoute un ID unique aux lignes existantes si elles n’en ont pas
    chargesFixes.forEach(c => { if (!c.id) c.id = crypto.randomUUID(); });
    chargesVariables.forEach(c => { if (!c.id) c.id = crypto.randomUUID(); });

    sauvegarder(); // sécurise au cas où

    // ========================
    // 🔹 Sauvegarde
    // ========================
    function sauvegarder() {
        localStorage.setItem("chargesFixes", JSON.stringify(chargesFixes));
        localStorage.setItem("chargesVariables", JSON.stringify(chargesVariables));
    }

    // ========================
    // 🔹 Mise à jour globale
    // ========================
    function mettreAJour() {
        afficherFixes();
        afficherVariables();
        verifierEquilibreFinancier();
    }

    // ========================
    // 🔹 Calculs
    // ========================
    function calculTotalsFixes() {
        const total = chargesFixes.reduce((sum, c) => sum + c.montant, 0);
        const engage = chargesFixes
            .filter(c => c.engage)
            .reduce((sum, c) => sum + c.montant, 0);

        return { total, engage, reste: total - engage };
    }

    function calculTotalsVariables() {
        const total = chargesVariables.reduce((sum, c) => sum + c.montant, 0);
        const engage = chargesVariables.reduce((sum, c) => sum + Number(c.engage || 0), 0);

        return { total, engage, reste: total - engage };
    }

    // ========================
    // 🔹 Affichage Fixes
    // ========================
    function afficherFixes() {
        const totals = calculTotalsFixes();
        blocFixes.innerHTML = `
            <h2>Fixes</h2>
            <h3>( Prévisionnel ${format2(totals.total)} € )</h3>
            <span class="totaux">
                ${format2(totals.engage)} € engagés / ${format2(totals.reste)} € restants
            </span>
        `;

        const container = document.createElement("div");

        chargesFixes.forEach(item => {
            const ligne = document.createElement("div");
            ligne.className = "ligne-charge";
            ligne.dataset.id = item.id;

            ligne.innerHTML = `
                <span class="nom">${item.nom}</span>
                <span class="montant">${item.montant} €</span>
                <input type="checkbox" class="check-engage" ${item.engage ? "checked" : ""}>
                <button class="btn-modifier">✎</button>
                <button class="btn-supprimer">✖</button>
            `;

            const spanMontant = ligne.querySelector(".montant");

            // --- ENGAGER ---
            ligne.querySelector(".check-engage").addEventListener("change", e => {
                item.engage = e.target.checked;
                sauvegarder();
                mettreAJour();
            });

            // --- SUPPRIMER (par ID) ---
            ligne.querySelector(".btn-supprimer").addEventListener("click", () => {
                chargesFixes = chargesFixes.filter(c => c.id !== item.id);
                sauvegarder();
                mettreAJour();
            });

            // --- MODIFIER ---
            ligne.querySelector(".btn-modifier").addEventListener("click", () => {
                spanMontant.innerHTML = `
                    <input type="number" class="edit-montant" value="${item.montant}">
                    <button class="btn-valider">OK</button>
                `;

                const input = spanMontant.querySelector(".edit-montant");
                const btnValider = spanMontant.querySelector(".btn-valider");

                btnValider.addEventListener("click", () => {
                    const newMontant = Number(input.value);
                    if (newMontant >= 0) {
                        item.montant = newMontant;
                        sauvegarder();
                        mettreAJour();
                    } else {
                        alert("Montant invalide");
                    }
                });
            });

            container.appendChild(ligne);
        });

        // Ajout nouvelle ligne
        const form = document.createElement("div");
        form.className = "form-ajout";
        form.innerHTML = `
            <input type="text" class="nom" placeholder="Nom">
            <input type="number" class="montant" placeholder="Montant">
            <button>Ajouter</button>
        `;

        form.querySelector("button").addEventListener("click", () => {
            const nom = form.querySelector(".nom").value.trim();
            const montant = Number(form.querySelector(".montant").value);

            if (!nom || montant < 0) return;

            chargesFixes.push({
                id: crypto.randomUUID(),
                nom,
                montant,
                engage: false
            });

            sauvegarder();
            mettreAJour();
        });

        blocFixes.appendChild(container);
        blocFixes.appendChild(form);
    }

    // ========================
    // 🔹 Affichage Variables
    // ========================
    function afficherVariables() {
        const totals = calculTotalsVariables();

        blocVariables.innerHTML = `
            <h2>Variables</h2>
            <h3>( Prévisionnel ${format2(totals.total)} € )</h3> 
            <span class="totaux">
                ${format2(totals.engage)} € engagés / ${format2(totals.reste)} € restants
            </span>
        `;

        const container = document.createElement("div");

        chargesVariables.forEach(item => {
            const ligne = document.createElement("div");
            ligne.className = "ligne-charge";
            ligne.dataset.id = item.id;

            ligne.innerHTML = `
                <span class="nom">${item.nom}</span>
                <span class="montant">${item.montant} €</span>
                <input type="number" class="input-engage" value="${item.engage || 0}" min="0">
                <button class="btn-modifier">✎</button>
                <button class="btn-supprimer">✖</button>
            `;

            const spanMontant = ligne.querySelector(".montant");

            // --- ENGAGER ---
            ligne.querySelector(".input-engage").addEventListener("input", e => {
                item.engage = Number(e.target.value);
                sauvegarder();
                mettreAJour();
            });

            // --- SUPPRIMER (par ID) ---
            ligne.querySelector(".btn-supprimer").addEventListener("click", () => {
                chargesVariables = chargesVariables.filter(c => c.id !== item.id);
                sauvegarder();
                mettreAJour();
            });

            // --- MODIFIER ---
            ligne.querySelector(".btn-modifier").addEventListener("click", () => {
                spanMontant.innerHTML = `
                    <input type="number" class="edit-montant" value="${item.montant}">
                    <button class="btn-valider">OK</button>
                `;

                const input = spanMontant.querySelector(".edit-montant");
                const btnValider = spanMontant.querySelector(".btn-valider");

                btnValider.addEventListener("click", () => {
                    const newMontant = Number(input.value);
                    if (!isNaN(newMontant) && newMontant >= 0) {
                        item.montant = newMontant;
                        sauvegarder();
                        mettreAJour();
                    } else {
                        alert("Montant invalide");
                    }
                });
            });

            container.appendChild(ligne);
        });

        // Ajout nouvelle variable
        const form = document.createElement("div");
        form.className = "form-ajout";

        form.innerHTML = `
            <input type="text" class="nom" placeholder="Nom">
            <input type="number" class="montant" placeholder="Montant">
            <button>Ajouter</button>
        `;

        form.querySelector("button").addEventListener("click", () => {
            const nom = form.querySelector(".nom").value.trim();
            const montant = Number(form.querySelector(".montant").value);
            if (!nom || montant < 0) return;

            chargesVariables.push({
                id: crypto.randomUUID(),
                nom,
                montant,
                engage: 0
            });

            sauvegarder();
            mettreAJour();
        });

        blocVariables.appendChild(container);
        blocVariables.appendChild(form);
    }

    mettreAJour();

    // ========================
// 🔹 Export des fonctions pour les autres blocs
// ========================
window.getTotalFixes = function () {
    return calculTotalsFixes().total;
};

window.getTotalFixesEngage = function () {
    return calculTotalsFixes().engage;
};

window.getFixeReste = function () {
    return calculTotalsFixes().reste;
};

window.getTotalVariables = function () {
    return calculTotalsVariables().total;
};

window.getTotalVariablesEngage = function () {
    return calculTotalsVariables().engage;
};

window.getVariableReste = function () {
    return calculTotalsVariables().reste;
};

// Pour Bloc 4
window.getFixeEngage = function () {
    return calculTotalsFixes().engage;
};

window.getVariableEngage = function () {
    return calculTotalsVariables().engage;
};

// 🔹 Pour le Pie Chart Bloc 4A
window.getRepartitionVariablesEngagees = function () {
    return chargesVariables
        .filter(c => Number(c.engage) > 0)
        .map(c => ({
            nom: c.nom,
            montant: Number(c.engage)
        }));
};
}

