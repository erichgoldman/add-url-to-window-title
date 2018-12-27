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
 * @module disposableEmailHelper
 */
var addUrlToWindowTitleOptions = (function() {
  
  
  /*
   * Main entry function run when the script is loaded
   */
  function start(){
    
    loadI18n();
    restoreOptions();
    
  }

  /**
   * Stores the user selected options into storage 
   */
  function saveOptions() {
    
    var showFullUrl = document.getElementById('showFullUrl').checked || false;
    
    var showFieldAttributes = document.getElementById('showFieldAttributes').checked || false;
    
    //TO Do: some type of filtering of this value
    var separatorString = document.getElementById('separatorString').value || "-";
    
    chrome.storage.sync.set({
      showFullUrl: showFullUrl,
      showFieldAttributes: showFieldAttributes,
      separatorString: separatorString
    }, function(){
             
      var status = document.getElementById('status');

      status.style.display = 'inherit';

      /*
       * Display the success message `<div />` temporarily after the settings are succesfully saved
       */
      setTimeout(function() {
        status.style.display = 'none';
      }, 2500);
      
    });
    
  }

  /**
   * Loads the saved options from storage and sets the options in HTML appropriately. 
   */
  function restoreOptions() {
        
    chrome.storage.sync.get({
      showFullUrl:false,
      showFieldAttributes: false,
      separatorString: "-"
    }, function(items) {
   
      document.getElementById('showFullUrl').checked = items.showFullUrl;
      
      document.getElementById('showFieldAttributes').checked = items.showFieldAttributes;
            
      document.getElementById('separatorString').value = items.separatorString;
      
    });
    
  }
  
  
  /**
   * Translate the text in divs in the HTML. Load internationalization from `_locales`.
   * @see {#https://developer.chrome.com/extensions/i18n#method-getMessage}
   */
  function loadI18n(){
    
    //TODO: update for this extension
    i18nElements = [
      'optionsSectionHeader', 
      'optionsShowFullUrlHeader', 'optionsShowFullUrlText', 'optionsShowFullUrlHelp',
      'optionsSeparatorStringHeader', 'optionsSeparatorStringHelp',
      'optionsShowFieldAttributesHeader', 'optionsShowFieldAttributesText', 'optionsShowFieldAttributesHelp', 
      'optionsSaveButtonText', 'optionsSavedHeader', 'optionsSavedMessage',
      'optionsDonateLinkText','optionsHelpLinkText'
      ];

    i18nElements.forEach(function(elementId) {
      document.getElementById(elementId).innerHTML = chrome.i18n.getMessage(elementId);  
    });  
    
  }
  
  /*
   *  Expose functions outside of module so they can be called by listeners, etc. 
   */  
  return {    
      start: start, 
      saveOptions: saveOptions,
  }; 
  

})();  
 
/**
 * Wait for HTML to load, then initiate the script
 */
document.addEventListener('DOMContentLoaded', addUrlToWindowTitleOptions.start );


/**
 * Save the user's changed when the user explicitly saves
 */
document.getElementById('optionsSaveButtonText').addEventListener('click', addUrlToWindowTitleOptions.saveOptions );
