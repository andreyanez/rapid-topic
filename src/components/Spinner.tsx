export const Spinner = () => {
	return (
		<div className="flex justify-center items-center my-4 h-32">
			<span className="relative inset-0 inline-flex mx-auto h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-gray-300 after:absolute after:h-10 after:w-10 after:rounded-full after:border-2 after:border-y-red-500 after:border-x-transparent"></span>
		</div>
	);
};
