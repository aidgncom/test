/**
 * Resonator - Official BEAT Interpreter
 * Copyright (c) 2025 Aidgn
 * AGPL-3.0-or-later - See LICENSE for details.
 *
 * Resonator is the official BEAT interpreter.
 * It is a policy layer for interpreting BEAT, the Semantic Raw Format (SRF) standard.
 * It is domain-agnostic and can be applied to Finance, Game, Healthcare, IoT, Logistics, and other environments.
 *
 * BEAT is defined as an expressive format for structured semantics.
 * Consistent interpretation of BEAT across different environments is also important to maintain semantic compatibility.
 * Therefore, the following core BEAT INTERPRETATION LAYER adopts the BEAT specification directly,
 * ensuring consistent interpretation of event sequences expressed in BEAT.
 */

// ----- START: BEAT INTERPRETATION LAYER -----

// 🚨 Important: Keep this mapping consistent with the BEAT grammar defined by the generator
const BEAT = {
	SRF: {			// Token mapping
		S: '!',				// Contextual Space (who)
		T: '~',				// Time (when)
		P: '^',				// Position (where)
		A: '*',				// Action (what)
		F: '/',				// Flow (how)
		V: ':',				// Causal Value (why)

// ----- END: BEAT INTERPRETATION LAYER -----

/**
 * Resonator is protected under the AGPL-3.0-or-later License. In the RESONATOR CUSTOM LAYER,
 * all other logic may be modified or extended as needed, including but not limited to control flow, routing,
 * resource management, output policy, AI components, analytics, security, and domain-specific strategies.
 * 
 * Common entry forms:
 * - export default { fetch(request, env, ctx) }
 * - export default function handler(request)
 * - Custom handlers for any environment
 */

// ----- START: RESONATOR CUSTOM LAYER -----

		M: '_',				// Meta field (extension token)
							// Cross Tab '@' is also an extension token, but used directly as @---N
	},
	RES: 100				// Resolution (default: 100ms)
};

const KEY = BEAT.SRF.M.charCodeAt(0);		// BEAT supports JSON-like _key:value nesting
const VALUE = BEAT.SRF.V.charCodeAt(0);		// while preserving 1-byte scan performance

const WORKER = 'ai-insights'		// Worker Name (default: 'ai-insights')
const LIMIT = 30000;				// Worker Header size limit in bytes (default: 30000)

const STREAMING = {			// Security and Personalization
	LOG: false,						// Show live streaming logs, advanced features like AI insights can be applied here but expect operational cost trade-offs (default: false)
	TIME: false,					// Include timestamp in logs, excluding it helps reduce re-identification risk and strengthen compliance (default: false)
	HASH: false,					// Include hash in logs, must be enabled for reassembly when batches are fragmented by producer settings like POW=true (default: false)
	BOT: true,						// Listen for the bot BEAT (default: true)
	HUMAN: true,					// Listen for the human BEAT (default: true)
};

