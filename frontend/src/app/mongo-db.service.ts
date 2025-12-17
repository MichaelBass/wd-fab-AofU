import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
//import { Observable } from 'rxjs/Observable';

import { User } from './user';
import { ProxyUser } from './proxy_user';
import { Demographic } from './demographic';
import { Response } from './response';
import { Result } from './result';
import { Assessment } from './assessment';
import { Form } from './form';
import { Item } from './item';

import { Admin } from './admin';
import { KVObject } from './kvobject';
import { Locale } from './locale';

import {map} from 'rxjs/operators';
// import 'rxjs/add/operator/map';

import {catchError} from 'rxjs/operators';
// import 'rxjs/add/operator/catch';

import {throwError, of} from 'rxjs';
// import 'rxjs/add/observable/throw';

// import {fromPromise} from 'rxjs/observable';
// import 'rxjs/add/observable/fromPromise';

import { from } from 'rxjs';


// import { Stitch, UserApiKeyCredential } from 'mongodb-stitch-browser-sdk';
// import { Realm, UserApiKeyCredential } from 'realm';
// import { App, Credentials } from 'realm-web';
import { environment } from '../environments/environment';


@Injectable()
export class MongoDbService {


 // useRealm: boolean = false;

  API!:String;

 // stitch_application!:string; 
 // stitch_apiKey!:string;
 // client: any;
  locale!:Locale;
  locale_value!:string; 
 // realm_user!: any;

  // credentials!:Credentials;

  constructor(private http: HttpClient, @Inject('Window') window: Window) {
    this.API = window.location.protocol + '//' +  window.location.hostname + ":3000";
   // this.initializeAndLogin();

    //this.useRealm = environment.useRealm;
   }

/*
  initializeAndLogin() {
  
    this.stitch_application = environment.stitch_application;
    this.stitch_apiKey = environment.stitch_apiKey;
    this.client = new App(this.stitch_application);
    this.credentials = Credentials.apiKey(this.stitch_apiKey); 

    this.client.logIn(this.credentials).then((user:any) => {
        this.realm_user = user;
    });

  }
*/

  getLocaleValue(key:string): (string) {

    if(this.locale !== undefined && this.locale.Items != null){
        let rtn = this.locale.Items.filter(obj => {return obj.key == key});
        if(rtn.length == 1 && rtn[0].value!= null){
          return rtn[0].value;
        } else {
          return key;
        }
    } else{
        return "locale store is not available from MongoDB.";
    }
  }

  getLocale(): (string) {
    return this.locale_value;
  }



  notifyAdmin(user:User): Observable<any> {

    /*
    if(this.useRealm){
      return from( this.realm_user.callFunction("notifyAdmin", user).then((result:any) => {
      return result;}) );
    }else{
        console.log("mongo-db.service.ts::notifyAdmin");
        return JSON.parse("{\"message\":\"Successfully notifying admin.\"}");
    }
    */
        return JSON.parse("{\"message\":\"Successfully notifying admin.\"}");


  }

// 2024-07-24
  getForms() : Observable<any>{

    /*
    if(this.useRealm){
        return from( this.realm_user.callFunction("getForms", []).then((result:any) => {
        return result;}) );
    }else{

      console.log("mongo-db.service.ts::getForms"); 
      return this.http.post<[]>(`${this.API}/find_forms`,[]).pipe(
          catchError(err => {
              console.log('caught rethrown error, providing fallback value');
              return of([]);
          })
      )           
    }
    */

    return this.http.post<[]>(`${this.API}/find_forms`,[]).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of([]);
        })
    );    
  }

