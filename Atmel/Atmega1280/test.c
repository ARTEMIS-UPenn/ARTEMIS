#include <stdio.h>
#include "DataPacket.h"

int main(void) {
  int len = 0;
  uint8_t pack[250];
  pack[0] = 0xFF;
  pack[1] = 0xFF;
  pack[2] = 0x01;
  pack[3] = 0x04;
  pack[4] = 0x02;
  pack[5] = 0x2B;
  pack[6] = 0x01;
  pack[7] = PacketChecksum(&pack[2], 5);
  
  Packet packet;
  
  PacketInit(&packet);
  
  int i;
  for (i = 0; i < 8; i++) {
    len = PacketProcessChar(&packet, pack[i]);
    printf("pack[%d]: %d\tlen: %d\n",i, pack[i], len);
  }
}
