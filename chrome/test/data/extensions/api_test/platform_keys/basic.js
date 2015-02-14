// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var systemTokenEnabled = (location.href.indexOf("systemTokenEnabled") != -1);

var assertEq = chrome.test.assertEq;
var assertTrue = chrome.test.assertTrue;
var assertThrows = chrome.test.assertThrows;
var fail = chrome.test.fail;
var succeed = chrome.test.succeed;
var callbackPass = chrome.test.callbackPass;
var callbackFail= chrome.test.callbackFail;

// A X.509 client certificate in DER encoding.
var clientCert1 = new Uint8Array([
  0x30, 0x82, 0x02, 0xd2, 0x30, 0x82, 0x01, 0xba, 0xa0, 0x03, 0x02, 0x01,
  0x02, 0x02, 0x02, 0x10, 0x00, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48,
  0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b, 0x05, 0x00, 0x30, 0x0f, 0x31, 0x0d,
  0x30, 0x0b, 0x06, 0x03, 0x55, 0x04, 0x03, 0x0c, 0x04, 0x42, 0x20, 0x43,
  0x41, 0x30, 0x1e, 0x17, 0x0d, 0x31, 0x34, 0x30, 0x38, 0x31, 0x34, 0x30,
  0x32, 0x34, 0x36, 0x33, 0x37, 0x5a, 0x17, 0x0d, 0x32, 0x34, 0x30, 0x38,
  0x31, 0x31, 0x30, 0x32, 0x34, 0x36, 0x33, 0x37, 0x5a, 0x30, 0x18, 0x31,
  0x16, 0x30, 0x14, 0x06, 0x03, 0x55, 0x04, 0x03, 0x0c, 0x0d, 0x43, 0x6c,
  0x69, 0x65, 0x6e, 0x74, 0x20, 0x43, 0x65, 0x72, 0x74, 0x20, 0x41, 0x30,
  0x82, 0x01, 0x22, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7,
  0x0d, 0x01, 0x01, 0x01, 0x05, 0x00, 0x03, 0x82, 0x01, 0x0f, 0x00, 0x30,
  0x82, 0x01, 0x0a, 0x02, 0x82, 0x01, 0x01, 0x00, 0xd5, 0xdf, 0xba, 0x34,
  0xcb, 0xc2, 0x03, 0xb5, 0x37, 0x7a, 0x61, 0x89, 0x1a, 0xb5, 0x1a, 0xb9,
  0x27, 0x7f, 0xa9, 0x2c, 0xba, 0xa1, 0x36, 0xac, 0x83, 0x6d, 0xb8, 0x45,
  0x9e, 0x35, 0x82, 0xa4, 0xde, 0xa3, 0x69, 0x38, 0x25, 0x84, 0x57, 0x00,
  0x8c, 0x41, 0x84, 0x86, 0x6d, 0x78, 0x41, 0xd4, 0x10, 0x99, 0x1b, 0x15,
  0x18, 0xa6, 0x04, 0x2f, 0x92, 0xa0, 0x1c, 0x29, 0xc3, 0xe0, 0x5d, 0xe2,
  0x90, 0x11, 0x2c, 0xfa, 0xac, 0x18, 0x0d, 0xfe, 0x5e, 0x8d, 0x5c, 0x5a,
  0x01, 0x4a, 0xf7, 0x2c, 0xc9, 0x6e, 0x39, 0x8e, 0x14, 0x30, 0xd9, 0xfc,
  0xf6, 0x6a, 0xee, 0x9d, 0xa3, 0xba, 0x23, 0xfe, 0x5d, 0xaa, 0x2f, 0x96,
  0x07, 0x65, 0x38, 0xca, 0xa4, 0x3c, 0xd2, 0x93, 0x21, 0xb0, 0xb6, 0xdb,
  0xfb, 0x40, 0x12, 0x00, 0x01, 0x99, 0x30, 0x41, 0x67, 0xe2, 0x2f, 0x65,
  0x63, 0x71, 0xaa, 0xa6, 0xef, 0x45, 0x23, 0x05, 0x8b, 0xb4, 0x28, 0x6c,
  0x35, 0xbf, 0x41, 0x73, 0x61, 0xf1, 0x9e, 0x77, 0x8c, 0xa7, 0x51, 0xcf,
  0xc7, 0x51, 0x63, 0xc7, 0x00, 0xab, 0x4e, 0xa3, 0xe5, 0x8f, 0xfe, 0x3c,
  0x45, 0xfa, 0x9e, 0xd2, 0x29, 0xbc, 0x59, 0x94, 0x7d, 0x14, 0xc9, 0x36,
  0xdf, 0xcd, 0x0a, 0xb5, 0x9f, 0xbf, 0xac, 0xfd, 0x1d, 0x2b, 0x6d, 0xe5,
  0x13, 0x30, 0x14, 0x71, 0xde, 0x77, 0xdf, 0x83, 0xf3, 0x6d, 0x2c, 0xcd,
  0x16, 0xc0, 0xa5, 0xdc, 0xf2, 0x1f, 0x65, 0x86, 0x37, 0x91, 0x2f, 0x31,
  0x66, 0x7e, 0x1a, 0x4b, 0x42, 0xb7, 0x29, 0xe1, 0xcd, 0x1d, 0xc9, 0x72,
  0x0e, 0x65, 0x8e, 0xa9, 0x4c, 0x74, 0x2e, 0x90, 0xb7, 0xe0, 0x91, 0x0c,
  0xe8, 0xfe, 0x92, 0x26, 0xa7, 0x17, 0x9a, 0xb6, 0x25, 0x7f, 0x66, 0x89,
  0x2f, 0xbf, 0x54, 0xa7, 0x51, 0x4c, 0xe6, 0x8f, 0x4d, 0x34, 0xa1, 0xc3,
  0x02, 0x03, 0x01, 0x00, 0x01, 0xa3, 0x2f, 0x30, 0x2d, 0x30, 0x0c, 0x06,
  0x03, 0x55, 0x1d, 0x13, 0x01, 0x01, 0xff, 0x04, 0x02, 0x30, 0x00, 0x30,
  0x1d, 0x06, 0x03, 0x55, 0x1d, 0x25, 0x04, 0x16, 0x30, 0x14, 0x06, 0x08,
  0x2b, 0x06, 0x01, 0x05, 0x05, 0x07, 0x03, 0x01, 0x06, 0x08, 0x2b, 0x06,
  0x01, 0x05, 0x05, 0x07, 0x03, 0x02, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86,
  0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b, 0x05, 0x00, 0x03, 0x82, 0x01,
  0x01, 0x00, 0x6d, 0x3e, 0xc3, 0xd4, 0xc8, 0xd1, 0xfc, 0xec, 0x0e, 0xd3,
  0xca, 0xc8, 0x4c, 0x8d, 0xfe, 0xab, 0x51, 0xfb, 0x1c, 0xa4, 0xf6, 0x3c,
  0x13, 0x07, 0x76, 0x58, 0x7f, 0x61, 0x34, 0x9c, 0xb6, 0xfd, 0x9a, 0xc5,
  0x7e, 0xc7, 0xb7, 0xe0, 0x89, 0xfb, 0xc5, 0x67, 0x76, 0x75, 0xee, 0xab,
  0xd9, 0xbf, 0xfb, 0xaa, 0x3e, 0xe9, 0x5a, 0x4a, 0xc1, 0x83, 0xc3, 0xc6,
  0xa0, 0x01, 0x8e, 0xb1, 0xf8, 0x0d, 0x08, 0x9a, 0x26, 0xa7, 0xb7, 0x3c,
  0x19, 0xb0, 0x76, 0x77, 0x57, 0x03, 0xc3, 0x61, 0xcf, 0x56, 0x7e, 0x59,
  0x25, 0x10, 0x11, 0xbb, 0x4d, 0x20, 0xd5, 0x49, 0x51, 0x0d, 0xc9, 0x19,
  0xbb, 0x50, 0x4e, 0xd1, 0xf7, 0x62, 0x21, 0x84, 0x02, 0x9b, 0x9b, 0xfa,
  0xca, 0xef, 0xde, 0x7f, 0x6c, 0xa0, 0x1e, 0xf6, 0x50, 0x87, 0x26, 0xeb,
  0x2a, 0xfd, 0xe3, 0x69, 0x4b, 0x12, 0x10, 0x9b, 0xe3, 0xf5, 0x96, 0x33,
  0x23, 0xb5, 0x06, 0x31, 0x42, 0x26, 0x8c, 0x07, 0xcc, 0x0a, 0x19, 0x4a,
  0xa5, 0x92, 0x44, 0xa3, 0x22, 0x5a, 0x69, 0xad, 0x4a, 0x96, 0x61, 0xb7,
  0xa8, 0x6f, 0xbe, 0x31, 0x30, 0xb2, 0x1d, 0xee, 0x5a, 0x21, 0x87, 0xa7,
  0x33, 0x51, 0x02, 0xe4, 0x24, 0x86, 0xab, 0x8e, 0xaa, 0x94, 0xf4, 0x25,
  0x6e, 0x3f, 0x53, 0x42, 0xce, 0x12, 0x91, 0x99, 0x23, 0x52, 0x1d, 0xba,
  0xdf, 0x59, 0x11, 0x0f, 0x34, 0x2e, 0x8e, 0x58, 0xac, 0xdf, 0x6b, 0x1a,
  0x08, 0xa3, 0x03, 0x46, 0x0f, 0xc0, 0x11, 0x72, 0x66, 0xc4, 0xe8, 0x92,
  0x5a, 0x20, 0x06, 0xfe, 0xe2, 0x2b, 0xe9, 0xb3, 0x9b, 0x70, 0x1a, 0xb9,
  0x53, 0x21, 0xad, 0xd7, 0x5f, 0xa1, 0xab, 0x26, 0x97, 0x17, 0x0b, 0xba,
  0xb0, 0x8b, 0x2d, 0xdb, 0x0c, 0x4e, 0xed, 0x75, 0x8b, 0x72, 0x46, 0xb0,
  0x6b, 0x23, 0x11, 0xba, 0x1e, 0x03
]);

