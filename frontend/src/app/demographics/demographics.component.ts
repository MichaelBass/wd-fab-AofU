import { Component, OnInit, Inject} from '@angular/core';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { MongoDbService } from '../mongo-db.service';
import { CatService } from '../cat.service';
import { Demographic } from '../demographic';
import { User } from '../user';
import { Locale } from '../locale';
import {Router} from "@angular/router";

import { Store } from 'redux';
import { AppStore } from '../app.store';
import { AppState } from '../app.state';
import * as CounterActions from '../counter.actions';

@Component({
  selector: 'app-demographics',
  templateUrl: './demographics.component.html',
  styleUrls: ['./demographics.component.css']
})

export class DemographicsComponent implements OnInit {

  isValidFormSubmitted: boolean = false;
  isRaceMissing: boolean = false;
  isAgeValid: boolean = true;
  form! : FormGroup;
  user!: User;
  message!:String;
  payLoad = '';
  races: any;

  locale!: Locale;
  locale_value!: string;

  race_selected_1 = false;
  race_selected_2 = false;
  race_selected_4 = false;
  race_selected_8 = false;
  race_selected_16 = false;
  race_selected_32 = false;
  race_selected_64 = false;
  race_selected_128 = false;
  race_selected_256 = false;

  demo: Demographic = {
    gender: -1,
    race: 0,
    age: -1,
    walking: -1,
    wc: -1,
    drive: -1,
    public_transportation: -1,
    other:''
  };

  gender_question!:string;
  gender_Male!:string;
  gender_Female!:string;
  gender_Refused!:string;

  age_question!:string;
  age_required!:string;
  age_number!:string;
  age_Placeholder!:string;

  mobility_question!:string;
  All_the_time!:string;
  Sometimes!:string;
  Never!:string;

  wheelchair_question!:string;
  I_never_walk!:string;

  race_question!:string;
  race_required!:string;

  American_Indian!:string;
  Asian!:string;
  African_American!:string;
  Native_Hawaiian!:string;
  White!:string;
  Hispanic!:string;
  Dont_know!:string;
  Refuse!:string;
  Other!:string;
  please_specify!:string;

  Drive_question!:string;
  Public_Transport_question!:string;

  Yes!:string;
  No!:string;
  Submit!:string;
  Clear!:string;

  constructor(@Inject(AppStore) private store: Store<AppState>, private mongodbService: MongoDbService, private catService: CatService, private router: Router) {}

  ngOnInit() {

    this.locale_value = this.mongodbService.getLocale();

    this.user = this.store.getState().user;
    this.gender_question = this.mongodbService.getLocaleValue("Are you male or female?");
    this.gender_Male = this.mongodbService.getLocaleValue("Male");
    this.gender_Female = this.mongodbService.getLocaleValue("Female");
    this.gender_Refused = this.mongodbService.getLocaleValue("Refused");

    this.age_question = this.mongodbService.getLocaleValue("How old are you? (Please enter numbers only.)");
    this.age_Placeholder = this.mongodbService.getLocaleValue("Age");
    this.age_required = this.mongodbService.getLocaleValue("age is required.");
    this.age_number = this.mongodbService.getLocaleValue("age must be a number.");

    this.mobility_question = this.mongodbService.getLocaleValue("I usually use a walking aid (cane, crutches, walker)");
    this.All_the_time = this.mongodbService.getLocaleValue("All the time");
    this.Sometimes = this.mongodbService.getLocaleValue("Sometimes");
    this.Never = this.mongodbService.getLocaleValue("Never");

    this.wheelchair_question = this.mongodbService.getLocaleValue("I usually use a manual wheelchair or power wheelchair or a scooter to get around.");
    this.I_never_walk = this.mongodbService.getLocaleValue("All the time; I never walk");

    this.race_question = this.mongodbService.getLocaleValue("What is your race? (Please check all that apply):");
    this.race_required = this.mongodbService.getLocaleValue("race is required.");


    this.American_Indian = this.mongodbService.getLocaleValue("American Indian or Alaska Native");
    this.Asian = this.mongodbService.getLocaleValue("Asian");
    this.African_American = this.mongodbService.getLocaleValue("Black or African American");
    this.Native_Hawaiian = this.mongodbService.getLocaleValue("Native Hawaiian or Pacific Islander");
    this.White = this.mongodbService.getLocaleValue("White");
    this.Hispanic = this.mongodbService.getLocaleValue("Hispanic");
    this.Dont_know = this.mongodbService.getLocaleValue("Don't know");
    this.Refuse = this.mongodbService.getLocaleValue("Refuse");
    this.Other = this.mongodbService.getLocaleValue("Other");

    this.please_specify = this.mongodbService.getLocaleValue("If other, please specify");

    this.Drive_question = this.mongodbService.getLocaleValue("Do you currently drive a car?");
    this.Public_Transport_question = this.mongodbService.getLocaleValue("Do you currently use a bus, train or subway to get around?");
    this.Yes = this.mongodbService.getLocaleValue("Yes");
    this.No = this.mongodbService.getLocaleValue("No");
    this.Submit = this.mongodbService.getLocaleValue("Submit");
    this.Clear = this.mongodbService.getLocaleValue("Clear");

 
    if(this.user.demo){
      this.demo = this.user.demo; 
    }

    let group: any = {};

    // group['demo_gender'] = new FormControl('demo_gender', [Validators.required,Validators.min(0)] );   // 2024-08-19
    //group['demo_age'] = new FormControl('demo_age', [Validators.required,Validators.min(0)]);
    //group['demo_age'] = new FormControl();  // 2024-08-19

    group['demo_walking'] = new FormControl('demo_walking', [Validators.required,Validators.min(0)]);
    group['demo_wc'] = new FormControl('demo_wc', [Validators.required,Validators.min(0)]);
    group['demo_other'] = new FormControl();
    group['demo_drive'] = new FormControl('demo_drive', [Validators.required,Validators.min(0)]);
    group['demo_public_transportation'] = new FormControl('demo_public_transportation', [Validators.required,Validators.min(0)]);
 
 /*
    group['demo_1'] = new FormControl('demo_1');
    this.race_selected_1 = (this.demo.race & 1) == 1;
    group['demo_1'].setValue(this.race_selected_1);

    group['demo_2'] = new FormControl('demo_2');
    this.race_selected_2 = (this.demo.race & 2) == 2;
    group['demo_2'].setValue(this.race_selected_2);

    group['demo_4'] = new FormControl('demo_4');
    this.race_selected_4 = (this.demo.race & 4) == 4;
    group['demo_4'].setValue(this.race_selected_4);

    group['demo_8'] = new FormControl('demo_8');
    this.race_selected_8 = (this.demo.race & 8) == 8;
    group['demo_8'].setValue(this.race_selected_8);

    group['demo_16'] = new FormControl('demo_16');
    this.race_selected_16 = (this.demo.race & 16) == 16;
    group['demo_16'].setValue(this.race_selected_16);

    group['demo_32'] = new FormControl('demo_32');
    this.race_selected_32 = (this.demo.race & 32) == 32;
    group['demo_32'].setValue(this.race_selected_32);

    group['demo_64'] = new FormControl('demo_64');
    this.race_selected_64 = (this.demo.race & 64) == 64;
    group['demo_64'].setValue(this.race_selected_64);

    group['demo_128'] = new FormControl('demo_128');
    this.race_selected_128 = (this.demo.race & 128) == 128;
    group['demo_128'].setValue(this.race_selected_128);

    group['demo_256'] = new FormControl('demo_256');
    this.race_selected_256 = (this.demo.race & 256) == 256;
    group['demo_256'].setValue(this.race_selected_256);
  */
    this.form = new FormGroup(group);

  }

