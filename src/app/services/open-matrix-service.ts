import {Injectable} from "@angular/core";
import "assets/background.js";

declare var backgroundScript:any;

@Injectable()
export class OpenMatrixService {
  private clickTime = Date.now();
  private TIME_BETWEEN_CLICKS = 2000;
  private selectorIndex = {row: 0, col: 0};
  private letters = [['A', 'B', 'C', 'D'],
    ['E', 'F', 'G', 'H'],
    ['I', 'J', 'K', 'L'],
    ['M', 'N', 'O', 'P'],
    ['Q', 'R', 'S', 'T'],
    ['U', 'V', 'W', 'X'],
    ['Y', 'Z', '?', '?'],
    ['?', '?', '?', '?']];


  constructor() {
  }

  public click() {
    console.log('openMatrixService::click');
    const msSinceClick = Date.now() - this.clickTime;
    if (msSinceClick > this.TIME_BETWEEN_CLICKS) {
      console.log('openMatrixService::click (after delay check)');
      this.clickTime = Date.now();
      backgroundScript.doNavigation(this.letters[this.selectorIndex.row][this.selectorIndex.col]);
    }
  }

  public shouldHighlight(row, col) {
    return row === this.selectorIndex.row && col === this.selectorIndex.col;
  }

  public getLetter() {
    return this.letters;
  }
}