const ARCHIVING = { 		// Serverless analytics with generative AI insights
	LOG: true,						// Archive user journeys and push logs to cloud storage (default: true)
	TIME: false,					// Include timestamp in logs, excluding it helps reduce re-identification risk and strengthen compliance (default: false)
	HASH: false,					// Include hash in logs, must be enabled for reassembly when batches are fragmented by producer settings like POW=true (default: false)
	BLANK: false,					// Add blanks to BEAT string for better readability (default: false)
	NDJSON: false,					// Change logs to NDJSON instead of BEAT format (default: false)
									// 🚨 Important: Changing this setting only affects new logs, existing logs stay unchanged
									// In BEAT, STORE writes a daily Markdown report, easy for humans and AI to read together
									// In NDJSON, STORE writes single-line JSON for direct queries, AI insights disabled
	SKIP: {							// Filter settings for accurate analytics
		MAXTIME: 7200,						// Skip logs above N seconds (default: 7200)
		MINCLICK: 1,						// Skip logs below N clicks (default: 1)
	},
	AI: {
		INCLUDE: true,						// Include AI insights in logs (default: true)
		NAME: 'AI', 						// AI binding name (default: 'AI')
		MODEL: '@cf/openai/gpt-oss-20b',	// AI model (default: '@cf/openai/gpt-oss-20b')
		PROMPT: 1,							// Prompt format, higher numbers need more capable AI (default: 1)
		SITE: 1,							// Site type context for AI insights (default: 1)
		TYPE: [								// Pick your site 1-20 type from the list
			'Site type not specified - Analyze generally without assumptions.', // 1
			'News/blog site - focus on reading time, content navigation, and topic switches.', // 2
			'Portfolio/landing site - focus on section exploration, action triggers, and conversion paths.', // 3
			'Social/forum site - focus on post creation, reply frequency, and member interactions.', // 4
			'Documentation/wiki site - focus on page sequences, navigation efficiency, and reference jumps.', // 5
			'B2B site - focus on content duration, contact triggers, and page paths.', // 6
			'SaaS site - focus on feature discovery, tool interactions, and usage actions.', // 7
			'E-commerce site - focus on product browsing, purchase actions, and payment flow.', // 8
			'Marketplace site - focus on listing interactions, comparison loops, and transaction signals.', // 9
			'Education site - focus on lesson sequences, completion rates, and engagement checks.', // 10
			'Banking site - focus on task completion, security pauses, and workflow efficiency.', // 11
			'Healthcare site - focus on service pages, selection patterns, and appointment actions.', // 12
			'Government site - focus on service navigation, form interactions, and task success.', // 13
			'Entertainment site - focus on play events, viewing duration, and replay behavior.', // 14
			'Travel site - focus on destination pages, option comparison, and booking actions.', // 15
			'Real estate site - focus on property interactions, detail time, and inquiry triggers.', // 16
			'Job board site - focus on listing clicks, application triggers, and save actions.', // 17
			'Delivery site - focus on menu navigation, selection flow, and order completion.', // 18
			'Dating site - focus on browsing sequences, interaction timing, and connection attempts.', // 19
			'Gaming site - focus on session length, retry frequency, and activity cycles.', // 20
		]
	},
	STORE: {								// Store finalized daily reports
											// Follow setup video at <https://youtube.com/@aidgn>
											// Basic run: https://yourdomain.com/rhythm/archive?token=yoursecret
											// Force run: https://yourdomain.com/rhythm/archive?token=yoursecret&force
											// Basic run for specific date: https://yourdomain.com/rhythm/archive?token=yoursecret&date=2025-11-17
											// Force run for specific date: https://yourdomain.com/rhythm/archive?token=yoursecret&date=2025-11-17&force
											// Automated run (Cron Job) via wrangler.toml: [[triggers.crons]] crons = ["0 0 * * *"]
		CRON: true,							// Enable cron job (default: true)
		NAME: 'R2',							// Storage binding name (default: 'R2')
		TOKEN: 'yoursecret',				// Secret token (default: 'yoursecret')
											// 🚨 Important: Change this token before deployment. Example '1a2b3c4b'
		GMT: 9,								// Timezone offset (default: GMT+9)
		LOOKBACK: 2,						// Days to include from recent window (default: 2)
		GITHUB: {							// Back up to a private GitHub repo for direct conversation with advanced AI
			OWNER: '',						// 🚨 Important: Leave empty to auto-detect from GITHUB_TOKEN (default: '')
			REPO: 'ai-insights',			// Must match an existing private repository to prevent data exposure (default: 'ai-insights')
			BRANCH: 'main',					// Target branch for archive commits (default: 'main')
			COMMIT: 'Archive logs for',		// Commit message prefix (default: 'Archive logs for' YYYY-MM-DD)
		}
	}
};

