import { Component, OnInit, Input } from '@angular/core';

interface IPlayer {
  username: string;
  userId: string;
  alive: boolean;
  roundLostOn?: number;
  osuUserId: number;
  ppRank: number;
  country: string;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @Input() players: IPlayer[];

  constructor() {}

  ngOnInit() {}
}