// 2024-07-24
  setLocale(locale:string): Observable<any> {

    this.locale_value = locale;

    /*
    if(this.useRealm){

        return from( 
            this.realm_user.callFunction("getLocale",  encodeURI(this.locale_value) ).then((result:Locale) => { 
            this.locale = result;
            return result;})
        );

    }else{
      const query = JSON.parse("{\"locale\":\"" + encodeURI(this.locale_value)  + "\"}");

      console.log("mongo-db.service.ts::setLocale " + "{\"locale\":\"" + encodeURI(this.locale_value)  + "\"}" );
      return this.http.post<Locale>(`${this.API}/locale`,query).pipe(
          map(result => {
              this.locale = result;
              return result;
          })
        )
    }
    */

    const query = JSON.parse("{\"locale\":\"" + encodeURI(this.locale_value)  + "\"}");

    return this.http.post<Locale>(`${this.API}/locale`,query).pipe(
        map(result => {
            this.locale = result;
            return result;
        })
      );

   
  }

// 2024-07-24
  // find a people in the API by sponsor-code
  searchProxyPerson(sponsor_code: string): Observable<any> {  

    /*
    if(this.useRealm){
      return from( this.realm_user.callFunction("searchProxyUsers", sponsor_code).then((result:any) => {
      return result;}) );
    }else{

      console.log("mongo-db.service.ts::searchProxyPerson");
      //return this.http.get<ProxyUser[]>(`${this.API}/search_proxyusers/` + sponsor_code).catch((err) =>{return Observable.throw(err)});
      const query = JSON.parse("{\"sponsor_code\":\"" + sponsor_code + "\"}");
      return this.http.post<ProxyUser[]>(`${this.API}/search_proxyusers`, query).pipe(
          catchError(err => {
              console.log('caught rethrown error, providing fallback value');
              return of([]);
          })
      )

    }
    */

    const query = JSON.parse("{\"sponsor_code\":\"" + sponsor_code + "\"}");
    return this.http.post<ProxyUser[]>(`${this.API}/search_proxyusers`, query).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of([]);
        })
    );    

  }

// 2024-07-24
  loginAdmin(username:string, password:string): Observable<any> {

    /*
    if(this.useRealm){
      return from( this.realm_user.callFunction("loginAdmin", encodeURI(username), encodeURI(password) ).then((result:any) => {
      return result;}) );
    }else{

      console.log("mongo-db.service.ts::loginAdmin");
      var query = JSON.parse("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}");
      //return this.http.post<Admin[]>(`${this.API}/login`, query) ;//.catch((err) =>{return Observable.throw(err)});

      return this.http.post<Admin[]>(`${this.API}/login`, query).pipe(
          catchError(err => {
              console.log('caught rethrown error, providing fallback value');
              return of([]);
          })
      )      
    }
    */

    var query = JSON.parse("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}");

    return this.http.post<Admin[]>(`${this.API}/login`, query).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of([]);
        })
    );    

  }

// 2024-07-24
  // Add one person to the API
  addPerson(oid: string, study_code:string, password:string, sponsor_code:string): Observable<any> {

    /*
    if(this.useRealm){
        return from( this.realm_user.callFunction("saveUser", oid, study_code, password, sponsor_code).then((result:any) => {
        return result;}) );
    }else{

        console.log("mongo-db.service.ts::addPerson");
        var query = JSON.parse("{\"oid\":\"" + oid + "\",\"study_code\":\"" + study_code + "\",\"password\":\"" + password + "\",\"sponsor_code\":\"" + sponsor_code + "\"}");
        //return this.http.post<User>(`${this.API}/users`, {oid, study_code, password, sponsor_code}).catch((err) =>{return Observable.throw(err)});
        return this.http.post<User>(`${this.API}/users`, query).pipe(
            catchError(err => {
                console.log('caught rethrown error, providing fallback value');
                return of(User);
            })
        )      
    }
    */

    var query = JSON.parse("{\"oid\":\"" + oid + "\",\"study_code\":\"" + study_code + "\",\"password\":\"" + password + "\",\"sponsor_code\":\"" + sponsor_code + "\"}");
    return this.http.post<User>(`${this.API}/users`, query).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of(User);
        })
    ); 

  }

