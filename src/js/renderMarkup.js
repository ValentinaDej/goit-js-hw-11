export default function renderMurkup(imgArray = []) {
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

      return `<div class="photo-card">
      <a href="${largeImageURL}">
      <img class="preview-image" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
       <div class="info">
        <p class="info-item">
        <b>Likes: </b>${likes}</p>
        <p class="info-item">
        <b>Views: </b>${views}</p>
        <p class="info-item">
        <b>Comments: </b>${comments}</p>
        <p class="info-item">
        <b>Downloads: </b>${downloads}</p>
        </div>
      </div>`;
    })
    .join('');
  return markup;
}
