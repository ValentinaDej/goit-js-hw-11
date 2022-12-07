const searchQuery = {
  url: 'https://pixabay.com/api/',
  key: '31094893-91e9afbe8165d9cedcce56644',
  q: null,
  imageType: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  perPage: 40,
  page: 1,
  loadedAll: false,

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

export { searchQuery };
