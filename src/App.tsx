import eventBus from './EventBus';
import { Topic } from './components/Topic';
import { TopicList } from './components/TopicList';

function App() {
	return (
		<>
			<main>
				<section>
					<div className="p-8 md:p-12 lg:px-16 lg:py-18">
						<div className="mx-auto max-w-lg text-center">
							<h1 className="text-3xl font-bold text-gray-900 md:text-3xl">
								Quick! find something <span className="italic">weird</span> to talk about.
							</h1>

							<p className="hidden text-gray-500 sm:mt-4 sm:block">
								Get a random topic and keep that conversation flowing.
							</p>
						</div>

						<div className="mx-auto mt-8 max-w-xl">
							<button
								className="text-white mx-auto block rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] focus:outline-none focus:ring active:text-opacity-75"
								onClick={() => {
									eventBus.dispatch('fetchTopic');
								}}
							>
								<span className="block rounded-full px-8 py-3 text-sm font-medium hover:bg-transparent">
									Get new topic
								</span>
							</button>
						</div>
					</div>
				</section>

				<Topic />
				<TopicList />
			</main>
			<footer className="text-center m-8 font-semibold">
				<p>
					Made by{' '}
					<a href="https://github.com/andreyanez" target="_blank">
						André Yáñez
					</a>
				</p>
			</footer>
		</>
	);
}

export default App;
