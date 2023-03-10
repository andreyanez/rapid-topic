import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from './Spinner';
import eventBus from '../EventBus';

const REDDIT_URL = 'https://www.reddit.com/r/Showerthoughts/random.json';

export const Topic = () => {
	const [savedTopics, setSavedTopics] = useState<string[]>([]);

	// Finds a random post
	async function getPost() {
		const res = await fetch(REDDIT_URL);
		const json = await res.json();
		return json;
	}

	function handleSave(topicData: any): void {
		// concatenates the title and body of the post
		const title = topicData.title;
		const body = topicData.selftext;
		const newTopic = title.concat(' ', body);

		//if topic already exists on saved topics, don't save it again.
		if (savedTopics.includes(newTopic)) return;

		// saves it to the topics array
		setSavedTopics(current => [...current, newTopic]);

		//dispatch event so topic list adds the new topic
		eventBus.dispatch('updateTopics', newTopic);
	}

	useEffect(() => {
		// Event bus listents to "Get Topic" event and fetches new topic
		eventBus.on('fetchTopic', () => {
			refetch();
		});

		// get localstorage array and set it to the state
		const topics = JSON.parse(localStorage.getItem('topics')!);
		if (topics) setSavedTopics(topics);

		// cleanup
		return () => {
			eventBus.remove('fetchTopic');
		};
	}, []);

	// sets the updated topics list to localstorage
	if (savedTopics.length > 0) localStorage.setItem('topics', JSON.stringify(savedTopics));

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
		// checks if upvote count is > 250, if not it refetches
		onSuccess(topic) {
			let upVoteCount = topic[0].data.children[0].data.score;
			if (upVoteCount < 250) refetch();
		},
	});

	if (isLoading || isFetching) {
		return <Spinner />;
	}

	if (isError) {
		return <p>There was an error. Please try again.</p>;
	}

	return (
		<section className="mb-8 text-center max-w-5xl mx-auto">
			<div className="mb-8 md:mb-12">
				<h2 className="mb-4 font-semibold text-xl">{topic[0].data.children[0].data.title}.</h2>
				{topic[0].data.children[0].data.selftext.length > 0 ? (
					<p>{topic[0].data.children[0].data.selftext}</p>
				) : null}
			</div>
			<button
				className="inline-block text-white  rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] focus:outline-none focus:ring active:text-opacity-75"
				onClick={() => handleSave(topic[0].data.children[0].data)}
			>
				<span className="block rounded-full px-8 py-3 text-sm font-medium hover:bg-transparent">
					Save topic
				</span>
			</button>
		</section>
	);
};
