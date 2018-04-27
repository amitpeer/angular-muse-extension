import {Injectable} from "@angular/core";
import "assets/background.js";

export enum ACTION {
  CLOSE_MATRIX = 'CM',
  REFRESH = 'RE',
  FORWARD = 'FO',
  BACK = 'BA',
  HOME_PAGE = 'HO',
  NO_ACTION = 'NO',
  KEYBOARD = "KE",
  GAP_LETTERS = "GL"
}

declare var backgroundScript:any;

@Injectable()
export class OpenMatrixService {
  private clickTime = Date.now();
  private TIME_BETWEEN_CLICKS = 2000;
  private selectorIndex = {row: 0, col: 0};
  private letters =
    [[ACTION.NO_ACTION, ACTION.BACK, ACTION.FORWARD, ACTION.CLOSE_MATRIX],
      [ACTION.HOME_PAGE, ACTION.REFRESH, ACTION.KEYBOARD, ACTION.GAP_LETTERS],
      ['A', 'B', 'C', 'D'],
      ['E', 'F', 'G', 'H'],
      ['I', 'J', 'K', 'L'],
      ['M', 'N', 'O', 'P'],
      ['Q', 'R', 'S', 'T'],
      ['U', 'V', 'W', 'X'],
      ['Y', 'Z', '?', '?']];

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
      backgroundScript.doNavigation(clickedIcon);
    } else if (clickedIcon === ACTION.NO_ACTION) {
      return 'none';
    } else if (clickedIcon === ACTION.REFRESH) {
      backgroundScript.refresh();
    } else if (clickedIcon === ACTION.BACK) {
      backgroundScript.back();
    } else if (clickedIcon === ACTION.FORWARD) {
      backgroundScript.forward();
    } else if (clickedIcon === ACTION.HOME_PAGE) {
      backgroundScript.home();
    } else if (clickedIcon === ACTION.KEYBOARD) {
      backgroundScript.openKeyboard();
      return 'keyboard';
    } else if (clickedIcon === ACTION.GAP_LETTERS) {
      backgroundScript.gapLetters();
    }
  }

  public shouldHighlight(row, col) {
    return row === this.selectorIndex.row && col === this.selectorIndex.col;
  }

  public getLetter() {
    return this.letters;
  }

  public backgroundColorChange(exitLetterRowIndex) {
    const exitLetter = this.letters[exitLetterRowIndex.row][exitLetterRowIndex.col];
    if (this.isLetter(exitLetter)) {
      const enterLetter = this.letters[this.selectorIndex.row][this.selectorIndex.col];
      backgroundScript.matrixLetterChange(exitLetter, enterLetter);
    }
  }

  public headDown() {
    if (this.selectorIndex.row < this.letters.length - 1) {
      const exitLetterIndexes = Object.assign({}, this.selectorIndex);
      this.selectorIndex.row++;
      this.backgroundColorChange(exitLetterIndexes);
    }
  }

  public headUp() {
    if (this.selectorIndex.row > 0) {
      const exitLetterIndexes = Object.assign({}, this.selectorIndex);
      this.selectorIndex.row--;
      this.backgroundColorChange(exitLetterIndexes);
    }
  }

  public headRight() {
    if (this.selectorIndex.col < this.letters[0].length - 1) {
      const exitLetterIndexes = Object.assign({}, this.selectorIndex);
      this.selectorIndex.col++;
      this.backgroundColorChange(exitLetterIndexes);
    }
  }

  public headLeft() {
    if (this.selectorIndex.col > 0) {
      const exitLetterIndexes = Object.assign({}, this.selectorIndex);
      this.selectorIndex.col--;
      this.backgroundColorChange(exitLetterIndexes);
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
    } else if (str == ACTION.KEYBOARD) {
      src = "assets/keyboard_icon.png";
    } else if (str == ACTION.GAP_LETTERS) {
      src = "assets/search_icon.png";
    }

    return src;
  }
}
