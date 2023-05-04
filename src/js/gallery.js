import createGalleryCards from "../tamplates/gallery-card.hbs";
import { PixabayAPI } from "./pixabayAPI";

import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const galleryEl = document.querySelector('.gallery');
const pixabayAPI = new PixabayAPI();

const searchFormEl = document.querySelector('.search-form');
const btnEl = document.querySelector('.load-more');
searchFormEl.addEventListener('submit', onSearchForm);

const perPage = 40;
let totalPage = 0;
let page = 1;
let gallery = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,  
});


/* Пошук по запиту */

async function onSearchForm(event) {
    event.preventDefault();
    const searchQuery = event.currentTarget.elements["searchQuery"].value.trim();
    console.dir(searchQuery);
    btnEl.classList.add('is-hidden');
    pixabayAPI.query = searchQuery;
    if (!searchQuery) {
        galleryEl.innerHTML = '';
        return Notiflix.Notify.warning('Empty request!!!', 'fill in the request field!')
    }
    galleryEl.innerHTML = '';
    page = 1;
    try {   
        const respons = await pixabayAPI.getPhotoByQuery(page,perPage);
        console.log(respons);
        if (respons.data.hits.length === 0) {
            Notiflix.Notify.info("Sorry, there are no images matching your search query. Please try again.");
        } else {
            Notiflix.Notify.info(`Hooray! We found ${respons.data.totalHits} images.`);
        };
        if (respons.data.hits.length < perPage) {
            galleryEl.insertAdjacentHTML('beforeend', createGalleryCards(respons.data.hits));
            gallery.refresh();
            return 
        } 
        totalPage = Math.ceil(respons.data.totalHits / perPage);
        console.log(totalPage);
        galleryEl.insertAdjacentHTML('beforeend', createGalleryCards(respons.data.hits)); 
        gallery.refresh();
        btnEl.classList.remove('is-hidden');
    } catch(error) {
        console.log(error)
    }
}

btnEl.addEventListener('click', loadMore);
async function loadMore() {
    page += 1;
        const respons = await pixabayAPI.getPhotoByQuery(page);
        galleryEl.insertAdjacentHTML('beforeend', createGalleryCards(respons.data.hits));
        gallery.refresh();
        console.log(page, totalPage);
        if (page === totalPage) {
            Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
            btnEl.classList.add('is-hidden');
            return;
        }
};
