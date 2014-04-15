#ifndef DATA_PACKET_H
#define DATA_PACKET_H

#include <stdint.h>

#define PACKET_HEADER 0xFE
#define PACKET_OVERHEAD 6
#define PACKET_MIN_SIZE PACKET_OVERHEAD
#define PACKET_MAX_SIZE 250
#define PACKET_MAX_PAYLOAD_SIZE (PACKET_MAX_SIZE-PACKET_MIN_SIZE)

enum {
  PACKET_POS_HEADER1 = 0,
  PACKET_POS_HEADER2,
  PACKET_POS_ID,
  PACKET_POS_SIZE,
  PACKET_POS_TYPE,
  PACKET_POS_DATA
};

typedef struct Packet {
  uint8_t buffer[PACKET_MAX_SIZE];
  uint8_t lenReceived;
  uint8_t lenExpected;
  uint8_t *bp;
} Packet;

// calculate packet checksum
uint8_t PacketChecksum(uint8_t *buf, uint8_t len);

// initialize packet buffer
void PacketInit(Packet *packet);

// feed a byte into a packet and see if we have a complete packet
int16_t PacketProcessChar(Packet *packet, uint8_t c);

// get id of the sender
uint8_t PacketGetId(Packet *packet);
uint8_t PacketRawGetId(uint8_t *packet);

// get size of the packet
uint8_t PacketGetSize(Packet *packet);
uint8_t PacketRawGetSize(uint8_t *packet);

// get the size of the payload
uint8_t PacketGetPayloadSize(Packet *packet);
uint8_t PacketRawGetPayloadSize(uint8_t *packet);

uint8_t PacketGetType(Packet *packet);
uint8_t PacketRawGetType(uint8_t *packet);

// get pointer to the packet payload
uint8_t* PacketGetData(Packet *packet);
uint8_t* PacketRawGetData(uint8_t *packet);

// wrap data into packet format
int16_t PacketWrapData(uint8_t id, uint8_t type,
		       uint8_t *data, uint16_t dataSize,
		       uint8_t *outBuf, uint16_t outSize);

int16_t PacketVerifyRaw(uint8_t *buf, uint8_t size);
int16_t PacketCopy(Packet *out, Packet *in);

#endif //DATA_PACKET_H
