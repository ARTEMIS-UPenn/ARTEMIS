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

// common libraries
#include "uart.h"
#include "DataPacket.h"
#include "I2C-master-lib/I2C_master.h"

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
 
  uint8_t message_buf[] = {0xFE, 0xFE, 0x01, 0x04, 0x02, 0x2B, 0x01, 0xCC};
  int i;
  while(1) {
    c = uart0_getchar();
    if (c != EOF) {
      len = PacketProcessChar(&host_packet, c);
    }
    if (len > 0) {
      PORTD ^= (1 << PD5);
      len = 0;
    }
  }
  return 0;
}
