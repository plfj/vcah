import type { IncomingMessage, ServerResponse } from 'http';
import { PRESET_PROFILES } from '../src/server/presets';

export default function handler(req: IncomingMessage, res: ServerResponse) {
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
