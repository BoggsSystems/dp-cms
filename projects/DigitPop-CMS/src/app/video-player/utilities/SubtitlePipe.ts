import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'subtitle' })
export class SubtitlePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(subtitle: any) {
    return subtitle.substring(0, 50);
  }
}
