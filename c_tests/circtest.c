#include <stdio.h>
#include <ncurses.h>
#include <stdbool.h>
#include "CircBuf.h"
//#include <unistd.h>


CircBuf cb;

void testinit() {
  initscr();
  noecho();
  initCB(&cb);
}

int main(void) {
  testinit();
    
  char *outbuf;
  char c;
  bool exit = false;
  while(!exit) {
    c = getch();
    if (c != EOF) {
      if (c != 'd') {
	writeCB(&cb, c);
      }
      else
	printw("%s\n", readCB(&cb, outbuf));
      if (c == 'q') {
	freeCB(&cb);
	exit = true;
	endwin();
      }
    }
  }
  return 0;
}
