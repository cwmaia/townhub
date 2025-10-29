import type { ScrapedPlace } from "./places";

export const getAttractions = (): ScrapedPlace[] => [
  {
    name: "Volcano Museum",
    type: "ATTRACTION",
    description:
      "Iceland's premier volcano museum (Eldfjallasafn) featuring interactive exhibits about volcanic activity, eruptions, and geological history. One of Stykkishólmur's top tourist attractions.",
    address: "Aðalgata, 340 Stykkishólmur, Iceland",
    imageUrl: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=800",
    tags: ["Museum", "Education", "Top Attraction", "$$"],
    rating: 4.8,
    ratingCount: 342,
  },
  {
    name: "Library of Water",
    type: "ATTRACTION",
    description:
      "Unique art installation and cultural space featuring glass columns filled with water from Iceland's glaciers. Part of the museum pass with Volcano Museum and Norwegian House.",
    address: "Stykkishólmur, Iceland",
    imageUrl: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=800",
    tags: ["Art", "Culture", "Museum", "$$"],
    rating: 4.6,
    ratingCount: 256,
  },
  {
    name: "Icelandic Eider Center",
    type: "ATTRACTION",
    description:
      "Small museum offering a closer look at eider ducks, explaining their life cycle, eiderdown collection methods, and their role in local culture and conservation.",
    address: "Stykkishólmur, Iceland",
    imageUrl: "https://images.unsplash.com/photo-1568408838715-2715fb5b3419?q=80&w=800",
    tags: ["Museum", "Nature", "Education", "$"],
    rating: 4.4,
    ratingCount: 128,
  },
  {
    name: "Breiðafjörður Bay Boat Tours",
    type: "ATTRACTION",
    description:
      "Explore over 3,000 small islands up close on a scenic boat tour through Breiðafjörður Bay. See seabird colonies, basalt formations, and learn about local marine life.",
    address: "Harbor, 340 Stykkishólmur, Iceland",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800",
    tags: ["Tours", "Nature", "Boat", "$$$"],
    rating: 4.9,
    ratingCount: 487,
  },
  {
    name: "Stykkishólmur Lighthouse",
    type: "ATTRACTION",
    description:
      "Iconic orange lighthouse perched atop Súgandisey Island with sweeping views across Breiðafjörður. A must-visit landmark for photography and panoramic vistas.",
    address: "Súgandisey, 340 Stykkishólmur, Iceland",
    imageUrl: "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?q=80&w=800",
    tags: ["Viewpoint", "Photography", "Free"],
    rating: 4.7,
    ratingCount: 521,
  },
  {
    name: "Norwegian House Regional Museum",
    type: "ATTRACTION",
    description:
      "Restored 19th-century timber house and Iceland's oldest two-story building from 1828. Showcases local history, folk art, and what life was like for wealthy Icelanders. Part of the museum pass.",
    address: "Aðalgata 21, 340 Stykkishólmur, Iceland",
    website: "https://stykkisholmur.is/norwegian-house",
    imageUrl: "https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?q=80&w=800",
    tags: ["Museum", "Culture", "Historic", "$"],
    rating: 4.5,
    ratingCount: 298,
  },
  {
    name: "Sundlaug Stykkishólms Thermal Pool",
    type: "ATTRACTION",
    description:
      "Geothermal outdoor pool complex with hot tubs, waterslides, and views of the unique basalt cliffs. Perfect for relaxation after exploring.",
    address: "Vatnsvegi 6, 340 Stykkishólmur, Iceland",
    website: "https://sundlaug.is",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800",
    tags: ["Swimming", "Geothermal", "$$"],
    rating: 4.6,
    ratingCount: 412,
  },
  {
    name: "Helgafell Sacred Hill",
    type: "ATTRACTION",
    description:
      "Sacred mountain with legends promising three wishes if you hike to the top without looking back or talking. Short pilgrimage hike to a historic chapel with panoramic viewpoints.",
    address: "Helgafell, 340 Stykkishólmur, Iceland",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800",
    tags: ["Hiking", "History", "Sacred Site", "Free"],
    rating: 4.8,
    ratingCount: 367,
  },
];
