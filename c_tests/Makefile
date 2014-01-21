CFLAGS=-Wall -g
LIBS=-lm -lncurses
OBJ=CircBuf.o circtest.o


test: $(OBJ)
	gcc $(CFLAGS) $(LIBS) -o $@ $^

%.o: %.c
	gcc $(CFLAGS) -c $^

.PHONY: clean

clean:
	rm -rf *.o *~ \#*