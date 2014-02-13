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
#include "TWI_Master.h"

// test defs:
// 0 for no test
// 1 for pin output testing
//     Connect PE7 to an LED with a resistor
// 2 for servo testing:
//     Connect PE7 to servo data line
//     Power servo with 6V
// 3 for host serial commands test:
//     Connect PE7 to an LED with a resistor
// 4 for i2c tests

#define _TEST 4

#if _TEST == 4
#define TWI_GEN_CALL 0x00
#define TWI_CMD_MASTER_WRITE 0x10
#define TWI_CMD_MASTER_READ 0x20
#endif

#if _TEST == 2
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
#endif // _TEST

// hardware initialization
void init() {
  cli();                      // clear global interrupts
  uart0_init();
  uart0_setbaud(57600);
  sei();
}

int main(void) {
  init();

  //******
  //TEST 1
  //******
#if _TEST == 1  
  bool toggle = false;
  uint8_t packet_pos = 0;
  char c;
  DDRD |= (1 << PD6);

  init();

  while(true) {
    c = uart0_getchar();
    
    if (c == 'y') {
      toggle = false;
      uart0_putchar('y');
    }
    if (c == 'n') {
      toggle = true;
      uart0_putchar('n');
    }
    if (toggle)
      PORTD |= (1 << PD6);
    else
      PORTD &= ~(1 << PD6);
  }

  //******
  //TEST 2
  //******
#elif _TEST == 2
  char c;
  DDRD |= (1 << PD6)          // set outputs in PORTD
    | (1 << PD5)
    | (1 << PD4);
  TCCR1A = 0x00;              // clear all current timer 1 settings
  TCCR1B = 0x00;
  TCCR1B |= (1 << WGM12);     // turn on CTC mode:
                              // Clear Timer on Compare Match
  TIMSK1 = (1 << TOIE1);      // enable global and timer overflow interrupt
  TCCR1B |= (1 << CS10);

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
  }

  //******
  //TEST 3
  //******
#elif _TEST == 3
  Packet host_packet;
  PacketInit(&host_packet);
  int len = 0;
  char c;
  DDRD |= (1 << PD6);

  while(1) {
    c = uart0_getchar();
    if (c != EOF)
      len = PacketProcessChar(&host_packet, c);
    if (len > 0)
      uart0_printstr("got a packet!\r\n");
    }

  //******
  //TEST 4
  //******
#elif _TEST == 4
  uint8_t messageBuf[4];
  uint8_t TWI_targetSlaveAddress = 0x10;

  TWI_Master_Initialise();
  sei();
  while(1) {
    messageBuf[0] = (TWI_targetSlaveAddress<<TWI_ADR_BITS)
      | (FALSE << TWI_READ_BIT);
    messageBuf[1] = TWI_CMD_MASTER_WRITE;
    messageBuf[2] = 0x01;
    TWI_Start_Transceiver_With_Data( messageBuf, 3);
    _delay_ms(1000);
  }

#endif // _TEST
  return 0;
}
