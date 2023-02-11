import React, { useEffect, useState } from 'react';

export const TopicList = () => {
	const [savedTopics, setSavedTopics] = useState<string[]>([]);

	useEffect(() => {
		const topics = JSON.parse(localStorage.getItem('topics')!);
		if (topics) setSavedTopics(topics);
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
