/* MagicMirror²
 * Module: MMM-WeeklyReminder
 *
 * By dathbe
 * MIT Licensed.
 */

Module.register('MMM-WeeklyReminder', {

  // Default config.
  defaults: {
    animationSpeed: 2 * 1000,
  },

  // Define required scripts.
  getStyles() {
    return ['MMM-WeeklyReminder.css']
  },

  // Define start sequence.
  start() {
    Log.info('Starting module: ' + this.name)
  },

  // dom generator.
  getDom() {
    const wrapper = document.createElement('div')
    wrapper.style.display = 'none'
    return wrapper
  },

})
