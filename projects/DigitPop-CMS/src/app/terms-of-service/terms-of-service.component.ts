import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'digit-pop-terms-of-service',
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.scss']
})
export class TermsOfServiceComponent implements OnInit {
  @ViewChild('sectionsContainer') sectionsContainer!: ElementRef<HTMLDivElement>;

  sections = [
    { title: 'Acceptance of Terms', id: 'acceptance' },
    { title: 'User Obligations', id: 'obligations' },
    { title: 'Content Ownership', id: 'ownership' },
    { title: 'Prohibited Content', id: 'prohibited' },
    { title: 'Privacy', id: 'privacy' },
    { title: 'Termination', id: 'termination' },
    { title: 'Limitation of Liability', id: 'limitation' },
    { title: 'Modifications to the Terms', id: 'modifications' },
    { title: 'Governing Law and Jurisdiction', id: 'law' },
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
    const offset = window.innerHeight / 3; // Adjust this value as needed

    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(this.sections[i].id);
      if (section && section.offsetTop - offset <= scrollPosition) {
        this.setCurrentSection(this.sections[i].id);
        break;
      }
    }
  }
}
