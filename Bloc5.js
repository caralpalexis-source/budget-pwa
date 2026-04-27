const STORAGE_KEY = "bloc5Epargne";

document.addEventListener("DOMContentLoaded", () => {
    chargerBloc5();
    binderEventsBloc5();
    recalculerCumulInjection();
    verifierCoherenceBloc5();
    mettreAJourDetailLivretA(); 
});

function chargerBloc5() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!data) return;

    for (let id in data) {
        const el = document.getElementById(id);
        if (el) el.value = data[id];
    }
}

function mettreAJourDetailLivretA() {
    const saisonnier = getNombreBloc5("saisonnierCumulInjection");
    const matelas = getNombreBloc5("matelasCumulInjection");
    const projets = getNombreBloc5("projetsCumulInjection");

    const totalLivretA = saisonnier + matelas + projets;

    const el = document.getElementById("detailLivretA");
    if (!el) return;

    el.innerText = `dont ${totalLivretA}€ / Livret A`;
}

function sauvegarderBloc5() {
    const inputs = document.querySelectorAll("#Bloc5 input");

    let data = {};
    inputs.forEach(input => {
        data[input.id] = input.value;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function binderEventsBloc5() {
    const inputs = document.querySelectorAll("#Bloc5 input");

    inputs.forEach(input => {
        input.addEventListener("input", () => {
            recalculerCumulInjection();
            verifierCoherenceBloc5();
            sauvegarderBloc5();
        });
    });
}

function recalculerCumulInjection() {
    const ids = [
        "peaCumulInjection",
        "saisonnierCumulInjection",
        "matelasCumulInjection",
        "projetsCumulInjection"
    ];

    let total = 0;

    ids.forEach(id => {
        total += getNombreBloc5(id);
    });

    document.getElementById("epargneTotalCumulInjection").value = total;
    mettreAJourDetailLivretA();
}

function verifierCoherenceBloc5() {
    const erreurs = [];

    const totalMoisPrecedent = getNombreBloc5("epargneTotalMoisPrecedent");
    const sommeMoisPrecedent =
        getNombreBloc5("peaMoisPrecedent") +
        getNombreBloc5("saisonnierMoisPrecedent") +
        getNombreBloc5("matelasMoisPrecedent") +
        getNombreBloc5("projetsMoisPrecedent");

    if (sommeMoisPrecedent !== totalMoisPrecedent) {
        erreurs.push(`Mois précédent : répartition ${sommeMoisPrecedent} ≠ total ${totalMoisPrecedent}`);
    }

    const totalObjMois = getNombreBloc5("epargneTotalObjMois");
    const sommeObjMois =
        getNombreBloc5("peaObjMois") +
        getNombreBloc5("saisonnierObjMois") +
        getNombreBloc5("matelasObjMois") +
        getNombreBloc5("projetsObjMois");

    if (sommeObjMois !== totalObjMois) {
        erreurs.push(`Obj/mois : répartition ${sommeObjMois} ≠ total ${totalObjMois}`);
    }

    afficherWarningBloc5(erreurs);
}

function getNombreBloc5(id) {
    const el = document.getElementById(id);
    if (!el) return 0;

    return parseFloat(el.value) || 0;
}

function afficherWarningBloc5(erreurs) {
    const box = document.getElementById("warningBloc5");
    if (!box) return;

    if (erreurs.length === 0) {
        box.style.display = "none";
        box.innerHTML = "";
        return;
    }

    box.style.display = "block";
    box.innerHTML = `
        ⚠️ Les montants Épargne ne sont pas cohérents :<br>
        ${erreurs.map(e => `• ${e}`).join("<br>")}
    `;
}

function lancerProgrammeBloc5() {
    chargerBloc5();
    recalculerCumulInjection();
    verifierCoherenceBloc5();
}

window.lancerProgrammeBloc5 = lancerProgrammeBloc5;