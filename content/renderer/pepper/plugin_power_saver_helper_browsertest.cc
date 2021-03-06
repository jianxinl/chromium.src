// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "base/run_loop.h"
#include "content/common/frame_messages.h"
#include "content/common/view_message_enums.h"
#include "content/public/test/render_view_test.h"
#include "content/renderer/pepper/plugin_power_saver_helper.h"
#include "content/renderer/render_frame_impl.h"
#include "content/renderer/render_view_impl.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "third_party/WebKit/public/web/WebDocument.h"
#include "third_party/WebKit/public/web/WebLocalFrame.h"
#include "third_party/WebKit/public/web/WebPluginParams.h"
#include "url/gurl.h"

namespace content {

class PluginPowerSaverHelperTest : public RenderViewTest {
 public:
  PluginPowerSaverHelperTest() : sink_(NULL) {}

  RenderFrameImpl* frame() {
    return static_cast<RenderFrameImpl*>(view_->GetMainRenderFrame());
  }

  void SetUp() override {
    RenderViewTest::SetUp();
    sink_ = &render_thread_->sink();
  }

  blink::WebPluginParams MakeParams(const std::string& url,
                                    const std::string& poster,
                                    const std::string& width,
                                    const std::string& height) {
    const size_t size = 3;
    blink::WebVector<blink::WebString> names(size);
    blink::WebVector<blink::WebString> values(size);

    blink::WebPluginParams params;
    params.url = GURL(url);

    params.attributeNames.swap(names);
    params.attributeValues.swap(values);

    params.attributeNames[0] = "poster";
    params.attributeNames[1] = "height";
    params.attributeNames[2] = "width";
    params.attributeValues[0] = blink::WebString::fromUTF8(poster);
    params.attributeValues[1] = blink::WebString::fromUTF8(height);
    params.attributeValues[2] = blink::WebString::fromUTF8(width);

    return params;
  }

 protected:
  IPC::TestSink* sink_;

