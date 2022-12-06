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
  loadedAll: false,
  // pageLimit: 1,

  // countPageLimit() {
  //   return Math.ceil(500 / this.perPage);
  // },

  createFullUrl() {
    return (
      this.url +
      '?key=' +
      this.key +
      '&q=' +
      encodeURIComponent(this.q) +
      '&image_type=' +
      this.imageType +
      '&orientation=' +
      this.orientation +
      '&safesearch=' +
      this.safesearch +
      '&per_page=' +
      this.perPage +
      '&page=' +
      this.page
    );
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
  // console.log(refs.galleryEl.children.length);
}

async function getImages() {
  try {
    let response;
    if (!searchQuery.loadedAll) {
      response = await axios.get(searchQuery.createFullUrl());
      // console.log(Math.ceil(response.data.totalHits / searchQuery.perPage));
      // console.log(searchQuery.page);
      if (
        searchQuery.page ===
        Math.ceil(response.data.totalHits / searchQuery.perPage)
      ) {
        searchQuery.loadedAll = true;
      }
    }

    console.log(searchQuery);

    if (response.data.totalHits <= 0) {
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
      return;
    }

    if (
      Math.ceil(response.data.totalHits / searchQuery.perPage) >
      searchQuery.page
    ) {
      searchQuery.page += 1;
      return {
        imgInfo: response.data.hits,
        totalHits: response.data.totalHits,
      };
    } else {
      Notiflix.Notify.info(
        `We're sorry, but you've reached the end of search results.`
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
    window.scroll(0, scrolled);
    await getImages(searchQuery).then(data => {
      if (data) {
        imgMurkup(data.imgInfo);
      }
    });
  }
}
