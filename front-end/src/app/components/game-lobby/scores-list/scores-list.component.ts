import { Component, OnInit, Input } from '@angular/core';
import { getAppliedMods } from '../../../helpers/get-applied-mods';

@Component({
  selector: 'app-scores-list',
  templateUrl: './scores-list.component.html',
  styleUrls: ['./scores-list.component.scss']
})
export class ScoresListComponent implements OnInit {
  @Input() scores;

  constructor() { }

  ngOnInit() {
    console.log(this.scores);
  }

  public getModString(mods: number) {
    return getAppliedMods(mods).join(', ');
  }
}
