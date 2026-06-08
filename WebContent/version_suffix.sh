FILE="/webapp/websquare/suffix.txt"
DIR_PATH=$(dirname "$FILE")

TODAY=$(date +%Y_%m_%d)

NEXT_VER="v0.1"

if [ ! -d "$DIR_PATH" ]; then
    mkdir -p "$DIR_PATH"
fi

if [ -s "$FILE" ]; then
    LAST_LINE=$(cat "$FILE")
    
    LAST_VER=$(echo "$LAST_LINE" | awk -F'_' '{print $NF}')
    LAST_DATE=$(echo "$LAST_LINE" | sed 's/_[^_]*$//')
    
    if [ "$LAST_DATE" = "$TODAY" ]; then
        MAJOR_VER=$(echo "$LAST_VER" | cut -d'.' -f1) 
        MINOR_VER=$(echo "$LAST_VER" | cut -d'.' -f2) 
        
        NEXT_MINOR=$((MINOR_VER + 1))
        NEXT_VER="${MAJOR_VER}.${NEXT_MINOR}"
    fi
fi

RESULT_SUFFIX="${TODAY}_${NEXT_VER}"

echo "$RESULT_SUFFIX" > "$FILE"
echo "[SUCCESS] 버전 갱신 완료 -> ${FILE} [${RESULT_SUFFIX}]"