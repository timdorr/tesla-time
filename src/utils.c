#include <ctype.h>

char *upcase(char *str) {
    char *s = str;

    while (*s) {
        *s++ = toupper((int)*s);
    }

    return str;
}
