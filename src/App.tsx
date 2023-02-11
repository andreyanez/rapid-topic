import eventBus from './EventBus';
import { Topic } from './components/Topic';
import { TopicList } from './components/TopicList';

function App() {
	return (
		<main>
			<h1>Rapid Topic</h1>
			<button
				className="inline-block rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] focus:outline-none focus:ring active:text-opacity-75"
				onClick={() => {
					eventBus.dispatch('fetchTopic');
				}}
			>
				<span className="block rounded-full px-8 py-3 text-sm font-medium hover:bg-transparent">
					Get new topic
				</span>
			</button>
			<Topic />
			<TopicList />
		</main>
	);
}

export default App;
