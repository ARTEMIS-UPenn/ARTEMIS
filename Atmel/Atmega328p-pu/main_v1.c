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
  STANDBY = 0x01,
  DISPENSING = 0x02,
  RETRACTING = 0x04,
  DRAWER_OPEN = 0x08,
  DRAWER_CLOSED = 0x10,
  TRAY_FILLED = 0x20,
  TRAY_EMPTY = 0x40,
  DOOR_OPEN = 0x80
};

volatile uint8_t SYS_STATE = INITIALIZING;
uint8_t MMC_ID;

// when tray is fully opened, front limit switch is pressed
// PORTB trigger
ISR(PCINT0_vect) {
  if (SYS_STATE == RETRACTING) {
    PORTD |= (1 << MOTOR_P1) | (1 << MOTOR_P2);
    SYS_STATE = STANDBY | DRAWER_CLOSED;
  } 
}

// PORTC trigger
ISR(PCINT1_vect) {
  if (SYS_STATE == DISPENSING) {
    PORTD |= (1 << MOTOR_P1) | (1 << MOTOR_P2);
    SYS_STATE = STANDBY | DRAWER_OPEN;
  }
}

// PORTD trigger
ISR(PCINT2_vect) {
  if (SYS_STATE == (STANDBY | DRAWER_CLOSED)) {
    SYS_STATE = (STANDBY | DRAWER_CLOSED | TRAY_FILLED);
    //SYS_STATE &= TRAY_EMPTY;
    //SYS_STATE |= TRAY_FILLED;
  }
  if (SYS_STATE == (STANDBY | DRAWER_OPEN)) {
    SYS_STATE = (STANDBY | DRAWER_OPEN | TRAY_EMPTY);
    //SYS_STATE &= TRAY_FILLED;
    //SYS_STATE |= TRAY_EMPTY;
  }
}

// hardware initialization
void init() {
  cli();                      // clear global interrupts
  
  PCICR |= (1 << 2) | (1 << 1) | (1 << 0); // use pin change interrupt alternate function
  PCMSK2 |= (1 << 7); // enable pin change interrupt 16-23
  PCMSK1 |= (1 << 0); // enable pin change interrupt 8-14
  PCMSK0 |= (1 << 0); // enable pin change interrupt 0-7
  
  MMC_ID = eeprom_read_byte((uint8_t*)46); // set device id
  if (MMC_ID == 0xFF)
    MMC_ID = 0xFE;
  DDRB = 0xFC;
  PORTB = 0x00;
  DDRD |= (1 << MOTOR_EN) | (1 << MOTOR_P1) | (1 << MOTOR_P2) | (1 << IND_LED); // set motor pins
  PORTD |= (1 << MOTOR_EN) | (1 << MOTOR_P1) | (1 << MOTOR_P2); // set motor to idle
  uart0_init();
  uart0_setbaud(57600);
  sei();
  SYS_STATE = (STANDBY | DRAWER_CLOSED);
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
	  {
	    int pl_size = PacketGetPayloadSize(&host_packet);
	    uint8_t *pl = PacketGetData(&host_packet);
	    int i = 0;
	    if (pl_size > 0) {
	      switch(pl[i++]) {
	      case STATUS:
		{
		  uint8_t outbuf[6] = {0xFF, 0xFF, MMC_ID, 0x02, SYS_STATE, 0x00};
		  outbuf[5] = ~(MMC_ID + 0x02 + SYS_STATE);
		  int i;
		  for (i = 0; i < 6; i++)
		    uart0_putchar(outbuf[i]);
		  break;
		}
	      default:
		break;
	      }
	    }
	    break;
	  }
	case WRITE_CMD:
	  {
	    int pl_size = PacketGetPayloadSize(&host_packet);
	    uint8_t *pl = PacketGetData(&host_packet);
	    int i = 0;
	    if (pl_size > 0) {
	      switch(pl[i++]) { // payload 0 position
	      case DISPENSE:
		if (SYS_STATE == (STANDBY | DRAWER_CLOSED | TRAY_FILLED)) {
		  SYS_STATE = DISPENSING;
		  PORTD |= (1 << MOTOR_P2);
		  PORTD &= ~(1 << MOTOR_P1);
		}
		break;
	      case RETRACT:
		if (SYS_STATE == (STANDBY | DRAWER_OPEN | TRAY_EMPTY)) {
		  SYS_STATE = RETRACTING;
		  PORTD |= (1 << MOTOR_P1);
		  PORTD &= ~(1 << MOTOR_P2);
		}
		break;
	      case UNLOCK:
		//TODO
		break;
	      case CHANGE_ID:
		if (i <= pl_size) {
		  eeprom_update_byte((uint8_t*)46, pl[i]);
		  MMC_ID = eeprom_read_byte((uint8_t*)46);
		}
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
