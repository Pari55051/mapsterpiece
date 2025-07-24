<!-- # mapsterpiece
a github readme add-on  to display geo info of visits on your profile. -->


# Mapsterpiece

**Mapsterpiece** is a dynamic, GitHub-friendly world map that visualizes where your project's visitors are coming from. Each visit is logged, counted, and reflected on a live SVG map — with glowing highlights for current users and per-country color intensity.

![Mapsterpiece Demo](https://mapsterpiece.vercel.app/api/getMapSVG?theme=dark)

---

## Want Your Own Map?

1. **Fork this repo**
2. **Create a free Redis DB** at [upstash.com](https://upstash.com)
3. **Copy your Redis URL and token**
4. **Add these in your `.env` or Vercel Dashboard**:
    - KV_REST_API_URL=your_url
    - KV_REST_API_TOKEN=your_token
5. **Deploy with Vercel** 
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/your-username/mapsterpiece)
6. Add the following snippet to your `README.md` to display your live visit map:

    ```md
    <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://mapsterpiece.vercel.app/api/getMapSVG?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://mapsterpiece.vercel.app/api/getMapSVG?theme=light">
    <img alt="World Map of Visitors" src="https://mapsterpiece.vercel.app/api/getMapSVG?theme=light">
    </picture>

    [![Map Stats](https://img.shields.io/endpoint?url=https://mapsterpiece.vercel.app/api/badge&style=for-the-badge&labelColor=1e1e1e&color=3ba55c)](https://mapsterpiece.vercel.app/api/getMapSVG?theme=light)


    [![Add yourself to map](https://img.shields.io/badge/Get%20Added%20on%20the%20Map-Click%20Here-2c9e13?style=for-the-badge&labelColor=1089d1)](https://mapsterpiece.vercel.app/api/logVisit?redirect=https://github.com/YOURUSERNAME)
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

