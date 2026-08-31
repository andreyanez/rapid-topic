import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Single owner for the saved-topics list.
 *
 * Topic and TopicList used to keep separate copies of this array and both wrote
 * to localStorage, so deleting from the list left the other copy stale and
 * re-saving that topic silently did nothing.
 */

const STORAGE_KEY = 'topics';

function readStoredTopics(): string[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];

		const parsed = JSON.parse(raw);
		// Guard against whatever an older build (or a user) left behind.
		return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string') : [];
	} catch {
		return [];
	}
}

type SavedTopicsValue = {
	savedTopics: string[];
	saveTopic: (topic: string) => void;
	deleteTopic: (topic: string) => void;
};

const SavedTopicsContext = createContext<SavedTopicsValue | null>(null);

export const SavedTopicsProvider = ({ children }: { children: ReactNode }) => {
	// Read during initialisation so a reload doesn't flash an empty list.
	const [savedTopics, setSavedTopics] = useState<string[]>(readStoredTopics);

	// Persisting in an effect keeps the write out of render, and writing
	// unconditionally means removing the last topic actually clears storage
	// instead of leaving the old array to reappear on reload.
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTopics));
		} catch {
			// Storage can be full or blocked; losing persistence beats crashing.
		}
	}, [savedTopics]);

	// The dedupe check reads current state, so it can't go stale.
	const saveTopic = useCallback((topic: string) => {
		setSavedTopics(current => (current.includes(topic) ? current : [...current, topic]));
	}, []);

	const deleteTopic = useCallback((topic: string) => {
		setSavedTopics(current => current.filter(saved => saved !== topic));
	}, []);

	return (
		<SavedTopicsContext.Provider value={{ savedTopics, saveTopic, deleteTopic }}>
			{children}
		</SavedTopicsContext.Provider>
	);
};

export function useSavedTopics(): SavedTopicsValue {
	const context = useContext(SavedTopicsContext);
	if (!context) throw new Error('useSavedTopics must be used within a SavedTopicsProvider');
	return context;
}
