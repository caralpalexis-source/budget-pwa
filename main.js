document.addEventListener("DOMContentLoaded", () => {
    if (typeof lancerProgrammeBloc1 === "function") lancerProgrammeBloc1();
    if (typeof lancerProgrammeBloc2 === "function") lancerProgrammeBloc2();
    if (typeof lancerProgrammeBloc3 === "function") lancerProgrammeBloc3();
    if (typeof lancerProgrammeBloc4 === "function") lancerProgrammeBloc4();
    if (typeof lancerProgrammeBloc4A === "function") lancerProgrammeBloc4A();
    // Optionnel mais propre
    if (typeof verifierEquilibreFinancier === "function") {
        verifierEquilibreFinancier();
    }
});
