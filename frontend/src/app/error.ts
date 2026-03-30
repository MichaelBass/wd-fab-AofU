import { Demographic } from './demographic';


export class Error {
	_id?:string;
  	oid!: string;
    demo?: Demographic;    
  	FormOID!: string;
    ID!: string;
  	message!:string;
}