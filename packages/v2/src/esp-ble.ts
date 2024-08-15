import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("esp-ble")
export default class EspLogo extends LitElement {
    @state() connected: boolean = false;
    private bleDevice: BluetoothDevice | null = null;
    private nusService: BluetoothRemoteGATTServer | null = null;
    private rxCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
    private txCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
    private buffer: string = '';
    private mtuSize: number = 20;

    connectionToggle() {
          if (this.connected) {
              this.disconnect();
          } else {
              this.connect();
          }
    }

    render() {
        return html`
    <button class="btn" @click="${this.connectionToggle}">${this.connected ? "Disconnect BLE" : "Connect BLE"}</button>
    `;
    }

    connect() {
        const bleNusServiceUUID ='6e400001-b5a3-f393-e0a9-e50e24dcca9e';
        const bleNusCharRXUUID   = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
        const bleNusCharTXUUID   = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
            if (!navigator.bluetooth) {
            console.log('WebBluetooth API is not available.\r\n' +
                        'Please make sure the Web Bluetooth flag is enabled.');
            window.term_.io.println('WebBluetooth API is not available on your browser.\r\n' +
                        'Please make sure the Web Bluetooth flag is enabled.');
            return;
        }
        console.log('Requesting Bluetooth Device...');
        navigator.bluetooth.requestDevice({
            //filters: [{services: []}]
            optionalServices: [bleNusServiceUUID],
            acceptAllDevices: true
        })
        .then(device => {
            this.bleDevice = device; 
            console.log('Found ' + device.name);
            console.log('Connecting to GATT Server...');
            this.bleDevice.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));
            return device.gatt.connect();
        })
        .then(server => {
            console.log('Locate NUS service');
            return server.getPrimaryService(bleNusServiceUUID);
        }).then(service => {
            this.nusService = service;
            console.log('Found NUS service: ' + service.uuid);
        })
        .then(() => {
            console.log('Locate RX characteristic');
            return this.nusService.getCharacteristic(bleNusCharRXUUID);
        })
        .then(characteristic => {
            this.rxCharacteristic = characteristic;
            console.log('Found RX characteristic');
        })
        .then(() => {
            console.log('Locate TX characteristic');
            return this.nusService.getCharacteristic(bleNusCharTXUUID);
        })
        .then(characteristic => {
            this.txCharacteristic = characteristic;
            console.log('Found TX characteristic');
        })
        .then(() => {
            console.log('Enable notifications');
            return this.txCharacteristic.startNotifications();
        })
        .then(() => {
            console.log('Notifications started');
            this.txCharacteristic.addEventListener('characteristicvaluechanged',
                this.handleNotifications.bind(this));
            this.connected = true;
        })
        .catch(error => {
            console.log('' + error);
            if(this.bleDevice && this.bleDevice.gatt.connected)
            {
                this.bleDevice.gatt.disconnect();
            }
        });
    }

    disconnect() {
        if (!this.bleDevice) {
            console.log('No Bluetooth Device connected...');
            return;
        }
        console.log('Disconnecting from Bluetooth Device...');
        if (this.bleDevice.gatt.connected) {
            this.bleDevice.gatt.disconnect();
            console.log('Bluetooth Device connected: ' + this.bleDevice.gatt.connected);
            this.connected = false;
        } else {
            console.log('> Bluetooth Device is already disconnected');
        }
    }

    onDisconnected() {
        this.connected = false;
    }

    handleNotifications(event) {
        console.log('notification');
        let value = event.target.value;
        // Convert raw data bytes to character values and use these to 
        // construct a string.
        let str = "";
        for (let i = 0; i < value.byteLength; i++) {
            str += String.fromCharCode(value.getUint8(i));
        }
        if(str.length > this.mtuSize) {
            // there is no direct method to get MTU
            this.mtuSize = str.length
        }
        this.buffer += str;

        let messages = this.buffer.split('\n');
        this.buffer = '';

        messages.forEach(message => {
            if(message.length == 0){
                return;
            }
            try {
                const jsonData = JSON.parse(message);
                let msg = message;
                if (jsonData.event == 'ping' && jsonData.title == undefined) {
                    msg = '';
                }
                else if (jsonData.event == 'log') {
                    msg = jsonData.msg;
                }
                const event = new MessageEvent(jsonData.event, {
                    data: msg,
                    lastEventId: Math.random(),
                });
                window.source.dispatchEvent(event);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    this.buffer = message;
                } else {
                    console.log("error", error);
                }
            }
        });
    
        if (this.buffer) {
            console.log('Incomplete JSON data, waiting for more data... ' + this.buffer);
        }

    }

}

// 'use strict';
// const MTU = 20;

// function nusSendString(s) {
//     if(bleDevice && bleDevice.gatt.connected) {
//         console.log("send: " + s);
//         let val_arr = new Uint8Array(s.length)
//         for (let i = 0; i < s.length; i++) {
//             let val = s[i].charCodeAt(0);
//             val_arr[i] = val;
//         }
//         sendNextChunk(val_arr);
//     } else {
//         window.term_.io.println('Not connected to a device yet.');
//     }
// }

// function sendNextChunk(a) {
//     let chunk = a.slice(0, MTU);
//     rxCharacteristic.writeValue(chunk)
//       .then(function() {
//           if (a.length > MTU) {
//               sendNextChunk(a.slice(MTU));
//           }
//       });
// }
