// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "components/keyed_service/content/refcounted_browser_context_keyed_service_factory.h"

#include "base/logging.h"
#include "base/prefs/pref_service.h"
#include "components/keyed_service/content/browser_context_dependency_manager.h"
#include "components/keyed_service/core/refcounted_keyed_service.h"
#include "components/pref_registry/pref_registry_syncable.h"
#include "components/user_prefs/user_prefs.h"
#include "content/public/browser/browser_context.h"

void RefcountedBrowserContextKeyedServiceFactory::SetTestingFactory(
    content::BrowserContext* context,
    TestingFactoryFunction testing_factory) {
  RefcountedKeyedServiceFactory::SetTestingFactory(
      context,
      reinterpret_cast<RefcountedKeyedServiceFactory::TestingFactoryFunction>(
          testing_factory));
}

scoped_refptr<RefcountedKeyedService>
RefcountedBrowserContextKeyedServiceFactory::SetTestingFactoryAndUse(
    content::BrowserContext* context,
    TestingFactoryFunction testing_factory) {
  return RefcountedKeyedServiceFactory::SetTestingFactoryAndUse(
      context,
      reinterpret_cast<RefcountedKeyedServiceFactory::TestingFactoryFunction>(
          testing_factory));
}

RefcountedBrowserContextKeyedServiceFactory::
    RefcountedBrowserContextKeyedServiceFactory(
        const char* name,
        BrowserContextDependencyManager* manager)
    : RefcountedKeyedServiceFactory(name, manager) {
}

RefcountedBrowserContextKeyedServiceFactory::
    ~RefcountedBrowserContextKeyedServiceFactory() {
}

scoped_refptr<RefcountedKeyedService>
RefcountedBrowserContextKeyedServiceFactory::GetServiceForBrowserContext(
    content::BrowserContext* context,
    bool create) {
  return RefcountedKeyedServiceFactory::GetServiceForContext(context, create);
}

content::BrowserContext*
RefcountedBrowserContextKeyedServiceFactory::GetBrowserContextToUse(
    content::BrowserContext* context) const {
  DCHECK(CalledOnValidThread());

#ifndef NDEBUG
  AssertContextWasntDestroyed(context);
#endif

  // Safe default for Incognito mode: no service.
  if (context->IsOffTheRecord())
    return nullptr;

  return context;
}

void RefcountedBrowserContextKeyedServiceFactory::
    RegisterUserPrefsOnBrowserContextForTest(content::BrowserContext* context) {
  KeyedServiceBaseFactory::RegisterUserPrefsOnContextForTest(context);
}

bool RefcountedBrowserContextKeyedServiceFactory::
    ServiceIsCreatedWithBrowserContext() const {
  return KeyedServiceBaseFactory::ServiceIsCreatedWithContext();
}

bool RefcountedBrowserContextKeyedServiceFactory::ServiceIsNULLWhileTesting()
    const {
  return KeyedServiceBaseFactory::ServiceIsNULLWhileTesting();
}

void RefcountedBrowserContextKeyedServiceFactory::BrowserContextShutdown(
    content::BrowserContext* context) {
  RefcountedKeyedServiceFactory::ContextShutdown(context);
}

void RefcountedBrowserContextKeyedServiceFactory::BrowserContextDestroyed(
    content::BrowserContext* context) {
  RefcountedKeyedServiceFactory::ContextDestroyed(context);
}

scoped_refptr<RefcountedKeyedService>
RefcountedBrowserContextKeyedServiceFactory::BuildServiceInstanceFor(
    base::SupportsUserData* context) const {
  return BuildServiceInstanceFor(
      static_cast<content::BrowserContext*>(context));
}

bool RefcountedBrowserContextKeyedServiceFactory::IsOffTheRecord(
    base::SupportsUserData* context) const {
  return static_cast<content::BrowserContext*>(context)->IsOffTheRecord();
}

user_prefs::PrefRegistrySyncable*
RefcountedBrowserContextKeyedServiceFactory::GetAssociatedPrefRegistry(
    base::SupportsUserData* context) const {
  PrefService* prefs = user_prefs::UserPrefs::Get(
      static_cast<content::BrowserContext*>(context));
  user_prefs::PrefRegistrySyncable* registry =
      static_cast<user_prefs::PrefRegistrySyncable*>(
          prefs->DeprecatedGetPrefRegistry());
  return registry;
}

base::SupportsUserData*
RefcountedBrowserContextKeyedServiceFactory::GetContextToUse(
    base::SupportsUserData* context) const {
  return GetBrowserContextToUse(static_cast<content::BrowserContext*>(context));
}

bool RefcountedBrowserContextKeyedServiceFactory::ServiceIsCreatedWithContext()
    const {
  return ServiceIsCreatedWithBrowserContext();
}

void RefcountedBrowserContextKeyedServiceFactory::ContextShutdown(
    base::SupportsUserData* context) {
  BrowserContextShutdown(static_cast<content::BrowserContext*>(context));
}

void RefcountedBrowserContextKeyedServiceFactory::ContextDestroyed(
    base::SupportsUserData* context) {
  BrowserContextDestroyed(static_cast<content::BrowserContext*>(context));
}

void RefcountedBrowserContextKeyedServiceFactory::RegisterPrefs(
    user_prefs::PrefRegistrySyncable* registry) {
  RegisterProfilePrefs(registry);
}
