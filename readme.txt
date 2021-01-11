=== List Field Number Format for Gravity Forms ===
Contributors: ovann86
Donate link: https://www.itsupportguides.com/donate/
Tags: Gravity Forms, forms, online forms, select, list, numbers, math
Requires at least: 5.0
Tested up to: 5.1
Stable tag: 1.6.5
License: GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Turn your list field columns into repeatable number fields

== Description ==

> This plugin is an add-on for the Gravity Forms plugin. If you don't yet own a license for Gravity Forms - <a href="https://rocketgenius.pxf.io/dbOK" target="_blank">buy one now</a>! (affiliate link)

**What does this plugin do?**

* make a list field column accept only numbers
* specify the format of the number including currency, comma delimited (9,999), dot delimited (9.999) and no formatting (9999)
* specify the rounding type - round up, round down or round closest
* specify the decimal places to round to - no rounding, 0, 1, 2, 3, 4, 5
* force the number to use fixed placed notation - e.g. 10.1 would become 10.10 with 2 place fixed notation
* add a column total - automatically display the total of the column
* specify a range requirement - this can be a set number, e.g. 200 or a formula, e.g. column 1 + column 2
* calculate column values uing a formula (e.g. field = column 1 + column 2)
* compatible with <a href="https://github.com/richardW8k/RWListFieldCalculations/blob/master/RWListFieldCalculations.php">Gravity Forms List Field Calculations Add-On</a>
* compatible with <a href="https://wordpress.org/plugins/gravity-forms-pdf-extended/">Gravity PDF</a>

