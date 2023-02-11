import { useEffect, useState } from 'react';

function App() {
	const [topic, setTopic] = useState('');

	function getPost() {
		fetch('https://www.reddit.com/r/Showerthoughts/random.json')
			.then(res => res.json())
			.then(data => setTopic(data[0].data.children[0].data.title));
	}

	return (
		<main>
			<h1>Random convo topic</h1>
			<button onClick={getPost}>get topic</button>
			{topic && <p>{topic}</p>}
		</main>
	);
}

export default App;
