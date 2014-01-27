CC = gcc
CFLAGS = -Wall -g
INCS = `pkg-config --cflags gtk+-2.0`
LIBS = `pkg-config --libs gtk+-2.0`

helloworld: helloworld.c
	$(CC) $(CFLAGS) -o $@ $^ $(INCS) $(LIBS)

.PHONY: clean

clean:
	rm *~ helloworld