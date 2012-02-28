// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This view displays controls for capturing network events.
 */
var CaptureView = (function() {
  'use strict';

  // We inherit from DivView.
  var superClass = DivView;

  /**
   * @constructor
   */
  function CaptureView() {
    assertFirstConstructorCall(CaptureView);

    // Call superclass's constructor.
    superClass.call(this, CaptureView.MAIN_BOX_ID);

    var byteLoggingCheckbox = $(CaptureView.BYTE_LOGGING_CHECKBOX_ID);
    byteLoggingCheckbox.onclick =
        this.onSetByteLogging_.bind(this, byteLoggingCheckbox);

    $(CaptureView.TIP_ANCHOR_ID).onclick =
        this.toggleCommandLineTip_.bind(this, CaptureView.TIP_DIV_ID);

    if (byteLoggingCheckbox.checked) {
      // The code to display a warning on ExportView relies on bytelogging
      // being off by default. If this ever changes, the code will need to
      // be updated.
      throw 'Not expecting byte logging to be enabled!';
    }
  }

  // ID for special HTML element in category_tabs.html
  CaptureView.TAB_HANDLE_ID = 'tab-handle-capture';

  // IDs for special HTML elements in capture_view.html
  CaptureView.MAIN_BOX_ID = 'capture-view-tab-content';
  CaptureView.BYTE_LOGGING_CHECKBOX_ID = 'capture-view-byte-logging-checkbox';
  CaptureView.TIP_ANCHOR_ID = 'capture-view-tip-anchor';
  CaptureView.TIP_DIV_ID = 'capture-view-tip-div';

  cr.addSingletonGetter(CaptureView);

  CaptureView.prototype = {
    // Inherit the superclass's methods.
    __proto__: superClass.prototype,

    /**
     * Toggles the visilibity on the command-line tip.
     */
    toggleCommandLineTip_: function(divId) {
      var n = $(divId);
      var isVisible = n.style.display != 'none';
      setNodeDisplay(n, !isVisible);
      return false;  // Prevent default handling of the click.
    },

    /**
     * Called when a log file is loaded, after clearing the old log entries and
     * loading the new ones.  Returns false to indicate the view should
     * be hidden.
     */
    onLoadLogFinish: function(data) {
      return false;
    },

    /**
     * Depending on the value of the checkbox, enables or disables logging of
     * actual bytes transferred.
     */
    onSetByteLogging_: function(byteLoggingCheckbox) {
      if (byteLoggingCheckbox.checked) {
        g_browser.setLogLevel(LogLevelType.LOG_ALL);

        // Once we enable byte logging, all bets are off on what gets captured.
        // Have the export view warn that the "strip cookies" option is
        // ineffective from this point on.
        //
        // In theory we could clear this warning after unchecking the box and
        // then deleting all the events which had been captured. We don't
        // currently do that; if you want the warning to go away, will need to
        // reload.
        ExportView.getInstance().showPrivacyWarning();
      } else {
        g_browser.setLogLevel(LogLevelType.LOG_ALL_BUT_BYTES);
      }
    }
  };

  return CaptureView;
})();
