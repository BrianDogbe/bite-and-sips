import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "@/lib/orderHelpers";

interface LiveMapProps {
  restaurant: LatLng;
  destination: LatLng;
  courier: LatLng;
  fulfillment?: "delivery" | "pickup";
  status: string;
}

const kitchenIcon = L.divIcon({
  className: "map-pin map-pin-kitchen",
  html: `<div style="background:#111827;color:#fff;border-radius:999px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">🍳</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const homeIcon = L.divIcon({
  className: "map-pin map-pin-home",
  html: `<div style="background:#f97316;color:#fff;border-radius:999px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const courierIcon = L.divIcon({
  className: "map-pin map-pin-courier",
  html: `<div style="background:#16a34a;color:#fff;border-radius:999px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)">🛵</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function LiveMap({
  restaurant,
  destination,
  courier,
  fulfillment = "delivery",
  status,
}: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const courierMarkerRef = useRef<L.Marker | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([restaurant.lat, restaurant.lng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    L.marker([restaurant.lat, restaurant.lng], { icon: kitchenIcon })
      .addTo(map)
      .bindPopup("Bite & Sips kitchen");

    if (fulfillment === "delivery") {
      L.marker([destination.lat, destination.lng], { icon: homeIcon })
        .addTo(map)
        .bindPopup("Your delivery location");
    }

    courierMarkerRef.current = L.marker([courier.lat, courier.lng], {
      icon: courierIcon,
    }).addTo(map);

    routeRef.current = L.polyline(
      [
        [restaurant.lat, restaurant.lng],
        [destination.lat, destination.lng],
      ],
      { color: "#f97316", weight: 4, opacity: 0.7, dashArray: "8 8" },
    ).addTo(map);

    const bounds = L.latLngBounds([
      [restaurant.lat, restaurant.lng],
      [destination.lat, destination.lng],
      [courier.lat, courier.lng],
    ]);
    map.fitBounds(bounds.pad(0.25));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      courierMarkerRef.current = null;
      routeRef.current = null;
    };
  }, [restaurant.lat, restaurant.lng, destination.lat, destination.lng, fulfillment]);

  useEffect(() => {
    if (!courierMarkerRef.current || !mapRef.current) return;
    courierMarkerRef.current.setLatLng([courier.lat, courier.lng]);
    courierMarkerRef.current.bindPopup(
      status === "Out for delivery"
        ? "Courier en route"
        : status === "Delivered"
          ? "Arrived"
          : "At the kitchen",
    );
  }, [courier.lat, courier.lng, status]);

  return <div ref={containerRef} className="live-map" />;
}

export default LiveMap;
