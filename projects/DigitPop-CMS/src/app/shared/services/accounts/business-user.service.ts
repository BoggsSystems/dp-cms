import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'projects/DigitPop-CMS/src/environments/environment';

import { BusinessUser } from '../../interfaces/business-user.json';

@Injectable({
  providedIn: 'root'
})
export class BusinessUserService {
  private endpoint = `${environment.apiUrl}/api/business-users`;

  constructor(private http: HttpClient) { }

  createUser(user: BusinessUser) {
    return this.http.post(this.endpoint, user);
  }

}
