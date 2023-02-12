import { useEffect, useState } from 'react';
import eventBus from '../EventBus';

export const TopicList = () => {
	const [savedTopics, setSavedTopics] = useState<string[]>([]);

	useEffect(() => {
		eventBus.on('updateTopics', (data: string) => {
			setSavedTopics(current => [...current, data]);
		});

		const topics = JSON.parse(localStorage.getItem('topics')!);
		if (topics) setSavedTopics(topics);

		return () => {
			eventBus.remove('updateTopics');
		};
	}, []);

	useEffect(() => {
		if (savedTopics.length > 0) localStorage.setItem('topics', JSON.stringify(savedTopics));
	}, [savedTopics]);

	function handleTopicDelete(topic: string) {
		setSavedTopics(prevTopics => {
			return prevTopics.filter(prevTopic => prevTopic !== topic);
		});
	}

	return (
		<>
			{savedTopics.length ? (
				<div>
					<h4>Saved topics</h4>
					<ul>
						{savedTopics.map((topic: string, idx: number) => {
							return (
								<li key={idx}>
									<p>
										{topic}
										<button onClick={() => handleTopicDelete(topic)}>❌</button>
									</p>
								</li>
							);
						})}
					</ul>
				</div>
			) : null}
		</>
	);
};
