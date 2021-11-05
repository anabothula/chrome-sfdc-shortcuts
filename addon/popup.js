import { getFromStorage, setToStorage } from "./utils.js";

const handleActiveTab = (event) => {
  const tabs = document.querySelectorAll(".slds-tabs_scoped__item");
  tabs.forEach((tab) => {
    tab.classList.remove("slds-is-active");
  });

  event.target.parentElement.classList.add("slds-is-active");

  const tabContents = document.querySelectorAll(".slds-tabs_scoped__content");
  console.log(tabContents, event.target.getAttribute("aria-controls"));
  tabContents.forEach((tabContent) => {
    if (tabContent.id === event.target.getAttribute("aria-controls")) {
      tabContent.classList.remove("slds-hide");
      tabContent.classList.add("slds-show");
    } else {
      tabContent.classList.remove("slds-show");
      tabContent.classList.add("slds-hide");
    }
  });
};

document.querySelectorAll("#tabs a").forEach((a) => a.addEventListener("click", handleActiveTab, false));

const shortcuts = document.getElementById("shortcuts");
const addBtn = document.getElementById("addLink");
let links = undefined;
let linkNum = 0;

const getExistingLinks = async () => {
  links = await getFromStorage("sfdcShortcuts");

  if (links.length === 0) {
    shortcuts.appendChild(linkEntryForm(linkNum));
  } else {
    links.forEach((shortcut) => {
      shortcuts.appendChild(linkEntryForm(shortcut.index, shortcut.link, shortcut.char));
    });

    linkNum = Number(links[links.length - 1].index) + 1;
  }
};

const handleOnKeyUp = (event) => {

  if(event.key === 'ArrowRight'){
    event.target.value = event.target.placeholder;
  }

  const index = event.target.dataset.index;
  const name = event.target.name;
  const value = event.target.value;  

  const existingIndex = links.findIndex((link) => link.index === index);
  if (existingIndex > -1) {
    links[existingIndex][name] = value;
  } else {
    const x = {};
    x[name] = value;
    x["index"] = index;
    links.push(x);
  }

  if(!value || value === '' || value === ' ') return;
  setToStorage("sfdcShortcuts", links);
};

const handleOnDelete = (event) => {
  const index = event.currentTarget.dataset.index;
  links = links.filter((link) => link.index !== index);
  shortcuts.removeChild(document.querySelector(`div[data-index="${index}"]`));
  setToStorage("sfdcShortcuts", links);

  if (links.length === 0) {
    linkNum = 0;
    shortcuts.appendChild(linkEntryForm(linkNum));
  }
};

const linkEntryForm = (dataIndex = linkNum, link = undefined, char = undefined, linkPlaceholder='Link...') => {
  const gridDiv = document.createElement("div");
  gridDiv.classList.add("slds-grid");

  const gridCol1 = document.createElement("div");
  gridCol1.classList.add("slds-col--padded", "slds-size_3-of-4");

  const gridCol2 = document.createElement("div");
  gridCol2.classList.add("slds-col--padded", "slds-size_1-of-8");

  const gridCol3 = document.createElement("div");
  gridCol3.classList.add("slds-col--padded", "slds-size_1-of-8");

  const linkInput = document.createElement("input");
  linkInput.classList.add("slds-input");
  linkInput.name = "link";
  linkInput.placeholder = linkPlaceholder;
  linkInput.type = "text";
  linkInput.dataset.index = dataIndex;
  linkInput.value = link ? link : "";

  const charInput = document.createElement("input");
  charInput.classList.add("slds-input");
  charInput.name = "char";
  charInput.placeholder = "Character...";
  charInput.type = "text";
  charInput.dataset.index = dataIndex;
  charInput.maxLength = 1;
  charInput.value = char ? char : "";

  const delBtn = document.createElement("button");
  delBtn.classList.add("slds-button", "slds-button_icon", "slds-button_icon-brand");
  delBtn.dataset.index = dataIndex;
  delBtn.addEventListener("click", handleOnDelete, false);

  delBtn.innerHTML = `<img src="${chrome.runtime.getURL("delete.svg")}" width="22px"/>`;

  gridCol1.appendChild(linkInput);
  gridCol2.appendChild(charInput);
  gridCol3.appendChild(delBtn);

  gridDiv.append(gridCol1, gridCol2, gridCol3);

  const shortcut = document.createElement("div");
  shortcut.classList.add("shortcut", "slds-p-top_x-small");
  shortcut.appendChild(gridDiv);
  shortcut.dataset.index = dataIndex;
  shortcut.addEventListener("keyup", handleOnKeyUp, false);  

  if (!char || !link) {
    linkNum = linkNum + 1;
  }
  return shortcut;
};

const promptNewLink = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
   const currTabPathName = new URL(tabs[0].url).pathname;   
   shortcuts.appendChild(linkEntryForm(linkNum,undefined,undefined,currTabPathName));
  });
};

addBtn.addEventListener(
  "click",
  (event) => {
    promptNewLink();
  },
  false
);

getExistingLinks();
