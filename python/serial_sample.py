#!/usr/bin/python
import serial, time
ser = serial.Serial(port='/dev/ttyUSB0',
                    baudrate=57600,
                    bytesize=serial.EIGHTBITS,
                    parity=serial.PARITY_NONE,
                    stopbits=serial.STOPBITS_ONE)

print "Connected to " + ser.portstr

while True:
    ser.write("hello")
    time.sleep(1)
ser.close()
