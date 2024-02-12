const url = 'https://tmdb-proxy.cubos-academy.workers.dev/3'

const api = axios.create({
    baseURL: url,
    timeout: 10000,
    headers: { 'Content-Type': "Application/json" }
});

const btnTheme = document.querySelector('.btn-theme');
const root = document.querySelector(':root');
const containerMovie = document.querySelector('.movies-container')
const searchMovie = document.querySelector('input');
const divMovies = document.querySelector('.movies');
const btnPrev = document.querySelector('.btn-prev');
const btnNext = document.querySelector('.btn-next');
const divHighLightDayMovie = document.querySelector('.highlight__video');
const divModal = document.querySelector('.modal');
const modalClose = document.querySelector('.modal__close');
const modalGenres = document.querySelector('.modal__genres');
const modalImg = document.querySelector('.modal__img');
const modalBody = document.querySelector('.modal__body');
const logo = document.querySelector('.header__container-logo img');
let cardCount = 6;
let currentCardIndex = 0
let maxCardIndex = 0;
let movies = [];
let contador = 0;

btnTheme.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const currentBgColor = root.style.getPropertyValue('--background');

    if (!currentBgColor || currentBgColor === '#fff') {
        root.style.setProperty('--background', '#1B2028');
        root.style.setProperty('--bg-secondary', '#2D3440');
        root.style.setProperty('--text-color', '#FFFFFF');
        root.style.setProperty('--bg-modal', '#2D3440');
        root.style.setProperty('--input-color', '#665F5F');
        searchMovie.style.backgroundColor = 'var(--bg-secondary)';
        btnTheme.src = './assets/dark-mode.svg';
        modalClose.src = './assets/close.svg';
        btnNext.src = './assets/arrow-right-light.svg';
        btnPrev.src = './assets/arrow-left-light.svg';
        logo.src = './assets/logo.svg';
        return;
    };
    root.style.setProperty('--background', '');
    root.style.setProperty('--bg-secondary', '');
    root.style.setProperty('--text-color', '');
    root.style.setProperty('--bg-modal', '');
    root.style.setProperty('--input-color', '');
    searchMovie.style.backgroundColor = "";
    btnTheme.src = './assets/light-mode.svg';
    modalClose.src = './assets/close-dark.svg';
    btnNext.src = './assets/arrow-right-dark.svg';
    btnPrev.src = './assets/arrow-left-dark.svg';
    logo.src = './assets/logo-dark.png';
});

function initialPage() {
    currentCardIndex = 0;
    contador = 0;
    window.location.href = 'index.html';
};

async function InputLoadCards(buscar) {

    try {
        const response = await api.get(`/search/movie?language=pt-BR&include_adult=false&query=${buscar.value}`);
        movies = response.data.results;
        totalResults = movies.length;
        const results = totalResults > 18 ? 18 : movies.length;
        maxCardIndex = results;

        updateCards(currentCardIndex);
    } catch (error) {
       
    };
};

searchMovie.addEventListener('keypress', (event) => {

    if (event.key === 'Enter') {
        if (!searchMovie.value) {
            searchMovie.value = "";
            contador = 0;
            currentCardIndex = 0;
            initialPage();
            updateCards(currentCardIndex);

        } else {
            InputLoadCards(searchMovie);
            contador = 0;
            currentCardIndex = 0;
            searchMovie.value = "";
        };
    };
});

function truncatedNum(num) {
    const truncated = num.toString().slice(0, num.toString().indexOf('.') + 2);
    return truncated;
};

function createCard(movie) {
    const divMovie = document.createElement('div');
    divMovie.classList.add('movie');
    const divInfo = document.createElement('div');
    divInfo.classList.add('movie__info');
    const movieTitle = document.createElement('span');
    movieTitle.classList.add('movie__title');
    const movieRating = document.createElement('span');
    movieRating.classList.add('movie__rating');
    const imgStar = document.createElement('img');

    let num = movie.vote_average;
    divMovie.setAttribute('id', `${movie.id}`)
    if (movie.poster_path !== null) {
        divMovie.style.backgroundImage = `url(${movie.poster_path})`
    };
    movieTitle.textContent = movie.title;
    movieRating.textContent = truncatedNum(num);
    imgStar.src = "./assets/estrela.svg";
    imgStar.alt = 'estrela';
    containerMovie.appendChild(divMovies);
    divMovies.appendChild(divMovie);
    divMovie.appendChild(divInfo);
    divInfo.appendChild(movieTitle);
    divInfo.appendChild(movieRating);
    movieRating.appendChild(imgStar);
    opemModal(divMovie);
};

function updateCards(currentCardIndex) {

    for (let i = 0; i < cardCount; i++) {
        const lastChild = divMovies.lastElementChild;
        if (lastChild) {
            divMovies.removeChild(lastChild);
        }
    }
    for (let i = currentCardIndex; i < currentCardIndex + cardCount; i++) {
        const results = movies.length > 18 ? 18 : movies.length;
        if (i >= results) {
            return;
        }
        createCard(movies[i]);
    }
};

async function loadCards() {
    try {
        const response = await api.get('/discover/movie?language=pt-BR&include_adult=false');
        movies = response.data.results;
        totalResults = movies.length;
        const results = totalResults > 18 ? 18 : movies.length;
        maxCardIndex = results;

        for (let i = 0; i < cardCount; i++) {
            createCard(movies[i]);
        }
        updateCards(currentCardIndex);

    } catch (error) {
       
    }
};
loadCards();

