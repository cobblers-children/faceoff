# Important Changes

## 1.4.0 (under development)

 - 'Slow Test' criteria is now configurable
 - Runs can now optionally fail on regressions over a threshold

## 1.3.0

 - Faceoff now scans for and enumerates inconclusive tests via t-test
 - More compact display of summary data, for better reading comprehension, particularly in CI
 - You can now apply default options across all suites

## 1.2.0

 - You can now set default benchmark options on suites, improving ergonomics for nested suites with
common lifecycle functions or settings

## 1.1.0

 - Green text when no regressions are found
 - SuiteOptions typedef renamed to FaceoffOptions to avoid collisions with bench-node

### Suite Configuration Options

 - `new FaceOff({})` no longer accepts a module object as a valid argument. Use a relative or absolute
path instead. Eg, `{ location: ".." }`. This is a consequence of work done to support worker threads.
 - The keys for the version data are no longer used to determine the package name, so they no longer
 need to be valid semver. You can use any naming strategy you prefer.

### Utility functions

These aren't exported and thus should not be used by third party code. However for completeness:

 - `util.packageName()` has been removed
