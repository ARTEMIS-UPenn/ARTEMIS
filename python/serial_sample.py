#!/usr/bin/python
import time
from DataPacket import *

read = 0x01
status = 0x01
item_count = 0x02

write = 0x02
dispense = 0x01
retract = 0x02
unlock = 0x03
change_id = 0x04
led = 0x05

toggle = 0x02
did = 0xFE
packet = DataPacket(id = did,
                    instr = write,
                    data = [led, toggle],
                    port = '/dev/ttyUSB0')
a = packet.getCharPacket()
while True:
    
    ina = input("enter command: read, write = 1 2\n")
    if ina == read:
        packet = DataPacket(id = did,
                            instr = read,
                            data = [status])
        a = packet.getCharPacket()
        packet.writeToSerial(a)
        time.sleep(0.03)
        temp = packet.readSerial(6)
        ret = []
        for i in range(0,6):
            ret.append(ord(temp[i]))
        print ret
    if ina == write:
        inb = input("enter param: dispense, retract, unlock, change_id, led = 1 2 3 4 5\n")
        if inb == dispense:
            packet = DataPacket(id = did,
                                instr = write,
                                data = [dispense])
            a = packet.getCharPacket()
        if inb == retract:
            packet = DataPacket(id = did,
                                instr = write,
                                data = [retract])
            a = packet.getCharPacket()
        if inb == change_id:
            inc = input("enter new id: \n")
            packet = DataPacket(id = did,
                                instr = write,
                                data = [change_id, inc])
            did = inc
            a = packet.getCharPacket()
            print "id changed to " + str(did)
        if inb == led:
            packet = DataPacket(id = did,
                                instr = write,
                                data = [led, toggle])
            a = packet.getCharPacket()
            print "led toggled for id " + str(did)
        packet.writeToSerial(a)
ser.close()
