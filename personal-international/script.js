const modeSwitch = document.getElementById("modeSwitch");
const modeOptions = document.querySelectorAll(".mode-option");
const themeToggle = document.getElementById("themeToggle");

const avatarBox = document.getElementById("avatarBox");
const avatarInput = document.getElementById("avatarInput");
const avatarImg = document.getElementById("avatarImg");

const nameInput = document.getElementById("nameInput");
const bioInput = document.getElementById("bioInput");
const nameText = document.getElementById("nameText");
const bioText = document.getElementById("bioText");
const saveBtn = document.getElementById("saveBtn");

const avatarModalOverlay = document.getElementById("avatarModalOverlay");
const avatarConfirmBtn = document.getElementById("avatarConfirmBtn");
const avatarCancelBtn = document.getElementById("avatarCancelBtn");
const avatarDefaultBtn = document.getElementById("avatarDefaultBtn");

const DEFAULT_AVATAR = "../img/默认头像.png";

const storageKeys = {
  mode: "profile_mode",
  theme: "profile_theme",
  name: "profile_name",
  bio: "profile_bio",
  avatar: "profile_avatar",
};

let savedState = {
  name: "",
  bio: "",
  avatar: "",
};

let draftState = {
  name: "",
  bio: "",
  avatar: "",
};

let isModalOpen = false;

/* 初始化页面 */
function initPage() {
  const savedMode = localStorage.getItem(storageKeys.mode) || "preview";
  const savedTheme = localStorage.getItem(storageKeys.theme) || "light";

  savedState = {
    name: localStorage.getItem(storageKeys.name) || "",
    bio: localStorage.getItem(storageKeys.bio) || "",
    avatar: localStorage.getItem(storageKeys.avatar) || "",
  };

  draftState = { ...savedState };

  nameInput.value = draftState.name;
  bioInput.value = draftState.bio;

  setMode(savedMode, false);
  setTheme(savedTheme === "dark", false);

  renderPreviewText();
  renderAvatarByMode();
}

/* 预览区始终显示已保存内容 */
function renderPreviewText() {
  nameText.textContent = savedState.name.trim() || "请输入姓名";
  bioText.textContent = savedState.bio.trim() || "请输入个人简介";
}

/* 根据当前模式渲染头像 */
function renderAvatarByMode() {
  const isEditMode = document.body.classList.contains("edit-mode");
  const src = isEditMode ? draftState.avatar : savedState.avatar;
  renderAvatar(src || DEFAULT_AVATAR);
}

/* 渲染头像 */
function renderAvatar(src) {
  avatarImg.src = src;
  avatarBox.classList.add("has-image");
}

/* 设置编辑 / 预览模式 */
function setMode(mode, save = true) {
  const isEditMode = mode === "edit";

  document.body.classList.toggle("edit-mode", isEditMode);
  document.body.classList.toggle("preview-mode", !isEditMode);
  modeSwitch.dataset.mode = mode;

  modeOptions.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.mode === mode);
  });

  if (save) {
    localStorage.setItem(storageKeys.mode, mode);
  }

  renderPreviewText();
  renderAvatarByMode();
}

/* 设置主题 */
function setTheme(isDark, save = true) {
  document.body.classList.toggle("dark", isDark);
  themeToggle.checked = isDark;

  if (save) {
    localStorage.setItem(storageKeys.theme, isDark ? "dark" : "light");
  }
}

/* 切换模式 */
modeOptions.forEach((btn) => {
  btn.addEventListener("click", () => {
    setMode(btn.dataset.mode);
  });
});

/* 主题切换 */
themeToggle.addEventListener("change", () => {
  setTheme(themeToggle.checked);
});

/* 打开头像弹窗 */
function openAvatarModal() {
  if (!document.body.classList.contains("edit-mode")) return;

  isModalOpen = true;
  avatarModalOverlay.classList.remove("hidden");
}

/* 关闭头像弹窗 */
function closeAvatarModal() {
  isModalOpen = false;
  avatarModalOverlay.classList.add("hidden");
}

/* 点击头像区域 */
function handleAvatarClick() {
  openAvatarModal();
}

avatarBox.addEventListener("click", handleAvatarClick);

avatarBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openAvatarModal();
  }
});

/* 确认更换头像：打开文件选择器 */
avatarConfirmBtn.addEventListener("click", () => {
  closeAvatarModal();
  avatarInput.value = "";
  avatarInput.click();
});

/* 使用默认头像：只改草稿，不保存 */
avatarDefaultBtn.addEventListener("click", () => {
  draftState.avatar = "";
  avatarInput.value = "";
  closeAvatarModal();
  renderAvatarByMode();
});

/* 取消 */
avatarCancelBtn.addEventListener("click", closeAvatarModal);

/* 点击遮罩关闭 */
avatarModalOverlay.addEventListener("click", (e) => {
  if (e.target === avatarModalOverlay) {
    closeAvatarModal();
  }
});

/* ESC 关闭弹窗 */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isModalOpen) {
    closeAvatarModal();
  }
});

/* 选择头像文件：直接覆盖草稿头像 */
function updateAvatar(file) {
  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    draftState.avatar = event.target.result;
    avatarInput.value = "";
    renderAvatarByMode();
  };
  reader.readAsDataURL(file);
}

avatarInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  updateAvatar(file);
});

/* 输入时只更新草稿 */
nameInput.addEventListener("input", () => {
  draftState.name = nameInput.value;
});

bioInput.addEventListener("input", () => {
  draftState.bio = bioInput.value;
});

/* 保存：把草稿写入本地 */
function saveInfo() {
  savedState = {
    name: nameInput.value,
    bio: bioInput.value,
    avatar: draftState.avatar,
  };

  localStorage.setItem(storageKeys.name, savedState.name);
  localStorage.setItem(storageKeys.bio, savedState.bio);

  if (savedState.avatar) {
    localStorage.setItem(storageKeys.avatar, savedState.avatar);
  } else {
    localStorage.removeItem(storageKeys.avatar);
  }

  renderPreviewText();
  setMode("preview");
  window.alert("保存成功");
}

saveBtn.addEventListener("click", saveInfo);

/* Ctrl + S 保存 */
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    if (document.body.classList.contains("edit-mode")) {
      saveInfo();
    }
  }
});

/* 初始化 */
initPage();