const RE_DEFAULT = new RegExp(`(\\${BEAT.SRF.T}|\\${BEAT.SRF.F})(\\d+)(?=[\\${BEAT.SRF.S}\\${BEAT.SRF.P}\\${BEAT.SRF.A}\\${BEAT.SRF.F}\\${BEAT.SRF.V}@]|$)`, 'g');
const RE_BLANK = new RegExp(`(\\${BEAT.SRF.S}|\\${BEAT.SRF.T}|\\${BEAT.SRF.A})`, 'g');
const EX_DEFAULT = `${BEAT.SRF.S}home${BEAT.SRF.T}23.7${BEAT.SRF.A}nav-2${BEAT.SRF.T}190.8${BEAT.SRF.A}nav-3${BEAT.SRF.T}37.5${BEAT.SRF.F}12.3${BEAT.SRF.A}help${BEAT.SRF.T}112.8${BEAT.SRF.A}more-1${BEAT.SRF.T}4.3${BEAT.SRF.S}prod${BEAT.SRF.T}103.4${BEAT.SRF.A}button-12${BEAT.SRF.T}105.0${BEAT.SRF.A}p1@---2${BEAT.SRF.S}p1${BEAT.SRF.T}240.3${BEAT.SRF.A}img-1${BEAT.SRF.T}119.4${BEAT.SRF.A}buy-1${BEAT.SRF.T}1.3${BEAT.SRF.F}0.8${BEAT.SRF.F}0.8${BEAT.SRF.A}buy-1-up${BEAT.SRF.T}53.2${BEAT.SRF.A}review${BEAT.SRF.T}14${BEAT.SRF.S}review${BEAT.SRF.T}192.3${BEAT.SRF.A}nav-1@---1${BEAT.SRF.T}5.4${BEAT.SRF.A}mycart@---3${BEAT.SRF.S}cart`;
const EX_BLANK = EX_DEFAULT.replace(RE_BLANK, ' $1').replace(/@---(\d+)/g, ' @---$1').trimStart();

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const cookies = request.headers.get("Cookie") || "";

		// Streaming handler
		if (url.pathname === "/rhythm/" && url.searchParams.has("livestreaming") && request.method === "HEAD") {
			if (STREAMING.LOG) { // Show live streaming logs, advanced features like AI insights can be applied here but expect operational cost trade-offs (default: false)
				let logs = cookies;
				logs = logs.replace(/(movement|rhythm_\d+)=(\d+)_([^_]+)_([^_]+)_/g, (m, name, field, time, hash) => {
					const t = STREAMING.TIME ? time : '';
					const h = STREAMING.HASH ? hash : '';
					return `${name}=${field}_${t}_${h}_`;
				});
				ctx.waitUntil(console.log(logs));
			}
			const match = scan(cookies); // Movement: field_time_hash___tabs
			if (!((STREAMING.BOT && match.bot) || (STREAMING.HUMAN && match.human))) return new Response(null, {status: 204}); // Early return when no detection, reduces processing and network overhead
			const save = match.movement[0]; // Store original value for comparison

			// Update security field (OXXXXXXXXX)
			// 🚨 Important: Configure WAF rules with these expressions: 0=Pass, 1=Managed Challenge, 2=Block
			// Level 1 - Managed Challenge: (any(starts_with(http.request.cookies["movement"][*], "1")) and not http.cookie contains "cf_chl")
			// Level 2 - Block: (any(starts_with(http.request.cookies["movement"][*], "2")))
			if (STREAMING.BOT && match.bot) {
				match.movement[0] = match.movement[0].replace(/^./, m => m < 2 ? +m + 1 : 2);
				if (match.movement[0][0] < '2') console.log('⛔ bot: ' + match.bot + ' (level ' + match.movement[0][0] + ')'); // ⛔ bot: MachineGun:12 (level 1)
			}

			// Update personalization field (XOOOOOOOOO)
			// 🚨 Important: Requires customizing inExecution() before enabling
			// Use KV validation or an HMAC signature on the movement field to prevent tampering and verify reads and writes
			// Values like 0000000000 or 0101010101 indicate independent flags per position
			if (STREAMING.HUMAN && match.human) {
				const field = match.movement[0].split('');
				if (field[match.human] === '0') { // client sets 0 to repeat or 2 for one time after run
					field[match.human] = '1';
					match.movement[0] = field.join('');
					console.log('✅ Human: ' + match.movement[0] + ' (case ' + match.human + ')'); // ✅ Human: 0100000000 (case 1)
				}
			}
			if (match.movement[0] !== save) return new Response(null, {status: 204, headers: {'Set-Cookie': 'movement=' + match.movement[0] + '_' + match.movement[1] + '_' + match.movement[2] + match.movement[3] + '; Path=/; SameSite=Lax; Secure'}}); // Only update state when the movement field changes
			return new Response(null, {status: 204}); // All logic handled at edge, no need to reach origin
		}

		// Logging handler
		if (url.pathname === "/rhythm/echo" && request.method === "POST") {
			if (!ARCHIVING.LOG) return new Response('OK');
			let body = await request.text();
			const match = body.match(/rhythm_\d+=.*?(?=rhythm_|$)/g);
			if (!match) return new Response('OK');
			const map = {};
			for (let i = 0; i < match.length; i++) {
				const split = match[i].split('=');
				const number = split[0].slice(7);
				const parts = split[1].split('_');
				map[number] = {
					time: parts[1],
					hash: parts[2],
					device: +parts[3],
					referrer: +parts[4],
					scrolls: +parts[5],
					clicks: +parts[6],
					duration: +parts[7],
					beat: parts.slice(8).join('_').split(/(@---\d+)/).filter(Boolean)
				};
			}
			const first = String(Math.min(...Object.keys(map).map(Number)));
			let current = first;
			let flow = '';
			const index = {};
			while (map[current]) { // Reassemble Cross Tab journey
				const i = index[current] || 0;
				if (i >= map[current].beat.length) break;
				const token = map[current].beat[i];
				index[current] = i + 1;
				flow += token;
				if (token.startsWith('@---')) current = token.slice(4);
			}
			const leader = map[first];
			const merge = {};
			if (ARCHIVING.TIME && leader.time) merge.time = leader.time; // Include timestamp in logs, excluding it helps reduce re-identification risk and strengthen compliance (default: false)
			if (ARCHIVING.HASH && leader.hash) merge.hash = leader.hash; // Include hash in logs, must be enabled for reassembly when batches are fragmented by producer settings like POW=true (default: false)
			merge.device = leader.device;
			merge.referrer = leader.referrer;
			merge.scrolls = 0;
			merge.clicks = 0;
			let longest = 0;
			for (const number in map) {
				merge.scrolls += map[number].scrolls;
				merge.clicks += map[number].clicks;
				if (map[number].duration > longest) longest = map[number].duration;
			}
			merge.duration = +(longest * BEAT.RES / 1000).toFixed(1);
			if (merge.duration > ARCHIVING.SKIP.MAXTIME || merge.clicks < ARCHIVING.SKIP.MINCLICK) return new Response('OK'); // Filter settings for accurate analytics
			merge.beat = flow.replace(RE_DEFAULT, (_, s, n) => s + (+n * BEAT.RES / 1000).toFixed(1));
			if (ARCHIVING.BLANK) { // Add blanks to BEAT string for better readability (default: false)
				merge.beat = merge.beat
					.replace(RE_BLANK, ' $1')
					.replace(/@---(\d+)/g, ' @---$1')
					.trimStart();
			}

			// Change logs to NDJSON instead of BEAT format (default: false)
			// 🚨 Important: Changing this setting only affects new logs, existing logs stay unchanged
			// In BEAT, STORE writes a daily Markdown report, easy for humans and AI to read together
			// In NDJSON, STORE writes single-line JSON for direct queries, AI insights disabled
			if (ARCHIVING.NDJSON) {
				body = JSON.stringify(merge);
			} else {
				const device = ['desktop','mobile','tablet'][merge.device];
				const referrer = merge.referrer <= 2 ? ['direct','internal','unknown'][merge.referrer] : 'specific';
				const time = ARCHIVING.TIME && merge.time ? `_time:${merge.time}` : '';
				const hash = ARCHIVING.HASH && merge.hash ? `_hash:${merge.hash}` : '';
				body = `${time}${hash}_device:${device}_referrer:${referrer}_scroll:${merge.scrolls}_click:${merge.clicks}_duration:${merge.duration}_beat:${merge.beat}`;
			}

			// 🚨 Important: AI prompt dynamically adjusts based on BEAT tokens. Please review the structure carefully before making modifications
			if (ARCHIVING.AI.INCLUDE && !ARCHIVING.NDJSON && env[ARCHIVING.AI.NAME]) {
				const time = ARCHIVING.TIME ? `_time:1735680000` : '';
				const hash = ARCHIVING.HASH ? `_hash:x7n4kb2p` : '';
				const example = ARCHIVING.BLANK ? EX_BLANK : EX_DEFAULT;
				const space = ARCHIVING.BLANK ? ' ' : '';
				let messages;
				if (ARCHIVING.AI.PROMPT === 1) { // Prompt format, higher numbers need more capable AI (default: 1)
					messages = [{
						role: 'system',
						content: `You are a web analytics expert specializing in user behavior pattern recognition, and your task is to convert [DATA] into precise natural-language analysis.
						Produce exactly three lines in this order: [SUMMARY], [ISSUE], [ACTION].
						Follow the << EXAMPLE >> for structure, length, and style, and tailor content to this site type: ${ARCHIVING.AI.TYPE[ARCHIVING.AI.SITE - 1]}
						Do not include any extra text and do not quote the input.

						---------

						<< EXAMPLE >>

						Input = ${time}${hash}_device:mobile_referrer:specific_scroll:56_click:15_duration:1205.2_beat:${example}

						Output =
						[SUMMARY] Confused behavior. Landed on homepage, hesitated in help section with repeated clicks at 37 and 12 second intervals. Moved to product page, opened details in a new tab, viewed images for about 240 seconds. Tapped buy button three times at 1.3, 0.8, and 0.8 second intervals. Returned to the first tab and opened cart shortly after, but didn’t proceed to checkout.
						[ISSUE] Cart reached but purchase not completed. Repeated buy actions may reflect either intentional multi-item additions or friction in option selection. Long delay before checkout suggests uncertainty.
						[ACTION] Evaluate if repeated buy or cart actions represent deliberate comparison behavior or checkout friction. If friction is likely, simplify option handling and highlight key product details earlier in the flow.

						---------

						[SUMMARY]
						Analyze the "beat" field. Start with one behavior type and put it as the first word. Summarize the user journey chronologically using time intervals. Keep it brief, following the << EXAMPLE >> length.

						Behavior Types:
						Normal behavior = Varied rhythm with smooth flow and human-like patterns
						Confused behavior = Hesitant rhythm with repetitive and abandonment patterns
						Irregular behavior = Erratic rhythm with potentially fake or manipulated patterns
						Bot-like behavior = Mechanical rhythm with perfect timing, 0 scrolls, or repeated page navigation showing non-human patterns

						Beat Syntax:
						${BEAT.SRF.S} = page
						${BEAT.SRF.T} = time interval from the previous event to selecting the next event
						${BEAT.SRF.A} = element
						${BEAT.SRF.F} = time interval when repeatedly selecting the same event
						@---N = tab switch
						(e.g., ${BEAT.SRF.S}home, ${BEAT.SRF.S}product-01, ${BEAT.SRF.S}x3n, ${BEAT.SRF.S}ds9df, ${BEAT.SRF.A}7div1, ${BEAT.SRF.A}6p4, ${BEAT.SRF.A}button, ${BEAT.SRF.T}1.3, ${BEAT.SRF.T}43.1${BEAT.SRF.F}0.6${BEAT.SRF.F}1.2, ${BEAT.SRF.T}6.4${BEAT.SRF.F}8.3, @---2, @---1, @---3)

						Beat Interpretation:
						'${BEAT.SRF.F}' shows time intervals when the same element is selected repeatedly. For example, ${BEAT.SRF.T}1.3${BEAT.SRF.F}0.8${BEAT.SRF.F}0.8${space}${BEAT.SRF.A}button means ${BEAT.SRF.T}1.3${space}${BEAT.SRF.A}button${space}${BEAT.SRF.T}0.8${space}${BEAT.SRF.A}button${space}${BEAT.SRF.T}0.8${space}${BEAT.SRF.A}button.
						Beat syntax should be interpreted in two group units to understand the entire flow and write effectively. The small group is from '${BEAT.SRF.S}' (page) until the next '${BEAT.SRF.S}' (page) appears. The large group is from '@---N' (tab switch) until the next '@---N' (tab switch) appears.
						Keep it brief, following the << EXAMPLE >> length. Focus on essential flow, not every detail.

						---

						[ISSUE]
						Identify the conversion inhibitors or causes of metric distortion from the SUMMARY. Keep it concise and factual.

						---

						[ACTION]
						Suggest one clear and specific measure to resolve the ISSUE.`
					}, {
						role: 'user',
						content: body
					}];
				} else if (ARCHIVING.AI.PROMPT === 2) {
					messages = [{
						role: 'system',
						content: `You are a web analytics expert specializing in user behavior pattern recognition, and your task is to convert [DATA] into precise natural-language analysis.
						Produce exactly four lines in this order: [METRIC], [SUMMARY], [ISSUE], [ACTION].
						Follow the << EXAMPLE >> for structure, length, and style, and tailor content to this site type: ${ARCHIVING.AI.TYPE[ARCHIVING.AI.SITE - 1]}
						Do not include any extra text and do not quote the input.

						---------

						<< EXAMPLE >>

						Input = ${time}${hash}_device:mobile_referrer:specific_scroll:56_click:15_duration:1205.2_beat:${example}

						Output =
						[METRIC] 5 pages, 12 actions, 3 tabs
						[SUMMARY] Confused behavior. Landed on homepage, hesitated in help section with repeated clicks at 37 and 12 second intervals. Moved to product page, opened details in a new tab, viewed images for about 240 seconds. Tapped buy button three times at 1.3, 0.8, and 0.8 second intervals. Returned to the first tab and opened cart shortly after, but didn’t proceed to checkout.
						[ISSUE] Cart reached but purchase not completed. Repeated buy actions may reflect either intentional multi-item additions or friction in option selection. Long delay before checkout suggests uncertainty.
						[ACTION] Evaluate if repeated buy or cart actions represent deliberate comparison behavior or checkout friction. If friction is likely, simplify option handling and highlight key product details earlier in the flow.

						---------

						[METRIC]
						${BEAT.SRF.S} count = N pages
						${BEAT.SRF.A} count = N actions
						@--- count = N tab

						---

						[SUMMARY]
						Analyze the "beat" field. Start with one behavior type and put it as the first word. Summarize the user journey chronologically using time intervals. Keep it brief, following the << EXAMPLE >> length.

						Behavior Types:
						Normal behavior = Varied rhythm with smooth flow and human-like patterns
						Confused behavior = Hesitant rhythm with repetitive and abandonment patterns
						Irregular behavior = Erratic rhythm with potentially fake or manipulated patterns
						Bot-like behavior = Mechanical rhythm with perfect timing, 0 scrolls, or repeated page navigation showing non-human patterns

						Beat Syntax:
						${BEAT.SRF.S} = page
						${BEAT.SRF.T} = time interval from the previous event to selecting the next event
						${BEAT.SRF.A} = element
						${BEAT.SRF.F} = time interval when repeatedly selecting the same event
						@---N = tab switch
						(e.g., ${BEAT.SRF.S}home, ${BEAT.SRF.S}product-01, ${BEAT.SRF.S}x3n, ${BEAT.SRF.S}ds9df, ${BEAT.SRF.A}7div1, ${BEAT.SRF.A}6p4, ${BEAT.SRF.A}button, ${BEAT.SRF.T}1.3, ${BEAT.SRF.T}43.1${BEAT.SRF.F}0.6${BEAT.SRF.F}1.2, ${BEAT.SRF.T}6.4${BEAT.SRF.F}8.3, @---2, @---1, @---3)

						Beat Interpretation:
						'${BEAT.SRF.F}' shows time intervals when the same element is selected repeatedly. For example, ${BEAT.SRF.T}1.3${BEAT.SRF.F}0.8${BEAT.SRF.F}0.8${space}${BEAT.SRF.A}button means ${BEAT.SRF.T}1.3${space}${BEAT.SRF.A}button${space}${BEAT.SRF.T}0.8${space}${BEAT.SRF.A}button${space}${BEAT.SRF.T}0.8${space}${BEAT.SRF.A}button.
						Beat syntax should be interpreted in two group units to understand the entire flow and write effectively. The small group is from '${BEAT.SRF.S}' (page) until the next '${BEAT.SRF.S}' (page) appears. The large group is from '@---N' (tab switch) until the next '@---N' (tab switch) appears.
						Keep it brief, following the << EXAMPLE >> length. Focus on essential flow, not every detail.

						---

						[ISSUE]
						Identify the conversion inhibitors or causes of metric distortion from the SUMMARY. Keep it concise and factual.

						---

						[ACTION]
						Suggest one clear and specific measure to resolve the ISSUE.`
					}, {
						role: 'user',
						content: body
					}];
				}

				// 🚨 Important: env[ARCHIVING.AI.NAME] is your AI provider
				ctx.waitUntil(
					env[ARCHIVING.AI.NAME].run( // AI binding name (default: AI)
						ARCHIVING.AI.MODEL, // AI model (default: @cf/openai/gpt-oss-20b)
						ARCHIVING.AI.MODEL.includes('gpt-oss') ? { input: messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}`).join('\n\n') } : { messages }
					).then(r => console.log(body + '\n' + (r?.output?.filter(x => x.type === 'message') ?? [r]).map(o => o?.content?.[0]?.text ?? o?.response).join('\n')))
				);
			} else {
				console.log(body);
			}
			return new Response('OK');
		}

		// Archiving handler
		if (url.pathname === "/rhythm/archive" && url.searchParams.get("token") === ARCHIVING.STORE.TOKEN) {
			if (!env[ARCHIVING.STORE.NAME]) return fetch(request); // Pass through if no storage
			const date = url.searchParams.get('date'); // Optional YYYY-MM-DD override
			const force = url.searchParams.has('force'); // Force rebuild even if report already exists
			const targets = date ? [date] : (() => { // Build date list from LOOKBACK window
				const now = Date.now() + (ARCHIVING.STORE.GMT * 60 * 60 * 1000); // Shift to local timezone
				return Array(ARCHIVING.STORE.LOOKBACK).fill(0).map((_, i) => new Date(now - i * 86400000).toISOString().slice(0, 10)); // Days to include from recent window (default: 2)
			})();
			const results = [];
			const owner = env.GITHUB_TOKEN && (ARCHIVING.STORE.GITHUB.OWNER || await user(env.GITHUB_TOKEN)); // Leave empty to auto-detect from GITHUB_TOKEN (default: '')
			for (const target of targets) {
				const path = `archive/${target}.${ARCHIVING.NDJSON ? 'jsonl' : 'md'}`;
				if (!force && await env[ARCHIVING.STORE.NAME].head(path)) { // Skip if report already exists
					results.push({date: target, status: 'skipped', reason: 'already_merged'});
					continue;
				}
				const start = new Date(target + 'T00:00:00Z').getTime() - (ARCHIVING.STORE.GMT * 60 * 60 * 1000); // Calculate UTC range for local date
				const end = start + 86400000;
				const events = await logs(env, start, end); // Query Workers Logs API
				let content, total = 0;
				if (ARCHIVING.NDJSON) { // NDJSON: single-line JSON only, no metadata or AI insights
					const lines = [];
					for (const event of events) {
						const message = event.source.message;
						if (!message || message[0] !== '{') continue; // Skip non-JSON logs like bot detection
						const split = message.indexOf('\n');
						const json = split === -1 ? message : message.slice(0, split);
						lines.push(json);
						total++;
					}
					content = lines.join('\n');
				} else { // BEAT: daily Markdown report with metadata and AI insights
					const meta = { // Initialize all report fields with zero values
						total: 0,
						device: {desktop: 0, mobile: 0, tablet: 0},
						referrer: {direct: 0, internal: 0, unknown: 0, specific: 0},
						average: {scroll: 0, click: 0, duration: 0},
						hour: Array(24).fill(0) // Integer-indexed for fast increment
					};
					const hours = Array(24).fill(null).map(() => []); // Initialize 24 hour buckets
					let scrolls = 0, clicks = 0, duration = 0; // For average calculation
					for (const event of events) {
						const message = event.source.message;
						const time = event.timestamp;
						if (!message || message[0] !== BEAT.SRF.M) continue; // Skip non-BEAT logs like bot detection
						const split = message.indexOf('\n');
						const beat = split === -1 ? message : message.slice(0, split);
						const analysis = split === -1 ? null : message.slice(split + 1).trim().replace(/\n\n+/g, '\n');
						let device = '', referrer = '', key = '';
						let scroll = 0, click = 0, dur = 0;
						let i = 0, l = beat.length, c = 0, v = 0, k = 0;
						while (i < l) { // 1-byte scan from BEAT
							c = beat.charCodeAt(i);
							if (c === KEY) {
								const val = beat.slice(v, i);
								k = i + 1;
								if (key === 'device') device = val;
								else if (key === 'referrer') referrer = val;
								else if (key === 'scroll') scroll = +val;
								else if (key === 'click') click = +val;
								else if (key === 'duration') { dur = +val; break; }
							} else if (c === VALUE) {
								key = beat.slice(k, i);
								v = i + 1;
							}
							i++;
						}
						const hour = Math.floor((time - start) / 3600000); // Local hour
						hours[hour].push({record: beat, ai: analysis || ''});
						meta.total++;
						meta.hour[hour]++; // Increment hour count
						meta.device[device]++; // Device count by string key
						meta.referrer[referrer]++; // Referrer count by string key
						scrolls += scroll;
						clicks += click;
						duration += dur;
					}
					if (meta.total > 0) { // Calculate averages after all events processed
						meta.average.scroll = +(scrolls / meta.total).toFixed(1);
						meta.average.click = +(clicks / meta.total).toFixed(1);
						meta.average.duration = +(duration / meta.total).toFixed(1);
					}
					const blocks = [ // Build content with metadata, always included even if all zeros
						`---\n# ${target}\n`,
						`## Overview\n`,
						`[COUNT] total = ${meta.total} | ${meta.hour.map((v, i) => `${i.toString().padStart(2, '0')}:00 = ${v}`).join(' | ')}  \n`,
						`[DEVICE] desktop = ${meta.device.desktop} | mobile = ${meta.device.mobile} | tablet = ${meta.device.tablet}  \n`,
						`[REFERRER] direct = ${meta.referrer.direct} | internal = ${meta.referrer.internal} | unknown = ${meta.referrer.unknown} | specific = ${meta.referrer.specific}  \n`,
						`[AVERAGE] scroll = ${meta.average.scroll} | click = ${meta.average.click} | duration = ${meta.average.duration}\n\n`,
						`## Sessions\n`
					];
					for (let h = 0; h < 24; h++) { // Add hourly sections with markdown headers
						blocks.push(`### ${h.toString().padStart(2, '0')}:00\n\n`);
						for (const rec of hours[h]) {
							blocks.push('[DATA] `' + rec.record + '`  \n'); // Output original record as-is
							if (rec.ai) blocks.push(rec.ai + '\n\n'); // Only add AI insights if exists
						}
					}
					content = blocks.join('');
					total = meta.total;
				}
				const saves = [env[ARCHIVING.STORE.NAME].put(path, content)]; // R2 save
				if (owner) { // GitHub backup if owner exists
					const sha = await hash(env.GITHUB_TOKEN, owner, path);
					saves.push(fetch(`https://api.github.com/repos/${owner}/${ARCHIVING.STORE.GITHUB.REPO}/contents/${path}`, {
						method: 'PUT',
						headers: {
							'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
							'User-Agent': 'resonator-archive-worker',
							'Accept': 'application/vnd.github+json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							message: `${ARCHIVING.STORE.GITHUB.COMMIT} ${target}`,
							content: btoa(unescape(encodeURIComponent(content))),
							branch: ARCHIVING.STORE.GITHUB.BRANCH,
							...(sha && {sha})
						})
					}).then(r => (r.body?.cancel(), r)));
				}				
				await Promise.all(saves); // Parallel save to R2 and GitHub
				results.push({date: target, status: 'merged', entries: total});
			}
			return new Response(JSON.stringify(results), {
				headers: {'Content-Type': 'application/json'}
			});
		}
		return fetch(request);
	},
	async scheduled(event, env, ctx) {
		if (!ARCHIVING.STORE.CRON) return; // Enable cron job (default: true)
		await this.fetch(new Request(`https://localhost/rhythm/archive?token=${ARCHIVING.STORE.TOKEN}&force`), env, ctx); // Cron always runs with force enabled
	}
};

