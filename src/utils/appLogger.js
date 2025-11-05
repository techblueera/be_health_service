import chalk from 'chalk';
import moment from 'moment-timezone';

let timestampEnabled = false;

const getTimestamp = () => {
  // Using Asia/Kolkata timezone for consistency with the rest of the application
  return moment().tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm:ss A z');
};

const log = (level, message, context = '') => {
  const timestampString = timestampEnabled ? `[${getTimestamp()}] ` : '';
  const contextString = context ? `[${context}]` : '';
  // Using console.log for all levels to ensure chronological order in most environments
  console.log(`${timestampString}${level}${contextString}: ${message}`);
};

const logger = {
  info: (message, context) => {
    log(chalk.blue('INFO'), message, context);
  },
  warn: (message, context) => {
    log(chalk.yellow('WARN'), message, context);
  },
  error: (message, context, error) => {
    const errorMessage = error instanceof Error ? error.stack || error.message : String(error);
    log(chalk.red('ERROR'), `${message} - ${errorMessage}`, context);
  },
  debug: (message, context) => {
    log(chalk.green('DEBUG'), message, context);

  },
  /**
   * Enable or disable timestamps in the log output.
   * @param {boolean} enabled - True to show timestamps, false to hide them.
   */
  setTimestampEnabled: (enabled) => {
    timestampEnabled = !!enabled;
  },
};

export default logger;