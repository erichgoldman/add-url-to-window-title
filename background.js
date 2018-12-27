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
 * When the extension is installed initially, populate the default variables for the options on first install ONLY
 * @see {@https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/onInstalled runtime.onInstalled} documentation for more information
 */
browser.runtime.onInstalled.addListener(function(details){
  
  if(details.reason == "install"){
    console.log("Installed, version: " + browser.runtime.getManifest().version);   
  }else if(details.reason == "update"){
    console.log("Updated from " + details.previousVersion + " to " + browser.runtime.getManifest().version + "!"); 
  }
  
});  


