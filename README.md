# Mapsterpiece

**Mapsterpiece** is a Github Profile README add-on world map that visualizes where your project's visitors are coming from. Each visit is logged, counted, and reflected on a live SVG map.

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://mapsterpiece.vercel.app/api/getMapSVG?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://mapsterpiece.vercel.app/api/getMapSVG?theme=light">
    <img alt="World Map of Visitors" src="https://mapsterpiece.vercel.app/api/getMapSVG?theme=dark">
</picture>
<br>
    
[![Map Stats](https://img.shields.io/endpoint?url=https://mapsterpiece.vercel.app/api/badge&style=for-the-badge&labelColor=1e1e1e&color=3ba55c)](https://mapsterpiece.vercel.app/api/getMapSVG?theme=light)
    
[![Add yourself to map](https://img.shields.io/badge/Get%20Added%20on%20the%20Map-Click%20Here-2c9e13?style=for-the-badge&labelColor=1089d1)](https://mapsterpiece.vercel.app/api/logVisit?redirect=https://github.com/pari55051)

<!-- STATS -->
![Weekly Stats](https://img.shields.io/badge/Weekly%20Visitors-This%20week:%20**1**%20new%20visit%20from%20**1**%20country.-blue?style=for-the-badge&labelColor=222)
<!-- /STATS -->

---

## Want Your Own Map?

1. Fork this repo
2. Create a free Redis DB at [upstash.com](https://upstash.com) or directly create it from inside vercel marketplace
3. Copy your Redis URL and token
4. Add these in your Vercel Dashboard:
    - KV_REST_API_URL=your_url
    - KV_REST_API_TOKEN=your_token
5. Deploy with Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/your-username/mapsterpiece)
6. Add the following snippet to your `README.md` to display your live visit map:

    ```md

    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://YOUR_DEPLOYED_URL/api/getMapSVG?theme=dark">
      <source media="(prefers-color-scheme: light)" srcset="https://YOUR_DEPLOYED_URL/api/getMapSVG?theme=light">
      <img alt="World Map of Visitors" src="https://YOUR_DEPLOYED_URL/api/getMapSVG?theme=dark">
    </picture>
    <br>
    
    [![Map Stats](https://img.shields.io/endpoint?url=https://YOUR_DEPLOYED_URL/api/badge&style=for-the-badge&labelColor=1e1e1e&color=3ba55c)](https://YOUR_DEPLOYED_URL/api/getMapSVG?theme=light)
    
    [![Add yourself to map](https://img.shields.io/badge/Get%20Added%20on%20the%20Map-Click%20Here-2c9e13?style=for-the-badge&labelColor=1089d1)](https://YOUR_DEPLOYED_URL/api/logVisit?redirect=https://github.com/YOUR_USERNAME)
    ````
---

## API Endpoints

| Route                         | Description                    |
| ----------------------------- | ------------------------------ |
| `/api/logVisit`               | Logs user's country visit      |
| `/api/getMapSVG?theme=dark` / `/api/getMapSVG?theme=light`  | Renders dark-mode/light-mode SVG map      |
| `/api/badge` | Get Map Stat Badge |

---

## Privacy

Mapsterpiece uses **GeoIP data** to derive **country-level location only** from IP addresses. No personally identifiable data is stored or logged.

---

## Credits
- made by: [unowen](https://github.com/pari55051)
- map svg from: [simple-world-map by flekschas](https://github.com/flekschas/simple-world-map/tree/master)