// 2024-07-24
  // log a person in the API
  loginPerson(study_code: string, password:string): Observable<any> {

    /*
    if(this.useRealm){
        return from( this.realm_user.callFunction("loginPerson", encodeURI(study_code), encodeURI(password) ).then((result:any) => {
        return result;}) );
    }else{
      // return this.http.get<User[]>(`${this.API}/users/` + encodeURI(study_code) + `/` + encodeURI(password)).catch((err) =>{return Observable.throw(err)});
      console.log("mongo-db.service.ts::loginPerson");
      var query = JSON.parse("{\"study_code\":\"" + encodeURI(study_code)  + "\",\"password\":\"" + encodeURI(password)+ "\"}");

      return this.http.post<User[]>(`${this.API}/find_user`, query).pipe(
          catchError(err => {
              console.log('caught rethrown error, providing fallback value');
              return of([]);
          })
      ) 
    }
    */

    var query = JSON.parse("{\"study_code\":\"" + encodeURI(study_code)  + "\",\"password\":\"" + encodeURI(password)+ "\"}");
    return this.http.post<User[]>(`${this.API}/find_user`, query).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of([]);
        })
    );

  }


// 2024-07-24
  saveDemo(oid: string,sponsor_code:string, dem: Demographic): Observable<any> {

    /*
    if(this.useRealm){
      return from( this.realm_user.callFunction("saveDemo", oid, sponsor_code, dem).then((result:any) => {
      return result;}) );
    }else{

      console.log("mongo-db.service.ts::saveDemo");

      var query = JSON.parse("{\"oid\":\"" + oid  + "\",\"sponsor_code\":\"" + sponsor_code + "\",\"demo\":" + JSON.stringify(dem) + "}");


      return this.http.post<User>(`${this.API}/demo`, query).pipe(
          catchError(err => {
              console.log('caught rethrown error, providing fallback value');
              return of(User);
          })
      ) 
    }
    */

  var query = JSON.parse("{\"oid\":\"" + oid  + "\",\"sponsor_code\":\"" + sponsor_code + "\",\"demo\":" + JSON.stringify(dem) + "}");
  return this.http.post<User>(`${this.API}/demo`, query).pipe(
      catchError(err => {
          console.log('caught rethrown error, providing fallback value');
          return of(User);
      })
  );

  }

// 2024-07-24
  startAssessment(user: User): Observable<any> {

    /*
    if(this.useRealm){
      return from( this.realm_user.callFunction("updateAssessments", user.oid, user.sponsor_code, user.assessments).then((result:any) => {
      return result;}) );
    }else{
        console.log("mongo-db.service.ts::startAssessment");
        //return this.http.put<User>(`${this.API}/assessments/`+ _id, assessments).catch((err) =>{return Observable.throw(err)});
        var query = JSON.parse("{\"oid\":\"" + user.oid  + "\",\"sponsor_code\":\"" + user.sponsor_code + "\",\"assessments\":" + JSON.stringify(user.assessments) + "}");

        return this.http.post<User>(`${this.API}/assessments`, query).pipe(
            catchError(err => {
                console.log('caught rethrown error, providing fallback value');
                return of(User);
            })
        ) 
    }
    */

    var query = JSON.parse("{\"oid\":\"" + user.oid  + "\",\"sponsor_code\":\"" + user.sponsor_code + "\",\"assessments\":" + JSON.stringify(user.assessments) + "}");
    return this.http.post<User>(`${this.API}/assessments`, query).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of(User);
        })
    )


  }

