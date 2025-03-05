import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Layout from "../Layout/Layout";
import { useStore } from "../Store/Store";
import L from "leaflet";
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import "./Live.css"; // Import the CSS file
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const locationIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Live() {
  const mapRef = useRef(null);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [deviceData, setDeviceData] = useState({});
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [error, setError] = useState(null);
  const { GetRegisterdDevices, deleteRegesteredDevice } = useStore();
  const [nickname, setNickname] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const defaultLatLng = { lat: 20.5937, lng: 78.9629 };

  const fetchGeofencingData = async (device) => {
    try {
      const response = await axios.get(`https://production-server-tygz.onrender.com/api/geofencing/${device|| selectedDevices[0]}`);
      const data = response.data;
      if (data?._id) {
        setDeviceData((prev) => ({
          ...prev,
          [device]: {
            ...prev[device],
            geofencing: {
              lat: data.latitude,
              lng: data.longitude,
            },
          }
        }));
      } else {
        setDeviceData((prev) => ({
          ...prev,
          [device]: {
            ...prev[device],
            geofencing: false,
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching geofencing data:", error);
      console.log("Failed to fetch geofencing data.");
    }
  };

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await GetRegisterdDevices();
        if (response?.devices?.length > 0) {
          const options = response.devices.map((device) => ({
            value: device.deviceName,
            label: device.nickname || device.deviceName,
          }));
          setDeviceOptions(options);
          setSelectedDevices([options[0].value]); // Select the first device

          // Fetch geofencing data for each device
          options.forEach(option => fetchGeofencingData(option.value));
        } else {
          console.log("You don't have any registered devices. Please register a device.");
        }
      } catch (error) {
        console.error("Error fetching registered devices:", error);
        console.log("Failed to fetch registered devices.");
      }
    };
    fetchDevices();
    
  }, [GetRegisterdDevices]);

  useEffect(() => {
    const listeners = [];

    const fetchDeviceData = async (device) => {
      try {
        const response = await axios.get(`https://production-server-tygz.onrender.com/api/realtime/${device}`);
        const data = response.data;
        if (data?.time && data?.date) {
          const latitude = parseFloat(data.latitude);
          const longitude = parseFloat(data.longitude);

          setDeviceData((prev) => ({
            ...prev,
            [device]: {
              lat: latitude,
              lng: longitude,
              lastUpdated: `${data.date} ${data.time}`,
              found: true,
            },
          }));
          setMapCenter({ lat: latitude, lng: longitude });
        } else {
          setDeviceData((prev) => ({
            ...prev,
            [device]: { found: false },
          }));
        }
      } catch (error) {
        console.error("Error fetching device data:", error);
        console.log("Failed to fetch device data.");
      }
    };

    const fetchAllData = (device) => {
      fetchDeviceData(device);
      fetchGeofencingData(device);
    };

    if (selectedDevices.length > 0) {
      selectedDevices.forEach(device => {
        fetchAllData(device);
        const interval = setInterval(() => fetchAllData(device), 30000); // Fetch data every 30 seconds
        listeners.push(interval);
      });
    }
    
    fetchGeofencingData()

    return () => {
      listeners.forEach(clearInterval);
    };
  }, [selectedDevices]);

  useEffect(() => {
    if (mapRef.current) {
      const { lat, lng } = mapCenter;
      const zoomLevel = lat && lng ? 15 : 5;
      mapRef.current.setView([lat || defaultLatLng.lat, lng || defaultLatLng.lng], zoomLevel);
    }
  }, [mapCenter]);

  const handleDeviceChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedDevices(selected);
  };

  const handleShare = (device) => {
    const data = deviceData[device];
    if (data?.found) {
      const googleMapsLink = `https://www.google.com/maps/place/${data.lat},${data.lng}`;
      window.open(googleMapsLink, "_blank");
    }
  };

  const handleDelete = async (device) => {
    try {
      await deleteRegesteredDevice(device);
      setDeviceOptions((prev) => prev.filter((d) => d.value !== device));
      setSelectedDevices((prev) => prev.filter((d) => d !== device));
      toast.success("Device deleted successfully.");
    } catch (error) {
      console.error("Error deleting device:", error);
      console.log("Failed to delete device.");
      toast.error("Failed to delete device.");
    }
  };

  const handleAddGeofencing = async (device) => {
    const data = deviceData[device];
    if (data?.found) {
      try {
        const response = await axios.post('https://production-server-tygz.onrender.com/api/device/geofencing', {
          customerId: "CUST-651975004",
          deviceName: device,
          latitude: data.lat,
          longitude: data.lng
        });
        toast.success("Geofencing coordinates added successfully.");
        setDeviceData((prev) => ({
          ...prev,
          [device]: {
            ...prev[device],
            geofencing: {
              lat: data.lat,
              lng: data.lng,
            },
          }
        }));
      } catch (error) {
        console.error("Error adding geofencing coordinates:", error);
        toast.error("Failed to add geofencing coordinates.");
      }
    }
  };

  const handleDeleteGeofencing = async (device) => {
    try {
      const response = await axios.delete(`https://production-server-tygz.onrender.com/api/geofencing/${device}`, {
        data: {
          customerId: "CUST-651975004",
          deviceName: device
        }
      });
      toast.success("Geofencing coordinates deleted successfully.");
      setDeviceData((prev) => ({
        ...prev,
        [device]: {
          ...prev[device],
          geofencing: false,
        }
      }));
    } catch (error) {
      console.error("Error deleting geofencing coordinates:", error);
      toast.error("Failed to delete geofencing coordinates.");
    }
  };

  return (
    <Layout title={"Vmarg - Live"}>
      <center><h1>Live Device Tracking</h1></center>
      <div className="live-container">
        <div className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={10}
            className="map"
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {selectedDevices.map((device) => {
              const data = deviceData[device];
              return data?.found ? (
                <Marker key={device} position={[data.lat, data.lng]} icon={locationIcon}>
                  <Popup>
                    <strong>{deviceOptions.find(option => option.value === device)?.label}</strong> <br />
                    Latitude: {data.lat} <br />
                    Longitude: {data.lng} <br />
                    Last Updated: {data.lastUpdated} <br />
                    <button onClick={() => handleShare(device)} className="share-button">
                      Share Location
                    </button>
                    <button onClick={() => handleDelete(device)} className="delete-button">
                      Delete Device
                    </button>
                    {!data.geofencing && (
                      <button onClick={() => handleAddGeofencing(device)} className="geofencing-button">
                        Add Geofencing
                      </button>
                    )}
                    {data.geofencing && (
                      <button onClick={() => handleDeleteGeofencing(device)} className="geofencing-button">
                        Delete Geofencing
                      </button>
                    )}
                  </Popup>
                </Marker>
              ) : null;
            })}
            {selectedDevices.map((device) => {
              const data = deviceData[device];
              return data?.geofencing ? (
                <Circle
                  key={`geofence-${device}`}
                  center={[data.geofencing.lat, data.geofencing.lng]}
                  radius={1000} // 1 km radius
                  color="red"
                />
              ) : null;
            })}
          </MapContainer>

          <div className="device-selector">
            <select id="devices" multiple onChange={handleDeviceChange} value={selectedDevices}>
              {deviceOptions.map((device) => (
                <option key={device.value} value={device.value}>
                  {device.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="device-info">
          {error ? (
            <p className="error-message">{error}</p>
          ) : (
            selectedDevices.map((device) => (
              <div key={device} className="device-details">
                <h3>{deviceOptions.find(option => option.value === device)?.label}</h3>
                {deviceData[device]?.found === false ? (
                  <p className="device-not-found">Device not found. Latitude and Longitude not available.</p>
                ) : (
                  <>
                    <p>Latitude: {deviceData[device]?.lat ?? "Loading..."}</p>
                    <p>Longitude: {deviceData[device]?.lng ?? "Loading..."}</p>
                    <p>Last Updated: {deviceData[device]?.lastUpdated ?? "Waiting for update..."}</p>
                    <button onClick={() => handleShare(device)} className="share-button"> View on Google Maps</button>
                    <button onClick={() => handleDelete(device)} className="delete-button"> Delete Device</button>
                    {!deviceData[device]?.geofencing && (
                      <button onClick={() => handleAddGeofencing(device)} className="geofencing-button"> Add Geofencing</button>
                    )}
                    {deviceData[device]?.geofencing && (
                      <button onClick={() => handleDeleteGeofencing(device)} className="geofencing-button"> Delete Geofencing</button>
                    )}

                     <button onClick={() => fetchGeofencingData(device)} className="geofencing-button"> Fetch Geofencing</button>
                  </>
                )}
                <hr />
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}