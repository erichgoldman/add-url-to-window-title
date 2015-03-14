/**
 * @name Add URL to Windows Title - Main Script
 * @fileOverview Main script for Mozilla FireFox SDK Addon which manages the 
 * life-cycle of adding and removing the content script and managing the 
 * workers.
 *
 * @author Eric H Goldman
 * @copyright Eric H Goldman 2015
 * @license GPL-2.0+
 * @see Maintained at {@link https://github.com/erichgoldman/add-url-to-window-title|GitHub}
 */

// Include Addon SDK modules
var simplePrefs = require("sdk/simple-prefs");
var self = require("sdk/self");
var tabs = require("sdk/tabs");

/**
 * Used to hold the worker created and associated with each tab.
 * Allows for messaging each active worker as well.
 * @type {array}
 */
var tabWorkers = {};



/**
 * Sends the current preferences stored in simple-prefs
 * to all tabs, so those tabs can update and make necessary
 * changes to addon functionality
 */ 
var sendPreferencesToAllTabs = function () {	
	for each (var thisTabWorker in tabWorkers){	
		// Possible exception at sdk/content/worker.js:241, for background 
		// workers' back/forward (bfache); nothing needs to be done
		try {
			thisTabWorker.port.emit('setPrefs', simplePrefs.prefs);
		}
		catch (e) { }		
	}
};


/**
 * Update the content script whenever the preferences are changed
 * empty string as first parameter listens for changes to any
 * preference in the addon's branch
 *
 * @see {@link https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/simple-prefs#on%28prefName.2C_listener%29|simple-prefs#prefChange} at MDN
 */
simplePrefs.on("", sendPreferencesToAllTabs);




/**
 * Initial setup and run for main script
 *
 * @see {@link https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Listening_for_load_and_unload#exports.main%28%29|exports.main} at MDN
 */
exports.main = function (options) {

	/**
	 * Add the workers and event handlers for a specified tab
	 * @param {tab} tab - An object representing a browser tab
	 */
	var addTabWorker = function (tab) {
	
		// Only add content script to web page, not ftp, about:blank, etc
		if( /^http/.test(tab.url) ){
			
			/**
			 * Unique identifier for this tab
			 */
			let tabId = tab.id;
						
			/**
			 * Remove any existing workers for tab if they exist
			 */
			if(tabId in tabWorkers){
				try {
				   tabWorkers[tabId].destroy();
				}
				catch (e) { }
			}
			
			/**
			 * Create a worker for each tab and attach the content script
			 * attach returns a worker, needs to be stored for later usage
			 * for getPrefs
 			 */
			tabWorkers[tabId] = tab.attach({
				contentScriptFile: self.data.url('add-url-to-title.js')
			});			
			
			/**
			 * Receive requests from the content script for the latest preferences
			 * (port.on is a receiver *from* the content script,
			 * port.emit sends the preferences data *to* the content script)
 			 */
			tabWorkers[tabId].port.on('getPrefs', function() {
				try {
				   tabWorkers[tabId].port.emit('setPrefs', simplePrefs.prefs);
				}
				catch (e) { }		
			});
			
			/**
			 * There can be issue with bfcache back/forward, therefore worker
			 * is removed when you leave the page, will be attached on the
			 * tab's pageshow, i.e., tabs.on('pageshow', fn);
			 * @see {@link https://bugzilla.mozilla.org/show_bug.cgi?id=1050327|bugzilla}
			 */
			tabWorkers[tabId].on('pagehide', function () {			
				try {
				   tabWorkers[tabId].destroy();
				}
				catch (e) { }	
			});
			
			/**
			 * When the tab is closed/destroyed, remove the tabWorker
 			 */		
			tabWorkers[tabId].on('detach', function () {
				delete tabWorkers[tabId];
			});
				
		}		
	};

	/**
	 * When a new page is loaded in the tab, add the worker
	 */
	tabs.on('pageshow', function(tab) {
		addTabWorker(tab);
	});

	/*
	 * Add the worker to existing tabs when the add-on is enabled
	 */
	if(options.loadReason == 'enable'){
		for (let tab of tabs){
			addTabWorker(tab);
		}		
	}
	
};