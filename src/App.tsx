import { useQuery } from '@tanstack/react-query';
import { Spinner } from './components/Spinner';

function App() {
	async function getPost() {
		const res = await fetch('https://www.reddit.com/r/Showerthoughts/random.json');
		const json = await res.json();
		return json;
	}

	const {
		isFetching,
		data: topic,
		isError,
		refetch,
	} = useQuery({
		queryKey: ['topic'],
		queryFn: getPost,
		refetchOnWindowFocus: false,
		enabled: false,
	});

	return (
		<main>
			<h1>Rapid Topic</h1>
			<button onClick={() => refetch()}>get random topic</button>
			{topic ? <p>{topic[0].data.children[0].data.title}</p> : null}
		</main>
	);
}

export default App;
