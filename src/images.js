// Every image under src/img (subfolders too), by path relative to src/img, with or without extension:
// "2020/chat-payday.png" and "2020/chat-payday" both work, so do "tux.png" and "tux"
// so the JSON files just name the file and new photos need no code change
const files = import.meta.glob("./img/**/*.{png,jpg,jpeg,gif,webp,avif,svg}", { eager: true, import: "default" });

export const IMG = {};
for (const [path, url] of Object.entries(files)) {
  const name = path.slice("./img/".length);
  IMG[name] = url;
  IMG[name.replace(/\.\w+$/, "")] = url;
}
