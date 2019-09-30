import { ApiService } from './../../services/api.service';
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
  public achievements: object;

  constructor(private apiService: ApiService) {
    this.run(); // work around for not being able to use async in constructor
                // most likely not the best practice, TODO: fix?
  }
  ngOnInit() {}

  public async run() {
    try {
      const apiAchievements = await this.apiService.get("achievements/get-all-achievements")
      this.achievements = apiAchievements;
    }
    catch(e) {
      console.error(e)
    }
  }
}