// Scan BEAT
function scan(cookies) {
	let get;
	if (!(cookies && cookies.length < LIMIT && (get = (cookies.match(/movement=([^;]+)/) || [])[1]))) return { bot:null, human:null, movement:null }; // Header size limit in bytes (default: 30000)
	const cut = get.indexOf('___');
	const movement = get.slice(0, cut).split('_').concat(get.slice(cut));
	const rhythm = /rhythm_(\d+)=([^;]+)/g;
	let match, bot = null, human = null;
	while ((match = rhythm.exec(cookies))) {
		const parts = match[2].split('_');
		const data = {scrolls: +parts[5], clicks: +parts[6], duration: +parts[7], beat: parts.slice(8).join('_')};
		if (!data.beat) continue;
		bot = preExecution(data);
		human = inExecution(data);
		if (bot || human) break;
	}
	return {bot, human, movement};
}

// Listen for the bot BEAT (default: true)
function preExecution(data) {

	// MachineGun: 200ms or less, 10+ consecutive
	const machinegun = data.beat.match(new RegExp(`\\${BEAT.SRF.T}(\\d+)`, 'g'));
	if (machinegun && machinegun.length >= 10) for (let i = 0, count = 0; i < machinegun.length; i++)
		if ((count = +machinegun[i].slice(1) <= 200/BEAT.RES ? count + 1 : 0) >= 10) return `MachineGun:${count}`;

	// Metronome: same interval 8+ times
	const metronome = data.beat.match(new RegExp(`[\\${BEAT.SRF.F}\\${BEAT.SRF.T}](\\d+)([\\${BEAT.SRF.F}\\${BEAT.SRF.T}]\\1){7,}`));
	if (metronome) return `Metronome:${metronome[1]}`;

	// NoVariance: standard deviation < 2, need 4+ data points
	const novariance = data.beat.match(new RegExp(`\\${BEAT.SRF.T}(\\d+)`, 'g'));
	if (novariance && novariance.length >= 4) {
		const values = novariance.map(t => +t.slice(1)), average = values.reduce((x, y) => x + y) / values.length;
		const spread = Math.sqrt(values.reduce((s, x) => s + (x - average) ** 2, 0) / values.length);
		if (spread < 200/BEAT.RES && average > 1000/BEAT.RES) return `NoVariance:${spread.toFixed(1)}`;
	}

	// Arithmetic: constant interval increase/decrease, 4+ points
	const arithmetic = data.beat.match(new RegExp(`\\${BEAT.SRF.T}(\\d+)`, 'g'));
	if (arithmetic && arithmetic.length >= 4) {
		const values = arithmetic.map(t => +t.slice(1)), delta = values[1] - values[0];
		if (delta && values.every((x, i) => !i || x - values[i - 1] === delta)) return `Arithmetic:${delta > 0 ? '+' : ''}${delta}`;
	}

	// Geometric: constant multiplication ratio, 4+ points
	const geometric = data.beat.match(new RegExp(`\\${BEAT.SRF.T}(\\d+)`, 'g'));
	if (geometric && geometric.length >= 4) {
		const values = geometric.map(t => +t.slice(1));
		const ratio = values[0] > 0 && values[1] > 0 && values[1] / values[0];
		if (ratio && ratio !== 1 && values.every((x, i) => !i || (values[i - 1] > 0 && Math.abs(x / values[i - 1] - ratio) < 0.01))) return `Geometric:x${ratio.toFixed(1)}`;
	}

	// PingPong: A-B-A-B page bounce, 3+ cycles (6 pages total)
	const pingpong = data.beat.match(new RegExp(`\\${BEAT.SRF.S}([^\\${BEAT.SRF.T}\\${BEAT.SRF.A}\\${BEAT.SRF.S}]+)\\${BEAT.SRF.S}([^\\${BEAT.SRF.T}\\${BEAT.SRF.A}\\${BEAT.SRF.S}]+)(?:\\${BEAT.SRF.S}\\1\\${BEAT.SRF.S}\\2)+`));
	if (pingpong && pingpong[0].split(BEAT.SRF.S).filter(Boolean).length >= 6) return `PingPong:${pingpong[1]}-${pingpong[2]}`;

	// Surface: DOM depth ≤2 is 90%+, need 10+ clicks
	const surface = data.beat.match(new RegExp(`\\${BEAT.SRF.A}(\\d+)`, 'g'));
	if (surface && surface.length >= 10) {
		const shallow = surface.filter(d => +d.slice(1) <= 2).length;
		if (shallow / surface.length > 0.9) return `Surface:${shallow}/${surface.length}`;
	}

	// Monotonous: diversity < 15%, need 20+ clicks
	const monotonous = data.beat.match(new RegExp(`\\${BEAT.SRF.A}[^\\${BEAT.SRF.S}\\${BEAT.SRF.T}]+`, 'g'));
	if (monotonous && monotonous.length >= 20) {
		const unique = new Set(monotonous).size;
		if (unique / monotonous.length < 0.15) return `Monotonous:${unique}t`;
	}

	// 🚨 Important: This is an example implementation
	// Detects 2+ rapid clicks on tap-repetition-demo-button (~3/1/2*tap-repetition-demo-button)
	// For custom patterns, just hardcode tokens instead of ${BEAT.SRF.N} for simplicity
	const example = data.beat.match(/((?:~[0-4]|\/[0-4])+)\*tap-repetition-demo-button[~\d.]*$/);
	if (example) {
		const count = (example[1].match(/[~\/]/g) || []).length;
		if (count >= 2) return `BotExample:${count}`;
	}
	return null;
}

