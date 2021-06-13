#!/usr/bin/php
<?php

require_once( __DIR__ . '/vendor/autoload.php');

use DiDom\Document;
use DiDom\Query;

define( 'REGEXP_TITLE', '/\/([^\/]*)\.(mp4|mpg|mkv|wmv|flv|avi)$/' );
define( 'CACHE_DIR', $_SERVER['HOME'] . '/.cache/thumbnails/large/' );

function xpath_translate( $text ) {
	return "translate($text,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')";
}

function get_image( $movie_url ) {
	global $selected_file;

	$movie_link = 'https://www.imdb.com' . $movie_url;
	$document = new Document( $movie_link, true);

	// New iMDb design
	$image = $document->find( 'img.ipc-image' );
	if ( empty( $image ) ) {
		// Previous design
		$image = $document->find( '.poster img' );
	}

	$imageURL = $image[0]->attr( 'src' );
	echo "This is the image selected:\n$imageURL\n";
	$hash = md5( $selected_file );
	imagepng( imagecreatefromstring( file_get_contents( $imageURL ) ), CACHE_DIR . $hash . '.png' );
	// readline( "Press enter to close" );
}

function search_title( $title ) {
	$document = new Document( "https://www.imdb.com/find?q=$title&s=tt&ref_=fn_al_tt_mr", true);
	// $movies = $document->find( "//tr[contains(@class, 'findResult')][.//td//*[contains(" . xpath_translate('text()') . ", \"$unescape_title\")]]", Query::TYPE_XPATH );
	$movies = $document->find( "//tr[contains(@class, 'findResult')][.//td]", Query::TYPE_XPATH );

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
			$page_link = $document->find( '.result_text a' );
			$movie_url = $page_link[ $option ]->attr( 'href' );
			get_image( $movie_url );
		}
	}
}

$selected_file = trim( $_SERVER[ 'NAUTILUS_SCRIPT_SELECTED_URIS' ] );

$ch = curl_init();

preg_match( REGEXP_TITLE, $selected_file, $m );
$title = strtolower( $m[ 1 ] );

search_title( $title );