// The distinguished name of the CA that issued clientCert1 in DER encoding.
var ca1DistinguishedNameDER = new Uint8Array([
  0x30, 0x0f, 0x31, 0x0d, 0x30, 0x0b, 0x06, 0x03, 0x55, 0x04, 0x03, 0x0c,
  0x04, 0x42, 0x20, 0x43, 0x41
]);

// A X.509 client certificate in DER encoding.
var clientCert2 = new Uint8Array([
  0x30, 0x82, 0x02, 0xd2, 0x30, 0x82, 0x01, 0xba, 0xa0, 0x03, 0x02, 0x01,
  0x02, 0x02, 0x02, 0x10, 0x02, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48,
  0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b, 0x05, 0x00, 0x30, 0x0f, 0x31, 0x0d,
  0x30, 0x0b, 0x06, 0x03, 0x55, 0x04, 0x03, 0x0c, 0x04, 0x45, 0x20, 0x43,
  0x41, 0x30, 0x1e, 0x17, 0x0d, 0x31, 0x34, 0x30, 0x38, 0x31, 0x34, 0x30,
  0x32, 0x34, 0x36, 0x33, 0x37, 0x5a, 0x17, 0x0d, 0x32, 0x34, 0x30, 0x38,
  0x31, 0x31, 0x30, 0x32, 0x34, 0x36, 0x33, 0x37, 0x5a, 0x30, 0x18, 0x31,
  0x16, 0x30, 0x14, 0x06, 0x03, 0x55, 0x04, 0x03, 0x0c, 0x0d, 0x43, 0x6c,
  0x69, 0x65, 0x6e, 0x74, 0x20, 0x43, 0x65, 0x72, 0x74, 0x20, 0x44, 0x30,
  0x82, 0x01, 0x22, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7,
  0x0d, 0x01, 0x01, 0x01, 0x05, 0x00, 0x03, 0x82, 0x01, 0x0f, 0x00, 0x30,
  0x82, 0x01, 0x0a, 0x02, 0x82, 0x01, 0x01, 0x00, 0xe7, 0xb2, 0x44, 0x6e,
  0xf9, 0xef, 0x0a, 0x10, 0xd3, 0xeb, 0x66, 0x39, 0x09, 0x93, 0x96, 0x40,
  0x22, 0x3f, 0xe4, 0xbc, 0xfb, 0x89, 0xca, 0x55, 0x20, 0x71, 0x8e, 0x04,
  0x18, 0x82, 0xa4, 0x36, 0x18, 0x85, 0x26, 0x3f, 0x8b, 0x26, 0xc0, 0x44,
  0x02, 0x8b, 0x8c, 0xaf, 0xf7, 0xab, 0x72, 0x0a, 0x8f, 0x33, 0x42, 0x9f,
  0xf1, 0x4d, 0x12, 0x14, 0x61, 0x68, 0xb3, 0x54, 0x57, 0x72, 0x4b, 0xfc,
  0xc5, 0x61, 0xf6, 0xfc, 0x5a, 0x34, 0xce, 0x1f, 0x04, 0x1e, 0xf6, 0xe6,
  0x32, 0x94, 0xf7, 0x11, 0xe3, 0x80, 0xe4, 0x61, 0x06, 0xc2, 0x0c, 0x2c,
  0xa8, 0x24, 0x02, 0x9d, 0x1c, 0xc1, 0xe6, 0xe8, 0x0b, 0xf5, 0x43, 0x17,
  0x6c, 0x47, 0x59, 0x4a, 0x6f, 0x8d, 0x0f, 0x97, 0x4f, 0xac, 0x59, 0x13,
  0x02, 0xe9, 0x93, 0x02, 0xa2, 0x16, 0x15, 0x85, 0xda, 0x20, 0xb9, 0x87,
  0x3f, 0x18, 0x78, 0xca, 0xd6, 0xe0, 0x15, 0x55, 0xe5, 0x5b, 0xd2, 0x60,
  0x4d, 0xd5, 0x60, 0x24, 0xc8, 0xfc, 0xba, 0x3c, 0x4e, 0x07, 0xca, 0xee,
  0xa3, 0x7c, 0x32, 0xbf, 0x9a, 0xe2, 0xe2, 0x02, 0xe7, 0x87, 0x65, 0x77,
  0xfb, 0xca, 0x3d, 0xe0, 0x4e, 0x4a, 0x3f, 0xe3, 0xc6, 0x98, 0xa7, 0x56,
  0x3a, 0x17, 0x54, 0x42, 0xc5, 0xae, 0xaf, 0x05, 0xf4, 0x9b, 0xb8, 0x30,
  0xe6, 0xee, 0x3a, 0x1c, 0x31, 0x35, 0x4b, 0x73, 0xd6, 0xd3, 0x7c, 0x4c,
  0x52, 0x4d, 0x1f, 0xf8, 0x0f, 0x14, 0x97, 0xd9, 0xd5, 0xd7, 0x67, 0xd6,
  0xd7, 0xbb, 0xa5, 0x52, 0xe9, 0xd2, 0xad, 0x68, 0x8c, 0x61, 0x02, 0x95,
  0x8d, 0xb4, 0xe1, 0x37, 0x0c, 0x3f, 0x30, 0x64, 0x05, 0x4f, 0x76, 0x49,
  0x9c, 0x50, 0xdb, 0x76, 0xa5, 0xad, 0xd2, 0x2d, 0xb4, 0xc3, 0xd2, 0xd2,
  0xad, 0x0d, 0x64, 0x9a, 0xd6, 0xcf, 0x85, 0xba, 0x0c, 0x61, 0x00, 0xe3,
  0x02, 0x03, 0x01, 0x00, 0x01, 0xa3, 0x2f, 0x30, 0x2d, 0x30, 0x0c, 0x06,
  0x03, 0x55, 0x1d, 0x13, 0x01, 0x01, 0xff, 0x04, 0x02, 0x30, 0x00, 0x30,
  0x1d, 0x06, 0x03, 0x55, 0x1d, 0x25, 0x04, 0x16, 0x30, 0x14, 0x06, 0x08,
  0x2b, 0x06, 0x01, 0x05, 0x05, 0x07, 0x03, 0x01, 0x06, 0x08, 0x2b, 0x06,
  0x01, 0x05, 0x05, 0x07, 0x03, 0x02, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86,
  0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b, 0x05, 0x00, 0x03, 0x82, 0x01,
  0x01, 0x00, 0xce, 0x8a, 0x6b, 0xa8, 0x70, 0x1a, 0xa3, 0xbb, 0x54, 0x2b,
  0x78, 0x29, 0x84, 0xb3, 0x08, 0xfa, 0x4f, 0x0a, 0x98, 0xcd, 0x10, 0x1e,
  0x04, 0x05, 0x2d, 0xe9, 0x0d, 0xd0, 0x84, 0xc1, 0x49, 0x21, 0x74, 0x30,
  0x2d, 0x7e, 0xfe, 0xec, 0x69, 0xa6, 0x6c, 0x5a, 0xa1, 0x7e, 0x17, 0xd1,
  0xb3, 0x84, 0x8c, 0xa0, 0xc1, 0x88, 0xc6, 0x45, 0xa6, 0x26, 0x82, 0xae,
  0xa6, 0x54, 0xed, 0xc2, 0x80, 0x49, 0xe2, 0xe1, 0x94, 0x06, 0x02, 0x42,
  0xbf, 0x8d, 0x9a, 0xc2, 0xbc, 0x0c, 0x1e, 0x4a, 0x02, 0x74, 0xb0, 0x7e,
  0x90, 0x04, 0x23, 0xc2, 0x12, 0x52, 0x14, 0xe8, 0xc5, 0xb2, 0xb8, 0xef,
  0x77, 0x7e, 0x6b, 0xac, 0xa0, 0xcc, 0x68, 0xa8, 0x02, 0x2d, 0xa6, 0x6a,
  0xd2, 0x17, 0x7f, 0xbd, 0x14, 0x21, 0x8b, 0xe3, 0x07, 0x02, 0xcd, 0x7f,
  0xe2, 0x01, 0x63, 0xfa, 0xe1, 0xfd, 0x9a, 0x43, 0xf9, 0x81, 0x52, 0x56,
  0x7f, 0xd2, 0x42, 0x71, 0xad, 0x90, 0xfe, 0xb4, 0xe3, 0xee, 0xf9, 0x76,
  0x14, 0x86, 0x4e, 0x4b, 0x9b, 0x7f, 0x94, 0x51, 0xc8, 0x5c, 0xce, 0x56,
  0x5d, 0xc5, 0xee, 0x2d, 0xb4, 0xe4, 0xd1, 0x15, 0xd8, 0x49, 0x59, 0x4f,
  0x12, 0xd8, 0x5e, 0xad, 0x8f, 0x9e, 0x50, 0xab, 0x61, 0x18, 0x0d, 0xdf,
  0xbc, 0x56, 0xf3, 0x75, 0x89, 0x1b, 0x0f, 0x19, 0xdf, 0x2d, 0x6e, 0x81,
  0x85, 0xdc, 0xc7, 0x28, 0x6a, 0x4b, 0x70, 0x6d, 0x85, 0x8c, 0x9d, 0x7d,
  0xe1, 0x5d, 0x62, 0xbb, 0x47, 0x18, 0xdc, 0xe8, 0x83, 0xc3, 0x27, 0xaf,
  0x5b, 0xec, 0x58, 0x07, 0x95, 0xe9, 0xe4, 0x9f, 0x94, 0xb4, 0x2a, 0x4a,
  0x67, 0xaa, 0xd7, 0x57, 0x37, 0x1b, 0x21, 0x07, 0x11, 0xd5, 0x4e, 0xca,
  0x1e, 0x72, 0x8c, 0x43, 0xfe, 0xcf, 0xb9, 0xea, 0x68, 0xea, 0x5d, 0xd7,
  0xd3, 0x32, 0xfb, 0x8a, 0x29, 0xf6
]);

