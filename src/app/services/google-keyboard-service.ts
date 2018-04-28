import {Injectable} from "@angular/core";
import "assets/background.js";
import {STATE} from "../states";

declare var backgroundScript:any;

@Injectable()
export class GoogleKeyboardService {

  public getState() {
    return STATE.GOOGLE_KEYBOARD;
  }

  public click() {
    backgroundScript.clickGoogleKeyboardLetter();
    return 'none';
  }

  public headDown() {
    backgroundScript.moveOnGoogleKeyboard('down');
  }

  public headUp() {
    backgroundScript.moveOnGoogleKeyboard('up');
  }

  public headRight() {
    backgroundScript.moveOnGoogleKeyboard('right');
  }

  public headLeft() {
    backgroundScript.moveOnGoogleKeyboard('left');
  }

  public getHeadSensibility() {
    return 600;
  }

  public getLetter() {
  }

  public shouldHighlight(row, col) {
  }
}
