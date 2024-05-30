#!/usr/bin/php
<?php

define( 'CACHE_DIR', $_SERVER['HOME'] . '/.cache/thumbnails/large/' );

function durationToSeconds($duration) {
	list($hours, $minutes, $seconds) = sscanf($duration, "%d:%d:%f");
	return $hours * 3600 + $minutes * 60 + $seconds;
}

function secondsToDuration($seconds) {
	$hours = floor($seconds / 3600);
	$seconds %= 3600;
	$minutes = floor($seconds / 60);
	$seconds %= 60;
	echo "\n\nTIME: $hours, $minutes, $seconds";
	return sprintf("%02d:%02d:%05.2f", $hours, $minutes, $seconds);
}

function get_file_path( $file_path ) {
	// In case of samba file, it replaces the path for the "local" one
	return preg_replace('#smb://([^/]+)/#', '/run/user/1000/gvfs/smb-share:server=$1,share=', $file_path);
}

function update_thumb( $file_path ) {
	// ffmpeg -i input.mp4 -ss 00:00:01.000 -vframes 1 output.png
	$inputFile = get_file_path($file_path);
	$command = "ffmpeg -i $inputFile 2>&1 | grep 'Duration'";
	$output = shell_exec($command);
	if (preg_match('/Duration: (\d{2}:\d{2}:\d{2}\.\d{2})/', $output, $matches)) {
		$duration = $matches[1];
		// echo "Duration: $duration";
		$totalSeconds = durationToSeconds($duration);
		$frameSeconds = intval($totalSeconds * 0.1);
		// echo "\n\nframeSeconds = $frameSeconds\n\n";
		$halfDuration = secondsToDuration($frameSeconds);
	}
	echo $output . "\n";
	$hash = md5( $file_path );
	$outputFile = CACHE_DIR . $hash . '.png' ;
	$startTime = $halfDuration;
	$frames = 1;

	$command = "ffmpeg -i $inputFile -ss $startTime -vframes $frames -y $outputFile > /dev/null 2>&1";
	// echo $command . "\n";
	exec($command, $output, $returnVar);

	if ($returnVar === 0) {
		echo "Thumbnail created successfully: $outputFile";
	} else {
		echo "Error creating thumbnail.";
		print_r($output);
	}
}

$files = explode( "\n", $_SERVER[ 'NAUTILUS_SCRIPT_SELECTED_URIS' ] );

foreach ( $files as $file ) {
	echo $file."\n";
	update_thumb( $file );
}
