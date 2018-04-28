import {Injectable} from "@angular/core";
import "assets/background.js";
import {STATE} from "../states";

declare var backgroundScript:any;

@Injectable()
export class GenericKeyboardService {

  public getState() {
    return STATE.GENERIC_KEYBOARD;
  }

  public click() {
    backgroundScript.clickGenericKeyboardLetter();
    return 'none';
  }

  public headDown() {
    backgroundScript.moveOnGenericKeyboard('down');
  }

  public headUp() {
    backgroundScript.moveOnGenericKeyboard('up');
  }

  public headRight() {
    backgroundScript.moveOnGenericKeyboard('right');
  }

  public headLeft() {
    backgroundScript.moveOnGenericKeyboard('left');
  }

  public getHeadSensibility() {
    return 600;
  }

  public getLetter() {
  }

  public shouldHighlight(row, col) {
  }
}
