let playButton = document.getElementById('play');
let nextButton = document.getElementById('nxt');
let patrocinioElements = [
    document.querySelector('#ptr1'),
    document.querySelector('#ptr2'),
    document.querySelector('#ptr3'),
    document.querySelector('#ptr4')
];

let currentIndex = 0;

// Inicialmente, mostrar o primeiro patrocínio
patrocinioElements[currentIndex].classList.add('show');

nextButton.addEventListener('click', function() {
    if (currentIndex < patrocinioElements.length - 1) {
        patrocinioElements[currentIndex].classList.remove('show');
        currentIndex++;
        patrocinioElements[currentIndex].classList.add('show');
    } else {
        patrocinioElements[currentIndex].classList.remove('show');
        playButton.style.display = 'flex';
        nextButton.style.display = 'none';
    }
});
