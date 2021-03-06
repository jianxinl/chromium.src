// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef EXTENSIONS_BROWSER_TEST_EXTENSION_REGISTRY_OBSERVER_H_
#define EXTENSIONS_BROWSER_TEST_EXTENSION_REGISTRY_OBSERVER_H_

#include "base/scoped_observer.h"
#include "extensions/browser/extension_registry_observer.h"

namespace extensions {
class ExtensionRegistry;

// A helper class that listen for ExtensionRegistry notifications.
class TestExtensionRegistryObserver : public ExtensionRegistryObserver {
 public:
  explicit TestExtensionRegistryObserver(ExtensionRegistry* registry,
                                         const std::string& extension_id);
  ~TestExtensionRegistryObserver() override;

  void WaitForExtensionWillBeInstalled();
  void WaitForExtensionUninstalled();
  void WaitForExtensionLoaded();
  void WaitForExtensionUnloaded();

 private:
  class Waiter;

  // ExtensionRegistryObserver.
  void OnExtensionWillBeInstalled(content::BrowserContext* browser_context,
                                  const Extension* extension,
                                  bool is_update,
                                  bool from_ephemeral,
                                  const std::string& old_name) override;
  void OnExtensionUninstalled(content::BrowserContext* browser_context,
                              const Extension* extension,
                              extensions::UninstallReason reason) override;
  void OnExtensionLoaded(content::BrowserContext* browser_context,
                         const Extension* extension) override;
  void OnExtensionUnloaded(content::BrowserContext* browser_context,
                           const Extension* extension,
                           UnloadedExtensionInfo::Reason reason) override;

  scoped_ptr<Waiter> will_be_installed_waiter_;
  scoped_ptr<Waiter> uninstalled_waiter_;
  scoped_ptr<Waiter> loaded_waiter_;
  scoped_ptr<Waiter> unloaded_waiter_;

  ScopedObserver<ExtensionRegistry, ExtensionRegistryObserver>
      extension_registry_observer_;

  std::string extension_id_;

  DISALLOW_COPY_AND_ASSIGN(TestExtensionRegistryObserver);
};

}  // namespace extensions

#endif  // EXTENSIONS_BROWSER_TEST_EXTENSION_REGISTRY_OBSERVER_H_
