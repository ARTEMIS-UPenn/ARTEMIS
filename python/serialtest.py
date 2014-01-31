#!/usr/bin/python
import serial
import time

ser = serial.Serial(
    port='/dev/ttyUSB0',
    baudrate=57600,
    parity=serial.PARITY_ODD,
    stopbits=serial.STOPBITS_TWO,
    bytesize=serial.EIGHTBITS
)

print ser.portstr
ser.write(chr(121))
ser.write(chr(110))
ser.close()
