const shortcuts = document.getElementById("shortcuts");
const addBtn = document.getElementById("addBtn");
let links = undefined;
let linkNum = 0;

const getExistingLinks = async () => {
  await getLinks();

  if (links.length === 0) {
    shortcuts.appendChild(getLink(linkNum));
  } else {
    links.forEach((shortcut) => {
      shortcuts.appendChild(getLink(shortcut.index, shortcut.link, shortcut.char));
    });

    linkNum = Number(links[links.length - 1].index) + 1;
  }
};

const getLinks = async () => {
  const result = await chrome.storage.local.get("sfdcShortcuts");
  const existingLinks = result.sfdcShortcuts;
  if (!existingLinks) {
    links = [];
  } else {
    links = JSON.parse(existingLinks);
  }
};

const setLinks = () => {
  chrome.storage.local.set({ sfdcShortcuts: JSON.stringify(links) });
};

const handleOnChange = (event) => {
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

  setLinks();
};

const handleOnDelete = (event) => {
  const index = event.currentTarget.dataset.index;
  links = links.filter((link) => link.index !== index);
  shortcuts.removeChild(document.querySelector(`div[data-index="${index}"]`));
  setLinks();
};

const getLink = (dataIndex = linkNum, link = undefined, char = undefined) => {
  const gridDiv = document.createElement("div");
  gridDiv.classList.add("slds-grid");

  const gridCol1 = document.createElement("div");
  gridCol1.classList.add("slds-col--padded");

  const gridCol2 = document.createElement("div");
  gridCol2.classList.add("slds-col--padded");

  const gridCol3 = document.createElement("div");
  gridCol3.classList.add("slds-col--padded");

  const linkInput = document.createElement("input");
  linkInput.classList.add("slds-input");
  linkInput.name = "link";
  linkInput.placeholder = "Link...";
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
  shortcut.classList.add("shortcut", "slds-p-around_small");
  shortcut.appendChild(gridDiv);
  shortcut.dataset.index = dataIndex;
  shortcut.addEventListener("change", handleOnChange, false);

  if (!char && !link) {
    console.log(linkNum);
    linkNum = linkNum + 1;
  }
  return shortcut;
};

addBtn.addEventListener(
  "click",
  (event) => {
    shortcuts.appendChild(getLink(linkNum));
  },
  false
);

getExistingLinks();
