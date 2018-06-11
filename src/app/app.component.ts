import {Component, HostListener, NgZone} from "@angular/core";
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
import {GenericKeyboardService} from "./services/generic-keyboard-service";
import {STATE} from "../api/States";
import {KEY_CODE} from "../api/Keys";

declare var backgroundScript: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private muse = new MuseClient();
  private blinkTime = Date.now();
  private headMoveTimer = Date.now();
  private connected = false;
  private rightBlinks: Observable<number>;
  private accelerometer: Observable<XYZ>;
  private destroy = new Subject<void>();
  private accelerometerAdjustedValueX = 0;
  private accelerometerAdjustedValueY = 0.25;
  private accelerometerAdjustedValueZ = 1;
  private isInCentralizeMode = false;
  private matrixState;
  private START_DELAY = 1000;
  private XYZ_accelerometer = {
    x: this.accelerometerAdjustedValueX,
    y: this.accelerometerAdjustedValueY,
    z: this.accelerometerAdjustedValueZ
  };

  constructor(private openMatrixService: OpenMatrixService, private closeMatrixService: CloseMatrixService,
              private genericKeyboardService: GenericKeyboardService, private zone: NgZone) {
    this.muse.connectionStatus.subscribe(newStatus => {
      this.connected = newStatus;
      this.matrixState = openMatrixService;
    });
    window['angularComponentRef'] = {component: this, zone: zone};
  }

  public lettersMatrix() {
    return this.matrixState.getLetter();
  }

  public isLetter(str) {
    return this.matrixState.isLetter(str);
  }

  public getImgSrc(str) {
    return this.matrixState.getImgSrc(str);
  }

  public shouldHighlight(row, col) {
    return this.matrixState.shouldHighlight(row, col);
  }

  public async onConnectButtonClick() {
    await this.muse.connect();
    this.muse.start();
    await this.delay(this.START_DELAY);
    const rightEyeChannel = channelNames.indexOf('AF8');

    // use these to take data from different sensors
    const leftEyeChannel = channelNames.indexOf('AF7');
    const leftEarChannel = channelNames.indexOf('TP9');
    const rightEarChannel = channelNames.indexOf('TP10');

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
        this.click();
      }
    });

    this.accelerometer = this.muse.accelerometerData.pipe(
      takeUntil(this.destroy),
      map(reading => reading.samples[reading.samples.length - 1]));
    this.startAccelerometer();
  }

  public disconnect() {
    this.muse.disconnect();
  }

  public centralize() {
    this.isInCentralizeMode = true;
    this.accelerometer.subscribe(value => {
      this.accelerometerAdjustedValueX = value.x;
      this.accelerometerAdjustedValueY = value.y;
      this.accelerometerAdjustedValueZ = value.z;
    });
  }

  public stopCentralize() {
    this.adjustAccelerometerValue();
    this.isInCentralizeMode = false;
  }

  public changeStateFromOutside(changeTo?) {
    this.zone.run(() => {
      this.stateChanged(changeTo);
    });
  }

  private click() {
    if (!this.isMovingHead()) {
      const response = this.matrixState.click();
      if (response === STATE.GENERIC_KEYBOARD) {
        this.stateChanged(STATE.GENERIC_KEYBOARD)
      } else if (response !== 'none') {
        this.stateChanged();
      }
    }
  }

  private stateChanged(changeTo?) {
    const currentState = this.matrixState.getState();

    if (changeTo === STATE.GENERIC_KEYBOARD) {
      this.matrixState = this.genericKeyboardService;
      backgroundScript.minimize();

    } else if (changeTo === STATE.CLOSE || currentState === STATE.OPEN) {
      this.matrixState = this.closeMatrixService;
      backgroundScript.minimize();

    } else if (changeTo === STATE.OPEN || currentState === STATE.CLOSE || currentState === STATE.GENERIC_KEYBOARD) {
      this.matrixState = this.openMatrixService;
      backgroundScript.maximize();
    }
  }

  private isMovingHead() {
    return Date.now() - this.headMoveTimer < this.matrixState.getHeadSensibility();
  }

  private adjustAccelerometerValue() {
    this.XYZ_accelerometer.x = this.accelerometerAdjustedValueX;
    this.XYZ_accelerometer.y = this.accelerometerAdjustedValueY + 0.25;
    this.XYZ_accelerometer.z = this.accelerometerAdjustedValueZ;
  }

  private startAccelerometer() {
    this.accelerometer.subscribe(value => {
      const msSinceHeadMove = Date.now() - this.headMoveTimer;

      if (msSinceHeadMove > this.matrixState.getHeadSensibility()) {

        // the following line used to be outside, but now it's inside every if
        // we're not sure what's better yet
        // but it's good for freezing click while moving
        // this.headMoveTimer = Date.now();

        if (value.y < (this.XYZ_accelerometer.y * (-1) + 0.20)) {
          console.log('Accelerometer Data (Left): ', value);
          this.headMoveTimer = Date.now();
          this.matrixState.headLeft();
        }

        else if (value.y > this.XYZ_accelerometer.y) {
          console.log('Accelerometer Data (Right): ', value);
          this.headMoveTimer = Date.now();
          this.matrixState.headRight();
        }

        else if (value.x > this.XYZ_accelerometer.x + 0.15) {
          console.log('Accelerometer Data (Down): ', value);
          this.headMoveTimer = Date.now();
          this.matrixState.headDown();
        }

        else if (value.x < this.XYZ_accelerometer.x - 0.15) {
          console.log('Accelerometer Data (Up): ', value);
          this.headMoveTimer = Date.now();
          this.matrixState.headUp();
        }
      }
    });
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  @HostListener('window:keyup', ['$event'])
  private keyEvent(event: KeyboardEvent) {
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
      this.click();
    }
  }

}
