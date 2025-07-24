<!-- # mapsterpiece
a github readme add-on  to display geo info of visits on your profile. -->


# Mapsterpiece

**Mapsterpiece** is a dynamic, GitHub-friendly world map that visualizes where your project's visitors are coming from. Each visit is logged, counted, and reflected on a live SVG map — with glowing highlights for current users and per-country color intensity.

![Mapsterpiece Demo](https://mapsterpiece.vercel.app/api/getMapSVG?theme=dark)


---

## Embed in your GitHub Profile

Add the following snippet to your `README.md` to display your live visit map:

```md
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://mapsterpiece.vercel.app/api/getMapSVG?theme=dark">
  <source media="(prefers-color-scheme: light)" srcset="https://mapsterpiece.vercel.app/api/getMapSVG?theme=light">
  <img alt="World Map of Visitors" src="https://mapsterpiece.vercel.app/api/getMapSVG?theme=light">
</picture>
````

---

## API Endpoints

| Route                         | Description                    |
| ----------------------------- | ------------------------------ |
| `/api/logVisit`               | Logs user's country visit      |
| `/api/getMapSVG?theme=dark`   | Renders dark-mode SVG map      |
| `/api/getMapSVG?highlight=US` | Highlights visitor from the US |

---

## Privacy

Mapsterpiece uses **GeoIP data** to derive **country-level location only** from IP addresses. No personally identifiable data is stored or logged.

