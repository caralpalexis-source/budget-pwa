function lancerProgrammeBloc2() {

    const blocRFixes = document.getElementById("SousBloc3");
    const blocRVariables = document.getElementById("SousBloc4");

    if (!blocRFixes || !blocRVariables) return;

    // ================
    // 🔹 LocalStorage
    // ================
    let revsFixes = JSON.parse(localStorage.getItem("revsFixes") || "[]");
    let revsVariables = JSON.parse(localStorage.getItem("revsVariables") || "[]");

    function sauvegarder() {
        localStorage.setItem("revsFixes", JSON.stringify(revsFixes));
        localStorage.setItem("revsVariables", JSON.stringify(revsVariables));
    }

    // ========================
    // 🔹 Calcul des totaux
    // ========================
    function calculTotalsRFixes() {
        const total = revsFixes.reduce((sum, c) => sum + c.montant, 0);
        const percus = revsFixes
            .filter(c => c.percus)
            .reduce((sum, c) => sum + c.montant, 0);
        const reste = total - percus;

        return { total, percus, reste };
    }

    function calculTotalsRVariables() {
        const total = revsVariables.reduce((sum, c) => sum + c.montant, 0);
        const percus = revsVariables.reduce((sum, c) => sum + Number(c.percus || 0), 0);
        const reste = total - percus;

        return { total, percus, reste };
    }

    // ========================
    // 🔹 Affichage Fixes
    // ========================
    function afficherRFixes() {
        const totals = calculTotalsRFixes();
        blocRFixes.innerHTML = `
            <h2>Fixes</h2>
            <h3>( Prévisionnel ${format2(totals.total)} € ) <br></h3>
            <span class="totaux">
                ${format2(totals.percus)} € perçus /
                ${format2(totals.reste)} € restants à percevoir
            </span>
        `;

        const container = document.createElement("div");

        revsFixes.forEach(item => {

            // --- ID unique si manquant ---
            if (!item.id) item.id = crypto.randomUUID();

            const ligne = document.createElement("div");
            ligne.className = "ligne-charge";
            ligne.dataset.id = item.id;

            ligne.innerHTML = `
                <span>${item.nom}</span>
                <span>${item.montant} €</span>
                <input type="checkbox" class="check-percus" ${item.percus ? "checked" : ""}>
                <button class="btn-supprimer">✖</button>
            `;

            // --- PERCUS ---
            ligne.querySelector(".check-percus").addEventListener("change", e => {
                item.percus = e.target.checked;
                sauvegarder();
                mettreAJour();
            });

            // --- SUPPRIMER (par ID, pas par index) ---
            ligne.querySelector(".btn-supprimer").addEventListener("click", () => {
                const id = ligne.dataset.id;
                revsFixes = revsFixes.filter(c => c.id !== id);
                sauvegarder();
                mettreAJour();
            });

            container.appendChild(ligne);
        });

        // === Ajout nouvelle ligne ===
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

            if (!nom || montant <= 0) return;

            revsFixes.push({ id: crypto.randomUUID(), nom, montant, percus: false });
            sauvegarder();
            mettreAJour();
        });

        blocRFixes.appendChild(container);
        blocRFixes.appendChild(form);
    }

    // ========================
    // 🔹 Affichage Variables
    // ========================
    function afficherRVariables() {
        const totals = calculTotalsRVariables();

        blocRVariables.innerHTML = `
            <h2>Variables</h2>
            <h3>( Attendues ${format2(totals.total)} € ) <br></h3>
            <span class="totaux">
                ${format2(totals.percus)} € perçus /
                ${format2(totals.reste)} € à percevoir
            </span>
        `;

        const container = document.createElement("div");

        revsVariables.forEach(item => {

            // --- ID unique ---
            if (!item.id) item.id = crypto.randomUUID();

            const ligne = document.createElement("div");
            ligne.className = "ligne-charge";
            ligne.dataset.id = item.id;

            ligne.innerHTML = `
                <span>${item.nom}</span>
                <span>${item.montant} €</span>
                <input type="number" class="input-percus" value="${item.percus || 0}" min="0">
                <button class="btn-supprimer">✖</button>
            `;

            ligne.querySelector(".input-percus").addEventListener("input", e => {
                item.percus = Number(e.target.value);
                sauvegarder();
                mettreAJour();
            });

            ligne.querySelector(".btn-supprimer").addEventListener("click", () => {
                const id = ligne.dataset.id;
                revsVariables = revsVariables.filter(c => c.id !== id);
                sauvegarder();
                mettreAJour();
            });

            container.appendChild(ligne);
        });

        // === Ajout nouvelle ligne ===
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

            if (!nom || montant <= 0) return;

            revsVariables.push({ id: crypto.randomUUID(), nom, montant, percus: 0 });
            sauvegarder();
            mettreAJour();
        });

        blocRVariables.appendChild(container);
        blocRVariables.appendChild(form);
    }

    // ========================
    // 🔹 Mise à jour globale
    // ========================
    function mettreAJour() {
        afficherRFixes();
        afficherRVariables();
        verifierEquilibreFinancier();
    }

    mettreAJour();


    // ========================
    // 🔹 Export des fonctions pour les autres blocs
    // ========================
    window.getTotalRFixes = function () {
        return calculTotalsRFixes().total;
    };

    window.getTotalRFixesPercus = function () {
        return calculTotalsRFixes().percus;
    };

    window.getRFixesReste = function () {
        return calculTotalsRFixes().reste;
    };

    window.getTotalRVariables = function () {
        return calculTotalsRVariables().total;
    };

    window.getTotalRVariablesPercus = function () {
        return calculTotalsRVariables().percus;
    };

    window.getRVariablesReste = function () {
        return calculTotalsRVariables().reste;
    };
}

/* ============================================================
   🔹 Fonctions globales
   ============================================================ */

window.lancerProgrammeBloc2 = lancerProgrammeBloc2;
