"use strict";
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Perform cookie operations in the background page, because not all foreground pages have access to the cookie API.
  // Firefox does not support incognito split mode, so we use sender.tab.cookieStoreId to select the right cookie store.
  // Chrome does not support sender.tab.cookieStoreId, which means it is undefined, and we end up using the default cookie store according to incognito split mode.
  if (request.message == "getSfHost") {
    // When on a *.visual.force.com page, the session in the cookie does not have API access,
    // so we read the corresponding session from *.salesforce.com page.
    // The first part of the session cookie is the OrgID,
    // which we use as key to support being logged in to multiple orgs at once.
    // http://salesforce.stackexchange.com/questions/23277/different-session-ids-in-different-contexts
    // There is no straight forward way to unambiguously understand if the user authenticated against salesforce.com or cloudforce.com
    // (and thereby the domain of the relevant cookie) cookie domains are therefore tried in sequence.
    chrome.cookies.get({ url: request.url, name: "sid", storeId: sender.tab.cookieStoreId }, (cookie) => {
      if (!cookie) {
        sendResponse(null);
        return;
      }
      let [orgId] = cookie.value.split("!");
      chrome.cookies.getAll(
        {
          name: "sid",
          domain: "salesforce.com",
          secure: true,
          storeId: sender.tab.cookieStoreId,
        },
        (cookies) => {
          let sessionCookie = cookies.find((c) => c.value.startsWith(orgId + "!"));
          if (sessionCookie) {
            sendResponse(sessionCookie.domain);
          } else {
            chrome.cookies.getAll(
              {
                name: "sid",
                domain: "cloudforce.com",
                secure: true,
                storeId: sender.tab.cookieStoreId,
              },
              (cookies) => {
                sessionCookie = cookies.find((c) => c.value.startsWith(orgId + "!"));
                if (sessionCookie) {
                  sendResponse(sessionCookie.domain);
                } else {
                  sendResponse(null);
                }
              }
            );
          }
        }
      );
    });
    return true; // Tell Chrome that we want to call sendResponse asynchronously.
  }
  if (request.message == "getSession") {
    chrome.cookies.get(
      {
        url: "https://" + request.sfHost,
        name: "sid",
        storeId: sender.tab.cookieStoreId,
      },
      (sessionCookie) => {
        if (!sessionCookie) {
          sendResponse(null);
          return;
        }
        let session = {
          key: sessionCookie.value,
          hostname: sessionCookie.domain,
        };
        sendResponse(session);
      }
    );
    return true; // Tell Chrome that we want to call sendResponse asynchronously.
  }
  return false;
});

const orgs = [
  {
    main: "trailheadorg559-dev-ed",
    groupName: "trailhead",
    color: "green",
  },
  {
    main: "chamberlainu--fullsbox",
    groupName: " CU--FULL ",
    color: "blue",
  },
  {
    main: "chamberlainu--sjdev",
    groupName: " CU--SJDEV ",
    color: "grey",
  },
  {
    main: "rossu--fullsbox",
    groupName: " DMI--FULL ",
    color: "blue",
  },
  {
    main: "rossu--sjdev",
    groupName: " DMI--SJDEV ",
    color: "grey",
  },
  {
    main: "auc--fullsanbox",
    groupName: " AUC--FULL ",
    color: "blue",
  },
  {
    main: "auc--sjdev",
    groupName: " AUC--SJDEV ",
    color: "grey",
  },
  {
    main: "adtalem.atlassian.net",
    groupName: " JIRA ",
    color: "blue",
  },
];

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    groupTabs(tabId, tab.url);
  }
});

chrome.tabs.onCreated.addListener(function (tab) {
  groupTabs(tab.id, tab.url);
});

async function groupTabs(tabId, tabUrl) {
  const currOrg = orgs.find((org) => tabUrl.indexOf(org.main) > -1);
  if (!currOrg) return;

  const groupCreated = await chrome.tabGroups.query({ title: currOrg.groupName });
  if (groupCreated.length > 0) {
    console.log(groupCreated);
    chrome.tabs.group({ groupId: groupCreated[0].id, tabIds: tabId });
  } else {
    chrome.tabs.group({ tabIds: tabId }, function (groupId) {
      chrome.tabGroups.update(groupId, { title: currOrg.groupName, color: currOrg.color });
    });
  }
}
