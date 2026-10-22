/**
 * TripWise High-Definition Place & Destination Image Resolver
 * Curated Unsplash CDN photography with optimized dimensions, fast delivery, and intelligent context fallbacks.
 */

export interface VisitedPlaceItem {
  id: string;
  name: string;
  image: string;
  tag: string;
  description: string;
  rating?: number;
}

// Curated high-res destination hero images
const DESTINATION_HEROES: Record<string, string> = {
  mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&auto=format&fit=crop&q=80',
  manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80',
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop&q=80',
  jaipur: 'https://images.unsplash.com/photo-1603258849040-5e36814c1d2e?w=1200&auto=format&fit=crop&q=80',
  delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&auto=format&fit=crop&q=80',
  'new delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&auto=format&fit=crop&q=80',
  agra: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&auto=format&fit=crop&q=80',
  varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&auto=format&fit=crop&q=80',
  kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop&q=80',
  alleppey: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop&q=80',
  munnar: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&auto=format&fit=crop&q=80',
  shimla: 'https://images.unsplash.com/photo-1562093556-e9b308643dfb?w=1200&auto=format&fit=crop&q=80',
  rishikesh: 'https://images.unsplash.com/photo-1607554659424-df3c9c935b0b?w=1200&auto=format&fit=crop&q=80',
  srinagar: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&auto=format&fit=crop&q=80',
  kashmir: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&auto=format&fit=crop&q=80',
  leh: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=1200&auto=format&fit=crop&q=80',
  ladakh: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=1200&auto=format&fit=crop&q=80',
  udaipur: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=1200&auto=format&fit=crop&q=80',
  bangalore: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&auto=format&fit=crop&q=80',
  bengaluru: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&auto=format&fit=crop&q=80',
  chennai: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80',
  kolkata: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&auto=format&fit=crop&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&auto=format&fit=crop&q=80',
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&auto=format&fit=crop&q=80',
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
  thailand: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&auto=format&fit=crop&q=80',
  bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&auto=format&fit=crop&q=80',
};

