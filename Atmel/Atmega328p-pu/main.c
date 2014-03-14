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
  ID,
  LED_ON,
  LED_OFF
};

// read instructions
enum {
  STATUS = 0x01,
  ITEM_COUNT
};
  
// compartment status

enum {
  OK = 0x00,
  JAM
  
};

ISR(TIMER1_OVF_vect) {}

// servo test timer
ISR(TIMER1_COMPA_vect) {
  PORTD &= ~(1 << PD6);
}

void servoTurn(float angle) {
  // 0 <= angle <= 180
  // pulse width: 0.43ms for 0, 2.5ms for 180
  // 16384 counts / ms
  // conversion normalizes
  float frac = angle/180 * 2.07 * 16384;
  OCR1A = 7045 + floor(frac); // set timer
  PORTD |= (1 << PD6);        // turn on the servo control pin this pin will turn off automatically
                              // when timer 1 hits the value set in OCR1A
  cli();                      // clear global interrupts for resetting
                              // timer count
  TCNT1 = 0;                  // set timer count to 0
  TIMSK1 |= (1 << OCIE1A);    // enable timer compare interrupt
  sei();                      // re-enable global interrupts
}

// hardware initialization
void init() {
  cli();                      // clear global interrupts
  DDRD |= (1 << PD5) | (1 << PD6);

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
      if (PacketGetId(&host_packet) == MMC_ID) { // if i'm being called
	// check what they want from me
	switch (PacketGetType(&host_packet)) {
	case READ_CMD:
	  break;
	case WRITE_CMD:
	  int pl_size = PacketGetPayloadSize(&host_packet);
	  uint8_t* pl = PacketGetData(&host_packet);
	  int i;
	  for (i = 0; i < pl_size; i++) {
	    switch(pl[i]) {
	    case DISPENSE:
	      servoTurn(180);
	      break;
	    case RETRACT:
	      servoTurn(0);
	      break;
	    case UNLOCK:
	      //TODO
	      break;
	    case ID:
	      //TODO
	      break;
	    case LED_ON:
	      //TODO
	      break;
	    case LED_OFF:
	      //TODO
	      break;
	    default:
	      break;
	    }
	  }
	  
	  servoTurn(180);
	  break;
	default:
	  break;
	}
      }
      //PORTD ^= (1 << PD5);
      len = 0;
    }
  }
  return 0;
}
