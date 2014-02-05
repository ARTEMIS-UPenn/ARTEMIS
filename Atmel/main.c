// standard c library
#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include <stdint.h>
#include <math.h>
// avr library
#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>
// homemade libraries
#include "uart0.h"
#include "DataPacket.h"

// test defs:
// 0 for no test
// 1 for pin output testing
// 2 for servo testing
#define _TEST 2

// Packet structure:
// HEADER
// HEADER
// ID
// LENGTH
// INSTRUCTION
// PARAMS 1..N
// CHECKSUM

// device ids
// vending machine: 0
// tool checkout: 1
// bins: 2
enum {
  VENDING,
  TOOLS,
  BINS
};

// vending machine instructions
// dispense: 0
// unlock compartment: 1
enum {
  DISPENSE,
  VEND_UNLOCK,
};

// tool checkout instructions
// checkout: 0
// return: 1
// unlock compartment: 2
enum {
  CHECKOUT,
  RETURN,
  TOOL_UNLOCK
};

// BINS
// TBD

volatile int a = 0;
ISR(TIMER1_OVF_vect) {
  a++;
  a %= 2;
}

ISR(TIMER1_COMPA_vect) {
  PORTE &= ~(1 << PE7);
}

void servoTurn(float angle) {
  // 0 <= angle <= 180
  // pulse width: 0.43ms for 0, 2.5ms for 180
  // 16384 counts / ms
  // conversion normalizes
  float frac = angle/180 * 2.07 * 16384;
  OCR1A = 7045 + floor(frac); // set timer
  PORTE |= (1 << PE7); // turn on the servo control pin this
                       // pin will turn off automatically
                       // when timer 1 hits the value set in
                       // OCR1A
  cli(); // clear global interrupts for resetting
         // timer count
  TCNT1 = 0; // set timer count to 0
  TIMSK1 |= (1 << OCIE1A); // enable timer compare interrupt
  sei(); // re-enable global interrupts
}

// hardware initialization
void init() {
  cli();
#if _TEST == 1
  DDRE |= (1 << PE7);
#elif _TEST == 2
  DDRE |= (1 << PE7) | (1 << PE2) | (1 << PE6); // set outputs in PORTE

  TCCR1A = 0x00; // clear all current timer 1 settings
  TCCR1B = 0x00;
  TCCR1B |= (1 << WGM12); // turn on CTC mode:
                          // Clear Timer on Compare Match

  TIMSK1 = (1 << TOIE1); // enable global and timer overflow interrupt
  TCCR1B |= (1 << CS10);
#endif //_TEST

  uart0_init();
  uart0_setbaud(57600);
  sei();
}

int main(void) {
  init();
  /*
  Packet host_packet;
  PacketInit(&host_packet);
  int len = 0;
  char c;
  while(1) {
    c = uart0_getchar();
    if (c != EOF)
      len = PacketProcessChar(&host_packet, c);
    if (len)
      uart0_printstr("got a packet!\r\n");
    _delay_ms(1000);
    }*/

#if _TEST == 1  
  bool toggle = false;
  uint8_t packet_pos = 0;
  char c;

  init();

  while(true) {
    c = uart0_getchar();
    
    if (c == 'y')
      toggle = false;
    if (c == 'n')
      toggle = true;
    if (toggle)
      PORTE |= (1 << PE7);
    else
      PORTE &= ~(1 << PE7);
  }
#endif // _TEST

#if _TEST == 2
  char c;
  while(true) {
    c = uart0_getchar();
    if (c != EOF) {
      if (c == 'f')
	servoTurn(0);
      if (c == 'g')
	servoTurn(90);
      if (c == 'h')
	servoTurn(180);
    }
    /*
    if (a == 1) {
      PORTE |= (1 << PE7);
      PORTE |= (1 << PE6);
    }
    else {
      PORTE &= ~(1 << PE7);
      PORTE |= (1 << PE2);
      }*/
  }
#endif // _TEST
  return 0;
}
