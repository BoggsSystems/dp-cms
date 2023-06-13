import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {catchError, first, mergeMap} from 'rxjs/operators';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ThemePalette} from '@angular/material/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Project} from '../../shared/models/project';
import {ProductGroup} from '../../shared/models/productGroup';
import {BillsbyService} from '../../shared/services/billsby.service';
import {CampaignService} from '../../shared/services/campaign.service';
import {ProjectService} from '../../shared/services/project.service';
import {ProductGroupService} from '../../shared/services/product-group.service';
import {WelcomeComponent} from '../help/welcome/welcome.component';
import {ProjectsHelpComponent} from '../help/projects/projects-help.component';
import {
  ConfirmDialogComponent
} from '../confirm-dialog/confirm-dialog.component';
import {Campaign} from '../../shared/models/campaign';
import {OkDialogComponent} from '../ok-dialog/ok-dialog.component';
import {
  NotificationDialogComponent
} from "../notification-dialog/notification-dialog.component";
import {Cache, RequestArguments} from '../../shared/helpers/cache';
import { Cloudinary } from '../../shared/helpers/cloudinary';

import { BusinessUserService } from '../../shared/services/accounts/business-user.service';
import { Subject, from, of } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

interface TablesSettings {
  [key: string]: any;
}

interface SortSettings {
  [key: string]: any;
}

@Component({
  selector: 'DigitPop-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [trigger('detailExpand', [state('collapsed', style({
    height: '0px',
    minHeight: '0'
  })), state('expanded', style({height: '*'})), transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),]), trigger('pgDetailExpand', [state('collapsed', style({
    height: '0px',
    minHeight: '0'
  })), state('expanded', style({height: '*'})), transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),]),],
})

export class DashboardComponent implements OnInit, AfterViewInit {
  projectsCols: string[] = ['thumbnail', 'name', 'watchCount', 'pauseCount', 'clickCount', 'buyNowCount', 'active', 'createdAt', 'updatedAt', 'edit',];

  displayedColumns2: string[] = ['name', 'project', 'completionCount', 'engagementCount', 'impressionCount', 'budgetAmount', 'active', 'createdAt', 'updatedAt', 'campaignEdit',];

  innerDisplayedColumns: string[] = ['title', 'pauseCount', 'clickCount'];
  innerProductDisplayedColumns: string[] = ['thumbnail', 'productName', 'productClickCount', 'clickBuyNowCount',];
  dataSource: any;
  campaignsDataSource: any;
  nestedDataSource: String[] = [];
  error = '';
  cid: any;
  width: any;
  height: any;
  expandedElement: Project | null;
  expandedProductGroupElement: ProductGroup | null;
  color: ThemePalette = 'primary';
  projectsPage = 0;
  projectsPageSize = 5;
  campaignsPage = 0;
  campaignsPageSize = 5;
  isFiltered = false;
  filterValue = '';
  sortBy = 'createdAt';
  sortDirection = 'desc';
  private filterChange$ = new Subject<string>();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild('campaignPaginator') campaignPaginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild('campaignSorter') campaignSorter: MatSort;

  constructor(private route: ActivatedRoute, private billsbyService: BillsbyService, private campaignService: CampaignService, private breakpointObserver: BreakpointObserver, private projectService: ProjectService, private productGroupService: ProductGroupService, private router: Router, public dialog: MatDialog,
  private businessUser: BusinessUserService,
  ) {
    this.height = 25;
    this.width = 150;
  }

