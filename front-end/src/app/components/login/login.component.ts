import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  get loginLink() {
    const id = environment.osu_oauth_id;
    const redirect = environment.osu_redirect_url;
    return (
      `https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${id}&redirect_uri=${redirect}`
    );
  }
}
