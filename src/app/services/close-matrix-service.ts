import {Injectable} from "@angular/core";
import "assets/background.js";

declare var backgroundScript:any;

@Injectable()
export class CloseMatrixService {
  private clickTime:number;

  constructor() {
  }

}