// Listen for the human BEAT (default: true)
function inExecution(data) {

	// 🚨 Important: This is an example implementation
	// Detects 2+ slow clicks on tap-repetition-demo-button (~15/12/14*tap-repetition-demo-button)
	// Sets personalization field to 0100000000 to trigger client-side behavior (e.g., show welcome popup)
	const example = data.beat.match(/((?:~(?:[5-9]|\d{2,})|\/(?:[5-9]|\d{2,}))+)\*tap-repetition-demo-button[~\d.]*$/);
	if (example) {
		const count = (example[1].match(/[~\/]/g) || []).length;
		if (count >= 2) return 1; // Use personalization field position 1 (XOXXXXXXXX)
	}
	if (false) return 2; // Use personalization field position 2 (XXOXXXXXXX)
	if (false) return 3; // Use personalization field position 3 (XXXOXXXXXX)
	if (false) return 4; // Use personalization field position 4 (XXXXOXXXXX)
	if (false) return 5; // Use personalization field position 5 (XXXXXOXXXX)
	if (false) return 6; // Use personalization field position 6 (XXXXXXOXXX)
	if (false) return 7; // Use personalization field position 7 (XXXXXXXOXX)
	if (false) return 8; // Use personalization field position 8 (XXXXXXXXOX)
	if (false) return 9; // Use personalization field position 9 (XXXXXXXXXO)
	return null;
}

