# files
SOURCES		= main.c uart.c DataPacket.c
OBJECTS		= main.o uart.o DataPacket.o
INCLUDES	= -I.
LIBRARIES	= -lm
CC		= avr-gcc

# compiler and programmer
MCU_TARGET	= atmega328p
SERIAL_DEVICE	= /dev/ttyUSB1
FUSES		= -U hfuse:w:0xd9:m -U lfuse:w:0x62:m
BAUD		= 57600
CLOCK		= 16000000
PROGRAMMER	= -c stk500v1 -P $(SERIAL_DEVICE) -b $(BAUD) -D
AVRDUDE		= avrdude $(PROGRAMMER) -p $(MCU_TARGET)
COMPILE		= avr-gcc -Wall -O3 -DF_CPU=$(CLOCK) -mmcu=$(MCU_TARGET) $(INCLUDES) $(LIBRARIES)

# symbolic targets
all: main.bin

.c.o:
	$(COMPILE) -c $< -o $@

.S.o:
	$(COMPILE) -x assembler-with-cpp -c $< -o $@

.c.s:
	$(COMPILE) -S $< -o $@

flash: all
	$(AVRDUDE) -U flash:w:main.hex:i

fuse:
	$(AVRDUDE) $(FUSES)

install: flash

load: all
	bootloadHID main.hex

clean:
	rm -f main.bin main.hex main.elf $(OBJECTS) *~

main.elf: $(OBJECTS)
	$(COMPILE) -o main.elf $(OBJECTS) -lm

main.bin: main.hex
	avr-objcopy -O binary -I ihex main.hex main.bin

main.hex: main.elf
	rm -f main.hex
	avr-objcopy -j .text -j .data -O ihex main.elf main.hex

disasm: main.elf
	avr-objdump -d main.elf

cpp:
	$(COMPILE) -E main.c