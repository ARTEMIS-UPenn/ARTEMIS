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
device_id = 0xFE

initializing = 0x00
standby = 0x01
dispensing = 0x02
retracting = 0x04
drawer_open = 0x08
drawer_closed = 0x10
jam = 0x20
door_open = 0x40

device_status = initializing

loop_times = 1000
counter = 0

def getStatus():
    packet = DataPacket(id = device_id,
                        instr = read,
                        data = [status])
    a = packet.getCharPacket()
    packet.writeToSerial(a)
    time.sleep(0.03)
    temp = packet.readSerial(6)
    ret = []
    for i in range(0,6):
        ret.append(ord(temp[i]))
    return ret

while counter != loop_times:
    print "iteration: " + str(counter) + "\n"
    counter = counter + 1
    ret = getStatus()
    while (ret[4] == dispensing or ret[4] == retracting):
        ret = getStatus()
        #print ret, dispensing, retracting
    if ret[4] == standby + drawer_closed:
        packet = DataPacket(id = device_id,
                            instr = write,
                            data = [dispense])
        a = packet.getCharPacket()
        packet.writeToSerial(a)
        ret = getStatus()
    if ret[4] == standby + drawer_open:
        packet = DataPacket(id = device_id,
                            instr = write,
                            data = [retract])
        a = packet.getCharPacket()
        packet.writeToSerial(a)
        ret = getStatus()
