import { Component, OnInit, Inject } from '@angular/core';

import {ActivatedRoute} from "@angular/router";
import {Router} from "@angular/router";
import { Store } from 'redux';
import { AppStore } from '../app.store';
import { AppState } from '../app.state';
import * as CounterActions from '../counter.actions';
import { MongoDbService } from '../mongo-db.service';

import { AppComponent } from '../app.component';

import { GoEngineService } from '../go-engine.service';

@Component({
  selector: 'app-locale',
  templateUrl: './locale.component.html',
  styleUrls: ['./locale.component.css']
})
export class LocaleComponent implements OnInit {
 
   user_type!: string;

  constructor(@Inject(AppStore) private store: Store<AppState>, private route: ActivatedRoute, private mongodbService: MongoDbService, private goEngineService: GoEngineService, private router: Router, private app: AppComponent) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
        this.user_type = params['user_type'];
    });
  }

  onSelect(locale:string) {
    
    this.mongodbService.setLocale(locale).subscribe(
      data => { 
        this.app.title = this.mongodbService.getLocaleValue("Work Disability Functional Assessment Battery");
        if(this.user_type != null){
          this.router.navigate(['/login/' + locale]);
        }else{
          this.router.navigate(['/portal']);
       }
      }
    ); 
  }

}
