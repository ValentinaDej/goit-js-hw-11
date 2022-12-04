import './css/styles.css';
import axios from 'axios';
import throttle from 'lodash.throttle';
import Notiflix from 'notiflix';
import 'notiflix/dist/notiflix-3.2.5.min.css';

Notiflix.Notify.init({
  timeout: 2000,
});

const THROTTLE_DELAY = 300;
const searchQuery = {
  url: 'https://pixabay.com/api/',
  key: '31094893-91e9afbe8165d9cedcce56644',
  q: '',
  imageType: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  perPage: 40,
  page: 1,
  countPageLimit() {
    return Math.ceil(500 / this.perPage);
  },
};

const refs = {
  formEl: document.querySelector('.search-form'),
  galleryEl: document.querySelector('.gallery'),
};

refs.formEl.addEventListener('submit', onSerachFormSubmit);

(() => {
  window.addEventListener('scroll', throttle(checkPosition, THROTTLE_DELAY));
  window.addEventListener('resize', throttle(checkPosition, THROTTLE_DELAY));
})();

async function onSerachFormSubmit(event) {
  event.preventDefault();
  clearGalleryMarkup();
  searchQuery.q = refs.formEl.elements.searchQuery.value;
  await getImages(searchQuery).then(data => {
    if (data) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      imgMurkup(data.imgInfo);
    }
  });
}

function imgMurkup(imgArray = []) {
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

  if (!refs.galleryEl.children.length) {
    refs.galleryEl.innerHTML = markup;
    return;
  }

  refs.galleryEl.lastElementChild.insertAdjacentHTML('afterEnd', markup);
}

async function getImages({
  url,
  key,
  q,
  imageType,
  orientation,
  safesearch,
  perPage,
  page,
}) {
  const fullUrl =
    url +
    '?key=' +
    key +
    '&q=' +
    encodeURIComponent(q) +
    '&image_type=' +
    imageType +
    '&orientation=' +
    orientation +
    '&safesearch=' +
    safesearch +
    '&per_page=' +
    perPage +
    '&page=' +
    page;

  try {
    if (searchQuery.countPageLimit() < searchQuery.page) {
      Notiflix.Notify.failure(
        `We're sorry, but you've reached the end of search results.`
      );
      return;
    }

    const response = await axios.get(fullUrl);

    if (
      response.data.totalHits > 0 &&
      searchQuery.countPageLimit() >= searchQuery.page
    ) {
      searchQuery.page += 1;
      return {
        imgInfo: response.data.hits,
        totalHits: response.data.totalHits,
      };
    } else if (response.data.totalHits > 0) {
      Notiflix.Notify.failure(
        `We're sorry, but you've reached the end of search results.`
      );
    } else {
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
    }
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
}

function clearGalleryMarkup() {
  refs.galleryEl.innerHTML = '';
  searchQuery.page = 1;
}

async function checkPosition() {
  // высота документа
  let height = document.body.offsetHeight;
  // высота экрана
  let screenHeight = window.innerHeight;
  // Записываем, сколько пикселей пользователь уже проскроллил:
  let scrolled = window.scrollY;
  // Обозначим порог, по приближении к которому будем вызывать какое-то действие.
  let threshold = height - screenHeight / 4;
  // Отслеживаем, где находится низ экрана относительно страницы:
  let position = scrolled + screenHeight;

  if (position >= threshold) {
    await getImages(searchQuery).then(data => {
      if (data) {
        imgMurkup(data.imgInfo);
      }
    });
    window.scroll(0, scrolled);
  }
}
