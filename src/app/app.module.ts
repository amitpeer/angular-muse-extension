import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {AppComponent} from "./app.component";
import {OpenMatrixService} from "./services/open-matrix-service";
import {CloseMatrixService} from "./services/close-matrix-service";
import {GenericKeyboardService} from "./services/generic-keyboard-service";


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [OpenMatrixService, CloseMatrixService, GenericKeyboardService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
