import { getFromStorage, setToStorage } from "./utils.js";

const orgGroupsEle = document.getElementById("orgGroups");
const addBtn = document.getElementById("addOrgGroup");
let orgGroups = [];
let orgGroupNum = 0;

const getExistingOrgGroups = async () => {
  orgGroups = await getFromStorage("sfdcOrgGroups");
  console.log(orgGroups);
  if (orgGroups.length === 0) {
    orgGroupsEle.appendChild(orgGroupEntryForm(orgGroupNum));
  } else {
    orgGroups.forEach((orgGroup) =>
      orgGroupsEle.appendChild(orgGroupEntryForm(orgGroup.index, orgGroup.hostname, orgGroup.groupName, orgGroup.color))
    );
    orgGroupNum = Number(orgGroups[orgGroups.length - 1].index) + 1;
  }
};

const handleOnChange = (event) => {
  const index = event.target.dataset.index;
  const name = event.target.name;
  const value = event.target.value;
  const existingIndex = orgGroups.findIndex((orgGroup) => orgGroup.index === index);
  console.log(index, name, value, existingIndex);
  if (existingIndex > -1) {
    orgGroups[existingIndex][name] = value;
  } else {
    const x = {};
    x[name] = value;
    x["index"] = index;
    orgGroups.push(x);
  }
  console.log(orgGroups);
  setToStorage("sfdcOrgGroups", orgGroups);
};

const handleOnDelete = (event) => {
  const index = event.currentTarget.dataset.index;
  orgGroups = orgGroups.filter((orgGroup) => orgGroup.index !== index);
  orgGroupsEle.removeChild(document.querySelector("#orgGroups").querySelector(`div[data-index="${index}"]`));
  setToStorage("sfdcOrgGroups", orgGroups);

  if (orgGroups.length === 0) {
    orgGroupNum = 0;
    orgGroupsEle.appendChild(orgGroupEntryForm(orgGroupNum));
  }
};

const orgGroupEntryForm = (dataIndex = orgGroupNum, hostname = undefined, groupName = undefined, color = undefined) => {
  const gridDiv = document.createElement("div");
  gridDiv.classList.add("slds-grid");

  const gridCol1 = document.createElement("div");
  gridCol1.classList.add("slds-col--padded","slds-size_2-of-5");

  const gridCol2 = document.createElement("div");
  gridCol2.classList.add("slds-col--padded","slds-size_2-of-8");

  const gridCol3 = document.createElement("div");
  gridCol3.classList.add("slds-col--padded");

  const gridCol4 = document.createElement("div");
  gridCol4.classList.add("slds-col--padded");

  const linkInput = document.createElement("input");
  linkInput.classList.add("slds-input");
  linkInput.name = "hostname";
  linkInput.placeholder = "Hostname...";
  linkInput.type = "text";
  linkInput.dataset.index = dataIndex;
  linkInput.value = hostname ? hostname : "";

  const charInput = document.createElement("input");
  charInput.classList.add("slds-input");
  charInput.name = "groupName";
  charInput.placeholder = "Group Name...";
  charInput.type = "text";
  charInput.dataset.index = dataIndex;
  charInput.value = groupName ? groupName : "";

  const colorInput = document.createElement("input");
  colorInput.classList.add("slds-input");
  colorInput.name = "color";
  colorInput.placeholder = "Group color...";
  colorInput.type = "text";
  colorInput.dataset.index = dataIndex;
  colorInput.value = color ? color : "";

  const delBtn = document.createElement("button");
  delBtn.classList.add("slds-button", "slds-button_icon", "slds-button_icon-brand");
  delBtn.dataset.index = dataIndex;
  delBtn.addEventListener("click", handleOnDelete, false);

  delBtn.innerHTML = `<img src="${chrome.runtime.getURL("delete.svg")}" width="22px"/>`;

  gridCol1.appendChild(linkInput);
  gridCol2.appendChild(charInput);
  gridCol3.appendChild(colorInput);
  gridCol4.appendChild(delBtn);

  gridDiv.append(gridCol1, gridCol2, gridCol3, gridCol4);

  const shortcut = document.createElement("div");
  shortcut.classList.add("shortcut", "slds-p-top_x-small");
  shortcut.appendChild(gridDiv);
  shortcut.dataset.index = dataIndex;
  shortcut.addEventListener("change", handleOnChange, false);

  if (!hostname && !groupName && !color) {
    orgGroupNum = orgGroupNum + 1;
  }
  return shortcut;
};

addBtn.addEventListener(
  "click",
  (event) => {
    orgGroupsEle.appendChild(orgGroupEntryForm(orgGroupNum));
  },
  false
);

getExistingOrgGroups();
