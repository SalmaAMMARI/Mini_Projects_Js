const questions = [
    {
        question: "Quel est le langage utilisé pour structurer une page web ?",
        choices: ["CSS", "HTML", "JavaScript"],
        correct: "HTML"
    },
    {
        question: "Quel langage permet de styliser une page web ?",
        choices: ["HTML", "Python", "CSS"],
        correct: "CSS"
    },
    {
        question: "Quel langage est utilisé pour rendre une page web interactive ?",
        choices: ["JavaScript", "PHP", "C++"],
        correct: "JavaScript"
    }
];

let score = 0;
let currentQuestionIndex = 0;
let timeLeft = 10;
let timerInterval;

const quizContainer = document.getElementById("quiz-container");
const scoreDisplay = document.getElementById("score");
const submitButton = document.getElementById("submit-btn");
const timerDisplay = document.getElementById("timer");

function displayQuestion() {
    // Réinitialiser le contenu du quiz
    quizContainer.innerHTML = "";

    let questionObj = questions[currentQuestionIndex];

    // Afficher la question
    let questionElement = document.createElement("div");
    questionElement.classList.add("question");
    questionElement.textContent = questionObj.question;
    quizContainer.appendChild(questionElement);

    // Afficher les choix
    let choicesDiv = document.createElement("div");
    choicesDiv.classList.add("choices");

    questionObj.choices.forEach(choice => {
        let label = document.createElement("label");
        let input = document.createElement("input");
        input.type = "radio";
        input.name = "answer";
        input.value = choice;

        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + choice));
        choicesDiv.appendChild(label);
        choicesDiv.appendChild(document.createElement("br"));
    });

    quizContainer.appendChild(choicesDiv);
    startTimer();
}

function startTimer() {
    timeLeft = 10;
    timerDisplay.textContent = `Temps restant : ${timeLeft} sec`;
    
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Temps restant : ${timeLeft} sec`;

        if (timeLeft === 0) {
            clearInterval(timerInterval);
            nextQuestion();
        }
    }, 1000);
}

function checkAnswer() {
    let selectedOption = document.querySelector('input[name="answer"]:checked');

    if (!selectedOption) return;

    clearInterval(timerInterval);

   

    nextQuestion();
}

function nextQuestion() {
    let selectedOption = document.querySelector('input[name="answer"]:checked');

    // Si une réponse est sélectionnée, on la comptabilise
    if (selectedOption) {
        let userAnswer = selectedOption.value;
        let correctAnswer = questions[currentQuestionIndex].correct;

        if (userAnswer === correctAnswer) {
            score++;
        }
    }

    // Passer à la question suivante
    currentQuestionIndex++;

    // Si toutes les questions ont été traitées, afficher le score final
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
    } else {
        displayQuestion(currentQuestionIndex);  // Afficher la question suivante
        startTimer();  // Démarrer le timer pour la nouvelle question
    }
}


function endQuiz() {
    quizContainer.innerHTML = `<h2>Quiz terminé !</h2><p>Votre score : ${score}/${questions.length}</p>`;
    submitButton.style.display = "none";
    timerDisplay.style.display = "none";
    
    // Remonter la page en haut pour voir le score
    window.scrollTo({ top: 0, behavior: "smooth" });

    scoreDisplay.textContent = score;
}

submitButton.addEventListener("click", checkAnswer);

// Afficher la première question au chargement de la page
displayQuestion();
