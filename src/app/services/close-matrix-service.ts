import {Injectable} from '@angular/core';
import 'assets/background.js';
import {Service} from "../../api/Service";

declare var backgroundScript: any;

@Injectable()
export class CloseMatrixService implements Service {

  private dataReceivedThreshold = 1;

  constructor() {
  }

  public getState() {
    return 'close';
  }

  public getHeadSensibility() {
    return 60;
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
}
