/*
Based on https://github.com/equalent/DualSense.js by Andrey Tsurkan, with the
addition of gyro and accelerometer support, and a virtual "attitude" sensor that
fuses data from the gyro and accelerometer to give the controller's orientation.

MIT License

Copyright (c) 2022 Andrey Tsurkan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

import AHRS from 'ahrs'
import crc32 from 'crc/crc32'
import {Buffer} from 'buffer/'

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max)

if (typeof navigator.hid === 'undefined') {
  console.error('DualSense.js requires WebHID support!')
}

export enum DSControllerStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
}

export enum DSControllerConnectionType {
  USB = 'USB',
  BLUETOOTH = 'BLUETOOTH',
}

interface DSControllerStateChangeEvent {
  state: DSControllerState
}

type DSControllerEvent = DSControllerStateChangeEvent

type DSControllerStateChangeListener = (
  event: DSControllerStateChangeEvent,
) => void
type DSControllerEventListener = DSControllerStateChangeListener
type DSControllerEventType = 'stateChange'

export interface DSControllerLEDColor {
  r: number
  g: number
  b: number
}

export interface DSController {
  get status(): DSControllerStatus
  get connectionType(): DSControllerConnectionType
  get productName(): string
  set ledColor(color: DSControllerLEDColor)
  set leftMotor(strength: number)
  set rightMotor(strength: number)
  disconnect(): Promise<void>
  addEventListener(
    type: DSControllerEventType,
    listener: DSControllerEventListener,
  ): void
  removeEventListener(
    type: DSControllerEventType,
    listener: DSControllerEventListener,
  ): void
  attitude: {
    applyGyro: () => void
    apply: () => void
    reset: () => void
  }
}

export interface DSControllerTouchState {
  active: boolean
  id: number
  x: number
  y: number
}

export interface DSControllerGyroState {
  x: number
  y: number
  z: number
}

export interface DSControllerAccelState {
  x: number
  y: number
  z: number
}

export interface DSControllerBatteryState {
  percent: number
  full: boolean
  charging: boolean
}

export interface DSControllerAttitude {
  heading: number
  pitch: number
  roll: number
}

export class DSControllerState {
  leftStickX: number = 0
  leftStickY: number = 0
  rightStickX: number = 0
  rightStickY: number = 0
  leftTrigger: number = 0
  rightTrigger: number = 0

  leftButton: boolean = false
  rightButton: boolean = false

  square: boolean = false
  cross: boolean = false
  circle: boolean = false
  triangle: boolean = false

  dpadUp: boolean = false
  dpadDown: boolean = false
  dpadLeft: boolean = false
  dpadRight: boolean = false

  leftStickButton: boolean = false
  rightStickButton: boolean = false

  optionsButton: boolean = false
  createButton: boolean = false
  psButton: boolean = false
  touchButton: boolean = false

  touch0: DSControllerTouchState = {active: false, id: 0, x: 0, y: 0}
  touch1: DSControllerTouchState = {active: false, id: 0, x: 0, y: 0}

  gyro: DSControllerGyroState = {x: 0, y: 0, z: 0}

  accel: DSControllerAccelState = {x: 0, y: 0, z: 0}

  battery: DSControllerBatteryState = {
    percent: 0,
    full: false,
    charging: false,
  }

  attitude: [number, number, number, number] = [0, 0, 0, 1]

  prevTimestamp: number = -1
  timestamp: number = -1

  raw01: any = {}
  raw31: any = {}
}

export class DSControllerNotFoundError extends Error {
  constructor() {
    super(
      'No DualSense controller available (not connected or not selected by the user)',
    )
    this.name = new.target.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class DSControllerNotConnected extends Error {
  constructor() {
    super('DualSense is not connected')
    this.name = new.target.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class DSControllerIncompatible extends Error {
  constructor() {
    super('DualSense is not compatible')
    this.name = new.target.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

const DS_VENDOR_ID = 0x054c
const DS_PRODUCT_ID = 0x0ce6

export async function connectController(): Promise<DSController> {
  let devices = await navigator.hid.requestDevice({
    filters: [
      {
        vendorId: DS_VENDOR_ID,
        productId: DS_PRODUCT_ID,
      },
    ],
  })

  if (devices.length === 0) {
    throw new DSControllerNotFoundError()
  } else {
    let device = devices[0]
    await device.open()
    return new DSControllerImpl(device)
  }
}

class DSControllerInternalState {
  changed: boolean = true

  leftMotor: number = 0
  rightMotor: number = 0
  ledColor: DSControllerLEDColor = {r: 0, g: 0, b: 0}
  attitudeBias = {x: 0, y: 0, z: 0, w: 1}
}

function shiftedSnormToFloat(x: number) {
  return (x - 127) / 128
}

function unormToFloat(x: number) {
  return x / 255
}

function floatToUnorm(x: number) {
  return Math.round(clamp(x, 0.0, 1.0) * 255)
}

const ahrsConfig = {
  // Ahrs won't use this because we provide timestamps instead at every update. Using this would break
  // because the DS can reduce the refrehs rate based on things like battery level.
  sampleInterval: 20,
  algorithm: 'Madgwick',
  beta: 0.1,
  doInitialisation: true,
} as const

class DSControllerImpl implements DSController {
  private _status: DSControllerStatus = DSControllerStatus.CONNECTED
  private _connectionType: DSControllerConnectionType
  private _device: HIDDevice
  private _inputReportLength: number = 0
  private _internalState: DSControllerInternalState =
    new DSControllerInternalState()
  private _state: DSControllerState = new DSControllerState()
  private _stateChangeListeners: Set<DSControllerStateChangeListener> =
    new Set()
  private _ahrs: AHRS
  private _intervalId: ReturnType<typeof setInterval>

  constructor(device: HIDDevice) {
    this._device = device
    this._device.addEventListener('inputreport', (evt: HIDInputReportEvent) => {
      this.processInputReport(evt)
    })
    this._ahrs = new AHRS(ahrsConfig)

    let numFeatureReports = this._device.collections[0]?.featureReports?.length
    if (numFeatureReports === 20) {
      this._connectionType = DSControllerConnectionType.USB
    } else if (numFeatureReports === 12) {
      this._connectionType = DSControllerConnectionType.BLUETOOTH
    } else {
      throw new DSControllerIncompatible()
    }

    this._intervalId = setInterval(async () => {
      await this.backgroundLoop()
    }, 10)
  }

  addEventListener(
    type: DSControllerEventType,
    listener: DSControllerEventListener,
  ) {
    switch (type) {
      case 'stateChange':
        this._stateChangeListeners.add(listener)
        break
    }
  }

  removeEventListener(
    type: DSControllerEventType,
    listener: DSControllerEventListener,
  ) {
    switch (type) {
      case 'stateChange':
        this._stateChangeListeners.delete(listener)
        break
    }
  }

  attitude = {
    applyGyro: () => {
      this._ahrs = new AHRS(ahrsConfig)
    },
    apply: () => {
      const quaterion = this._ahrs.getQuaternion()
      this._internalState.attitudeBias = {
        x: quaterion.x * -1,
        y: quaterion.y * -1,
        z: quaterion.z * -1,
        w: quaterion.w,
      }
    },
    reset: () => {
      this._internalState.attitudeBias = {x: 0, y: 0, z: 0, w: 1}
    },
  }

  private dispatchEvent(type: DSControllerEventType, evt: DSControllerEvent) {
    switch (type) {
      case 'stateChange':
        this._stateChangeListeners.forEach((l) => {
          l(evt)
        })
        break
    }
  }

  private processInputButtons(
    buttons0: number,
    buttons1: number,
    buttons2: number,
  ) {
    this._state.square = !!(buttons0 & (1 << 4))
    this._state.cross = !!(buttons0 & (1 << 5))
    this._state.circle = !!(buttons0 & (1 << 6))
    this._state.triangle = !!(buttons0 & (1 << 7))

    this._state.leftButton = !!(buttons1 & (1 << 0))
    this._state.rightButton = !!(buttons1 & (1 << 1))

    let dpad = buttons0 & 0x0f
    this._state.dpadUp = dpad == 0 || dpad == 1 || dpad == 7
    this._state.dpadDown = dpad == 3 || dpad == 4 || dpad == 5
    this._state.dpadLeft = dpad == 5 || dpad == 6 || dpad == 7
    this._state.dpadRight = dpad == 1 || dpad == 2 || dpad == 3

    this._state.leftStickButton = !!(buttons1 & (1 << 6))
    this._state.rightStickButton = !!(buttons1 & (1 << 7))

    this._state.optionsButton = !!(buttons1 & (1 << 5))
    this._state.createButton = !!(buttons1 & (1 << 4))
    this._state.psButton = !!(buttons2 & (1 << 0))
    this._state.touchButton = !!(buttons2 & (1 << 1))
  }

  private processInputTouch(
    target: DSControllerTouchState,
    touch0: number,
    touch1: number,
    touch2: number,
    touch3: number,
  ) {
    target.active = !(touch0 & 0x80)
    target.id = touch0 & 0x7f
    target.x = ((touch2 & 0x0f) << 8) | touch1
    target.y = (touch3 << 4) | ((touch2 & 0xf0) >> 4)
  }

  private processInputBattery(battery0: number, battery1: number) {
    this._state.battery.percent = ((battery0 & 0x0f) * 100) / 800
    this._state.battery.full = !!(battery0 & 0x20)
    this._state.battery.charging = !!(battery1 & 0x08)
  }

  private processInputGyro(
    target: DSControllerGyroState,
    gyroX0: number,
    gyroX1: number,
    gyroY0: number,
    gyroY1: number,
    gyroZ0: number,
    gyroZ1: number,
  ) {
    let gyrox = (gyroX1 << 8) | gyroX0
    if (gyrox > 0x7fff) gyrox -= 0x10000
    let gyroy = (gyroY1 << 8) | gyroY0
    if (gyroy > 0x7fff) gyroy -= 0x10000
    let gyroz = (gyroZ1 << 8) | gyroZ0
    if (gyroz > 0x7fff) gyroz -= 0x10000

    // 1024 LSB/deg/s
    gyrox = Math.abs(gyrox / 1024) > 0.01 ? gyrox / 1024 : 0
    gyroy = Math.abs(gyroy / 1024) > 0.01 ? gyroy / 1024 : 0
    gyroz = Math.abs(gyroz / 1024) > 0.01 ? gyroz / 1024 : 0

    target.x = gyrox
    target.y = gyroy
    target.z = gyroz
  }

  private processInputAccel(
    target: DSControllerAccelState,
    accelX0: number,
    accelX1: number,
    accelY0: number,
    accelY1: number,
    accelZ0: number,
    accelZ1: number,
  ) {
    let accelx = (accelX1 << 8) | accelX0
    if (accelx > 0x7fff) accelx -= 0x10000
    let accely = (accelY1 << 8) | accelY0
    if (accely > 0x7fff) accely -= 0x10000
    let accelz = (accelZ1 << 8) | accelZ0
    if (accelz > 0x7fff) accelz -= 0x10000

    // 8192 LSB/g
    target.x = accelx / 8192
    target.y = accely / 8192
    target.z = accelz / 8192
  }

  private processInputReportUSB01(evt: HIDInputReportEvent) {
    let data = evt.data

    this._state.leftStickX = shiftedSnormToFloat(data.getUint8(0))
    this._state.leftStickY = shiftedSnormToFloat(data.getUint8(1))
    this._state.rightStickX = shiftedSnormToFloat(data.getUint8(2))
    this._state.rightStickY = shiftedSnormToFloat(data.getUint8(3))

    this._state.leftTrigger = unormToFloat(data.getUint8(4))
    this._state.rightTrigger = unormToFloat(data.getUint8(5))

    this.processInputButtons(
      data.getUint8(7),
      data.getUint8(8),
      data.getUint8(9),
    )

    let touch00 = data.getUint8(32)
    let touch01 = data.getUint8(33)
    let touch02 = data.getUint8(34)
    let touch03 = data.getUint8(35)

    let touch10 = data.getUint8(36)
    let touch11 = data.getUint8(37)
    let touch12 = data.getUint8(38)
    let touch13 = data.getUint8(39)

    this.processInputTouch(
      this._state.touch0,
      touch00,
      touch01,
      touch02,
      touch03,
    )
    this.processInputTouch(
      this._state.touch1,
      touch10,
      touch11,
      touch12,
      touch13,
    )

    let battery0 = data.getUint8(52)
    let battery1 = data.getUint8(53)

    this.processInputBattery(battery0, battery1)

    for (let i = 0; i <= evt.data.byteLength - 1; i++) {
      this._state.raw01[i.toString()] = evt.data.getUint8(i)
    }
  }

  private processInputReportBluetooth01(evt: HIDInputReportEvent) {
    let data = evt.data

    this._state.leftStickX = shiftedSnormToFloat(data.getUint8(0))
    this._state.leftStickY = shiftedSnormToFloat(data.getUint8(1))
    this._state.rightStickX = shiftedSnormToFloat(data.getUint8(2))
    this._state.rightStickY = shiftedSnormToFloat(data.getUint8(3))

    this._state.leftTrigger = unormToFloat(data.getUint8(7))
    this._state.rightTrigger = unormToFloat(data.getUint8(8))

    this.processInputButtons(
      data.getUint8(4),
      data.getUint8(5),
      data.getUint8(6),
    )

    for (let i = 0; i <= evt.data.byteLength - 1; i++) {
      this._state.raw01[i.toString()] = evt.data.getUint8(i)
    }
  }

  private processInputReportBluetooth31(evt: HIDInputReportEvent) {
    let data = evt.data

    // Technically, since input reports can come in at a different rate than the sensor refresh rate,
    // setting the timestamp like this is not totally correct, but it's close enough I think.
    // We could get the actual sensor timestamp later.
    this._state.prevTimestamp = this._state.timestamp
    this._state.timestamp = Date.now()

    this._state.leftStickX = shiftedSnormToFloat(data.getUint8(1))
    this._state.leftStickY = shiftedSnormToFloat(data.getUint8(2))
    this._state.rightStickX = shiftedSnormToFloat(data.getUint8(3))
    this._state.rightStickY = shiftedSnormToFloat(data.getUint8(4))

    this._state.leftTrigger = unormToFloat(data.getUint8(5))
    this._state.rightTrigger = unormToFloat(data.getUint8(6))

    this.processInputButtons(
      data.getUint8(8),
      data.getUint8(9),
      data.getUint8(10),
    )

    let touch00 = data.getUint8(33)
    let touch01 = data.getUint8(34)
    let touch02 = data.getUint8(35)
    let touch03 = data.getUint8(36)

    let touch10 = data.getUint8(37)
    let touch11 = data.getUint8(38)
    let touch12 = data.getUint8(39)
    let touch13 = data.getUint8(40)

    this.processInputTouch(
      this._state.touch0,
      touch00,
      touch01,
      touch02,
      touch03,
    )
    this.processInputTouch(
      this._state.touch1,
      touch10,
      touch11,
      touch12,
      touch13,
    )

    let battery0 = data.getUint8(53)
    let battery1 = data.getUint8(54)

    this.processInputBattery(battery0, battery1)

    let gyroX0 = data.getUint8(16)
    let gyroX1 = data.getUint8(17)
    let gyroY0 = data.getUint8(18)
    let gyroY1 = data.getUint8(19)
    let gyroZ0 = data.getUint8(20)
    let gyroZ1 = data.getUint8(21)

    this.processInputGyro(
      this._state.gyro,
      gyroX0,
      gyroX1,
      gyroY0,
      gyroY1,
      gyroZ0,
      gyroZ1,
    )

    let accelX0 = data.getUint8(22)
    let accelX1 = data.getUint8(23)
    let accelY0 = data.getUint8(24)
    let accelY1 = data.getUint8(25)
    let accelZ0 = data.getUint8(26)
    let accelZ1 = data.getUint8(27)

    this.processInputAccel(
      this._state.accel,
      accelX0,
      accelX1,
      accelY0,
      accelY1,
      accelZ0,
      accelZ1,
    )

    // mapping the controller's Y-up coordinate system to the AHRS' Z-up coordinate system
    this._ahrs.update(
      this._state.gyro.z,
      this._state.gyro.x,
      this._state.gyro.y,
      this._state.accel.z,
      this._state.accel.x,
      this._state.accel.y,
      0,
      0,
      0,
      this._state.prevTimestamp !== -1
        ? (this._state.timestamp - this._state.prevTimestamp) / 1000
        : 20,
    )

    type Quaternion = ReturnType<typeof this._ahrs.getQuaternion>

    function mulQuat(a: Quaternion, b: Quaternion) {
      var qax = a.x,
        qay = a.y,
        qaz = a.z,
        qaw = a.w,
        qbx = b.x,
        qby = b.y,
        qbz = b.z,
        qbw = b.w

      const res = {
        x: qax * qbw + qay * qbz - qaz * qby + qaw * qbx,
        y: -qax * qbz + qay * qbw + qaz * qbx + qaw * qby,
        z: qax * qby - qay * qbx + qaz * qbw + qaw * qbz,
        w: -qax * qbx - qay * qby - qaz * qbz + qaw * qbw,
      }

      return res
    }

    const quaternion = mulQuat(
      this._internalState.attitudeBias,
      this._ahrs.getQuaternion(),
    )

    // mapping from AHRS' Z-up coordinate system to the controller's Y-up coordinate system
    this._state.attitude = [
      quaternion.y,
      quaternion.z,
      quaternion.x,
      quaternion.w,
    ]

    for (let i = 0; i <= evt.data.byteLength - 1; i++) {
      this._state.raw31[i.toString()] = evt.data.getUint8(i)
    }
  }

  private processInputReport(evt: HIDInputReportEvent) {
    if (this._connectionType === DSControllerConnectionType.BLUETOOTH) {
      if (evt.reportId == 0x01) {
        console.log('01')
        this.processInputReportBluetooth01(evt)
      } else if (evt.reportId == 0x31) {
        this.processInputReportBluetooth31(evt)
      } else {
        return
      }
    } else if (this._connectionType === DSControllerConnectionType.USB) {
      if (evt.reportId == 0x01) {
        this.processInputReportUSB01(evt)
      } else {
        return
      }
    } else {
      return
    }

    this.dispatchEvent('stateChange', {
      state: this._state,
    })
  }

  get status(): DSControllerStatus {
    return this._status
  }

  get connectionType(): DSControllerConnectionType {
    return this._connectionType
  }

  get productName(): string {
    return this._device.productName
  }

  set ledColor(color: DSControllerLEDColor) {
    this._internalState.ledColor = {
      r: floatToUnorm(color.r),
      g: floatToUnorm(color.g),
      b: floatToUnorm(color.b),
    }
  }

  set leftMotor(strength: number) {
    this._internalState.leftMotor = floatToUnorm(strength)
  }

  set rightMotor(strength: number) {
    this._internalState.rightMotor = floatToUnorm(strength)
  }

  async disconnect() {
    if (this._status !== DSControllerStatus.CONNECTED) {
      throw new DSControllerNotConnected()
    } else {
      clearInterval(this._intervalId)
      await this._device.close()
      this._status = DSControllerStatus.DISCONNECTED
    }
  }

  private prepareReport(): Uint8Array {
    let data: Uint8Array

    if (this._connectionType == DSControllerConnectionType.BLUETOOTH) {
      data = new Uint8Array(78) // only bytes starting with 1 will be sent, byte 0 is for CRC (report ID)
      data[0] = 0x31 // report ID
      data[1] = 0x02
    } else {
      data = new Uint8Array(47)
    }

    let off = 0 // common report data offset (0 for USB report 0x02, 3 for BT report 0x31)
    if (this._connectionType == DSControllerConnectionType.BLUETOOTH) {
      off = 2
    }

    data[off + 0] = 0xff
    data[off + 1] = 0xf7 //0x1 | 0x2 | 0x4 | 0x10 | 0x40;
    data[off + 2] = this._internalState.leftMotor
    data[off + 3] = this._internalState.rightMotor
    data[off + 39] = 0x01
    data[off + 43] = 0x02
    data[off + 44] = this._internalState.ledColor.r
    data[off + 45] = this._internalState.ledColor.g
    data[off + 46] = this._internalState.ledColor.b

    if (this._connectionType == DSControllerConnectionType.BLUETOOTH) {
      let crcDv = new DataView(data.buffer, 74, 4)
      let crc = crc32(Buffer.from(data.slice(0, 74)), 0xeada2d49)
      crcDv.setUint32(0, crc, true)

      return data.slice(1, 78)
    } else {
      return data
    }
  }

  private async sendReport() {
    if (this._connectionType == DSControllerConnectionType.BLUETOOTH) {
      await this._device.sendReport(0x31, this.prepareReport())
    } else {
      await this._device.sendReport(0x02, this.prepareReport())
    }
  }

  private async backgroundLoop() {
    await this.sendReport()
  }
}
