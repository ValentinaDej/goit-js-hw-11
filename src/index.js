import './css/styles.css';
import axios from 'axios';

import Notiflix from 'notiflix';
import 'notiflix/dist/notiflix-3.2.5.min.css';

Notiflix.Notify.init({
  timeout: 5000,
});

const page = 1;
const refs = {
  formEl: document.querySelector('.search-form'),
  galleryEl: document.querySelector('.gallery'),
};

refs.formEl.addEventListener('submit', onSerachFormSubmit);

function onSerachFormSubmit(event) {
  event.preventDefault();

  getImages(refs.formEl.elements.searchQuery.value).then(imgArray =>
    imgMurkup(imgArray)
  );
}

function imgMurkup(imgArray) {
  clearGalleryMarkup();

  if (!imgArray.length) {
    Notiflix.Notify.failure(
      `Sorry, there are no images matching your search query. Please try again.`
    );
    return;
  }

  const markup = imgArray
    .map(imgEl => {
      const {
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = imgEl;

      return `
      <div class="photo-card">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
            <p class="info-item">
            <b>${likes}</b>
            </p>
            <p class="info-item">
            <b>${views}</b>
            </p>
            <p class="info-item">
            <b>${comments}</b>
            </p>
            <p class="info-item">
            <b>${downloads}</b>
            </p>
        </div>
    </div>`;
    })
    .join('');

  refs.galleryEl.innerHTML = markup;
  checkPosition();
}

const API_KEY = '31094893-91e9afbe8165d9cedcce56644';
const URL = 'https://pixabay.com/api/?key=' + API_KEY;

async function getImages(searchRequest) {
  try {
    const response = await axios.get(
      URL +
        '&q=' +
        encodeURIComponent(searchRequest) +
        '&image_type=photo&iorientation=horizontal&safesearch=true&per_page=40'
    );
    return response.data.hits;
  } catch (error) {
    console.error(error);
  }
}

function clearGalleryMarkup() {
  refs.galleryEl.innerHTML = '';
}

function checkPosition() {
  // Нам потребуется знать высоту документа и высоту экрана:
  const height = document.body.offsetHeight;
  const screenHeight = window.innerHeight;
  console.log(height);
  console.log(screenHeight);
  // Они могут отличаться: если на странице много контента,
  // высота документа будет больше высоты экрана (отсюда и скролл).

  // Записываем, сколько пикселей пользователь уже проскроллил:

  //const scrolled = window.scrollY;

  // Обозначим порог, по приближении к которому
  // будем вызывать какое-то действие.
  // В нашем случае — четверть экрана до конца страницы:

  //const threshold = height - screenHeight / 4;

  // Отслеживаем, где находится низ экрана относительно страницы:

  //const position = scrolled + screenHeight;

  //  if (position >= threshold) {
  // Если мы пересекли полосу-порог, вызываем нужное действие.
  //  }
}

// $.getJSON(URL, function(data){
// if (parseInt(data.totalHits) > 0)
//     $.each(data.hits, function(i, hit){ console.log(hit.pageURL); });
// else
//     console.log('No hits');
// }

// page	int	Returned search results are paginated. Use this parameter to select the page number.
// Default: 1
// per_page	int	Determine the number of results per page.
// Accepted values: 3 - 200
// Default: 20

// function getUserAccount() {
//   return axios.get('/user/12345');
// }

// function getUserPermissions() {
//   return axios.get('/user/12345/permissions');
// }

// Promise.all([getUserAccount(), getUserPermissions()])
//   .then(function (results) {
//     const acct = results[0];
//     const perm = results[1];
//   });
