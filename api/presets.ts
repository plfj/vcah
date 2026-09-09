import { PRESET_PROFILES } from '../src/server/presets';

type ApiRequest = {
  method?: string;
  [key: string]: any;
};

type ApiResponse = {
  statusCode?: number;
  setHeader: (name: string, value: string | number | readonly string[]) => void;
  end: (data?: any) => void;
  [key: string]: any;
};

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const list = PRESET_PROFILES.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    badge: p.tagline || 'Hardened',
    icon: p.iconName || 'Shield',
    config: p.config,
  }));

  res.statusCode = 200;
  res.end(JSON.stringify(list));
}
