import { IAddNewStory } from '../../types/api';

type AddNewStory = {
  showMapLoading(): void;
  hideMapLoading(): void;
  initialMap(): Promise<void>;
  showSubmitLoadingButton(): void;
  hideSubmitLoadingButton(): void;
  storeSuccessfully(message: string): void;
  storeFailed(message: string): void;
};

type AddNewStoryModel = {
  mutateNewStory(data: IAddNewStory): Promise<{
    ok: boolean;
    error: boolean;
    message: string;
  }>;
};

export default class AddNewStoryPresenter {
  #view: AddNewStory;
  #model: AddNewStoryModel;

  constructor({ view, model }: { view: AddNewStory; model: AddNewStoryModel }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showNewFormMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewStory({ description, lat, lon, photo }: IAddNewStory) {
    this.#view.showSubmitLoadingButton();
    try {
      const data = {
        description: description,
        lat: lat,
        lon: lon,
        photo: photo,
      };
      const response = await this.#model.mutateNewStory(data);

      if (!response.ok) {
        console.error('postNewReport: response:', response);
        this.#view.storeFailed(response.message);
        return;
      }

      this.#view.storeSuccessfully(response.message);
    } catch (error) {
      console.error('postNewReport: error:', error);
      this.#view.storeFailed((error as Error).message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
