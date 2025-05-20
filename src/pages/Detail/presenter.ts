import { StoryMapper, storyMapper } from '../../data/api-mapper';
import { IStory } from '../../types/api';

interface DetailView {
  showLoading(): void;
  hideLoading(): void;
  initialMap(): Promise<void>;
  populateStoryError(message: string): void;
  populateStory(message: string, story: StoryMapper): void;
  saveToBookmarkSuccessfully(message: string): void;
  saveToBookmarkFailed(message: string): void;
  renderActionButton(isSaved: boolean): void;
}

interface DetailModel {
  getDetailStory(storyId: string): Promise<{
    ok: boolean;
    message: string;
    story: IStory;
  }>;
}

interface DatabaseModel {
  putStory(story: IStory): Promise<IDBValidKey>;
  getStory(id: string): Promise<any>;
  deleteStory(id: string): Promise<void>;
}

export default class DetailPresenter {
  #storyId: string;
  #view: DetailView;
  #model: DetailModel;
  #dbModel: DatabaseModel;

  constructor(
    storyId: string,
    { view, model, dbModel }: { view: DetailView; model: DetailModel; dbModel: DatabaseModel },
  ) {
    this.#storyId = storyId;
    this.#view = view;
    this.#model = model;
    this.#dbModel = dbModel;
  }

  async initialStory() {
    this.#view.showLoading();

    let storyData;

    try {
      const response = await this.#model.getDetailStory(this.#storyId);
      if (!response.ok) {
        console.error('initialStory: error:', response);
        this.#view.populateStoryError(response.message);
        return;
      }

      storyData = await storyMapper(response.story);

      // First populate the story - this creates the map container in the DOM
      this.#view.populateStory('Success', storyData);

      // Then initialize the map after the container exists
      await this.#view.initialMap();
    } catch (error) {
      console.error('initialStory: error:', error);
      this.#view.populateStoryError((error as Error).message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async saveStory() {
    try {
      const report = await this.#model.getDetailStory(this.#storyId);
      await this.#dbModel.putStory(report.story);

      this.#view.saveToBookmarkSuccessfully('Berhasil menyimpan cerita ke bookmark');
    } catch (error) {
      console.error('Error saving report:', error);
      this.#view.saveToBookmarkFailed((error as Error).message);
    }
  }

  async removeStory() {
    try {
      await this.#dbModel.deleteStory(this.#storyId);
      this.#view.saveToBookmarkSuccessfully('Berhasil menghapus cerita dari bookmark');
    } catch (error) {
      console.error('Error removing report:', error);
      this.#view.saveToBookmarkFailed((error as Error).message);
    }
  }

  async showSaveButton() {
    const isSaved = await this.#isStorySaved();
    this.#view.renderActionButton(isSaved);
  }

  async #isStorySaved() {
    return !!(await this.#dbModel.getStory(this.#storyId));
  }
}
