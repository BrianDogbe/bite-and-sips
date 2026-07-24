# Bite & Sips

Food ordering web app inspired by Bolt Food: menu, cart, checkout with ETA, live order tracking + map, and a **hidden kitchen dashboard** with new-order alert sounds.

## Stack

- **Client:** React 19 + Vite + TypeScript + Leaflet (maps)
- **Server:** Express API storing orders in `server/data/orders.json`

## Quick start

```bash
# Terminal 1 — API
cd server
npm install
npm run dev

# Terminal 2 — frontend
cd client
npm install
npm run dev
```

Customer site: http://localhost:5173

### Kitchen (staff only — not linked on the customer site)

- Login: http://localhost:5173/kitchen/login
- Dashboard: http://localhost:5173/kitchen

Default login: `admin` / `biteandsips2026`  
Override with `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars on the server.

## Customer flow

1. Browse menu → cart → checkout (see estimated prep + delivery time)
2. Place order → kitchen gets a toast + alert sound
3. Track Order → status timeline, countdown ETA, live courier map (delivery)

## Staff flow

1. Open `/kitchen/login` (bookmark this; customers never see a link)
2. Accept → Preparing → Ready → Out for delivery → Delivered
3. Tracking page updates every few seconds

## Notes on “live location”

Courier position is **simulated** from kitchen → customer as status moves to **Out for delivery** (demo geocode from the address string around Accra). Real GPS would need a courier app later.
