# Changelog

Notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-02-04

### Added
- Holiday exclusion system to suppress reminders when events occur on holidays
- Support for three holiday types: fixed date, nth weekday, and specific date
- `holidays` array configuration for defining holidays
- `excludeHolidays` boolean field for reminders
- `eventDay` field to specify which day the actual event occurs
- Automatic event day detection (all-day = same day, time window = end day)
- Holiday calculation engine with year-based caching
- Support for "last occurrence" holidays using nth: -1 (e.g., Memorial Day)
- Validation for holiday definitions with helpful warnings
- US federal holidays template (11 holidays)
- Holiday checking in isReminderActive() logic
- Debug logging for holiday calculations and exclusions

### Technical
- `validateHolidayDefinition()` method for holiday validation
- `calculateNthWeekday()` for calculating nth weekday of month
- `calculateHolidaysForYear()` for generating annual holiday list
- `getHolidaysForDate()` with year-based caching
- `isHoliday()` for checking if a date is a holiday
- `getEventDay()` for determining actual event day
- `shouldExcludeForHoliday()` for exclusion logic
- Holiday cache invalidation on year change
- Week boundary and year boundary handling

## [2.0.0] - 2026-02-04

### Breaking Changes
- Complete rewrite from MMM-CustomText to MMM-WeeklyReminder
- Removed notification-based system (`CUSTOMTEXT_UPDATE`)
- Removed `uniqueID` and `initialMessage` configuration options
- Module name changed to `MMM-WeeklyReminder`
- No backward compatibility with MMM-CustomText 1.x

### Added
- Automatic time-based scheduling for weekly reminders
- Support for all-day reminders (entire day display)
- Support for time-window reminders with flexible start/end times
- Cross-day time spans (e.g., Wednesday 18:00 → Thursday 14:00)
- Multiple simultaneous reminders with vertical stacking
- HTML support in reminder messages (emojis, formatting, etc.)
- Comprehensive validation with helpful warning messages
- Debug mode for troubleshooting (`debug: true`)
- Test mode for simulating specific days/times (`testMode`)
- Automatic module hiding when no reminders are active
- Suspend/resume support for hidden modules
- Error handling to prevent scheduler crashes
- Helper methods for day/time conversions

### Configuration
- New `reminders` array configuration with flexible formats
- New `updateInterval` setting (default: 60 seconds)
- New `timezone` setting for explicit timezone control
- New `debug` setting for troubleshooting
- New `testMode` setting for testing reminder schedules

### Technical
- Interval-based scheduler checks every 60 seconds (configurable)
- Efficient change detection (only updates DOM when reminders change)
- Week wrap-around support (Saturday → Sunday transitions)
- Midnight crossing support for time windows
- Multi-day span calculations with day offset logic

---

## Previous Versions (MMM-CustomText)

## [1.0.11](https://github.com/dathbe/MMM-CustomText/compare/1.0.10...v1.0.11) - 2026-01-04

- Update automated-tests.yaml
- Update readme for developers
- Update dependencies

## [1.0.10](https://github.com/dathbe/MMM-CustomText/compare/1.0.9...v1.0.10) - 2025-07-05

- Update devDependencies

## [1.0.9](https://github.com/dathbe/MMM-CustomText/compare/1.0.8...v1.0.9) - 2025-06-30

- Update devDependencies
- Update dependabot file
- Change dependabot schedule

## [1.0.8](https://github.com/dathbe/MMM-CustomText/compare/1.0.7...v1.0.8) - 2025-06-19

- Update devDependencies
- Add dependabot checks
- replace `npm run` with `node --run`

## [1.0.7](https://github.com/dathbe/MMM-CustomText/compare/1.0.6...v1.0.7) - 2025-06-08

- Update devDependencies
- Lint per https://modules.magicmirror.builders/result.html

## [1.0.6](https://github.com/dathbe/MMM-CustomText/compare/1.0.5...v1.0.6) - 2025-05-19

- Update devDependencies

## [1.0.5](https://github.com/dathbe/MMM-CustomText/compare/1.0.4...v1.0.5) - 2025-05-14

- Update devDependencies
- Change lint style

## [1.0.4](https://github.com/dathbe/MMM-CustomText/compare/1.0.3...v1.0.4) - 2025-05-06

- Update devDependencies
- Update logging

## [1.0.3](https://github.com/dathbe/MMM-CustomText/compare/1.0.2...v1.0.3) - 2025-04-24

- Update devDependencies

## [1.0.2](https://github.com/dathbe/MMM-CustomText/compare/1.0.1...v1.0.2) - 2025-04-09

- Update devDependencies

## [1.0.1](https://github.com/dathbe/MMM-CustomText/compare/1.0.0...v1.0.1) - 2025-04-02

- Add ESLint
- Add changelog
- Add code of conduct

## [1.0.0](https://github.com/jpcaldwell30/MMM-CustomMessage/compare/master...dathbe:2.0.0) - 2024-03-30

Built from [jpcaldwell30's MMM-CustomMessage](https://github.com/jpcaldwell30/MMM-CustomMessage).

- NEW FEATURE: Ability to have separate instances in the same config file that all update independently
- NEW FEATURE: Updates run off MagicMirror notifications
- NEW FEATURE: Module collapses to 0 pixel height when no message displayed
