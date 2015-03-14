# Add URL to Window Title

*Requires Firefox 30 or higher*

## Overview
This add-on is designed to add information about the current web page to the Browser Window's title. The add-on was initially designed to facilitate usage of the KeePass's auto-type feature on logon forms, but can likely be used with other password managers or for other purposes where another application needs to monitor the details about the current page opened in a browser (e.g., web development debugging and pen testing).

In its most basic usage, this add-on will add the full URL of the current web page running in the active tab of a given browser window. Optionally, the user can configure the addon to only add the hostname. 

There is also an option which will monitor for when an input or password field is selected and will then add the `id` and `name` attributes, in addition to the full URL or hostname, to the window title. This is to provide further granularity for [auto-type rules](http://keepass.info/help/base/autotype.html), and is useful for many reasons, such as:

- Ensure that you do not start auto-type in a search field which automatically received focus instead of the input field for username or password
- Helps create distinct auto-type rules for the username/email field versus the password, which is often needed for two-step logons  

## Help, Support, and Documentation
The full help files and documentation can be found on the [add-on's home page](https://github.com/erichgoldman/add-url-to-window-title "Homepage on GitHub") and in the [project's wiki](https://github.com/erichgoldman/add-url-to-window-title/wiki "Wiki in Github"). If you are looking for support, please [report at GitHub](https://github.com/erichgoldman/add-url-to-window-title/issues "Issue Tracker on GitHub") and not on the Add-on's Directory as it is not possible to have a conversation there. The home page has some tutorials and videos to help you understand how to use the plugin and maximize your auto-type usage.

If you want to use Auto-Type with the `<input />` field attributes option, you must **disable** the option `Cancel auto-type when the target window title changes.` in your KeePass Options, under the advanced tab. Learn more [in the wiki](https://github.com/erichgoldman/add-url-to-window-title/wiki/Using-the-%22Show-field-attributes-when-a-text-input-field-has-focus%3F%22-Option).

-------

Please note the official release on the Mozilla Directory is signed, if you received a compiled `.xpi` file which is not signed and you receive a "author not verified" message when installing, this is not an official or trusted version. Source code is heavily documented and available on [GitHub](https://github.com/erichgoldman/add-url-to-window-title "GitHub Repo for this add-on") (GPL 2.0+).


## Background

I am an avid user of [KeePass](http://www.keepass.info/ "KeePass Home Page") for managing my passwords at various website. In order to simplify using my credentials from KeePass, I usually try to use KeePass's [auto-type feature](http://keepass.info/help/base/autotype.html "Explanation of how the Auto-Type feature in KeePass works"). Auto-type depends upon the window's title. For most websites, the title is unique enough to create a matching rule in KeePass. However, some websites simply set the title "Sign In" or similar. In addition, many sites now use two-page or two-step sign-ins, but may not change or update the page's title, further complicating the usage of auto-type.

While there are plugins that can integrate KeePass more directly with the browser, from a security standpoint I prefer auto-type because it keeps the browser and KeePass separate. Using a browser plugin to read directly from KeePass may allow browser flaws to be used to compromise KeePass. I also find auto-type to be easier to configure and more portable. 


## How you can help

If you enjoy this add-on and find it useful, then please leave a rating and feedback on the Mozilla Add-on Directory. However, if you have bug reports or issue requests, please report them directly on GitHub so they can be tracked. If you like this add-on please tell your friends and share on your social media of choice.

If you have an enhancement or want to add a new feature, feel free to clone and issue a pull request. 

Even if you don't know how to code, please take a look at any issues or enhancements suggested to see if you share the original poster's thoughts or if you can replicate the original poster's issue.

If you really like this add-on, feel free to send me a donation or to send me a drawing, love letter, etc. if you can't spare the change. If you are using this with KeePass, then you should definitely [provide a financial contribution to help keep the project active](http://keepass.info/donate.html "KeePass donation page").
