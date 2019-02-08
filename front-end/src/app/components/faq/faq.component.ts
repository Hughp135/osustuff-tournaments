import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  public activeQuestion: number = undefined;

  constructor() { }

  ngOnInit() {
    setInterval(() => {
      console.log(this.activeQuestion);
    }, 1000);
  }

}
