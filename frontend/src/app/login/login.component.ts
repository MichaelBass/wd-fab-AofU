import { Component, OnInit, Inject} from '@angular/core';
import { MongoDbService } from '../mongo-db.service';
import { Admin } from '../admin';
import {ActivatedRoute} from "@angular/router";
import {Router} from "@angular/router";

import { Store } from 'redux';
import { AppStore } from '../app.store';
import { AppState } from '../app.state';
import * as CounterActions from '../counter.actions';

import { AppComponent } from '../app.component';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  admin!: Admin;

  _id!: string;
  username!: string;
  password!: string;
  message!: string;

  username_placeholder!: string;
  password_placeholder!: string;
  login_btn!: string;

  constructor(@Inject(AppStore) private store: Store<AppState>, private mongodbService: MongoDbService, private router: Router, private route: ActivatedRoute, private app: AppComponent) {}

  ngOnInit() {
      this.route.params.subscribe(params => {
        this.app.title = this.mongodbService.getLocaleValue("Work Disability Functional Assessment Battery");
        this.username_placeholder = this.mongodbService.getLocaleValue("username");
        this.password_placeholder = this.mongodbService.getLocaleValue("password");
        this.login_btn = this.mongodbService.getLocaleValue("Login");

    });
  }

  onKeydown(event:KeyboardEvent) {
    if (event.key === "Enter") {
      this.login();
    }
  }

  login() {

    this.mongodbService.loginAdmin(this.username, this.password).subscribe(

      fields => {

        if(fields.length == 1){

          this.admin = fields[0];
          this.store.dispatch(CounterActions.create_admin(this.admin));
          if(this.admin._id != "0"){
            //this.router.navigate(['/dashboard',this.message]);
            this.router.navigate(['/dashboard']); 
          } else {
            this.store.dispatch(CounterActions.clear_state());
            this.message = 'Invalid credentials.';          
          }
        } else{
          this.store.dispatch(CounterActions.clear_state());
          this.message = 'Invalid credentials.';
        }
      },
      err => {
        this.message = "Error logging in.";
      }
    )


  }
}
