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

  private dataReceivedThreshold = 8;

  constructor() {
  }

  public getState() {
    return 'open';
  }

  public click() {
    backgroundScript.doNavigation(this.letters[this.selectorIndex.row][this.selectorIndex.col]);
  }

  public shouldHighlight(row, col) {
    return row === this.selectorIndex.row && col === this.selectorIndex.col;
  }

  public getLetter() {
    return this.letters;
  }

  public headDown(controller) {
    if (this.selectorIndex.row < this.letters.length - 1) {
      this.selectorIndex.row++;
    }
  }

  public headUp(controller) {
    if (this.selectorIndex.row > 0) {
      this.selectorIndex.row--;
    }
  }

  public headRight() {
    if (this.selectorIndex.col < this.letters[0].length - 1) {
      this.selectorIndex.col++;
    }
  }

  public headLeft() {
    if (this.selectorIndex.col > 0) {
      this.selectorIndex.col--;
    }
  }

  public getDataReceivedThreshold() {
    return this.dataReceivedThreshold;
  }
}