  updateDemo(dem:Demographic) {

    this.mongodbService.saveDemo(this.user.oid,this.user.sponsor_code, dem).subscribe(
      data => {
        this.user = data;
        this.store.dispatch(CounterActions.create_user(data));

        this.message = data.message;
        this.router.navigate(['/intro']);
      },
      err => {
        this.message = "Error saving demographics";
      }

    )
 
  }

  onClear() {
  
    this.demo = {
      gender: -1,
      race: -1,
      age: -1,
      walking: -1,
      wc: -1,
      drive: -1,
      public_transportation: -1,
      other:''
    };

    this.race_selected_1 = false;
    this.race_selected_2 = false;
    this.race_selected_4 = false;
    this.race_selected_8 = false;
    this.race_selected_16 = false;
    this.race_selected_32 = false;
    this.race_selected_64 = false;
    this.race_selected_128 = false;
    this.race_selected_256 = false;

  }

  onSubmit() {


     this.isValidFormSubmitted = false;
     if(this.form.invalid){
        return; 
     } 
    this.isValidFormSubmitted = true;


      this.payLoad = JSON.stringify(this.form.value);
      var payLoad = JSON.parse(this.payLoad);

      //var race = 0;


// 2024-08-19
/*      
      if(payLoad.demo_1 ){
        race = race + 1;
      }
      if(payLoad.demo_2 ){
        race = race + 2;
      }
      if(payLoad.demo_4 ){
        race = race + 4;
      }
      if(payLoad.demo_8 ){
        race = race + 8;
      }
      if(payLoad.demo_16 ){
        race = race + 16;
      }
      if(payLoad.demo_32 ){
        race = race + 32;
      }
      if(payLoad.demo_64 ){
        race = race + 64;
      }
      if(payLoad.demo_128 ){
        race = race + 128;
      }
      if(payLoad.demo_256 ){
        race = race + 256;
      }

      if(this.locale_value=='de'){
        race = 1;
      }

      if(race == 0){
        this.isRaceMissing = true;
        return;
      }

      if (isNaN(payLoad.demo_age)) {
        this.isAgeValid = false;
        return;
      }
*/

      var dem = new Demographic();
      dem.age = 99; //payLoad.demo_age;
      dem.drive = payLoad.demo_drive;
      dem.gender = 2; //payLoad.demo_gender;
      dem.other = ''; //payLoad.demo_other;
      dem.public_transportation = payLoad.demo_public_transportation ;
      dem.race = 1; //race;
      dem.walking = payLoad.demo_walking;
      dem.wc = payLoad.demo_wc;

      this.updateDemo(dem); 

    }

}
