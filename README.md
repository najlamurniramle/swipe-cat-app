# swipe-cat-app
This is a simple swipe preferred cats application.

A single-page, mobile-first web app where users swipe cat photos right (like) or left (dislike).  
After all cards are swiped, a summary shows how many and which cats were liked.

## Technologies used
- HTML, CSS, JavaScript
- Images from **Cataas** (`/api/cats?limit=N` for list; `/cat?width&height` for sizing)  
  References: https://cataas.com (API docs)  <!-- cites in the main writeup -->

## How It Works
- Fetch N cat IDs from Cataas.
- Render them as a stacked deck of cards (top card is interactive).
- Swipe gestures (touch/mouse) or buttons/keyboard (accessibility).
- Summary with liked thumbnails.

## Run Locally
Open `index.html` or use VS Code "Live Server".


## Deploy
Push to GitHub and enable **GitHub Pages** (Settings → Pages → Deploy from `main` / root).
