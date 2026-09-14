import { GeoFeature, LatLng, MapBounds } from '../types';

// Multiple public Overpass mirrors for reliability / load-balancing.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

export const MIN_ZOOM_FOR_FETCH = 15;

function bboxString(b: MapBounds): string {
  return `${b.south},${b.west},${b.north},${b.east}`;
}

function buildQuery(b: MapBounds): string {
  const bbox = bboxString(b);
  return `[out:json][timeout:30];(
    way["building"](${bbox});
    relation["building"]["type"="multipolygon"](${bbox});
    node["amenity"](${bbox});
    node["shop"](${bbox});
    node["tourism"](${bbox});
    node["office"](${bbox});
    way["highway"]["highway"!~"^(footway|path|steps|corridor)$"](${bbox});
    way["landuse"](${bbox});
    way["natural"~"water|wood"](${bbox});
  );out geom qt;`;
}

function pickName(tags: Record<string, string> | undefined): string | undefined {
  if (!tags) return undefined;
  return tags['name:ar'] || tags.name || tags['name:en'] || undefined;
}

function categoryFromTags(tags: Record<string, string>): { type: GeoFeature['type']; category: string } {
  if (tags.building) return { type: 'building', category: 'مبنى' };
  if (tags.highway) return { type: 'line', category: 'طريق' };
  if (tags.landuse) return { type: 'polygon', category: 'استخدام أرض' };
  if (tags.natural === 'water') return { type: 'polygon', category: 'مسطح مائي' };
  if (tags.natural === 'wood') return { type: 'polygon', category: 'غابة' };
  if (tags.amenity) return { type: 'point', category: `مرفق (${tags.amenity})` };
  if (tags.shop) return { type: 'point', category: `متجر (${tags.shop})` };
  if (tags.tourism) return { type: 'point', category: `سياحي (${tags.tourism})` };
  if (tags.office) return { type: 'point', category: `مكتب (${tags.office})` };
  return { type: 'point', category: 'معلم' };
}

async function fetchFromEndpoint(endpoint: string, query: string, signal?: AbortSignal): Promise<any> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
    signal,
  });
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
  return res.json();
}

export interface OverpassResult {
  features: GeoFeature[];
  counts: { buildings: number; poi: number; roads: number; other: number };
}

export async function fetchOSMFeatures(bounds: MapBounds, signal?: AbortSignal): Promise<OverpassResult> {
  const query = buildQuery(bounds);
  let lastError: any = null;
  let data: any = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      data = await fetchFromEndpoint(endpoint, query, signal);
      break;
    } catch (e) {
      lastError = e;
      continue;
    }
  }
  if (!data) {
    throw new Error(
      lastError?.message?.includes('abort')
        ? 'تم إلغاء الطلب'
        : 'تعذر الاتصال بخدمة Overpass. تحقق من الاتصال بالإنترنت وحاول مجددًا.'
    );
  }

  const counts = { buildings: 0, poi: 0, roads: 0, other: 0 };
  const features: GeoFeature[] = [];

  for (const el of data.elements ?? []) {
    const tags: Record<string, string> = el.tags ?? {};
    if (Object.keys(tags).length === 0) continue;

    const { type, category } = categoryFromTags(tags);
    let coords: LatLng[] = [];

    if (el.type === 'node') {
      coords = [[el.lat, el.lon]];
    } else if (el.type === 'way' && Array.isArray(el.geometry)) {
      coords = el.geometry.map((g: any) => [g.lat, g.lon] as LatLng);
    } else if (el.type === 'relation' && Array.isArray(el.members)) {
      const outer = el.members.find((m: any) => m.role === 'outer' && Array.isArray(m.geometry));
      if (outer) coords = outer.geometry.map((g: any) => [g.lat, g.lon] as LatLng);
    }

    if (coords.length === 0) continue;
    if ((type === 'polygon' || type === 'building') && coords.length < 3) continue;

    const name = pickName(tags) ?? category;

    features.push({
      id: `osm-${el.type}-${el.id}`,
      type,
      name,
      category,
      coords,
      source: 'osm',
      color: type === 'building' ? '#38bdf8' : type === 'line' ? '#fbbf24' : '#34d399',
      createdAt: Date.now(),
      osmTags: tags,
      osmId: `${el.type}/${el.id}`,
    });

    if (type === 'building') counts.buildings++;
    else if (type === 'line') counts.roads++;
    else if (type === 'point') counts.poi++;
    else counts.other++;
  }

  return { features, counts };
}
