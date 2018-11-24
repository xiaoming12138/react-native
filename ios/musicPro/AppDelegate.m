/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <AVFoundation/AVFoundation.h>  // import
UIBackgroundTaskIdentifier _bgTaskId;

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;

  [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryAmbient error:nil];  // allow
  
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"musicPro"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}
-(void)applicationWillResignActive:(UIApplication *)application
{
  [[UIApplication sharedApplication] beginReceivingRemoteControlEvents];
  AVAudioSession *session=[AVAudioSession sharedInstance];
  [session setActive:YES error:nil];
  [session setCategory:AVAudioSessionCategoryPlayback error:nil];
  _bgTaskId=[AppDelegate backgroundPlayerID:_bgTaskId];
  
  
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleInterruption:) name:AVAudioSessionInterruptionNotification object:[AVAudioSession sharedInstance]];

}

- (void)handleInterruption:(NSNotification *)notification
{
  NSDictionary *info = notification.userInfo;
  AVAudioSessionInterruptionType type = [info[AVAudioSessionInterruptionTypeKey] unsignedIntegerValue];
  if (type == AVAudioSessionInterruptionTypeBegan) {
    //暂停，或者让系统自己处理
  }else{
    AVAudioSessionInterruptionOptions options = [info[AVAudioSessionInterruptionOptionKey] unsignedIntegerValue];
    if (options == AVAudioSessionInterruptionOptionShouldResume) {
      //恢复播放，要是还活着的话
    }
  }
}



+(UIBackgroundTaskIdentifier)backgroundPlayerID:(UIBackgroundTaskIdentifier)backTaskId
{
  AVAudioSession *session=[AVAudioSession sharedInstance];
  [session setCategory:AVAudioSessionCategoryPlayback error:nil];
  [session setActive:YES error:nil];
  [[UIApplication sharedApplication] beginReceivingRemoteControlEvents];
  UIBackgroundTaskIdentifier newTaskId=UIBackgroundTaskInvalid;
  newTaskId=[[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:nil];
  if(newTaskId!=UIBackgroundTaskInvalid&&backTaskId!=UIBackgroundTaskInvalid)
  {
    [[UIApplication sharedApplication] endBackgroundTask:backTaskId];
  }
  return newTaskId;
}




@end
