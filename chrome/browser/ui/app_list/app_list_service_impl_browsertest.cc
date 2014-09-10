// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/app_list/app_list_service_impl.h"

#include "base/prefs/pref_service.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/ui/app_list/test/chrome_app_list_test_support.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/common/pref_names.h"
#include "chrome/test/base/in_process_browser_test.h"

namespace test {

// Test API to access private members of AppListServiceImpl.
class AppListServiceImplTestApi {
 public:
  explicit AppListServiceImplTestApi(AppListServiceImpl* impl) : impl_(impl) {}

  ProfileLoader* profile_loader() { return impl_->profile_loader_.get(); }

 private:
  AppListServiceImpl* impl_;

  DISALLOW_COPY_AND_ASSIGN(AppListServiceImplTestApi);
};

}  // namespace test

// Browser Test for AppListServiceImpl that runs on all platforms supporting
// app_list.
class AppListServiceImplBrowserTest : public InProcessBrowserTest {
 public:
  AppListServiceImplBrowserTest() {}

  // Overridden from InProcessBrowserTest:
  virtual void SetUpOnMainThread() OVERRIDE {
    service_ = test::GetAppListServiceImpl();
    test_api_.reset(new test::AppListServiceImplTestApi(service_));
  }

 protected:
  AppListServiceImpl* service_;
  scoped_ptr<test::AppListServiceImplTestApi> test_api_;

 private:
  DISALLOW_COPY_AND_ASSIGN(AppListServiceImplBrowserTest);
};

// Test that showing a loaded profile for the first time is lazy and
// synchronous. Then tests that showing a second loaded profile without
// dismissing correctly switches profiles.
IN_PROC_BROWSER_TEST_F(AppListServiceImplBrowserTest, ShowLoadedProfiles) {
  PrefService* local_state = g_browser_process->local_state();
  EXPECT_FALSE(local_state->HasPrefPath(prefs::kAppListProfile));

  // When never shown, profile path should match the last used profile.
  base::FilePath user_data_dir =
      g_browser_process->profile_manager()->user_data_dir();
  EXPECT_EQ(service_->GetProfilePath(user_data_dir),
            browser()->profile()->GetPath());

  // Just requesting the profile path shouldn't set it.
  EXPECT_FALSE(local_state->HasPrefPath(prefs::kAppListProfile));

  // Loading the Profile* should be lazy, except on ChromeOS where it is bound
  // to ChromeLauncherController, which always has a profile.
#if defined(OS_CHROMEOS)
  EXPECT_TRUE(service_->GetCurrentAppListProfile());
#else
  EXPECT_FALSE(service_->GetCurrentAppListProfile());
#endif

  // Showing the app list for an unspecified profile, uses the loaded profile.
  service_->Show();

  // Load should be synchronous.
  EXPECT_FALSE(test_api_->profile_loader()->IsAnyProfileLoading());
  EXPECT_EQ(service_->GetCurrentAppListProfile(), browser()->profile());

#if defined(OS_CHROMEOS)
  // ChromeOS doesn't record the app list profile pref, and doesn't do profile
  // switching.
  EXPECT_FALSE(local_state->HasPrefPath(prefs::kAppListProfile));

#else
  // Preference should be updated automatically.
  EXPECT_TRUE(local_state->HasPrefPath(prefs::kAppListProfile));
  EXPECT_EQ(local_state->GetString(prefs::kAppListProfile),
            browser()->profile()->GetPath().BaseName().MaybeAsASCII());

  // Show for a second, pre-loaded profile without dismissing. Don't try this on
  // ChromeOS because it does not support profile switching the app list.
  Profile* profile2 = test::CreateSecondProfileAsync();
  service_->ShowForProfile(profile2);

  // Current profile and saved path should update synchronously.
  EXPECT_FALSE(test_api_->profile_loader()->IsAnyProfileLoading());
  EXPECT_EQ(profile2->GetPath(), service_->GetProfilePath(user_data_dir));
  EXPECT_EQ(profile2, service_->GetCurrentAppListProfile());
#endif
}
