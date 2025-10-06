let quizData = [];
let userAnswers = JSON.parse(localStorage.getItem('userAnswers')||'{}');
let timer;
let timeLeft = parseInt(localStorage.getItem('timeLeft')) || 0;

document.getElementById('startQuizBtn').addEventListener('click', () => {
  document.getElementById('nameModal').style.display = 'flex';
});

document.getElementById('submitName').addEventListener('click', () => {
  const name = document.getElementById('userName').value.trim();
  if(!name) return alert("Enter your name!");
  localStorage.setItem('userName', name);
  document.getElementById('nameModal').style.display='none';
  startQuiz();
});

async function startQuiz(){
  const res = await fetch('quiz.json');
  quizData = await res.json();
  document.getElementById('quizTitle').innerText = quizData.title;
  document.getElementById('quizContainer').classList.remove('hidden');
  renderQuestions();
  if(timeLeft===0) timeLeft = quizData.duration_minutes*60;
  startTimer(timeLeft);
}

function renderQuestions(){
  const container = document.getElementById('questions');
  container.innerHTML = '';
  quizData.questions.forEach((q, idx) => {
    const div = document.createElement('div');
    div.classList.add('question');
    div.innerHTML = `<p>${idx+1}. ${q.text}</p>`;
    q.options.forEach((opt,i)=>{
      const btn = document.createElement('div');
      btn.classList.add('option');
      btn.innerText = opt;
      // restore previous answer
      if(userAnswers[q.id]!==undefined){
        btn.classList.add('disabled');
        if(i===q.rightAnswerIndex) btn.classList.add('correct');
        if(i===userAnswers[q.id] && i!==q.rightAnswerIndex) btn.classList.add('wrong');
      }
      btn.addEventListener('click',()=>{
        if(userAnswers[q.id]!==undefined) return;
        userAnswers[q.id]=i;
        localStorage.setItem('userAnswers',JSON.stringify(userAnswers));
        Array.from(btn.parentElement.children).forEach((el,j)=>{
          el.classList.add('disabled');
          if(j===q.rightAnswerIndex) el.classList.add('correct');
          if(j===i && j!==q.rightAnswerIndex) el.classList.add('wrong');
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
  timer=setInterval(()=>{
    timeLeft--;
    localStorage.setItem('timeLeft',timeLeft);
    updateTimer();
    if(timeLeft<=0){
      clearInterval(timer);
      submitQuiz();
    }
  },1000);
}

function updateTimer(){
  const m=Math.floor(timeLeft/60).toString().padStart(2,'0');
  const s=(timeLeft%60).toString().padStart(2,'0');
  document.getElementById('timer').innerText=`Time: ${m}:${s}`;
}

document.getElementById('submitQuiz').addEventListener('click',submitQuiz);

function submitQuiz(){
  clearInterval(timer);
  localStorage.setItem('userAnswers',JSON.stringify(userAnswers));
  localStorage.setItem('quizData',JSON.stringify(quizData));
  window.location.href='result.html';
}
