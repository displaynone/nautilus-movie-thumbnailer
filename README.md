# Nautilus Movie Thumbnailer

This scripts allow to generate thumbnails for video files related to movies.

It uses iMDb to get search for the title and get the poster of the movie.

## Scripts

There are 2 scripts:

- `several-movies.php`: it loads the first movie found depending on the file name.
- `single-movie.php`: it searchs for the title in iMDb, then list 10 results and after selecting the match, it loads the poster. In case the film is not listed, it allows the user to search for it manually.

## Install

- Download or clone this repository
- Set both scripts as executable

```bash
chmod +x several-movies.php
chmod +x single-movie.php
```

- Go to this folder in your `$HOME`
```bash
cd ~/.local/share/nautilus/scripts
```
- Create 2 scripts in that folder, one for each script:

`several-movies`
```bash
#!/bin/bash

gnome-terminal -- "/[full-path-to-the-project]/nautilus-movie-thumbnailer/several-movies.php"
```

`single-movie`
```bash
#!/bin/bash

gnome-terminal -- "/[full-path-to-the-project]/nautilus-movie-thumbnailer/single-movie.php"
```

- Set the scripts as executable:
```bash
chmod +x several-movies
chmod +x single-movie
```
