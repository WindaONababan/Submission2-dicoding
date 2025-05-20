import { IStory } from '../types/api';
import Map from '../utils/maps';

export type StoryMapper = {
  id: string;
  name: string;
  description: string;
  photoUrl: string;
  createdAt: string;
  location?: {
    longitude: number;
    latitude: number;
    placeName: string;
  } | null;
};

export async function storyMapper(story: IStory): Promise<StoryMapper> {
  if (story.lat === null || story.lon === null) {
    return {
      id: story.id,
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      createdAt: story.createdAt,
      location: null,
    };
  }

  return {
    id: story.id,
    name: story.name,
    description: story.description,
    photoUrl: story.photoUrl,
    createdAt: story.createdAt,
    location: {
      longitude: story.lon,
      latitude: story.lat,
      placeName: await Map.getPlaceNameByCoordinate(story.lat, story.lon),
    },
  };
}
