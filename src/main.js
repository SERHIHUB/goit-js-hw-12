import axios from 'axios';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const input = document.querySelector('.input');
const fetchBtn = document.querySelector('.btn');
const loadBtn = document.querySelector('.load-btn');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.spinner');

const newGallery = new SimpleLightbox('.gallery a');

const API_KEY = '41458722-788aa599ff2a579d31eb49587';

let tagPhoto;
let page;
let totalItems;
let totalPages;
const limit = 40;

const url = new URL('https://pixabay.com/api/');
url.searchParams.append('key', `${API_KEY}`);
url.searchParams.append('image_type', 'photo');
url.searchParams.append('orientation', 'horizontal');
url.searchParams.append('safesearch', 'true');
url.searchParams.append('per_page', limit);

input.addEventListener('input', event => {
  tagPhoto = event.target.value;
});

const fetchPhotos = async () => {
  url.searchParams.delete('q');
  url.searchParams.append('q', tagPhoto);
  url.searchParams.delete('page');
  url.searchParams.append('page', page);
  const photos = await axios.get(url);

  return photos.data;
};

form.addEventListener('submit', event => {
  event.preventDefault();
  loader.classList.add('loader');
  page = 1;
  gallery.innerHTML = '';

  fetchPhotos()
    .then(response => {
      if (response.total === 0) {
        iziError();
      }
      totalItems = response.totalHits;
      totalPages = Math.ceil(totalItems / limit);
      addPic(response.hits);
      newGallery.refresh();
      loadBtn.style.display = 'block';
    })
    .catch(error => {
      iziError();
    })
    .finally(() => {
      form.reset();
      loader.classList.remove('loader');
    });
});

loadBtn.addEventListener('click', event => {
  event.preventDefault();

  page += 1;

  fetchPhotos()
    .then(response => {
      if (page >= totalPages) {
        loadBtn.style.display = 'none';
        iziToast.info({
          message: `We're sorry, but you've reached the end of search results.`,
          position: 'topRight',
        });
      }
      addPic(response.hits);
      newGallery.refresh();
      window.scrollBy({
        top: 540,
        behavior: 'smooth',
      });
    })
    .catch(error => {
      iziError();
    })
    .finally(() => {
      form.reset();
      loader.classList.remove('loader');
    });
});

function addPic(arr) {
  gallery.insertAdjacentHTML(
    'beforeend',
    arr.reduce(
      (
        html,
        { largeImageURL, webformatURL, likes, views, comments, downloads }
      ) =>
        html +
        `<li class="gallery-item">
          <a href="${largeImageURL}">
            <div class="pic-item">
              <img src="${webformatURL}" alt="photo">
            </div>
            <ul class="information-list">
              <li class="information-item">likes<br>${likes}</li>
              <li class="information-item">views<br>${views}</li>
              <li class="information-item">comments<br>${comments}</li>
              <li class="information-item">downloads<br>${downloads}</li>
            </ul>
          </a>
        </li>`,
      ''
    )
  );
}

function iziError() {
  iziToast.error({
    message:
      'Sorry, there are no images matching your search query. Please try again!',
    position: 'topRight',
  });
}
