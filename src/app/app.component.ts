import {Component, HostListener} from "@angular/core";
import {MuseClient, channelNames} from "muse-js";
import {Observable} from "rxjs/Observable";
import {merge} from "rxjs/observable/merge";
import "rxjs/add/observable/of";
import "rxjs/add/observable/timer";
import "rxjs/add/operator/do";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "assets/background.js";
import "rxjs/add/operator/merge";

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  ENTER = 13
}

declare var backgroundScript:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private muse = new MuseClient();
  connected = false;
  leftBlinks:Observable<number>;
  rightBlinks:Observable<number>;
  closeAndOpenEyes:Observable<number>;
  selectorIndex = {row: 0, col: 0};
  letters = [["A", "B", "C", "D"],
    ["E", "F", "G", "H"],
    ["I", "J", "K", "L"],
    ["M", "N", "O", "P"],
    ["Q", "R", "S", "T"],
    ["U", "V", "W", "X"],
    ["Y", "Z", "?", "?"]];

  constructor() {
    this.muse.connectionStatus.subscribe(newStatus => {
      this.connected = newStatus;
    });
  }

  shouldHighlight(row, col) {
    return row == this.selectorIndex.row && col == this.selectorIndex.col;
  }

  async onConnectButtonClick() {
    await this.muse.connect();
    this.muse.start();

    const leftEyeChannel = channelNames.indexOf('AF7');
    const rightEyeChannel = channelNames.indexOf('AF8');
    const leftEarChannel = channelNames.indexOf('TP9');

    // this.closeAndOpenEyes = this.muse.eegReadings
    //   .filter(r => r.electrode === leftEarChannel)
    //   .map

    //noinspection TypeScriptValidateTypes
    this.rightBlinks = this.muse.eegReadings
      .filter(r => r.electrode === rightEyeChannel)
      .map(r => Math.max(...r.samples.map(n => Math.abs(n))))
      .filter(max => max > 500)
      .switchMap(() =>
        merge(
          Observable.of(1),
          Observable.timer(500).map(() => 0)
        )
      );

    this.rightBlinks.subscribe(value => {
      if (value === 1) {
        console.log('Right Blink!', value);
      }
    });

  };

  disconnect() {
    this.muse.disconnect();
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

    if (event.keyCode === KEY_CODE.ENTER) {
      backgroundScript.doNavigation(this.letters[this.selectorIndex.row][this.selectorIndex.col]);
    }
  }

}
