export type IStory = {
  id: string;
  name: string;
  description: string;
  photoUrl: string;
  createdAt: string;
  lat: number;
  lon: number;
};

export type IAddNewStory = {
  description: string;
  photo: Blob;
  lat: number;
  lon: number;
};
