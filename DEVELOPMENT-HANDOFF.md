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
