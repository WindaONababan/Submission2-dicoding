import { openDB } from 'idb';
import { IStory } from '../types/api';

const DATABASE_NAME = 'ceritain';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-story';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: 'id',
    });
  },
});

const Database = {
  async putStory(story: IStory) {
    if (!Object.prototype.hasOwnProperty.call(story, 'id')) {
      throw new Error('Story must have an id');
    }

    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },
  async getStory(id: string) {
    if (!id) {
      throw new Error('Story id is required');
    }

    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  async deleteStory(id: string) {
    if (!id) {
      throw new Error('Story id is required');
    }

    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default Database;
