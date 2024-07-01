import { useCallback, useEffect, useState } from 'react';
import { createElement } from '../utils/createElement';
import { Movie } from './Main';

type ThumbListProps = {
	movie: Movie;
	onSelectThumb: (url: string) => void;
};

const ThumbList: React.FC<ThumbListProps> = ({ movie, onSelectThumb }) => {
	const [thumbs, setThumbs] = useState<string[]>([]);

	const getImages = useCallback(() => {
		const fetchData = async () => {
			try {
				const html = await window.api.fetchData(
					movie.link.replace('?', '/images/posters?'),
				);
				const body = html.replace(/\n/g, '').match(/<body.[^>]+>(.*)<\/body>/);
				const content = createElement(body[0]);
				const images = content.querySelectorAll('.posters img.poster');
				setThumbs(
					Array.from(images).map(
						(image) => image.getAttribute('srcset')?.split(' ')?.[2],
					),
				);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
	}, [movie.link]);

	useEffect(() => {
		if (!thumbs.length) {
			getImages();
		}
	}, [getImages, thumbs.length]);

	return (
		<div className="grid grid-cols-2 gap-4 bg-base-200 p-4">
			{thumbs &&
				thumbs.map((thumb, index) => (
					<div
						className="cursor-pointer"
						onClick={() => onSelectThumb(thumb)}
						key={index}
					>
						<img src={thumb} className="rounded" />
					</div>
				))}
		</div>
	);
};

export default ThumbList;
