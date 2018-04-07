import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {AppComponent} from "./app.component";
import {OpenMatrixService} from "./services/open-matrix-service";
import {CloseMatrixService} from "./services/close-matrix-service";
import {KeyboardService} from "./services/keyboard-service";


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [OpenMatrixService, CloseMatrixService, KeyboardService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
