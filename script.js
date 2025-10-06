let quizData = [];
let userAnswers = {};
let timer;
let timeLeft;

// Display user name
document.getElementById('userNameDisplay').innerText = localStorage.getItem('userName') || '';

// Load quiz.json
fetch('quiz.json')
.then(res=>res.json())
.then(data=>{
  quizData = data;
  document.getElementById('quizTitle').innerText = quizData.title;
  if(localStorage.getItem('userAnswers')){
    userAnswers = JSON.parse(localStorage.getItem('userAnswers'));
  }
  if(localStorage.getItem('timeLeft')){
    timeLeft = parseInt(localStorage.getItem('timeLeft'));
  } else {
    timeLeft = quizData.duration_minutes * 60;
  }
  renderQuestions();
  startTimer(timeLeft);
})
.catch(err=>console.error("Quiz JSON load failed:", err));

function renderQuestions(){
  const container = document.getElementById('questions');
  container.innerHTML = '';
  quizData.questions.forEach((q, idx)=>{
    const div = document.createElement('div');
    div.classList.add('question');
    div.innerHTML = `<p>${idx+1}. ${q.text}</p>`;
    q.options.forEach((opt,i)=>{
      const btn = document.createElement('div');
      btn.classList.add('option');
      btn.innerText = opt;
      if(userAnswers[q.id]===i) btn.classList.add('selected');
      btn.addEventListener('click', ()=>{
        if(userAnswers[q.id]!==undefined) return;
        userAnswers[q.id]=i;
        localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
        Array.from(btn.parentElement.children).forEach((el,j)=>{
          el.classList.remove('selected');
          if(j===i) el.classList.add('selected');
        });
      });
      div.appendChild(btn);
    });
    container.appendChild(div);
  });
}

function startTimer(seconds){
  timeLeft = seconds;
  updateTimer();
  timer = setInterval(()=>{
    timeLeft--;
    localStorage.setItem('timeLeft', timeLeft);
    updateTimer();
    if(timeLeft<=0){
      clearInterval(timer);
      submitQuiz();
    }
  },1000);
}

function updateTimer(){
  const m = Math.floor(timeLeft/60).toString().padStart(2,'0');
  const s = (timeLeft%60).toString().padStart(2,'0');
  document.getElementById('timer').innerText = `Time: ${m}:${s}`;
}

document.getElementById('submitQuiz').addEventListener('click', submitQuiz);

function submitQuiz(){
  clearInterval(timer);
  localStorage.setItem('quizData', JSON.stringify(quizData));
  window.location.href='result.html';
}
