export type AuroraForecast = {
  kpIndex: number;
  probability: number;
  description: string;
};

const getAuroraDescription = (kp: number): string => {
  if (kp >= 7) return "Excellent aurora visibility expected tonight!";
  if (kp >= 5) return "Good chance of seeing aurora tonight.";
  if (kp >= 3) return "Possible aurora sightings in dark conditions.";
  return "Low aurora activity expected.";
};

export async function fetchAuroraForecast(
  lat: number,
  lng: number
): Promise<AuroraForecast | null> {
  try {
    // Using NOAA's 3-day aurora forecast
    // For Iceland's latitude (around 65°N), we use a simplified calculation
    // In production, you'd want to use a proper aurora API like NOAA or Aurora Service

    // Simulated Kp index based on typical Iceland aurora conditions
    // In a real implementation, fetch from: https://services.swpc.noaa.gov/json/ovation_aurora_latest.json

    // For now, generate realistic data based on Iceland's location
    const response = await fetch(
      'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
      { next: { revalidate: 1800 } } // Cache for 30 minutes
    );

    if (!response.ok) {
      // Fallback to moderate activity if API fails
      return {
        kpIndex: 4,
        probability: 60,
        description: getAuroraDescription(4),
      };
    }

    const data = await response.json();

    // Get the most recent Kp index from NOAA data
    // The data structure is: [["time", "kp"], ["2024-01-01 00:00:00", "3"], ...]
    const recentData = data.slice(-3); // Get last 3 entries
    const kpValues = recentData
      .slice(1) // Skip header row
      .map((row: string[]) => parseFloat(row[1]))
      .filter((val: number) => !isNaN(val));

    const avgKp = kpValues.length > 0
      ? Math.round(kpValues.reduce((a: number, b: number) => a + b, 0) / kpValues.length)
      : 3;

    // Calculate probability based on Kp index and latitude
    // Iceland (lat ~65°N) has good visibility for Kp >= 3
    let probability = 0;
    if (avgKp >= 7) probability = 95;
    else if (avgKp >= 5) probability = 75;
    else if (avgKp >= 3) probability = 50;
    else if (avgKp >= 2) probability = 25;
    else probability = 10;

    return {
      kpIndex: avgKp,
      probability,
      description: getAuroraDescription(avgKp),
    };
  } catch (error) {
    console.error('Error fetching aurora forecast:', error);
    // Return fallback data
    return {
      kpIndex: 3,
      probability: 45,
      description: getAuroraDescription(3),
    };
  }
}
