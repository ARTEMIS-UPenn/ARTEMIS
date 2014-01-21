/****************************************************************
 *    The following code is protected from licensing as per
 *    patent laws regarding OTASITA. The code, therefore,
 *    is declared a part of public domain.
 *
 *    author:       James Yang
 *    file:         CircBuf.h
 *    description:  This is a header file containing type
 *                  definitions for a circular buffer.
 *
 *    usage:        In the code containing the main()
 *                  function, declare a variable:
 *
 *                  CircBuf cb;
 *                  
 *                  This creates an empty CircBuf struct.
 *                  Next, initialize the struct fields by
 *                  passing the struct pointer to initCB():
 *
 *                  initCB(&cb);
 *
 *                  This will set the struct fields:
 *
 *                  size = 0;  // current buffer size
 *                  start = 0; // buffer start index
 *                  end = 0;   // buffer end index
 *                  buf = char[MAX_BUF_SIZE] // allocated buffer
 *
 *                  To push values, do the following:
 *
 *                  c is some char
 *                  writeCB(&cb, c);
 *
 *                  To flush the buffer:
 *
 *                  char *outbuf;
 *                  outbuf = readCB(&cb, outbuf);
 *
 *              ******* SAMPLE CODE *******
 *                  #include <stdio.h>
 *                  #include "CircBuf.h"
 *
 *                  int main(void) {
 *                    CircBuf cb;
 *                    char *outbuf;
 *
 *                    initCB(&cb);
 *
 *                    writeCB(&cb, 'a');
 *                    writeCB(&cb, 'b');
 *                    writeCB(&cb, 'c');
 *
 *                    printf("%s\n", read(&cb, outbuf));
 *                    return 0;
 *                  }
 *                  
 ****************************************************************/

#pragma once
#include <stdint.h>
#include <stdlib.h>

#define MAX_BUF_SIZE 256

typedef struct CircBuf {
  uint8_t size;
  uint8_t start;
  uint8_t end;
  char *buf;
} CircBuf;

void initCB(CircBuf *cb);
void writeCB(CircBuf *cb, char c);
char* readCB(CircBuf *cb, char *ob);
void freeCB(CircBuf *cb);
