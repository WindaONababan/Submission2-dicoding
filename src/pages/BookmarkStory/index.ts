import { generateCardStory } from '../../components/templates';
import { StoryMapper } from '../../data/api-mapper';
import Database from '../../utils/database';
import BookmarkStoryPresenter from './presenter';

export default class BookmarkStory {
  #presenter = null as BookmarkStoryPresenter | null;

  async render() {
    return `
        <section id="map-container" class="container mt-24 md:mt-28 lg:mt-32 2xl:mt-40;">
            <div class="flex flex-col gap-1 items-center justify-center mb-5">
                <h1 id="bookmark-title" class="text-sm sm:text-xl lg:text-2xl font-medium text-center">
                    Cerita yang sudah kamu bookmark 
                </h1>
            </div>
        </section>
        <section id="stories-container" class="container min-h-[70svh] my-10">
            <div class="flex flex-col gap-5" >
                <div id="list-story" class="story-container"> </div>
                <div id="loading-container" class="hidden"> </div>
            </div>
        </section>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkStoryPresenter({
      view: this,
      model: Database,
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
        return acc.concat(generateCardStory(story));
      }, '');
      container.innerHTML = html;
    } else {
      console.error('list-story element not found');
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

  populateStoriesListError(message: string) {
    const title = document.getElementById('bookmark-title') as HTMLHeadingElement;
    const container = document.getElementById('stories-container') as HTMLDivElement;
    container.classList.remove('page-wrapper');
    container.classList.add('page-error-wrapper', '!min-h-[73svh]');
    title.classList.add('hidden');

    container.innerHTML = `
         <div class="flex items-center gap-2 text-center justify-center flex-col h-full">
             <h2 class="text-6xl md:text-8xl font-black">Oops!</h2>
             <p class="text-base md:text-2xl">Sepertinya kamu belum menyimpan cerita apapun</p>
             <p class="text-sm md:text-base font-bold text-red-500">${message !== 'Success' ? message : 'Coba simpan 1 cerita dari halaman homepage :)'}</p>
         </div>
     `;
  }
}
