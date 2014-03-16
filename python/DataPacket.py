class DataPacket:
    def __init__(self, id=0xff, instr=0xff, data=[0xff]):
        self.id = id
        self.instr = instr
        self.data = data
        self.len = len(data) + 2
        payload = [self.id,self.len,self.instr]+data
        self.chk = (~sum(payload))%256
    def print_packet(self):
        print [254,254,self.id,self.len,self.instr]+self.data+[self.chk]
    def getPacket(self):
        return [254,254,self.id,self.len,self.instr]+self.data+[self.chk]
    def getCharPacket(self):
        packet = self.getPacket()
        for i in range(0,len(packet)):
            packet[i]=chr(packet[i])
        return packet
    def writeToSerial(self, ser, packet):
        for i in range(0, len(packet)):
            ser.write(packet[i])
    def setId(self, id):
        self.id = id
    def setInstr(self, instr):
        self.instr = instr
    def setData(self, data):
        self.data = data
    def setChk(self):
        payload = [self.id,self.len,self.instr]+data
        self.chk = ~(sum(payload)%256)