// 2024-07-24
  updateUserAssessment(user: User): Observable<any> {

    /*
    if(this.useRealm){
        return from( this.realm_user.callFunction("updateResponses", user).then((result:any) => {
        return result;}) );
    }else{
      console.log("mongo-db.service.ts::updateUserAssessment");
      //return this.http.put<User>(`${this.API}/userAssessment/`+ _id, user).catch((err) =>{return Observable.throw(err)});

      //console.log("{\"oid\":\"" + user.oid  + "\",\"sponsor_code\":\"" + user.sponsor_code + "\",\"assessments\":" + JSON.stringify(user.assessments) + "\",\"responses\":" + JSON.stringify(user.responses) + "\",\"results\":" + JSON.stringify(user.results) + "}");


      var query = JSON.parse("{\"oid\":\"" + user.oid  + "\",\"sponsor_code\":\"" + user.sponsor_code + "\",\"assessments\":" + JSON.stringify(user.assessments) + ",\"responses\":" + JSON.stringify(user.responses) + ",\"results\":" + JSON.stringify(user.results) + "}");

      return this.http.put<User>(`${this.API}/assessments`, query).pipe(
          catchError(err => {
              console.log('caught rethrown error, providing fallback value');
              return of(User);
          })
      ) 
    }
    */
 
    var query = JSON.parse("{\"oid\":\"" + user.oid  + "\",\"sponsor_code\":\"" + user.sponsor_code + "\",\"assessments\":" + JSON.stringify(user.assessments) + ",\"responses\":" + JSON.stringify(user.responses) + ",\"results\":" + JSON.stringify(user.results) + "}");
    return this.http.put<User>(`${this.API}/assessments`, query).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of(User);
        })
    ); 


  }
