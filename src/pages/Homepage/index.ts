import HomePresenter from './presenter';
import * as STORY_API from '../../data/api';
import { generateCardStory, generatePopoutMap } from '../../components/templates';
import Map from '../../utils/maps';
import { StoryMapper } from '../../data/api-mapper';

export default class HomePage {
  #presenter = null as HomePresenter | null;
  #map = null as Map | null;
  #pendingMarkers: Array<{
    coordinate: [number, number];
    markerOptions: any;
    popupOptions: any;
  }> = [];

  async render() {
    return `
    <!-- SECTION PETA -->
<section id="map-container" class="container mt-24 md:mt-28 lg:mt-32 2xl:mt-40">
  <div class="flex flex-col gap-2 items-center justify-center text-center mb-8">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-main tracking-tight">🌍 Ceritain!</h1>
    <p class="text-base sm:text-xl text-foreground/80 font-medium">Ceritakan semua yang ingin kamu bagi ke dunia 🌟</p>
  </div>

  <div id="map" class="rounded-xl shadow-md overflow-hidden h-64 md:h-[28rem] w-full border border-foreground/10"></div>
  <div id="map-loading-container" class="hidden mt-2 text-center text-foreground/60">Loading map...</div>
</section>

<!-- SECTION CERITA -->
<section id="stories-container" class="container my-16 min-h-[70svh]">
  <div class="flex flex-col gap-6">
    <h2 class="text-xl md:text-2xl font-bold text-foreground text-center">📚 Cerita Terbaru dari Teman-Teman</h2>
    
    <div id="list-story" class="story-container grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Story cards will be dynamically added here -->
    </div>

    <div id="loading-container" class="hidden text-center py-4 text-foreground/60 animate-pulse">
      ⏳ Mengambil cerita terbaru...
    </div>
  </div>
</section>

        `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: STORY_API,
    });

    await this.#presenter?.initialStories();
  }

  populateStoriesList(message: string, listStory: StoryMapper[]) {
    if (listStory.length === 0) {
      this.populateStoriesListError(message);
      return;
    }

    const container = document.getElementById('list-story');

    if (container) {
      const html = listStory.reduce((acc, story) => {
        this.addStoryMarker(story);
        return acc.concat(generateCardStory(story));
      }, '');
      container.innerHTML = html;

      this.processPendingMarkers();
    } else {
      console.error('list-story element not found');
    }
  }

  addStoryMarker(story: StoryMapper) {
    if (!story?.location || story.location.latitude == null || story.location.longitude == null) {
      return;
    }

    const lat = parseFloat(String(story.location.latitude));
    const lng = parseFloat(String(story.location.longitude));

    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates for story:', story.id);
      return;
    }

    const coordinate: [number, number] = [lat, lng];
    const markerOptions = { alt: `${story.name}-${story.description}` };
    const popupOptions = {
      content: generatePopoutMap({ story }),
    };

    if (this.#map && this.#map.isReady()) {
      this.#map.addMarker(coordinate, markerOptions, popupOptions);
    } else {
      this.#pendingMarkers.push({
        coordinate,
        markerOptions,
        popupOptions,
      });
    }
  }

  processPendingMarkers() {
    if (!this.#map || !this.#map.isReady() || this.#pendingMarkers.length === 0) {
      return;
    }

    while (this.#pendingMarkers.length > 0) {
      const marker = this.#pendingMarkers.shift();
      if (marker) {
        this.#map.addMarker(marker.coordinate, marker.markerOptions, marker.popupOptions);
      }
    }
  }

  async initialMap() {
    try {
      const mapElement = document.getElementById('map');
      if (mapElement && mapElement.clientHeight === 0) {
        mapElement.style.height = '400px';
      }

      this.#map = await Map.build('#map', {
        zoom: 10,
        locate: true,
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  }

  showLoading() {
    const container = document.getElementById('loading-container') as HTMLDivElement;
    container.classList.remove('hidden');
    container.classList.add('story-container');
    Array.from({ length: 3 }).forEach(() => {
      const loadingCard = document.createElement('div');
      loadingCard.classList.add('story-card-skeleton');
      container.appendChild(loadingCard);
    });
  }

  hideLoading() {
    const container = document.getElementById('loading-container') as HTMLDivElement;
    container?.classList.add('hidden');
    container?.classList.remove('story-container');
    container.innerHTML = '';
  }

  showMapLoading() {
    const container = document.getElementById('map-loading-container') as HTMLDivElement;
    container.classList.remove('hidden');
    container.classList.add('maps-loading-container');
  }

  hideMapLoading() {
    const mapContainer = document.getElementById('map') as HTMLDivElement;
    const container = document.getElementById('map-loading-container') as HTMLDivElement;
    container.classList.add('hidden');
    container.classList.remove('maps-loading-container');
    mapContainer.classList.add('maps-container');
    container.innerHTML = '';
  }

  populateStoriesListError(message: string) {
    const container = document.getElementById('stories-container') as HTMLDivElement;
    container.classList.remove('page-wrapper');
    container.classList.add('page-error-wrapper');

    container.innerHTML = `
        <div class="flex items-center gap-2 text-center justify-center flex-col h-full">
            <h2 class="text-6xl md:text-8xl font-black">Oops!</h2>
            <p class="text-base md:text-2xl">Terjadi kesalahan pengambilan daftar laporan</p>
            <p class="text-sm md:text-base font-bold text-red-500">${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
        </div>
    `;
  }
}
