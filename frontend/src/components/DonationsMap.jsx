import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function DonationsMap({ donations, userLocation }) {
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : donations.length > 0
      ? [donations[0].pickupLocation.latitude, donations[0].pickupLocation.longitude]
      : [28.6139, 77.2090];

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 mb-6" style={{ height: '350px' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>Your location</Popup>
          </Marker>
        )}

        {donations.map((d) => (
          <Marker
            key={d._id}
            position={[d.pickupLocation.latitude, d.pickupLocation.longitude]}
          >
            <Popup>
              <div style={{ minWidth: '150px' }}>
                <strong>{d.foodName}</strong>
                <br />
                {d.donor?.name || 'Restaurant'}
                <br />
                {d.quantity}
                {d.distanceKm && (
                  <>
                    <br />
                    {d.distanceKm} km away
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}