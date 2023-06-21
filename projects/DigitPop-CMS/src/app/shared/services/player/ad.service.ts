import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'projects/DigitPop-CMS/src/environments/environment';

interface AdRequest {
  videoId: string;
  isConsumer: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdService {
  constructor(private httpClient: HttpClient) {
  }

  getAd = (videoId: any, isConsumer: boolean) => {
    return this.httpClient.get(`${environment.apiUrl}/api/projects/${videoId}/true/${isConsumer}`);
  }

  onPremGetAd = (requestBody: AdRequest) => {
    return this.httpClient.post(`${environment.apiUrl}/api/projects`, requestBody);
  }

  createView = (adId: any) => {
    return this.httpClient.post<any>(`${environment.apiUrl}/api/views/`, {
      id: adId,
    });
  }

  updateStats = (projectId: string, action: string, productId = '') => {
    const source = 'campaign';

    return this.httpClient.put<any>(`${environment.apiUrl}/api/metrics/`, {
      source,
      project: projectId,
      action,
      productId
    });
  }

  // increaseProjectViewCount(videoId: any) {
  //   return this.httpClient.put<any>(
  //     `${environment.apiUrl}/api/projects/` + videoId + `/count/videowatch`,
  //     null
  //   );
  // }

  // increaseProductClickCount(product: Product) {
  //   return this.httpClient.put<any>(
  //     `${environment.apiUrl}/api/products/` + product._id + `/count/click`,
  //     product
  //   );
  // }

  // increaseProductActionCount(product: Product) {
  //   return this.httpClient.put<any>(
  //     `${environment.apiUrl}/api/products/` + product._id + `/count/buynowclick`,
  //     product
  //   );
  // }

  // increaseProductGroupPauseCount(productGroup: ProductGroup) {
  //   return this.httpClient.put<any>(
  //     `${environment.apiUrl}/api/productGroups/` +
  //       productGroup._id +
  //       `/count/pause`,
  //     productGroup
  //   );
  // }
}
