#!/bin/sh

DOT_INPUT=${1};
GML_OUTPUT="${DOT_INPUT}.gml";
TS=`date +%m%s`;
TMP1="/tmp/dot2gml_${DOT_INPUT}_${TS}.1"
TMP2="/tmp/dot2gml_${DOT_INPUT}_${TS}.2"
TMP3="/tmp/dot2gml_${DOT_INPUT}_${TS}.3"
TMP4="/tmp/dot2gml_${DOT_INPUT}_${TS}.4"
GRAPHML_GML_OUTPUT="${2}";

gv2gml ${DOT_INPUT} > ${GML_OUTPUT};
sed 's/ name/ label/' ${GML_OUTPUT} > ${TMP1};
sed -r 's/fontSize "([0-9]+)px"/fontSize \1/' ${TMP1} > ${TMP2};
sed -r 's/type "[^"]+"/type "rectangle"/' ${TMP2} > ${TMP3};
sed -r 's/fill "[^"]+"/fill "#FFFF99"/' ${TMP3} > ${TMP4};
iconv -f"UTF8" -t"GBK" ${TMP4} > ${GRAPHML_GML_OUTPUT};

rm -f ${GML_OUTPUT};
rm -f ${TMP1};
rm -f ${TMP2};
rm -f ${TMP3};
rm -f ${TMP4};
