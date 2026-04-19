export interface PokemonSummary {
  id: number;
  name: string;
  sprite: string;
}

export interface PokemonDetail extends PokemonSummary {
  type: string[];
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

interface ListEnvelope {
  success: boolean;
  total: number;
  data: PokemonSummary[];
}

interface DetailEnvelope {
  success: boolean;
  data: PokemonDetail;
}

export class PokemonCatalogService {
  #baseUrl: string;
  #listCache: PokemonSummary[] | null = null;
  #listFetchPromise: Promise<PokemonSummary[]> | null = null;
  #detailCache: Map<number, PokemonDetail> = new Map();
  #detailFetchPromises: Map<number, Promise<PokemonDetail>> = new Map();

  constructor(baseUrl: string) {
    this.#baseUrl = baseUrl.replace(/\/$/, '');
  }

  async getAll(): Promise<PokemonSummary[]> {
    if (this.#listCache) return this.#listCache;
    if (this.#listFetchPromise) return this.#listFetchPromise;

    this.#listFetchPromise = (async () => {
      const res = await fetch(`${this.#baseUrl}/list`);
      if (!res.ok) {
        throw new Error(`Pokemon API error: ${res.status}`);
      }
      const body = (await res.json()) as ListEnvelope;
      if (!body.success || !Array.isArray(body.data)) {
        throw new Error('Pokemon API failure on /list');
      }
      this.#listCache = body.data;
      return body.data;
    })();

    try {
      return await this.#listFetchPromise;
    } finally {
      this.#listFetchPromise = null;
    }
  }

  async getById(id: number): Promise<PokemonDetail> {
    const cached = this.#detailCache.get(id);
    if (cached) return cached;

    const inFlight = this.#detailFetchPromises.get(id);
    if (inFlight) return inFlight;

    const promise = (async () => {
      const res = await fetch(`${this.#baseUrl}/list/${id}`);
      if (!res.ok) {
        throw new Error(`Pokemon API error: ${res.status}`);
      }
      const body = (await res.json()) as DetailEnvelope;
      if (!body.success || !body.data) {
        throw new Error(`Pokemon API failure on /list/${id}`);
      }
      this.#detailCache.set(id, body.data);
      return body.data;
    })();

    this.#detailFetchPromises.set(id, promise);
    try {
      return await promise;
    } finally {
      this.#detailFetchPromises.delete(id);
    }
  }

  async getRandom(count: number, excludeIds: number[]): Promise<PokemonSummary[]> {
    const all = await this.getAll();
    const exclude = new Set(excludeIds);
    const pool = all.filter((p) => !exclude.has(p.id));
    if (pool.length < count) {
      throw new Error('Not enough pokemon available');
    }
    const shuffled = pool.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled.slice(0, count);
  }
}
