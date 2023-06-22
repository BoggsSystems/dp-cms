import {environment} from '../../../environments/environment';
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {Cloudinary} from '../helpers/cloudinary';
import {ProjectMedia} from '../models/ProjectMedia';
import {Category} from '../models/category';

@Injectable({
  providedIn: 'root'
})

export class VideosGridService {
  readonly endpoint = `${environment.apiUrl}/api/videos`;
  cachedVideo$: Observable<ProjectMedia[]>;
  cacheMap: Map<string, Observable<ProjectMedia[]>> = new Map();

  constructor(private httpClient: HttpClient) {
  }

  getVideos = (categories: string[], page: number, limit: number, userId: string | null, lastCampaignId: string | null = null): Observable<ProjectMedia[]> => {
    let params = new HttpParams();
    params = categories.length ? params.append('categories', categories.join(',')) : null;
    params = params.append('page', page.toString());
    params = params.append('limit', limit.toString());
    params = params.append('userId', userId);

    if (lastCampaignId) {
      params = params.append('lastCampaignId', lastCampaignId);
    }

    this.cachedVideo$ = this.cacheMap.has(params.toString()) ? this.cacheMap.get(params.toString()) : null;
    if (!this.cachedVideo$) {
      this.cachedVideo$ = this.httpClient.get(this.endpoint, {params})
        .pipe(map((response: any) => {
          response = response.filter((video: any) => video.hasOwnProperty('media'));
          response = Cloudinary.resizeThumbnail(response, 353, 170);
          return this.secondsToMMSS(response);
        }), shareReplay(1));
      this.cacheMap.set(params.toString(), this.cachedVideo$);
    }
    return this.cachedVideo$;
  }

  getActiveCategories = (): Observable<Category[]> => {
    const categories = this.httpClient.get(`${this.endpoint}/categories`)
      .pipe(map((response: Category[]) => response), shareReplay(1));
    return categories;
  }

  private secondsToMMSS = (videos: ProjectMedia[]) => {
    const padWithZero = (time: number) => time.toString().padStart(2, '0');
    const timestamp = (seconds: number) => {
      const minutes = (seconds - (seconds % 60)) / 60;
      const remainingSeconds = Math.round(seconds % 60);
      return `${padWithZero(minutes)}:${padWithZero(remainingSeconds)}`;
    };
    return videos.map(video => {
      video.media.duration = timestamp(+video.media.duration);
      return video;
    });
  }

}
