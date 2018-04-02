import {Injectable} from "@angular/core";
import "assets/background.js";

declare var backgroundScript:any;

@Injectable()
export class CloseMatrixService {

  private dataReceivedThreshold = 1;

  constructor() {
  }

  public getState() {
    return 'close';
  }

  public click() {
  }

  public shouldHighlight(row, col) {
  }

  public getLetter() {
  }

  public headDown() {
    console.log('closeMatrixState::headDown');
    backgroundScript.scrollDown();
  }

  public headUp() {
    console.log('closeMatrixState::headUp');
    backgroundScript.scrollUp();
  }

  public headRight() {
  }

  public headLeft() {
  }


  public getDataReceivedThreshold() {
    return this.dataReceivedThreshold;
  }
}
