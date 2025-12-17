import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import {catchError} from 'rxjs/operators';
import {throwError, of} from 'rxjs';
import { from } from 'rxjs';

import { environment } from '../environments/environment';

import { GoSession } from './go-session';
import { GoSessions } from './go-sessions';
import { GoDemographics } from './go-demographics';


import { GoSessionDetails } from './go-session-details';
import { GoSessionMetaData } from './go-session-metadata';
import { GoSessionScores } from './go-session-scores';

import { GoSessionBehaviorDomain } from './go-session-behaviordomain';
import { GoSessionPhysicalDomain } from './go-session-physicaldomain';
import { GoSessionScale } from './go-session-scale';

import { GoSessionItem } from './go-session-item';
import { GoSessionResponses } from './go-session-responses';
import { GoSessionResponseOption } from './go-session-responseoption';

@Injectable()
export class GoEngineService {

     // 4 Cognition & Communication CC
     // 5 Resilience & Sociability  RS
     // 6 Self-Regulation SR
     // 7 Mood & Emotions ME

     // 0 Basic Mobility  BM
     // 1 Upper Body Function UBF
     // 2 Fine Motor Function FMF
     // 3 Community Mobility  CM
     // 8 Wheelchair  WC
    
/*
{FormOID: "0", ID: "", Name: "Basic Mobility", Domain: "Basic Mobility", Items: Array, …}
{FormOID: "1", ID: "", Name: "Upper Body Function", Domain: "Upper Body Function", Items: Array, …}
{FormOID: "2", ID: "", Name: "Fine Motor Function", Domain: "Fine Motor Function", Items: Array, …}
{FormOID: "3", ID: "", Name: "Community Mobility", Domain: "Community Mobility", Items: Array, …}
{FormOID: "4", ID: "", Name: "Cognition & Communication", Domain: "Cognition & Communication", Items: Array, …}
{FormOID: "5", ID: "", Name: "Resilience & Sociability", Domain: "Resilience & Sociability", Items: Array, …}
{FormOID: "6", ID: "", Name: "Self-Regulation", Domain: "Self-Regulation", Items: Array, …}
{FormOID: "7", ID: "", Name: "Mood & Emotions", Domain: "Mood & Emotions", Items: Array, …}
{FormOID: "8", ID: "", Name: "Wheelchair", Domain: "Wheelchair", Items: Array, …}
*/

  API!:String;


  session_key!:string; 
  domain_key!:string; 
  scale_key!:string; 

  constructor(private http: HttpClient, @Inject('Window') window: Window) {
    this.API = window.location.protocol + '//' +  window.location.hostname + ":3001";
   }

  getScore(session:GoSessionDetails, domain:string, scale:string): number {

      if (domain == "pf" && scale == "BM"){
          return session.scores.pf.BM.mean
      }    
      if (domain == "pf" && scale == "CM"){
          return session.scores.pf.CM.mean
      }    
      if (domain == "pf" && scale == "FMF"){
          return session.scores.pf.FMF.mean
      }    
      if (domain == "pf" && scale == "UBF"){
          return session.scores.pf.UBF.mean
      }    
      if (domain == "pf" && scale == "WC"){
          return session.scores.pf.WC.mean
      }
      if (domain == "bh" && scale == "CC"){
          return session.scores.bh.CC.mean
      } 
      if (domain == "bh" && scale == "ME"){
          return session.scores.bh.ME.mean
      }    
      if (domain == "bh" && scale == "RS"){
          return session.scores.bh.RS.mean
      }
      if (domain == "bh" && scale == "SR"){
          return session.scores.bh.SR.mean
      }  

      return 0.0;    
  } 

  getError(session:GoSessionDetails, domain:string, scale:string): number {

      if (domain == "pf" && scale == "BM"){
          return session.scores.pf.BM.std
      }    
      if (domain == "pf" && scale == "CM"){
          return session.scores.pf.CM.std
      }    
      if (domain == "pf" && scale == "FMF"){
          return session.scores.pf.FMF.std
      }    
      if (domain == "pf" && scale == "UBF"){
          return session.scores.pf.UBF.std
      }    
      if (domain == "pf" && scale == "WC"){
          return session.scores.pf.WC.std
      }
      if (domain == "bh" && scale == "CC"){
          return session.scores.bh.CC.std
      } 
      if (domain == "bh" && scale == "ME"){
          return session.scores.bh.ME.std
      }    
      if (domain == "bh" && scale == "RS"){
          return session.scores.bh.RS.std
      }
      if (domain == "bh" && scale == "SR"){
          return session.scores.bh.SR.std
      }

      return 0.0;
    
  } 

  setAssessment(id:number){

    if(id == 0){
      this.setDomain_key("pf");
      this.setScale_key("BM");
    }
    if(id == 1){
      this.setDomain_key("pf");
      this.setScale_key("UBF");
    }
    if(id == 2){
      this.setDomain_key("pf");
      this.setScale_key("FMF");
    }
    if(id == 3){
      this.setDomain_key("pf");
      this.setScale_key("CM");
    }
    if(id == 4){
      this.setDomain_key("bh");
      this.setScale_key("CC");
    }            
    if(id == 5){
      this.setDomain_key("bh");
      this.setScale_key("RS");
    }
    if(id == 6){
      this.setDomain_key("bh");
      this.setScale_key("SR");
    }
    if(id == 7){
      this.setDomain_key("bh");
      this.setScale_key("ME");
    }        
    if(id == 8){
      this.setDomain_key("pf");
      this.setScale_key("WC");
    }  
  }

  getSessions(): Observable<GoSessions> {
    return this.http.get<GoSessions>(`${this.API}/sessions`);
  }

  setDomain_key(key:string){
    this.domain_key = key;
  }

  getDomain_key(){
    return this.domain_key;
  }

  setScale_key(key:string){
    this.scale_key = key;
  }

  getScale_key(){
    return this.scale_key;
  }

  setSession_key(key:string){
    this.session_key = key;
  }

  getSession_key(){
    return this.session_key;
  }

  getItemID(item:GoSessionItem): string {
    return item.item_name;
  }

  getSTDError(session:GoSessionDetails, domain:string, scale:string): number {
    return eval(session +'.scores.' + domain + '.' + scale).std;
  }

  getItem(session_id:string, scale:string): Observable<GoSessionItem> {
    return this.http.get<GoSessionItem>(`${this.API}/${session_id}/${scale}/item`);
  }

  getSession(session_id:string): Observable<GoSessionDetails> {
    return this.http.get<GoSessionDetails>(`${this.API}/` + session_id);
  }

  createSession(demo:GoDemographics): Observable<any> {

    return this.http.post<GoSession>(`${this.API}/`, demo).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of(GoSession);
        })
    );

  }

  createItemResponse(session_id:string, domain:string, item_name:string, scale:string, value:number): Observable<any> {
    const query = JSON.parse("{  \"domain\":\"" + domain + "\"," + "\"item_name\":\"" + item_name + "\"," + "\"scale\":\"" + scale + "\"," + "\"value\":" + value + "}");

    return this.http.post<GoSession>(`${this.API}/${session_id}/response`, query).pipe(
        catchError(err => {
            console.log('caught rethrown error, providing fallback value');
            return of(GoSessionDetails);
        })
    );

  }
}
