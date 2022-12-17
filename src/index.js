import getApi from './js/fetchAPI';
import renderMarkup from './js/renderMarkup';
import { searchQuery } from './js/dataSearchQuery';

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

let totalPage = 1;
const refs = {
  formEl: document.querySelector('.search-form'),
  galleryEl: document.querySelector('.gallery'),
};

refs.formEl.addEventListener('submit', onSerachFormSubmit);

async function onSerachFormSubmit(event) {
  if (!refs.formEl.elements.searchQuery.value) {
    return;
  }
  event.preventDefault();
  clearMarkup();
  pushTextRequest(refs.formEl.elements.searchQuery.value);
  loadContent();
}

function clearMarkup() {
  refs.galleryEl.innerHTML = '';
}

function pushTextRequest(textRequest) {
  searchQuery.q = textRequest;
  searchQuery.loadedAll = false;
  searchQuery.page = 1;
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

async function loadContent() {
  if (searchQuery.loadedAll) {
    return;
  }

  if (totalPage >= searchQuery.page) {
    await getApi(searchQuery).then(data => {
      if (data.totalHits <= 0) {
        Notiflix.Notify.failure(
          `Sorry, there are no images matching your search query. Please try again.`
        );
        return;
      }

      if (searchQuery.page === 1) {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        totalPage = Math.ceil(data.totalHits / searchQuery.perPage);
      }

      const promise = new Promise(resolve => {
        resolve(renderMarkup(data.hits));
      });

      promise
        .then(value => {
          refs.galleryEl.insertAdjacentHTML(
            'beforeEnd',
            renderMarkup(data.hits)
          );
          searchQuery.page += 1;
        })
        .then(value => {
          lightbox.refresh();
          intreactiveLiteBox();

          observer.observe(document.querySelector('.photo-card'));
        })
        .catch(error => {
          console.log(error);
        });
    });
  } else {
    searchQuery.loadedAll = true;
    if (totalPage != 1) {
      Notiflix.Notify.info(
        `We're sorry, but you've reached the end of search results.`
      );
    }
  }
}

let observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadContent();
        return;
      }
      if (refs.galleryEl.childNodes.length) {
        observer.unobserve(entry.target);
        observer.observe(document.querySelector('.photo-card:last-child'));
        searchQuery.perPage = 40;
      }
    });
  },
  {
    threshold: 0,
  }
);
