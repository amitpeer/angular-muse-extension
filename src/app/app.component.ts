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
  // constructor() {
  // }

  letters = [["A", "B", "C", "D"],
    ["E", "F", "G", "H"],
    ["I", "J", "K", "L"],
    ["M", "N", "O", "P"],
    ["Q", "R", "S", "T"],
    ["U", "V", "W", "X"],
    ["Y", "Z", "?", "?"]];

  selectorIndex = {row: 0, col: 0};

  ngAfterViewInit() {
    let row = this.selectorIndex.row;
    let col = this.selectorIndex.col;
    document.getElementById(row + ":" + col).style.backgroundColor = "yellow";
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event:KeyboardEvent) {
    console.log(event);

    if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
      this.selectorIndex.col++;
      this.ngAfterViewInit()
    }

    if (event.keyCode === KEY_CODE.LEFT_ARROW) {
      this.selectorIndex.col--;
      this.ngAfterViewInit()
    }
  }




}
