import { StoryMapper } from '../data/api-mapper';

export const generateNavigationUnauthenticated = () => {
  return `
        <li class="absolute top-0 right-0 m-3 lg:hidden px-2">
            <button id="close-button" class="button-custom"
            tabindex="0" aria-label="Tutup Menu"
            >X</button>
        </li>
        <li><a class="block px-3 py-2 text-gray-800 hover:underline" href="#/login">Masuk</a></li>
        <li><a class="block px-3 py-2 text-gray-800 hover:underline" href="#/register">Daftar</a></li>
    `;
};

export const generateNavigationAuthenticated = () => {
  return `
        <li class="absolute top-0 right-0 m-3 lg:hidden px-2">
            <button id="close-button" class="button-custom"
            tabindex="0" aria-label="Tutup Menu"
            >X</button>
        </li>
       <li>
        <a
            href="#/add-new-story"
            class="inline-flex items-center gap-2 px-4 py-3 min-h-[45px] rounded-base bg-main text-main-foreground font-semibold shadow-md hover:shadow-lg hover:brightness-110 transition">
            ✍️ Tambah Ceritamu
        </a>
        </li>
        <li>
        <a
            class="inline-flex items-center gap-2 px-4 py-3 min-h-[45px] rounded-base bg-main text-main-foreground font-semibold shadow-md hover:shadow-lg hover:brightness-110 transition"
            href="#/bookmark-story">
            📌 Bookmark Cerita
        </a>
        </li>

        <li id="action-push-notification"></li>
        <li>
            <a
                id="logout-button"
                href="#/logout"
                class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-base border-2 border-red-500 text-red-500 font-semibold hover:bg-red-500 hover:text-white transition min-w-[44px] min-h-[44px]"
            >
                🚪 Keluar
            </a>

        </li>

    `;
};

export const generateSubscribeButtonTemplate = () => {
  return `
    <button
    id="subscribe-button"
    class="inline-flex items-center justify-center gap-2 px-6 py-2 min-w-[44px] min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out"
    >
    💚 Subscribe
    </button>

  `;
};

export const generateUnsubscribeButtonTemplate = () => {
  return `
    <button
      id="unsubscribe-button"
      class="px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out"
    >
      💔 Unsubscribe
    </button>
  `;
};


export const generateCardStory = ({
  id,
  name,
  createdAt,
  description,
  location,
  photoUrl,
}: StoryMapper) => {
  return `
        <div tabindex="0" data-storyid="${id}" class="card">
            <div class="flex flex-col gap-2">
                <div class="relative w-full h-64 overflow-hidden rounded-lg">
                    <img src="${photoUrl}" alt="${name}-${description}" class="h-64 w-full object-cover rounded-t-lg"/>
                </div>
                <div class="card-header">
                    <h2 class="text-lg font-semibold">${name}</h2>
                    <div class="flex items-start flex-wrap justify-between w-full">
                        ${
                          location
                            ? `<p class="text-base w-2/3"> <i class="fas fa-map-marker-alt"></i> ${location.placeName}</p>`
                            : ``
                        }
                        <p class="text-sm">${new Date(createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <p class="text-base line-clamp-3">${description}</p>
                <div class="flex items-center justify-end"> 
                    <a class="button-custom w-fit min-w-[44px] min-h-[44px] flex items-center justify-center px-4 py-2" href="#/story/${id}">
                        Lihat Detail
                    </a>

                </div>
            </div>
        </div>
    `;
};

export const generatePopoutMap = ({ story }: { story: StoryMapper }) => {
  return `
        <div class="flex flex-col">
            <p class="font-bold">${story.name}</p>
            <div class="relative w-32 h-32 sm:w-60 sm:h-60 overflow-hidden rounded-lg">
                <img src="${story.photoUrl}" alt="${story.name}-${story.description}" class="object-cover rounded-lg w-full h-full "/>
            </div>
            <p class="text-sm">${story.description}</p>
        </div>
        `;
};
