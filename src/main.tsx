import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SavedTopicsProvider } from './SavedTopics';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	// <React.StrictMode>
	<QueryClientProvider client={queryClient}>
		<SavedTopicsProvider>
			<App />
		</SavedTopicsProvider>
		<ReactQueryDevtools initialIsOpen={false} />
	</QueryClientProvider>
	// </React.StrictMode>
);
