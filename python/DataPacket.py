import serial
class DataPacket:
    # constructor. set packet id, instruction,
    # and payload. uses serial package
    # default port is ttyUSB0, default baud 57600
    def __init__(self,
                 id=0xff,
                 instr=0xff,
                 data=[0xff],
                 port = '/dev/ttyUSB0',
                 baudrate = 57600):
        self.id = id
        self.instr = instr
        self.data = data
        self.len = len(data) + 2
        payload = [self.id,self.len,self.instr]+data
        self.chk = (~sum(payload))%256
        self.serial = serial.Serial(port,
                                    baudrate,
                                    bytesize = serial.EIGHTBITS,
                                    parity = serial.PARITY_NONE,
                                    stopbits = serial.STOPBITS_ONE)

    # print human readable packet
    def print_packet(self):
        print [254,254,self.id,self.len,self.instr]+self.data+[self.chk]

    # returns full packet with human readable numbers
    def getHRPacket(self):
        return [254,254,self.id,self.len,self.instr]+self.data+[self.chk]

    # returns full packet in byte form
    # packets that are sent must be
    # retrieved using this function
    def getCharPacket(self):
        packet = self.getHRPacket()
        for i in range(0,len(packet)):
            packet[i]=chr(packet[i])
        return packet

    # writes a packet to serial port
    def writeToSerial(self, packet):
        for i in range(0, len(packet)):
            self.serial.write(packet[i])

    # reads len number of bytes from serial port buffer 
    def readSerial(self, len):
        return self.serial.read(len);
        
    # set packet id slot
    def setId(self, id):
        self.id = id

    # set packet instruction slot
    def setInstr(self, instr):
        self.instr = instr

    # set packet payload slot
    def setData(self, data):
        self.data = data

    # set packet checksum
    def setChk(self):
        payload = [self.id,self.len,self.instr]+self.data
        self.chk = ~(sum(payload)%256)