  openWelcomeDialog(): void {
    const dialogRef = this.dialog.open(WelcomeComponent, {
      width: '100%', height: '90%',
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  welcome() {
    if (!this.businessUser.currentUserValue.welcomed) {
      this.openWelcomeDialog();

      this.businessUser.welcome().subscribe((res) => {
        this.businessUser.currentUserValue.welcomed = true;
        this.businessUser.storeUser(this.businessUser.currentUserValue);
      }, (error) => {
        this.error = error;
      });
    }
  }

  ngOnInit() {
    this.getTablesSetting();
    this.welcome();
    if (sessionStorage.getItem('sort-settings')) {
      const settings = JSON.parse(sessionStorage.getItem('sort-settings'));
      this.sortBy = settings.active;
      this.sortDirection = settings.direction;
    }
  }

  ngAfterViewInit() {
    this.getProjects();
  }

  getTablesSetting() {
    if (sessionStorage.getItem('projectsTable') !== null) {
      const settings = sessionStorage.getItem('projectsTable');
      this.projectsPage = +JSON.parse(settings).page;
      this.projectsPageSize = +JSON.parse(settings).pageSize;
    }
    if (sessionStorage.getItem('campaignsTable') !== null) {
      const settings = sessionStorage.getItem('campaignsTable');
      this.campaignsPage = +JSON.parse(settings).page;
      this.campaignsPageSize = +JSON.parse(settings).pageSize;
    }
  }

  async getProjects() {
    if (sessionStorage.getItem('my-projects') !== null) {
      const cachedResponse: any = sessionStorage.getItem('my-projects');
      const data = JSON.parse(cachedResponse);
      this.renderProjects(data);
    } else {
      this.projectService
        .getMyProjects()
        .subscribe((res: any) => {
          Cloudinary.resizeThumbnail(res);
          sessionStorage.setItem('my-projects', JSON.stringify(res));
          this.renderProjects(res);
          return this.populateProjects();
        }, (error) => {
          this.error = error;
        });
    }
  }

  async populateProjects(args: RequestArguments = {
    page: 0, pageSize: 5
  }) {
    let projectsDetails;
    let projectsTableSettings;

    projectsTableSettings = JSON.parse(sessionStorage.getItem('projectsTable'));

    if (arguments.length && Object.keys(args).length) {
      projectsDetails = await Cache.createProjectDetails(this.projectService, args);
      return this.renderProjects(projectsDetails);
    }

    if (projectsTableSettings) {
      projectsDetails = await Cache.createProjectDetails(this.projectService, projectsTableSettings);
    } else {
      projectsDetails = await Cache.createProjectDetails(this.projectService);
    }
    return this.renderProjects(projectsDetails);
  }

  onTableChange(event: any, source: string) {
    if (source === 'projects') {
      const ProjectsTable: TablesSettings = {};

      if (this.projectsPage !== event.pageIndex) {
        this.projectsPage = event.pageIndex;
      }

      if (this.projectsPageSize !== event.pageSize) {
        this.projectsPageSize = event.pageSize;
      }

      if (sessionStorage.getItem('sort-settings')) {
        const settings = JSON.parse(sessionStorage.getItem('sort-settings'));
        // tslint:disable-next-line:max-line-length
        this.populateProjects({
          page: this.projectsPage,
          pageSize: this.projectsPageSize,
          sortBy: settings.active,
          sortDirection: settings.direction
        });
      } else {
        this.populateProjects({
          page: this.projectsPage, pageSize: this.projectsPageSize
        });
      }
      Object.assign(ProjectsTable, {
        page: this.projectsPage, pageSize: this.projectsPageSize
      });
      sessionStorage.setItem('projectsTable', JSON.stringify(ProjectsTable));
    } else if (source === 'campaigns') {
      const CampaignsTable: TablesSettings = {};

      if (this.campaignsPage !== event.pageIndex) {
        this.campaignsPage = event.pageIndex;
      }

      if (this.campaignsPageSize !== event.pageSize) {
        this.campaignsPageSize = event.pageSize;
      }

      Object.assign(CampaignsTable, {
        page: this.campaignsPage, pageSize: this.campaignsPageSize
      });
      sessionStorage.setItem('campaignsTable', JSON.stringify(CampaignsTable));
    }
  }

  onTableSort(event: Event) {
    const e = (event as SortSettings);
    let sortBy = '';
    const sortedData: any = this.dataSource.sortData(this.dataSource.data, this.dataSource.sort);
    sortBy = this.getSortBase(e.active);
    e.active = sortBy;
    sessionStorage.setItem('sort-settings', JSON.stringify(e));
    if (this.filterValue === '') {
      Cache.createCache(JSON.stringify(sortedData));
    } else {
      sessionStorage.setItem('cached-results', JSON.stringify(sortedData));
    }
    this.populateProjects({
      page: this.projectsPage,
      pageSize: this.projectsPageSize,
      sortBy,
      sortDirection: e.direction
    });
  }

  getSortBase(tableValue: string) {
    switch (tableValue) {
      case 'watchCount':
        return 'stats.videoWatchCount';
      case 'pauseCount':
        return 'stats.videoPauseCount';
      case 'clickCount':
        return 'stats.videoClickCount';
      case 'buyNowCount':
        return 'stats.buyNowClickCount';

      default:
        return tableValue;
    }
  }

  renderProjects(projects: any) {
    this.dataSource = new MatTableDataSource(projects);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (item: any, property: any) => {
      switch (property) {
        case 'watchCount':
          return item.stats.videoWatchCount;
        case 'pauseCount':
          return item.stats.videoPauseCount;
        case 'clickCount':
          return item.stats.videoClickCount;
        case 'buyNowCount':
          return item.stats.buyNowClickCount;

        default:
          return item[property];
      }
    };
  }

  getCampaigns() {
    if (sessionStorage.getItem('my-campaigns') !== null) {
      const cachedResponse: any = sessionStorage.getItem('my-campaigns');
      this.renderCampaigns(JSON.parse(cachedResponse));
    } else {
      this.campaignService
        .getMyCampaigns()
        .pipe(first())
        .subscribe((campaigns: any) => {
          sessionStorage.setItem('my-campaigns', JSON.stringify(campaigns));
          this.renderCampaigns(campaigns);
        }, (error) => {
          this.error = error;
        });
    }
  }

  renderCampaigns(campaigns: any) {
    this.campaignsDataSource = new MatTableDataSource<Campaign>(campaigns);
    this.campaignsDataSource.paginator = this.campaignPaginator;
    this.campaignsDataSource.sortingDataAccessor = (item: any, property: any) => {
      switch (property) {
        case 'name':
          return item.name;
        case 'project':
          return item.project.name;
        case 'completionCount':
          return item.stats.completionCount;
        case 'engagementCount':
          return item.stats.engagementCount;
        case 'impressionCount':
          return item.stats.impressionCount;
        case 'budgetAmount':
          return item.budgetAmount;
        case 'spentAmount':
          return item.spentAmount;
        case 'startDate':
          return item.startDate;
        case 'audienceId':
          return item.audienceId;

        default:
          return item[property];
      }
    };
    this.campaignsDataSource.sort = this.campaignSorter;
  }

  projectsHelp() {
    const dialogRef = this.dialog.open(ProjectsHelpComponent, {
      width: '100%', height: '90%',
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

    if (!filterValue) {
      return this.getProjects();
    }

    this.filterChange$.next();

    const cachedProjects: any[] = JSON.parse(sessionStorage.getItem('cached-results'));

    if (cachedProjects) {
      const filteredData = cachedProjects.filter((project: any) =>
        project.name.toLowerCase().includes(filterValue)
      );
      // return this.renderProjects(filteredData);
      return this.populateFilteredData();
    }

    this.filterChange$.next(filterValue);
  }

  populateFilteredData = () => {
    this.filterChange$
      .pipe(
        switchMap((filterValue) => {
          const filterResults = this.dataSource.filteredData.slice(0, 20); // Get the first 20 filtered results
          const populatedResults: Project[] = [];

          return from(filterResults).pipe(
            mergeMap((result: Project) =>
              this.projectService.getProject(result._id).pipe(
                takeUntil(this.filterChange$), // Cancel previous requests when a new filter value is emitted
                catchError((error) => {
                  // Handle error
                  return of(null); // Return a null value to continue with other requests
                })
              )
            )
          );
        })
      )
      .subscribe((project: Project) => {
        if (project) {
          const cachedProjects: Project[] = JSON.parse(sessionStorage.getItem('cached-results')) || [];
          cachedProjects.push(project);
          sessionStorage.setItem('cached-results', JSON.stringify(cachedProjects));
          this.dataSource.filteredData = cachedProjects;
        }
      });
  };

  applyCampaignsFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.campaignsDataSource.filter = filterValue.trim().toLowerCase();

    if (this.campaignsDataSource.paginator) {
      this.campaignsDataSource.paginator.firstPage();
    }
  }

  launchProjectWizard() {
    this.router.navigate(['/cms/project-wizard']);
  }

  launchCampaignsWizard() {
    this.router.navigate(['/cms/campaign-wizard']);
  }

  onEdit = async (project: Project) => {
    const navigationExtras: NavigationExtras = {
      state: {project},
    };

    return this.router.navigate(['/cms/project-wizard'], navigationExtras);
  }

  deleteProject(project: Project) {
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Project',
        message: `Are you sure you want to delete this project?`,
      },
    });

    confirmDialog.afterClosed().subscribe((result) => {
      if (result === true) {
        this.projectService.deleteProject(project).subscribe((res) => {
          sessionStorage.removeItem('my-projects');
          const deletedDialog = this.dialog.open(NotificationDialogComponent, {
            data: {
              message: `Project deleted successfully.`,
            },
          });
          deletedDialog.afterOpened().subscribe(_ => {
            setTimeout(() => {
              deletedDialog.close();
            }, 3000);
          });

          this.getProjects();
        }, (error) => {
          console.error(error);
          return;
        });
      } else {
        return;
      }
    });

  }

  onCampaignEdit(campaign: Campaign) {
    const navigationExtras: NavigationExtras = {
      state: {campaign},
    };
    this.router.navigate(['/cms/campaign-wizard'], navigationExtras);
  }

  updateCampaignFunc(element: Campaign, e: any) {
    // Retrieve the campaign
    this.campaignService.getCampaign(element).subscribe((res) => {
      const campaign = res as Campaign;

      if (!campaign.project.active) {
        campaign.active = false;
        e.source.checked = false;

        const confirmDialog = this.dialog.open(OkDialogComponent, {
          data: {
            title: 'Project Inactive',
            message: 'The project for this campaign is inactive.  Activate the project before activiating the campaign.',
          },
        });

        return;
      }

      const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Change Status',
          message: 'Are you sure you want to change the status of the campaign?',
        },
      });

      confirmDialog.afterClosed().subscribe((result) => {
        if (result === true) {
          console.log('Element project : ' + element.project);

          element.active = !element.active;
          this.campaignService.updateCampaign(element).subscribe((res) => {
            console.log(res);
          }, (error) => {
            console.log(error);
          });
        } else {
          e.source.checked = element.active;
          console.log('toggle should not change if I click the cancel button');
        }
      });
    }, (error) => {
      console.error(error);
      return;
    });
  }

  updateFunc(element: Project, e: any) {
    if (element.active) {
      this.projectService.getCampaignsForProject(element).subscribe((res) => {
        if (Object.keys(res).length > 0) {
          e.source.checked = true;

          const confirmDialog = this.dialog.open(OkDialogComponent, {
            data: {
              title: 'Active Campaigns',
              message: 'There is at least one active campaign using this project. Deactivate the campaign(s) before deactivating this project.',
            },
          });

          return;
        } else {
          this.updateProjectSubFunc(element, e);
        }
      }, (error) => {
        console.error(error);
        return;
      });
    } else {
      this.updateProjectSubFunc(element, e);
    }
  }

  updateProjectSubFunc(element: Project, e: any) {
    let confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

    const closeDialog = () => {
      if (confirmDialogRef) {
        confirmDialogRef.close();
        confirmDialogRef = null;
      }
    };

    closeDialog();

    const data = {
      title: 'Change Status',
      message: 'Are you sure you want to change the status of the project?',
    };

    console.log(element);

    confirmDialogRef = this.dialog.open(ConfirmDialogComponent, { data });

    confirmDialogRef.afterClosed().subscribe((result) => {
      closeDialog();

      if (result === true) {
        element.active = !element.active;
        this.projectService.updateProject(element).subscribe((res) => {
          this.updateCache(res);
        }, (error) => {
          console.log(error);
        });
      } else {
        e.source.checked = element.active;
        console.log('toggle should not change if I click the cancel button');
      }

    });
  }


  updateCache = (project: Project) => {
    const cachedResponse: any = sessionStorage.getItem('my-projects');
    const data: Project[] = JSON.parse(cachedResponse);
    const projectId: string = project._id;

    const index: number = data.findIndex(obj => obj._id === projectId);

    if (index !== -1) {
      const newObj: Project = {...project};
      data.splice(index, 1, newObj);
    }

    sessionStorage.setItem('my-projects', JSON.stringify(data));
  }

}
