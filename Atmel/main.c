#include <avr/io.h>
#include <avr/interrupt.h>
//#include <avr/eeprom.h>
#include <util/delay.h>
#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include "uart0.h"

bool toggle = false;

void init() {
  uart0_init();
  uart0_setbaud(57600);
  sei();
}

int main(void) {
  DDRE |= (1 << PE7) | (1 << PE6);
  init();
  char c;
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
  return 0;
}