// 2024-07-24
  getResponses(oid: string,sponsor_code:string): Observable<any> {

    /*
    if(this.useRealm){
        return from( this.realm_user.callFunction("getResponses", oid, sponsor_code).then((result:any) => {
        return result;}) );
    }else{    
      console.log("mongo-db.service.ts::getResponses");  
      //return this.http.get<Response[]>(`${this.API}/responses/`+ _id).catch((err) =>{return Observable.throw(err)});

      var query = JSON.parse("{\"oid\":\"" + oid  + "\",\"sponsor_code\":\"" + sponsor_code + "\"}");

      return this.http.post<Response[]>(`${this.API}/responses`, query).pipe(
          catchError(err => {
              console.log('caught rethrown error, providing fallback value');
              return of([]);
          })
      )
    }
    */ 

    var query = JSON.parse("{\"oid\":\"" + oid  + "\",\"sponsor_code\":\"" + sponsor_code + "\"}");
    return this.http.post<Response[]>(`${this.API}/responses`, query).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of([]);
        })
    )

  }

  // 2024-07-24
  // delete a person in the API
  deletePerson(p_user:ProxyUser): Observable<any> {

    /*
    if(this.useRealm){
        return from( this.realm_user.callFunction("deleteUser", p_user.oid, p_user.sponsor_code).then((result:any) => {
        return result;}) );
    }else{
       console.log("mongo-db.service.ts::deletePerson");
             var query = JSON.parse("{\"oid\":\"" + p_user.oid + "\",\"sponsor_code\":\"" + p_user.sponsor_code + "\"}");

             return this.http.delete<any>(`${this.API}/ProxyUser`, query).pipe(
                catchError(err => {
                    console.log('caught rethrown error, providing fallback value');
                    return of({});
                })
            )
       //return this.http.delete<User>(`${this.API}/users/`+ _id).catch((err) =>{return Observable.throw(err)});
    }
    */

     var query = JSON.parse("{\"oid\":\"" + p_user.oid + "\",\"sponsor_code\":\"" + p_user.sponsor_code + "\"}");
     return this.http.delete<any>(`${this.API}/ProxyUser`, query).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of({});
        })
    );

  }

  // 2024-07-24
  // update a person in the API
  updatePerson(oid: string, study_code: string, password:string, sponsor_code:string): Observable<any>{

    /*
    if(this.useRealm){
        return from( this.realm_user.callFunction("updateUser", oid, study_code, password, sponsor_code).then((result:any) => {
        return result;}) );
    }else{
        console.log("mongo-db.service.ts::updatePerson");

       var query = JSON.parse("{\"oid\":\"" + oid + "\",\"sponsor_code\":\"" + sponsor_code + "\",\"study_code\":\"" + study_code + "\",\"password\":\"" + password + "\"}");

       return this.http.put<any>(`${this.API}/ProxyUser`, query).pipe(
          catchError(err => {
              console.log('caught rethrown error, providing fallback value');
              return of({});
          })
      )

        //return this.http.put<User>(`${this.API}/users/`+ _id, {oid, study_code, password}).catch((err) =>{return Observable.throw(err)});
    } 
    */ 

     var query = JSON.parse("{\"oid\":\"" + oid + "\",\"sponsor_code\":\"" + sponsor_code + "\",\"study_code\":\"" + study_code + "\",\"password\":\"" + password + "\"}");
     return this.http.put<any>(`${this.API}/ProxyUser`, query).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of({});
        })
    );
  }


  // 2024-07-24  add parameters to user doc.
  addUserParams(study_code: string,password:string, params: Array<any>): Observable<any> {

      /*
      if(this.useRealm){    
          return from( this.realm_user.callFunction("addUserParameters", study_code, password, params).then((result:any) => {
          return result;}) );
      }else{
            console.log("mongo-db.service.ts::addUserParams");
           var query = JSON.parse("{\"params\":" + JSON.stringify(params) + ",\"study_code\":\"" + study_code + "\",\"password\":\"" + password + "\"}");

           return this.http.put<any>(`${this.API}/UserParams`, query).pipe(
              catchError(err => {
                  console.log('caught rethrown error, providing fallback value');
                  return of({});
              })
          )
      }
      */

      var query = JSON.parse("{\"params\":" + JSON.stringify(params) + ",\"study_code\":\"" + study_code + "\",\"password\":\"" + password + "\"}");
      return this.http.put<any>(`${this.API}/UserParams`, query).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of({});
        })
      )
  }

  // 2024-08-24  get User for report.
  findUser(oid:string, sponsor_code:string): Observable<any> {

      /*   
      if(this.useRealm){    
        return from( this.realm_user.callFunction("getUser", oid, sponsor_code).then((result:any) => {
        return result;}) );
      }else{
          console.log("mongo-db.service.ts::findUser");
          var query = JSON.parse("{\"sponsor_code\":\"" + sponsor_code  + "\",\"oid\":\"" + oid + "\"}");

          return this.http.post<User>(`${this.API}/get_user`, query).pipe(
              catchError(err => {
                  console.log('caught rethrown error, providing fallback value');
                  return of(User);
              })
          ) 
      }
      */

    var query = JSON.parse("{\"sponsor_code\":\"" + sponsor_code  + "\",\"oid\":\"" + oid + "\"}");
    return this.http.post<User>(`${this.API}/get_user`, query).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of(User);
        })
    ); 

  }

  getUser(user: User): Observable<any> {

    /*
    if(this.useRealm){    
      return from( this.realm_user.callFunction("getUser", user.oid, user.sponsor_code).then((result:any) => {
      return result;}) );
    }else{
        console.log("mongo-db.service.ts::getUser");
        var query = JSON.parse("{\"sponsor_code\":\"" + user.sponsor_code  + "\",\"oid\":\"" + user.oid + "\"}");

        return this.http.post<User>(`${this.API}/get_user`, query).pipe(
            catchError(err => {
                console.log('caught rethrown error, providing fallback value');
                return of(User);
            })
        ) 
    }
    */

    var query = JSON.parse("{\"sponsor_code\":\"" + user.sponsor_code  + "\",\"oid\":\"" + user.oid + "\"}");
    return this.http.post<User>(`${this.API}/get_user`, query).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of(User);
        })
    );

  }

/*
// can not find ATLAS Stitch call   updateDemo  or call in the demo module
  updateDemo(oid: string,sponsor_code:string, dem: Demographic): Observable<any> {
      return from( this.realm_user.callFunction("updateDemo", oid, sponsor_code, dem).then((result:any) => {
      return result;}) );
     //return this.http.put<User>(`${this.API}/demo/`+ _id, dem).catch((err) =>{return Observable.throw(err)});
  }
*/

