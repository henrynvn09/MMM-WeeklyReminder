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
    holidays: [],              // Array of holiday definitions (fixed, nthWeekday, date)
    debug: false,              // Enable debug logging
    testMode: null,            // Test mode: { day: 'Tuesday', time: '15:30' }
  },

  // Define required scripts.
  getStyles() {
    return ['MMM-WeeklyReminder.css']
  },

  // Define start sequence.
  start() {
    Log.info('Starting module: ' + this.name)

    if (this.config.debug) {
      Log.info(`[MMM-WeeklyReminder] Configuration:`, {
        updateInterval: this.config.updateInterval,
        timezone: this.config.timezone || 'system default',
        reminderCount: this.config.reminders.length,
        holidayCount: this.config.holidays.length,
        testMode: this.config.testMode || 'disabled',
      })
    }

    // Initialize holiday cache
    this.holidayCache = null

    // Validate all reminders
    this.validReminders = this.config.reminders.filter(reminder => {
      return this.validateReminder(reminder)
    })

    if (this.config.debug) {
      Log.info(`[MMM-WeeklyReminder] Validated ${this.validReminders.length}/${this.config.reminders.length} reminders`)
      this.validReminders.forEach(r => {
        Log.info(`  - ${r.name}:`, r.showOn)
      })
    }

    this.activeReminders = []
    this.lastCheckTime = null

    // Initial check
    this.checkReminders()

    // Set up periodic checking with error handling
    this.schedulerInterval = setInterval(() => {
      try {
        this.checkReminders()
      }
      catch (error) {
        Log.error(`[MMM-WeeklyReminder] Error in scheduler:`, error)
      }
    }, this.config.updateInterval)

    if (this.config.debug) {
      Log.info(`[MMM-WeeklyReminder] Scheduler initialized, checking every ${this.config.updateInterval / 1000} seconds`)
    }
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
   * Called when module is hidden
   */
  suspend() {
    if (this.config.debug) {
      Log.info(`[MMM-WeeklyReminder] Module suspended, pausing scheduler`)
    }
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval)
      this.schedulerInterval = null
    }
  },

  /**
   * Called when module is shown again
   */
  resume() {
    if (this.config.debug) {
      Log.info(`[MMM-WeeklyReminder] Module resumed, restarting scheduler`)
    }

    // Immediate check
    this.checkReminders()

    // Restart interval
    this.schedulerInterval = setInterval(() => {
      try {
        this.checkReminders()
      }
      catch (error) {
        Log.error(`[MMM-WeeklyReminder] Error in scheduler:`, error)
      }
    }, this.config.updateInterval)
  },

  /**
   * Checks all reminders and updates active reminder list
   */
  checkReminders() {
    const now = this.getCurrentTime()
    this.lastCheckTime = now

    if (this.config.debug) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      Log.info(`[MMM-WeeklyReminder] Checking reminders at ${dayNames[now.getDay()]} ${timeStr}`)
    }

    const newActiveReminders = []

    for (const reminder of this.validReminders) {
      const isActive = this.isReminderActive(reminder)

      if (this.config.debug) {
        Log.info(`  - "${reminder.name}": ${isActive ? 'ACTIVE' : 'inactive'}`)
      }

      if (isActive) {
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
   * Gets current date/time (real or simulated for testing)
   * @returns {Date} - Current or simulated date
   */
  getCurrentTime() {
    if (this.config.testMode) {
      const now = new Date()
      const testDay = this.dayNameToNumber(this.config.testMode.day)
      const [hours, minutes] = this.config.testMode.time.split(':').map(Number)

      // Calculate days to add to get to test day
      let daysToAdd = testDay - now.getDay()
      if (daysToAdd < 0) daysToAdd += 7

      const testDate = new Date(now)
      testDate.setDate(testDate.getDate() + daysToAdd)
      testDate.setHours(hours, minutes, 0, 0)

      if (this.config.debug) {
        Log.info(`[MMM-WeeklyReminder] TEST MODE: Simulating ${this.config.testMode.day} ${this.config.testMode.time}`)
      }

      return testDate
    }

    return new Date()
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
    const now = this.getCurrentTime()
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

    // Validate optional holiday exclusion fields
    if (reminder.excludeHolidays !== undefined && typeof reminder.excludeHolidays !== 'boolean') {
      Log.warn(`[MMM-WeeklyReminder] Reminder "${reminder.name}" has invalid excludeHolidays value. Must be boolean.`)
      return false
    }

    if (reminder.eventDay !== undefined) {
      if (!validDays.includes(reminder.eventDay)) {
        Log.warn(`[MMM-WeeklyReminder] Reminder "${reminder.name}" has invalid eventDay: ${reminder.eventDay}`)
        return false
      }
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

  /**
   * Validates a holiday definition
   * @param {Object} holiday - Holiday definition
   * @returns {boolean} - True if valid
   */
  validateHolidayDefinition(holiday) {
    if (!holiday || typeof holiday !== 'object') {
      Log.warn(`[MMM-WeeklyReminder] Invalid holiday definition: not an object`)
      return false
    }

    if (!holiday.type) {
      Log.warn(`[MMM-WeeklyReminder] Holiday missing type field:`, holiday)
      return false
    }

    if (!holiday.name || typeof holiday.name !== 'string') {
      Log.warn(`[MMM-WeeklyReminder] Holiday missing or invalid name field:`, holiday)
      return false
    }

    switch (holiday.type) {
      case 'fixed':
        // Requires month (1-12) and day (1-31)
        if (typeof holiday.month !== 'number' || holiday.month < 1 || holiday.month > 12) {
          Log.warn(`[MMM-WeeklyReminder] Holiday "${holiday.name}" has invalid month: ${holiday.month}`)
          return false
        }
        if (typeof holiday.day !== 'number' || holiday.day < 1 || holiday.day > 31) {
          Log.warn(`[MMM-WeeklyReminder] Holiday "${holiday.name}" has invalid day: ${holiday.day}`)
          return false
        }
        return true

      case 'nthWeekday':
        // Requires month (1-12), weekday (0-6), nth (1-5 or -1 for last)
        if (typeof holiday.month !== 'number' || holiday.month < 1 || holiday.month > 12) {
          Log.warn(`[MMM-WeeklyReminder] Holiday "${holiday.name}" has invalid month: ${holiday.month}`)
          return false
        }
        if (typeof holiday.weekday !== 'number' || holiday.weekday < 0 || holiday.weekday > 6) {
          Log.warn(`[MMM-WeeklyReminder] Holiday "${holiday.name}" has invalid weekday: ${holiday.weekday}`)
          return false
        }
        if (typeof holiday.nth !== 'number' || (holiday.nth < 1 && holiday.nth !== -1) || holiday.nth > 5) {
          Log.warn(`[MMM-WeeklyReminder] Holiday "${holiday.name}" has invalid nth: ${holiday.nth}. Must be 1-5 or -1 for last.`)
          return false
        }
        return true

      case 'date':
        // Requires date in YYYY-MM-DD format
        if (!holiday.date || typeof holiday.date !== 'string') {
          Log.warn(`[MMM-WeeklyReminder] Holiday "${holiday.name}" missing or invalid date field`)
          return false
        }
        const datePattern = /^\d{4}-\d{2}-\d{2}$/
        if (!datePattern.test(holiday.date)) {
          Log.warn(`[MMM-WeeklyReminder] Holiday "${holiday.name}" has invalid date format: ${holiday.date}. Use YYYY-MM-DD.`)
          return false
        }
        return true

      default:
        Log.warn(`[MMM-WeeklyReminder] Holiday "${holiday.name}" has unknown type: ${holiday.type}`)
        return false
    }
  },

  /**
   * Calculates the nth occurrence of a weekday in a given month
   * @param {number} year - Year (e.g., 2026)
   * @param {number} month - Month (1-12)
   * @param {number} weekday - Day of week (0=Sunday, 6=Saturday)
   * @param {number} nth - Which occurrence (1-5, or -1 for last)
   * @returns {Date|null} - Date object or null if doesn't exist
   */
  calculateNthWeekday(year, month, weekday, nth) {
    // Get first day of month
    const firstDay = new Date(year, month - 1, 1)
    const firstDayOfWeek = firstDay.getDay()

    if (nth === -1) {
      // Last occurrence - start from last day of month and work backwards
      const lastDay = new Date(year, month, 0) // Day 0 = last day of previous month
      const lastDayOfWeek = lastDay.getDay()
      
      let daysBack = (lastDayOfWeek - weekday + 7) % 7
      const date = new Date(year, month, 0)
      date.setDate(date.getDate() - daysBack)
      
      return date
    }

    // Calculate days until first occurrence of target weekday
    let daysUntilWeekday = (weekday - firstDayOfWeek + 7) % 7
    
    // Calculate date of nth occurrence
    const targetDate = 1 + daysUntilWeekday + (nth - 1) * 7
    
    // Check if date is valid for this month
    const daysInMonth = new Date(year, month, 0).getDate()
    if (targetDate > daysInMonth) {
      return null // This nth occurrence doesn't exist
    }
    
    return new Date(year, month - 1, targetDate)
  },

  /**
   * Calculates all holidays for a given year
   * @param {number} year - Year to calculate holidays for
   * @returns {Array} - Array of { date: 'YYYY-MM-DD', name: string }
   */
  calculateHolidaysForYear(year) {
    const holidays = []

    for (const holidayDef of this.config.holidays) {
      if (!this.validateHolidayDefinition(holidayDef)) {
        continue // Skip invalid holidays
      }

      let holidayDate = null

      switch (holidayDef.type) {
        case 'fixed':
          holidayDate = new Date(year, holidayDef.month - 1, holidayDef.day)
          break

        case 'nthWeekday':
          holidayDate = this.calculateNthWeekday(year, holidayDef.month, holidayDef.weekday, holidayDef.nth)
          if (!holidayDate) {
            Log.warn(`[MMM-WeeklyReminder] Holiday "${holidayDef.name}" doesn't exist in ${year} (no ${holidayDef.nth}th occurrence)`)
            continue
          }
          break

        case 'date':
          // Parse YYYY-MM-DD
          const parts = holidayDef.date.split('-').map(Number)
          if (parts[0] === year) {
            holidayDate = new Date(parts[0], parts[1] - 1, parts[2])
          }
          // Skip if date is not for this year
          break
      }

      if (holidayDate) {
        // Format as YYYY-MM-DD
        const dateStr = `${holidayDate.getFullYear()}-${String(holidayDate.getMonth() + 1).padStart(2, '0')}-${String(holidayDate.getDate()).padStart(2, '0')}`
        holidays.push({ date: dateStr, name: holidayDef.name })
      }
    }

    if (this.config.debug) {
      Log.info(`[MMM-WeeklyReminder] Calculated ${holidays.length} holidays for ${year}:`, holidays)
    }

    return holidays
  },

  /**
   * Gets holidays for a specific date (with caching)
   * @param {Date} date - Date to check
   * @returns {Array} - Array of holidays for the year
   */
  getHolidaysForDate(date) {
    const year = date.getFullYear()

    // Check if cache exists and is for current year
    if (!this.holidayCache || this.holidayCache.year !== year) {
      this.holidayCache = {
        year: year,
        holidays: this.calculateHolidaysForYear(year)
      }
    }

    return this.holidayCache.holidays
  },

  /**
   * Checks if a specific date is a holiday
   * @param {Date} date - Date to check
   * @returns {boolean} - True if date is a holiday
   */
  isHoliday(date) {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const holidays = this.getHolidaysForDate(date)
    
    const isHol = holidays.some(h => h.date === dateStr)
    
    if (this.config.debug && isHol) {
      const holiday = holidays.find(h => h.date === dateStr)
      Log.info(`[MMM-WeeklyReminder] ${dateStr} is a holiday: ${holiday.name}`)
    }
    
    return isHol
  },

  /**
   * Determines which day of week the actual event occurs
   * @param {Object} reminder - Reminder configuration
   * @returns {number} - Day of week (0=Sunday, 6=Saturday)
   */
  getEventDay(reminder) {
    // If explicitly specified, use that
    if (reminder.eventDay !== undefined) {
      return this.dayNameToNumber(reminder.eventDay)
    }

    // Auto-detect based on showOn configuration
    if (reminder.showOn.allDay) {
      // All-day reminder - event day is the same day
      return this.dayNameToNumber(reminder.showOn.day)
    }

    // Time window - event day is the end day
    return this.dayNameToNumber(reminder.showOn.end.day)
  },

  /**
   * Checks if a reminder should be excluded due to holiday
   * @param {Object} reminder - Reminder configuration
   * @returns {boolean} - True if should be suppressed
   */
  shouldExcludeForHoliday(reminder) {
    // If holiday exclusion not enabled, don't exclude
    if (!reminder.excludeHolidays) {
      return false
    }

    // No holidays configured, can't exclude
    if (!this.config.holidays || this.config.holidays.length === 0) {
      return false
    }

    const now = this.getCurrentTime()
    const eventDayOfWeek = this.getEventDay(reminder)

    // Calculate the actual calendar date when the event occurs
    // We need to find "the next occurrence of eventDayOfWeek"
    const currentDayOfWeek = now.getDay()
    let daysUntilEvent = eventDayOfWeek - currentDayOfWeek

    // Handle week wrap-around
    if (daysUntilEvent < 0) {
      daysUntilEvent += 7
    }

    // Calculate event date
    const eventDate = new Date(now)
    eventDate.setDate(eventDate.getDate() + daysUntilEvent)
    eventDate.setHours(0, 0, 0, 0) // Normalize to midnight for date comparison

    // Check if event date is a holiday
    const shouldExclude = this.isHoliday(eventDate)

    if (this.config.debug) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
      Log.info(`[MMM-WeeklyReminder] Reminder "${reminder.name}": event day is ${dayNames[eventDayOfWeek]} (${eventDateStr}), holiday exclusion: ${shouldExclude}`)
    }

    return shouldExclude
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
