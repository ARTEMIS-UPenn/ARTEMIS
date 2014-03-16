// standard c library
#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include <stdint.h>
#include <math.h>
#include <util/delay.h>

// avr library
#include <avr/io.h>
#include <avr/interrupt.h>
#include <avr/eeprom.h>

// common libraries
#include "uart.h"
#include "DataPacket.h"


// micro device id
// to be moved to eeprom
#define MMC_ID 0x04

#define MOTOR_EN PD3
#define MOTOR_P1 PD4
#define MOTOR_P2 PD5
#define IND_LED PD6

// packet instruction types
enum {
  READ_CMD = 0x01,
  WRITE_CMD
};

// write instructions
enum {
  DISPENSE = 0x01,
  RETRACT,
  UNLOCK,
  CHANGE_ID,
  LED
};

// read instructions
enum {
  STATUS = 0x01,
  ITEM_COUNT
};
  
// compartment status
enum {
  INITIALIZING = 0x00,
  STANDBY,
  DISPENSING,
  RETRACTING,
  JAM,
  DOOR_OPEN
};

uint8_t SYS_STATE = 0x00;

// hardware initialization
void init() {
  cli();                      // clear global interrupts
  DDRD |= (1 << MOTOR_EN) | (1 << MOTOR_P1) | (1 << MOTOR_P2) | (1 << PD5) | (1 << PD6); // set motor pins
  

  uart0_init();
  uart0_setbaud(57600);
  sei();
}

int main(void) {
  init();
  Packet host_packet;
  PacketInit(&host_packet);
  int len = 0;
  char c;
  while(1) {
    c = uart0_getchar();
    if (c != EOF) {
      len = PacketProcessChar(&host_packet, c);
    }
    if (len > 0) {
      if (PacketGetId(&host_packet) == MMC_ID) { // id position
	switch (PacketGetType(&host_packet)) { // instr position
	case READ_CMD:
	  break;
	case WRITE_CMD:
	  {
	    int pl_size = PacketGetPayloadSize(&host_packet);
	    uint8_t *pl = PacketGetData(&host_packet);
	    int i = 0;
	    if (pl_size > 0) {
	      switch(pl[i++]) { // payload 0 position
	      case DISPENSE:
		break;
	      case RETRACT:
		break;
	      case UNLOCK:
		//TODO
		break;
	      case CHANGE_ID:
		//TODO
		break;
	      case LED:
		if (i <= pl_size) {
		  switch (pl[i++]) { // payload 1 position
		  case 0x00: // turn off LED
		    PORTD &= ~(1 << IND_LED);
		    break;
		  case 0x01: // turn on LED
		    PORTD |= (1 << IND_LED);
		    break;
		  case 0x02: // toggle LED
		    PORTD ^= (1 << IND_LED);
		    break;
		  default:
		    break;
		  } // payload 1 position
		}
		break;
	      default:
		break;
	      } // payload 0 position
	    }
	    break;
	  }
	default:
	  break;
	} // instr position
      } // id position
      len = 0;
      }
  }
  return 0;
}
