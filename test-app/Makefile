
.PHONY: install run

run: install
	npm run dev

install:
	npm install

screenshot:
	make run &
	sleep 10
	node screenshot.cjs --clicks '[{"x":12,"y":18},{"x":12,"y":18}]'
