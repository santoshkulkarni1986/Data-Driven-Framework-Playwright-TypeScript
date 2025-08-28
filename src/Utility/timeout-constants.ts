/**
 * timeout-constants.ts: This module provides Timeout constants that can be used to override various actions, conditional statements and assertions.
 * Instead of hard coding the timeout when overriding any utility functions, use these Timeout constants.
 */

/**
 * Timeout constant for instant actions/assertions, set to 1000 milliseconds (1 second).
 */
export const INSTANT_TIMEOUT = 1000;

/**
 * Timeout constant for small actions/assertions, set to 5000 milliseconds (5 seconds).
 */
export const SMALL_TIMEOUT = 3000;

export const TIMEOUT_4_SECONDS = 2 * 1000;

export const TIMEOUT_8_SECONDS = 4 * 1000;
/**
 * Standard timeout constant, set to 15000 milliseconds (15 seconds).
 */
export const STANDARD_TIMEOUT = 10000;

/**
 * Timeout constant for bigger actions/assertions, set to 30000 milliseconds (30 seconds).
 */
export const BIG_TIMEOUT = 30000;

/**
 * Maximum timeout constant, set to 60000 milliseconds (1 minute).
 */
export const MAX_TIMEOUT = 60000;

/**
 * Timeout constants used in the playwright.config.ts file.
 */

/**
 * Timeout constant for Playwright's expect function, set to 5000 milliseconds (5 seconds).
 */
export const EXPECT_TIMEOUT = 20000;

/**
 * Timeout constant for Playwright's action functions, set to 5000 milliseconds (5 seconds).
 */
export const ACTION_TIMEOUT = 20000;

/**
 * Timeout constant for Playwright's navigation functions, set to 30000 milliseconds (30 seconds).
 */
export const NAVIGATION_TIMEOUT = 40000;

/**
 * Timeout constant for Playwright's test functions, set to 120000 milliseconds (2 minutes).
 */
export const TEST_TIMEOUT = 120000;

/**
 * Timeout constant for Playwright's to pause, set to 120000 milliseconds (2 minutes).
 */
export const PAUSE_TIMEOUT = 0;
