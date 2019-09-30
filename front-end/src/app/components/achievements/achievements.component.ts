import { Component, OnInit } from '@angular/core';

export interface IAchievement {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss']
})
export class AchievementsComponent implements OnInit {
  public achievements: IAchievement[];

  constructor() {
    this.achievements = [
      {
        title: "a",
        description: "b",
        icon: "blue circle",
      },
      {
        title: "these aren't real",
        description: "i couldn't figure out how to pull all the achievements :(",
        icon: "red checkered flag",
      },
      {
        title: "shoutouts to simpleflips",
        description: "aeaeaeaeaeae",
        icon: "white github",
      },
    ]
  }
  ngOnInit() {}

}