/*
  commented out in cat.service  -- old code

  loadForms(oid: string,sponsor_code:string,forms: Array<Form>): Observable<any> {
      return from( this.realm_user.callFunction("loadForms", oid, sponsor_code, forms).then((result:any) => {
      return result;}) );
    // return this.http.put<User>(`${this.API}/forms/`+ _id, forms).catch((err) =>{return Observable.throw(err)});
  }
*/




  // Get all users from the API
  getAllProxyPeople(): Observable<ProxyUser[]> {
    return this.http.get<ProxyUser[]>(`${this.API}/proxyusers`);
  }


/*
	updateAssessments(user: User): Observable<any> {

    
     // 4 Cognition & Communication CC
     // 5 Resilience & Sociability  RS
     // 6 Self-Regulation SR
     // 7 Mood & Emotions ME

     // 0 Basic Mobility  BM
     // 1 Upper Body Function UBF
     // 2 Fine Motor Function FMF
     // 3 Community Mobility  CM
     // 8 Wheelchair  WC
    
		
    var startDomain = Math.floor(Math.random() * Math.floor(2));
    // startDomain = 1; // Hard-code to start physical function 

    	var behavior : Array<Assessment> = [];
      behavior.push({"ID":4,"Domain":"Cognition & Communication","Active":false, "Started":0, "Finished":0});
      behavior.push({"ID":5,"Domain":"Resilience & Sociability","Active":false, "Started":0, "Finished":0});
      behavior.push({"ID":6,"Domain":"Self-Regulation","Active":false, "Started":0, "Finished":0});
      behavior.push({"ID":7,"Domain":"Mood & Emotions","Active":false, "Started":0, "Finished":0});     
      behavior = this.shuffle(behavior);

    	var phy : Array<Assessment> = [];  
      phy.push({"ID":0,"Domain":"Basic Mobility","Active":false, "Started":0, "Finished":0});
      phy.push({"ID":1,"Domain":"Upper Body Function","Active":false, "Started":0, "Finished":0});
      phy.push({"ID":2,"Domain":"Fine Motor Function","Active":false, "Started":0, "Finished":0});
      phy.push({"ID":3,"Domain":"Community Mobility","Active":false, "Started":0, "Finished":0});
      phy.push({"ID":8,"Domain":"Wheelchair","Active":false, "Started":0, "Finished":0});

      if(user.demo != null){

      	if(user.demo.wc == 2){
      		// phy.splice(5,1);
          phy.splice(4,1);
      	}

      	if(user.demo.public_transportation == 0){
      		phy.splice(4,1);
      	}

      	if(user.demo.drive == 0){
      		phy.splice(3,1);
      	}

      }
    	phy = this.shuffle(phy);


    	var assessments = [];

    	if( startDomain == 0 ){

    		for (var i = 0; i < behavior.length; i++) {
  				assessments.push(behavior[i]);
			   }
    		for (var i = 0; i < phy.length; i++) {
  				assessments.push(phy[i]);
			   }

    	}else{

    	   for (var i = 0;i < phy.length; i++) {
  				assessments.push(phy[i]);
			   }

    		for (var i = 0; i < behavior.length; i++) {
  				assessments.push(behavior[i]);
			  }

    	}

      return from( this.realm_user.callFunction("updateAssessments", user.oid, user.sponsor_code, assessments).then((result:any) => {
      return result;}) );
		  //return this.http.put<User>(`${this.API}/assessments/`+ user._id, assessments).catch((err) =>{return Observable.throw(err)});
	}
  */


	shuffle(array: Array<Assessment> ) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

  		// Pick a remaining element...
  		randomIndex = Math.floor(Math.random() * currentIndex);
  		currentIndex -= 1;

  		// And swap it with the current element.
  		temporaryValue = array[currentIndex];
  		array[currentIndex] = array[randomIndex];
  		array[randomIndex] = temporaryValue;
		}

		return array;
	}



}
