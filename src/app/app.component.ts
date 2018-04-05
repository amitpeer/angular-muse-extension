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

declare var backgroundScript:any;
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
  headMoveTimer = Date.now();
  connected = false;
  leftBlinks:Observable<number>;
  rightBlinks:Observable<number>;
  accelerometer:Observable<XYZ>;
  destroy = new Subject<void>();
  dataReceivedCount = 0;
  dataReceivedThreshHold = 7;

  acceloAdjustedValueX = 0;
  acceloAdjustedValueY = 0.25;
  acceloAdjustedValueZ = 1;
  XYZ_accelometer = {
    x: this.acceloAdjustedValueX,
    y: this.acceloAdjustedValueY,
    z: this.acceloAdjustedValueZ
  };
  isInCentralizeMode = false;
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

  delay(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isLetter(str) {
    return this.matrixState.isLetter(str);
  }

  getImgSrc(str) {
    return this.matrixState.getImgSrc(str);
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
        const response = this.matrixState.click();
        if (response !== 'none') {
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

  centralize() {
    this.isInCentralizeMode = true;
    this.accelerometer.subscribe(value => {
      this.acceloAdjustedValueX = value.x;
      this.acceloAdjustedValueY = value.y;
      this.acceloAdjustedValueZ = value.z;
    });
  }

  private isReceivedPastThreshold() {
    return (this.dataReceivedCount > this.matrixState.getDataReceivedThreshold());
  }

  stopCentralize() {
    this.adjustmentAccelerometerValue();
    this.isInCentralizeMode = false;
  }

  private stateChange() {
    if (this.matrixState.getState() === STATE.OPEN) {
      this.matrixState = this.closeMatrixService;
      backgroundScript.minimize();
    } else if (this.matrixState.getState() === STATE.CLOSE) {
      this.matrixState = this.openMatrixService;
      backgroundScript.maximize();
    }
  }

  private startAccelerometer() {
    this.accelerometer.subscribe(value => {
      const msSinceHeadMove = Date.now() - this.headMoveTimer;

      if (msSinceHeadMove > this.matrixState.getHeadSensibility()) {
        this.headMoveTimer = Date.now();
        if (value.y < (this.XYZ_accelometer.y * (-1) + 0.20)) {
          console.log('Accelerometer Data (Left): ', value);
          this.matrixState.headLeft();
        } else if (value.y > this.XYZ_accelometer.y) {
          console.log('Accelerometer Data (Right): ', value);
          this.matrixState.headRight();
        } else if (value.x > this.XYZ_accelometer.x + 0.15) {
          console.log('Accelerometer Data (Down): ', value);
          this.matrixState.headDown();
        } else if (value.x < this.XYZ_accelometer.x - 0.15) {
          console.log('Accelerometer Data (Up): ', value);
          this.matrixState.headUp();
        }
      }
    });
  }

  private adjustmentAccelerometerValue() {
    this.XYZ_accelometer.x = this.acceloAdjustedValueX;
    this.XYZ_accelometer.y = this.acceloAdjustedValueY + 0.25;
    this.XYZ_accelometer.z = this.acceloAdjustedValueZ;
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
