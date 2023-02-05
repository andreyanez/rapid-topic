import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Spinner } from './components/Spinner';

function App() {
	const [savedTopics, setSavedTopics] = useState<string[]>([]);

	function handleClick(topicData: any): void {
		const title = topicData.title;
		const body = topicData.selftext;
		const newTopic = title.concat(' ', body);

		if (savedTopics.includes(newTopic)) return;

		setSavedTopics(current => [...current, newTopic]);
	}

	function handleDelete() {
		localStorage.removeItem('topics');
		setSavedTopics([]);
	}

	async function getPost() {
		const res = await fetch('https://www.reddit.com/r/Showerthoughts/random.json');
		const json = await res.json();
		return json;
	}

	useEffect(() => {
		const topics = JSON.parse(localStorage.getItem('topics')!);
		if (topics) setSavedTopics(topics);
	}, []);

	useEffect(() => {
		if (savedTopics.length > 0) localStorage.setItem('topics', JSON.stringify(savedTopics));
	}, [savedTopics]);

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
				{savedTopics.length ? (
					<div>
						<h4>Saved topics</h4>
						<ul>
							{savedTopics.map((topic: string, idx: number) => {
								return <li key={idx}>{topic}</li>;
							})}
						</ul>
						<button onClick={handleDelete}>Delete saved topics</button>
					</div>
				) : null}
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
			<div>
				<button onClick={() => handleClick(topic[0].data.children[0].data)}>Save topic</button>
			</div>
			{savedTopics.length ? (
				<div>
					<h4>Saved topics</h4>
					<ul>
						{savedTopics.map((topic: string, idx: number) => {
							return <li key={idx}>{topic}</li>;
						})}
					</ul>
					<button onClick={handleDelete}>Delete saved topics</button>
				</div>
			) : null}
		</main>
	);
}

export default App;
