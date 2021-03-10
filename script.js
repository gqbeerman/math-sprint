// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
const summaryPage = document.getElementById('summary-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');
const finalCountEl = document.querySelector('.final-count');
// summary page
const summaryBtn = document.querySelector('.summary');
const summaryContainer = document.querySelector('.summary-container');
const summaryTitleEl = document.querySelector('.title');

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];
let incorrectArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';
let finalIncorrectCount = 0;

// Scroll
let valueY = 0;

let i = 0;
//let task = setInterval(flash, 1000);

function flash() {
  // gamePage.style.backgroundColor=(i = ~i) ? 'rgb(255, 255, 255, 0)' : 'rgb(220,20,60, 10)';
  gamePage.style.backgroundColor = 'rgb(220,20,60, 10)';
}

//refresh splash page best scores
function bestScoresToDOM() {
  bestScores.forEach((bestScore, index) => {
    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`;
  });
}

//check local storage for best score, set best
function getSavedBestScores() {
  if(localStorage.getItem('bestScores')) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      {questions: 10, bestScore: finalTimeDisplay},
      {questions: 25, bestScore: finalTimeDisplay},
      {questions: 50, bestScore: finalTimeDisplay},
      {questions: 99, bestScore: finalTimeDisplay},
    ];
    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
}

//update best score array
function updateBestScore() {
  bestScoreArray.forEach((score, index) => {
    //select correct best score
    if(questionAmount == score.questions) {
      //return best score as number with one decimal
      const savedBestScore = parseInt(bestScoreArray[index].bestScore);
      //update if new final score is less or replacing zero
      if(savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  //update splash page
  bestScoresToDOM();
  //save to local storage
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
}

//show summary
function showSummaryPage() {
    //show play again button after 1s
    setTimeout(() => {
      playAgainBtn.hidden = false;
    }, 1000);
    gamePage.hidden = true;
    scorePage.hidden = true;
    summaryPage.hidden = false;
    // populateSummaryPage();
    summaryToDOM();
}

//reset game
function playAgain() {
  gamePage.addEventListener('click', startTimer);
  summaryPage.hidden = true;
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  finalIncorrectCount = 0;
  playAgainBtn.hidden = true;
  summaryBtn.hidden = true;
}

//show score page
function showScorePage() {
  //show summary button after 1s
  setTimeout(() => {
    summaryBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  summaryPage.hidden = true;
  scorePage.hidden = false;
}

//format and display time to DOM
function scoresToDOM() {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  finalCountEl.textContent = `Incorrect: ${finalIncorrectCount}`
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;

  updateBestScore();
  //scroll to top, go to score page
  itemContainer.scrollTo({ top: 0, behavior: 'instant'});
  showScorePage();
}

//stop timer, process results, go to score page
function checkTime() {
  //console.log('time played:', timePlayed);
  if(playerGuessArray.length == questionAmount) {
    console.log('player guess array:', playerGuessArray);
    clearInterval(timer);
    //check for wrong guesses; add penalty to time
    equationsArray.forEach((equation, index) => {
      if(equation.evaluated === playerGuessArray[index]) {
        //correct guess, no penalty
      } else {
        //incorrect guess, add penalty
        // console.log('equation wrong:', equationsArray[index]);
        // incorrectArray.push(equationsArray[index]);
        // console.log('incorrectArray:', incorrectArray[index]);
        finalIncorrectCount++;
        penaltyTime += 2.5;
      }
    });
    finalTime = timePlayed + penaltyTime;
    console.log('time:', timePlayed, 'penalty:', penaltyTime, 'final time:', finalTime);
    scoresToDOM();
  }
}

//add a tenth of a second to timePlayed
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

//start timer when game page is clicked
function startTimer() {
  //reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener('click', startTimer);
}

//scroll and store user selection
function select(guessedTrue) {
  if(playerGuessArray.length + 1 < questionAmount){
    //scroll 80pixels
    valueY +=80;
    itemContainer.scroll(0, valueY);
  }
  
  //add player guess to array
  return guessedTrue ? playerGuessArray.push('true') : playerGuessArray.push('false');
}

//display game page
function showGamePage() {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

//get random number up to max num
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  console.log('correct equations:', correctEquations);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  console.log('wrong equations:', wrongEquations);
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);

}

//add equations to DOM
function equationsToDOM() {
  equationsArray.forEach((equation) => {
    //item
    const item = document.createElement('div');
    item.classList.add('item');
    //equation text
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    //append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

function summaryToDOM() {
  summaryContainer.textContent = '';
  // summaryContainer.scrollTo({ top: 0, behavior: 'instant'});
  equationsArray.forEach((equation, index) => {
    if(equation.evaluated === playerGuessArray[index]) {

    } else {
      // console.log('equation wrong:', equationsArray[index]);
      //item
      const sumItem = document.createElement('div');
      sumItem.classList.add('sum-item');
      //equation text
      const summaryText = document.createElement('h1');
      summaryText.textContent = equation.value;
      console.log('equation value:', equation.value);
      //append
      sumItem.appendChild(summaryText);
      summaryContainer.appendChild(sumItem);
    }
  });
}

function populateSummaryPage() {
    // Reset DOM, Set Blank Space Above
    // summaryContainer.textContent = '';
    // // Spacer
    // const topSpacer = document.createElement('div');
    // topSpacer.classList.add('height-240');
    // // Selected Item (blue bar)
    // const summaryItem = document.createElement('div');
    // summaryItem.classList.add('summary-item');
    // //Append
    // summaryContainer.append(topSpacer, summaryItem);
    //summaryToDOM();

     // Set Blank Space Below
    // const bottomSpacer = document.createElement('div');
    // bottomSpacer.classList.add('height-500');
    // itemContainer.appendChild(bottomSpacer);
}

//run countdown... 3, 2, 1, GO
function countdownStart() {
  countdown.textContent = '3';
  setTimeout(() => {
    countdown.textContent = '2';
  }, 1000);
  setTimeout(() => {
    countdown.textContent = '1';
  }, 2000);
  setTimeout(() => {
    countdown.textContent = 'GO!';
  }, 3000);
  // let count = 3;
  // countdown.textContent = count;
  // const timeCountDown = setInterval(() => {
  //   count--;
  //   if(count === 0) {
  //     countdown.textContent = 'GO!';
  //   } else if (count == -1) {
  //       showGamePage();
  //       clearInterval();
  //   } else {
  //     countdown.textContent = count;
  //   }
  // }, 1000);
}

//Navigate from splash to countdown page
function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  countdownStart();
  setTimeout(showGamePage, 4000);
  populateGamePage();
}

//Get the value from selected radio button
function getRadioValue() {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if(radioInput.checked) {
      radioValue = radioInput.value;
    }
  });
  return radioValue;
}

//Form that decides number of questions
function seclectQuestionAmount(e) {
  e.preventDefault();
  questionAmount = getRadioValue();
  console.log('question amount:', questionAmount);
  if(questionAmount) {
    showCountdown();
  }
}

startForm.addEventListener('click', () => {
  radioContainers.forEach((radioEl) => {
    //Remove Selected Label Styling
    radioEl.classList.remove('selected-label');
    //Add it back if radio input checked
    if(radioEl.children[1].checked) {
      radioEl.classList.add('selected-label');
    }
  });
});

//Event Listeners
startForm.addEventListener('submit', seclectQuestionAmount);
gamePage.addEventListener('click', startTimer);

//on load
getSavedBestScores();