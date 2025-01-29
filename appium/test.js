const wdio = require('webdriverio');
const assert = require('assert');
const find = require('appium-flutter-finder');

// Detect OS and set the specific options accordingly
const osSpecificOps = process.env.APPIUM_OS === 'android' ? {
  platformName: 'android',
  'appium:deviceName': 'emulator-5554',        // Added appium: prefix
  'appium:platformVersion': '15',               // Added appium: prefix
  'appium:app': 'C:/Appium_Android/clonetestappium/build/app/outputs/apk/debug/app-debug.apk', // Added appium: prefix
  'appium:automationName': 'Flutter'            // Added appium: prefix
} : process.env.APPIUM_OS === 'ios' ? {
  platformName: 'iOS',
  'appium:platformVersion': '12.2',             // Added appium: prefix
  'appium:deviceName': 'iPhone X',              // Added appium: prefix
  'appium:noReset': true,                       // Added appium: prefix
  'appium:app': __dirname + '/../ios/Runner.zip' // Added appium: prefix
} : {};

const opts = {
  port: 4723,
  capabilities: {
    ...osSpecificOps,
    'appium:automationName': 'Flutter'   // Added appium: prefix for consistency
  }
};

(async () => {
  console.log('Initial app testing')
  const driver = await wdio.remote(opts);

  // Check the health of the Flutter app
  assert.strictEqual(await driver.execute('flutter:checkHealth'), 'ok');

  // Clear the timeline and force garbage collection
  await driver.execute('flutter:clearTimeline');
  await driver.execute('flutter:forceGC');

  // Enter login page and perform login actions
  await driver.execute('flutter:waitFor', find.byValueKey('loginBtn'));
  await driver.elementSendKeys(find.byValueKey('emailTxt'), 'test@gmail.com');
  await driver.elementSendKeys(find.byValueKey('passwordTxt'), '123456');
  await driver.elementClick(find.byValueKey('loginBtn'));

  // Enter home page and validate greeting
  await driver.execute('flutter:waitFor', find.byValueKey('homeGreetingLbl'));
  assert.strictEqual(await driver.getElementText(find.byValueKey('homeGreetingLbl')), 'Welcome to Home Page');

  // Navigate to Page1, validate and navigate back
  await driver.elementClick(find.byValueKey('page1Btn'));
  await driver.execute('flutter:waitFor', find.byValueKey('page1GreetingLbl'));
  assert.strictEqual(await driver.getElementText(find.byValueKey('page1GreetingLbl')), 'Page1');
  await driver.elementClick(find.byValueKey('page1BackBtn'));

  // Navigate to Page2, validate and return to native app
  await driver.elementClick(find.byValueKey('page2Btn'));
  await driver.execute('flutter:waitFor', find.byValueKey('page2GreetingLbl'));
  assert.strictEqual(await driver.getElementText(find.byValueKey('page2GreetingLbl')), 'Page2');
  await driver.switchContext('NATIVE_APP');
  await driver.back();
  await driver.switchContext('FLUTTER');

  // Logout the application
  await driver.elementClick(find.byValueKey('logoutBtn'));

  // End the session
  driver.deleteSession();
})();
