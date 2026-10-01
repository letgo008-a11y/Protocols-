# EMS COG 3.3 East - Phone App Prototype

This is a Progressive Web App (PWA) built from the supplied **Allegiance Mobile Health COG 3.3 (EAST), effective 07/01/2026** PDF.

## What is already included
- Mobile-first home screen
- Sections matching the PDF table of contents
- Search across protocol titles and extracted PDF text
- Favorites and recently viewed references (saved on the phone)
- Quick links to commonly used references
- Original PDF bundled in the app for exact page layout, flowcharts, tables, and diagrams
- Dark mode
- Offline cache after first successful load
- iPhone/Android home-screen install support

## Fastest way to put it on an iPhone
The PWA must be served over HTTPS. Upload the contents of this folder to a static web host such as GitHub Pages, Cloudflare Pages, Netlify, or an internal agency HTTPS server.

Then on iPhone:
1. Open the site in Safari.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Launch the new **EMS COG** icon.

## Local testing on a computer
Run:

    python3 -m http.server 8080

Then browse to `http://localhost:8080`.

## Clinical safety / source fidelity
The searchable text is automatically extracted from the PDF and is intended for navigation and rapid reference. Flowcharts, diagrams, scanned tables, and some special characters may not reproduce exactly. The bundled original PDF should be used to verify authoritative content before patient-care decisions.

## Good next-phase upgrades
- Structured drug cards with indication, contraindications, concentration, adult/pediatric dosing, max dose, route, and repeat intervals
- Weight-based medication calculator tied only to exact protocol data
- Adult vs pediatric filtered mode
- Cardiac arrest timer / checklist mode
- Capacity/refusal guided checklist
- Apparatus check-off forms
- Protocol update/version alert banner
- Native App Store wrapper using Capacitor, if desired
