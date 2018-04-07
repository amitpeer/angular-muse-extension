import {Injectable} from "@angular/core";
import "assets/background.js";

declare var backgroundScript:any;

@Injectable()
export class KeyboardService {

  public getState() {
    return 'keyboard';
  }

  public click() {
    backgroundScript.clickKeyboardLetter();
  }

  public headDown() {
    backgroundScript.moveOnKeyboard('down');
  }

  public headUp() {
    backgroundScript.moveOnKeyboard('up');
  }

  public headRight() {
    backgroundScript.moveOnKeyboard('right');
  }

  public headLeft() {
    backgroundScript.moveOnKeyboard('left');
  }

  public getHeadSensibility() {
    return 600;
  }

  public getLetter() {
  }

  public shouldHighlight(row, col) {
  }
}
