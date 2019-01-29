import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lobbies-list',
  templateUrl: './lobbies-list.component.html',
  styleUrls: ['./lobbies-list.component.scss'],
})
export class LobbiesListComponent implements OnInit {
  public lobbies: any[];

  constructor(private route: ActivatedRoute) {

  }

  ngOnInit() {
    const { data } = this.route.snapshot.data;

    this.lobbies = data.lobbies;
  }
}
