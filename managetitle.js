/**
 * Copyright (c) 2018 Eric H. Goldman
 * 
 * This file is part of Add URL To Window Title.
 * 
 * Add URL To Window Title is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */



/**
 * Declare the base library for browser extensions in an opportunistic way to increase cross-browser compatibility
 * @see {@https://www.smashingmagazine.com/2017/04/browser-extension-edge-chrome-firefox-opera-brave-vivaldi/}
 */
window.browser = (function () { return window.chrome || window.browser || window.msBrowser;})();

/**
 * @module addUrlToWindowTitle
 */
var addUrlToWindowTitle = (function() {

  'use strict';
   
  /**
	 * A preference which determines if the full URL should be shown (true) or
	 * if only the hostname for the current web page should be shown (false).
	 * @type {boolean}
	 */
  var showFullUrl = false;
  
  /**
	 * A preference which determines whether (true) or not (false) to show the
	 * input field's id and name attributes in the window title. 
	 * @type {boolean}
	 */
  var showFieldAttributes = false;
  
  /**
	 * A preference which determines the string characters that will be used to 
	 * separate the original window title from the content added by the add-on.
	 * @type {string}
	 */
  var separatorString = '-';

  /**
	 * The URL which will be added to the window title, determined by 
	 * var showFullUrl
	 * @type {string}
	 */
	var addedUrl = '';

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
   * getOptions is used to call the extension storage API (async) to get the current
   * options as configured by the user (calle on startup and on modification).
   *
   * Note: Currently it is *explicitly* using *chrome.* namespace because it uses
   * the Chrome callback API, which is currently supported by both Chrome and Firefox,
   * and I wanted to avoid using polyfill. I considered using platform detection to 
   * call promise vs. callback API to allow for also Chrome, Edge, etc; however, for
   * now leaving this as just using chrome.*
   *
   * @summary Get the variable options from extension storage, options processed by 
   * updateOptions()
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities}
	 *
	 */  
  function getOptions(){
    
    var optionsToGet = {
      showFullUrl:false,
      showFieldAttributes: false,
      separatorString: "-"
    }
   
    //use Chrome Callback style API
    chrome.storage.sync.get(optionsToGet, function(settings){
      
      updateOptions(settings);

    });  
     
  };


  /**
	 * Takes settings from the extensions options page and updates the local variables
   * Note: Was split from getOptions() so it could be used in either promise
   * or callback API for easy refactoring in the future when promise api is used.
	 *
	 * @param {Object} settings - An Object with each configuration option and the returned value
   * from the storage. 
	 */  
  function updateOptions(settings){

    showFullUrl = Boolean(settings.showFullUrl);
    
    separatorString = settings.separatorString;
         
    // Only run the update on change, set inside to prevent additional variable declaration
    if(showFieldAttributes !== settings.showFieldAttributes){
    
      showFieldAttributes = Boolean(settings.showFieldAttributes);
      
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
    
  }
  
  
  /**
	 * The "main" function for the module, used for the first setup of the extension
	 *
	 */  
  function init(){

    //Set the original title during init, not as global declaration
		originalTitle = '' + document.title;
    
		// Manually ensure preferences are loaded first time after setup to ensure it runs
		getOptions();

		// Add listeners and Observers
		addWindowListeners();
		observeForTitleChanges();
    
  }

  /**
	 * Modifies the window title based upon the user's preferences.
	 *
	 * @param {boolean} useOriginalTitle - Prevents accidental duplication of title content
	 * after the add-on has added some information. Defaults to false unless explicitly 
	 * set true as needed throughout the add-on.
	 */
	function setTitle(useOriginalTitle) {
		
		// Default parameter value check
		useOriginalTitle = typeof useOriginalTitle !== 'undefined' ? useOriginalTitle : false;
			
		if(showFullUrl === false){
			// Add a trailing slash after the hostname for security e.g., given 
			// a malicious hostname like: "google.com-evilsite.com/" 
			// will not match KeePass rule for "google.com/"
			addedUrl = document.location.hostname + '/';
		}else{
			addedUrl = document.URL;
		}
		
		// Used in observer to prevent unnecessary additional calls
		lastTitleSetByAddon = true; 
		
		// if     : force the original title to prevent duplications
		// if else: if the URL is not already added, then add it
		//    else: do nothing, the URL is already present and should not be added again
		if(useOriginalTitle === true){ 
			document.title = titleFormatter(originalTitle);
		}else if(document.title.indexOf( sanitizer(addedUrl) ) < 0){
			document.title = titleFormatter(document.title);
		}
    
	};

	/**
	 * Formats the new string that will be set in setTitle
	 *
	 * @param {string} title - Either the original or current title, set by setTitle()
	 * @returns {string} Formatted string to replace the existing window title
	 */
	function titleFormatter(title) {
    //maybe just sanitize on title and URL, Can I trust my inputField Attributes?
		let newTitle = [sanitizer(title), separatorString, sanitizer(addedUrl) , currentInputFieldAttributes].join(' ');

		return newTitle;
	};  
  

  /**
	 * Sanitizes a given input string to remove angle brackets, html encoded 
   * angle brackets, etc. Additional checks may, .e.g, UTF-8 special characters
   * may be added in the future
   *
   * The title may be read by JavaScript as part of later processing, special 
   * characters may trigger dom-based XSS. The web page's own code should be
   * checking, but remove some things which have a very unlikely chance of
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
   * @todo Consider replacing with HTML entity encoding since this will just go inside of a <title /?> tag ultimately, e.g. https://github.com/mathiasbynens/he/blob/master/he.js
	 * @param {string} unfiltered - Any text string which may contain <, >, %3C, etc.
	 * @returns {string} A string which has had been filtered to limit later XSS
   * @see {@link http://www.justarrangingbits.org/firefox-magic-decoding-address-bar/index.html|FireFox Address Bar} and notice how even if it is not encoded in the addressbar, the add-on will show it encoded when its put in the title   
   
	 */
  function sanitizer(unfiltered) {
    
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
	function forceInitialFocus() {
		
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
	function addWindowListeners() {
		window.addEventListener('hashchange', OnHashChangeForAUTT);	
	};
 
	/**
	 * Reset the title if the URL's hash changes, may change without the page being 
	 * reloaded (e.g., update by javascript) and the hash may be important for 
	 * pattern matching in the title
	 *
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window.onhashchange|HashChange} at MDN
	 */
	function OnHashChangeForAUTT(event) {
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
	function observeForTitleChanges() {

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

	var config = { attributes: true, childList: true, characterData: true, subtree: true };
		// in theory, the selector should be head > title, but some in some webpages with broken
		// HTML the title tag is automatically moved to the body by the browser, and changes to it
		// still change the actual website title. the title element also cannot validly appear
		// anywhere else, so just selecting title is fine
		var target = document.querySelector('title'); 

		// Only run the observer on tabs that have a <title /> (e.g., not about:blank)
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
	function updateShowFieldAttributesSettings(enableInputListeners) {

		//if no option is specified, use the global setting; useful for detach cleanup
    //this may no longer be needed since we no longer need to worry about cleanup
		enableInputListeners = typeof enableInputListeners !== 'undefined' ? enableInputListeners : showFieldAttributes;
		
		var inputFields = document.querySelectorAll('input');
		
		for (let i = 0; i < inputFields.length; ++i) {
			
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
	 * title. So ensure that the element still has the cursor event when the 
	 * window goes to background (Important for KeePass window matching).
	 *
	 * @summary Update the window title when the input field is no longer active
	 */
	function OnInputBlurForAUTT(event) {
			
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
	function OnInputFocusForAUTT(event) {

		var currentInputName = this.getAttribute('name');
		var currentInputId = this.getAttribute('id');

		currentInputFieldAttributes = [ '[Input Name: "', 
                                    sanitizer(currentInputName),
                                    '"] [Input ID: "',
                                    sanitizer(currentInputId),
                                    '"]'
                                  ].join('');

		setTitle(true);
					
		// Add the blur event only after it is focused to save resources
		this.addEventListener('blur', OnInputBlurForAUTT);

	};
	
  
  
  return {  
      getOptions: getOptions,
      init: init
  };    

})(); 

//START the function
addUrlToWindowTitle.init();


/**
 * Listens for changes to the extensions options and calls functions to update base on new values
 * @see {@https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/onChanged runtime.onChange} documentation for more information
 */
browser.storage.onChanged.addListener( function(changes, areaName){
  addUrlToWindowTitle.getOptions();
});
  
  