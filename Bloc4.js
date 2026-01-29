let waterfallChart = null;

function lancerProgrammeBloc4() {

    // Récupération safe avec fallback
    const fixeEngage = Number(window.getFixeEngage?.() || 0);
    const variableEngage = Number(window.getVariableEngage?.() || 0);
    const resteFixe = Number(window.getFixeReste?.() || 0);
    const totalRFixes = Number(window.getTotalRFixes?.() || 0);
    const totalRVariables = Number(window.getTotalRVariables?.() || 0);

    const totalDepense = fixeEngage + variableEngage;
    const totalRevenus = totalRFixes + totalRVariables;
    const restantDisponible = totalRevenus - totalDepense - resteFixe;

    // Zones invisibles de départ
    const start = [
        0,                          // Fixe engagé
        fixeEngage,                 // Variable engagé empilé
        0,                          // Total dépensé
        totalDepense,               // Reste fixe empilé
        totalDepense + resteFixe    // Restant dispo empilé
    ];

    const values = [
        fixeEngage,
        variableEngage,
        totalDepense,
        resteFixe,
        restantDisponible
    ];

    // --- Taille fixe du canvas ---
    const canvas = document.getElementById("waterfallChart");
    const ctx = canvas.getContext("2d");

    if (waterfallChart) waterfallChart.destroy();

    waterfallChart = new Chart(ctx, {
        type: "bar",
        plugins: [ChartDataLabels],
        data: {
            labels: [
                "Fixe engagé",
                "Variable engagé",
                "Total dépensé",
                "Reste fixe à engager",
                "Restant disponible"
            ],
            datasets: [
                // Invisible stack
                {
                    label: "Départ",
                    data: start,
                    backgroundColor: "rgba(0,0,0,0)",
                    borderWidth: 0,
                    stack: "stack1",
                    datalabels: { display: false }
                },

                // Visible bars
                {
                    label: "Montants",
                    data: values,
                    maxBarThickness: 55,
                    backgroundColor: [
                        "#ff6666",
                        "#ffcc66",
                        "#ff9933",
                        "#66ccff",
                        "#99cc66"
                    ],
                    borderColor: "#333",
                    borderWidth: 1,
                    borderRadius: 8,
                    stack: "stack1"
                }
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // important !
            animation: false,
           
            plugins: {
                legend: { display: false },
                datalabels: {
                    color: "#000",
                    font: { weight: "bold" },
                    formatter: v => format2(v),

                    anchor: (ctx) => {
                        const lastIndex = ctx.dataset.data.length - 1;
                        return ctx.dataIndex === lastIndex ? "start" : "end";
                    },

                    align: (ctx) => {
                        const lastIndex = ctx.dataset.data.length - 1;
                        return ctx.dataIndex === lastIndex ? "bottom" : "top";
                    }
                }
            },

            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}




// Répartition dépenses variables
let pieVariablesChart = null;

function lancerProgrammeBloc4A() {

    const bloc = document.getElementById("Bloc4A");
    const canvas = document.getElementById("pieVariables");

    if (!bloc || !canvas) return;

    // Données disponibles ?
    if (typeof window.getRepartitionVariablesEngagees !== "function") {
        console.warn("Répartition des variables engagées non disponible");
        return;
    }

    const dataVars = window.getRepartitionVariablesEngagees();

    // Aucune dépense
    if (!dataVars || dataVars.length === 0) {
        if (pieVariablesChart) {
            pieVariablesChart.destroy();
            pieVariablesChart = null;
        }
        return;
    }

    const total = dataVars.reduce((sum, c) => sum + Number(c.montant || 0), 0);
    if (total <= 0) return;

    const labels = dataVars.map(c => c.nom);
    const values = dataVars.map(c => c.montant);

    // Nettoyage propre
    if (pieVariablesChart) {
        pieVariablesChart.destroy();
        pieVariablesChart = null;
    }

    pieVariablesChart = new Chart(canvas, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: values
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.raw;
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${value} € (${percent} %)`;
                        }
                    }
                },
                legend: {
                    position: "top"
                }
            }
        }
    });
}

window.lancerProgrammeBloc4A = lancerProgrammeBloc4A;





window.lancerProgrammeBloc4 = lancerProgrammeBloc4;
window.lancerProgrammeBloc4A=lancerProgrammeBloc4A;
