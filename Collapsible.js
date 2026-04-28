document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        rendreBlocsRepliables();
    }, 300);
});

function rendreBlocsRepliables() {
    const blocs = document.querySelectorAll(".bloc-kpi");

    blocs.forEach(bloc => {
        if (!bloc.id) return;
        if (bloc.querySelector(".btn-toggle-bloc")) return;

        const titre = bloc.querySelector("h2");
        if (!titre) return;

        const btn = document.createElement("button");
        btn.className = "btn-toggle-bloc";
        btn.type = "button";

        const etatSauvegarde = localStorage.getItem(`etat_${bloc.id}`);
        const blocsRepliesParDefaut = ["Bloc4A", "Bloc4B", "Bloc5"];

        if (etatSauvegarde === "replie") {
            bloc.classList.add("bloc-replie");
        } else if (etatSauvegarde === null && blocsRepliesParDefaut.includes(bloc.id)) {
            bloc.classList.add("bloc-replie");
        }

        majTexteBouton(btn, bloc);

        btn.addEventListener("click", () => {
            bloc.classList.toggle("bloc-replie");

            localStorage.setItem(
                `etat_${bloc.id}`,
                bloc.classList.contains("bloc-replie") ? "replie" : "deplie"
            );

            majTexteBouton(btn, bloc);

            // Sécurité Chart.js quand on redéplie un bloc
            setTimeout(() => {
                if (window.Chart) {
                    Object.values(Chart.instances || {}).forEach(chart => {
                        if (chart && typeof chart.resize === "function") {
                            chart.resize();
                        }
                    });
                }
            }, 150);
        });

        titre.insertAdjacentElement("afterend", btn);
    });
}

function majTexteBouton(btn, bloc) {
    btn.textContent = bloc.classList.contains("bloc-replie")
        ? "Afficher ▼"
        : "Replier ▲";
}