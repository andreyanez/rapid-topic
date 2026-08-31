/**
 * Harvests post titles from r/Showerthoughts via Reddit's public Atom feeds
 * and merges them into public/topics.json.
 *
 * Why feeds instead of the API: Reddit removed CORS from the *.json endpoints
 * and now blocks unauthenticated calls to them (403), so the old in-browser
 * fetch can't work. The .rss feeds are still open, but rate limited to roughly
 * one accepted request per 70s per IP -- unusable per-visitor, fine for a
 * nightly job that only needs a handful of requests.
 *
 * Run with plain node (>=18). No dependencies, so CI needs no install step.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const POOL_PATH = resolve(ROOT, 'public/topics.json');

const SUBREDDIT = 'Showerthoughts';

// Identify honestly. Reddit's Responsible Builder Policy forbids masking who is
// making the request, and a descriptive UA is accepted by the feeds just fine.
const USER_AGENT = 'web:rapid-topic:v1.0 (by /u/andreyanez)';

// Each variant returns a different 25 posts, so sweeping them widens the catch.
const FEEDS = [
	'/r/{sub}/.rss',
	'/r/{sub}/hot/.rss',
	'/r/{sub}/top/.rss?t=day',
	'/r/{sub}/top/.rss?t=week',
	'/r/{sub}/top/.rss?t=month',
	'/r/{sub}/top/.rss?t=year',
	'/r/{sub}/top/.rss?t=all',
];

// Reddit's x-ratelimit-reset advertises ~30s, but measured behaviour is closer
// to one accepted request every 70s -- requests at 35s spacing alternate
// 200/429. Pace off the observed number, not the header.
const SPACING_MS = 75_000;

const MAX_RETRIES = 3;
const RETRY_FLOOR_SECONDS = 45;

// Keeps the static asset small enough to fetch on load. Oldest are dropped first.
const MAX_POOL = 2000;

const MIN_TITLE_LENGTH = 20;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function decodeEntities(text) {
	return text
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#0?39;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&nbsp;/g, ' ')
		.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
		.replace(/&amp;/g, '&'); // last, so decoded entities aren't re-decoded
}

function tagContent(block, tag) {
	const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
	return match ? decodeEntities(match[1].trim()) : null;
}

/** Pulls {id, title, url, author} out of Reddit's Atom payload. */
function parseFeed(xml) {
	const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

	return entries
		.map(entry => {
			const title = tagContent(entry, 'title');
			const id = tagContent(entry, 'id');
			const author = tagContent(entry, 'name');
			const url = entry.match(/<link[^>]*href="([^"]+)"/)?.[1] ?? null;

			return title && id && url ? { id, title, url, author } : null;
		})
		.filter(Boolean);
}

function isWorthKeeping(topic) {
	// AutoModerator posts are subreddit announcements, not shower thoughts.
	if (topic.author === '/u/AutoModerator') return false;
	if (topic.title.length < MIN_TITLE_LENGTH) return false;
	return true;
}

async function fetchFeed(path, attempt = 1) {
	const url = `https://www.reddit.com${path.replace('{sub}', SUBREDDIT)}`;
	const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });

	if (res.status === 429) {
		if (attempt > MAX_RETRIES) throw new Error('rate limited after retries');

		// The reset header under-reports, so treat it as a lower bound and back off.
		const advertised = Number(res.headers.get('x-ratelimit-reset')) || 0;
		const waitSeconds = Math.max(advertised, RETRY_FLOOR_SECONDS) * attempt;

		console.log(`  rate limited, waiting ${waitSeconds}s (attempt ${attempt}/${MAX_RETRIES})`);
		await sleep(waitSeconds * 1000);
		return fetchFeed(path, attempt + 1);
	}

	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

	return parseFeed(await res.text());
}

async function readPool() {
	try {
		const existing = JSON.parse(await readFile(POOL_PATH, 'utf8'));
		return Array.isArray(existing.topics) ? existing.topics : [];
	} catch {
		return []; // first run, or the file was never committed
	}
}

async function main() {
	const existing = await readPool();
	console.log(`pool: ${existing.length} topics before harvest`);

	const harvested = [];
	for (const [index, feed] of FEEDS.entries()) {
		if (index > 0) await sleep(SPACING_MS);

		const label = feed.replace('/r/{sub}', '');
		try {
			const topics = await fetchFeed(feed);
			harvested.push(...topics);
			console.log(`  ${label} -> ${topics.length} entries`);
		} catch (err) {
			// One bad feed shouldn't sink the run; the others still contribute.
			console.warn(`  ${label} -> failed (${err.message})`);
		}
	}

	// Dedupe on post id first, then on title text to catch genuine reposts.
	const byId = new Map(existing.map(topic => [topic.id, topic]));
	const seenTitles = new Set(existing.map(topic => topic.title.toLowerCase()));

	let added = 0;
	for (const topic of harvested) {
		if (!isWorthKeeping(topic)) continue;
		if (byId.has(topic.id)) continue;
		if (seenTitles.has(topic.title.toLowerCase())) continue;

		byId.set(topic.id, topic);
		seenTitles.add(topic.title.toLowerCase());
		added++;
	}

	const topics = [...byId.values()].slice(-MAX_POOL);

	// Rewriting the file just to bump `updated` would produce an empty commit and
	// a pointless redeploy every night, so only write when something actually changed.
	if (added === 0) {
		if (topics.length === 0) {
			throw new Error('harvest produced no topics and there is no existing pool to fall back on');
		}
		console.log(`pool: ${topics.length} topics, nothing new -- leaving topics.json untouched`);
		return;
	}

	await mkdir(dirname(POOL_PATH), { recursive: true });
	await writeFile(
		POOL_PATH,
		JSON.stringify({ updated: new Date().toISOString(), count: topics.length, topics }, null, 2) + '\n'
	);

	console.log(`pool: ${topics.length} topics after harvest (+${added} new)`);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
