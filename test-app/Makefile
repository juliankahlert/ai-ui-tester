
.PHONY: install run

run: install
	npm run dev

install:
	npm install

screenshot:
	make run &
	sleep 10
	node screenshot.cjs --get-args events=#click42-24#click22-44#
