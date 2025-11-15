const fs = require("node:fs");
const path = require("node:path");

const ensureFile = (targetPath) => {
  if (!targetPath.endsWith(`${path.sep}.next${path.sep}export${path.sep}500.html`)) {
    return;
  }

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(
      targetPath,
      "<!DOCTYPE html><html lang=\"en\"><head><meta charSet=\"utf-8\"><title>Server Error</title></head><body><h1>500 - Server Error</h1><p>Something went wrong.</p></body></html>"
    );
  }
};

const originalRenameSync = fs.renameSync;
fs.renameSync = function patchedRenameSync(oldPath, newPath) {
  ensureFile(oldPath);
  return originalRenameSync.call(this, oldPath, newPath);
};

const originalRename = fs.rename;
fs.rename = function patchedRename(oldPath, newPath, callback) {
  if (typeof callback === "function") {
    try {
      ensureFile(oldPath);
      return originalRename.call(this, oldPath, newPath, callback);
    } catch (error) {
      return callback(error);
    }
  }

  return new Promise((resolve, reject) => {
    try {
      ensureFile(oldPath);
      originalRename.call(this, oldPath, newPath, (err) => (err ? reject(err) : resolve()));
    } catch (error) {
      reject(error);
    }
  });
};

const originalRenamePromise = fs.promises.rename.bind(fs.promises);
fs.promises.rename = async function patchedRenamePromise(oldPath, newPath) {
  ensureFile(oldPath);
  return originalRenamePromise(oldPath, newPath);
};




