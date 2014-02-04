#include "DataPacket.h"
#include <string.h>

uint8_t PacketChecksum(uint8_t *buf, uint8_t len) {
  uint8_t ii;
  uint8_t checksum = 0;
  for (ii = 0; ii < len; ii++)
    checksum += *buf++;
  return ~checksum;
}

void PacketInit(Packet *packet) {
  packet->lenReceived = 0;
  packet->lenExpected = 0;
  packet->bp = NULL;
}

uint8_t PacketGetId(Packet *packet) {
  return packet->buffer[PACKET_POS_ID];
}

uint8_t PacketRawGetId(uint8_t *packet) {
  return packet[PACKET_POS_ID];
}

uint8_t PacketGetSize(Packet *packet) {
  return packet->buffer[PACKET_POS_SIZE];
}

uint8_t PacketRawGetSize(uint8_t *packet) {
  return packet[PACKET_POS_SIZE];
}

uint8_t PacketGetPayloadSize(Packet *packet) {
  return packet->buffer[PACKET_POS_SIZE] - 2;
}

uint8_t PacketRawGetPayloadSize(uint8_t *packet) {
  return packet[PACKET_POS_SIZE] - 2;
}

uint8_t PacketGetType(Packet *packet) {
  return packet->buffer[PACKET_POS_TYPE];
}

uint8_t PacketRawGetType(uint8_t *packet) {
  return packet[PACKET_POS_TYPE];
}

uint8_t* PacketGetData(Packet *packet) {
  return &(packet->buffer[PACKET_POS_DATA]);
}

uint8_t* PacketRawGetData(uint8_t *packet) {
  return &(packet[PACKET_POS_DATA]);
}

int16_t PacketProcessChar(Packet *packet, uint8_t c) {
  int16_t ret = 0;
  uint8_t checksum;

  switch (packet->lenReceived) {
  case 0:
    packet->bp = packet->buffer;
  case 1:
    if (c != PACKET_HEADER) {
      packet->lenReceived = 0;
      break;
    }
  case 2:
  case 3:
    packet->lenReceived++;
    *(packet->bp)++ = c;
    break;
  case 4:
    packet->lenExpected = packet->buffer[3] + 4;
    if ((packet->lenExpected < PACKET_MIN_SIZE)
	|| (packet->lenExpected > PACKET_MAX_SIZE)) {
      packet->lenReceived = 0;
      packet->lenExpected = 0;
      break;
    }
  default:
    packet->lenReceived++;
    *(packet->bp)++ = c;
    if (packet->lenReceived < packet->lenExpected)
      break;
    checksum = PacketChecksum(packet->buffer + 2,
			      packet->lenReceived - 3);
    if (checksum == c)
      ret = packet->lenReceived;
    else
      ret = -1;
    packet->lenReceived = 0;
  }
  return ret;
}

int16_t PacketWrapData(uint8_t id, uint8_t type,
		       uint8_t *data, uint16_t dataSize,
		       uint8_t *outBuf, uint16_t outSize) {
  uint16_t packetSize = dataSize + PACKET_OVERHEAD;

  if (outSize < packetSize)
    return -1;

  uint8_t ii;
  uint8_t payloadSize = dataSize + 2;
  uint8_t checksum = 0;
  uint8_t *obuf = outBuf;
  uint8_t *ibuf = data;
  *obuf++ = 0xFF;
  *obuf++ = 0xFF;
  *obuf++ = id;
  *obuf++ = payloadSize;
  *obuf++ = type;
  checksum += id + payloadSize + type;

  for (ii = 0; ii < dataSize; ii++) {
    *obuf++ = *ibuf;
    checksum += *ibuf++;
  }

  *obuf = ~checksum;
  return packetSize;
}

int16_t PacketVerifyRaw(uint8_t *buf, uint8_t size) {
  return -1;
}

int16_t PacketCopy(Packet *out, Packet *in) {
  out->lenReceived = in->lenReceived;
  out->lenExpected = in->lenExpected;
  memcpy(out->buffer, in->buffer, out->lenExpected);
  return 0;
}
