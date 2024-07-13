import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faCloud,
  faCloudRain,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./Weather.css";

const Weather = () => {
  const [query, setQuery] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("metric"); // 'metric' for Celsius, 'imperial' for Fahrenheit

  const apiKey = "YOUR_API_KEY"; // Replace with your OpenWeatherMap API key

  useEffect(() => {
    // Fetch weather data for initial location (e.g., default to London)
    fetchWeather("London");
  }, []);

  const fetchWeather = async (location) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=${unit}`;
      const response = await axios.get(url);

      if (response.data.cod && response.data.cod !== 200) {
        throw new Error(response.data.message);
      }

      setWeatherData(response.data);
      setError("");
      fetchForecast(location);
    } catch (err) {
      setError(err.message || "Location not found");
      setWeatherData(null);
    }
  };

  const fetchForecast = async (location) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=${unit}&cnt=24`;
      const response = await axios.get(url);

      const forecast = response.data.list.filter((_, index) => index % 8 === 0);
      setForecastData(forecast);
    } catch (err) {
      console.error("Error fetching forecast:", err);
    }
  };

  const fetchWeatherByCoordinates = async (latitude, longitude) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${unit}`;
      const response = await axios.get(url);

      if (response.data.cod && response.data.cod !== 200) {
        throw new Error(response.data.message);
      }

      setWeatherData(response.data);
      setError("");
      fetchForecast(`${latitude},${longitude}`);
    } catch (err) {
      setError(err.message || "Location not found");
      setWeatherData(null);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    if (query.trim() !== "") {
      fetchWeather(query);
    } else {
      setError("Please enter a location");
      setWeatherData(null);
    }
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoordinates(latitude, longitude);
        },
        (error) => {
          setError("Unable to retrieve your location");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser");
    }
  };

  const handleUnitToggle = () => {
    setUnit((prevUnit) => (prevUnit === "metric" ? "imperial" : "metric"));
    if (weatherData) {
      fetchWeather(weatherData.name);
    }
  };

  const weatherIcon = () => {
    if (!weatherData) return null;

    switch (weatherData.weather[0].main) {
      case "Clear":
        return <FontAwesomeIcon icon={faSun} />;
      case "Clouds":
        return <FontAwesomeIcon icon={faCloud} />;
      case "Rain":
        return <FontAwesomeIcon icon={faCloudRain} />;
      default:
        return <FontAwesomeIcon icon={faSun} />;
    }
  };

  const getBackgroundClass = () => {
    if (!weatherData) return "clear-bg";

    switch (weatherData.weather[0].main) {
      case "Clear":
        return "clear-bg";
      case "Clouds":
        return "cloudy-bg";
      case "Rain":
        return "rainy-bg";
      default:
        return "clear-bg";
    }
  };

  return (
    <div className={`weather-container ${getBackgroundClass()}`}>
      <h1>Weather App</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter location (e.g., city name)"
          value={query}
          onChange={handleInputChange}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleGeolocation}>
          <FontAwesomeIcon icon={faMapMarkerAlt} />
        </button>
      </div>
      <button onClick={handleUnitToggle}>
        Switch to {unit === "metric" ? "Fahrenheit" : "Celsius"}
      </button>
      {error && <p className="error">{error}</p>}
      {weatherData && (
        <div className="weather-info">
          <h2>{weatherData.name}</h2>
          <div className="weather-icon">{weatherIcon()}</div>
          <p>{weatherData.weather[0].description}</p>
          <p>
            Temperature: {weatherData.main.temp}°{unit === "metric" ? "C" : "F"}
          </p>
          <p>Humidity: {weatherData.main.humidity}%</p>
          <p>
            Wind Speed: {weatherData.wind.speed}{" "}
            {unit === "metric" ? "m/s" : "mph"}
          </p>
        </div>
      )}
      {forecastData.length > 0 && (
        <div className="forecast-container">
          <h3>3-Day Forecast</h3>
          <div className="forecast">
            {forecastData.map((forecast, index) => (
              <div key={index} className="forecast-item">
                <p>{new Date(forecast.dt_txt).toLocaleDateString()}</p>
                <div className="forecast-icon">{weatherIcon()}</div>
                <p>
                  Temp: {forecast.main.temp}°{unit === "metric" ? "C" : "F"}
                </p>
                <p>{forecast.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
