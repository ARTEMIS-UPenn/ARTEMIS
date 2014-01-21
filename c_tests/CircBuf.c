#include "CircBuf.h"
#include <stdio.h>

void initCB(CircBuf *cb) {
  cb->buf = (char*)malloc(sizeof(char) * MAX_BUF_SIZE);
  cb->start = 0;
  cb->end = 0;
  cb->size = 0;
}

void writeCB(CircBuf *cb, char c) {
  cb->buf[cb->end] = c;
  cb->end = (cb->end + 1) % MAX_BUF_SIZE;

  if (cb->end == cb->start && cb->size < MAX_BUF_SIZE)
    cb->start = (cb->start + 1) % MAX_BUF_SIZE;
  cb->size = cb->size < MAX_BUF_SIZE ? cb->size++ : MAX_BUF_SIZE;
}

char* readCB(CircBuf *cb, char *ob) {
  //free(ob);
  ob = (char*)malloc(sizeof(char) * cb->size);
  uint8_t it = 0;
  while (cb->start != cb->end && cb->size != 0) {
    ob[it++] = cb->buf[cb->start];
    cb->start = (cb->start + 1) % MAX_BUF_SIZE;
    cb->size--;
  }
  return ob;
}

void freeCB(CircBuf *cb) {
  free(cb->buf);
}
