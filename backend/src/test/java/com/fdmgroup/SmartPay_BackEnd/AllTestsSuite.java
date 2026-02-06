package com.fdmgroup.SmartPay_BackEnd;

import org.junit.platform.suite.api.IncludeClassNamePatterns;
import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;

/**
 * Aggregated JUnit 5 test suite that discovers and runs all tests
 * in the backend test package.
 *
 * It matches classes ending with "Test" or "Tests".
 */
@Suite
@SelectPackages({"com.fdmgroup.SmartPay_BackEnd"})
@IncludeClassNamePatterns({".*Test", ".*Tests"})
public class AllTestsSuite {
    // No code needed; annotations drive discovery.
}
