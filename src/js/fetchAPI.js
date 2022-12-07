import axios from 'axios';
import Notiflix from 'notiflix';
import 'notiflix/dist/notiflix-3.2.5.min.css';

Notiflix.Notify.init({
  timeout: 2000,
});

export default async function getApi(url) {
  try {
    const response = await axios.get(url);

    if (response.data.totalHits <= 0) {
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
      return;
    }

    return {
      imgInfo: response.data.hits,
      totalHits: response.data.totalHits,
    };
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
}
