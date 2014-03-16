#!/usr/bin/python
import serial, time, ctypes
from DataPacket import *
ser = serial.Serial(port='/dev/ttyUSB0',
                    baudrate=57600,
                    bytesize=serial.EIGHTBITS,
                    parity=serial.PARITY_NONE,
                    stopbits=serial.STOPBITS_ONE)

print "Connected to " + ser.portstr
packet = DataPacket(0x05,0x02,[0x05, 0x02])
a = packet.getCharPacket()
while True:
    for i in range(0, len(a)):
        ser.write(a[i])
    time.sleep(1)
ser.close()
