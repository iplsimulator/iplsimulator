# IPL Dynasty Simulator

Static single-page simulator inspired by NBA2K-style franchise dashboards.

## Run

Open `index.html` in a browser.

For a local static server, run `python server.py`.

## Data Notes

- Roster base: `players2026.csv` using the current IPL 2026 squad file in this project.
- Ratings input window: custom role-based attributes stored in the active CSV dataset.
- The site is now static-host-friendly: CSV data is read client-side, and there is no in-browser CSV editing workflow.
- Rating model: weighted recent-form blend with role-based overall weighting.
- Simulation model: team batting, bowling, and clutch attributes drive match outcomes and season projections.

## Important Assumptions

- The app currently reads from `players2026.csv`, and the first XI for each team is determined by the first 11 players listed for that team in the file.
- Where a player had limited recent IPL sample size, the dataset uses role-based projection values and manual balancing.
- The season simulator uses a balanced double round-robin plus playoffs structure for quick franchise-style replayability.

## Reference Sources Used

- Wisden IPL 2026 best playing XIs: https://www.wisden.com/series/ipl-2026/cricket-news/ipl-2026-best-playing-xis-for-each-team-after-the-mini-auction
- IPL 2026 personnel changes and squad tracking: https://en.wikipedia.org/wiki/2026_Indian_Premier_League#Personnel_changes
- IPL 2026 squad salaries and retained player list cross-check: https://sports.ndtv.com/ipl-2026/retained-player-full-list-ipl-2026-every-teams-complete-squad-and-salaries-after-auction-8737837
