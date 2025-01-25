import { Component, OnInit, Inject } from '@angular/core';

//import { ChartDataSets, ChartType, RadialChartOptions } from 'chart.js';
import { ChartConfiguration  } from 'chart.js';
//import { Label } from 'ng2-charts';

import {ActivatedRoute} from "@angular/router";
import { MongoDbService } from '../mongo-db.service';
import { User } from '../user';

import { Store } from 'redux';
import { AppStore } from '../app.store';
import { AppState } from '../app.state';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})

export class ReportComponent implements OnInit {

	user!: User;
	oid!:string;
  message!:string;
  sponsor_code!:string;

 public radarChartOptions: ChartConfiguration<'radar'>['options'] = {
    responsive: true
  };

public radarChartOptions2: ChartConfiguration<'radar'>['options'] = {
    responsive: true
  };
/*
  public radarChartOptions: RadialChartOptions = {
    responsive: true
  };

  public radarChartOptions2: RadialChartOptions = {
    responsive: true
  };
*/
  public radarChartLabels!: string[];
  public radarChartLabels2!: string[];

  public radarChartData: ChartConfiguration<'radar'>['data']['datasets'] = [
    { data: [50, 50, 50, 50], label: 'Series B' },
    { data: [0, 0, 0, 0], label: this.mongodbService.getLocaleValue("Min") },
    { data: [50, 50, 50, 50], label: this.mongodbService.getLocaleValue("Mean") },
    { data: [100, 100, 100, 100], label: this.mongodbService.getLocaleValue("Max") }
    
  ];

  public radarChartData2: ChartConfiguration<'radar'>['data']['datasets'] = [
    { data: [50, 50, 50, 50, 50], label: 'Series B' },
    { data: [0, 0, 0, 0], label: this.mongodbService.getLocaleValue("Min") },
    { data: [50, 50, 50, 50], label: this.mongodbService.getLocaleValue("Mean") },
    { data: [100, 100, 100, 100], label: this.mongodbService.getLocaleValue("Max") }
    
  ];

  //public radarChartType: ChartType = 'radar';

  constructor(@Inject(AppStore) private store: Store<AppState>, private mongodbService: MongoDbService, private route: ActivatedRoute) {
    store.subscribe(() => this.readState()); 
  }

  readState() {
    const state: AppState = this.store.getState() as AppState;
    this.user = state.user;
  }

  ngOnInit() {

  	this.readState();

    this.route.params.subscribe(params => {


      this.oid = params['oid'];
      this.sponsor_code = params['sponsor_code'];


		this.mongodbService.findUser(this.oid, this.sponsor_code).subscribe(  
		  fields => {
     // var user = fields;
      this.user = fields;

      this.message = this.mongodbService.getLocaleValue("user - {0}").replace("{0}", this.user.study_code);

			var myLabels = new Array();
			var myData = new Array();

      var myLabels2 = new Array();
      var myData2 = new Array();


		    for (let assessment of this.user.assessments!) {

          if(assessment.Domain === "Cognition & Communication" || assessment.Domain === "Resilience & Sociability" || assessment.Domain === "Self-Regulation" || assessment.Domain === "Mood & Emotions"){
            myLabels.push(this.mongodbService.getLocaleValue(assessment.Domain));
          }

          if(assessment.Domain === "Basic Mobility" || assessment.Domain === "Upper Body Function" || assessment.Domain === "Fine Motor Function" || assessment.Domain === "Community Mobility" || assessment.Domain === "Wheelchair"){
            myLabels2.push(this.mongodbService.getLocaleValue(assessment.Domain));
          }



          let filtered_results = this.user.results.filter((a) => a.oid === assessment.Domain);
          let _result = filtered_results[filtered_results.length -1];
          let score = this.mongodbService.getLocaleValue("N/A");
          if (typeof _result === "undefined"){
          }else{

            switch(assessment.Domain) {
              case "Cognition & Communication":
                score = (50 + Math.round( (_result.score - 0.114)/3.817 * 10)/10 * 10 ).toString();
                break;
              case "Resilience & Sociability":
                score = (50 + Math.round( (_result.score - 2.12)/2.33 * 10)/10 * 10 ).toString();
                break;
              case "Self-Regulation":
                score = (50 + Math.round( (_result.score - 0.556)/1.854 * 10)/10 * 10 ).toString();
                break;                            
              case "Mood & Emotions":
                score = (50 + Math.round( (_result.score)/1.58 * 10)/10 * 10 ).toString();
                break;
              case "Basic Mobility":
                score = (50 + Math.round( (_result.score - 0.338)/0.968 * 10)/10 * 10 ).toString();
                break;
              case "Upper Body Function":
                score = (50 + Math.round( (_result.score - 0.788)/2.293 * 10)/10 * 10 ).toString();
                break;
              case "Fine Motor Function":
                score = (50 + Math.round( (_result.score - 0.113)/0.788 * 10)/10 * 10 ).toString();
                break;
              case "Community Mobility":
                score = (50 + Math.round( (_result.score - 0.329)/1.535 * 10)/10 * 10 ).toString();
                break;
              case "Wheelchair":
                score = (50 + Math.round( (_result.score - 0.329)/1.535 * 10)/10 * 10 ).toString();
                break;              
              default:
                score = this.mongodbService.getLocaleValue("N/A");
            }

            //score = (50 + Math.round(_result.score * 10)/10 * 10 ).toString();

          }

          if(assessment.Domain === "Cognition & Communication" || assessment.Domain === "Resilience & Sociability" || assessment.Domain === "Self-Regulation" || assessment.Domain === "Mood & Emotions"){
            myData.push(score);
          }

          if(assessment.Domain === "Basic Mobility" || assessment.Domain === "Upper Body Function" || assessment.Domain === "Fine Motor Function" || assessment.Domain === "Community Mobility" || assessment.Domain === "Wheelchair"){
            myData2.push(score);
          }


		    }

			this.radarChartLabels = myLabels;
      this.radarChartLabels2 = myLabels2;

			let finished:any = new Date(this.user.assessments![0].Finished);	

			this.radarChartData[0].data = myData;
			this.radarChartData[0].label = this.mongodbService.getLocaleValue("Behavior Domains:") + finished.toLocaleDateString();

      this.radarChartData2[0].data = myData2;
      this.radarChartData2[0].label = this.mongodbService.getLocaleValue("Physical Domains:") + finished.toLocaleDateString();


		 }, err => {console.log("Error finding person");}
		 
		 );

    });
  }

  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }


}

