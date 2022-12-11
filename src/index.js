import getApi from './js/fetchAPI';
import renderMarkup from './js/renderMarkup';
import { searchQuery } from './js/dataSearchQuery';

import throttle from 'lodash.throttle';
import Notiflix from 'notiflix';
import 'notiflix/dist/notiflix-3.2.5.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

Notiflix.Notify.init({
  timeout: 2000,
});

let totalPage;
const THROTTLE_DELAY = 1000;
const refs = {
  formEl: document.querySelector('.search-form'),
  galleryEl: document.querySelector('.gallery'),
  boxEl: document.querySelector('.box'),
};

const trottledOnPageScroll = throttle(onPageScroll, THROTTLE_DELAY);

refs.formEl.addEventListener('submit', onSerachFormSubmit);

async function onSerachFormSubmit(event) {
  if (!refs.formEl.elements.searchQuery.value) {
    return;
  }
  event.preventDefault();
  clearMarkup();
  pushTextRequest(refs.formEl.elements.searchQuery.value);

  await getApi(searchQuery).then(data => {
    if (data.totalHits <= 0) {
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
      return;
    }

    addOnPageScrollEventListener();
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    totalPage = Math.ceil(data.totalHits / searchQuery.perPage);
    refs.galleryEl.innerHTML = renderMarkup(data.hits);
    lightbox.refresh();
    intreactiveLiteBox();
  });
}

async function onPageScroll() {
  if (searchQuery.loadedAll) {
    removeOnPageScrollEventListener();
    return;
  }

  if (chekScrollPositionForDownload() && !searchQuery.loadedAll) {
    if (totalPage > searchQuery.page) {
      searchQuery.page += 1;

      await getApi(searchQuery).then(data => {
        if (data.totalHits <= 0) {
          Notiflix.Notify.failure(
            `Sorry, there are no images matching your search query. Please try again.`
          );
          return;
        }

        refs.galleryEl.lastElementChild.insertAdjacentHTML(
          'afterEnd',
          renderMarkup(data.hits)
        );
        lightbox.refresh();
        intreactiveLiteBox();
      });

      window.scroll(0, window.scrollY);
    } else {
      searchQuery.loadedAll = true;
      Notiflix.Notify.info(
        `We're sorry, but you've reached the end of search results.`
      );
    }
  }
}

function clearMarkup() {
  refs.galleryEl.innerHTML = '';
}

function pushTextRequest(textRequest) {
  searchQuery.q = textRequest;
  searchQuery.loadedAll = false;
  searchQuery.page = 1;
}

function chekScrollPositionForDownload() {
  //перевірка на положення скрола внизу док
  // window.scrollY + window.innerHeight >= document.body.scrollHeight

  // высота документа
  let height = document.body.offsetHeight;
  // высота экрана
  let screenHeight = window.innerHeight;
  // Записываем, сколько пикселей пользователь уже проскроллил:
  let scrolled = window.scrollY;
  // Обозначим порог, по приближении к которому будем вызывать какое-то действие.
  let threshold = height - screenHeight;
  // Отслеживаем, где находится низ экрана относительно страницы:
  let position = scrolled + screenHeight;

  return position >= threshold;
}

function removeOnPageScrollEventListener() {
  window.removeEventListener('scroll', trottledOnPageScroll);
  window.removeEventListener('resize', trottledOnPageScroll);
}

function addOnPageScrollEventListener() {
  window.addEventListener('scroll', trottledOnPageScroll);
  window.addEventListener('resize', trottledOnPageScroll);
}

function intreactiveLiteBox() {
  let elementInFocus;
  lightbox.on('close.simplelightbox', function () {
    elementInFocus =
      refs.galleryEl.children[lightbox.currentImageIndex].firstElementChild;
  });
  lightbox.on('closed.simplelightbox', function () {
    elementInFocus.focus();
  });
}
