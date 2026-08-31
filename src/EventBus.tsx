type Handler<T> = (detail: T) => void;

const eventBus = {
	/**
	 * Subscribes to an event and returns the function that unsubscribes it.
	 *
	 * The listener actually registered is a wrapper around `callback`, so callers
	 * have no reference they could pass to removeEventListener themselves -- the
	 * returned function closes over the right one.
	 */
	on<T = unknown>(event: string, callback: Handler<T>): () => void {
		const listener = (e: Event) => callback((e as CustomEvent<T>).detail);
		document.addEventListener(event, listener);

		return () => document.removeEventListener(event, listener);
	},

	dispatch<T = unknown>(event: string, data?: T) {
		document.dispatchEvent(new CustomEvent<T | undefined>(event, { detail: data }));
	},
};

export default eventBus;
