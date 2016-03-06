#! /bin/bash

echo ""
echo "+------------------------------------------------+"
echo "|  Welcome to                                    |"
echo "|             B O O K   W I K I                  |"
echo "|                                                |"
echo "| Use ctrl-c to quit.                            |"
echo "+------------------------------------------------+"
echo ""

cd "$(dirname "$0")"

(sleep 5 && open -a Safari "http://localhost:3000/") &
npm run server
