// Rules-based audience suggestions. Editable by the user before launch.
import type { Audience, Objective } from './types';
const I: Record<string, { age: [number, number]; interests: string[]; radius: number }> = {
  'Real estate': { age: [28, 55], interests: ['Real estate', 'Home loans', 'Interior design', 'Property investment'], radius: 15 },
  'Education & coaching': { age: [16, 35], interests: ['Higher education', 'Competitive exams', 'Online learning', 'Parenting'], radius: 10 },
  'Healthcare & clinics': { age: [25, 65], interests: ['Health and wellness', 'Fitness', 'Parenting', 'Healthy eating'], radius: 8 },
  'Restaurants & cafés': { age: [18, 45], interests: ['Restaurants', 'Food delivery', 'Coffee', 'Dining out'], radius: 5 },
  'Retail & fashion': { age: [18, 45], interests: ['Shopping', 'Fashion', 'Ethnic wear', 'Online shopping'], radius: 12 },
  'Beauty & wellness': { age: [20, 45], interests: ['Beauty', 'Skin care', 'Spa', 'Weddings'], radius: 7 },
  'Finance & insurance': { age: [25, 55], interests: ['Personal finance', 'Insurance', 'Investing', 'Small business'], radius: 25 },
  'Interiors & home services': { age: [27, 55], interests: ['Interior design', 'Home improvement', 'Furniture', 'New homes'], radius: 15 },
  'Manufacturing & B2B': { age: [25, 60], interests: ['Small business', 'Entrepreneurship', 'Manufacturing', 'Procurement'], radius: 50 },
  'Travel & hospitality': { age: [22, 55], interests: ['Travel', 'Weekend getaways', 'Hotels', 'Adventure travel'], radius: 40 },
  'Automobile': { age: [21, 50], interests: ['Cars', 'Motorcycles', 'Auto loans', 'Road trips'], radius: 20 },
  'Events & weddings': { age: [22, 40], interests: ['Weddings', 'Event planning', 'Photography', 'Engagement'], radius: 20 },
};
export function suggestAudience(category: string, city: string, objective: Objective): Audience {
  const s = I[category] || { age: [21, 55] as [number, number], interests: ['Small business', 'Shopping'], radius: 10 };
  const radius = objective === 'awareness' ? Math.round(s.radius * 1.5) : objective === 'calls' ? Math.max(3, Math.round(s.radius * 0.7)) : s.radius;
  return { locations: [city], radiusKm: radius, ageMin: s.age[0], ageMax: s.age[1], gender: 'all', interests: [...s.interests], languages: ['English', 'Hindi'] };
}
export function audienceErrors(a: Audience) {
  const e: Record<string, string> = {};
  if (!a.locations.filter(Boolean).length) e.locations = 'Add at least one location';
  if (a.radiusKm < 1 || a.radiusKm > 80) e.radiusKm = 'Radius between 1 and 80 km';
  if (a.ageMin < 18 || a.ageMax > 65 || a.ageMin > a.ageMax) e.age = 'Ages between 18 and 65, min below max';
  return e;
}
