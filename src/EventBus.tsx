const eventBus = {
	on(event: any, callback: any) {
		document.addEventListener(event, e => callback(e.detail));
	},
	dispatch(event: any) {
		document.dispatchEvent(new CustomEvent(event));
	},
	remove(event: any, callback: any) {
		document.removeEventListener(event, callback);
	},
};

export default eventBus;
