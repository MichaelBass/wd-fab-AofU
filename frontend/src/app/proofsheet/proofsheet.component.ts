import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from "@angular/router";
import {Router} from "@angular/router";
import { Observable } from 'rxjs';
//import { Observable } from 'rxjs/Observable';
import { CatService } from '../cat.service';
import { Form } from '../form';
import { Item } from '../item';
import { Map } from '../map';
import { Response } from '../response';
import { User } from '../user';
import { Result } from '../result';
import { Store } from 'redux';
import { AppStore } from '../app.store';
import { AppState } from '../app.state';
import * as CounterActions from '../counter.actions';

import { MongoDbService } from '../mongo-db.service';

import { environment } from '../../environments/environment';

@Component({
	imports:[CommonModule],
  selector: 'app-assessment',
  templateUrl: './proofsheet.component.html',
  styleUrls: ['./proofsheet.component.css']
})
export class ProofsheetComponent implements OnInit {

	forms!: Form[];


	constructor(@Inject(AppStore) private store: Store<AppState>, private catService: CatService, private route: ActivatedRoute, private router: Router, private mongodbService: MongoDbService, private cdr: ChangeDetectorRef) { }

	ngOnInit() {

    		this.mongodbService.setLocale('es').subscribe(
      			data => { 


				   		this.mongodbService.getProofSheet().subscribe(
							fields => {

								this.forms = fields;

								for (let form of this.forms ) {
									console.log(form.Domain);
								for (let item of form.Items) {
									if(item.Prompt == this.mongodbService.getLocaleValue(item.Prompt)){
									console.log(item.Name + " : " + this.mongodbService.getLocaleValue(item.Prompt));
									}
									item.Prompt = this.mongodbService.getLocaleValue(item.Prompt);
									for (let map of item.Maps) {
				    					if(map.ResponseOption == this.mongodbService.getLocaleValue(map.ResponseOption)){
				    						console.log("MAPPING: " +  map.ResponseOption );
				    					};
									}
								}
								}

							}, err => {console.log("Error loading forms");}
				   		);


	        	}
	        );		





	
	}

}
