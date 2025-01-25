import { Component, OnInit, Inject } from '@angular/core';
import {Router} from "@angular/router";
import { Observable } from 'rxjs';
//import { Observable } from 'rxjs/Observable';
import { CatService } from '../cat.service';
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


@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.css']
})
export class AssessmentComponent implements OnInit {

	item!: Item | null;
	selectedMap!: Map | null;
	
	response!: Response;
	user!: User;
	message!: string;
	isDisabled!: boolean;

	clear!: boolean;
	Next!:string;

	constructor(@Inject(AppStore) private store: Store<AppState>, private catService: CatService, private router: Router, private mongodbService: MongoDbService) { }

	ngOnInit() {

		this.user = this.store.getState().user;
		this.message = this.user.study_code + ' is logged in';
		this.isDisabled = true;
		if(this.user.oid == "0"){
			 this.router.navigate(['/dashboard',this.mongodbService.getLocaleValue("Please select an user first")]);
		}

   		this.Next = this.mongodbService.getLocaleValue("Next");

		this.getItem();
	
	}


	localizeItem(): void {

		if(this.item  != null){
		this.item.Prompt = this.mongodbService.getLocaleValue(this.item.Prompt);
		for (let map of this.item.Maps) {
    		map.ResponseOption = this.mongodbService.getLocaleValue(map.ResponseOption);
		}
		}
	}

	getItem(): void {

		this.clear = false;
		this.item = this.catService.getNextItemSync();
		this.localizeItem();

		if(this.item  == null){
			this.router.navigate(['/finish',this.mongodbService.getLocaleValue("The assessment is complete.")]);
		}

		/*
		this.catService.getNextItem().subscribe(
			data => { 
				this.clear = false;
				this.item = data;
				if(this.item  == null){
					this.router.navigate(['/finish','The assessment is complete.']);
				}
			
			}
		);
		*/
	}

	onSelect(map: Map): void {
		this.selectedMap = map;
		this.isDisabled = false;

		//this.onSubmit();
	}

	onSubmit(): void {
		this.isDisabled = true;
		this.getResponse();
	}
	
	getNextItem(){

		this.clear = false;
		this.item = this.catService.getNextItemSync();
		this.localizeItem();	
		if( this.item== null || this.item.ID == undefined ){

			this.user = this.store.getState().user;

				if(this.user.assessments != null){
		    	let assessment2 = this.user.assessments.filter((a) => a.Finished == null); // array of current assessment
		    	if(assessment2.length > 0){
		    		this.getItem();
		    	} else{
		    	this.router.navigate(['/finish',this.mongodbService.getLocaleValue("The assessment is complete.")]);
		    	}
		  	}
			
		}

	}
/*
	calculateEstimate(): void{

		var _result = this.catService.calculateEstimateSync();
		this.user.results.push(_result);
		this.store.dispatch(CounterActions.create_user(this.user));
		this.getNextItem();
		
	}
*/	
	getResponse(): void {
		this.response = new Response();
		this.response.oid = this.user.oid;

		if(this.item != null){
			this.response.ID = this.item.ID;
			this.response.Prompt = this.item.Prompt;
		}

		if(this.selectedMap != null){
			this.response.ItemResponseOID = this.selectedMap.ItemResponseOID;
			this.response.Value = this.selectedMap.Value;
		}

		

		//clear screen;
		if(this.item != null){
			this.item.Prompt  = "";
		}
		this.clear = true;
		this.selectedMap = null;

		this.user.responses.push(this.response);
		//this.store.dispatch(CounterActions.create_user(this.user));
		
		//this.calculateEstimate();

		var _result = this.catService.calculateEstimateSync(this.user);
		if(_result != null){
			this.user.results.push(_result);
		}
		this.store.dispatch(CounterActions.create_user(this.user));
		this.getNextItem();

	
	}

}
