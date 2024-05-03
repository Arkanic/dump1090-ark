CFLAGS?=-O2 -g -Wall -W $(shell pkg-config --cflags librtlsdr)
LDLIBS+=-lrtlsdr -lpthread -lm
CC?=gcc
PROGNAME=dump1090
FILES=dump1090.o

all: dump1090

%.o: %.c
	$(CC) $(CFLAGS) -c $<

dump1090: $(FILES)
	$(CC) -g -o $(PROGNAME) $(FILES) $(LDFLAGS) $(LDLIBS)

.PHONY: clean

clean:
	rm -f *.o $(PROGNAME)
