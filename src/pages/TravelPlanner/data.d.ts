export interface Destination {
  id: string;
  name: string;
  image: string;
  location: string;
  type: 'beach' | 'mountain' | 'city';
  rating: number;
  timeToVisit: number;
  costs: {
    food: number;
    accommodation: number;
    transport: number;
  };
  description: string;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  destinations: Destination[];
}

export interface Itinerary {
  id: string;
  title: string;
  days: DayPlan[];
  budget: number;
  createdAt: number;
}
