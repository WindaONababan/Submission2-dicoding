import { storyMapper, StoryMapper } from '../../data/api-mapper';

type BookmarkStoryView = {
  showLoading(): void;
  hideLoading(): void;
  populateStoriesListError(message: string): void;
  populateStoriesList(message: string, listStory: StoryMapper[]): void;
};

type BookmarkStoryModel = {
  getAllStories(): Promise<any[]>;
};

export default class BookmarkStoryPresenter {
  #view: BookmarkStoryView;
  #model: BookmarkStoryModel;

  constructor({ view, model }: { view: BookmarkStoryView; model: BookmarkStoryModel }) {
    this.#view = view;
    this.#model = model;
  }

  async initialStories() {
    this.#view.showLoading();

    let storiesData;

    try {
      const response = await this.#model.getAllStories();

      storiesData = await Promise.all(
        response.map(async (story) => {
          const report = await storyMapper(story);
          return report;
        }),
      );
    } catch (error) {
      console.error('initialStories: error:', error);
      this.#view.populateStoriesListError((error as Error).message);
      return;
    } finally {
      this.#view.hideLoading();
    }

    if (storiesData) {
      this.#view.populateStoriesList('Success', storiesData);
    }
  }
}
