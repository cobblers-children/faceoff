## Important Changes

# 1.1.0

 - Green text when no regressions are found

## Suite Configuration Options

 - `new FaceOff({})` no longer accepts a module object as a valid argument. Use a relative or absolute
path instead. Eg, `{ location: ".." }`. This is a consequence of work done to support worker threads.
 - The keys for the version data are no longer used to determine the package name, so they no longer
 need to be valid semver. You can use any naming strategy you prefer.

## Utility functions

These aren't exported and thus should not be used by third party code. However for completeness:

 - `util.packageName()` has been removed
