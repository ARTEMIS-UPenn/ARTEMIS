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
#include "uart0.h"
#include "uart1.h"
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
// 4 for UART test
// 5 for RS485 test

#define _TEST 5

#if _TEST == 4
#include "TWI_I2C.h"
#endif

#if _TEST == 2
ISR(TIMER1_OVF_vect) {}

// servo test timer
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
#endif // _TEST

// hardware initialization
void init() {
  cli(); // clear global interrupts

  uart0_init();
  uart0_setbaud(57600);
  uart1_init();
  uart1_setbaud(57600);
  sei();
}

int main(void) {
  init();

#if _TEST == 1  
  bool toggle = false;
  uint8_t packet_pos = 0;
  char c;
  DDRE |= (1 << PE7);

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

#elif _TEST == 2
  uint8_t c;
  DDRE |= (1 << PE7) | (1 << PE2) | (1 << PE6); // set outputs in PORTE

  TCCR1A = 0x00;          // clear all current timer 1 settings
  TCCR1B = 0x00;
  TCCR1B |= (1 << WGM12); // turn on CTC mode:
                          // Clear Timer on Compare Match

  TIMSK1 = (1 << TOIE1);  // enable global and timer overflow interrupt
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

#elif _TEST == 3
  Packet host_packet;
  PacketInit(&host_packet);
  int len = 0;
  char c;
  DDRE |= (1 << PE7);

  while(1) {
    c = uart0_getchar();
    if (c != EOF)
      len = PacketProcessChar(&host_packet, c);
    if (len > 0)
      uart0_printstr("got a packet!\r\n");
    }

#elif _TEST == 4
  uint8_t messageBuf[3];
  uint8_t TWI_targetSlaveAddress = 0x10;

  TWIInit();
  DDRE |= PE7;
  sei();
  int i;
  while(1) {
    //messageBuf[0] = (TWI_targetSlaveAddress << 1);
    //messageBuf[1] = 0x01;
    //messageBuf[2] = 0x02;
    PORTE ^= (1 << PE7);
    TWIStart();
    /*for (i = 0; i < 3; i++) {
      TWIWrite(messageBuf[i]);
      }*/
    //TWIStop();
    _delay_ms(1000);
  }

#elif _TEST == 5
  Packet host_packet;
  PacketInit(&host_packet);
  int len = 0;
  int i;
  char c;
  DDRE |= (1 << PE7);
  PORTE &= ~(1 << PE7);
  uint8_t message_buf[] = {0xFE, 0xFE, 0x01, 0x04, 0x02, 0x2B, 0x01, 0xCC};
  while(1) {
    c = uart0_getchar();
    if (c != EOF) {
      for (i = 0; i < 8; i++)
	uart1_putchar(message_buf[i]);
    }
    /*
    c = uart1_getchar();
    if (c != EOF) {
      len = PacketProcessChar(&host_packet, c);
      uart0_printf("%u\r\n",c);
    }
    if (len > 0) {
      PORTE ^= (1 << PE7);
      len = 0;
      }*/
  }
#endif // _TEST
  return 0;
}
