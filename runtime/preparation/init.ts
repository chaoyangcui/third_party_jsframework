/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/*
 * 2021.01.08 - Rewrite the function 'initFramework' and make it simpler.
 * Copyright (c) 2021 Huawei Device Co., Ltd.
 */

import service from './service';
import i18n from '../main/extend/i18n/index';
import dpi from '../main/extend/dpi/index';
import { Log } from '../utils/utils';
import { Options } from '../main/app';
import globalApi from './methods';
import NativeElementClassFactory from '../vdom/NativeElementClassFactory';

export interface GlobalInterface {
  createInstance: (id: string, code: string, config: Options, data: object) => any | Error;
  registerModules: (modules: object) => void;
  appDestroy: (packageName: string) => void;
  appError: (packageName: string, errors: any) => void;
  destroyInstance: (pageId: string) => any | Error;
  getRoot: (...args: any[]) => any | Error;
  callJS: (pageId: string, tasks: any[]) => any | Error;
}

/**
 * Setup framework: register services and initialize the global methods.
 */
export function initFramework(): void {
  for (const serviceName in i18n) {
    service.register(serviceName, i18n[serviceName]);
  }
  for (const serviceName in dpi) {
    service.register(serviceName, dpi[serviceName]);
  }

  const globalMethods: GlobalInterface = {
    'createInstance': globalApi.createInstance,
    'registerModules': globalApi.registerModules,
    'appDestroy': globalApi.appDestroy,
    'appError': globalApi.appError,
    'destroyInstance': globalApi.destroyInstance,
    'getRoot': globalApi.getRoot,
    'callJS': globalApi.callJS
  };

  // registerModules and registerComponents
  ModulesInfo.forEach(modules => {
    globalMethods['registerModules'](modules);
  });

  ComponentsInfo.forEach((name) => {
    if (name && name.type && name.methods) {
      NativeElementClassFactory.createNativeElementClass(
        name.type,
        name.methods
      );
    }
  });

  for (const methodName in globalMethods) {
    global[methodName] = (...args: any) => {
      const res: any = globalMethods[methodName](...args);
      if (res instanceof Error) {
        Log.error(res.toString());
      }
      return res;
    };
  }
}

const ModulesInfo: Record<string, string[]>[] = [
  {'system.router': ['push', 'replace', 'back', 'clear', 'getLength', 'getState']},
  {'system.app': ['getInfo', 'getPackageInfo', 'terminate', 'requestFullWindow', 'screenOnVisible', 'setSwipeToDismiss']},
  {'system.prompt': ['showToast', 'showDialog']},
  {'system.configuration': ['getLocale']},
  {'timer': ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']},
  {'system.image': ['getImage']},
  {'system.device': ['getInfo']},
  {'system.grid': ['getSystemLayoutInfo']},
  {'system.mediaquery': ['addListener', 'getDeviceType']},
  {'animation': ['requestAnimationFrame', 'cancelAnimationFrame']},
  {'system.resource': ['readText']}
];

type components<T> = {
  'methods': T[],
  'type': T
}

const ComponentsInfo: components<string>[] = [
  {'methods': ['focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'clock'},
  {'methods': ['focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'image'},
  {'methods': ['focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'label'},
  {'methods': ['focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'list-item'},
  {'methods': ['focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'list-item-group'},
  {'methods': ['focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'progress'},
  {'methods': ['focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'rating'},
  {'methods': ['focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'select'},
  {'methods': ['focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'switch'},
  {'methods': ['focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'tabs'},
  {'methods': ['focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'tab-bar'},
  {'methods': ['focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'tab-content'},
  {'methods': ['focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'text'},
  {
    'methods': ['setProgress', 'focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'],
    'type': 'button'
  },
  {'methods': ['append', 'focus', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'chart'},
  {'methods': ['goto', 'focus', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'calendar'},
  {
    'methods': ['getContext', 'toDataURL', 'animate', 'focus', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'],
    'type': 'canvas'
  },
  {'methods': ['show', 'close', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'dialog'},
  {'methods': ['focus', 'animate', 'getScrollOffset', 'scrollBy', 'getBoundingClientRect'], 'type': 'div'},
  {'methods': ['animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'divider'},
  {
    'methods': ['getColumns', 'getColumnWidth', 'getGutterWidth', 'getSizeType', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'],
    'type': 'grid-container'
  },
  {
    'methods': ['start', 'stop', 'pause', 'resume', 'getState', 'animate', 'focus', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'],
    'type': 'image-animator'
  },
  {
    'methods': ['showError', 'focus', 'animate', 'delete', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'],
    'type': 'input'
  },
  {
    'methods': ['scrollTo', 'scrollBy', 'focus', 'scrollArrow', 'scrollTop', 'scrollBottom', 'scrollPage', 'collapseGroup', 'expandGroup', 'currentOffset', 'rotation', 'animate', 'chainanimation', 'getBoundingClientRect', 'getScrollOffset'],
    'type': 'list'
  },
  {
    'methods': ['start', 'stop', 'focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'],
    'type': 'marquee'
  },
  {'methods': ['show', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'menu'},
  {'methods': ['focus', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'option'},
  {'methods': ['show', 'close', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'panel'},
  {'methods': ['show', 'animate', 'focus', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'picker'},
  {
    'methods': ['rotation', 'animate', 'focus', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'],
    'type': 'picker-view'
  },
  {'methods': ['focus', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'piece'},
  {'methods': ['focus', 'show', 'hide', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'popup'},
  {'methods': ['animate', 'focus', 'delete', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'], 'type': 'search'},
  {
    'methods': ['rotation', 'focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'],
    'type': 'slider'
  },
  {'methods': ['focus', 'animate', 'getScrollOffset', 'scrollBy', 'getBoundingClientRect'], 'type': 'stack'},
  {
    'methods': ['swipeTo', 'focus', 'showPrevious', 'showNext', 'rotation', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'],
    'type': 'swiper'
  },
  {
    'methods': ['start', 'pause', 'setCurrentTime', 'requestFullscreen', 'exitFullscreen', 'focus', 'animate', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'],
    'type': 'video'
  },
  {
    'methods': ['setNextButtonStatus', 'focus', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'],
    'type': 'stepper'
  },
  {
    'methods': ['focus', 'animate', 'delete', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'],
    'type': 'textarea'
  },
  {
    'methods': ['reload', 'getBoundingClientRect', 'scrollBy', 'getScrollOffset'],
    'type': 'web'
  },
  {
    'methods': ['takePhoto', 'startRecorder', 'closeRecorder'],
    'type': 'camera'
  }
];