// Curated visited places for major travel hubs
const TOP_VISITED_PLACES: Record<string, VisitedPlaceItem[]> = {
  mumbai: [
    {
      id: 'm1',
      name: 'Gateway of India',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80',
      tag: 'Iconic Monument',
      description: 'Historical 20th-century basalt arch overlooking the Arabian Sea in South Mumbai.',
      rating: 4.8,
    },
    {
      id: 'm2',
      name: 'Marine Drive (Queen’s Necklace)',
      image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&auto=format&fit=crop&q=80',
      tag: 'Sunset Promenade',
      description: '3.6 km long picturesque curved boulevard famous for evening strolls and ocean breeze.',
      rating: 4.9,
    },
    {
      id: 'm3',
      name: 'Elephanta Caves',
      image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&auto=format&fit=crop&q=80',
      tag: 'UNESCO Heritage',
      description: 'Ancient rock-cut cave temples dedicated to Lord Shiva situated on Elephanta Island.',
      rating: 4.6,
    },
    {
      id: 'm4',
      name: 'Bandra-Worli Sea Link',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80',
      tag: 'Modern Wonder',
      description: 'Cable-stayed bridge spanning across Mahim Bay connecting Bandra with South Mumbai.',
      rating: 4.7,
    },
    {
      id: 'm5',
      name: 'Colaba Causeway & Cafe Mondegar',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
      tag: 'Shopping & Dining',
      description: 'Vibrant street bazaar renowned for antique artifacts, trendy fashion, and vintage bistros.',
      rating: 4.6,
    },
  ],
  manali: [
    {
      id: 'mn1',
      name: 'Solang Valley',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80',
      tag: 'Adventure Sports',
      description: 'Famed for paragliding, snow scooter rides, zorbing, and breathtaking glacier panoramas.',
      rating: 4.9,
    },
    {
      id: 'mn2',
      name: 'Hadimba Devi Temple',
      image: 'https://images.unsplash.com/photo-1599818826725-d36c2f30b910?w=600&auto=format&fit=crop&q=80',
      tag: 'Sacred Cedar Forest',
      description: 'Four-tiered wooden pagoda temple constructed in 1553 inside lush Dhungiri Van Vihar.',
      rating: 4.7,
    },
    {
      id: 'mn3',
      name: 'Jogini Waterfalls Trek',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80',
      tag: 'Nature Trail',
      description: 'Scenic 3 km pine forest hike leading to crystal cascade with majestic Beas river views.',
      rating: 4.8,
    },
    {
      id: 'mn4',
      name: 'Rohtang Pass & Atal Tunnel',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      tag: 'Snow Peaks (13,058 ft)',
      description: 'Gateway to Lahaul valley offering dramatic mountain landscapes and year-round snow.',
      rating: 4.9,
    },
    {
      id: 'mn5',
      name: 'Old Manali Riverside Cafes',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80',
      tag: 'Bohemian Vibe',
      description: 'Cobblestone lanes dotted with wooden cottages, live acoustic music, and bakery joints.',
      rating: 4.7,
    },
  ],
  goa: [
    {
      id: 'g1',
      name: 'Baga & Calangute Beach',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
      tag: 'Golden Sands',
      description: 'Lively beachfront with water sports, beach shacks, seafood grills, and sunset music.',
      rating: 4.7,
    },
    {
      id: 'g2',
      name: 'Fort Aguada & Lighthouse',
      image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&auto=format&fit=crop&q=80',
      tag: '17th-Century Citadel',
      description: 'Well-preserved Portuguese fortress commanding wide ocean views at Sinquerim beach.',
      rating: 4.6,
    },
    {
      id: 'g3',
      name: 'Dudhsagar Waterfalls',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80',
      tag: 'Four-Tier Cascade',
      description: 'One of India’s tallest waterfalls nestled in Bhagwan Mahaveer Sanctuary, resembling milk.',
      rating: 4.9,
    },
    {
      id: 'g4',
      name: 'Basilica of Bom Jesus',
      image: 'https://images.unsplash.com/photo-1603258849040-5e36814c1d2e?w=600&auto=format&fit=crop&q=80',
      tag: 'UNESCO Baroque Site',
      description: 'Historic Old Goa church holding mortal remains of St. Francis Xavier.',
      rating: 4.8,
    },
    {
      id: 'g5',
      name: 'Palolem Beach',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      tag: 'Serene South Goa',
      description: 'Crescent-shaped white sand bay framed by coconut palms and calm turquoise waters.',
      rating: 4.8,
    },
  ],
  jaipur: [
    {
      id: 'j1',
      name: 'Hawa Mahal (Palace of Winds)',
      image: 'https://images.unsplash.com/photo-1603258849040-5e36814c1d2e?w=600&auto=format&fit=crop&q=80',
      tag: 'Royal Architecture',
      description: 'Iconic five-story pink sandstone palace with 953 intricately carved jharokha windows.',
      rating: 4.8,
    },
    {
      id: 'j2',
      name: 'Amber Palace & Fort',
      image: 'https://images.unsplash.com/photo-1599818826725-d36c2f30b910?w=600&auto=format&fit=crop&q=80',
      tag: 'Hilltop Grandeur',
      description: 'Magnificent Rajput stronghold featuring the glittering Sheesh Mahal mirror palace.',
      rating: 4.9,
    },
    {
      id: 'j3',
      name: 'Jal Mahal (Water Palace)',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80',
      tag: 'Scenic Lake',
      description: 'Ethereal palace floating in the middle of Man Sagar Lake, stunning during twilight.',
      rating: 4.7,
    },
    {
      id: 'j4',
      name: 'Nahargarh Fort Sunset Point',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      tag: 'Panoramic City View',
      description: 'Perched on the rugged edge of the Aravalli hills overlooking the entirety of Jaipur.',
      rating: 4.8,
    },
  ],
  delhi: [
    {
      id: 'd1',
      name: 'India Gate & Kartavya Path',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80',
      tag: 'National Memorial',
      description: 'Imposing 42m stone arch war memorial surrounded by manicured lawns and fountains.',
      rating: 4.8,
    },
    {
      id: 'd2',
      name: 'Qutub Minar Complex',
      image: 'https://images.unsplash.com/photo-1599818826725-d36c2f30b910?w=600&auto=format&fit=crop&q=80',
      tag: 'UNESCO Minaret',
      description: '73-meter tall fluted red sandstone victory tower built in 1192 surrounded by ruins.',
      rating: 4.7,
    },
    {
      id: 'd3',
      name: 'Humayun’s Tomb',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80',
      tag: 'Mughal Splendor',
      description: 'Garden mausoleum that served as architectural inspiration for the Taj Mahal.',
      rating: 4.8,
    },
  ],
  varanasi: [
    {
      id: 'v1',
      name: 'Dashashwamedh Ghat & Evening Aarti',
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&auto=format&fit=crop&q=80',
      tag: 'Spiritual Spectacle',
      description: 'World-renowned grand ritual with synchronized brass lamps at dusk on the holy Ganges.',
      rating: 4.9,
    },
    {
      id: 'v2',
      name: 'Kashi Vishwanath Corridor',
      image: 'https://images.unsplash.com/photo-1599818826725-d36c2f30b910?w=600&auto=format&fit=crop&q=80',
      tag: 'Sacred Jyotirlinga',
      description: 'Ancient temple of Lord Shiva directly connecting the holy river to the shrine.',
      rating: 4.9,
    },
    {
      id: 'v3',
      name: 'Assi Ghat Sunrise Boat Ride',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      tag: 'Dawn Experience',
      description: 'Peaceful morning boat cruise past historic palaces and centuries-old river ghats.',
      rating: 4.8,
    },
  ],
};

// Activity category images for fallback or themed matching
const CATEGORY_IMAGES: Record<string, string> = {
  sightseeing: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80',
  food: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
  adventure: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
  culture: 'https://images.unsplash.com/photo-1599818826725-d36c2f30b910?w=600&auto=format&fit=crop&q=80',
  relaxation: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  nature: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
  shopping: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80',
  travel: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
  nightlife: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
};

