type LogLevel = 'info' | 'error';

type MyConsole = {
	log: (...arguments_: any[]) => void;
};

/**
 * Custom console log that can log with different log levels
 *
 * e.g. usage
 *  myConsole.log('This is an info message');
 *   myConsole.log('This is an error message', 'error');
 */

const myConsole: MyConsole = {
	log(...arguments_: any[]) {
		// Return; // no logging
		const lastArgument = arguments_.at(-1);
		let logLevel: LogLevel = 'info';

		// If the last argument is a log level, remove it from args
		if (typeof lastArgument === 'string' && (lastArgument === 'info' || lastArgument === 'error')) {
			logLevel = lastArgument;
			arguments_ = arguments_.slice(0, -1);
		}

		// Handle different log levels
		switch (logLevel) {
			case 'info': {
				arguments_ = arguments_.map(argument =>
					typeof argument === 'object' ? JSON.stringify(argument) : argument,
				);
				for (const [index, argument] of arguments_.entries()) {
					switch (index % 3) {
						case 0: {
							console.log('\u001B[31m', arguments_.join(' '), '\u001B[0m'); // Red
							break;
						}

						case 1: {
							console.log('\u001B[32m', arguments_.join(' '), '\u001B[0m'); // Green
							break;
						}

						case 2: {
							console.log('\u001B[34m', arguments_.join(' '), '\u001B[0m'); // Blue
							break;
						}
					}
				}

				break;
			}

			case 'error': {
				console.error('\u001B[31m', ...arguments_, '\u001B[0m'); // Red
				break;
			}
		}
	},
};

export default myConsole;
