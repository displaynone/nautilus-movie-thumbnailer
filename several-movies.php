#!/usr/bin/php
<?php

require_once('vendor/autoload.php');

use DiDom\Document;

define( 'REGEXP_FILES', '/\.(mp4|mpg|mkv|wmv|flv|avi)$/' );
define( 'REGEXP_TITLE', '/\/([^\/]*)\.(mp4|mpg|mkv|wmv|flv|avi)$/' );
define( 'CACHE_DIR', $_SERVER['HOME'] . '/.cache/thumbnails/large/' );

function get_imdb_thumbnail( $title, $hash ) {
	$ch = curl_init();

	$document = new Document( "https://www.imdb.com/find?q=$title&s=tt&ref_=fn_al_tt_mr", true);
	$images = $document->find( '.primary_photo img' );

	$imageURL = $images[0]->attr( 'src' );
	$imageURL = preg_replace( '/@\..*$/', '@._V1_SX300.jpg', $imageURL );

	imagepng( imagecreatefromstring( file_get_contents( $imageURL ) ), CACHE_DIR . $hash . '.png' );
}

$files = explode( "\n", $_SERVER[ 'NAUTILUS_SCRIPT_SELECTED_URIS' ] );
foreach ( $files as $file ) {
	if ( preg_match( REGEXP_FILES, $file ) ) {
		$hash = md5( $file );
		preg_match( REGEXP_TITLE, $file, $m );
		$title = strtolower( $m[ 1 ] );
		echo str_replace( '%20', ' ',$title ) . "\n";
		get_imdb_thumbnail( $title, $hash );
		// Need to avoid imdb banning
		sleep( 10 );
	}
}
