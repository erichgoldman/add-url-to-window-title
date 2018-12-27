# How to Test with Katalon Recorder


## Intro

Katalon Recorder is a Selenium IDE-like testing tool. It allows you to create automation test cases for web browsing. For Add URL to Window Title, Katalon is an easy to use testing framework to ensure that the `<title />` tag is being set as expected on logon pages, after AJAX updates, etc.

Katalon Recorder is also useful for submitting a bug report, as you can record the exact steps to replicate the problem and these can easily be replayed by others working on your issue.

Katalon Recorder scripts can be exported, which is useful if implementing a CI/CD workflow using another testing platform.

**Note:** Testing for this project is generally done in the latest version of Chrome (using a dedicated portable apps instance). Testing should also work in Firefox and other browsers. However, some Chrome derivatives, such as Vivaldi may not work with Katalon, even if this extension will work for those browsers.


## Getting Katalon Recorder

Learn more about Katalon at [their homepage](https://katalon.com) and checkout the [Katalon Recorder QuickStart](https://www.katalon.com/resources-center/blog/katalon-automation-recorder/)

Katalon Recorder is available in the Chrome Webstore: https://chrome.google.com/webstore/detail/katalon-recorder-selenium/ljdobmomdgdljniojadhoplhkpialdid


## Testing with Katalon Recorder

Katalon allows you to record test cases similar to Microsoft Office Macros, you can start the recorder, click, type, etc. and it will capture what you do for replay. Alternatively, you can create the actions manually one at a time in the editor. The [commands are generally the same as for Selenium](https://www.seleniumhq.org/docs/02_selenium_ide.jsp#selenium-commands-selenese). A good starting place is to model your tests off of those already included in the repo.

### Opening the Existing Test Cases

The test cases are `*.html` files found in this directory. Be careful manually editing these files in a text editor to adhere to Selenium conventions. To open the existing test cases, open the Selenium Recorder main window by clicking the icon next to the address bar in your browser. When the window pops up, click the folder icon next to the "Test Cases" heading on the left. You should then be able to run the test suite.

**Note:** These tests are designed to be run with the configuration option "Active Field Attribute Display" enabled (checked), as the tests are often checking that clicking on a particular field does in fact add the `name` and `id` attributes properly. Please check these settings if the test cases fail

### Types of Tests to Run

The general goal of testing for this extension is to ensure that the URL is properly updated as you navigate and to ensure that when a `<input />` field is active the `name` and `id` attributes are added. 

On simple web pages, we shouldn't expect things to go wrong, but on single page apps that make heavy use of AJAX there could be problems. 
 



