test:
	@./node_modules/.bin/mocha -u tdd

recline: lib/backend.beacon.js

lib/backend.beacon.js: lib/beacon.js
	@echo "creating $@ has not been implemented yet!"

clean:
	@rm *.log

.PHONY: test clean
