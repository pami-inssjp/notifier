
0.1.3 / 2014-12-07
==================

 * Add German, Dutch and Portuguese translations
 * Remove 'DemocracyOS' from mail subjects
 * Fix existing translations
 * Add PORT variable to config

0.1.2 / 2014-12-04
==================

 * remove unneeded data from argument-replies flow #9
 * update codebase to version 0.1.0 of likeastore/notifier

0.1.1 / 2014-12-01
==================

 * Add support for notifying 'law-published' and fix 'reply-comment'. Closes #17
 * Update texts for 'reply-argument' event and template
 * Notify user on reply argument only if he has enabled it in their notifications preferences #7
 * Add reply-argument notification
 * Add 'resend-validation-email' handler, as it's the same as the 'signup' one
 * Refactor app.js and make event handling logic self-contained
 * Add basic app.js
 * Update README.md with description on collection name aliasing
 * Add debug dep and update makefile
 * Add support for aliasing db collection names
 * Add flexibility for 'name' property definition in users
 * Fetch port optionally from config file
 * Fix mail template not escaping HTML
 * Update welcome-email subject and tempalte
 * Update welcome-email template and translations
 * Add translations engine
 * Fix template vars usage to be uncoupled from mandrill
 * Fix welcome flow
 * Add basic templates
 * Add dev settings to `.gitignore`
