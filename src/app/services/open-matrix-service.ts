import {Injectable} from "@angular/core";
import "assets/background.js";

export enum ACTION {
  CLOSE_MATRIX = 'CM',
  REFRESH = 'RE',
  FORWARD = 'FO',
  BACK = 'BA',
  HOME_PAGE = 'HO',
  NO_ACTION = 'NO'
}

declare var backgroundScript:any;

@Injectable()
export class OpenMatrixService {
  private clickTime = Date.now();
  private TIME_BETWEEN_CLICKS = 2000;
  private selectorIndex = {row: 0, col: 0};
  private letters =
    [[ACTION.NO_ACTION, ACTION.BACK, ACTION.FORWARD, ACTION.CLOSE_MATRIX],
      [ACTION.HOME_PAGE, ACTION.REFRESH, 'A', 'B'],
      ['C', 'D', 'E', 'F'],
      ['G', 'H', 'I', 'J'],
      ['K', 'L', 'M', 'N'],
      ['O', 'P', 'Q', 'R'],
      ['S', 'T', 'U', 'V'],
      ['W', 'X', 'Y', 'Z']];

  private dataReceivedThreshold = 8;
  private app;

  constructor() {
  }

  public getState() {
    return 'open';
  }

  public getHeadSensibility() {
    return 600;
  }

  public click() {
    const clickedIcon = this.letters[this.selectorIndex.row][this.selectorIndex.col];
    if (this.isLetter(clickedIcon)) {
      backgroundScript.doNavigation(this.letters[this.selectorIndex.row][this.selectorIndex.col]);
    } else if (clickedIcon === ACTION.NO_ACTION) {
      return 'none';
    } else if (clickedIcon === ACTION.REFRESH) {
      backgroundScript.refresh();
    }
  }

  public shouldHighlight(row, col) {
    return row === this.selectorIndex.row && col === this.selectorIndex.col;
  }

  public getLetter() {
    return this.letters;
  }

  public headDown() {
    if (this.selectorIndex.row < this.letters.length - 1) {
      this.selectorIndex.row++;
    }
  }

  public headUp() {
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

  public isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
  }

  public getImgSrc(str) {
    var src = "";

    if (str === ACTION.CLOSE_MATRIX) {
      src = "assets/close_matrix_icon.png";
    } else if (str === ACTION.BACK) {
      src = "assets/back_icon.png";
    } else if (str === ACTION.FORWARD) {
      src = "assets/forward_icon.png";
    } else if (str === ACTION.REFRESH) {
      src = "assets/refresh_icon.png";
    } else if (str === ACTION.HOME_PAGE) {
      src = "assets/homepage_icon.png";
    } else if (str === ACTION.NO_ACTION) {
      src = "assets/no_action_icon.png";
    }

    return src;
  }
}
