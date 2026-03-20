# PadPlanner

<p>
  <img src="https://img.shields.io/badge/React-61dafb?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Leaflet-199900?logo=leaflet&logoColor=white" alt="Leaflet" />
  <img src="https://img.shields.io/badge/OpenRouteService-ff6600?logo=OpenStreetMap&logoColor=white" alt="OpenRouteService" />
  <img src="https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
</p>

> **Generate beautiful walking routes, anywhere.**

PadPlanner is a modern web application built with **React** and **Next.js** that generates circular walking routes based on your desired distance or time. Start at any location and discover new paths that bring you back where you started—perfect for casual neighborhood walks and exploring on foot.

## 🚀 Features

- **Smart Route Generation**: Get circular walking routes that start and end at your chosen point
- **Distance or Time Based**: Choose how far you want to walk or how long you have available
- **Location Search & Map Click**: Find your start by address or simply click on the map
- **Live Location Tracking**: Real-time GPS tracking with precise positioning (mobile optimized)
- **Waypoint Visualization**: See numbered waypoints showing your walking sequence
- **Export to GPX & GeoJSON**: Download routes for fitness apps or other tools
- **Pedestrian Friendly**: Routes use footways and walking paths, not car roads
- **Privacy First**: No accounts, no tracking, no nonsense
- **Modern Tech Stack**: Built with React, Next.js, and TypeScript for optimal performance

## 🛠️ Technical

This application showcases modern web development practices using:

- **Frontend**: React with Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 for responsive, utility-first design
- **Maps**: Leaflet.js with react-leaflet for interactive mapping
- **Routing**: OpenRouteService (ORS) for pedestrian-optimized route calculation
- **Language**: TypeScript for type safety
- **State Management**: Zustand for simple, lightweight state handling
- **Geolocation**: Browser Geolocation API for real-time location updates

## 🌍 Powered By

This project is built on these amazing open-source projects:

- [OpenStreetMap](https://www.openstreetmap.org/) – Free, editable map data
- [Leaflet](https://leafletjs.com/) – JavaScript library for interactive maps
- [OpenRouteService](https://openrouteservice.org/) – Routing and geospatial services
- [Next.js](https://nextjs.org/) – React framework for production

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd padplanner
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file:
```
ORS_API_KEY=your_openrouteservice_api_key_here
```

Get your free ORS API key at [openrouteservice.org](https://openrouteservice.org/)

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 License

This project is provided as-is for personal and commercial use.

<p align="center" style="margin-top: 5rem;">
  <sub>Made by <a href="https://jens.vanduinkerken.net" target="_blank">Jens van Duinkerken</a></sub>
</p>
