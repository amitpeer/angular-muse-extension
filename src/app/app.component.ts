import {Component, HostListener} from "@angular/core";

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  UP_ARROW = 38,
  DOWN_ARROW = 40
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  letters = [["A", "B", "C", "D"],
    ["E", "F", "G", "H"],
    ["I", "J", "K", "L"],
    ["M", "N", "O", "P"],
    ["Q", "R", "S", "T"],
    ["U", "V", "W", "X"],
    ["Y", "Z", "?", "?"]];

  selectorIndex = {row: 0, col: 0};


  shouldHighlight(row, col) {
    if (row == this.selectorIndex.row && col == this.selectorIndex.col) {
      return true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event:KeyboardEvent) {
    console.log(event);

    if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
      if (this.selectorIndex.col < this.letters[0].length - 1) {
        this.selectorIndex.col++;
      }
    }

    if (event.keyCode === KEY_CODE.LEFT_ARROW) {
      if (this.selectorIndex.col > 0) {
        this.selectorIndex.col--;
      }
    }

    if (event.keyCode === KEY_CODE.DOWN_ARROW) {
      if (this.selectorIndex.row < this.letters.length - 1) {
        this.selectorIndex.row++;
      }
    }

    if (event.keyCode === KEY_CODE.UP_ARROW) {
      if (this.selectorIndex.row > 0) {
        this.selectorIndex.row--;
      }
    }
  }

}
