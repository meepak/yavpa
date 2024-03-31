type LogLevel = 'info' | 'error';

interface MyConsole {
    log: (...args: any[]) => void;
}

/**
 * Custom console log that can log with different log levels
 *
 * e.g. usage
 *  myConsole.log('This is an info message');
 *   myConsole.log('This is an error message', 'error');
 */

const myConsole: MyConsole = {
    log: (...args: any[]) => {
        //return; // no logging
        const lastArg = args[args.length - 1];
        let logLevel: LogLevel = 'info';

        // If the last argument is a log level, remove it from args
        if (typeof lastArg === 'string' && (lastArg === 'info' || lastArg === 'error')) {
            logLevel = lastArg;
            args = args.slice(0, -1);
        }

        // Handle different log levels
        switch (logLevel) {
            case 'info':
                args.forEach((arg) => {
                    // Generate a random number between 0 and 2
                    const randomColor = Math.floor(Math.random() * 3);

                    // Choose a different color for each argument based on the random number
                    switch (randomColor) {
                        case 0:
                            console.log('\x1b[31m', arg, '\x1b[0m'); // Red
                            break;
                        case 1:
                            console.log('\x1b[32m', arg, '\x1b[0m'); // Green
                            break;
                        case 2:
                            console.log('\x1b[34m', arg, '\x1b[0m'); // Blue
                            break;
                    }
                });
                break;
            case 'error':
                console.error('\x1b[31m', ...args, '\x1b[0m'); // Red
                break;
        }
    },
};

export default myConsole;