// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/chromeos/dbus/chrome_display_power_service_provider_delegate.h"

#include "ash/shell.h"
#include "ui/display/chromeos/display_configurator.h"
#include "ui/wm/core/user_activity_detector.h"

namespace chromeos {

ChromeDisplayPowerServiceProviderDelegate::
ChromeDisplayPowerServiceProviderDelegate() {
}

ChromeDisplayPowerServiceProviderDelegate::
~ChromeDisplayPowerServiceProviderDelegate() {
}

void ChromeDisplayPowerServiceProviderDelegate::SetDisplayPower(
    DisplayPowerState power_state) {
  // Turning displays off when the device becomes idle or on just before
  // we suspend may trigger a mouse move, which would then be incorrectly
  // reported as user activity.  Let the UserActivityDetector
  // know so that it can ignore such events.
  wm::UserActivityDetector::Get()->OnDisplayPowerChanging();

  ash::Shell::GetInstance()->display_configurator()->SetDisplayPower(
      power_state, ui::DisplayConfigurator::kSetDisplayPowerNoFlags);
}

void ChromeDisplayPowerServiceProviderDelegate::SetDimming(bool dimmed) {
  ash::Shell::GetInstance()->SetDimming(dimmed);
}

}  // namespace chromeos
