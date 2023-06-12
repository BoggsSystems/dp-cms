import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'digit-pop-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  @ViewChild('sectionsContainer') sectionsContainer!: ElementRef<HTMLDivElement>;

  sections = [
    { title: 'Information We Collect', id: 'information-collection' },
    { title: 'Use of Information', id: 'information-usage' },
    { title: 'Disclosure of Information', id: 'disclosure' },
    { title: 'Data Retention', id: 'data-retention' },
    { title: 'Security', id: 'security' },
    { title: 'Children\'s Privacy', id: 'children' },
    { title: 'Your Rights', id: 'your-rights' },
    { title: 'Changes to this Privacy Policy', id: 'change-to-policy' },
    { title: 'Contact Us', id: 'contact' },
  ];
  currentSectionId = '';

  constructor() { }

  ngOnInit(): void {
    this.setCurrentSection(this.sections[0].id); // Set the initial current section
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    this.highlightSectionOnScroll();
  }

  scrollToSection(event: Event, id: string) {
    event.preventDefault();
    this.setCurrentSection(id);
    const el = document.getElementById(id);
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    const elTop = el?.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    window.scrollTo({ top: elTop, behavior: 'smooth' });
  }

  setCurrentSection(id: string) {
    this.currentSectionId = id;
  }

  highlightSectionOnScroll() {
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    const scrollPosition = window.scrollY + headerHeight;
    const offset = window.innerHeight / 2;

    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(this.sections[i].id);
      if (section && section.offsetTop - offset <= scrollPosition) {
        this.setCurrentSection(this.sections[i].id);
        break;
      }
    }
  }

}
