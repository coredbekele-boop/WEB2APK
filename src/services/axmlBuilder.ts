import type { Project } from '../types';

/**
 * Encodes an AndroidManifest into valid Android Binary XML (AXML) format.
 * Android OS PackageParser requires binary AXML chunk type 0x0003 (RES_XML_TYPE).
 * This eliminates "There was a problem parsing the package" on physical Android devices.
 */
export function generateBinaryAndroidManifest(project: Project): Buffer {
  const strings: string[] = [];
  const stringMap = new Map<string, number>();

  function addStr(s: string): number {
    if (stringMap.has(s)) return stringMap.get(s)!;
    const idx = strings.length;
    strings.push(s);
    stringMap.set(s, idx);
    return idx;
  }

  // Pre-seed known strings
  const uriIdx = addStr('http://schemas.android.com/apk/res/android');
  const prefixIdx = addStr('android');

  // Resource IDs mapped to Android attribute constants in res_map
  const attrResIds = [
    { name: 'theme', id: 0x01010000 },
    { name: 'label', id: 0x01010001 },
    { name: 'icon', id: 0x01010002 },
    { name: 'name', id: 0x01010003 },
    { name: 'exported', id: 0x01010010 },
    { name: 'configChanges', id: 0x0101001f },
    { name: 'minSdkVersion', id: 0x0101020c },
    { name: 'versionCode', id: 0x0101021b },
    { name: 'versionName', id: 0x0101021c },
    { name: 'targetSdkVersion', id: 0x01010270 },
    { name: 'hardwareAccelerated', id: 0x010102d8 },
    { name: 'supportsRtl', id: 0x010103af },
  ];

  for (const a of attrResIds) addStr(a.name);

  const tagManifest = addStr('manifest');
  const tagUsesSdk = addStr('uses-sdk');
  const tagUsesPerm = addStr('uses-permission');
  const tagApp = addStr('application');
  const tagActivity = addStr('activity');
  const tagIntentFilter = addStr('intent-filter');
  const tagAction = addStr('action');
  const tagCategory = addStr('category');
  const attrPackage = addStr('package');

  const valPackage = addStr(project.packageName);
  const valVersionName = addStr(String(project.versionName || '1.0.0'));
  const valAppName = addStr(project.name || 'Web2APK App');
  const valPermInternet = addStr('android.permission.INTERNET');
  const valPermNetwork = addStr('android.permission.ACCESS_NETWORK_STATE');
  const valActivityName = addStr('.MainActivity');
  const valActionMain = addStr('android.intent.action.MAIN');
  const valCatLauncher = addStr('android.intent.category.LAUNCHER');

  // String pool chunk serialization (UTF-16LE)
  let strData = Buffer.alloc(0);
  const strOffsets: number[] = [];
  for (const s of strings) {
    strOffsets.push(strData.length);
    const u16 = Buffer.from(s, 'utf16le');
    const item = Buffer.alloc(2 + u16.length + 2);
    item.writeUInt16LE(s.length, 0);
    u16.copy(item, 2);
    item.writeUInt16LE(0, 2 + u16.length);
    strData = Buffer.concat([strData, item]);
  }
  while (strData.length % 4 !== 0) {
    strData = Buffer.concat([strData, Buffer.from([0])]);
  }

  const spHeaderSize = 28;
  const spOffsetsSize = strings.length * 4;
  const spTotalSize = spHeaderSize + spOffsetsSize + strData.length;
  const spChunk = Buffer.alloc(spTotalSize);
  spChunk.writeUInt16LE(0x0001, 0); // RES_STRING_POOL_TYPE
  spChunk.writeUInt16LE(spHeaderSize, 2);
  spChunk.writeUInt32LE(spTotalSize, 4);
  spChunk.writeUInt32LE(strings.length, 8);
  spChunk.writeUInt32LE(0, 12); // styleCount
  spChunk.writeUInt32LE(0, 16); // flags (0 = UTF-16LE)
  spChunk.writeUInt32LE(spHeaderSize + spOffsetsSize, 20); // stringsStart
  spChunk.writeUInt32LE(0, 24); // stylesStart
  for (let i = 0; i < strOffsets.length; i++) {
    spChunk.writeUInt32LE(strOffsets[i], spHeaderSize + i * 4);
  }
  strData.copy(spChunk, spHeaderSize + spOffsetsSize);

  // Resource map chunk serialization
  const rmChunk = Buffer.alloc(8 + attrResIds.length * 4);
  rmChunk.writeUInt16LE(0x0180, 0); // RES_XML_RESOURCE_MAP_TYPE
  rmChunk.writeUInt16LE(8, 2);
  rmChunk.writeUInt32LE(rmChunk.length, 4);
  for (let i = 0; i < attrResIds.length; i++) {
    rmChunk.writeUInt32LE(attrResIds[i].id, 8 + i * 4);
  }

  // XML node builders
  function makeStartNs(line: number): Buffer {
    const b = Buffer.alloc(24);
    b.writeUInt16LE(0x0100, 0); // RES_XML_START_NAMESPACE_TYPE
    b.writeUInt16LE(16, 2);
    b.writeUInt32LE(24, 4);
    b.writeUInt32LE(line, 8);
    b.writeUInt32LE(0xffffffff, 12);
    b.writeUInt32LE(prefixIdx, 16);
    b.writeUInt32LE(uriIdx, 20);
    return b;
  }

  function makeEndNs(line: number): Buffer {
    const b = Buffer.alloc(24);
    b.writeUInt16LE(0x0101, 0); // RES_XML_END_NAMESPACE_TYPE
    b.writeUInt16LE(16, 2);
    b.writeUInt32LE(24, 4);
    b.writeUInt32LE(line, 8);
    b.writeUInt32LE(0xffffffff, 12);
    b.writeUInt32LE(prefixIdx, 16);
    b.writeUInt32LE(uriIdx, 20);
    return b;
  }

  interface AttrDef {
    ns?: number;
    name: number;
    rawValue?: number;
    type: number;
    data: number;
  }

  function makeStartElem(line: number, ns: number | undefined, name: number, attrs: AttrDef[] = []): Buffer {
    const attrSize = 20;
    const chunkSize = 36 + attrs.length * attrSize;
    const b = Buffer.alloc(chunkSize);
    b.writeUInt16LE(0x0102, 0); // RES_XML_START_ELEMENT_TYPE
    b.writeUInt16LE(16, 2);
    b.writeUInt32LE(chunkSize, 4);
    b.writeUInt32LE(line, 8);
    b.writeUInt32LE(0xffffffff, 12);
    b.writeUInt32LE(ns ?? 0xffffffff, 16);
    b.writeUInt32LE(name, 20);
    b.writeUInt16LE(20, 24); // attributeStart
    b.writeUInt16LE(attrSize, 26); // attributeSize
    b.writeUInt16LE(attrs.length, 28); // attributeCount
    b.writeUInt16LE(0, 30);
    b.writeUInt16LE(0, 32);
    b.writeUInt16LE(0, 34);

    let off = 36;
    for (const a of attrs) {
      b.writeUInt32LE(a.ns ?? 0xffffffff, off);
      b.writeUInt32LE(a.name, off + 4);
      b.writeUInt32LE(a.rawValue ?? 0xffffffff, off + 8);
      b.writeUInt16LE(8, off + 12); // size = 8
      b.writeUInt8(0, off + 14);    // res0
      b.writeUInt8(a.type, off + 15); // dataType
      b.writeUInt32LE(a.data, off + 16); // data
      off += attrSize;
    }
    return b;
  }

  function makeEndElem(line: number, ns: number | undefined, name: number): Buffer {
    const b = Buffer.alloc(24);
    b.writeUInt16LE(0x0103, 0); // RES_XML_END_ELEMENT_TYPE
    b.writeUInt16LE(16, 2);
    b.writeUInt32LE(24, 4);
    b.writeUInt32LE(line, 8);
    b.writeUInt32LE(0xffffffff, 12);
    b.writeUInt32LE(ns ?? 0xffffffff, 16);
    b.writeUInt32LE(name, 20);
    return b;
  }

  const vCode = typeof project.versionCode === 'number' ? project.versionCode : 1;
  const minSdk = project.minSdkVersion || 24;
  const targetSdk = project.targetSdkVersion || 34;

  // Build binary XML nodes
  const nodes = [
    makeStartNs(1),
    // <manifest package="..." android:versionCode="..." android:versionName="...">
    makeStartElem(2, 0xffffffff, tagManifest, [
      { ns: 0xffffffff, name: attrPackage, rawValue: valPackage, type: 0x03, data: valPackage },
      { ns: uriIdx, name: stringMap.get('versionCode')!, rawValue: 0xffffffff, type: 0x10, data: vCode },
      { ns: uriIdx, name: stringMap.get('versionName')!, rawValue: valVersionName, type: 0x03, data: valVersionName },
    ]),
    // <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34" />
    makeStartElem(3, 0xffffffff, tagUsesSdk, [
      { ns: uriIdx, name: stringMap.get('minSdkVersion')!, rawValue: 0xffffffff, type: 0x10, data: minSdk },
      { ns: uriIdx, name: stringMap.get('targetSdkVersion')!, rawValue: 0xffffffff, type: 0x10, data: targetSdk },
    ]),
    makeEndElem(3, 0xffffffff, tagUsesSdk),
    // <uses-permission android:name="android.permission.INTERNET" />
    makeStartElem(4, 0xffffffff, tagUsesPerm, [
      { ns: uriIdx, name: stringMap.get('name')!, rawValue: valPermInternet, type: 0x03, data: valPermInternet },
    ]),
    makeEndElem(4, 0xffffffff, tagUsesPerm),
    // <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    makeStartElem(5, 0xffffffff, tagUsesPerm, [
      { ns: uriIdx, name: stringMap.get('name')!, rawValue: valPermNetwork, type: 0x03, data: valPermNetwork },
    ]),
    makeEndElem(5, 0xffffffff, tagUsesPerm),
    // <application android:label="..." android:hardwareAccelerated="true" android:supportsRtl="true">
    makeStartElem(6, 0xffffffff, tagApp, [
      { ns: uriIdx, name: stringMap.get('label')!, rawValue: valAppName, type: 0x03, data: valAppName },
      { ns: uriIdx, name: stringMap.get('hardwareAccelerated')!, rawValue: 0xffffffff, type: 0x12, data: 0xffffffff },
      { ns: uriIdx, name: stringMap.get('supportsRtl')!, rawValue: 0xffffffff, type: 0x12, data: 0xffffffff },
    ]),
    // <activity android:name=".MainActivity" android:exported="true" android:label="...">
    makeStartElem(7, 0xffffffff, tagActivity, [
      { ns: uriIdx, name: stringMap.get('name')!, rawValue: valActivityName, type: 0x03, data: valActivityName },
      { ns: uriIdx, name: stringMap.get('exported')!, rawValue: 0xffffffff, type: 0x12, data: 0xffffffff },
      { ns: uriIdx, name: stringMap.get('label')!, rawValue: valAppName, type: 0x03, data: valAppName },
    ]),
    // <intent-filter>
    makeStartElem(8, 0xffffffff, tagIntentFilter),
    // <action android:name="android.intent.action.MAIN" />
    makeStartElem(9, 0xffffffff, tagAction, [
      { ns: uriIdx, name: stringMap.get('name')!, rawValue: valActionMain, type: 0x03, data: valActionMain },
    ]),
    makeEndElem(9, 0xffffffff, tagAction),
    // <category android:name="android.intent.category.LAUNCHER" />
    makeStartElem(10, 0xffffffff, tagCategory, [
      { ns: uriIdx, name: stringMap.get('name')!, rawValue: valCatLauncher, type: 0x03, data: valCatLauncher },
    ]),
    makeEndElem(10, 0xffffffff, tagCategory),
    makeEndElem(8, 0xffffffff, tagIntentFilter),
    makeEndElem(7, 0xffffffff, tagActivity),
    makeEndElem(6, 0xffffffff, tagApp),
    makeEndElem(2, 0xffffffff, tagManifest),
    makeEndNs(1),
  ];

  const nodesBuffer = Buffer.concat(nodes);
  const totalFileSize = 8 + spChunk.length + rmChunk.length + nodesBuffer.length;
  const fileHeader = Buffer.alloc(8);
  fileHeader.writeUInt16LE(0x0003, 0); // RES_XML_TYPE
  fileHeader.writeUInt16LE(8, 2);      // headerSize
  fileHeader.writeUInt32LE(totalFileSize, 4);

  return Buffer.concat([fileHeader, spChunk, rmChunk, nodesBuffer]);
}
