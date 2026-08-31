import { useSavedTopics } from '../SavedTopics';

export const TopicList = () => {
	const { savedTopics, deleteTopic } = useSavedTopics();

	if (savedTopics.length === 0) return null;

	return (
		<div className="container max-w-5xl mx-auto">
			<h4 className="text-md font-black text-center mb-8">Your saved topics</h4>
			<ul className="space-y-4">
				{savedTopics.map((topic: string) => {
					return (
						// Keyed by the topic itself: with an index, deleting one shifts every
						// key after it and React reuses the wrong rows.
						<li key={topic} className="flex items-center gap-x-2">
							<p>- {topic}</p>
							<button onClick={() => deleteTopic(topic)}>❌</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
};
