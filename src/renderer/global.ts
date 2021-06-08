import log from "electron-log";
import colors from "./colors";
import { I18n } from "../tools/i18n";
import { constraints, ephConfigs, setConfig } from "./config";
import enUs from "../lang/en-us";
import zhCn from "../lang/zh-cn";
import jaJp from "../lang/ja-jp";
import { ipcRenderer } from "electron";
import { getEphHistory } from "../router/history";
import { defineTheme } from "./theme";

const lang = ephConfigs.language;

// global i18n toolkit class
export const i18n = new I18n({
  language: lang,
  messages: {
    "en-us": enUs,
    "zh-cn": zhCn,
    "ja-jp": jaJp,
  },
});

const java = ephConfigs.javaPath;
if (java === undefined) {
  setConfig(() => (ephConfigs.javaPath = constraints.javaHome));
}

// global i18n translator shortcut
export const t = i18n.shortcut();

// global material-ui theme
export const lightTheme = defineTheme({
  type: "light",
  palette: {
    background: colors.gray["100"],
    primary: colors.blue["500"],
    secondary: colors.pink["500"],
    divide: colors.gray["200"],
    card: colors.white,
    text: colors.black,
  },
});

export const darkTheme = defineTheme({
  type: "dark",
  palette: {
    background: colors.gray["800"],
    primary: colors.indigo["800"],
    secondary: colors.pink["500"],
    divide: colors.gray["600"],
    card: colors.gray["700"],
    text: colors.white,
  },
});

// renderer process logger
export const logger = log.scope("renderer");

// global history
export const hist = getEphHistory();

// response main-process calls
ipcRenderer.on("nav-back", hist.goBack);
ipcRenderer.on("nav-home", () => hist.push("/"));
