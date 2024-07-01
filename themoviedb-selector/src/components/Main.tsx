import { ReactNode, useCallback, useEffect, useState } from 'react';
import { TmdbIcon } from './icons/TmdbIcon';
import { RightIcon } from './icons/RightIcon';
import { LeftIcon } from './icons/LeftIcon';
import { createElement } from '../utils/createElement';
import MovieList from './MovieList';
import CryptoJS from 'crypto-js';

const TMDB_URL = 'https://www.themoviedb.org';

const md5 = (string: string) => {
	return CryptoJS.MD5(string).toString(CryptoJS.enc.Hex);
};

export type Movie = {
	link: string;
	title: string;
	poster: string;
};

const Main: React.FC = () => {
	const [rawFiles, setRawFiles] = useState<string[]>([]);
	const [files, setFiles] = useState<string[]>([]);
	const [index, setIndex] = useState<number>();
	const [loading, setLoading] = useState(true);
	const [movies, setMovies] = useState<Movie[]>([]);
	const [notification, setNotification] = useState<ReactNode>();

	useEffect(() => {
		if (window.electron && window.electron.receiveCliArgs) {
			window.electron.receiveCliArgs((args: string) => {
				const argFiles = args.split('|').filter((item) => item);
				setRawFiles(argFiles);
				setFiles(
					argFiles.map((file) =>
						unescape(file.replace(/.*\/([^/]+)\..*/, '$1')),
					),
				);
			});
		}
	}, []);

	const getImages = useCallback(() => {
		const fetchData = async () => {
			try {
				const html = await window.api.fetchData(
					`${TMDB_URL}/search?query=${files[index]}&language=en-US`,
				);
				const body = html.replace(/\n/g, '').match(/<body.[^>]+>(.*)<\/body>/);
				const content = createElement(body[0]);
				const cards = content.querySelectorAll('.movie .card');
				const listMovies: Movie[] = [];
				cards.forEach((card) => {
					const link = card.querySelector('.title a.result') as HTMLLinkElement;
					const image = card.querySelector('img');
					listMovies.push({
						title: link.innerText,
						link: TMDB_URL + link.getAttribute('href'),
						poster: image?.getAttribute('src'),
					});
				});
				setMovies(listMovies);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
	}, [files, index]);

	useEffect(() => {
		if (index !== undefined) {
			setLoading(true);
			getImages();
		}
	}, [getImages, index]);

	useEffect(() => {
		if (files.length && index === undefined) {
			setIndex(0);
		}
	}, [files.length, index]);

	const Loading = (
		<div>
			<h1 className="text-xl font-bold text-center">Loading data...</h1>
			<div className="p-8 flex justify-center align-middle">
				<span className="loading loading-spinner text-info"></span>
			</div>
		</div>
	);

	const handleDownloadImage = async (url: string) => {
		console.log({ rawFiles });
		console.log({ rawFile: rawFiles[index] });
		const fileName = md5(rawFiles[index]);
		try {
			const result = await window.electron.downloadImage(url, fileName);
			if (result.success) {
				setNotification(
					<div className="alert alert-info">
						<span>Thumbnail updated</span>
					</div>,
				);
			} else {
				setNotification(
					<div className="alert alert-error">
						<span>Error while updating the thumbnail</span>
					</div>,
				);
			}
		} catch (error) {
			console.error('Error:', error);
			setNotification(
				<div className="alert alert-error">
					<span>Error while downloading the poster</span>
				</div>,
			);
		}
		setTimeout(() => setNotification(undefined), 3000);
	};

	if (!files.length) {
		return <>{Loading}</>;
	}

	return (
		<div data-theme="night" className="p-4 flex flex-col gap-12">
			<div>
				<TmdbIcon />
			</div>
			<div className="flex flex-row justify-between items-center">
				<button
					className="btn btn-primary btn-outline"
					disabled={index === 0}
					onClick={() => {
						if (index) {
							setIndex(index - 1);
						}
					}}
				>
					<LeftIcon />
				</button>
				<p className="text-2xl">{files[index]}</p>
				<button
					className="btn btn-primary btn-outline"
					disabled={index === files.length - 1}
					onClick={() => {
						if (index < files.length - 1) {
							setIndex(index + 1);
						}
					}}
				>
					<RightIcon />
				</button>
			</div>
			{loading && Loading}
			{!loading && (
				<>
					<h2 className="text-3xl">List of movies</h2>
					<MovieList
						movies={movies}
						onSelectThumb={(url: string) => handleDownloadImage(url)}
					/>
				</>
			)}
			{!!notification && (
				<div className="toast toast-center">{notification}</div>
			)}
		</div>
	);
};

export default Main;