// Workers Logs API with pagination
async function logs(env, start, end) {
	const all = [];
	let offset = null;
	while (true) {
		const res = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/workers/observability/telemetry/query`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${env.CF_TOKEN}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					view: 'invocations',
					limit: 2000, // Max per request
					timeframe: { from: start, to: end },
					parameters: {
						datasets: ['cloudflare-workers'],
						filters: [{ key: '$metadata.service', operation: 'eq', value: WORKER, type: 'string' }]
					},
					...(offset && { offset })
				})
			}
		);
		const data = await res.json();
		const invocations = data.result.invocations;
		let count = 0, last = null;
		for (const requestId in invocations) {
			for (const event of invocations[requestId]) {
				all.push(event);
				const id = event.$metadata.id;
				if (!last || id > last) last = id; // Use max id for stable pagination
				count++;
			}
		}
		if (count < 2000) break; // Exit when page incomplete
		offset = last;
	}
	return all;
}

// Get owner from GitHub
async function user(token) {
	const response = await fetch('https://api.github.com/user', {
		headers: {
			'Authorization': `Bearer ${token}`,
			'User-Agent': 'resonator-archive-worker',
			'Accept': 'application/vnd.github+json',
		}
	});
	if (!response.ok) return response.body?.cancel(), null;
	return (await response.json()).login;
}

// Get SHA from GitHub
async function hash(token, owner, path) {
	const response = await fetch(`https://api.github.com/repos/${owner}/${ARCHIVING.STORE.GITHUB.REPO}/contents/${path}`, {
		headers: {
			'Authorization': `Bearer ${token}`,
			'User-Agent': 'resonator-archive-worker',
			'Accept': 'application/vnd.github+json',
		}
	});
	if (!response.ok) return response.body?.cancel(), null;
	return (await response.json()).sha;
}