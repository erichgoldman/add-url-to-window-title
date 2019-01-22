# Add URL To Window Title

This add-on is designed to add information about the current web page to the browser window's title. The add-on was initially designed to facilitate usage of the KeePass's auto-type feature on logon forms, but can likely be used with other password managers or for other purposes where another application needs to monitor the details about the current page opened in a browser (e.g., web development debugging and pen testing).


## Features

In its most basic usage, this add-on will add the full URL of the current web page running in the active tab of a given browser window. Optionally, the user can configure the addon to only add the hostname. 
There is also an option which will monitor for when an input or password field is selected and will then add the `id` and `name` attributes, in addition to the full URL or hostname, to the window title. This is to provide further granularity for [auto-type rules](http://keepass.info/help/base/autotype.html), and is useful for many reasons, such as:
  
  - Ensure that [you do not start auto-type in a search field which automatically received focus](https://github.com/erichgoldman/add-url-to-window-title/wiki/About---Show-field-attributes-when-a-text-input-field-has-focus#security-note-1) instead of the input field for username or password

  - Helps create distinct auto-type rules for the username/email field versus the password, which is often needed for two-step logons  


## Why did I create this extension?

I am an avid user of [KeePass](http://www.keepass.info/ "KeePass Home Page") for managing my passwords at various website. In order to simplify using my credentials from KeePass, I usually try to use KeePass's [auto-type feature](http://keepass.info/help/base/autotype.html "Explanation of how the Auto-Type feature in KeePass works"). Auto-type depends upon the window's title. For most websites, the title is unique enough to create a matching rule in KeePass. However, some websites simply set the title "Sign In" or similar. In addition, many sites now use two-page or two-step sign-ins, but may not change or update the page's title, further complicating the usage of auto-type.

While there are plugins that can integrate KeePass more directly with the browser, from a security standpoint I prefer auto-type because it keeps the browser and KeePass separate. Using a browser plugin to read directly from KeePass may allow browser flaws to be used to compromise KeePass. I also find auto-type to be easier to configure and more portable. 

  

## Using this extension directly from source

No external libraries are used for this extension and all code is vanilla JavaScript.

To load a local version, follow the docs [to load local extension](https://developer.chrome.com/extensions/faq#faq-dev-01)

As a regular user, you can install the [Chrome Webstore](https://chrome.google.com/webstore/detail/add-url-to-window-title/ndiaggkadcioihmhghipjmgfeamgjeoi) version if you use Chrome, Vivaldi, or similar Chromium based browser. This extension also works in Firefox and can be installed from the [Firefox Add-Ons Directory](https://addons.mozilla.org/en-US/firefox/addon/add-url-to-window-title/).



## Running the tests

To test that the extension is properly updating the window title value (i.e., the `<title />` field), we use Katalon Recorder to run simulated navigation scenarios and check that values are updated as we expect. To learn more about how to run the tests and how to create your own, visit the [README](/tests/katalon-recorder/README.md) in the `katalon-recorder` tests folder.

We are exploring migration to selenium web driver and CI via Travis. If you have some experience with this type of testing and would like to help, please open an issue to discuss. 


## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

We are actively looking for contributors to create translations. You can generate a pull request with a new locale and translate [`messages.json`](_locales/en/messages.json) from the "en" locale. You can learn more about the internationalization process for chrome extensions in the [`chrome.i18n documentation`](https://developer.chrome.com/extensions/i18n).



## Help and Documentation

Please visit the [wiki on GitHub](https://github.com/erichgoldman/add-url-to-window-title/wiki) for documentation.

If you encounter issues or have general questions about functionality, please open an [issue on GitHub](https://github.com/erichgoldman/add-url-to-window-title/issues/new).

Some documentation may reflect an older version of this extension. We are making efforts to update as needed and record new videos. Should you see a major problem, broken link, please [open an issue](https://github.com/erichgoldman/add-url-to-window-title/issues/new) and we will work to remediate.


## Donate and Support

Please rate and leave feedback on the [Chrome Webstore](https://chrome.google.com/webstore/), [Firefox Add-Ons Directory](https://addons.mozilla.org/en-US/firefox/addon/add-url-to-window-title/), star it on GitHub, share with your friends, blog about it, etc.

If you find this extension useful and it saved you some time, please help support development by donating $2.22 USD:

  - [Donate via PayPal Pool](https://www.paypal.com/pools/c/8799nHVefv)
  - Donate via Bitcoin (BTC): [38BgwZpgTGpBBSLLEhuBxy6CsjdKUsEaN3](https://www.blockchain.com/btc/address/38BgwZpgTGpBBSLLEhuBxy6CsjdKUsEaN3)
  - Donate via Ethereum (ETH): [0x802dC14dB6B43571026683846ca22212e82F25b7](https://ethplorer.io/address/0x802dc14db6b43571026683846ca22212e82f25b7) 

No money? Feel free to send a thank you note, drawing, etc. You can also support the continued development of this extension by helping with [translations](#contributing) and [reporting any issues or problems](https://github.com/erichgoldman/add-url-to-window-title/issues/).

## Versioning

We use [SemVer](http://semver.org/) for versioning. 



## License

This project is licensed under the GPLv3 License - see the [LICENSE.txt](LICENSE.txt) file for details.

