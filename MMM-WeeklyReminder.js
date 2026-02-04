/* MagicMirror²
 * Module: MMM-WeeklyReminder
 *
 * By dathbe
 * MIT Licensed.
 */

Module.register('MMM-WeeklyReminder', {

  // Default config.
  defaults: {
    updateInterval: 60 * 1000, // Check every 60 seconds
    animationSpeed: 2 * 1000,  // DOM update animation speed
    timezone: null,            // null = use system timezone
    reminders: [],             // Array of reminder objects
    debug: false,              // Enable debug logging
  },

  // Define required scripts.
  getStyles() {
    return ['MMM-WeeklyReminder.css']
  },

  // Define start sequence.
  start() {
    Log.info('Starting module: ' + this.name)

    // Validate all reminders
    this.validReminders = this.config.reminders.filter(reminder => {
      return this.validateReminder(reminder)
    })

    if (this.config.debug) {
      Log.info(`[MMM-WeeklyReminder] Loaded ${this.validReminders.length} valid reminders out of ${this.config.reminders.length}`)
    }

    this.activeReminders = []
  },

  /**
   * Validates reminder configuration
   * @param {Object} reminder - Reminder configuration object
   * @returns {boolean} - True if valid, false otherwise
   */
  validateReminder(reminder) {
    const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/

    if (!reminder.name || !reminder.message) {
      Log.warn(`[MMM-WeeklyReminder] Reminder missing name or message:`, reminder)
      return false
    }

    if (!reminder.showOn) {
      Log.warn(`[MMM-WeeklyReminder] Reminder "${reminder.name}" missing showOn configuration`)
      return false
    }

    // Validate allDay format
    if (reminder.showOn.allDay) {
      if (!reminder.showOn.day) {
        Log.warn(`[MMM-WeeklyReminder] Reminder "${reminder.name}" with allDay must specify day`)
        return false
      }
      if (!validDays.includes(reminder.showOn.day)) {
        Log.warn(`[MMM-WeeklyReminder] Reminder "${reminder.name}" has invalid day: ${reminder.showOn.day}`)
        return false
      }
      return true
    }

    // Validate start/end format
    if (!reminder.showOn.start || !reminder.showOn.end) {
      Log.warn(`[MMM-WeeklyReminder] Reminder "${reminder.name}" missing start or end time`)
      return false
    }

    if (!validDays.includes(reminder.showOn.start.day)) {
      Log.warn(`[MMM-WeeklyReminder] Reminder "${reminder.name}" has invalid start day: ${reminder.showOn.start.day}`)
      return false
    }

    if (!validDays.includes(reminder.showOn.end.day)) {
      Log.warn(`[MMM-WeeklyReminder] Reminder "${reminder.name}" has invalid end day: ${reminder.showOn.end.day}`)
      return false
    }

    if (!timePattern.test(reminder.showOn.start.time)) {
      Log.warn(`[MMM-WeeklyReminder] Reminder "${reminder.name}" has invalid start time format: ${reminder.showOn.start.time}. Use HH:MM format.`)
      return false
    }

    if (!timePattern.test(reminder.showOn.end.time)) {
      Log.warn(`[MMM-WeeklyReminder] Reminder "${reminder.name}" has invalid end time format: ${reminder.showOn.end.time}. Use HH:MM format.`)
      return false
    }

    return true
  },

  /**
   * Converts day name to number (0-6)
   * @param {string} dayName - Day name (e.g., 'Monday')
   * @returns {number} - Day number (0=Sunday, 6=Saturday)
   */
  dayNameToNumber(dayName) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days.indexOf(dayName)
  },

  /**
   * Converts time string to minutes since midnight
   * @param {string} timeStr - Time in HH:MM format
   * @returns {number} - Minutes since midnight
   */
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  },

  // dom generator.
  getDom() {
    const wrapper = document.createElement('div')
    wrapper.style.display = 'none'
    return wrapper
  },

})
