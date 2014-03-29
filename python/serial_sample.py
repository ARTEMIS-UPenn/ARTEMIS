#!/usr/bin/python
import time
from DataPacket import *

packet = DataPacket(id = 0x05,
                    instr = 0x02,
                    data = [0x05, 0x02])
a = packet.getCharPacket()
while True:
    packet.writeToSerial(a)
    time.sleep(1)
ser.close()
