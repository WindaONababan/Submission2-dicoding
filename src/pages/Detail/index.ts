import Map from '../../utils/maps';
import DetailPresenter from './presenter';
import * as STORY_API from '../../data/api';
import { parseActivePathname } from '../../utils/url-parser';
import { StoryMapper } from '../../data/api-mapper';
import { generatePopoutMap } from '../../components/templates';
import Database from '../../utils/database';
import { useToast } from '../../utils/toast';

export default class Detail {
  #presenter = null as DetailPresenter | null;
  #map = null as Map | null;
  #pendingMarkers: {
    coordinate: [number, number];
    markerOptions: any;
    popupOptions: any;
  } = {
    coordinate: [0, 0],
    markerOptions: {},
    popupOptions: {},
  };

  async render() {
    return `
        <section id="detail-container" class="container mt-24 mb-20">
            <div id="detail-story" class=""></div>
            <div id="detail-story-loading-container" class="hidden"></div>
        </section>`;
  }

  async afterRender() {
    this.#presenter = new DetailPresenter(parseActivePathname().id as string, {
      view: this,
      model: STORY_API,
      dbModel: Database,
    });

    await this.#presenter?.initialStory();
  }

  async populateStory(message: string, story: StoryMapper) {
    if (!story) {
      this.populateStoryError(message);
      return;
    }

    const container = document.getElementById('detail-story') as HTMLDivElement;

    const html = `
        <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1 items-center justify-center mb-5">
               <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">${story.name}</h1>
                <p class="text-sm sm:text-xl lg:text-2xl font-medium text-center">"${story.description}"</p>
            </div>

            <div class="grid grid-cols-12 gap-4">
                <div class="relative col-span-12 lg:col-span-8 w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden rounded-lg card !bg-white">
                    <img src="${story.photoUrl}" alt="${story.name}-${story.description}" class="h-full w-full object-contain rounded-t-lg"/>
                </div>
                ${
                  story.location
                    ? `
                        <div id="map" class="h-[350px] sm:h-[500px] lg:h-[600px] col-span-12 lg:col-span-4 rounded-2xl card"></div>
                    `
                    : ''
                }
                <div class="col-span-12 flex items-center justify-between">
                    <p class="text-sm md:text-base font-semibold">Aksi</p>
                    <div id="action-container" class="flex gap-2 items-center justify-start flex-wrap">
                        <button id="btn-action" class="button-custom-neutral">Bookmark Cerita</button>
                    </div>
                </div>
            </div>

        </div>
    `;

    container.innerHTML = html;

    this.storeMarkerData(story);

    await this.#presenter?.showSaveButton();
  }

  storeMarkerData(story: StoryMapper) {
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

    this.#pendingMarkers = {
      coordinate,
      markerOptions,
      popupOptions,
    };
  }

  processPendingMarkers() {
    if (!this.#map || !this.#pendingMarkers) return;

    const { coordinate, markerOptions, popupOptions } = this.#pendingMarkers;
    if (coordinate && markerOptions && popupOptions) {
      this.#map.addMarker(coordinate, markerOptions, popupOptions);
    } else {
      console.warn('No pending markers to process');
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
        center: this.#pendingMarkers.coordinate,
        locate: true,
      });

      this.processPendingMarkers();
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  }

  populateStoryError(message: string) {
    const container = document.getElementById('detail-story') as HTMLDivElement;
    const html = `
        <div class="flex items-center gap-2 text-center justify-center flex-col h-full">
            <h2 class="text-6xl md:text-8xl font-black">Oops!</h2>
            <p class="text-base md:text-2xl">Terjadi kesalahan pengambilan daftar laporan</p>
            <p class="text-sm md:text-base font-bold text-red-500">${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
        </div>
        `;
    container.innerHTML = html;
  }

  showLoading() {
    const container = document.getElementById('detail-story-loading-container') as HTMLDivElement;
    container.classList.remove('hidden');

    container.innerHTML = `
        <div class="grid grid-cols-12 gap-4 h-[70dvh]">
            <div class="col-span-12 lg:col-span-8 w-full h-full overflow-hidden rounded-lg !bg-white">
                <div class="h-full w-full animate-pulse bg-gray-200 rounded-t-lg"></div>
            </div>
            <div class="col-span-12 lg:col-span-4 h-full overflow-hidden rounded-2xl">
                <div class="h-full w-full animate-pulse bg-gray-200 rounded-t-lg"></div>
            </div>
        </div>
    `;
  }

  hideLoading() {
    const container = document.getElementById('detail-story-loading-container') as HTMLDivElement;
    container.classList.add('hidden');
    container.innerHTML = '';
  }

  renderActionButton(isSaved = false) {
    const action = document.getElementById('btn-action') as HTMLDivElement;
    if (!action) return;

    // Remove existing listeners by cloning and replacing the button
    const newButton = action.cloneNode(true) as HTMLDivElement;
    action.parentNode?.replaceChild(newButton, action);

    if (isSaved) {
      newButton.innerText = 'Hapus dari Bookmark';
      newButton.addEventListener('click', async () => {
        await this.#presenter?.removeStory();
        await this.#presenter?.showSaveButton();
      });
    } else {
      newButton.innerText = 'Bookmark Cerita';
      newButton.addEventListener('click', async () => {
        await this.#presenter?.saveStory();
        await this.#presenter?.showSaveButton();
      });
    }
  }

  saveToBookmarkSuccessfully(message: string) {
    useToast(message, 'success');
  }
  saveToBookmarkFailed(message: string) {
    useToast(message, 'error');
  }
}
