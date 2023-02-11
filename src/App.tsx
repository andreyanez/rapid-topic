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
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['topic'],
		queryFn: getPost,
		refetchOnWindowFocus: false,
	});

	if (isLoading || isFetching) {
		return (
			<main>
				<h1>Rapid Topic</h1>
				<button onClick={() => refetch()}>Get new topic</button>
				<Spinner />
			</main>
		);
	}

	return (
		<main>
			<h1>Rapid Topic</h1>
			<button onClick={() => refetch()}>Get new topic</button>
			<h2>{topic[0].data.children[0].data.title}</h2>
			{topic[0].data.children[0].data.selftext.length > 0 ? (
				<p>{topic[0].data.children[0].data.selftext}</p>
			) : null}
		</main>
	);
}

export default App;
