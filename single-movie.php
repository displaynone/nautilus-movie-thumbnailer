#!/usr/bin/php
<?php

require_once( __DIR__ . '/vendor/autoload.php');

use DiDom\Document;
use DiDom\Query;


define( 'REGEXP_TITLE', '/\/([^\/]*)\.(mp4|mpg|mkv|wmv|flv|avi)$/' );
define( 'CACHE_DIR', $_SERVER['HOME'] . '/.cache/thumbnails/large/' );

function get_url( $url ) {
	$agent= 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.0.3705; .NET CLR 1.1.4322)';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_VERBOSE, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_USERAGENT, $agent);
	curl_setopt($ch, CURLOPT_URL, $url);
	$result=curl_exec($ch);
	return $result;
}

function xpath_translate( $text ) {
	return "translate($text,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')";
}

function get_image( $movie_url ) {
	global $selected_file;

	$movie_link = 'https://www.themoviedb.org' . $movie_url;
	$document = new Document( get_url( $movie_link ) );

	$image = $document->find( 'img.poster.w-full' );

	$imageURL = $image[0]->attr( 'src' );
	echo "This is the image selected:\n$imageURL\n";
	$hash = md5( $selected_file );
	imagepng( imagecreatefromstring( file_get_contents( $imageURL ) ), CACHE_DIR . $hash . '.png' );
	readline( "Press enter to close" );
}

function search_title( $title ) {
	$document = new Document( get_url( "https://www.themoviedb.org/search?query=$title&language=en-US" ) );
	$movies = $document->find( "//div[contains(@class, 'movie')]//div[contains(@class, 'title')]//a[contains(@class, 'result')]", Query::TYPE_XPATH );

	if ( $movies ) {
		echo "These are the movies found in iMDb:\n\n";
		foreach ( array_slice( $movies, 0, 10 ) as $i => $movie ) {
			echo "- $i: " . trim( $movie->text() ) . "\n";
		}
		$option = readline( "Please, select one of the images for the file thumbnail [0-" . ( count( $movies ) - 1 ) . "] (Enter for manual search): " );

		if ( $option === '' ) {
			$new_title = readline( 'Enter movie title: ' );
			search_title( str_replace( ' ', '%20', $new_title ) );
		} else {
			// $page_link = $document->find( '.result_text a' );
			echo $movies[ $option ];
			$movie_url = $movies[ $option ]->attr( 'href' );
			echo "\n\n$movie_url\n\n";
			get_image( $movie_url );
		}
	}
}

$selected_file = trim( $_SERVER[ 'NAUTILUS_SCRIPT_SELECTED_URIS' ] );

echo $selected_file;
$ch = curl_init();

preg_match( REGEXP_TITLE, $selected_file, $m );
$title = strtolower( $m[ 1 ] );

search_title( $title );
