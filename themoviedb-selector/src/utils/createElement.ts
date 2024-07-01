export const createElement = (html: string) => {
	const elem = document.createElement('div');
	elem.innerHTML = html;
	return elem;
};
