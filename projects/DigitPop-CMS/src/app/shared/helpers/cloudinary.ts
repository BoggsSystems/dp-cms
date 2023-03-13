import {Project} from '../models/project';
import {ProjectMedia} from '../models/ProjectMedia';

export const Cloudinary = {
  resizeThumbnail: (projects: Project[] | ProjectMedia[], imageWidth: number = 50, imageHeight: number = 50, objectFit: string = 'c_fill') => {
    projects.forEach((project: Project | ProjectMedia) => {
      if ('thumbnail' in project) {
        const url = project.thumbnail.secure_url;
        const queryTerm = 'upload/';
        const queryLength = queryTerm.length;
        const uploadsIndex = url.indexOf(queryTerm);
        const paramsIndex = uploadsIndex + queryLength;
        const params = `${objectFit},h_${imageHeight},w_${imageWidth}/`;
        project.thumbnail.secure_url = url.substr(0, paramsIndex) + params + url.substr(paramsIndex);
      }
    });
    return projects;
  },
};