  DISALLOW_COPY_AND_ASSIGN(PluginPowerSaverHelperTest);
};

TEST_F(PluginPowerSaverHelperTest, PosterImage) {
  size_t size = 3;
  blink::WebVector<blink::WebString> names(size);
  blink::WebVector<blink::WebString> values(size);

  blink::WebPluginParams params;
  params.url = GURL("http://b.com/foo.swf");

  params.attributeNames.swap(names);
  params.attributeValues.swap(values);

  params.attributeNames[0] = "poster";
  params.attributeNames[1] = "height";
  params.attributeNames[2] = "width";
  params.attributeValues[0] = "poster.jpg";
  params.attributeValues[1] = "100";
  params.attributeValues[2] = "100";

  GURL poster_result;

  EXPECT_TRUE(frame()->ShouldThrottleContent(
      MakeParams("http://b.com/foo.swf", "poster.jpg", "100", "100"),
      GURL("http://a.com/page.html"), &poster_result, nullptr));
  EXPECT_EQ(GURL("http://a.com/poster.jpg"), poster_result);

  // Ignore empty poster paramaters.
  EXPECT_TRUE(frame()->ShouldThrottleContent(
      MakeParams("http://b.com/foo.swf", std::string(), "100", "100"),
      GURL("http://a.com/page.html"), &poster_result, nullptr));
  EXPECT_EQ(GURL(), poster_result);

  // Ignore poster parameter when plugin is big (shouldn't be throttled).
  EXPECT_FALSE(frame()->ShouldThrottleContent(
      MakeParams("http://b.com/foo.swf", "poster.jpg", "500", "500"),
      GURL("http://a.com/page.html"), &poster_result, nullptr));
  EXPECT_EQ(GURL(), poster_result);
}

TEST_F(PluginPowerSaverHelperTest, AllowSameOrigin) {
  EXPECT_FALSE(frame()->ShouldThrottleContent(
      MakeParams(std::string(), std::string(), "100", "100"), GURL(), nullptr,
      nullptr));
  EXPECT_FALSE(frame()->ShouldThrottleContent(
      MakeParams(std::string(), std::string(), "1000", "1000"), GURL(), nullptr,
      nullptr));
}

TEST_F(PluginPowerSaverHelperTest, DisallowCrossOriginUnlessLarge) {
  bool cross_origin_main_content = false;
  EXPECT_TRUE(frame()->ShouldThrottleContent(
      MakeParams("http://b.com/foo.swf", std::string(), "100", "100"), GURL(),
      nullptr, &cross_origin_main_content));
  EXPECT_FALSE(cross_origin_main_content);

  EXPECT_FALSE(frame()->ShouldThrottleContent(
      MakeParams("http://b.com/foo.swf", std::string(), "1000", "1000"), GURL(),
      nullptr, &cross_origin_main_content));
  EXPECT_TRUE(cross_origin_main_content);
}

TEST_F(PluginPowerSaverHelperTest, AlwaysAllowTinyContent) {
  bool cross_origin_main_content = false;
  EXPECT_FALSE(frame()->ShouldThrottleContent(
      MakeParams(std::string(), std::string(), "1", "1"), GURL(), nullptr,
      &cross_origin_main_content));
  EXPECT_FALSE(cross_origin_main_content);

  EXPECT_FALSE(frame()->ShouldThrottleContent(
      MakeParams("http://b.com/foo.swf", std::string(), "1", "1"), GURL(),
      nullptr, &cross_origin_main_content));
  EXPECT_FALSE(cross_origin_main_content);

  EXPECT_FALSE(frame()->ShouldThrottleContent(
      MakeParams("http://b.com/foo.swf", std::string(), "5", "5"), GURL(),
      nullptr, &cross_origin_main_content));
  EXPECT_FALSE(cross_origin_main_content);

  EXPECT_TRUE(frame()->ShouldThrottleContent(
      MakeParams("http://b.com/foo.swf", std::string(), "10", "10"), GURL(),
      nullptr, &cross_origin_main_content));
  EXPECT_FALSE(cross_origin_main_content);
}

TEST_F(PluginPowerSaverHelperTest, TemporaryOriginWhitelist) {
  bool cross_origin_main_content = false;
  EXPECT_TRUE(frame()->ShouldThrottleContent(
      MakeParams("http://b.com/foo.swf", std::string(), "100", "100"), GURL(),
      nullptr, &cross_origin_main_content));
  EXPECT_FALSE(cross_origin_main_content);

  // Clear out other messages so we find just the plugin power saver IPCs.
  sink_->ClearMessages();

  frame()->WhitelistContentOrigin(GURL("http://b.com"));
  EXPECT_FALSE(frame()->ShouldThrottleContent(
      MakeParams("http://b.com/foo.swf", std::string(), "100", "100"), GURL(),
      nullptr, &cross_origin_main_content));
  EXPECT_FALSE(cross_origin_main_content);

  // Test that we've sent an IPC to the browser.
  ASSERT_EQ(1u, sink_->message_count());
  const IPC::Message* msg = sink_->GetMessageAt(0);
  EXPECT_EQ(FrameHostMsg_PluginContentOriginAllowed::ID, msg->type());
  FrameHostMsg_PluginContentOriginAllowed::Param params;
  FrameHostMsg_PluginContentOriginAllowed::Read(msg, &params);
  EXPECT_EQ(GURL("http://b.com"), get<0>(params));
}

TEST_F(PluginPowerSaverHelperTest, UnthrottleOnExPostFactoWhitelist) {
  base::RunLoop loop;
  frame()->RegisterPeripheralPlugin(GURL("http://other.com"),
                                    loop.QuitClosure());

  std::set<GURL> origin_whitelist;
  origin_whitelist.insert(GURL("http://other.com"));
  frame()->OnMessageReceived(FrameMsg_UpdatePluginContentOriginWhitelist(
      frame()->GetRoutingID(), origin_whitelist));

  // Runs until the unthrottle closure is run.
  loop.Run();
}

TEST_F(PluginPowerSaverHelperTest, ClearWhitelistOnNavigate) {
  frame()->WhitelistContentOrigin(GURL("http://b.com"));

  EXPECT_FALSE(frame()->ShouldThrottleContent(
      MakeParams("http://b.com/foo.swf", std::string(), "100", "100"), GURL(),
      nullptr, nullptr));

  LoadHTML("<html></html>");

  EXPECT_TRUE(frame()->ShouldThrottleContent(
      MakeParams("http://b.com/foo.swf", std::string(), "100", "100"), GURL(),
      nullptr, nullptr));
}

}  // namespace content
