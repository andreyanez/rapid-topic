import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from './Spinner';
import { useSavedTopics } from '../SavedTopics';
import eventBus from '../EventBus';

/**
 * Topics come from public/topics.json, refreshed nightly by
 * scripts/harvest-topics.mjs. We can't call Reddit from the browser anymore:
 * the *.json endpoints dropped their CORS headers and now reject
 * unauthenticated requests outright.
 */
const TOPICS_URL = '/topics.json';

type TopicEntry = {
	id: string;
	title: string;
	url: string;
	author: string | null;
};

type TopicPool = {
	updated: string;
	count: number;
	topics: TopicEntry[];
};

async function getTopicPool(): Promise<TopicPool> {
	const res = await fetch(TOPICS_URL);
	if (!res.ok) throw new Error(`Could not load topics (${res.status})`);
	return res.json();
}

// Picks a random slot, never handing back the one already on screen.
function pickIndex(poolSize: number, current: number | null): number {
	if (poolSize <= 1) return 0;

	let next = Math.floor(Math.random() * poolSize);
	while (next === current) next = Math.floor(Math.random() * poolSize);
	return next;
}

export const Topic = () => {
	const { saveTopic } = useSavedTopics();
	const [index, setIndex] = useState<number | null>(null);

	// Lets the event listener read the current pool without resubscribing.
	const poolRef = useRef<TopicEntry[]>([]);

	const {
		data: pool,
		isError,
		isLoading,
	} = useQuery({
		queryKey: ['topics'],
		queryFn: getTopicPool,
		// The pool is a static asset, so it only changes on redeploy.
		staleTime: Infinity,
		refetchOnWindowFocus: false,
	});

	// Show a first topic as soon as the pool lands, then keep the ref current.
	useEffect(() => {
		poolRef.current = pool?.topics ?? [];
		if (poolRef.current.length === 0) return;

		setIndex(current => (current === null ? pickIndex(poolRef.current.length, null) : current));
	}, [pool]);

	useEffect(() => {
		// Event bus listens to "Get Topic" event and swaps in another topic
		return eventBus.on('fetchTopic', () => {
			setIndex(current => pickIndex(poolRef.current.length, current));
		});
	}, []);

	if (isLoading) {
		return <Spinner />;
	}

	if (isError) {
		return <p className="text-center">There was an error. Please try again.</p>;
	}

	const topic = index === null ? null : pool?.topics[index];

	if (!topic) {
		return <p className="text-center">No topics available yet.</p>;
	}

	return (
		<section className="mb-8 text-center max-w-5xl mx-auto">
			<div className="mb-8 md:mb-12">
				<h2 className="mb-4 font-semibold text-xl">{topic.title}</h2>
				<a
					href={topic.url}
					target="_blank"
					rel="noreferrer"
					className="text-sm text-gray-500 underline"
				>
					{topic.author ? `posted by ${topic.author} on r/Showerthoughts` : 'view on r/Showerthoughts'}
				</a>
			</div>
			<button
				className="inline-block text-white  rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] focus:outline-none focus:ring active:text-opacity-75"
				onClick={() => saveTopic(topic.title)}
			>
				<span className="block rounded-full px-8 py-3 text-sm font-medium hover:bg-transparent">
					Save topic
				</span>
			</button>
		</section>
	);
};
