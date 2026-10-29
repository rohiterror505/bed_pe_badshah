export type CharacterImage = 'amitabh' | 'puneet' | 'rakhi' | 'mcstan';

const PATHS: Record<CharacterImage, string> = {
  amitabh: '/images/amitabh.webp',
  puneet: '/images/punnet.webp',
  rakhi: '/images/rakhi.webp',
  mcstan: '/images/mc stan.webp',
};

export class ImageCache {
  private map = new Map<CharacterImage, HTMLImageElement>();
  private loaded = new Set<CharacterImage>();
  private failed = new Set<CharacterImage>();
  ready = false;

  loadAll(): Promise<void> {
    const entries = Object.keys(PATHS) as CharacterImage[];
    return new Promise((resolve) => {
      let pending = entries.length;
      if (pending === 0) { this.ready = true; resolve(); return; }
      const done = () => {
        pending--;
        if (pending <= 0) { this.ready = true; resolve(); }
      };
      for (const key of entries) {
        const img = new Image();
        img.onload = () => { this.loaded.add(key); done(); };
        img.onerror = () => { this.failed.add(key); done(); };
        img.src = PATHS[key];
        this.map.set(key, img);
      }
    });
  }

  get(key: CharacterImage): HTMLImageElement | null {
    if (this.failed.has(key) || !this.loaded.has(key)) return null;
    return this.map.get(key) ?? null;
  }

  has(key: CharacterImage): boolean {
    return this.loaded.has(key) && !this.failed.has(key);
  }
}