// Keyword mapping for activity titles
const KEYWORD_IMAGE_MAP: Array<{ keywords: string[]; url: string }> = [
  {
    keywords: ['solang', 'valley', 'snow', 'glacier', 'paragliding', 'skiing'],
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['marine drive', 'queen', 'necklace', 'promenade', 'sea link'],
    url: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['gateway', 'arch', 'colaba'],
    url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['hadimba', 'temple', 'pagoda', 'forest', 'dhungiri'],
    url: 'https://images.unsplash.com/photo-1599818826725-d36c2f30b910?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['jogini', 'waterfall', 'cascade', 'falls', 'dudhsagar'],
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['beach', 'baga', 'calangute', 'anjuna', 'palolem', 'coast', 'ocean'],
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['hawa mahal', 'palace of winds', 'pink city'],
    url: 'https://images.unsplash.com/photo-1603258849040-5e36814c1d2e?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['fort', 'amber', 'aguada', 'nahargarh', 'citadel', 'jaigarh'],
    url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['trout', 'siddu', 'lunch', 'dinner', 'food', 'restaurant', 'cafe', 'thali', 'dining', 'breakfast'],
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['hotel', 'resort', 'check-in', 'stay', 'homestay', 'hostel', 'room'],
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['bus', 'flight', 'train', 'journey', 'airport', 'railway', 'station', 'transit', 'drive'],
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['sunset', 'sunrise', 'twilight', 'viewpoint', 'view'],
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['bazaar', 'market', 'shopping', 'souvenir', 'street'],
    url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['trek', 'hike', 'climb', 'trail', 'mountain', 'hill', 'ridge'],
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80',
  },
];

/**
 * Resolves a high-quality cover photo for any destination city
 */
export function getDestinationCover(destination: string): string {
  if (!destination) return DESTINATION_HEROES.manali;
  const clean = destination.toLowerCase().trim().split(',')[0].trim();

  if (DESTINATION_HEROES[clean]) {
    return DESTINATION_HEROES[clean];
  }

  // Check for partial substring match
  for (const [key, url] of Object.entries(DESTINATION_HEROES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return url;
    }
  }

  // Intelligent fallback by nature of destination
  if (clean.includes('beach') || clean.includes('island') || clean.includes('coast')) {
    return DESTINATION_HEROES.goa;
  }
  if (clean.includes('hill') || clean.includes('mountain') || clean.includes('valley')) {
    return DESTINATION_HEROES.manali;
  }
  if (clean.includes('fort') || clean.includes('palace') || clean.includes('heritage')) {
    return DESTINATION_HEROES.jaipur;
  }

  // Generic stunning travel landscape
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80';
}

/**
 * Resolves a contextual, crisp photo for any itinerary activity
 */
export function getActivityImage(
  title: string,
  location?: string,
  category?: string,
  destination?: string
): string {
  const text = `${title} ${location || ''} ${category || ''}`.toLowerCase();

  // 1. Keyword-based landmark matching
  for (const item of KEYWORD_IMAGE_MAP) {
    if (item.keywords.some((k) => text.includes(k))) {
      return item.url;
    }
  }

  // 2. Category matching
  if (category && CATEGORY_IMAGES[category.toLowerCase()]) {
    return CATEGORY_IMAGES[category.toLowerCase()];
  }

  // 3. Destination hero fallback
  if (destination) {
    return getDestinationCover(destination);
  }

  return CATEGORY_IMAGES.sightseeing;
}

/**
 * Returns top curated visited sights for the given destination
 */
export function getTopVisitedPlaces(destination: string): VisitedPlaceItem[] {
  if (!destination) return TOP_VISITED_PLACES.mumbai;
  const clean = destination.toLowerCase().trim().split(',')[0].trim();

  if (TOP_VISITED_PLACES[clean]) {
    return TOP_VISITED_PLACES[clean];
  }

  // Check partial key match
  for (const [key, list] of Object.entries(TOP_VISITED_PLACES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return list;
    }
  }

  // Generic fallback spots
  return [
    {
      id: 'gen1',
      name: `Historic Center of ${destination}`,
      image: getDestinationCover(destination),
      tag: 'City Heritage',
      description: `Explore the vibrant heart, iconic landmarks, and authentic cultural pulse of ${destination}.`,
      rating: 4.8,
    },
    {
      id: 'gen2',
      name: `Local Gourmet & Culinary Trail`,
      image: CATEGORY_IMAGES.food,
      tag: 'Food & Dining',
      description: 'Savor regional flavors, famous street treats, and artisanal delicacies.',
      rating: 4.9,
    },
    {
      id: 'gen3',
      name: `Panoramic Nature Viewpoint`,
      image: CATEGORY_IMAGES.nature,
      tag: 'Scenic View',
      description: 'Captivating panoramic views perfect for photography, sunsets, and relaxation.',
      rating: 4.7,
    },
  ];
}

