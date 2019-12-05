'use strict';

window.addEventListener('hashchange', handleRoute);
handleRoute();

function handleRoute() {
    let hash = window.location.hash;
    if (hash === '#list') {
        list();
    }
    if (hash.includes('#list-')) {
        details(hash.slice(6));
    }
    if (hash === '#search') {
        list(item => {
            let query = document.querySelector('#search').elements.query.value.toLowerCase();
            return item.filmName.toLowerCase().includes(query);
        });
    }
}

function list(cb) {
    fetch('app/html/card.html')
        .then(res => res.text())
        .then(card => {
            let movies = JSON.parse(localStorage.getItem('movies'));
            if (cb && movies) {
                movies = movies.filter(cb);
            }
            let tpl = _.template(card);
            if (movies) {
                document.querySelector('#content').innerHTML = movies.reduce((a, b) => a + tpl(b), '');
            }
        });
}

function details(id) {
    fetch('app/html/movie.html')
        .then(res => res.text())
        .then(card => {
            let movie = JSON.parse(localStorage.getItem(id));
            let tpl = _.template(card);
            let compile = tpl(movie);
            document.querySelector('#content').innerHTML = compile;
        });
}


