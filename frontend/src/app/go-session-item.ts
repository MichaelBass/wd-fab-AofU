
import { GoSessionResponses } from './go-session-responses';

export class GoSessionItem {
  item_name!: string;
  question!: string;
  responses!: GoSessionResponses;
  version!: number;
  scale!:string;
  domain!: string;
}