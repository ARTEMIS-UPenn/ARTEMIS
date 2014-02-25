#include "uart1.h"
#include <util/delay.h>
#include <stdint.h>
#include <avr/io.h>
#include <avr/interrupt.h>
#include "CBUF.h"

#define DEFAULT_BAUDRATE 57600

#define uart1_getbuf_SIZE 128
#define uart1_putbuf_SIZE 128
volatile struct {
  uint8_t m_getIdx;
  uint8_t m_putIdx;
  uint8_t m_entry[ uart1_getbuf_SIZE ];
} uart1_getbuf;
volatile struct {
  uint8_t m_getIdx;
  uint8_t m_putIdx;
  uint8_t m_entry[ uart1_putbuf_SIZE ];
} uart1_putbuf;

ISR(USART1_RX_vect) {
  char c;
  c = UDR1;
  CBUF_Push(uart1_getbuf, c);
}

ISR(USART1_UDRE_vect) {
  if (!CBUF_IsEmpty(uart1_putbuf)) {
    PORTE |= (1 << PE2);
    UDR1 = CBUF_Pop(uart1_putbuf);
  }
  else {
    // Disable interrupt
    //PORTE &= ~(1 << PE2);
    UCSR1B &= ~(_BV(UDRIE1));
  }
}

ISR(USART1_TX_vect) {
  //PORTE &= ~(1 << PE2);
  if (CBUF_IsEmpty(uart1_putbuf)) {
    _delay_us(3);
    PORTE &= ~(1 << PE2);
  }
}

void uart1_init(void) {
  CBUF_Init(uart1_getbuf);
  CBUF_Init(uart1_putbuf);

  // Set RS485 enable pin as output
  DDRE |= (1 << PE2);
  PORTE &= ~(1 << PE2);

  uart1_setbaud(DEFAULT_BAUDRATE);
  // 8N1
  UCSR1C = _BV(UCSZ11) | _BV(UCSZ10);
  // Enable tx/rx
  UCSR1B = _BV(TXEN1) | _BV(RXEN1);

  // Enable uart rxc interrupt
  UCSR1B |= _BV(RXCIE1) | _BV(TXCIE1);
}

int uart1_setbaud(long baudrate)
{
  // Set U2X
  UCSR1A |= _BV(U2X1);
  UBRR1 = (F_CPU/baudrate + 4) / 8 - 1;
  return UBRR1;
}

int uart1_getchar()
{
  /*
  loop_until_bit_is_set(UCSR1A, RXC1);
  if (UCSR1A & _BV(FE1))
    return _FDEV_EOF;
  if (UCSR1A & _BV(DOR1))
    return _FDEV_ERR;
  return UDR1;
  */
  if (!CBUF_IsEmpty(uart1_getbuf))
    return CBUF_Pop(uart1_getbuf);
  else
    return EOF;
}

int uart1_putchar(char c)
{
  CBUF_Push(uart1_putbuf, c);
  // Enable interrupt
  UCSR1B |= _BV(UDRIE1);
  return c;
}

int uart1_putstr(char *str) {
  int i = 0;
  while(str[i] != '\0')
    uart1_putchar(str[i++]);
  return i;
}

int uart1_printf(char *fmt, ...) {
  char buf[60];
  va_list ap;
  int retval = 0;

  va_start(ap, fmt);
  retval = vsnprintf(buf, 60, fmt, ap);
  va_end(ap);
    
  uart1_putstr(buf);
  return retval;
}