// Some array comparison. Note: not lexicographical!
function compareArrays(array1, array2) {
  if (array1.length < array2.length)
    return -1;
  if (array1.length > array2.length)
    return 1;
  for (var i = 0; i < array1.length; i++) {
    if (array1[i] < array2[i])
      return -1;
    if (array1[i] > array2[i])
      return 1;
  }
  return 0;
}

/**
 * @param {ArrayBufferView[]} certs
 * @return {ArrayBufferView[]} |certs| sorted in some order.
 */
function sortCerts(certs) {
  return certs.sort(compareArrays);
}

function assertCertsSelected(request, expectedCerts, callback) {
  chrome.platformKeys.selectClientCertificates(
      {interactive: false, request: request},
      callbackPass(function(actualMatches) {
        assertEq(expectedCerts.length, actualMatches.length,
                 'Number of stored certs not as expected');
        if (expectedCerts.length == actualMatches.length) {
          var actualCerts = actualMatches.map(function(match) {
            return new Uint8Array(match.certificate);
          });
          actualCerts = sortCerts(actualCerts);
          expectedCerts = sortCerts(expectedCerts);
          for (var i = 0; i < expectedCerts.length; i++) {
            assertEq(expectedCerts[i], actualCerts[i],
                     'Certs at index ' + i + ' differ');
          }
        }
        if (callback)
          callback();
      }));
}

function testStaticMethods() {
  assertTrue(!!chrome.platformKeys, "No platformKeys namespace.");
  assertTrue(!!chrome.platformKeys.selectClientCertificates,
             "No selectClientCertificates function.");
  succeed();
}

function testSelectAllCerts() {
  var requestAll = {
    certificateTypes: [],
    certificateAuthorities: []
  };
  var expectedCerts = [clientCert1];
  if (systemTokenEnabled)
    expectedCerts.push(clientCert2);
  assertCertsSelected(requestAll, expectedCerts);
}

function testSelectCA1Certs() {
  var requestCA1 = {
    certificateTypes: [],
    certificateAuthorities: [ca1DistinguishedNameDER.buffer]
  };
  assertCertsSelected(requestCA1, [clientCert1]);
}

function runTests() {
  var tests = [
    testStaticMethods,
    testSelectAllCerts,
    testSelectCA1Certs
  ];

  chrome.test.runTests(tests);
}

runTests();
