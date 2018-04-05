import {Component, HostListener} from "@angular/core";
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
import {CloseMatrixService} from "./services/close-matrix-service";


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
  private muse = new MuseClient();
  blinkTime = Date.now();
  connected = false;
  leftBlinks:Observable<number>;
  rightBlinks:Observable<number>;
  accelerometer:Observable<XYZ>;
  destroy = new Subject<void>();
  dataReceivedCount = 0;
  dataReceivedThreshHold = 7;
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
  private START_DELAY = 2 * 1000;

  constructor(private openMatrixService:OpenMatrixService, private closeMatrixService:CloseMatrixService) {
    this.muse.connectionStatus.subscribe(newStatus => {
      this.connected = newStatus;
      this.matrixState = openMatrixService;
    });
  }

  lettersMatrix() {
    return this.matrixState.getLetter();
  }

  isLetter(str) {
    return this.matrixState.isLetter(str);
  }

  getImgSrc(str) {
    return this.matrixState.getImgSrc(str);
  }

  delay(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  shouldHighlight(row, col) {
    return this.matrixState.shouldHighlight(row, col);
  }

  public dataRecievedTreshHoldChange(treshHold) {
    this.dataReceivedThreshHold = treshHold;
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
      const msSinceBlink = Date.now() - this.blinkTime;
      if (value === 1 && msSinceBlink > 2000) {
        this.blinkTime = Date.now();
        console.log('Right Blink! Performing Click', value);
        var response = this.matrixState.click();
        if (response != 'none') {
          this.stateChange();
        }
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
    this.accelerometer.subscribe(value => {
      this.dataReceivedCount++;
      if (this.isReceivedPastThreshold()) {
        this.dataReceivedCount = 0;
        if (value.x > this.XYZ_down.x && value.z < this.XYZ_down.z) {
          console.log('Accelerometer Data (Down): ', value);
          this.matrixState.headDown();
        } else if (value.x < this.XYZ_up.x && value.z < this.XYZ_up.z) {
          console.log('Accelerometer Data (Up): ', value);
          this.matrixState.headUp();
        } else if (value.y > this.XYZ_right.y) {
          console.log('Accelerometer Data (Right): ', value);
          this.matrixState.headRight();
        } else if (value.y < this.XYZ_left.y) {
          console.log('Accelerometer Data (Left): ', value);
          this.matrixState.headLeft();
        }
      }
    });
  }

  private isReceivedPastThreshold() {
    return (this.dataReceivedCount > this.matrixState.getDataReceivedThreshold());
  }

  public stateChange() {
    if (this.matrixState.getState() === STATE.OPEN) {
      this.matrixState = this.closeMatrixService;
      backgroundScript.minimize();
    } else if (this.matrixState.getState() === STATE.CLOSE) {
      this.matrixState = this.openMatrixService;
      backgroundScript.maximize();
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event:KeyboardEvent) {
    console.log(event);

    if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
      this.matrixState.headRight();
    }

    if (event.keyCode === KEY_CODE.LEFT_ARROW) {
      this.matrixState.headLeft();
    }

    if (event.keyCode === KEY_CODE.DOWN_ARROW) {
      this.matrixState.headDown();
    }

    if (event.keyCode === KEY_CODE.UP_ARROW) {
      this.matrixState.headUp();
    }

    if (event.keyCode === KEY_CODE.ENTER) {
      this.matrixState.click();
    }
  }
}
