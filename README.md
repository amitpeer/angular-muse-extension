# Blink ;) 

"Blink ;)" is a Google Chrome's extension which allows you to surf the interent with head motions and blinks only (hands-free), by using EEG data received from [Muse EEG headband](http://www.choosemuse.com/).


## Credit

"Blink ;)" is powered by [muse-lsl](https://github.com/urish/muse-lsl) library & [web-bluetooth-polyfill](https://github.com/urish/web-bluetooth-polyfill/)

## Prequests

In order to use "Blink ;)" you will need:
1. Muse EEG headband (2016 edition)
2. Windows 10 with Google Chrome installed
3. Angluar CLI (to build the project)


## Installation
1. Follow the insturctions [here](https://github.com/urish/web-bluetooth-polyfill/) to enable Web Bluetooth in Chrome on Windows 10.
2. Clone this repo (angluar-muse-extension)
3. Run `ng build` to build the project, the build artifacts will be stored in the `dist/` directory
4. Add the extension: open chrome and navigate to `chrome://extensions/`, press on "Load Unpakced" and navigate to the dist folder in the project. Then copy the extension ID of Blink 1.0
5. Edit C:\Program Files (x86)\Web Bluetooth Polyfill\manifest.json and change the extension id in the allowed_origins section to match the extension ID you found in step 4


## Running
After the extension is successfully loaded on your browser, simply click the extension's popup icon and click the "connect" button.
Connect the extension with your Muse device and start surfing the web hand-less!

