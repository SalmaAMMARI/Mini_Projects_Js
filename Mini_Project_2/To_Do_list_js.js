// Accéder à l'élément de formulaire et de liste
const addTask = document.querySelector(".add"); // Formulaire pour ajouter une tâche
const lista = document.querySelector(".todos"); // Liste de tâches à faire

// Fonction pour ajouter une tâche à la liste
const addtask = (task) => {
    // Créer une nouvelle tâche sous forme de code HTML
    const Task = `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>${task}</span>
            <i class="far fa-trash-alt delete"></i>
        </li>
    `;

    // Ajouter cette tâche à la liste des tâches
    lista.insertAdjacentHTML('beforeend', Task);
};

// Ajouter un événement pour l'envoi du formulaire (submit)
addTask.addEventListener("submit", (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Récupérer la valeur de l'input (tâche saisie) et enlever les espaces inutiles
    const taask = addTask.add.value.trim();

    // Si la tâche n'est pas vide, l'ajouter à la liste
    if (taask.length) {
        addtask(taask); // Ajouter la tâche
        addTask.reset(); // Réinitialiser l'input après ajout
    }
});
const filtrer = (inputtext) => {
    // Récupérer l'élément <ul> et ses <li>
    const ulElement = document.querySelector(".todos");
    const listItems = ulElement.querySelectorAll("li");

    // Si l'input de recherche est vide, afficher toutes les tâches
    if (inputtext === "") {
        listItems.forEach(item => {
            item.style.display = ""; // Réinitialiser l'affichage des tâches
            item.style.visibility = ''; // Réinitialiser la visibilité
            item.style.position = ''; // Réinitialiser la position
        });
        return;  // Si l'input est vide, on arrête la fonction ici
    }

    // Parcourir chaque <li> et filtrer en fonction du texte
    listItems.forEach(item => {
        const contenu = item.querySelector("span").textContent.toLowerCase().trim(); // Récupérer le texte et le convertir en minuscule

        // Si le texte de la tâche contient l'input de recherche, afficher la tâche, sinon la cacher
        if (contenu.includes(inputtext.toLowerCase())) {
            item.style.display = "";  // Supprimer la classe 'hidden' pour afficher la tâche
            item.style.visibility = '';  // Réinitialiser la visibilité
            item.style.position = ''; // Réinitialiser la position
        } else {
            item.style.visibility = 'hidden';  // Ajouter la classe 'hidden' pour cacher la tâche
            item.style.position = "absolute"; // Enlever de l'affichage visuel
        }
    });
};

// Assurer que le filtrage se fait à chaque fois que l'utilisateur tape ou efface du texte
const searchtext = document.querySelector(".search input"); // Champ de recherche
searchtext.addEventListener("input", (e) => {
    const texto = e.target.value.trim(); // Récupérer la valeur du champ de recherche
    filtrer(texto);  // Appeler la fonction de filtrage avec le texte entré
});
