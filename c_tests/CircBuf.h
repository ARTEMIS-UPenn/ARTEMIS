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
