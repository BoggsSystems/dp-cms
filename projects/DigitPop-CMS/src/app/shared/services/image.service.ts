import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'projects/DigitPop-CMS/src/environments/environment';
import { HTTP_NO_INTERCEPTORS } from '../../app.module';

@Injectable({ providedIn: 'root' })
export class ImageService {
  constructor(@Inject(HTTP_NO_INTERCEPTORS)  private httpClient: HttpClient) {}
  //constructor(private httpClient: HttpClient) {}

  upload(file: File) {
    const fd = new FormData();
    fd.append('upload_preset', environment.CLOUDINARY_UPLOAD_PRESET);
    fd.append('file', file);

    return this.httpClient.post<any>(
      `https://api.cloudinary.com/v1_1/${environment.CLOUDINARY_CLOUD_NAME}/image/upload`,
      fd,
      {
        reportProgress: true,
        observe: 'events',
      }
    );
  }
}
