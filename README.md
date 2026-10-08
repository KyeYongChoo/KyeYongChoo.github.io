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
  Use `data-cat` values `systems`, `ml`, `games`, `web3` or `apps` (space-separated for several) so the filters work.
- Photos live in `assets/img/`, interest card images in `assets/img/interests/`. Keep them small (under ~150KB).
  The raw source folders `profile pictures/` and `Interests/` are git-ignored.
- To add a resume download, export a PDF **without your phone number** to `assets/resume.pdf`
  and uncomment the "Resume (PDF)" button in the hero section.
- The `.docx` resume is git-ignored so it doesn't get published.
