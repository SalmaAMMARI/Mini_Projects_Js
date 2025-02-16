const form = document.getElementById("quizForm");
const quizContainer = document.getElementById("quizContainer");
const questionContainer = document.getElementById("quizQuestions");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const submitButton = document.getElementById("submitQuiz");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 10;
let timerInterval;
let userAnswers = [];
let answeredQuestions = []; // Track answered questions

form.addEventListener("submit", async (event) => {
event.preventDefault();  // Prevent page reload

const numQuestions = document.getElementById("numQuestions").value;
const category = document.getElementById("category").value;
const difficulty = document.getElementById("difficulty").value;
const type = document.getElementById("type").value;

await fetchQuestions(numQuestions, category, difficulty, type);

form.style.display = "none";
quizContainer.style.display = "block";

displayQuestion();
});

async function fetchQuestions(amount, category, difficulty, type) {
// Construct the URL based on selected values
const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=${type}`;
try {
    const response = await fetch(url);
    const data = await response.json();
    questions = data.results.map(q => ({
        question: decodeURIComponent(q.question),
        choices: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
        correct: q.correct_answer
    }));
} catch (error) {
    console.error("Error fetching questions:", error);
}
}

function displayQuestion() {
if (currentQuestionIndex >= questions.length) {
    endQuiz();
    return;
}

questionContainer.innerHTML = "";

let questionObj = questions[currentQuestionIndex];

let questionElement = document.createElement("h2");
questionElement.innerHTML = questionObj.question;
questionContainer.appendChild(questionElement);

questionObj.choices.forEach(choice => {
    let label = document.createElement("label");
    let input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = choice;

    // Track the selected choice
    input.addEventListener('change', () => {
        userAnswers[currentQuestionIndex] = choice;
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + choice));
    questionContainer.appendChild(label);
    questionContainer.appendChild(document.createElement("br"));
});

submitButton.style.display = "block";
submitButton.onclick = () => submitAnswer();

startTimer();
}

function startTimer() {
timeLeft = 10;
timerDisplay.textContent = `Time left: ${timeLeft} sec`;

if (timerInterval) clearInterval(timerInterval);

timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time left: ${timeLeft} sec`;

    if (timeLeft === 0) {
        clearInterval(timerInterval);
        submitAnswer();
    }
}, 1000);
}

function submitAnswer() {
// Check answer if not already answered
if (!answeredQuestions[currentQuestionIndex]) {
    let selectedAnswer = userAnswers[currentQuestionIndex];
    let correctAnswer = questions[currentQuestionIndex].correct;

    // If the selected answer is correct, increment score
    if (selectedAnswer === correctAnswer) {
        score++;
    }
    answeredQuestions[currentQuestionIndex] = true;
}

// Move to next question or end quiz
currentQuestionIndex++;
if (currentQuestionIndex < questions.length) {
    displayQuestion();
} else {
    endQuiz();
}
}

function endQuiz() {
questionContainer.innerHTML = `<h2>Quiz Over!</h2><p>Your score: ${score}/${questions.length}</p>`;
submitButton.style.display = "none";
timerDisplay.style.display = "none";
}