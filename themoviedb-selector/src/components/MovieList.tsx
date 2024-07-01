import { useState } from 'react';
import { Movie } from './Main';
import ThumbList from './ThumbList';

type ListProps = {
	movies: Movie[];
	onSelectThumb: (url: string) => void;
};

const MovieList: React.FC<ListProps> = ({ movies, onSelectThumb }) => {
	const [selected, setSelected] = useState<Movie>();
	if (selected) {
		return <ThumbList movie={selected} onSelectThumb={onSelectThumb} />;
	}

	return (
		<div className="grid grid-cols-2 gap-4 bg-base-200 p-4">
			{movies &&
				movies.map((movie, index) => (
					<div
						className="card card-side shadow-xl bg-neutral cursor-pointer"
						onClick={() => setSelected(movie)}
						key={index}
					>
						<figure className="w-[90px] h-[135px]">
							<img className="w-[90px]" src={movie.poster} />
						</figure>
						<div className="card-body w-[calc(100%_-_90px)]">
							<h2 className="truncate text-md">{movie.title}</h2>
						</div>
					</div>
				))}
		</div>
	);
};

export default MovieList;
