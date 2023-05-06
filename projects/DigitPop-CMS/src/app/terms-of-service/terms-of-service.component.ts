import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'digit-pop-terms-of-service',
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.scss']
})

export class TermsOfServiceComponent implements OnInit {

  sections = [
    { title: 'Lorem ipsum', id: 'link1' },
    { title: 'Neque porro quisquam est qui', id: 'link2' },
    { title: 'Lorem ipsum dolorem', id: 'link3' },
    { title: 'adipiscing elit ipsum', id: 'link4' },
    { title: 'Lorem ipsum', id: 'link5' }
  ];
  currentSectionId = '';

  constructor() { }

  ngOnInit(): void {
  }

  scrollToSection(event: Event, id: string) {
    event.preventDefault();
    this.setCurrentSection(id);
    const el = document.getElementById(id);
    const headerHeight = document.querySelector('header').offsetHeight;
    const elTop = el.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    window.scrollTo({ top: elTop, behavior: 'smooth' });
  }

  setCurrentSection(id: string) {
    this.currentSectionId = id;
  }

}
