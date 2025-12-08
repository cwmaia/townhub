import type { ScrapedPlace } from "./places";

export const getTownServices = (): ScrapedPlace[] => [
  {
    name: "Stykkishólmur Police",
    type: "TOWN_SERVICE",
    description:
      "The local police station supporting Snæfellsnes with community services and emergency assistance.",
    address: "Hafnargata 3, 340 Stykkishólmur, Iceland",
    phone: "+354 444 2111",
    tags: ["Emergency", "Community"],
    lat: 65.0754,
    lng: -22.7295,
  },
  {
    name: "Stykkishólmur Fire Brigade",
    type: "TOWN_SERVICE",
    description:
      "Volunteer fire and rescue squad providing rapid-response support throughout the harbor and surrounding villages.",
    address: "Austurgata 7, 340 Stykkishólmur, Iceland",
    phone: "+354 861 6311",
    tags: ["Emergency", "Rescue"],
    lat: 65.0748,
    lng: -22.7268,
  },
  {
    name: "Heilsugæsla Stykkishólms Health Center",
    type: "TOWN_SERVICE",
    description:
      "Primary healthcare clinic offering family medicine, urgent care, and pharmacy services for locals and visitors.",
    address: "Austurgata 20, 340 Stykkishólmur, Iceland",
    phone: "+354 432 2400",
    website: "https://hss.is",
    tags: ["Clinic", "Pharmacy"],
    lat: 65.0739,
    lng: -22.7242,
  },
  {
    name: "Baldur Ferry Terminal",
    type: "TOWN_SERVICE",
    description:
      "Gateway to the Westfjords and Flatey Island with daily ferry departures, ticketing, and travel assistance.",
    address: "Suðurgata 5, 340 Stykkishólmur, Iceland",
    website: "https://seatours.is",
    tags: ["Transport", "Ferry"],
    lat: 65.0758,
    lng: -22.7352,
  },
  {
    name: "Icelandic Post Office - Stykkishólmur",
    type: "TOWN_SERVICE",
    description:
      "Local Íslandspóstur branch for mail services, parcel pickup, and logistics support across Snæfellsnes.",
    address: "Austurgata 13, 340 Stykkishólmur, Iceland",
    website: "https://postur.is",
    tags: ["Logistics", "Mail"],
    lat: 65.0745,
    lng: -22.7255,
  },
];
