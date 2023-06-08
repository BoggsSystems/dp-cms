import {Router} from '@angular/router';
import {ProjectService} from '../services/project.service';
import {CampaignService} from '../services/campaign.service';
import * as _ from 'lodash';
import {Project} from '../models/project';
import { first } from 'rxjs/operators';

export interface RequestArguments {
  page: number;
  pageSize: number;
  sorted?: boolean;
  sortBy?: string;
  sortDirection?: string;
  filtered?: boolean;
  filter?: string;
}

interface SortOptions {
  sortType?: string;
  sortBy?: string;
  sortDirection?: number;
}

const sortBy = 'createdAt';
const sortDirection = -1;

const sortData = (data: any, sortOptions: SortOptions = {
  sortType: 'date', sortBy, sortDirection
}) => {
  const orders = sortOptions.sortDirection > 0 ? 'asc' : 'desc';
  let sortCondition;
  switch (sortOptions.sortType) {
    case (`date`):
      sortCondition = (o: any) => new Date(o[sortOptions.sortBy]);
      break;
    default:
      sortCondition = (o: any) => o[sortOptions.sortBy].toLowerCase();
      break;
  }
  return _.orderBy(data, sortCondition, [orders]);
};

export const Cache = {
  async createUserCache(user: any, role: string = 'Business', storageType: 'session' | 'local' = 'session') {
    localStorage.setItem('currentRole', role);
    localStorage.setItem('currentuser', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
  },

  createCache: (data: any, key: string = 'my-projects') => {
    sessionStorage.setItem(key, data);
  },

  createProjectDetails: async (projectService: ProjectService, args: RequestArguments = {
    page: 0, pageSize: 5,
  }) => {
    let projects;
    let sortedProjects;

    args.page = args.page ? args.page : 0;
    args.pageSize = args.pageSize ? args.pageSize : 5;
    args.sorted = args.sorted ? args.sorted : true;
    args.sortBy = args.sortBy ? args.sortBy : sortBy;
    args.sortDirection = args.sortDirection ? args.sortDirection : (sortDirection > 0 ? 'asc' : 'desc');
    args.filtered = args.filtered ? args.filtered : false;
    args.filter = args.filter ? args.filter : null;

    if (!args.sorted) {
      delete args.sorted;
      delete args.sortBy;
      delete args.sortDirection;
    }

    try {
      projects = await projectService.populateMyProject(args) as [{}];
      const currentTable: any = args.filtered && args.filter !== '' ? sessionStorage.getItem('cached-results') : sessionStorage.getItem('my-projects');
      const data: any = JSON.parse(currentTable);
      /* Sort retrieved sessionStorage data in sync with table sort
       * default sort: sort by updatedBy, desc
      */
      // data = sortData(data);
      projects.forEach((project: Project) => {
        const index = data.findIndex((t: Project) => t._id === project._id);
        data[index] = project;
      });
      sortedProjects = data;
      if (args.filtered && args.filter !== '') {
        Cache.createCache(JSON.stringify(data), 'cached-results');
      } else {
        Cache.createCache(JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
    }

    return sortedProjects;
  },

  invokeCache: (key: string = 'my-projects') => {
    sessionStorage.removeItem('my-campaigns');
    sessionStorage.removeItem(key);
  },

  updateCampaignsCache: async (campaignService: CampaignService) => {
    campaignService
      .getMyCampaigns()
      .pipe(first())
      .subscribe((campaigns: any) => {
        sessionStorage.setItem('my-campaigns', JSON.stringify(campaigns));
      }, (error) => {
        console.error(error);
      });
  },

  invokeCampaignsCache: () => {
    sessionStorage.removeItem('my-campaigns');
  },

  exitTrial: (router: Router) => {
    localStorage.removeItem('currentuser');
    localStorage.removeItem('XchaneCurrentUser');
    localStorage.removeItem('currentRole');
    router.navigate(['/']).then(r => {
      return;
    });
  },
};
