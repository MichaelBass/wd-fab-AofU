import { Component, OnInit, Inject } from '@angular/core';
import { User } from '../user';

import { Store } from 'redux';
import { AppStore } from '../app.store';
import { AppState } from '../app.state';
import { MongoDbService } from '../mongo-db.service';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['../app.component.css','./intro.component.css']
})
export class IntroComponent implements OnInit {

	user!: User;

  intro_1!:string;
  intro_2!:string;
  intro_3!:string;
  intro_4!:string;
  intro_5!:string;
  intro_6!:string;
  intro_7!:string;
  intro_8!:string;
  Start!:string;

  constructor(@Inject(AppStore) private store: Store<AppState>, private mongodbService: MongoDbService) {
    store.subscribe(() => this.readState()); 
  }

  readState() {
    const state: AppState = this.store.getState() as AppState;
    this.user = state.user;
  }

  ngOnInit() {
  	this.readState();

    this.intro_1 = this.mongodbService.getLocaleValue("You will be asked how much you agree with statements about how you function or feel about doing different activities.");
    this.intro_2 = this.mongodbService.getLocaleValue("Choose your answer based on your usual ability, <b>by yourself without the help of another person, and with any equipment or devices you normally use.</b>");
    this.intro_3 = this.mongodbService.getLocaleValue("Do your best to pick the answer that best matches your agreement with the statement. If you are unable to pick a response the matches, choose <b>\"<u>I don't know</u>\".</b>");
    this.intro_4 = this.mongodbService.getLocaleValue("You will also be asked about how much difficulty you have doing different things.");
    this.intro_5 = this.mongodbService.getLocaleValue("Choose your answer based on your usual ability <b>using any equipment or devices you normally use.</b>");

    this.intro_6 = this.mongodbService.getLocaleValue("Choose your answer based on your ability to do the activity <b>by yourself without the help of another person.</b>");
    this.intro_7 = this.mongodbService.getLocaleValue("If you have not done an activity, do your best to guess what <b>your ability would be if you did it.</b><br/> If you are unable to guess choose <b>\"<u>I don't know</u>\"</b>.");
    this.intro_8 = this.mongodbService.getLocaleValue("For example, if it takes you a very long time or it is hard for you to do something (or an activity), you would choose the answer <b>\"<u>with a lot of difficulty</u>\"</b>. But, if you need help from another person, you would choose <b>\"<u>Unable</u>\"</b>.");

    this.Start = this.mongodbService.getLocaleValue("Start");


  }

}
