import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Metric } from '../models/metric';
import { environment } from 'projects/DigitPop-CMS/src/environments/environment';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({ providedIn: 'root' })
export class MetricsService {

    constructor(private http: HttpClient) { }

    createMetric(metric: Metric) {
        console.log('In createMetric');

        return this.http.post<any>(`${environment.apiUrl}/api/metrics`, {
          metric,
        });
    }

}
