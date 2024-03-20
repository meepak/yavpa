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
                console.log(...args);
                break;
            case 'error':
                console.error(...args);
                break;
        }
    },
};

export default myConsole;