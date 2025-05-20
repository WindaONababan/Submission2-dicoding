import { LeafletEvent, LeafletMouseEvent } from 'leaflet';

import * as STORY_API from '../../data/api';
import AddNewStoryPresenter from './presenter';
import { convertBase64ToBlob } from '../../utils';
import Camera from '../../utils/camera';
import Map from '../../utils/maps';
import { useToast } from '../../utils/toast';

export default class AddNewStory {
  #presenter = null as AddNewStoryPresenter | null;
  #form = null as HTMLFormElement | null;
  #camera = null as Camera | null;
  #isCameraOpen = false;
  #takenPicture = null as { blob: Blob } | null;
  #map = null as Map | null;

  async render() {
    return `
      <section class="page-wrapper">
        <div class="flex flex-col gap-1 items-center justify-center text-center mb-5">
          <h1 class="text-2xl md:text-3xl font-extrabold text-primary-700">✨ Cerita apa hari ini?</h1>
          <p class="text-base md:text-lg text-gray-600">Lengkapi formulir di bawah dan bagikan pengalamanmu 📸</p>
        </div>
        <div class="card flex items-center justify-center shadow-2xl bg-white rounded-2xl p-6">
          <form id="add-new-story-form" class="flex flex-col gap-5 w-full max-w-lg">
            <div class="flex flex-col gap-2">
              <label for="description" class="text-sm font-medium">Deskripsi</label>
              <textarea id="description" name="description" placeholder="Ceritakan kisahmu disini..." required class="textarea-custom resize-none rounded-xl border border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-100"></textarea>
            </div>
            <div class="flex flex-col gap-2">
              <label for="input-picture" class="text-sm font-medium">Foto</label>
              <div class="flex items-center flex-wrap gap-2">
                <button id="action-input-picture" type="button" class="button-custom-neutral bg-primary-100 text-primary-700 hover:bg-primary-200 transition-all">📁 Ambil Gambar</button>
                <input id="input-picture" name="documentations" type="file" accept="image/*" hidden="hidden" aria-multiline="true" aria-describedby="picture-preview">
                <button id="action-open-camera" type="button" class="button-custom-neutral bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition-all">📷 Buka Kamera</button>
              </div>
              <div id="camera-container" class="card !hidden">
                <video id="camera-video" class="rounded-base w-full block">Video stream not available.</video>
                <canvas id="camera-canvas" class="hidden"></canvas>
                <div class="flex flex-col gap-2">
                  <select id="camera-select" class="select-custom !w-full"></select>
                  <div class="new-form__camera__tools_buttons">
                    <button id="camera-take-button" class="button-custom-neutral" type="button">Ambil Gambar</button>
                  </div>
                </div>
              </div>
              <div id="documentations-taken-list" class="flex items-center justify-center mt-2"></div>
            </div>
            <div class="flex flex-col gap-2">
              <p class="text-sm font-heading leading-none">Lokasi</p> 
              <div id="map"></div>
              <div id="map-loading-container" class="hidden"></div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="number" name="latitude" value="-6.175389" class="input-custom" disabled>
                <input type="number" name="longitude" value="106.827139" class="input-custom" disabled>
              </div>
            </div>
            <div id="submit-button-container">
              <button type="submit" id="submit-button" class="button-custom">Kirim Cerita</button>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddNewStoryPresenter({
      view: this,
      model: STORY_API,
    });

    this.#takenPicture = null;
    this.#presenter.showNewFormMap();
    this.#setupForm();
  }

  #setupForm() {
    this.#form = document.getElementById('add-new-story-form') as HTMLFormElement;
    this.#form.addEventListener('submit', async (event: Event) => {
      event.preventDefault();

      if (!this.#takenPicture) {
        useToast('Silahkan ambil gambar atau pilih gambar terlebih dahulu', 'error');
        return;
      }

      const data = {
        description: this.#form?.description.value,
        photo: this.#takenPicture?.blob,
        lat: this.#form?.latitude.value,
        lon: this.#form?.longitude.value,
      };

      await this.#presenter?.postNewStory(data);
    });

    const actionInputPicture = document.getElementById('action-input-picture');
    const inputPicture = document.getElementById('input-picture') as HTMLInputElement;
    const cameraContainer = document.getElementById('camera-container') as HTMLDivElement;
    const actionOpenCamera = document.getElementById('action-open-camera') as HTMLButtonElement;

    actionInputPicture?.addEventListener('click', () => {
      inputPicture.click();
    });

    inputPicture?.addEventListener('change', async (event: Event) => {
      const insertingPicture = (event.target as HTMLInputElement).files?.[0];
      if (insertingPicture) {
        this.#takenPicture = { blob: insertingPicture };
        await this.#populateTakenPicture();
      }
    });

    actionOpenCamera?.addEventListener('click', async (event: Event) => {
      cameraContainer.classList.toggle('!hidden');
      this.#isCameraOpen = !this.#isCameraOpen;
      if (this.#isCameraOpen) {
        (event.currentTarget as HTMLButtonElement).textContent = 'Tutup Kamera';
        this.#setupCamera();
        await this.#camera?.launch();
        return;
      }
      (event.currentTarget as HTMLButtonElement).textContent = 'Buka Kamera';
      this.#camera?.stop();
    });
  }

  async initialMap() {
    try {
      const mapElement = document.getElementById('map');
      if (mapElement && mapElement.clientHeight === 0) {
        mapElement.style.height = '300px';
      }

      this.#map = await Map.build('#map', {
        zoom: 10,
        locate: true,
      });

      const centeredCoordinate = this.#map.getCenter();

      if (this.#validateCoordinates(centeredCoordinate.latitude, centeredCoordinate.longitude)) {
        this.#updateLatLngInput(centeredCoordinate.latitude, centeredCoordinate.longitude);

        const draggableMarker = this.#map.addMarker(
          [centeredCoordinate.latitude, centeredCoordinate.longitude],
          { draggable: true },
        );

        if (draggableMarker) {
          draggableMarker.addEventListener('move', (event: LeafletEvent) => {
            const coordinate = event.target.getLatLng();
            if (this.#validateCoordinates(coordinate.lat, coordinate.lng)) {
              this.#updateLatLngInput(coordinate.lat, coordinate.lng);
            }
          });

          this.#map.addMapEventListener('click', (event: LeafletEvent) => {
            const mouseEvent = event as LeafletMouseEvent;
            if (this.#validateCoordinates(mouseEvent.latlng.lat, mouseEvent.latlng.lng)) {
              draggableMarker.setLatLng(mouseEvent.latlng);
              this.#updateLatLngInput(mouseEvent.latlng.lat, mouseEvent.latlng.lng);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  }

  #validateCoordinates(lat: number, lng: number): boolean {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  #updateLatLngInput(latitude: number, longitude: number) {
    if (!this.#form) return;
    const lat = parseFloat(latitude.toFixed(6));
    const lng = parseFloat(longitude.toFixed(6));
    const longitudeInput = this.#form.elements.namedItem('longitude') as HTMLInputElement | null;
    const latitudeInput = this.#form.elements.namedItem('latitude') as HTMLInputElement | null;
    if (longitudeInput) longitudeInput.value = String(lng);
    if (latitudeInput) latitudeInput.value = String(lat);
  }

  async #addTakenPicture(image: string | Blob) {
    let blob = image;
    if (typeof image === 'string') {
      blob = await convertBase64ToBlob(image, 'image/png');
    }
    if (blob) {
      this.#takenPicture = { blob: blob as Blob };
    }
  }

  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById('camera-video') as HTMLVideoElement,
        canvas: document.getElementById('camera-canvas') as HTMLCanvasElement,
        cameraSelect: document.getElementById('camera-select') as HTMLSelectElement,
      });

      this.#camera.addCheeseButtonListener(
        document.getElementById('camera-take-button') as HTMLButtonElement,
        async () => {
          const image = await this.#camera?.takePicture();
          if (image) {
            await this.#addTakenPicture(image);
            await this.#populateTakenPicture();
          }
        },
      );
    }
  }

  async #populateTakenPicture() {
    if (!this.#takenPicture) return;
    const imageUrl = URL.createObjectURL(this.#takenPicture.blob);
    const html = `
      <div class="relative w-full max-w-md h-[400px] border border-gray-300 rounded-xl overflow-hidden shadow-lg">
        <img 
          id="picture-preview"
          src="${imageUrl}"
          alt="Preview Gambar"
          class="object-contain rounded-xl w-full h-full"
        />
        <button id="action-delete-picture" type="button" class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full text-sm shadow-lg transition-all">✖</button>
      </div>
    `;
    const container = document.getElementById('documentations-taken-list') as HTMLDivElement;
    container.innerHTML = html;

    const deleteButton = document.getElementById('action-delete-picture') as HTMLButtonElement;
    deleteButton.addEventListener('click', () => {
      this.#takenPicture = null;
      container.innerHTML = '';
    });
  }

  storeSuccessfully(message: string) {
    useToast(message, 'success');
    this.clearForm();
    location.hash = '/';
  }

  storeFailed(message: string) {
    useToast(message, 'error');
  }

  clearForm() {
    this.#form?.reset();
  }

  showSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById('submit-button-container');
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
        <button class="button-custom w-full" type="submit" disabled>
          <i class="fas fa-spinner animate-spin"></i> Kirim Cerita
        </button>
      `;
    }
  }

  hideSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById('submit-button-container');
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
        <button class="button-custom w-full" type="submit">Kirim Cerita</button>
      `;
    }
  }

  showMapLoading() {
    const container = document.getElementById('map-loading-container') as HTMLDivElement;
    container.classList.remove('hidden');
    container.classList.add('maps-loading-container', '!h-[300px]');
  }

  hideMapLoading() {
    const mapContainer = document.getElementById('map') as HTMLDivElement;
    const container = document.getElementById('map-loading-container') as HTMLDivElement;
    container.classList.add('hidden');
    container.classList.remove('maps-loading-container', '!h-[300px]');
    mapContainer.classList.add('maps-container', '!h-[300px]');
    container.innerHTML = '';
  }
}
