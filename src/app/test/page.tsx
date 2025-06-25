"use client";
import { useState } from "react";

export default function GeolocationTestPage() {
    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
        accuracy: number;
        timestamp: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const getLocation = async () => {
        setLoading(true);
        setError(null);
        setLocation(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: true, // Prioritize GPS
                        timeout: 10000, // 10s timeout
                        maximumAge: 0, // No cached results
                    }
                );
            });
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy, // Accuracy in meters
                timestamp: position.timestamp, // When location was fetched
            });
            setRetryCount(0); // Reset retry count on success
        } catch (err: any) {
            let errorMessage = "Failed to get location. Please allow location access.";
            if (err.code === 1) errorMessage = "Location access denied by user.";
            if (err.code === 2) errorMessage = "Location unavailable. Try moving to an open area.";
            if (err.code === 3) errorMessage = "Location request timed out.";
            setError(errorMessage);
            console.error("Geolocation error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        setRetryCount(retryCount + 1);
        getLocation();
    };

    const getGoogleMapsUrl = (latitude: number, longitude: number) => {
        return `https://www.google.com/maps?q=${latitude},${longitude}`;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Geolocation Test</h1>
            <div className="space-x-2">
                <button
                    onClick={getLocation}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-700"
                >
                    {loading ? "Fetching Location..." : "Get My Location"}
                </button>
                <button
                    onClick={handleRetry}
                    disabled={loading}
                    className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-700"
                >
                    Retry ({retryCount})
                </button>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {location && (
                <div className="mt-4 text-center">
                    <p>Latitude: {location.latitude.toFixed(6)}</p>
                    <p>Longitude: {location.longitude.toFixed(6)}</p>
                    <p>Accuracy: {location.accuracy.toFixed(1)} meters</p>
                    <p>
                        Timestamp: {new Date(location.timestamp).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                        })}
                    </p>
                    <a
                        href={getGoogleMapsUrl(location.latitude, location.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline mt-2 inline-block"
                    >
                        View in Google Maps
                    </a>
                </div>
            )}
            <div className="mt-4 text-sm text-gray-600">
                <p>Tips:</p>
                <ul className="list-disc list-inside">
                    <li>Ensure GPS is enabled on your device.</li>
                    <li>Move to an open area for better GPS signal.</li>
                    <li>Clear browser cache if location is outdated.</li>
                    <li>Retry if accuracy is low (high meters value).</li>
                </ul>
            </div>
        </div>
    );
}