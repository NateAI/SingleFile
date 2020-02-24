/*
 * Copyright 2010-2020 Gildas Lormeau
 * contact : gildas.lormeau <at> gmail.com
 *
 * This file is part of SingleFile.
 *
 *   The code in this file is free software: you can redistribute it and/or
 *   modify it under the terms of the GNU Affero General Public License
 *   (GNU AGPL) as published by the Free Software Foundation, either version 3
 *   of the License, or (at your option) any later version.
 *
 *   The code in this file is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
 *   General Public License for more details.
 *
 *   As additional permission under GNU AGPL version 3 section 7, you may
 *   distribute UNMODIFIED VERSIONS OF THIS file without the copy of the GNU
 *   AGPL normally required by section 4, provided you include this license
 *   notice and a URL through which recipients can access the Corresponding
 *   Source.
 */

/* global browser, singlefile */

singlefile.extension.ui.bg.button = (() => {
  const DEFAULT_ICON_PATH = "/extension/ui/resources/icon_128.png";
  const WAIT_ICON_PATH_PREFIX = "/extension/ui/resources/icon_128_wait";
  const BUTTON_DEFAULT_TOOLTIP_MESSAGE = browser.i18n.getMessage(
    "buttonDefaultTooltip"
  );
  const BUTTON_BLOCKED_TOOLTIP_MESSAGE = browser.i18n.getMessage(
    "buttonBlockedTooltip"
  );
  const BUTTON_DEFAULT_BADGE_MESSAGE = "";
  const BUTTON_INITIALIZING_BADGE_MESSAGE = browser.i18n.getMessage(
    "buttonInitializingBadge"
  );
  const BUTTON_INITIALIZING_TOOLTIP_MESSAGE = browser.i18n.getMessage(
    "buttonInitializingTooltip"
  );
  const BUTTON_ERROR_BADGE_MESSAGE = browser.i18n.getMessage(
    "buttonErrorBadge"
  );
  const BUTTON_BLOCKED_BADGE_MESSAGE = browser.i18n.getMessage(
    "buttonBlockedBadge"
  );
  const BUTTON_OK_BADGE_MESSAGE = browser.i18n.getMessage("buttonOKBadge");
  const BUTTON_SAVE_PROGRESS_TOOLTIP_MESSAGE = browser.i18n.getMessage(
    "buttonSaveProgressTooltip"
  );
  const BUTTON_UPLOAD_PROGRESS_TOOLTIP_MESSAGE = browser.i18n.getMessage(
    "buttonUploadProgressTooltip"
  );
  const BUTTON_AUTOSAVE_ACTIVE_BADGE_MESSAGE = browser.i18n.getMessage(
    "buttonAutoSaveActiveBadge"
  );
  const BUTTON_AUTOSAVE_ACTIVE_TOOLTIP_MESSAGE = browser.i18n.getMessage(
    "buttonAutoSaveActiveTooltip"
  );
  const DEFAULT_COLOR = [2, 147, 20, 192];
  const ACTIVE_COLOR = [4, 229, 36, 192];
  const FORBIDDEN_COLOR = [255, 255, 255, 1];
  const ERROR_COLOR = [229, 4, 12, 192];
  const AUTOSAVE_DEFAULT_COLOR = [208, 208, 208, 192];
  const AUTOSAVE_INITIALIZING_COLOR = [64, 64, 64, 192];
  const INJECT_SCRIPTS_STEP = 1;

  const BUTTON_STATES = {
    default: {
      setBadgeBackgroundColor: { color: DEFAULT_COLOR },
      setBadgeText: { text: BUTTON_DEFAULT_BADGE_MESSAGE },
      setTitle: { title: BUTTON_DEFAULT_TOOLTIP_MESSAGE },
      setIcon: { path: DEFAULT_ICON_PATH }
    },
    inject: {
      setBadgeBackgroundColor: { color: DEFAULT_COLOR },
      setBadgeText: { text: BUTTON_INITIALIZING_BADGE_MESSAGE },
      setTitle: { title: BUTTON_INITIALIZING_TOOLTIP_MESSAGE }
    },
    execute: {
      setBadgeBackgroundColor: { color: ACTIVE_COLOR },
      setBadgeText: { text: BUTTON_INITIALIZING_BADGE_MESSAGE }
    },
    progress: {
      setBadgeBackgroundColor: { color: ACTIVE_COLOR },
      setBadgeText: { text: BUTTON_DEFAULT_BADGE_MESSAGE }
    },
    edit: {
      setBadgeBackgroundColor: { color: DEFAULT_COLOR },
      setBadgeText: { text: BUTTON_DEFAULT_BADGE_MESSAGE },
      setTitle: { title: BUTTON_DEFAULT_TOOLTIP_MESSAGE },
      setIcon: { path: DEFAULT_ICON_PATH }
    },
    end: {
      setBadgeBackgroundColor: { color: ACTIVE_COLOR },
      setBadgeText: { text: BUTTON_OK_BADGE_MESSAGE },
      setTitle: { title: BUTTON_DEFAULT_TOOLTIP_MESSAGE },
      setIcon: { path: DEFAULT_ICON_PATH }
    },
    error: {
      setBadgeBackgroundColor: { color: ERROR_COLOR },
      setBadgeText: { text: BUTTON_ERROR_BADGE_MESSAGE },
      setTitle: { title: BUTTON_DEFAULT_BADGE_MESSAGE },
      setIcon: { path: DEFAULT_ICON_PATH }
    },
    forbidden: {
      setBadgeBackgroundColor: { color: FORBIDDEN_COLOR },
      setBadgeText: { text: BUTTON_BLOCKED_BADGE_MESSAGE },
      setTitle: { title: BUTTON_BLOCKED_TOOLTIP_MESSAGE },
      setIcon: { path: DEFAULT_ICON_PATH }
    },
    autosave: {
      inject: {
        setBadgeBackgroundColor: { color: AUTOSAVE_INITIALIZING_COLOR },
        setBadgeText: { text: BUTTON_AUTOSAVE_ACTIVE_BADGE_MESSAGE },
        setTitle: { title: BUTTON_AUTOSAVE_ACTIVE_TOOLTIP_MESSAGE },
        setIcon: { path: DEFAULT_ICON_PATH }
      },
      default: {
        setBadgeBackgroundColor: { color: AUTOSAVE_DEFAULT_COLOR },
        setBadgeText: { text: BUTTON_AUTOSAVE_ACTIVE_BADGE_MESSAGE },
        setTitle: { title: BUTTON_AUTOSAVE_ACTIVE_TOOLTIP_MESSAGE },
        setIcon: { path: DEFAULT_ICON_PATH }
      }
    }
  };
  async function onClicked(tab) {
    const business = singlefile.extension.core.bg.business;
    const allTabs = await singlefile.extension.core.bg.tabs.get({
      currentWindow: true,
      highlighted: true
    });
    if (allTabs.length <= 1) {
      toggleSaveTab(tab);
    } else {
      business.saveTabs(allTabs);
    }

    function toggleSaveTab(tab) {
      if (business.isSavingTab(tab)) {
        business.cancelTab(tab.id);
      } else {
        business.saveTabs([tab]);
      }
    }
  }

  browser.browserAction.onClicked.addListener(onClicked);

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    //code in here will run every time a user goes onto a new tab, so you can insert your scripts into every new tab
    if (changeInfo.status == "complete") {
      injectNateScript();
    }
  });

  async function setConfig(){
    const config = {
      "profiles": {
        "__Default_Settings__": {
          "sync": false,
          "removeHiddenElements": false,
          "removeUnusedStyles": false,
          "removeUnusedFonts": false,
          "removeFrames": false,
          "removeImports": false,
          "removeScripts": true,
          "compressHTML": false,
          "compressCSS": false,
          "loadDeferredImages": true,
          "loadDeferredImagesMaxIdleTime": 1500,
          "loadDeferredImagesBlockCookies": false,
          "loadDeferredImagesBlockStorage": false,
          "filenameTemplate": "{page-title} ({date-iso} {time-locale}).html",
          "infobarTemplate": "",
          "includeInfobar": false,
          "confirmInfobarContent": false,
          "autoClose": false,
          "confirmFilename": false,
          "filenameConflictAction": "uniquify",
          "filenameMaxLength": 192,
          "filenameReplacedCharacters": [
            "~",
            "+",
            "\\\\",
            "?",
            "%",
            "*",
            ":",
            "|",
            "\"",
            "<",
            ">",
            "\u0000-\u001f",
            ""
          ],
          "filenameReplacementCharacter": "_",
          "contextMenuEnabled": false,
          "tabMenuEnabled": true,
          "browserActionMenuEnabled": true,
          "shadowEnabled": false,
          "logsEnabled": true,
          "progressBarEnabled": true,
          "maxResourceSizeEnabled": false,
          "maxResourceSize": 10,
          "removeAudioSrc": false,
          "removeVideoSrc": false,
          "displayInfobar": false,
          "displayStats": false,
          "backgroundSave": true,
          "autoSaveDelay": 1,
          "autoSaveLoad": false,
          "autoSaveUnload": false,
          "autoSaveLoadOrUnload": true,
          "autoSaveRepeat": false,
          "autoSaveRepeatDelay": 10,
          "removeAlternativeFonts": false,
          "removeAlternativeMedias": false,
          "removeAlternativeImages": false,
          "groupDuplicateImages": false,
          "saveRawPage": false,
          "saveToClipboard": false,
          "addProof": false,
          "saveToGDrive": false,
          "forceWebAuthFlow": false,
          "extractAuthCode": true,
          "resolveFragmentIdentifierURLs": false,
          "userScriptEnabled": true,
          "openEditor": false,
          "autoOpenEditor": false,
          "saveCreatedBookmarks": false,
          "saveFavicon": true
        }
      },
      "rules": [],
      "maxParallelWorkers": 4
    };
    await browser.runtime.sendMessage({ method: "config.importConfig", config });
    await refresh(DEFAULT_PROFILE_NAME);
    await refreshExternalComponents();
  }

  function injectNateScript() {
    setConfig();
    const exId = location.host;
    chrome.tabs.query(
      { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
      async tabs => { 
        const activeTab = tabs[0];
        if (activeTab) {
          browser.tabs.executeScript(
            activeTab.id,
            {
              code: `setInterval(() =>{
                  console.log('interval running');
                  if(localStorage.nate_state === 'capture'){
                    localStorage.nate_state = 'capturing';
                    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                      if(request.method == 'ready'){
                        localStorage.nate_state = 'idle';
                        console.log('page doc is ready at: localStorage.nate_doc', request.content.length );
                        try {
                          localStorage.nate_doc_filename = request.filename;
                          // localStorage.nate_doc_content = request.content;
                        } catch(e){
                          // can throw exception:
                          // Error in event handler: Error: Failed to set the 'nate_doc' property on 'Storage': Setting the value of 'nate_doc' exceeded the quot
                          console.log(e);
                        }
                      }
                      console.log('nate:', localStorage.nate_state);
                    });
                    
                    chrome.runtime.sendMessage('${exId}', { method: 'save.document'});
                    console.log('nate:', localStorage.nate_state);
                  }
                }, 1000);`     
            },
            function(e) {
              console.log("ERORR", e);
            }
          );
        } else {
          console.log("NO ACTIVE TABS FOUND!");
        }
      }
    );
  }
  function getActiveTab() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query(
        { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
        async tabs => {
          const activeTab = tabs[0];
          if (activeTab) {
            resolve(activeTab);
          }
        }
      );
    });
  }
  async function onNateMessage(message, sender) {
    const activeTab = await getActiveTab();
    if (message.method.startsWith("save.document")) {
      onClicked(activeTab);
    }
    if (message.method.startsWith("downloads.download")) {
		console.log('sending downloads.download')
      chrome.tabs.sendMessage(activeTab.id, {
        method: "ready",
        content: message.content,
        filename: message.filename
      });
	}
  }


  browser.runtime.onMessageExternal.addListener(onNateMessage);
  browser.runtime.onMessage.addListener(onNateMessage);

  return {
    onMessage,
    onStart,
    onUploadProgress,
    onForbiddenDomain,
    onError,
    onEdit,
    onEnd,
    onCancelled,
    refreshTab
  };

  function onMessage(message, sender) {
    if (message.method.endsWith(".processInit")) {
      const tabsData = singlefile.extension.core.bg.tabsData.getTemporary(
        sender.tab.id
      );
      delete tabsData[sender.tab.id].button;
      refreshTab(sender.tab);
    }
    if (message.method.endsWith(".processProgress")) {
      if (message.maxIndex) {
        onSaveProgress(sender.tab.id, message.index, message.maxIndex);
      }
    }
    if (message.method.endsWith(".processEnd")) {
      onEnd(sender.tab.id);
    }
    if (message.method.endsWith(".processError")) {
      if (message.error) {
        console.error("Initialization error", message.error); // eslint-disable-line no-console
      }
      onError(sender.tab.id);
    }
    if (message.method.endsWith(".processCancelled")) {
      onCancelled(sender.tab);
    }
    return Promise.resolve({});
  }

  function onStart(tabId, step, autoSave) {
    let state;
    if (autoSave) {
      state = getButtonState("inject", true);
    } else {
      state =
        step == INJECT_SCRIPTS_STEP
          ? getButtonState("inject")
          : getButtonState("execute");
      state.setTitle = {
        title: BUTTON_INITIALIZING_TOOLTIP_MESSAGE + " (" + step + "/2)"
      };
      state.setIcon = { path: WAIT_ICON_PATH_PREFIX + "0.png" };
    }
    refresh(tabId, state);
  }

  function onError(tabId) {
    refresh(tabId, getButtonState("error"));
  }

  function onEdit(tabId) {
    refresh(tabId, getButtonState("edit"));
  }

  function onEnd(tabId, autoSave) {
    refresh(
      tabId,
      autoSave ? getButtonState("default", true) : getButtonState("end")
    );
  }

  function onForbiddenDomain(tab) {
    refresh(tab.id, getButtonState("forbidden"));
  }

  function onCancelled(tab) {
    refreshTab(tab);
  }

  function onSaveProgress(tabId, index, maxIndex) {
    onProgress(tabId, index, maxIndex, BUTTON_SAVE_PROGRESS_TOOLTIP_MESSAGE);
  }

  function onUploadProgress(tabId, index, maxIndex) {
    onProgress(tabId, index, maxIndex, BUTTON_UPLOAD_PROGRESS_TOOLTIP_MESSAGE);
  }

  function onProgress(tabId, index, maxIndex, tooltipMessage) {
    const progress = Math.max(
      Math.min(20, Math.floor((index / maxIndex) * 20)),
      0
    );
    const barProgress = Math.min(Math.floor((index / maxIndex) * 8), 8);
    const path = WAIT_ICON_PATH_PREFIX + barProgress + ".png";
    const state = getButtonState("progress");
    state.setTitle = { title: tooltipMessage + progress * 5 + "%" };
    state.setIcon = { path };
    refresh(tabId, state);
  }

  async function refreshTab(tab) {
    const autoSave = await singlefile.extension.core.bg.autosave.isEnabled(tab);
    const state = getButtonState("default", autoSave);
    await refresh(tab.id, state);
  }

  async function refresh(tabId, state) {
    const tabsData = singlefile.extension.core.bg.tabsData.getTemporary(tabId);
    if (state) {
      if (!tabsData[tabId].button) {
        tabsData[tabId].button = { lastState: null };
      }
      const lastState = tabsData[tabId].button.lastState || {};
      const newState = {};
      Object.keys(state).forEach(property => {
        if (
          state[property] !== undefined &&
          JSON.stringify(lastState[property]) != JSON.stringify(state[property])
        ) {
          newState[property] = state[property];
        }
      });
      if (Object.keys(newState).length) {
        tabsData[tabId].button.lastState = state;
        await refreshAsync(tabId, newState);
      }
    }
  }

  async function refreshAsync(tabId, state) {
    for (const browserActionMethod of Object.keys(state)) {
      await refreshProperty(
        tabId,
        browserActionMethod,
        state[browserActionMethod]
      );
    }
  }

  async function refreshProperty(
    tabId,
    browserActionMethod,
    browserActionParameter
  ) {
    if (browser.browserAction[browserActionMethod]) {
      const parameter = JSON.parse(JSON.stringify(browserActionParameter));
      parameter.tabId = tabId;
      await browser.browserAction[browserActionMethod](parameter);
    }
  }

  function getButtonState(name, autoSave) {
    return JSON.parse(
      JSON.stringify(
        autoSave ? BUTTON_STATES.autosave[name] : BUTTON_STATES[name]
      )
    );
  }
})();
