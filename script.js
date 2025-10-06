document.addEventListener('DOMContentLoaded', () => {
    const quizData = JSON.parse(localStorage.getItem('quizData'));
    // যদি কোনো কারণে quizData না থাকে, তাহলে হোমপেজে ফেরত পাঠানো
    if (!quizData) {
        window.location.href = 'index.html';
        return;
    }

    const userAnswers = JSON.parse(localStorage.getItem('userAnswers')) || {};
    let timeLeft = localStorage.getItem('timeLeft') ? parseInt(localStorage.getItem('timeLeft')) : quizData.duration_minutes * 60;
    let timerInterval;

    const quizContainer = document.getElementById('quizContainer');
    const timerElement = document.getElementById('timer');
    const submitBtn = document.getElementById('submitQuizBtn');

    // কুইজের শিরোনাম সেট করা
    document.getElementById('quizTitle').innerText = quizData.title;

    // প্রশ্নগুলো দেখানো
    function renderQuestions() {
        quizContainer.innerHTML = '';
        quizData.questions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            questionDiv.innerHTML = `<p><strong>${index + 1}. ${q.text}</strong></p>`;

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';

            q.options.forEach((option, i) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.innerText = option;
                optionDiv.dataset.questionId = q.id;
                optionDiv.dataset.optionIndex = i;

                // যদি উত্তর আগে দেওয়া থাকে
                if (userAnswers[q.id] !== undefined) {
                    // এখানে optionsDiv এর পরিবর্তে সরাসরি optionDiv গুলোকে disable করা হচ্ছে
                    // এটি প্রতিটি প্রশ্নের অপশনকে আলাদাভাবে নিয়ন্ত্রণ করবে
                    const parentOptions = document.querySelectorAll(`[data-question-id='${q.id}']`);
                    parentOptions.forEach(opt => {
                        opt.parentElement.classList.add('disabled');
                        if (parseInt(opt.dataset.optionIndex) === userAnswers[q.id]) {
                            opt.classList.add('selected');
                        }
                    });
                }

                optionDiv.addEventListener('click', handleOptionSelect);
                optionsDiv.appendChild(optionDiv);
            });

            questionDiv.appendChild(optionsDiv);
            quizContainer.appendChild(questionDiv);
        });
    }

    // উত্তর সিলেক্ট করার ফাংশন
    function handleOptionSelect(event) {
        const selectedOption = event.target;
        const questionId = selectedOption.dataset.questionId;
        const optionIndex = parseInt(selectedOption.dataset.optionIndex);

        // উত্তর সেভ করা
        userAnswers[questionId] = optionIndex;
        localStorage.setItem('userAnswers', JSON.stringify(userAnswers));

        // অন্য অপশনগুলো ডিজেবল করা এবং সিলেক্টেড দেখানো
        const optionsContainer = selectedOption.parentElement;
        optionsContainer.classList.add('disabled');
        
        Array.from(optionsContainer.children).forEach(opt => opt.classList.remove('selected'));
        selectedOption.classList.add('selected');
    }

    // টাইমার আপডেট করার ফাংশন
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const seconds = (timeLeft % 60).toString().padStart(2, '0');
        timerElement.innerText = `Time: ${minutes}:${seconds}`;
    }

    // টাইমার শুরু করা
    function startTimer() {
        updateTimerDisplay(); // প্রথমে একবার কল করা যাতে 00:00 না দেখায়
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            localStorage.setItem('timeLeft', timeLeft);

            if (timeLeft <= 0) {
                submitQuiz();
            }
        }, 1000);
    }

    // কুইজ সাবমিট করা
    function submitQuiz() {
        clearInterval(timerInterval);
        localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
        // সময় শেষ হয়ে গেলে বা সাবমিট করলে সময় রিসেট করা
        localStorage.removeItem('timeLeft');
        window.location.href = 'result.html';
    }

    submitBtn.addEventListener('click', submitQuiz);

    // কুইজ শুরু
    renderQuestions();
    startTimer();
});