btnNext.addEventListener('click', (event) => {
    event.preventDefault();
    contador++;
    currentCardIndex += cardCount;

    if (maxCardIndex <= 6) {
        contador = 0;
        currentCardIndex = 0;

    } else if (maxCardIndex <= 12 && contador > 1) {
        contador = 0;
        currentCardIndex = 0;
        updateCards(currentCardIndex);

    } else if (contador > 2) {
        contador = 0;
        currentCardIndex = 0;
        updateCards(currentCardIndex);
        return;
    }
    updateCards(currentCardIndex);
});

btnPrev.addEventListener('click', (event) => {
    event.preventDefault();
    contador--;
    currentCardIndex -= cardCount;

    const results = movies.length > 18 ? 18 : movies.length;
    if (maxCardIndex <= 6) {
        contador = 0;
        currentCardIndex = 0;

    } else if (maxCardIndex <= 12 && contador < 0) {
        cardCount = 4
        console.log(containerMovie.childElementCount - 3)
        contador = 1;
        currentCardIndex = 6;
        updateCards(currentCardIndex);
        cardCount = 6;

    } else if (contador < 0) {
        contador = 2;
        currentCardIndex = results - cardCount;
        updateCards(currentCardIndex);
    }
    updateCards(currentCardIndex);
});

let filmeDoDia = [];

async function movieDay() {
    try {
        response = await api.get('/movie/436969?language=pt-BR');
        filmeDoDia = response.data;
        createDayMovie(filmeDoDia);
    } catch (error) {
       
    };
};
movieDay();

function createDayMovie(movie) {
    const highLightTitle = document.querySelector('.highlight__title');
    const highLightRating = document.querySelector('.highlight__rating');
    const highLightGenres = document.querySelector('.highlight__genres');
    const highLightTime = document.querySelector('.highlight__launch');
    const highLightDescription = document.querySelector('.highlight__description');
    const num = movie.vote_average;
    divHighLightDayMovie.style.backgroundSize = 'contain';
    divHighLightDayMovie.style.backgroundImage = `linear-gradient(var(--highlight-color), var(--highlight-color)), url(${movie.backdrop_path})`;
    highLightTitle.textContent = movie.title;
    highLightRating.textContent = truncatedNum(num);
    let genresArray = [];
    for (let i = 0; i < movie.genres.length; i++) {
        genresArray.push(movie.genres[i].name);
    };
    highLightGenres.textContent = genresArray.join(', ');
    highLightDescription.textContent = movie.overview;
    let data = movie.release_date;
    highLightTime.textContent = `/ ${date(data)}`;
};

function date() {
    return new Date().toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

async function videoPlay() {
    try {
        const response = await api.get('/movie/436969/videos?language=pt-BR');
        const video = response.data.results;
        return video;
    } catch (error) {
       
    };
};

function modifyHref(linkVideo) {
    const urlYouTube = 'https://www.youtube.com/watch?v=';
    videoPlay().then(video => {
        const concatene = urlYouTube + video[0].key;
        linkVideo.href = concatene;
    }).catch(error => {
        console.error(`Erro ao recuperar detalhes da URL do video: ${error}`);
    });
};

const playVideo = document.querySelector('.highlight__video-link');

function play(playVideo) {
    linkVideo.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        modifyHref(playVideo);
    })
};
modifyHref(playVideo);

function createModal(movie) {
    modalImg.src = movie.backdrop_path;
    const modalTitle = document.querySelector('.modal__title');
    const modalDescription = document.querySelector('.modal__description');
    const modalAverage = document.querySelector('.modal__average');
    let num = movie.vote_average;
    const totalGenres = movie.genres.length;
    modalTitle.textContent = movie.title;
    modalDescription.textContent = movie.overview;
    modalAverage.textContent = truncatedNum(num);

    for (let i = 0; i < totalGenres; i++) {
        const modalGenre = document.createElement('span');
        modalGenre.classList.add('modal__genre');
        modalGenre.textContent = movie.genres[i].name;
        modalGenres.appendChild(modalGenre);
    };
};

async function obterDetalhesDoFilme(id) {
    try {
        const responseModal = await api.get(`/movie/${id}?language=pt-BR`);
        const movieModal = responseModal.data;
        return movieModal;
    }
    catch (error) {
        console.log(error.responseModal);
    };
};

function opemModal(divMovie) {
    divMovie.addEventListener('click', async (event) => {
        const divClicada = event.target.closest('.movie');

        if (divClicada) {
            const movieID = await divClicada.getAttribute('id');
            divModal.classList.toggle('hidden');

            obterDetalhesDoFilme(movieID)
                .then((movieModal) => {
                    createModal(movieModal);
                })
                .catch((erro) => {
                    console.error(`Erro ao recuperar detalhes do filme: ${erro}`);
                });
        };
    });
};
function updateGenres() {
    for (let i = 0; i < modalGenres.childElementCount; i++) {
        modalGenres.removeChild(modalGenres.lastChild);
    }
};
modalClose.addEventListener('click', () => {
    divModal.classList.add('hidden');
    modalImg.src = "";
    updateGenres();
});

modalBody.addEventListener('click', () => {
    divModal.classList.add('hidden');
    modalImg.src = "";
    updateGenres();
});


