import React from 'react';
import { MapPin } from 'lucide-react';

export interface CityLandmarkIconProps {
  city: string;
  className?: string;
}

export function CityLandmarkIcon({ city, className = "w-4 h-4" }: CityLandmarkIconProps) {
  const normalized = city.trim().toLowerCase();

  switch (normalized) {
    case 'bangalore':
    case 'bengaluru':
      // Vidhana Soudha (Karnataka legislature building with central dome & portico pillars)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12 2v3" />
          <path d="M10 5h4a2 2 0 0 1 2 2v2H8V7a2 2 0 0 1 2-2Z" />
          <path d="M4 9h16v3H4z" />
          <path d="M6 12v7M9 12v7M12 12v7M15 12v7M18 12v7" />
          <path d="M2 19h20v3H2z" />
        </svg>
      );

    case 'mumbai':
      // Gateway of India (Arch with side turrets and stonework)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M3 21h18" />
          <path d="M5 21V7h2v14M17 21V7h2v14" />
          <path d="M7 7V5h10v2" />
          <path d="M7 11h10" />
          <path d="M9 21v-5a3 3 0 0 1 6 0v5" />
          <path d="M6 5v-2M18 5v-2" />
        </svg>
      );

    case 'delhi ncr':
    case 'delhi':
    case 'new delhi':
      // India Gate (War memorial arch with stepped cornice)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M3 21h18" />
          <path d="M6 21V7h12v14" />
          <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
          <path d="M5 7h14v-2H5z" />
          <path d="M7 5h10V3H7z" />
          <path d="M12 3V1" />
        </svg>
      );

    case 'hyderabad':
      // Charminar (Four prominent minarets with central arches and balcony)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2 21h20" />
          <path d="M4 21V4l2-2v19M18 21V4l2-2v19" />
          <path d="M6 11h12" />
          <path d="M6 7h12" />
          <path d="M9 21v-5a3 3 0 0 1 6 0v5" />
          <path d="M9 11V7M15 11V7" />
        </svg>
      );

    case 'chennai':
      // Kapaleeshwarar / Dravidian Temple Gopuram (pyramidal tiered tower)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2 21h20" />
          <path d="M5 21l2-16h10l2 16" />
          <path d="M6.2 16h11.6" />
          <path d="M7.5 11h9" />
          <path d="M8.8 6h6.4" />
          <path d="M12 5V2" />
          <path d="M10 21v-3h4v3" />
        </svg>
      );

    case 'pune':
      // Shaniwar Wada (Fortified palace bastions with grand entrance arch)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2 21h20" />
          <path d="M3 21V9h4v12M17 21V9h4v12" />
          <path d="M7 13h10v8H7z" />
          <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
          <path d="M3 9V7l2-2 2 2v2M17 9V7l2-2 2 2v2" />
          <path d="M7 13V11h10v2" />
        </svg>
      );

    case 'kolkata':
      // Victoria Memorial (Classical domed marble monument with side wings & angel apex)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2 21h20" />
          <path d="M4 21v-6h16v6" />
          <path d="M8 15v-3h8v3" />
          <path d="M12 12V6a3 3 0 0 0-3 3h6a3 3 0 0 0-3-3Z" />
          <path d="M12 6V3" />
          <path d="M6 21v-6M18 21v-6M10 21v-4a2 2 0 0 1 4 0v4" />
        </svg>
      );

    case 'ahmedabad':
      // Sabarmati Ashram / Stepwell (Vav) motif with stepwork and arches
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2 21h20" />
          <path d="M4 21l8-15 8 15" />
          <path d="M7 21v-4h10v4" />
          <path d="M10 17v-3a2 2 0 0 1 4 0v3" />
          <path d="M9 13h6" />
          <path d="M12 6V3" />
        </svg>
      );

    case 'jaipur':
      // Hawa Mahal (Palace of Winds with tiered honeycomb arches & chhatris)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M8 11h2v2H8zM14 11h2v2h-2z" />
          <path d="M8 16h2v2H8zM14 16h2v2h-2z" />
          <path d="M11 7h2v2h-2z" />
          <path d="M12 3V1" />
        </svg>
      );

    case 'kochi':
      // Houseboat & Backwater palm silhouette
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2 19c2 1 4 1 6 0s4-1 6 0 4 1 6 0" />
          <path d="M4 16l2 3h12l2-3-3-6H7l-3 6Z" />
          <path d="M9 10v-3l4-2" />
          <path d="M13 5c2-1 4 0 5 2" />
          <path d="M8 13h8" />
        </svg>
      );

    case 'chandigarh':
      // Open Hand Monument / Sukhna Lake motif
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2 21h20" />
          <path d="M12 21V9" />
          <path d="M9 14l3-5 3 5" />
          <path d="M12 9c-2-4-1-6 2-7 1 2 0 4-2 7" />
          <path d="M6 21v-3c0-2 2-3 4-3h4c2 0 4 1 4 3v3" />
        </svg>
      );

    case 'indore':
      // Rajwada Palace (Multi-story royal facade with chhatris & grand portal)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M2 21h20" />
          <path d="M4 21V5h16v16" />
          <path d="M4 9h16M4 13h16M4 17h16" />
          <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
          <path d="M6 5V3l2-1 2 1v2M14 5V3l2-1 2 1v2" />
        </svg>
      );

    default:
      return <MapPin className={className} />;
  }
}
