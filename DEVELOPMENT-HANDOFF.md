# NUTS CLUB — Development Handoff

Updated: 2026-10-28

## Project
- GitHub repository: jingyeyadoumeng-bot/nuts-club-app, main branch
- Render service: srv-dbcl1elg1s2s73dleu20, workspace: tea-dbckm4mq1p3s73ce3kag
- Public URL: https://nuts-club-app.onrender.com/
- Member app: /member.html
- Staff app: /staff.html
- Poker Lab: /member.html?design=12#lab
- Equity simulator: /poker-equity.html
- Poker Arena: /poker-arena.html

## Core features
Member: member card, points, ranks, tickets, NUTS TALK, poker training and equity simulator.
Staff: member search, chips, points, currency, tickets, tournaments, visits, quests, notifications, moderation.
Staff development hub: owner-only tab in staff.html, controlled by staff.js role check; links, local memo, handoff copy. This is NOT an autonomous AI code editor. Notes use localStorage and do not sync between devices.

## Equity Terminal
Standalone Monte Carlo simulator. User selects hole cards, flop/turn/river, 2-9 seats, hero position, number of remaining opponents, action context, villain position and simulation count. Opponent hole cards are uniformly random, **not inferred from action or position**. Action settings are contextual metadata only. Estimated win/tie/lose and split-pot equity. Not a GTO solver. Validate hand evaluator and simulation with test vectors before treating it as production-grade.

## Range guide
poker-lab.js includes approximate manually curated RFI and defend ranges. Do not describe them as verified GTO. It can import 'nuts-preflop-v1' JSON strategy spots, requiring all 169 hand types, and weighted action frequencies. No verified solver-generated strategy dataset has been integrated yet.

## Deployment and workflow
GitHub changes on main trigger Render deployment. Always inspect current files and their SHA before updating, verify Render deploy status and test important functionality. Preserve current UI and features. No direct GitHub write API tokens, Render secrets or Supabase service-role keys in client-side JavaScript. For future AI editing, build an authenticated server-side backend with owner authorization, confirmation before changes, audit logs, and least-privilege GitHub access. Do not place API secrets in public pages.

## Current priorities
1. Verify equity evaluator with known 7-card hand tests; fix any ranking bugs.
2. Consider position-aware opponent range presets only if clearly labeled as assumptions; never claim real inferred opponent hands.
3. Implement shared development notes in Supabase with strict owner-only row-level security if cross-device sync is desired.
4. For AI code editing, design an owner-approved backend workflow, not a public browser-side token.

## How to continue in another ChatGPT conversation
Ask: 'Continue development of NUTS CLUB. Read DEVELOPMENT-HANDOFF.md in GitHub jingyeyadoumeng-bot/nuts-club-app, inspect latest code and Render status, then implement my requested changes safely.'

## AI edit feature status (2026-10-28)
Owner-only AI edit request draft UI added to staff.html/staff.js. It saves text locally and can copy a prompt to ChatGPT. **No AI API, GitHub write backend, proposal approval, or automated publish is connected yet.** Publish button deliberately disabled. Required next: authenticated owner-only server function, secrets OPENAI_API_KEY and scoped GITHUB_TOKEN stored server-side, immutable change proposals, diff preview, owner approval, server-side revalidation of GitHub SHA, audit log, deployment status and rollback. Obtain user authorization for paid API usage and configure keys securely before enabling.

## Range chart upgrade (2026-10-28)
Added cash/tournament selector, effective stack (20–200 BB presets), ante, tournament stage (Chip EV, bubble ICM, final ICM) in poker-lab.js. Imported strategy spots now require explicit game, stackBB, anteBB and tournament stage to match the chosen context; missing tournament/non-default cash contexts show no guessed chart. No solver-generated strategy data is bundled. Accurate ICM requires remaining-player stacks, payouts, and tournament structure, so stage alone is not sufficient for solver accuracy. Next: design versioned spot schema with exact rake, open sizes, blind/ante model, opponent action tree, payouts and all player stacks; obtain licensed solver exports and add test fixtures. Existing 100BB cash reference charts remain explicitly approximate.

## Imported preflop datasets (2026-10-28)
Copied MIT-licensed source range JSON from jensbaagaard/poker-practice (GitHub) to data/ranges/Cash_100_GTO.json, MTT_20_GTO.json, MTT_40_GTO.json, MTT_100_GTO.json. Source credits: https://github.com/jensbaagaard/poker-practice. POKER LAB now loads these files asynchronously and displays per-hand raise/call/fold frequencies only for exact supported scenario selections (cash 100BB no ante, MTT chipEV 20/40/100BB with 1BB big blind ante, 6/8/9-handed). ICM and unsupported scenarios remain unavailable, not guessed. External dataset labels GTO; solver accuracy and original provenance have NOT been independently audited. Position mapping and sizing assumptions require QA before treating as authoritative. User-uploaded matching strategy takes priority. Check UI in Render deployment and perform regression tests.
