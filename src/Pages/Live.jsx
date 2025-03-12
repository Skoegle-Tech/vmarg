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

// Material UI imports
import { 
  Button, 
  Slider, 
  Typography, 
  Paper, 
  Box, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  OutlinedInput, 
  Chip,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import { 
  Map as MapIcon, 
  Delete as DeleteIcon, 
  Adjust as AdjustIcon, 
  LocationOn as LocationOnIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';
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
  const [radius, setRadius] = useState("");
  const [geolatidude, setGeolatidude] = useState("");
  const [geolongitude, setGeolongitude] = useState("");
  const [getLocation, setLocation] = useState(false);
  const [sliderValue, setSliderValue] = useState(1);

  const fetchGeofencingData = async (device) => {
    try {
      const response = await axios.get(`http://localhost:12000/api/geofencing/${device|| selectedDevices[0]}`);
      const data = response.data;
      if (data?._id) {
        setDeviceData((prev) => ({
          ...prev,
          [device]: {
            ...prev[device],
            geofencing: {
              lat: data.latitude,
              lng: data.longitude,
              main: data.main,
              battery: data.battery,
              radius: data.radius,
            },
          }
        }));
        
        // Set the slider to match the current radius
        if (data.radius) {
          setSliderValue(data.radius);
        }
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
      toast.error("Failed to fetch geofencing data.");
    }
  };

  // Function to update radius via API
  const updateRadius = async (device, radius) => {
    try {
      await axios.put(`http://localhost:12000/api/geofencing/${device}/${radius}`, {
        radius: radius
      });
      
      // Update local state to reflect the new radius
      setDeviceData((prev) => ({
        ...prev,
        [device]: {
          ...prev[device],
          geofencing: {
            ...prev[device].geofencing,
            radius: radius,
          }
        }
      }));
      
      toast.success(`Radius updated to ${radius}km successfully`);
    } catch (error) {
      console.error("Error updating radius:", error);
      toast.error("Failed to update radius");
    }
  };

  // Handle slider change
  const handleSliderChange = (e, newValue) => {
    setSliderValue(newValue);
  };

  // Apply radius change when slider is released
  const handleSliderCommit = (e, newValue, device) => {
    updateRadius(device, newValue);
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
          setSelectedDevices([options[0].value]);
          options.forEach(option => fetchGeofencingData(option.value));
        } else {
          toast.info("You don't have any registered devices. Please register a device.");
        }
      } catch (error) {
        console.error("Error fetching registered devices:", error);
        toast.error("Failed to fetch registered devices.");
      }
    };
    fetchDevices();
    
  }, [GetRegisterdDevices]);

  useEffect(() => {
    const listeners = [];

    const fetchDeviceData = async (device) => {
      try {
        const response = await axios.get(`http://localhost:12000/api/realtime/${device}`);
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
        toast.error("Failed to fetch device data.");
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

  const handleDeviceChange = (event) => {
    const { target: { value } } = event;
    setSelectedDevices(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
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
      toast.error("Failed to delete device.");
    }
  };

  const handleAddGeofencing = async (device) => {
    const data = deviceData[device];
    if (data?.found) {
      try {
        const response = await axios.post(
          'http://localhost:12000/api/device/geofencing',
          {
            deviceName: device,
            latitude: data.lat,
            longitude: data.lng
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage?.getItem("token")}`
            }
          }
        );
  
        toast.success("Geofencing coordinates added successfully.");
        setDeviceData((prev) => ({
          ...prev,
          [device]: {
            ...prev[device],
            geofencing: {
              lat: data.lat,
              lng: data.lng,
              radius: 1, // Default radius when creating a new geofence
            },
          }
        }));
        // Set default slider value for new geofence
        setSliderValue(1);
      } catch (error) {
        console.error("Error adding geofencing coordinates:", error);
        toast.error("Failed to add geofencing coordinates.");
      }
    }
  };
  

  const handleDeleteGeofencing = async (device) => {
    try {
      const response = await axios.delete(`http://localhost:12000/api/geofencing/${device}`, {
        data: {
          deviceName: device
        },
        headers: {
          'Authorization': `Bearer ${localStorage?.getItem("token")}`
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
  
  const passmessage = () => {
    console.log(geolatidude, geolongitude, radius);
    const message = `SET ${geolatidude},${geolongitude},${radius}`;
    const phoneNumber = "9108477033";
    const encodedMessage = encodeURIComponent(message);
    toast.success("Home Location Set Successfully");
    setTimeout(() => {
      window.location.href = `sms:${phoneNumber}?body=${encodedMessage}`;
    }, 2000);
  };

  return (
    <Layout title={"Vmarg - Live"}>
      <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', my: 2 }}>
        Live Device Tracking
      </Typography>
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {deviceOptions.find(option => option.value === device)?.label}
                    </Typography>
                    <Typography variant="body2">Latitude: {data.lat}</Typography>
                    <Typography variant="body2">Longitude: {data.lng}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>Last Updated: {data.lastUpdated}</Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Tooltip title="View on Google Maps">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleShare(device)}
                        >
                          <MapIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete Device">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDelete(device)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {!data.geofencing ? (
                        <Tooltip title="Add Geofencing">
                          <IconButton 
                            size="small" 
                            color="success" 
                            onClick={() => handleAddGeofencing(device)}
                          >
                            <AdjustIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Delete Geofencing">
                          <IconButton 
                            size="small" 
                            color="warning" 
                            onClick={() => handleDeleteGeofencing(device)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
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
                  radius={data.geofencing.radius * 1000} // Convert to meters (1 unit = 1km)
                  color="red"
                />
              ) : null;
            })}
          </MapContainer>

          <Paper className="device-selector" elevation={3}>
            <FormControl sx={{ width: 200 }}>
              <InputLabel id="device-select-label">Devices</InputLabel>
              <Select
                labelId="device-select-label"
                id="device-select"
                multiple
                value={selectedDevices}
                onChange={handleDeviceChange}
                input={<OutlinedInput label="Devices" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={deviceOptions.find(option => option.value === value)?.label} 
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {deviceOptions.map((device) => (
                  <MenuItem key={device.value} value={device.value}>
                    {device.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </div>

        <div className="device-info">
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            selectedDevices.map((device) => (
              <Paper 
                key={device} 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2,
                  background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)' 
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eaeaea', pb: 1 }}>
                  <LocationOnIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {deviceOptions.find(option => option.value === device)?.label}
                </Typography>
                
                {deviceData[device]?.found === false ? (
                  <Typography color="error">
                    Device not found. Latitude and Longitude not available.
                  </Typography>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Latitude:</strong> {deviceData[device]?.lat ?? "Loading..."}
                      </Typography>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Longitude:</strong> {deviceData[device]?.lng ?? "Loading..."}
                      </Typography>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Last Updated:</strong> {deviceData[device]?.lastUpdated ?? "Waiting for update..."}
                      </Typography>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        <strong>Geofencing:</strong> {deviceData[device]?.geofencing ? "Enabled" : "Disabled"}
                      </Typography>
                    </Box>
                    
                    {deviceData[device]?.geofencing && (
                      <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Geofencing Details
                        </Typography>
                        <Typography variant="body2" sx={{ my: 0.5 }}>
                          <strong>Latitude:</strong> {deviceData[device]?.geofencing?.lat ?? "Loading..."}
                        </Typography>
                        <Typography variant="body2" sx={{ my: 0.5 }}>
                          <strong>Longitude:</strong> {deviceData[device]?.geofencing?.lng ?? "Loading..."}
                        </Typography>
                        <Typography variant="body2" sx={{ my: 0.5 }}>
                          <strong>Main:</strong> {deviceData[device]?.geofencing?.main ?? "Loading..."}
                        </Typography>
                        <Typography variant="body2" sx={{ my: 0.5 }}>
                          <strong>Battery:</strong> {deviceData[device]?.geofencing?.battery ?? "Loading..."}
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" id="radius-slider" gutterBottom>
                            <strong>Radius:</strong> {sliderValue} km
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Slider
                              value={sliderValue}
                              onChange={handleSliderChange}
                              onChangeCommitted={(e, newValue) => handleSliderCommit(e, newValue, device)}
                              valueLabelDisplay="auto"
                              step={1}
                              marks
                              min={0.05}
                              max={10}
                              aria-labelledby="radius-slider"
                              sx={{ mx: 1 }}
                            />
                            <Chip 
                              label={`${sliderValue}km`} 
                              color="primary" 
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        </Box>
                      </Paper>
                    )}
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      <Button 
                        variant="contained" 
                        startIcon={<MapIcon />} 
                        size="small"
                        onClick={() => handleShare(device)}
                      >
                        View on Maps
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<DeleteIcon />} 
                        size="small"
                        onClick={() => handleDelete(device)}
                      >
                        Delete
                      </Button>
                      
                      {!deviceData[device]?.geofencing ? (
                        <Button 
                          variant="outlined" 
                          color="success" 
                          startIcon={<AdjustIcon />}
                          size="small" 
                          onClick={() => handleAddGeofencing(device)}
                        >
                          Add Geofence
                        </Button>
                      ) : (
                        <Button 
                          variant="outlined" 
                          color="warning" 
                          startIcon={<CancelIcon />}
                          size="small" 
                          onClick={() => handleDeleteGeofencing(device)}
                        >
                          Remove Geofence
                        </Button>
                      )}
                      
                      <Button 
                        variant="outlined" 
                        startIcon={<RefreshIcon />}
                        size="small" 
                        onClick={() => fetchGeofencingData(device)}
                      >
                        Refresh
                      </Button>
                    </Box>
                    
                    {getLocation && (
                      <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Set Home Location
                        </Typography>
                        
                        <TextField
                          label="Latitude"
                          variant="outlined"
                          fullWidth
                          margin="dense"
                          size="small"
                          onChange={(e) => setGeolatidude(e.target.value)}
                        />
                        
                        <TextField
                          label="Longitude"
                          variant="outlined"
                          fullWidth
                          margin="dense"
                          size="small"
                          onChange={(e) => setGeolongitude(e.target.value)}
                        />
                        
                        <TextField
                          label="Radius"
                          variant="outlined"
                          fullWidth
                          margin="dense"
                          size="small"
                          onChange={(e) => setRadius(e.target.value)}
                        />
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => { 
                              setLocation(false);
                              passmessage();
                            }}
                          >
                            Submit
                          </Button>
                          
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setLocation(false)}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </>
                )}
              </Paper>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}