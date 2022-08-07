+++
title = "list"
description = "a list of lists you could practically use against me."

[extra]
no_header = true
+++

a list of lists you could practically use against me.

## Book Recommendations

<div id="book_recs">Loading...</div>

## Favourite Movies

off the top of my head.

<div id="fav_movies">Loading...</div>

## Most Played Music

updated monthly.

<div id="most_played_music">Loading...</div>

<script>
    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var book_recs_remarks = JSON.parse(xhttp.responseText).book_recs_remarks;
            var book_recs = JSON.parse(xhttp.responseText).book_recs;
            var fav_movies = JSON.parse(xhttp.responseText).fav_movies;
            var most_played_music = JSON.parse(xhttp.responseText).most_played_music;

            // book recommendations
            var elem = '<div class="gallery" align="center">';
            for (i in book_recs) {
                var book = book_recs[i];
                // elem += '<p><strong>Name: </strong>' + book.name + '</p><br>';
                // elem += '<p><strong>Author: </strong>' + book.author + '</p><br>';
                elem += '<img src="' + book.src + '" width="200" height="300" style="margin: 5px;">';
            }
            elem += '<br><p><strong>Remarks:</strong> ' + book_recs_remarks  + '</p>';
            document.getElementById('book_recs').innerHTML = elem;

            // favourite movies
            var elem = '<div class="gallery" align="center">';
            for (i in fav_movies) {
                var movie = fav_movies[i];
                elem += '<img src="' + movie.poster + '" width="200" height="300" style="margin: 5px;">';
            }
            document.getElementById('fav_movies').innerHTML = elem;

            // most played music
            var elem = '';
            for (i in most_played_music) {
                var music = most_played_music[i];
                elem += music;
            }
            document.getElementById('most_played_music').innerHTML = elem;            
        }
    };

    xhttp.open("GET", "https://api.mufeedvh.com/list", true);
    xhttp.send();    
</script>