> See a demo of this plugin at [demo.itsupportguides.com/list-field-number-format-for-gravity-forms/](https://demo.itsupportguides.com/list-field-number-format-for-gravity-forms/ "demo website")

**How to I use the plugin?**

Simply install and activate the plugin - no configuration required.

Open your Gravity Form, edit a 'List' field and use the 'Number Format' options to configure the columns.

**Have a suggestion, comment or request?**

Please leave a detailed message on the support tab.

**Let me know what you think**

Please take the time to review the plugin. Your feedback is important and will help me understand the value of this plugin.

**Disclaimer**

*Gravity Forms is a trademark of Rocketgenius, Inc.*

*This plugins is provided “as is” without warranty of any kind, expressed or implied. The author shall not be liable for any damages, including but not limited to, direct, indirect, special, incidental or consequential damages or losses that occur out of the use or inability to use the plugin.*

*Note: When Gravity Forms isn't installed and you activate this plugin we display a notice that includes an affiliate link to their website.*

== Installation ==

1. Install plugin from WordPress administration or upload folder to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in the WordPress administration
1. Open the Gravity Forms 'Forms' menu
1. Open the forms editor for the form you want to change
1. Add or open an existing list field
1. With multiple columns enabled you will see a 'Number Format' section - here you can choose which columns are number fields.

== Frequently Asked Questions ==

**How do I base a calculation from a drop down (select) field?**

This plugin is capable of making calculations across a row using drop down (select) fields.

To do this you first need to set a column in the list field as a drop down - I suggest you use the <a href="https://wordpress.org/plugins/gravity-forms-list-field-select-drop-down/">Drop Down Options in List Fields for Gravity Forms plugin</a> for this.

You then need to make sure the VALUE (not the text label) for the drop down is or contains the number for the calculation.

Once you have done this simply 'number enable' the column and setup the total calculation for the destination column.

== Screenshots ==

1. Shows the number format options in the forms editor.

== Changelog ==

= 1.6.5 =
*Fix: resolve conflict with Gutenberg - adding form using a shortcode would give an error message

= 1.6.4 =
*Fix: resolve issue with not being able to add new list rows in wp-admin entry editor

= 1.6.3 =
*Fix: resolve issue with column total appearing when column was previous 'number enabled'
*Fix: resolve issue with single column list field 'Enable Column Total' not displaying the set state

= 1.6.2 =
*Fix: resolve error when submit 'Warning: A non-numeric value encountered in list-field-number-format-for-gravity-forms/list-field-number-format-for-gravity-forms.php on line 590'

= 1.6.1 =
* Fix: resolve issue with column total not display in wp-admin entry view

= 1.6.0 =
* Feature: add no formatting (9999) option - e.g. a year "2019"
* Fix: number preview in form edit wasnt applying the correct formatting

= 1.5.1 =
* Fix: resolve issue with the total row not calculating in the backend entry editor.
* Maintenance: resolve 'undefined index' error message when debug is enabled.

= 1.5.0 =
* Feature: add support for pre-filled list fields (gform_field_value_ filter)

= 1.4.4 =
* Fix: Resolve issue with column totals repeating/cascading in entry detail and emails.

= 1.4.3 =
* Fix: Resolve issue with blank row being added to list field when viewing entry details.

= 1.4.2 =
* Fix: Improve Gravity Flow support - allow Gravity Flow to output the correct value/format depending on the form editable status.

= 1.4.1 =
* Fix: Resolve compatibility issue with <a href="https://github.com/richardW8k/RWListFieldCalculations/blob/master/RWListFieldCalculations.php">Gravity Forms List Field Calculations Add-On</a>. If a list field had multiple total rows and the columns were being used to calculate separate number fields - the calculation would include the total column value.

= 1.4.0 =
* Feature: add ability to base calculations off of drop down (select) fields in list field row. See plugin FAQ for more information.

= 1.3.8 =
* Fix: resolve conflict with <a href="https://en-au.wordpress.org/plugins/gravity-forms-list-field-select-drop-down/" target="_blank">Drop Down Options in List Fields for Gravity Forms</a> plugin

= 1.3.7 =
* Maintenance: improve JavaScript to better handle calculations that include values coming from non-list fields.

= 1.3.6 =
* Fix: resolve conflict with <a href='https://en-au.wordpress.org/plugins/ajax-upload-for-gravity-forms/'>Ajax Upload for Gravity Forms</a> plugin (PDF would not display correctly when a list field contained both an 'Ajax Upload' column and a 'number format' column.

= 1.3.5 =
* Maintenance: change how plugin checks for Gravity Forms being installed and active

= 1.3.4 =
* Fix: resolve 'Fatal error: Can’t use function return value in write context' error message for older versions of PHP (5.4 or earlier)

= 1.3.3 =
* Fix: improve validation for 'max' and 'min'
* Fix: add Gravity PDF support for 'number enabled' single column list fields

= 1.3.2 =
* Maintenance: improve validation for French notation numbers (9.999,99)

= 1.3.1 =
* Fix: resolve 'undefined variable' error on submitting form.

= 1.3.0 =
* Fix: resolve issue with total column repeating if there are multiple total columns in a list field
* Maintenance: improve how rounding and fixed point notation is handled in JavaScript and PHP

= 1.2.0 =
* Feature: allow calculations to be made from standard Gravity Forms number fields in addition to list field column fields
* Fix: resolve issue that stopped negative values from being used, for example -50 would be treated as 50
* Maintenance: improve support for 'ABN Lookup for Gravity Forms' plugin

= 1.1.8 =
* Maintenance: improve support for 'Sortable List Fields for Gravity Forms' plugin

= 1.1.7 =
* Fix: JavaScript improvements.

= 1.1.6 =
* Fix: Improve JavaScript in entry editor.

= 1.1.5 =
* Fix: Change how field id is determined to improve compatibility with all versions of Gravity Forms.

= 1.1.4 =
* Fix: Resolve issue with row calculations based on French notation numbers (9.999,99).
* Fix: Resolve issue field format not correctly setting when new row is added.

= 1.1.3 =
* Fix: Improve support for tables inside of field descriptions.

= 1.1.2 =
* Fix: Resolve issue with range instructions appearing in total row/column if both range instructions (e.g. Number must be between x and x) and total column enabled.
* Fix: Resolve 'undefined variable' error when submitting a form that does not include a total column.

= 1.1.1 =
* Fix: Improve support for older versions of PHP (version 5.3) "Parse error: syntax error, unexpected ["

= 1.1.0 =
* Feature: calculate column values uing a formula (e.g. field = column 1 + column 2)
* Feature: display column total - column total is automatically calculated and displayed below
* Feature: set a range value for given column - this can be a specific value (e.g. 200) or a formula (e.g. column 1 * column 2)
* Feature: add client-side and server-side range validation
* Feature: ability to hide range instructions (e.g. 'must be more than 200')
* Feature: add client-side and server-side validation for number enabled fields - this enures submitted values are in the correct format
* Maintenance: increment minimum Gravity Forms version to 1.9.15
* Maintenance: add CSS classes to number enabled fields and inputs to help with applying CSS
* Maintenance: right-align text in number enabled inputs
* Maintenance: add warning message if Gravity Forms is not installed and enabled
* Maintenance: formatting and styling updates to options in form editor

= 1.0.1 =
* Fix: change short PHP open tags to full
* Fix: resolve issue with single number format field not updating options when number format changes

= 1.0 =
* First public release.