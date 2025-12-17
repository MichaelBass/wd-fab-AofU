export class GoSessionMetaData {
  session_id!: string;
  start_time!: string;
  expiration_time!: string;
  responses!: object;
  physical!:boolean;
  mental!:boolean;
  car!:boolean;
  wheelchair!:boolean;
  transit!:boolean;
}