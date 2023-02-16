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

	if (savedTopics.length > 0) localStorage.setItem('topics', JSON.stringify(savedTopics));

	function handleTopicDelete(topic: string) {
		setSavedTopics(prevTopics => {
			return prevTopics.filter(prevTopic => prevTopic !== topic);
		});
	}

	return (
		<>
			{savedTopics.length ? (
				<div className="container max-w-5xl mx-auto">
					<h4 className="text-md font-black text-center mb-8">Your saved topics</h4>
					<ul className="space-y-4">
						{savedTopics.map((topic: string, idx: number) => {
							return (
								<li key={idx} className="flex items-center gap-x-2">
									<p>- {topic}</p>
									<button onClick={() => handleTopicDelete(topic)}>❌</button>
								</li>
							);
						})}
					</ul>
				</div>
			) : null}
		</>
	);
};
