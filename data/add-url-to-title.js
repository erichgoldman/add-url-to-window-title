/**
 * @name Add URL to Windows Title - Content Script
 * @fileOverview Content script for Mozilla FireFox SDK add-on which will add 
 * the current web pages URL/hostname to the window title, and optionally 
 * will add a currently selected <input />'s id and name attributes to the
 * window title.
 *
 * Note: AUTT = "Add URL To Title"
 *
 * @author Eric H Goldman
 * @copyright Eric H Goldman 2015
 * @license GPL-2.0+
 * @see Maintained at {@link https://github.com/erichgoldman/add-url-to-window-title|GitHub}
 */

// Object literal existence check
if (typeof addURLToTitle === 'undefined') {
    var addURLToTitle = {};
}

var addURLToTitle = (function() {

	/**
	 * A preference which determines the string characters that will be used to 
	 * separate the original window title from the content added by the add-on.
	 * @type {string}
	 */
	var separatorString = '-';

	/**
	 * OBSOLETE - A preference which determines if the full URL should be shown (true) or
	 * if only the hostname for the current web page should be shown (false).
	 * @type {boolean}
	 */
	var showFullURL = false;

	/**
	  * A preference specifying URL format for the title.
	  * @type {string}
	  */
	var urlFormat = '{protocol}://{hostname}{port}/';

	/**
	 * A preference which determines whether (true) or not (false) to show the
	 * input field's id and name attributes in the window title. 
	 * @type {boolean}
	 */
	var showFieldAttributes = false;

	/**
	 * The URL which will be added to the window title, determined by 
	 * var showFullURL
	 * @type {string}
	 */
	var addedURL = '';

	/**
	 * The input fields or an empty string as determined by the value
	 * of var showFieldAttributes and the eventListeners attached
	 * @type {string}
	 */
	var currentInputFieldAttributes = '';

	/**
	 * Holds the original window title from <head /> before the add-on has made 
	 * any changes. Needed to prevent unnecessary duplication. 
	 * @type {string}
	 */
	var originalTitle = '';

	/**
	 * An observer which will be attached to the DOM to monitor changes to the
	 * window's title, do not instantiate here 
	 * @type {MutationObserver}
	 */
	var titleObserver;

	/**
	 * A flag used so that startup functions are only called once
	 * @type {boolean}
	 */
	var firstRun = true;

	/**
	 * A flag used by the 'head > title' monitoring MutationObserver, used to determine
	 * whether the add-on is the cause for triggering the change to the title or some
	 * other script outside of the add-on's control. 
	 * @type {boolean}
	 */
	var lastTitleSetByAddon = false; 

	/**
	 * initialize the content script by setting global variables, attaching 
	 * receiver, observers, etc. get current preferences from main script
	 */
	var init = function () {	
		
		//Set the original title during init, not as global declaration
		originalTitle = '' + document.title;
		
		//Enable receiving preference from main add-on script
		addPreferencesReceiver();
		
		// Manually ensure preferences are loaded first time after setup to ensure it runs
		self.port.emit('getPrefs', '');

		// Add listeners and Observers
		addWindowListeners();
		observeForTitleChanges();
		
		// Add the cleanup receiver for uninstall / disable
		addCleanUpReceiver();
	
	};

	/**
	 * Receive the message from the add-on script when the preference update occurs
	 * 
	 * @see {@link https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/page-mod#Cleaning_up_on_add-on_removal|page-mod} at MDN
	 * @see {@link https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Listening_for_load_and_unload#reason|detach reasons} at MDN
	 * @see {@link https://developer.mozilla.org/en-US/docs/Extensions/Common_causes_of_memory_leaks_in_extensions|Avoiding memory leaks} at MDN
	 */
	var addCleanUpReceiver = function () {
		
		self.port.on('detach', function(reason){	
			
			try {
				
				// Remove input field listeners
				updateShowFieldAttributesSettings(false);

				// Remove window listeners
				window.removeEventListener('hashchange', OnHashChangeForAUTT, false);
				
				//disable port receivers
				self.port.removeListener('setPrefs', setPreferences);
				
				// Disconnect observers and free observer object
				titleObserver.disconnect();	
				titleObserver = null;		

				// Reset to original title
				document.title = originalTitle;

			}
			catch (e) {	}
			
		});
		
	}; 

	/**
	 * setPreferences will be activated when receiving via self.port.on receives
	 * the preferences message. Function is separated so it can later be removed
	 * easily by self.port.removeListener()
	 *
	 * @param {array} prefs - The preferences set by the user, received 
	 * through port.emit from main.js
	 * @see {@link https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Content_Scripts/using_port#port.on%28%29|Workng with port.on}
	 * 
	 */
	var setPreferences = function (prefs) {

		// prefs will be an array of the SimplePrefs for this extension's 
		// branch, explicitly set them into the local variables
		separatorString = prefs['separatorString'].trim();
		urlFormat = prefs['urlFormat'];
		showFullURL = prefs['showFullURL'];

		// Only run the update on change, set inside to prevent additional variable declaration
		if(showFieldAttributes !== prefs['showFieldAttributes']){
		
			showFieldAttributes = prefs['showFieldAttributes'];
			
			// Updates functionality based on showFieldAttributes
			updateShowFieldAttributesSettings();
			
			if(firstRun === true){
				//forceInitialFocus must run only after preferences are set
				forceInitialFocus(); 
				firstRun = false;
			}
			
		}
		
		// useOriginalTitle=true so it will update with new settings
		setTitle(true);

	};

	/**
	 * Receive the message from the add-on script when the preference update occurs
	 * setPreferences will receive the object from the setPrefs message
	 */
	var addPreferencesReceiver = function () {
		self.port.on('setPrefs', setPreferences );
	};

	/**
	 * Modifies the window title based upon the user's preferences.
	 *
	 * @param {boolean} useOriginalTitle - Prevents accidental duplication of title content
	 * after the add-on has added some information. Defaults to false unless explicitly 
	 * set true as needed throughout the add-on.
	 */
	var setTitle = function (useOriginalTitle) {
		
		// Default parameter value check
		useOriginalTitle = typeof useOriginalTitle !== 'undefined' ? useOriginalTitle : false;
		
		// parse URL
		var parser = document.createElement('a');
		parser.href = document.URL;

		// format URL
		var replObj = {
			'{protocol}': parser.protocol.slice(0,-1),
			'{hostname}': parser.hostname,
			'{port}': (parser.port != '') ? (':'+parser.port) : '',
			'{path}': parser.pathname.substring(1),
			'{args}': parser.search,
			'{hash}': parser.hash
		};
		var re = new RegExp(Object.keys(replObj).join("|"),"gi");
		addedURL = urlFormat.replace(re, function(matched){
				return replObj[matched];
		});
		
		parser = null;	
		
		// Used in observer to prevent unnecessary additional calls
		lastTitleSetByAddon = true; 
		
		// if     : force the original title to prevent duplications
		// if else: if the URL is not already added, then add it
		//    else: do nothing, the URL is already present and should not be added again
		if(useOriginalTitle === true){ 
			document.title = titleFormatter(originalTitle);
		}else if(document.title.indexOf( sanitizer(addedURL) ) < 0){
			document.title = titleFormatter(document.title);
		}
    
	};

	/**
	 * Formats the new string that will be set in setTitle
	 *
	 * @param {string} title - Either the original or current title, set by setTitle()
	 * @returns {string} Formatted string to replace the existing window title
	 */
	var titleFormatter = function (title) {
    //maybe just sanitize on title and URL, Can I trust my inputField Attributes?
		let newTitle = [sanitizer(title), separatorString, sanitizer(addedURL) , currentInputFieldAttributes].join(' ');

		return newTitle;
	};
  
  /**
	 * Sanitizes a given input string to remove angle brackets, html encoded 
   * angle brackets, etc. Additional checks may, .e.g, UTF-8 special characters
   * may be added in the future
   *
   * The title may be read by JavaScript as part of later processing, special 
   * characters may trigger dom-based XSS. The web page's own code should be
   * checking, but remove some things which have a very unlikely chane of
   * being valid in any workflow, such as <script /> tags coming from the title
   *
   * Note: URLs are automatically escaped by Firefox, e.g., http://some.site#< 
   * will be read in as http://some.site#%3C, non-ascii will also be 
   * URL encoded so to execute XSS the caller would need to unencode the
   * document.title which would not normally be needed and should also help
   * 
   * @summary Some minimal sanitization to balance attacks with possibly 
   * affecting native web page's logic
	 *
	 * @param {string} unfiltered - Any text string which may contain <, >, %3C, etc.
	 * @returns {string} A string which has had been filtered to limit later XSS
   * @see {@link http://www.justarrangingbits.org/firefox-magic-decoding-address-bar/index.html|FireFox Address Bar} and notice how even if it is not encoded in the addressbar, the add-on will show it encoded when its put in the title   
	 */
  var sanitizer = function (unfiltered) {
    
    unfiltered = typeof unfiltered === 'string' ? unfiltered : '';
    
		let filtered = unfiltered.replace('<script', 'noscript').replace('</script', 'noscript');
		filtered = filtered.replace(/[<>'"]/g, '').replace(/%3[CEce]/g, '');
        
    return filtered;    
  };

	/**
	 * Triggers the focus event on the element which has focus (e.g., autofocus) 
	 * when the page is loaded (when content script is attached)
	 *
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent|CustomEvent} at MDN
	 * @see {@link http://help.dottoro.com/ljckqjrt.php|DOMActivate} does not fire on input:text
	 */
	var forceInitialFocus = function () {
		
		// Create the event
		var forceInitialFocusEvent = new CustomEvent('focus');

		// Dispatch/Trigger/Fire the event
		// An active element may not be set @see {@link https://developer.mozilla.org/en-US/docs/Web/API/document.activeElement?redirectlocale=en-US&redirectslug=DOM%2Fdocument.activeElement}
		if (document.activeElement !== null) {
			document.activeElement.dispatchEvent(forceInitialFocusEvent);
		}
		
	};

	/**
	 * Add the event event listeners to the window for onhashchange and onpageshow
	 * Note clear it the following should apply? https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Content_Scripts/Communicating_With_Other_Scripts#Using_the_DOM_postMessage_API
	 */
	var addWindowListeners = function () {
		window.addEventListener('hashchange', OnHashChangeForAUTT);	
	};

	/**
	 * Reset the title if the URL's hash changes, may change without the page being 
	 * reloaded (e.g., update by javascript) and the hash may be important for 
	 * pattern matching in the title
	 *
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window.onhashchange|HashChange} at MDN
	 */
	var OnHashChangeForAUTT = function (event) {
		setTitle(true);	
	};

	/**
	 * AJAX or other JavaScript calls may results in the title being changed. The
	 * URL however may stay the same and page may not reload. The title may be 
	 * important for window title pattern matching. 
	 *
	 * Note: the add-on changes the title, so a sentinel value is needed to prevent
	 * an unnecessary second call or further recursion.
	 *
	 * Example: Using Google search where the search results are loaded without
	 * the page being refreshed will change the title
	 *
	 * @summary Monitor for JavaScript initiated changes to the title
	 *
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver|MutationObserver} at MDN
	 */
	var observeForTitleChanges = function () {

		titleObserver = new MutationObserver(function(mutations) {
			
			mutations.forEach(function(mutation) {
				
				// Only setTitle() if the MutationObserver was triggered by 
				// something other than the add-on's setTitle() function. setTitle()
				// always explicitly sets lastTitleSetByAddon to true
				if(lastTitleSetByAddon === false ){
					// If something other than the add-on change the title, 
					// the new title should be used instead of the 
					// originaltitle (e.g., Single Page AJAX app)
					setTitle(false);
				}
				
				// Reset lastTitleSetByAddon in all cases, setTitle will explicitly 
				// set it true each time it runs, otherwise it wasn't the add-on
				lastTitleSetByAddon = false;
			}); 
			
		});
		 
		var config = { attributes: true, childList: true, characterData: true };
		var target = document.querySelector('head > title'); 

		// Only run the observer on tabs that have a <head /> (e.g., not about:blank)
		if(target !== null){ 
			titleObserver.observe(target, config);
		}

	};

	
	/**
	 * If the user set the preferences of the add-on such that the name and id of 
	 * input fields should be added to the title, add the necessary event 
	 * listeners, otherwise remove the event listeners. Mutations observers 
	 * do not track document properties like document.activeElement. Add event
	 * listeners to each element because focus and blur do not bubble up.
	 *
	 * @summary Add listeners to input fields if the setting it true, remove if false
	 * @param {boolean} enableInputListeners - Manually determine whether or not to
	 * add/remove the listeners, useful for the detach cleanup
	 */
	var updateShowFieldAttributesSettings = function (enableInputListeners) {

		//if no option is specified, use the global setting; useful for detach cleanup
		enableInputListeners = typeof enableInputListeners !== 'undefined' ? enableInputListeners : showFieldAttributes;
		
		var inputFields = document.querySelectorAll('input');
		
		for (i = 0; i < inputFields.length; ++i) {
			
			var thisInput = inputFields[i];
		
			if(enableInputListeners === true){
				thisInput.addEventListener('focus', OnInputFocusForAUTT);
			}else{
				thisInput.removeEventListener('focus', OnInputFocusForAUTT, false);
				thisInput.removeEventListener('blur', OnInputBlurForAUTT, false);
				setTitle(true);
				
				//ensure that the currentInputFields are reset to empty string
				currentInputFieldAttributes = '';
			}
		
		}
		
	};

	/**
	 * Monitor for when the input field is not longer the active element. Must track
	 * blur event, but note that blur fires when the entire window loses focus,
	 * which would result in the name and id information being removed from the 
	 * title. So ensure that the element still have the cursor event when the 
	 * window goes to background (Important for KeePass window matching).
	 *
	 * @summary Update the window title when the input field is no longer active
	 */
	var OnInputBlurForAUTT = function (event) {
			
		if(this !== document.activeElement){
			
			currentInputFieldAttributes = '';
			
			setTitle(true);

			// Remove the blur event to reduce resources
			this.removeEventListener('blur', OnInputBlurForAUTT, false);
			
		}	
		
	};

	/**
	 * When the input field receives focus, add the input fields name and
	 * id attributes and add the blur listener.
	 *
	 * @summary Update the window title when the input field is no longer active
	 */
	var OnInputFocusForAUTT = function (event) {

		var currentInputName = this.getAttribute('name');
		var currentInputId = this.getAttribute('id');

		currentInputFieldAttributes = [ '[Input Name: "', 
                                    sanitizer(currentInputName),
                                    '"] [Input ID: "',
                                    sanitizer(currentInputId),
                                    '"]'
                                  ].join('');

		setTitle(true);
					
		// Add the blur event only after once focused to save resources
		this.addEventListener('blur', OnInputBlurForAUTT);

	};
	
	//Declare public members
	return {
		init: init	 
	};	
	
})();

addURLToTitle.init();
