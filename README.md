# Choo Kye Yong — Personal Website

A static personal site (plain HTML/CSS/JS, no build step).

## Preview locally
Open `index.html` in a browser, or run:

```
python -m http.server 8000
```

then visit http://localhost:8000.

## Deploy on GitHub Pages (free)
1. Create a GitHub repo named **`KyeYongChoo.github.io`**.
2. Push this folder to it:
   ```
   git remote add origin https://github.com/KyeYongChoo/KyeYongChoo.github.io.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**, set Source to *Deploy from a branch*, branch `main`, folder `/ (root)`.
4. The site goes live at https://kyeyongchoo.github.io within a minute or two.

## Updating
- All content lives in `index.html`. Each project is an `<article class="card project" data-cat="...">`.
  Use `data-cat` values `systems`, `ml`, `games`, `security`, `quantum`, `web3` or `apps` (space-separated for several) so the filters work.
- Photos live in `assets/img/`, interest card images in `assets/img/interests/`. Keep them small (under ~150KB).
  The raw source folders `profile pictures/`, `Interests/` and `project thumbnails/` are git-ignored.
- Project thumbnails are 800×450 (16:9) `.webp` files in `assets/img/projects/`. Put one as the first child of a card:
  `<div class="thumb"><img src="assets/img/projects/<name>.webp" alt="..." loading="lazy" width="800" height="450"></div>`.
  For a short looping clip, use `<video src="assets/video/<name>.mp4" poster="assets/img/projects/<name>.webp" muted loop playsinline preload="none">`
  inside the `.thumb` instead. It plays only while on screen and never for visitors who prefer reduced motion.
- Card links go in `<div class="project-links">`. Give any link a `data-icon` for its tiny logo:
  `github`, `steam`, `play` (Google Play), `telegram`, `youtube`, `drive`, `claude`, `linkedin`, `instagram`, `x`,
  `wikimedia`, `cc`, `web` (live site), `pdf`, `video`, `download`, `image` or `mail`. The icons are defined at the end of `styles.css`.
- After changing `styles.css` or `script.js`, bump the `?v=` number on their links in `index.html`. GitHub Pages lets
  browsers cache them for 10 minutes, so without it visitors can get new HTML with the old CSS.
- Full-length videos live in `assets/video/` and PDFs in `assets/docs/`. GitHub rejects files over 100MB, so compress
  videos first, e.g. `ffmpeg -i in.mp4 -vf scale=1280:-2 -crf 28 -preset slow -c:a aac -b:a 80k -movflags +faststart out.mp4`.
- The `.docx` resume is git-ignored so it doesn't get published.
