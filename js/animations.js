// document.addEventListener("DOMContentLoaded", function () {
//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach((entry) => {
//             if (entry.isIntersecting) {
//                 entry.target.classList.add("animate"); // Aggiunge la classe di animazione
//                 observer.unobserve(entry.target); // Ferma l'osservazione dopo l'animazione
//             }
//         });
//     }, { threshold: 0.1 }); // Avvia l'animazione quando il 10% dell'elemento è visibile

//     const elements = document.querySelectorAll("div");
//     elements.forEach((el) => observer.observe(el));
// });
