import { Component, OnInit, Inject } from '@angular/core';
import { Admin } from '../admin';
import { ProxyUser } from '../proxy_user';
import { MongoDbService } from '../mongo-db.service';
import {ActivatedRoute} from "@angular/router";
import {Router} from "@angular/router";

import { Store } from 'redux';
import { AppStore } from '../app.store';
import { AppState } from '../app.state';


@Component({
  selector: 'app-utility',
  templateUrl: './utility.component.html',
  styleUrls: ['./utility.component.css']
})
export class UtilityComponent implements OnInit {

  admin!: Admin;
  people!:ProxyUser[];
  prefix!:string;
  end!:number;
  counter!:number;
  start!:number;
  myInterval!:any;
  message!:string;

  start_label!:string;
  end_label!:string;
  prefix_label!:string;
  process_label!:string;
  download_label!:string;

  constructor(@Inject(AppStore) private store: Store<AppState>, private mongodbService: MongoDbService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {

    this.start_label = this.mongodbService.getLocaleValue("start"); 
    this.end_label = this.mongodbService.getLocaleValue("end"); 
    this.prefix_label = this.mongodbService.getLocaleValue("prefix"); 
    this.process_label = this.mongodbService.getLocaleValue("Process");
    this.download_label = this.mongodbService.getLocaleValue("Download");

  	this.admin = this.store.getState().admin;
  	if(this.admin._id == "0"){
       this.router.navigate(['/login',this.mongodbService.getLocaleValue("Please login first") ]);
    }
  }

  csvObject2(obj:any): string{

    var data_export='';

    for (let key of Object.keys(obj)) {  
      //data_export = data_export + "\"" + key + "\"" + "\t";
      data_export = data_export + "\"" + key + "\"" + ",";
    } 
    data_export = data_export.slice(0, -1);
    data_export = data_export + "\n";



    for (let key of Object.keys(obj) ) {  
      //data_export = data_export + "\"" + obj[key] + "\"" + "\t";
      data_export = data_export + "\"" + obj[key] + "\"" + ",";
    } 
    data_export = data_export.slice(0, -1);
    data_export = data_export + "\n";



    return data_export;

  }

  csvObject(obj:any): string{

    var data_export='';
    var header = false;

    for (let key of Object.keys(obj)) {  
      
      
      let _data = obj[key];

      if (typeof _data == 'object'){

        if(!header){
          Object.keys(_data).forEach(
            //key => data_export = data_export + "\"" + key + "\"" + "\t"
            key => data_export = data_export + "\"" + key + "\"" + ","
          );
          header = true;
          data_export = data_export.slice(0, -1);
          data_export = data_export + "\n";
        }
        for (let key2 of Object.keys(_data)) {
          //data_export = data_export +  "\"" + _data[key2] +  "\"" + "\t";


          if(key2 == "Started" || key2 == "Finished"){
            data_export = data_export +  "\"" + new Date(_data[key2]) +  "\"" + ",";
          }else{
            data_export = data_export +  "\"" + _data[key2] +  "\"" + ",";
          }
          


        }
        data_export = data_export.slice(0, -1);
        data_export = data_export + "\n";
      }
    } 

    return data_export;

  }


  download(){
    var data_export=this.mongodbService.getLocaleValue("ID") + "," + this.mongodbService.getLocaleValue("username") + "," + this.mongodbService.getLocaleValue("password")+"\n";
    //var data_export="ID,username,password\n";
    this.mongodbService.searchProxyPerson(this.admin.sponsor_code).subscribe(  
        fields => {
        this.people = fields;

        for (var j=0; j < this.people.length;j++){
        	data_export = data_export + this.people[j].oid +  "," + this.people[j].study_code  + "," + this.people[j].password + "\n";
        	//data_export = data_export + this.csvObject(this.people[j]);
        }

	    let blob = new Blob(['\ufeff' + data_export], { type: 'text/csv;charset=utf-8;' });

	    let dwldLink = document.createElement("a");
	    let url = URL.createObjectURL(blob);

	    dwldLink.setAttribute("href", url);
	    dwldLink.setAttribute("download","Users.csv");
	    dwldLink.style.visibility = "hidden";
	    document.body.appendChild(dwldLink);
	    dwldLink.click();
	    document.body.removeChild(dwldLink);

      }, err => {console.log("Error getting all people");}
    );

  }

  createUser(a:string,b:number){

  	let alphabet ="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz"

  	let username = "";
  	let pwd = "";

  	let unique = "0000" + this.counter.toString();
  	let cred = a + "_" + unique.substring(unique.length - 4);

  	for(var i=0; i < 8;i++){
  		let position = Math.ceil(Math.random() * 62);
  		let position2 = Math.ceil(Math.random() * 62);

  		username = username + alphabet.substring(position, position+1);
  		pwd = pwd + alphabet.substring(position2, position2+1);
    }
	

	  this.mongodbService.addPerson(cred, username, pwd, this.admin.sponsor_code).subscribe(
      data => { 
        this.message = this.mongodbService.getLocaleValue("creating user {0}").replace("{0}", data.oid); 
      }, err => {this.message = "Error adding person";}
    )
    
  	this.counter++;
  	if (this.counter == b){
      this.message = this.mongodbService.getLocaleValue("Finished");
  		clearInterval(this.myInterval);
  	}
  }

  process(){
  	this.counter = this.start;
  	var a = this.prefix;
  	var b = this.end;
	  this.myInterval = setInterval( ()=>{ this.createUser(a,b); }, 2000);
  }

}
