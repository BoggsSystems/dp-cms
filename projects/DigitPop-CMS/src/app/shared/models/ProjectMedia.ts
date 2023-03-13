export class ProjectMedia {
  count: number;
  _id: string;
  campaignId: string;
  name: string;
  createdAt: Date;
  category: string;
  categoryId: string;
  media: {
    secure_url: string; duration: number | string;
  };
  thumbnail: {
    secure_url: string;
  };
  watched: boolean;
}
