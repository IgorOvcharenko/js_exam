'use strict';

let movies = [];

if (localStorage.getItem('movies')) {
    movies = JSON.parse(localStorage.getItem('movies'));
}

class Movie {
    constructor(id, filmName, originalName, year, country, tagline, director, cast, imdbRating, summary, img) {
        this.id = id;
        this.filmName = filmName;
        this.originalName = originalName;
        this.year = year;
        this.country = country;
        this.tagline = tagline;
        this.director = director;
        this.cast = cast;
        this.imdbRating = imdbRating;
        this.summary = summary;
        this.staff = [];
        this.img = img;
        this.like = 0;
        this.dislike = 0;
    }
}

class MovieShortInfo {
    constructor(id, filmName, summary, imdbRating, img) {
        this.id = id;
        this.filmName = filmName;
        this.imdbRating = imdbRating;
        this.summary = summary;
        this.img = img;
    }
}

document.querySelector('#add-new').addEventListener('click', () => {
    let promise = createModal();
    promise.then(res => {
        document.body.appendChild(res);
        $('#addNewFilm').modal().on('hidden.bs.modal', ({ target: { parentElement } }) => {
            parentElement.remove();
        });
    });
});

async function createModal(id) {
    const $wrapper = document.createElement('div');
    $wrapper.className = 'wrapper';
    await fetch('app/html/add-new.html')
        .then(res => res.text())
        .then(text => {
            $wrapper.innerHTML += `<div class="modal fade" id="addNewFilm" tabindex="-1" role="dialog" aria-hidden="true">${text}</div>`;
        });
    const $modal = $wrapper.firstChild;
    handleModal($modal, id);
    return $wrapper;
}

function handleModal($modal, id) {
    let img = '';
    let count = 2;
    $modal.addEventListener('click', ({ target: { classList }, target }) => {
        const $infoFields = document.querySelectorAll('.additionalInfo');
        if (classList.contains('add') || target.closest('.add')) {
            const $newInfoField = $infoFields[0].cloneNode(true);
            $infoFields[0].parentElement.appendChild($newInfoField);
            const $staff = $newInfoField.querySelector('.staff');
            const $staffName = $newInfoField.querySelector('.staffName');
            $staff.setAttribute('name', `staff${count}`);
            $staffName.setAttribute('name', `staffName${count}`);
            count++;
            $staff.value = '';
            $staffName.value = '';
        }
        if ((classList.contains('remove') || target.closest('.remove')) && $infoFields.length > 1) {
            target.closest('.additionalInfo').remove();
        }
    });

    $modal.querySelector('#upload-poster').addEventListener('change', ({ target: { files } }) => {
        let reader = new FileReader();
        reader.onload = function () {
            img = reader.result;
        };
        reader.readAsDataURL(files[0]);
    });


    $modal.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();
        let elements = e.target.elements;
        let castValue = elements.cast.value;
        let regExp = /^([a-я-. ]+,)+[а-я-. ]+$/i;
        if (regExp.test(castValue)) {
            saveMovie(elements, img, id);
            $('#addNewFilm').modal('hide');
            location.hash = '';
            location.hash = '#list';
        } else {
            alert('Пожалуйста, указывая более одного значения, используйте запятую для разделения значений!');
        }
    });
}

function saveMovie(elements, img, id) {
    let {
        filmName: { value: filmName },
        originalName: { value: originalName },
        year: { value: year },
        country: { value: country },
        tagline: { value: tagline },
        director: { value: director },
        cast: { value: cast },
        imdbRating: { value: imdbRating },
        summary: { value: summary },
    } = elements;
    let actorsArr = cast.replace(/,\s+/, ',').trim().split(',');
    let movie = new Movie(id || Date.now(), filmName, originalName, year, country, tagline, director, actorsArr, imdbRating, summary, img);
    let movieShortInfo = new MovieShortInfo(movie.id, filmName, summary, imdbRating, img);
    let addInfo = document.querySelectorAll('.additionalInfo');
    Array.prototype.forEach.call(addInfo, item => {
        const $staff = item.querySelector('.staff');
        const $staffName = item.querySelector('.staffName');
        movie.staff.push({
            staff: $staff.value,
            staffName: $staffName.value
        });
    });

    localStorage.setItem(movie.id, JSON.stringify(movie));
    if (id) {
        let index = movies.findIndex(item => item.id === id);
        movies.splice(index, 1, movieShortInfo);
        localStorage.setItem('movies', JSON.stringify(movies));
    }
    else {
        movies.push(movieShortInfo);
        localStorage.setItem('movies', JSON.stringify(movies));
    }
}

document.querySelector('#search').addEventListener('submit', e => {
    e.preventDefault();
    location.hash = '';
    location.hash = '#search';
});

document.querySelector('#content').addEventListener('click', ({ target: { classList }, target }) => {
    if (classList.contains('edit') || target.closest('.edit')) {
        handleEditEvent(target);
    }
    if (classList.contains('remove') || target.closest('.remove')) {
        handleRemoveEvent(target);
    }
    if (classList.contains('like') || target.closest('.like')) {
        likesCounter('like');
    }
    if (classList.contains('dislike') || target.closest('.dislike')) {
        likesCounter('dislike');
    }
});

function likesCounter(className) {
    const id = +location.hash.slice(6);
    const movie = JSON.parse(localStorage.getItem(id));
    document.querySelector(`button.${className}`).setAttribute('data-count', ++movie[className]);
    localStorage.setItem(id, JSON.stringify(movie));
}

function handleRemoveEvent(target) {
    let isRemove = confirm('Would you like to remove this movie?');
    if (isRemove) {
        const $cardNode = target.closest('.card');
        const id = +$cardNode.querySelector('.details > a').getAttribute('href').slice(6);
        localStorage.removeItem(id);
        let index = movies.findIndex(item => item.id === id);
        movies.splice(index, 1);
        localStorage.setItem('movies', JSON.stringify(movies));
        location.hash = '';
        location.hash = '#list';
    }
}

function handleEditEvent(target) {
    const id = +target.closest('.card').querySelector('.details > a').getAttribute('href').slice(6);
    window.location.hash = `${id}-edit`;
    let promise = createModal(id);
    promise.then(res => {
        const $modal = document.body.appendChild(res);
        const $form = $modal.querySelector('form');
        const movie = JSON.parse(localStorage.getItem(id));
        for (let prop in movie) {
            if (prop === 'id' || prop === 'img' || prop === 'like' || prop === 'dislike') {
                continue;
            }
            else if (prop === 'staff') {
                let addInfo = $form.querySelectorAll('.additionalInfo');
                let container = $form.querySelector('.addSet');
                movie[prop].forEach((item, index) => {
                    if (index >= addInfo.length) {
                        let $newItem = addInfo[0].cloneNode(true);
                        container.appendChild($newItem);
                        $newItem.querySelector('.staff').value = item['staff'];
                        $newItem.querySelector('.staffName').value = item['staffName'];
                    } else {
                        $form.querySelector('.additionalInfo .staff').value = item['staff'];
                        $form.querySelector('.additionalInfo .staffName').value = item['staffName'];
                    }
                });
            }
            else {
                $form.querySelector(`#${prop}`).value = movie[prop];
            }
        }
        $('#addNewFilm').modal().on('hidden.bs.modal', ({ target: { parentElement } }) => {
            parentElement.remove();
            window.location.hash = '#list';
        });
    });
}









