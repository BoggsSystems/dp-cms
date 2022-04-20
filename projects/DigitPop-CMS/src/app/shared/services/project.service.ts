import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, publishReplay, refCount, shareReplay } from 'rxjs/operators';
import { Project } from '../models/project';
import { environment } from 'projects/DigitPop-CMS/src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  projectList$: Observable<Object>;

  constructor(private httpClient: HttpClient) {}

  addProject(project: any) {
    this.projectList$ = null;

    return this.httpClient.post<any>(`${environment.apiUrl}/api/projects`, {
      project,
    });
  }

  updateProject(project: Project) {
    return this.httpClient.put<any>(
      `${environment.apiUrl}/api/projects/` + project._id,
      {
        project,
      }
    );
  }

  updateProjectProductGroups(project: Project) {
    return this.httpClient.put<any>(
      `${environment.apiUrl}/api/projects/` +
        project._id +
        '/updateProductGroups',
      {
        project,
      }
    );
  }

  sendEmail(email: any) {
    return this.httpClient.post<any>(
      `${environment.apiUrl}/api/projects/email`,
      { email }
    );
  }

  getProjects() {
    return this.httpClient
      .get(`${environment.apiUrl}/api/projects`)
      .pipe(shareReplay({ refCount: true, bufferSize: 1 }));
  }

  getProject(id: any) {
    return this.httpClient.get(
      `${environment.apiUrl}/api/projects/` + id + '/true'
    );
  }

  public getProjects$(): Observable<Object> {
    if (!this.projectList$) {
      this.projectList$ = this.httpClient
        .get(`${environment.apiUrl}/api/projects/myprojects`)
        .pipe(shareReplay(1));
    }
    return this.projectList$;
  }

  getMyProjects() {
    return this.httpClient
      .get(`${environment.apiUrl}/api/projects/myprojects`)
      .pipe(publishReplay(1), refCount());
  }

  populateMyProject(page: number, pageSize: number, sorted: boolean = false, sortby: string = '', sortdir: string = '') {
    let reqUrl: string;
    if(sorted) {
      reqUrl = `${environment.apiUrl}/api/projects/populateproject?page=${page}&pageSize=${pageSize}&sortby=${sortby}&sortdir=${sortdir}`;
    } else {
      reqUrl = `${environment.apiUrl}/api/projects/populateproject?page=${page}&pageSize=${pageSize}`;
    }
    return this.httpClient
    .get(reqUrl)
    .pipe(publishReplay(1), refCount());
  }

  getPublishedProjects() {
    return this.httpClient.get(
      `${environment.apiUrl}/api/projects?activeOnly=true`
    );
  }

  getPublishedProjectsByCategory(category: any) {
    return this.httpClient.get(
      `${environment.apiUrl}/api/projects?activeOnly=true&category=` + category
    );
  }

  getCampaignsForProject(project : Project) {
    return this.httpClient.put<any>(
      `${environment.apiUrl}/api/projects/` +
        project._id +
        '/getCampaignsForProject',
      {
        project
      }
    );
  }
}
