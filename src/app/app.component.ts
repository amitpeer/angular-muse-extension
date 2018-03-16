import {Component} from "@angular/core";
import {channelNames, MuseClient, XYZ} from "muse-js";
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
import {map, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs/Subject";
import {OpenMatrixService} from "./services/open-matrix-service";


export enum STATE {
  OPEN = 'open',
  CLOSE = 'close'
}


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
  state = STATE.OPEN;
  private muse = new MuseClient();
  stateChangeTime = Date.now();
  connected = false;
  leftBlinks:Observable<number>;
  rightBlinks:Observable<number>;
  accelerometer:Observable<XYZ>;
  destroy = new Subject<void>();
  dataRecievedCount = 0;
  moveOnTreshHold = 7;
  XYZ_down = {
    x: 0.15,
    y: 0,
    z: 0.98
  };
  XYZ_up = {
    x: -0.15,
    y: 0,
    z: 0.95
  };
  XYZ_right = {
    x: 0,
    y: 0.18,
    z: 1
  };
  XYZ_left = {
    x: 0,
    y: -0.12,
    z: 1
  };
  private matrixState;
  private START_DELAY = 5 * 1000;

  constructor(private openMatrixService:OpenMatrixService) {
    this.muse.connectionStatus.subscribe(newStatus => {
      this.connected = newStatus;
      this.matrixState = openMatrixService;
    });
  }

  lettersMatrix() {
    return this.matrixState.getLetter();
  }

  delay(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  shouldHighlight(row, col) {
    return this.matrixState.shouldHighlight(row, col);
  }

  async onConnectButtonClick() {
    await this.muse.connect();
    this.muse.start();
    await this.delay(this.START_DELAY);
    const leftEyeChannel = channelNames.indexOf('AF7');
    const rightEyeChannel = channelNames.indexOf('AF8');
    const leftEarChannel = channelNames.indexOf('TP9');
    const rightEarChannel = channelNames.indexOf('TP10');

    // noinspection TypeScriptValidateTypes
    this.rightBlinks = this.muse.eegReadings
      .filter(r => r.electrode === rightEyeChannel)
      .map(r => Math.max(...r.samples.map(n => Math.abs(n))))
      .filter(max => max > 500)
      .switchMap(() =>
        merge(
          Observable.of(1),
          Observable.timer(1000).map(() => 0)
        )
      );

    this.rightBlinks.subscribe(value => {
      if (value === 1) {
        console.log('Right Blink! Performing Click', value);
        this.matrixState.click();
      }
    });

    //noinspection TypeScriptValidateTypes
    this.leftBlinks = this.muse.eegReadings
      .filter(r => r.electrode === leftEyeChannel)
      .map(r => Math.max(...r.samples.map(n => Math.abs(n))))
      .filter(max => max > 500 && max < 1000)
      .switchMap(() =>
        merge(
          Observable.of(1),
          Observable.timer(1000).map(() => 0)
        )
      );

    this.leftBlinks.subscribe(value => {
      const msSinceStateChange = Date.now() - this.stateChangeTime;
      if (value === 1 && msSinceStateChange > 2000) {
        console.log('Left Blink! Performing state changing', value);
        this.stateChange();
      }
    });

    this.accelerometer = this.muse.accelerometerData.pipe(
      takeUntil(this.destroy),
      map(reading => reading.samples[reading.samples.length - 1]));
    this.startAccelerometer();
  }

  disconnect() {
    this.muse.disconnect();
  }

  private startAccelerometer() {
    // this.accelerometer.subscribe(value => {
    //   this.dataRecievedCount++;
    //   if (this.timeToMoveOn()) {
    //     this.dataRecievedCount = 0;
    //     if (value.x > this.XYZ_down.x && value.z < this.XYZ_down.z
    //       && this.selectorIndex.row < this.letters.length - 1) {
    //       console.log('Accelerometer Data (Down): ', value);
    //       this.selectorIndex.row++;
    //     } else if (value.x < this.XYZ_up.x && value.z < this.XYZ_up.z
    //       && this.selectorIndex.row > 0) {
    //       console.log('Accelerometer Data (Up): ', value);
    //       this.selectorIndex.row--;
    //     } else if (value.y > this.XYZ_right.y
    //       && this.selectorIndex.col < this.letters[0].length - 1) {
    //       console.log('Accelerometer Data (Right): ', value);
    //       this.selectorIndex.col++;
    //     } else if (value.y < this.XYZ_left.y
    //       && this.selectorIndex.col > 0) {
    //       console.log('Accelerometer Data (Left): ', value);
    //       this.selectorIndex.col--;
    //     }
    //   }
    // });
  }

  private timeToMoveOn() {
    return (this.dataRecievedCount > this.moveOnTreshHold);
  }

  private stateChange() {
    this.stateChangeTime = Date.now();
    if (this.state === STATE.OPEN) {
      this.state = STATE.CLOSE;
      this.matrixState = this.openMatrixService;
      // close matrix
      backgroundScript.minimize();
    } else {
      this.state = STATE.OPEN;
      // open matrix
      backgroundScript.maximize();
    }
  }
}

// @HostListener('window:keyup', ['$event'])
// keyEvent(event: KeyboardEvent) {
//   console.log(event);
//
//   if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
//     if (this.selectorIndex.col < this.matrixState()[0].length - 1) {
//       this.selectorIndex.col++;
//     }
//   }
//
//   if (event.keyCode === KEY_CODE.LEFT_ARROW) {
//     if (this.selectorIndex.col > 0) {
//       this.selectorIndex.col--;
//     }
//   }
//
//   if (event.keyCode === KEY_CODE.DOWN_ARROW) {
//     if (this.selectorIndex.row < this.matrixState().length - 1) {
//       this.selectorIndex.row++;
//     }
//   }
//   if (event.keyCode === KEY_CODE.UP_ARROW) {
//     if (this.selectorIndex.row > 0) {
//       this.selectorIndex.row--;
//     }
//   }
//
//   if (event.keyCode === KEY_CODE.ENTER) {
//     // this.click();
//   }
// }


