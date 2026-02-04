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

    // Initial check
    this.checkReminders()

    // Set up periodic checking
    this.schedulerInterval = setInterval(() => {
      this.checkReminders()
    }, this.config.updateInterval)
  },

  /**
   * Called when module is hidden/removed
   */
  stop() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval)
    }
  },

  /**
   * Checks all reminders and updates active reminder list
   */
  checkReminders() {
    const newActiveReminders = []

    for (const reminder of this.validReminders) {
      if (this.isReminderActive(reminder)) {
        newActiveReminders.push(reminder)
      }
    }

    // Only update DOM if active reminders changed
    if (this.hasRemindersChanged(newActiveReminders)) {
      if (this.config.debug) {
        Log.info(`[MMM-WeeklyReminder] Active reminders changed:`, newActiveReminders.map(r => r.name))
      }
      this.activeReminders = newActiveReminders
      this.updateDom(this.config.animationSpeed)
    }
  },

  /**
   * Checks if reminder list has changed
   * @param {Array} newReminders - New active reminders
   * @returns {boolean} - True if changed
   */
  hasRemindersChanged(newReminders) {
    if (newReminders.length !== this.activeReminders.length) {
      return true
    }

    // Check if same reminders (by name)
    const oldNames = this.activeReminders.map(r => r.name).sort()
    const newNames = newReminders.map(r => r.name).sort()

    return oldNames.join(',') !== newNames.join(',')
  },

  /**
   * Determines if a reminder should be active right now
   * @param {Object} reminder - Reminder configuration
   * @returns {boolean} - True if currently active
   */
  isReminderActive(reminder) {
    const now = new Date()
    const currentDay = now.getDay() // 0=Sunday, 6=Saturday
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    if (reminder.showOn.allDay) {
      // All day reminder - just check day
      const reminderDay = this.dayNameToNumber(reminder.showOn.day)
      return currentDay === reminderDay
    }

    // Start/end time window
    const startDay = this.dayNameToNumber(reminder.showOn.start.day)
    const endDay = this.dayNameToNumber(reminder.showOn.end.day)
    const startMinutes = this.timeToMinutes(reminder.showOn.start.time)
    const endMinutes = this.timeToMinutes(reminder.showOn.end.time)

    return this.isInTimeWindow(currentDay, currentMinutes, startDay, startMinutes, endDay, endMinutes)
  },

  /**
   * Checks if current time is within a reminder time window
   * Handles same-day, cross-day, and multi-day spans
   *
   * @param {number} currentDay - Current day (0-6)
   * @param {number} currentMinutes - Current minutes since midnight
   * @param {number} startDay - Start day (0-6)
   * @param {number} startMinutes - Start minutes since midnight
   * @param {number} endDay - End day (0-6)
   * @param {number} endMinutes - End minutes since midnight
   * @returns {boolean} - True if currently in window
   */
  isInTimeWindow(currentDay, currentMinutes, startDay, startMinutes, endDay, endMinutes) {
    if (startDay === endDay) {
      // Same day window (e.g., Tuesday 09:00 - Tuesday 17:00)
      if (currentDay !== startDay) {
        return false
      }

      if (startMinutes <= endMinutes) {
        // Normal same-day range
        return currentMinutes >= startMinutes && currentMinutes < endMinutes
      }
      else {
        // Crosses midnight (e.g., Tuesday 23:00 - Tuesday 01:00 means ALL day except 01:00-23:00)
        return currentMinutes >= startMinutes || currentMinutes < endMinutes
      }
    }

    // Multi-day span (e.g., Wednesday 18:00 - Thursday 14:00)
    // Calculate day difference (handling week wrap-around)
    let dayDiff = endDay - startDay
    if (dayDiff < 0) {
      dayDiff += 7
    }

    // Calculate current position in week relative to start
    let currentDiff = currentDay - startDay
    if (currentDiff < 0) {
      currentDiff += 7
    }

    if (currentDiff < dayDiff) {
      // Between start and end day
      if (currentDiff === 0) {
        // On start day - must be at or after start time
        return currentMinutes >= startMinutes
      }
      else {
        // On a middle day - always active
        return true
      }
    }
    else if (currentDiff === dayDiff) {
      // On end day - must be before end time
      return currentMinutes < endMinutes
    }

    return false
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

    // If no active reminders, return empty div (module will hide)
    if (this.activeReminders.length === 0) {
      wrapper.style.display = 'none'
      return wrapper
    }

    wrapper.className = 'weekly-reminder-container'

    // Create a reminder item for each active reminder
    this.activeReminders.forEach(reminder => {
      const reminderDiv = document.createElement('div')
      reminderDiv.className = 'reminder-item'
      reminderDiv.setAttribute('data-reminder-name', reminder.name)
      reminderDiv.innerHTML = reminder.message // Allow HTML in messages

      wrapper.appendChild(reminderDiv)
    })

    return wrapper
  },

})
